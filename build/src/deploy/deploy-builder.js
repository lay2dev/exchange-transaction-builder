"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeployBuilderOption = void 0;
const pw_core_1 = require("@lay2/pw-core");
const config_inner_1 = require("../config-inner");
const helpers_1 = require("../helpers");
class DeployBuilderOption {
    constructor(feeRate, collector, witnessArgs, data, txHash, index) {
        this.feeRate = feeRate;
        this.collector = collector;
        this.witnessArgs = witnessArgs;
        this.data = data;
        this.txHash = txHash;
        this.index = index;
    }
}
exports.DeployBuilderOption = DeployBuilderOption;
class DeployBuilder extends pw_core_1.Builder {
    constructor(env, fromAddr, toAddr, options = {}) {
        super(options.feeRate, options.collector, options.witnessArgs);
        this.env = env;
        this.fromAddr = fromAddr;
        this.toAddr = toAddr;
        this.options = options;
        const nodeUrl = this.env == helpers_1.CKBEnv.dev ? config_inner_1.CONFIG.devConfig.ckbUrl : config_inner_1.CONFIG.testnetConfig.ckbUrl;
        this.rpc = new pw_core_1.RPC(nodeUrl);
        // this._pwCore = new PWCore(ckbUrl);
    }
    newOutputCell() {
        let outputCell = new pw_core_1.Cell(new pw_core_1.Amount('12600000000'), this.toAddr.toLockScript(), new pw_core_1.Script(config_inner_1.CONFIG.systemTypeId, '0x' + '0'.repeat(64), pw_core_1.HashType.type));
        if (this.options.data) {
            if (this.options.data.startsWith('0x')) {
                outputCell.setHexData(this.options.data);
            }
            else {
                outputCell.setData(this.options.data);
            }
        }
        let amount = outputCell.occupiedCapacity();
        outputCell.capacity = amount;
        return outputCell;
    }
    collectInputCell(neededAmount, inputCells, inputSum) {
        return __awaiter(this, void 0, void 0, function* () {
            const cells = yield this.collector.collect(this.fromAddr, {
                neededAmount,
            });
            for (const cell of cells) {
                inputCells.push(cell);
                inputSum = inputSum.add(cell.capacity);
                if (inputSum.gte(neededAmount))
                    break;
            }
            if (inputSum.lt(neededAmount)) {
                throw new Error(`input capacity not enough,need ${neededAmount.toString(pw_core_1.AmountUnit.ckb)},got ${inputSum.toString(pw_core_1.AmountUnit.ckb)}`);
            }
            return [inputCells, inputSum];
        });
    }
    build(fee = pw_core_1.Amount.ZERO) {
        return __awaiter(this, void 0, void 0, function* () {
            const outputCell = this.newOutputCell();
            let neededAmount = outputCell.capacity
                .add(pw_core_1.Builder.MIN_CHANGE)
                .add(pw_core_1.Builder.MIN_CHANGE)
                .add(fee);
            let inputSum = new pw_core_1.Amount('0');
            let inputCells = [];
            if (this.options.txHash && this.options.index) {
                let firstCell = yield pw_core_1.Cell.loadFromBlockchain(this.rpc, new pw_core_1.OutPoint(this.options.txHash, this.options.index));
                inputCells.push(firstCell);
                inputSum = inputSum.add(firstCell.capacity);
                outputCell.type = firstCell.type;
                outputCell.lock = firstCell.lock;
                [inputCells, inputSum] = yield this.collectInputCell(neededAmount.sub(inputSum), inputCells, inputSum);
            }
            else {
                [inputCells, inputSum] = yield this.collectInputCell(neededAmount, inputCells, inputSum);
                const firstInput = new pw_core_1.Reader(pw_core_1.SerializeCellInput(pw_core_1.normalizers.NormalizeCellInput(pw_core_1.transformers.TransformCellInput(inputCells[0].toCellInput()))));
                const blake = new pw_core_1.Blake2bHasher();
                blake.update(firstInput);
                blake.update(new pw_core_1.Reader('0x0000000000000000'));
                const args = blake.digest().serializeJson();
                outputCell.type = new pw_core_1.Script(config_inner_1.CONFIG.systemTypeId, args, pw_core_1.HashType.type);
            }
            const changeCell = new pw_core_1.Cell(inputSum.sub(outputCell.capacity), this.fromAddr.toLockScript());
            const tx = new pw_core_1.Transaction(new pw_core_1.RawTransaction(inputCells, [outputCell, changeCell], [config_inner_1.CONFIG.testnetConfig.getCellDep(helpers_1.CellDepType.secp256k1_dep_cell)]), [pw_core_1.Builder.WITNESS_ARGS.RawSecp256k1]);
            this.fee = pw_core_1.Builder.calcFee(tx, this.feeRate);
            changeCell.capacity = changeCell.capacity.sub(this.fee);
            tx.raw.outputs.pop();
            tx.raw.outputs.push(changeCell);
            return tx;
        });
    }
}
exports.default = DeployBuilder;
//# sourceMappingURL=deploy-builder.js.map