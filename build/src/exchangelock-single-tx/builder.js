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
exports.ExchangeLockSingleTxBuilder = void 0;
const pw_core_1 = require("@lay2/pw-core");
/**
 * Builder for `ExchangeLockSingleTx`
 */
class ExchangeLockSingleTxBuilder extends pw_core_1.Builder {
    constructor(inputCell, outputCell, exchangeLock, cellDeps) {
        super();
        this.inputCell = inputCell;
        this.outputCell = outputCell;
        this.exchangeLock = exchangeLock;
        this.cellDeps = cellDeps;
    }
    /**
     * Build ExchangeLockSingleTx
     * @returns ExchangeLockSingleTx
     */
    build() {
        return __awaiter(this, void 0, void 0, function* () {
            this.exchangeLock.signature = [new pw_core_1.Reader("0x" + "0".repeat(130))];
            const calWitnessArgs = {
                lock: this.exchangeLock.serialize().serializeJson(),
                input_type: '',
                output_type: '',
            };
            const calTx = new pw_core_1.Transaction(new pw_core_1.RawTransaction([this.inputCell], [this.outputCell], this.cellDeps), [calWitnessArgs]);
            const fee = pw_core_1.Builder.calcFee(calTx, this.feeRate);
            this.exchangeLock.signature = [];
            const witnessArgs = {
                lock: this.exchangeLock.serialize().serializeJson(),
                input_type: '',
                output_type: '',
            };
            const tx = new pw_core_1.Transaction(new pw_core_1.RawTransaction([this.inputCell], [this.outputCell], this.cellDeps), [witnessArgs]);
            tx.raw.outputs[0].capacity = tx.raw.outputs[0].capacity.sub(fee);
            return tx;
        });
    }
}
exports.ExchangeLockSingleTxBuilder = ExchangeLockSingleTxBuilder;
//# sourceMappingURL=builder.js.map