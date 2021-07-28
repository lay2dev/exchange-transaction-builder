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
exports.TimeLockSigner = void 0;
const pw_core_1 = require("@lay2/pw-core");
const ecpair_1 = require("@nervosnetwork/ckb-sdk-utils/lib/ecpair");
const TimeLock = require("../schemas-types/ckb-timelock");
class TimeLockSigner extends pw_core_1.Signer {
    constructor(fromAddr, singlePrivateKey, multiPrivateKey, threshold, requestFirstN, signFlag, outputHash, hasher) {
        super(hasher);
        this.fromAddr = fromAddr;
        this.threshold = threshold;
        this.requestFirstN = requestFirstN;
        this.signFlag = signFlag;
        this.outputHash = outputHash;
        let blake = new pw_core_1.Blake2bHasher();
        this.singleKeyPair = new ecpair_1.default(singlePrivateKey);
        this.singlePubKeyHash = blake
            .hash(new pw_core_1.Reader(this.singleKeyPair.publicKey))
            .toArrayBuffer()
            .slice(0, 20);
        blake.reset();
        this.multiKeyPair = [];
        this.multiPubKeyHash = [];
        for (let privateKey of multiPrivateKey) {
            let keyPair = new ecpair_1.default(privateKey);
            this.multiKeyPair.push(keyPair);
            this.multiPubKeyHash.push(blake.hash(new pw_core_1.Reader(keyPair.publicKey)).toArrayBuffer().slice(0, 20));
            blake.reset();
        }
    }
    signMessages(messages) {
        return __awaiter(this, void 0, void 0, function* () {
            const witnessLocks = [];
            var prefix = Buffer.from('\u0019Ethereum Signed Message:\n' + '32', 'utf-8');
            let keccak = new pw_core_1.Keccak256Hasher();
            for (const message of messages) {
                if (this.fromAddr.toLockScript().toHash() === message.lock.toHash()) {
                    console.log('message:', message.message);
                    const m = keccak
                        .update(new pw_core_1.Reader('0x' + prefix.toString('hex')))
                        .update(new pw_core_1.Reader(message.message))
                        .digest();
                    console.log('keccak message:', m);
                    if (this.signFlag) {
                        let sig = [];
                        for (let keyPair of this.multiKeyPair) {
                            sig.push(new pw_core_1.Reader(keyPair.signRecoverable(m.serializeJson())));
                        }
                        let lock = new pw_core_1.Reader(TimeLock.SerializeLock({
                            args: {
                                threshold: this.threshold,
                                request_first_n: this.requestFirstN,
                                single_pubkey: this.singlePubKeyHash,
                                multi_pubkey: this.multiPubKeyHash,
                                output_hash: this.outputHash,
                            },
                            sign_flag: this.signFlag ? 1 : 0,
                            signature: sig,
                        })).serializeJson();
                        witnessLocks.push(lock);
                    }
                    else {
                        const sig = new pw_core_1.Reader(this.singleKeyPair.signRecoverable(m.serializeJson()));
                        let lock = new pw_core_1.Reader(TimeLock.SerializeLock({
                            args: {
                                threshold: this.threshold,
                                request_first_n: this.requestFirstN,
                                single_pubkey: this.singlePubKeyHash,
                                multi_pubkey: this.multiPubKeyHash,
                                output_hash: this.outputHash,
                            },
                            sign_flag: this.signFlag ? 1 : 0,
                            signature: [sig],
                        })).serializeJson();
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
exports.TimeLockSigner = TimeLockSigner;
//# sourceMappingURL=signer.js.map