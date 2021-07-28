"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExchangeTimeLockAddr = void 0;
const pw_core_1 = require("@lay2/pw-core");
const ckb_exchange_timelock_1 = require("../types/ckb-exchange-timelock");
/**
 * Address whose lock script is `ExchangeLock`
 */
class ExchangeTimeLockAddr {
    /**
     *
     * @param threshold
     * @param requestFirstN The `threshole` from `ExchangeLock`'s multiple signature
     * @param singlePubKey The public key for `ExchagneLock`'s single signature
     * @param multiPubKey The private keys for `ExchangeLock`'s multiple signature
     * @param outputHash The output `cell`'s `LockScript` hash should match when single signature
     */
    constructor(threshold, requestFirstN, singlePubKey, multiPubKey, outputHash, config) {
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
        const exchangeLockCodeHash = config.ckbExchangeLock.typeHash;
        const timeLockArgs = new ckb_exchange_timelock_1.TimeLockArgs(threshold, requestFirstN, multiPubKeyHash, singlePubKeyHash, new pw_core_1.Reader(outputHash));
        let exchangeLockScript = new pw_core_1.Script(exchangeLockCodeHash, new pw_core_1.Blake2bHasher().hash(timeLockArgs.serialize()).serializeJson().slice(0, 42), pw_core_1.HashType.type);
        let addr = pw_core_1.Address.fromLockScript(exchangeLockScript);
        this.address = addr;
    }
}
exports.ExchangeTimeLockAddr = ExchangeTimeLockAddr;
//# sourceMappingURL=exchange-timelock.js.map