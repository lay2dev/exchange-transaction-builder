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
exports.DepositBuilder = void 0;
const pw_core_1 = require("@lay2/pw-core");
class DepositBuilder extends pw_core_1.Builder {
    constructor(address, amount, feeRate, collector) {
        super(feeRate, collector);
        this.address = address;
        this.amount = amount;
    }
    build(fee = pw_core_1.Amount.ZERO) {
        return __awaiter(this, void 0, void 0, function* () {
            const outputCell = new pw_core_1.Cell(this.amount, this.address.toLockScript());
            const neededAmount = this.amount
                .add(pw_core_1.Builder.MIN_CHANGE)
                .add(pw_core_1.Builder.MIN_CHANGE)
                .add(fee);
            let inputSum = new pw_core_1.Amount('0');
            const inputCells = [];
            const cells = yield this.collector.collect(pw_core_1.default.provider.address, {
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
            const changeCell = new pw_core_1.Cell(inputSum.sub(outputCell.capacity), pw_core_1.default.provider.address.toLockScript());
            const tx = new pw_core_1.Transaction(new pw_core_1.RawTransaction(inputCells, [outputCell, changeCell], [pw_core_1.default.config.defaultLock.cellDep]), [pw_core_1.Builder.WITNESS_ARGS.Secp256k1]);
            this.fee = pw_core_1.Builder.calcFee(tx, this.feeRate);
            changeCell.capacity = changeCell.capacity.sub(this.fee);
            tx.raw.outputs.pop();
            tx.raw.outputs.push(changeCell);
            return tx;
        });
    }
}
exports.DepositBuilder = DepositBuilder;
//# sourceMappingURL=builder.js.map