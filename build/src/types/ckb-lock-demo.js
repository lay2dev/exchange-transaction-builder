"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lock = exports.Args = void 0;
class Args {
    constructor(threshold, request_first_n, single_pubkey, multi_pubkey) {
        this.threshold = threshold;
        this.request_first_n = request_first_n;
        this.single_pubkey = single_pubkey;
        this.multi_pubkey = multi_pubkey;
    }
}
exports.Args = Args;
class Lock {
    constructor(args, sign_flag, signature) {
        this.args = args;
        this.sign_flag = sign_flag;
        this.signature = signature;
    }
}
exports.Lock = Lock;
//# sourceMappingURL=ckb-lock-demo.js.map