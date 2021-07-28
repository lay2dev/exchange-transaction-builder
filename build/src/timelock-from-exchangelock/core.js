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
exports.TimeLockFromExchangeLock = void 0;
const pw_core_1 = require("@lay2/pw-core");
const builder_1 = require("./builder");
const ExchangeLock = require("../schemas-types/ckb-lock-demo-type");
const TimeLock = require("../schemas-types/ckb-timelock");
const ecpair_1 = require("@nervosnetwork/ckb-sdk-utils/lib/ecpair");
const signer_1 = require("./signer");
// import {ExchangeLockProvider} from './provider';
const config_1 = require("../config");
class TimeLockFromExchangeLock {
    constructor(fee = pw_core_1.Amount.ZERO, amount, threshold, requestFirstN, singlePrivateKey, multiPrivateKey, nodeUrl, feeRate, collector) {
        this.fee = fee;
        this.amount = amount;
        this.threshold = threshold;
        this.requestFirstN = requestFirstN;
        this.feeRate = feeRate;
        this.collector = collector;
        this._rpc = new pw_core_1.RPC(nodeUrl);
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
        const singlePubKeyHash = blake
            .hash(new pw_core_1.Reader(this.singleKeyPair.publicKey))
            .toArrayBuffer()
            .slice(0, 20);
        blake.reset();
        const exchangeLockCodeHash = config_1.ckb_lock_demo.typeHash;
        const exchangeLockArgs = new pw_core_1.Blake2bHasher()
            .update(new pw_core_1.Reader(ExchangeLock.SerializeArgs({
            threshold: this.threshold,
            request_first_n: this.requestFirstN,
            multi_pubkey: multiPubKeyHash,
            single_pubkey: singlePubKeyHash,
        })).toArrayBuffer())
            .digest()
            .serializeJson()
            .slice(0, 42);
        blake.reset();
        let exchangeLockScript = new pw_core_1.Script(exchangeLockCodeHash, exchangeLockArgs, pw_core_1.HashType.type);
        const exchangeLockScriptHash = new pw_core_1.Reader(exchangeLockScript.toHash().slice(0, 42));
        let fromAddr = pw_core_1.Address.fromLockScript(exchangeLockScript);
        const timeLockCodeHash = config_1.ckb_timelock.typeHash;
        blake.reset();
        let timeLockScript = new pw_core_1.Script(timeLockCodeHash, blake
            .hash(new pw_core_1.Reader(TimeLock.SerializeArgs({
            threshold: this.threshold,
            request_first_n: this.requestFirstN,
            multi_pubkey: multiPubKeyHash,
            single_pubkey: singlePubKeyHash,
            output_hash: exchangeLockScriptHash,
        })))
            .serializeJson()
            .slice(0, 42), pw_core_1.HashType.type);
        blake.reset();
        const toAddr = pw_core_1.Address.fromLockScript(timeLockScript);
        const witnessArgs = {
            lock: new pw_core_1.Reader(ExchangeLock.SerializeLock({
                args: {
                    threshold: this.threshold,
                    request_first_n: this.requestFirstN,
                    multi_pubkey: multiPubKeyHash,
                    single_pubkey: singlePubKeyHash,
                },
                sign_flag: 0,
                signature: [],
            })).serializeJson(),
            input_type: '',
            output_type: '',
        };
        this.builder = new builder_1.TimeLockFromExchangeLockBuilder(fromAddr, toAddr, this.fee, this.amount, witnessArgs, this.feeRate, this.collector);
        this.signer = new signer_1.ExchangeLockSigner(fromAddr, singlePrivateKey, multiPrivateKey, threshold, requestFirstN, false, new pw_core_1.Blake2bHasher());
    }
    send() {
        return __awaiter(this, void 0, void 0, function* () {
            const tx = yield this.builder.build();
            tx.validate();
            let sign_tx = yield this.signer.sign(tx);
            console.log(JSON.stringify(sign_tx, null, 2));
            let transform = pw_core_1.transformers.TransformTransaction(sign_tx);
            let txHash = this._rpc.send_transaction(transform);
            return txHash;
        });
    }
}
exports.TimeLockFromExchangeLock = TimeLockFromExchangeLock;
//# sourceMappingURL=core.js.map