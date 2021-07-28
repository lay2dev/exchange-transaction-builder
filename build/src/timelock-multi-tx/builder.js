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
exports.TimeLockMultiTxBuilder = void 0;
const pw_core_1 = require("@lay2/pw-core");
/**
 * Builder for `ExchangeTimeLocMultiTx`
 */
class TimeLockMultiTxBuilder extends pw_core_1.Builder {
    constructor(inputCell, outputCell, timeLock, cellDeps) {
        super();
        this.inputCell = inputCell;
        this.outputCell = outputCell;
        this.timeLock = timeLock;
        this.cellDeps = cellDeps;
    }
    /**
     * Build ExchangeTimeLocMultiTx
     * @returns ExchangeTimeLocMultiTx
     */
    build() {
        return __awaiter(this, void 0, void 0, function* () {
            for (let _i in this.timeLock.args.multi_pubkey) {
                this.timeLock.signature.push(new pw_core_1.Reader('0x' + '0'.repeat(130)));
            }
            const calWitnessArgs = {
                lock: this.timeLock.serialize().serializeJson(),
                input_type: '',
                output_type: '',
            };
            let calTx = new pw_core_1.Transaction(new pw_core_1.RawTransaction([this.inputCell], [this.outputCell], this.cellDeps), [calWitnessArgs]);
            const fee = pw_core_1.Builder.calcFee(calTx, this.feeRate);
            this.timeLock.signature = [];
            const witnessArgs = {
                lock: this.timeLock.serialize().serializeJson(),
                input_type: '',
                output_type: '',
            };
            const tx = new pw_core_1.Transaction(new pw_core_1.RawTransaction([this.inputCell], [this.outputCell], this.cellDeps), [witnessArgs]);
            tx.raw.outputs[0].capacity = tx.raw.outputs[0].capacity.sub(fee);
            return tx;
        });
    }
}
exports.TimeLockMultiTxBuilder = TimeLockMultiTxBuilder;
//# sourceMappingURL=builder.js.map