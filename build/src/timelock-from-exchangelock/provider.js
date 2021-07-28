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
exports.ExchangeLockProvider = void 0;
const pw_core_1 = require("@lay2/pw-core");
const ecpair_1 = require("@nervosnetwork/ckb-sdk-utils/lib/ecpair");
const ExchangeLock = require("../schemas-types/ckb-lock-demo-type");
class ExchangeLockProvider extends pw_core_1.Provider {
    constructor(fromAddr, singlePrivateKey, multiPrivateKey, threshold, requestFirstN, signFlag) {
        super(pw_core_1.Platform.ckb);
        this.threshold = threshold;
        this.requestFirstN = requestFirstN;
        this.signFlag = signFlag;
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
        this.address = fromAddr;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            return this;
        });
    }
    hasher() {
        return new pw_core_1.Blake2bHasher();
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            return true;
        });
    }
    sign(message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.signFlag) {
                let sig = [];
                for (let keyPair of this.multiKeyPair) {
                    sig.push(new pw_core_1.Reader(keyPair.signRecoverable(message)));
                }
                let lock = new pw_core_1.Reader(ExchangeLock.SerializeLock({
                    args: {
                        threshold: this.threshold,
                        request_first_n: this.requestFirstN,
                        single_pubkey: this.singlePubKeyHash,
                        multi_pubkey: this.multiPubKeyHash,
                    },
                    sign_flag: this.signFlag ? 1 : 0,
                    signature: sig,
                })).serializeJson();
                console.log(lock);
                return lock;
            }
            else {
                const sig = new pw_core_1.Reader(this.singleKeyPair.signRecoverable(message));
                let lock = new pw_core_1.Reader(ExchangeLock.SerializeLock({
                    args: {
                        threshold: this.threshold,
                        request_first_n: this.requestFirstN,
                        single_pubkey: this.singlePubKeyHash,
                        multi_pubkey: this.multiPubKeyHash,
                    },
                    sign_flag: this.signFlag ? 1 : 0,
                    signature: [sig],
                })).serializeJson();
                console.log(lock);
                return lock;
            }
        });
    }
}
exports.ExchangeLockProvider = ExchangeLockProvider;
//# sourceMappingURL=provider.js.map