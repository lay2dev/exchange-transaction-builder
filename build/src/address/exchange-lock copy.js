"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExchangeLockAddr = void 0;
const pw_core_1 = require("@lay2/pw-core");
const config_1 = require("../config");
const ckb_exchange_lock_1 = require("../types/ckb-exchange-lock");
/**
 * Address whose lock script is `ExchangeLock`
 */
class ExchangeLockAddr {
    /**
     *
     * @param threshold
     * @param requestFirstN The `threshole` from `ExchangeLock`'s multiple signature
     * @param singlePubKey The public key for `ExchagneLock`'s single signature
     * @param multiPubKey The private keys for `ExchangeLock`'s multiple signature
     */
    constructor(threshold, requestFirstN, singlePubKey, multiPubKey) {
        let multiPubKeyHash = [];
        for (let pubKey of multiPubKey) {
            multiPubKeyHash.push(new pw_core_1.Reader(new pw_core_1.Blake2bHasher()
                .hash(new pw_core_1.Reader(pubKey))
                .toArrayBuffer()
                .slice(0, 20)));
        }
        const singlePubKeyHash = new pw_core_1.Reader(new pw_core_1.Blake2bHasher()
            .hash(new pw_core_1.Reader(singlePubKey))
            .toArrayBuffer()
            .slice(0, 20));
        const exchangeLockCodeHash = config_1.DEV_CONFIG.ckb_exchange_lock.typeHash;
        const exchangeLockArgs = new ckb_exchange_lock_1.ExchangeLockArgs(threshold, requestFirstN, singlePubKeyHash, multiPubKeyHash);
        let exchangeLockScript = new pw_core_1.Script(exchangeLockCodeHash, exchangeLockArgs.serialize().serializeJson(), pw_core_1.HashType.type);
        let addr = pw_core_1.Address.fromLockScript(exchangeLockScript);
        this.address = addr;
    }
}
exports.ExchangeLockAddr = ExchangeLockAddr;
//# sourceMappingURL=exchange-lock%20copy.js.map