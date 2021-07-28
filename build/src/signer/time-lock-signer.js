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
exports.TimeLockMultiSigner = exports.TimeLockSingleSigner = void 0;
const pw_core_1 = require("@lay2/pw-core");
const ecpair_1 = require("@nervosnetwork/ckb-sdk-utils/lib/ecpair");
/**
 * The signer for `ExchangeTimeLock`'s single signature
 */
class TimeLockSingleSigner extends pw_core_1.Signer {
    constructor(fromLockHash, singlePrivateKey, timeLock, hasher) {
        super(hasher);
        this.fromLockHash = fromLockHash;
        this.timeLock = timeLock;
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
            let keccak = new pw_core_1.Keccak256Hasher();
            for (const message of messages) {
                if (this.fromLockHash === message.lock.toHash()) {
                    console.log('message:', message.message);
                    const m = keccak
                        .update(new pw_core_1.Reader('0x' + prefix.toString('hex')))
                        .update(new pw_core_1.Reader(message.message))
                        .digest();
                    console.log('keccak message:', m);
                    if (this.timeLock.sign_flag == 1) {
                        throw new Error("invalid `ExchangeTimeLock`'s signFlag:should be 0");
                    }
                    else {
                        this.timeLock.signature.push(new pw_core_1.Reader(this.singleKeyPair.signRecoverable(m.serializeJson())));
                        let lock = this.timeLock.serialize().serializeJson();
                        console.log(lock);
                        witnessLocks.push(lock);
                    }
                    keccak.reset();
                }
                else {
                    witnessLocks.push('0x');
                }
            }
            return witnessLocks;
        });
    }
}
exports.TimeLockSingleSigner = TimeLockSingleSigner;
/**
 * The signer for `ExchangeTimeLock`'s multiple signature.
 */
class TimeLockMultiSigner extends pw_core_1.Signer {
    constructor(fromLockHash, multiPrivateKey, timeLock, hasher) {
        super(hasher);
        this.fromLockHash = fromLockHash;
        this.timeLock = timeLock;
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
            let keccak = new pw_core_1.Keccak256Hasher();
            for (const message of messages) {
                if (this.fromLockHash === message.lock.toHash()) {
                    console.log('message:', message.message);
                    const m = keccak
                        .update(new pw_core_1.Reader('0x' + prefix.toString('hex')))
                        .update(new pw_core_1.Reader(message.message))
                        .digest();
                    console.log('keccak message:', m);
                    if (this.timeLock.sign_flag == 1) {
                        for (let keyPair of this.multiKeyPair) {
                            this.timeLock.signature.push(new pw_core_1.Reader(keyPair.signRecoverable(m.serializeJson())));
                        }
                        let lock = this.timeLock.serialize().serializeJson();
                        witnessLocks.push(lock);
                    }
                    else {
                        throw new Error("invalid `ExchangeTimeLock`'s signFlag:should be 1");
                    }
                    keccak.reset();
                }
                else {
                    witnessLocks.push('0x');
                }
            }
            return witnessLocks;
        });
    }
}
exports.TimeLockMultiSigner = TimeLockMultiSigner;
//# sourceMappingURL=time-lock-signer.js.map