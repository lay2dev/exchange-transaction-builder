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
exports.DefaultSigner = void 0;
const pw_core_1 = require("@lay2/pw-core");
const ecpair_1 = require("@nervosnetwork/ckb-sdk-utils/lib/ecpair");
class DefaultSigner extends pw_core_1.Signer {
    constructor(hash, privateKey, fromLockHash) {
        super(hash);
        this.keyPair = new ecpair_1.default(privateKey);
        this.fromLockHash = fromLockHash;
    }
    signMessages(messages) {
        return __awaiter(this, void 0, void 0, function* () {
            const sigs = [];
            for (const message of messages) {
                if (this.fromLockHash === message.lock.toHash()) {
                    sigs.push(this.keyPair.signRecoverable(message.message));
                }
                else {
                    sigs.push('0x');
                }
            }
            return sigs;
        });
    }
}
exports.DefaultSigner = DefaultSigner;
//# sourceMappingURL=default-signer.js.map