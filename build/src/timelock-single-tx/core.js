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
exports.TimeLockSingleTx = void 0;
const pw_core_1 = require("@lay2/pw-core");
const builder_1 = require("./builder");
const ckb_lock_demo_1 = require("../types/ckb-lock-demo");
const ckb_timelock_1 = require("../types/ckb-timelock");
const ecpair_1 = require("@nervosnetwork/ckb-sdk-utils/lib/ecpair");
const exchange_lock_signer_1 = require("../signer/exchange-lock-signer");
// import {ExchangeLockProvider} from './provider';
const config_1 = require("../config");
class TimeLockSingleTx {
    constructor(fee = pw_core_1.Amount.ZERO, amount, threshold, requestFirstN, singlePrivateKey, multiPrivateKey, nodeUrl, feeRate, collector) {
        this._rpc = new pw_core_1.RPC(nodeUrl);
        let multiKeyPair = [];
        let multiPubKeyHash = [];
        for (let privateKey of multiPrivateKey) {
            let keyPair = new ecpair_1.default(privateKey);
            multiKeyPair.push(keyPair);
            multiPubKeyHash.push(new pw_core_1.Reader(new pw_core_1.Blake2bHasher()
                .hash(new pw_core_1.Reader(keyPair.publicKey))
                .toArrayBuffer()
                .slice(0, 20)));
        }
        const singleKeyPair = new ecpair_1.default(singlePrivateKey);
        const singlePubKeyHash = new pw_core_1.Reader(new pw_core_1.Blake2bHasher()
            .hash(new pw_core_1.Reader(singleKeyPair.publicKey))
            .toArrayBuffer()
            .slice(0, 20));
        const exchangeLock = new ckb_lock_demo_1.ExchangeLock(new ckb_lock_demo_1.ExchangeLockArgs(threshold, requestFirstN, singlePubKeyHash, multiPubKeyHash), 0, []);
        const exchangeLockArgs = new pw_core_1.Blake2bHasher()
            .hash(exchangeLock.args.serialize())
            .serializeJson()
            .slice(0, 42);
        let exchangeLockScript = new pw_core_1.Script(config_1.ckb_lock_demo.typeHash, exchangeLockArgs, pw_core_1.HashType.type);
        const exchangeLockScriptHash = new pw_core_1.Reader(exchangeLockScript.toHash().slice(0, 42));
        const timeLock = new ckb_timelock_1.TimeLock(0, new ckb_timelock_1.TimeLockArgs(threshold, requestFirstN, multiPubKeyHash, singlePubKeyHash, exchangeLockScriptHash), []);
        let fromAddr = pw_core_1.Address.fromLockScript(exchangeLockScript);
        let timeLockScript = new pw_core_1.Script(config_1.ckb_timelock.typeHash, new pw_core_1.Blake2bHasher()
            .hash(timeLock.args.serialize())
            .serializeJson()
            .slice(0, 42), pw_core_1.HashType.type);
        const toAddr = pw_core_1.Address.fromLockScript(timeLockScript);
        const witnessArgs = {
            lock: exchangeLock.serialize().serializeJson(),
            input_type: '',
            output_type: '',
        };
        this.builder = new builder_1.TimeLockSingleTxBuilder(fromAddr, toAddr, fee, amount, witnessArgs, feeRate, collector);
        this.signer = new exchange_lock_signer_1.ExchangeLockSigner(fromAddr, singlePrivateKey, multiPrivateKey, exchangeLock, new pw_core_1.Blake2bHasher());
    }
    send() {
        return __awaiter(this, void 0, void 0, function* () {
            const tx = yield this.builder.build();
            let sign_tx = yield this.signer.sign(tx);
            console.log(JSON.stringify(sign_tx, null, 2));
            let transform = pw_core_1.transformers.TransformTransaction(sign_tx);
            let txHash = this._rpc.send_transaction(transform);
            return txHash;
        });
    }
}
exports.TimeLockSingleTx = TimeLockSingleTx;
//# sourceMappingURL=core.js.map