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
const ckb_exchange_timelock_1 = require("../types/ckb-exchange-timelock");
const ecpair_1 = require("@nervosnetwork/ckb-sdk-utils/lib/ecpair");
const time_lock_signer_1 = require("../signer/time-lock-signer");
const helpers_1 = require("../helpers");
/**
 * The object that combine `ExchangeTimeLockSingleTx`'s builder, signer and deployment.
 */
class TimeLockSingleTx {
    constructor(_rpc, builder, signer) {
        this._rpc = _rpc;
        this.builder = builder;
        this.signer = signer;
    }
    /**
     * create ExchangeTimeLockSingleTx
     * @param fromOutPoint The `outpoint` where `NFT` from.
     * @param userLockScript The `lock script` of user address,where nft finally to,uses single signature
     * @param threshold The `threshole` from `ExchagneTimeLock`'s multiple signature
     * @param requestFirstN The first nth public keys must match,which from `ExchagneTimeLock`'s multiple signature
     * @param singlePrivateKey The private key for `ExchagneTimeLock`'s single signature
     * @param multiPubKey The public keys for `ExchagneTimeLock`'s multiple signature
     * @param env The running enviment.One of `dev`,`testnet`
     * @returns ExchangeTimeLockSingleTx
     */
    static create(fromOutPoint, userLockScript, threshold, requestFirstN, singlePrivateKey, multiPubKey, config) {
        return __awaiter(this, void 0, void 0, function* () {
            const rpc = new pw_core_1.RPC(config.ckbUrl);
            let multiPubKeyHash = [];
            for (let pubKey of multiPubKey) {
                multiPubKeyHash.push(new pw_core_1.Reader(new pw_core_1.Blake2bHasher()
                    .hash(new pw_core_1.Reader(pubKey))
                    .toArrayBuffer()
                    .slice(0, 20)));
            }
            const singleKeyPair = new ecpair_1.default(singlePrivateKey);
            const singlePubKeyHash = new pw_core_1.Reader(new pw_core_1.Blake2bHasher()
                .hash(new pw_core_1.Reader(singleKeyPair.publicKey))
                .toArrayBuffer()
                .slice(0, 20));
            const userLockScriptHash = new pw_core_1.Reader(userLockScript.toHash().slice(0, 42));
            const timeLock = new ckb_exchange_timelock_1.TimeLock(0, new ckb_exchange_timelock_1.TimeLockArgs(threshold, requestFirstN, multiPubKeyHash, singlePubKeyHash, userLockScriptHash), []);
            let inputCell = yield pw_core_1.Cell.loadFromBlockchain(rpc, fromOutPoint);
            let outputCell = inputCell.clone();
            outputCell.lock = userLockScript;
            const signer = new time_lock_signer_1.TimeLockSingleSigner(inputCell.lock.toHash(), singlePrivateKey, timeLock, new pw_core_1.Blake2bHasher());
            const builder = new builder_1.TimeLockSingleTxBuilder(inputCell, outputCell, timeLock, [
                config.getCellDep(helpers_1.CellDepType.ckb_exchange_timelock),
                config.getCellDep(helpers_1.CellDepType.secp256k1_dep_cell),
                config.getCellDep(helpers_1.CellDepType.secp256k1_lib_dep_cell),
                config.getCellDep(helpers_1.CellDepType.nft_type),
            ]);
            return new TimeLockSingleTx(rpc, builder, signer);
        });
    }
    send() {
        return __awaiter(this, void 0, void 0, function* () {
            const tx = yield this.builder.build();
            let sign_tx = yield this.signer.sign(tx);
            console.log(JSON.stringify(sign_tx, null, 2));
            sign_tx = sign_tx.validate();
            let transform = pw_core_1.transformers.TransformTransaction(sign_tx);
            let txHash = this._rpc.send_transaction(transform);
            return txHash;
        });
    }
}
exports.TimeLockSingleTx = TimeLockSingleTx;
//# sourceMappingURL=core.js.map