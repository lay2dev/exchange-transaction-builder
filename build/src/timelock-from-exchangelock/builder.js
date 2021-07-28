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
exports.TimeLockFromExchangeLockBuilder = void 0;
const pw_core_1 = require("@lay2/pw-core");
const config_1 = require("../config");
const deploy_1 = require("../deploy/deploy");
class TimeLockFromExchangeLockBuilder extends pw_core_1.Builder {
    constructor(fromAddr, toAddr, fee = pw_core_1.Amount.ZERO, amount, witnessArgs, feeRate = pw_core_1.Builder.MIN_FEE_RATE, collector = new pw_core_1.IndexerCollector(config_1.INDEXER_DEV_URL)) {
        super(feeRate, collector, witnessArgs);
        this.fromAddr = fromAddr;
        this.toAddr = toAddr;
        this.fee = fee;
        this.amount = amount;
        this.witnessArgs = witnessArgs;
    }
    build() {
        return __awaiter(this, void 0, void 0, function* () {
            const outputCell = new pw_core_1.Cell(this.amount, this.toAddr.toLockScript());
            const neededAmount = this.amount
                .add(pw_core_1.Builder.MIN_CHANGE)
                .add(this.fee);
            let inputSum = new pw_core_1.Amount('0');
            const inputCells = [];
            console.log(this.fromAddr);
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
            const changeCell = new pw_core_1.Cell(inputSum.sub(outputCell.capacity), this.fromAddr.toLockScript());
            const tx = new pw_core_1.Transaction(new pw_core_1.RawTransaction(inputCells, [outputCell, changeCell], [
                new pw_core_1.CellDep(pw_core_1.DepType.code, new pw_core_1.OutPoint(config_1.ckb_lock_demo.txHash, config_1.ckb_lock_demo.outputIndex)),
                new pw_core_1.CellDep(pw_core_1.DepType.code, new pw_core_1.OutPoint(config_1.ckb_timelock.txHash, config_1.ckb_timelock.outputIndex)),
                new pw_core_1.CellDep(pw_core_1.DepType.code, new pw_core_1.OutPoint(config_1.secp256k1_dep_cell.txHash, config_1.ckb_timelock.outputIndex)),
                deploy_1.devChainConfig.defaultLock.cellDep,
            ]), [this.witnessArgs]);
            this.fee = pw_core_1.Builder.calcFee(tx, this.feeRate).add(new pw_core_1.Amount("1000", pw_core_1.AmountUnit.shannon));
            changeCell.capacity = changeCell.capacity.sub(this.fee);
            tx.raw.outputs.pop();
            tx.raw.outputs.push(changeCell);
            return tx;
        });
    }
}
exports.TimeLockFromExchangeLockBuilder = TimeLockFromExchangeLockBuilder;
//# sourceMappingURL=builder.js.map