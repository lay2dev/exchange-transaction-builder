"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExchangeLockAddr = void 0;
const pw_core_1 = require("@lay2/pw-core");
const ecpair_1 = require("@nervosnetwork/ckb-sdk-utils/lib/ecpair");
const config_inner_1 = require("./config-inner");
const ExchangeLock = require("./schemas-types/ckb-exchange-lock-type");
class ExchangeLockAddr {
    constructor(threshold, requestFirstN, singlePrivateKey, multiPrivateKey) {
        this.threshold = threshold;
        this.requestFirstN = requestFirstN;
        const blake = new pw_core_1.Blake2bHasher();
        this.multiKeyPair = [];
        let multiPubKeyHash = [];
        for (let privateKey of multiPrivateKey) {
            let keyPair = new ecpair_1.default(privateKey);
            this.multiKeyPair.push(keyPair);
            multiPubKeyHash.push(blake.hash(new pw_core_1.Reader(keyPair.publicKey)).toArrayBuffer().slice(0, 20));
            blake.reset();
        }
        this.singleKeyPair = new ecpair_1.default(singlePrivateKey);
        console.log("pubkey", this.singleKeyPair.publicKey);
        const singlePubKeyHash = blake.hash(new pw_core_1.Reader(this.singleKeyPair.publicKey)).toArrayBuffer().slice(0, 20);
        blake.reset();
        const exchangeLockCodeHash = config_inner_1.CONFIG.devConfig.ckbExchangeLock.typeHash;
        const exchangeLockArgs = blake.hash(new pw_core_1.Reader(ExchangeLock.SerializeArgs({
            threshold: this.threshold,
            request_first_n: this.requestFirstN,
            multi_pubkey: multiPubKeyHash,
            single_pubkey: singlePubKeyHash,
        }))).serializeJson().slice(0, 42);
        let exchangeLockScript = new pw_core_1.Script(exchangeLockCodeHash, exchangeLockArgs, pw_core_1.HashType.type);
        let addr = pw_core_1.Address.fromLockScript(exchangeLockScript);
        this.address = addr;
    }
}
exports.ExchangeLockAddr = ExchangeLockAddr;
//# sourceMappingURL=exchange-lock.js.map