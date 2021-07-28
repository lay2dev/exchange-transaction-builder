"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lock = exports.Args = void 0;
class Args {
    constructor(threshold, request_first_n, multi_pubkey, single_pubkey, output_hash) {
        this.threshold = threshold;
        this.request_first_n = request_first_n;
        this.multi_pubkey = multi_pubkey;
        this.single_pubkey = single_pubkey;
        this.output_hash = output_hash;
    }
}
exports.Args = Args;
class Lock {
    constructor(sign_flag, args, signature) {
        this.sign_flag = sign_flag;
        this.args = args;
        this.signature = signature;
    }
}
exports.Lock = Lock;
//# sourceMappingURL=ckb-timelock.js.map