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
exports.ExchangeLockMultiSigner = exports.ExchangeLockSingleSigner = void 0;
const pw_core_1 = require("@lay2/pw-core");
const ecpair_1 = require("@nervosnetwork/ckb-sdk-utils/lib/ecpair");
/**
 * The signer for `ExchangeLock`'s single signature
 */
class ExchangeLockSingleSigner extends pw_core_1.Signer {
    constructor(fromLockHash, singlePrivateKey, exchangeLock, hasher) {
        super(hasher);
        this.fromLockHash = fromLockHash;
        this.exchangeLock = exchangeLock;
        this.singleKeyPair = new ecpair_1.default(singlePrivateKey);
    }
    /**
     *
     * @param messages Signing message
     * @returns Signed witnessArgs's lock
     */
    signMessages(messages) {
        return __awaiter(this, void 0, void 0, function* () {
            const witnessLocks = [];
            var prefix = Buffer.from('\u0019Ethereum Signed Message:\n' + '32', 'utf-8');
            for (const message of messages) {
                if (this.fromLockHash === message.lock.toHash()) {
                    console.log('message:', message.message);
                    const m = new pw_core_1.Keccak256Hasher()
                        .update(new pw_core_1.Reader('0x' + prefix.toString('hex')))
                        .update(new pw_core_1.Reader(message.message))
                        .digest();
                    console.log('keccak message:', m);
                    if (this.exchangeLock.sign_flag == 1) {
                        throw new Error("invalid `ExchangeLock`'s signFlag: should be `0`");
                    }
                    else {
                        this.exchangeLock.signature.push(new pw_core_1.Reader(this.singleKeyPair.signRecoverable(m.serializeJson())));
                        let lock = this.exchangeLock.serialize().serializeJson();
                        console.log(lock);
                        witnessLocks.push(lock);
                    }
                }
                else {
                    witnessLocks.push('0x');
                }
            }
            return witnessLocks;
        });
    }
}
exports.ExchangeLockSingleSigner = ExchangeLockSingleSigner;
/**
 * The signer for `ExchangeLock`'s multiple signature
 */
class ExchangeLockMultiSigner extends pw_core_1.Signer {
    constructor(fromLockHash, multiPrivateKey, exchangeLock, hasher) {
        super(hasher);
        this.fromLockHash = fromLockHash;
        this.exchangeLock = exchangeLock;
        this.multiKeyPair = [];
        for (let privateKey of multiPrivateKey) {
            let keyPair = new ecpair_1.default(privateKey);
            this.multiKeyPair.push(keyPair);
        }
    }
    /**
     *
     * @param messages Signing message
     * @returns Signed witnessArgs's lock
     */
    signMessages(messages) {
        return __awaiter(this, void 0, void 0, function* () {
            const witnessLocks = [];
            var prefix = Buffer.from('\u0019Ethereum Signed Message:\n' + '32', 'utf-8');
            for (const message of messages) {
                if (this.fromLockHash === message.lock.toHash()) {
                    console.log('message:', message.message);
                    const m = new pw_core_1.Keccak256Hasher()
                        .update(new pw_core_1.Reader('0x' + prefix.toString('hex')))
                        .update(new pw_core_1.Reader(message.message))
                        .digest();
                    console.log('keccak message:', m);
                    if (this.exchangeLock.sign_flag == 1) {
                        for (let keyPair of this.multiKeyPair) {
                            this.exchangeLock.signature.push(new pw_core_1.Reader(keyPair.signRecoverable(m.serializeJson())));
                        }
                        let lock = this.exchangeLock.serialize().serializeJson();
                        witnessLocks.push(lock);
                    }
                    else {
                        throw new Error("invalid `ExchangeLock`'s signFlag: should be `1`");
                    }
                }
                else {
                    witnessLocks.push('0x');
                }
            }
            return witnessLocks;
        });
    }
}
exports.ExchangeLockMultiSigner = ExchangeLockMultiSigner;
//# sourceMappingURL=exchange-lock-signer.js.map