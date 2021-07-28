"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeLock = exports.TimeLockArgs = void 0;
const pw_core_1 = require("@lay2/pw-core");
const ckb_exchange_timelock_type_1 = require("../schemas-types/ckb-exchange-timelock-type");
class TimeLockArgs {
    constructor(threshold, request_first_n, multi_pubkey, single_pubkey, output_hash) {
        this.threshold = threshold;
        this.request_first_n = request_first_n;
        this.multi_pubkey = multi_pubkey;
        this.single_pubkey = single_pubkey;
        this.output_hash = output_hash;
    }
    serialize() {
        return new pw_core_1.Reader(ckb_exchange_timelock_type_1.SerializeArgs(this));
    }
}
exports.TimeLockArgs = TimeLockArgs;
class TimeLock {
    constructor(sign_flag, args, signature) {
        this.sign_flag = sign_flag;
        this.args = args;
        this.signature = signature;
    }
    serialize() {
        return new pw_core_1.Reader(ckb_exchange_timelock_type_1.SerializeLock(this));
    }
}
exports.TimeLock = TimeLock;
//# sourceMappingURL=ckb-exchange-timelock.js.map