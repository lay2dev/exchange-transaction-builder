"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExchangeLock = exports.ExchangeLockArgs = void 0;
const pw_core_1 = require("@lay2/pw-core");
const ckb_exchange_lock_type_1 = require("../schemas-types/ckb-exchange-lock-type");
class ExchangeLockArgs {
    constructor(threshold, request_first_n, single_pubkey, multi_pubkey) {
        this.threshold = threshold;
        this.request_first_n = request_first_n;
        this.single_pubkey = single_pubkey;
        this.multi_pubkey = multi_pubkey;
    }
    serialize() {
        return new pw_core_1.Reader(ckb_exchange_lock_type_1.SerializeArgs(this));
    }
    clone() {
        return new ExchangeLockArgs(this.threshold, this.request_first_n, this.single_pubkey, this.multi_pubkey.slice());
    }
}
exports.ExchangeLockArgs = ExchangeLockArgs;
class ExchangeLock {
    constructor(args, sign_flag, signature) {
        this.args = args;
        this.sign_flag = sign_flag;
        this.signature = signature;
    }
    serialize() {
        return new pw_core_1.Reader(ckb_exchange_lock_type_1.SerializeLock(this));
    }
    clone() {
        return new ExchangeLock(this.args.clone(), this.sign_flag, this.signature.slice());
    }
}
exports.ExchangeLock = ExchangeLock;
//# sourceMappingURL=ckb-exchange-lock.js.map