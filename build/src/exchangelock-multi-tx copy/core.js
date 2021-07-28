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
exports.ExchangeLockMultiTx = void 0;
const pw_core_1 = require("@lay2/pw-core");
const builder_1 = require("./builder");
const ckb_lock_demo_1 = require("../types/ckb-lock-demo");
const ecpair_1 = require("@nervosnetwork/ckb-sdk-utils/lib/ecpair");
// import {ExchangeLockProvider} from './provider';
const config_1 = require("../config");
const exchange_lock_signer_1 = require("../signer/exchange-lock-signer");
class ExchangeLockMultiTx {
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
        const fromLock = new ckb_lock_demo_1.ExchangeLock(new ckb_lock_demo_1.ExchangeLockArgs(threshold, requestFirstN, singlePubKeyHash, multiPubKeyHash), 1, []);
        const fromLockArgs = new pw_core_1.Blake2bHasher()
            .update(fromLock.args.serialize().toArrayBuffer())
            .digest()
            .serializeJson()
            .slice(0, 42);
        let fromLockScript = new pw_core_1.Script(config_1.ckb_lock_demo.typeHash, fromLockArgs, pw_core_1.HashType.type);
        const fromAddr = pw_core_1.Address.fromLockScript(fromLockScript);
        const toLock = new ckb_lock_demo_1.ExchangeLock(new ckb_lock_demo_1.ExchangeLockArgs(threshold, requestFirstN, singlePubKeyHash, multiPubKeyHash), 1, []);
        let toLockScript = new pw_core_1.Script(config_1.ckb_lock_demo.typeHash, new pw_core_1.Blake2bHasher()
            .hash(toLock.args.serialize())
            .serializeJson()
            .slice(0, 42), pw_core_1.HashType.type);
        let toAddr = pw_core_1.Address.fromLockScript(toLockScript);
        const witnessArgs = {
            lock: fromLock.serialize().serializeJson(),
            input_type: '',
            output_type: '',
        };
        this.builder = new builder_1.ExchangeLockMultiTxBuilder(fromAddr, toAddr, fee, amount, witnessArgs, feeRate, collector);
        this.signer = new exchange_lock_signer_1.ExchangeLockSigner(fromAddr, singlePrivateKey, multiPrivateKey, fromLock, new pw_core_1.Blake2bHasher());
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
exports.ExchangeLockMultiTx = ExchangeLockMultiTx;
//# sourceMappingURL=core.js.map