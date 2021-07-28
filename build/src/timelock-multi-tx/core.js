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
exports.TimeLockMultiTx = void 0;
const pw_core_1 = require("@lay2/pw-core");
const builder_1 = require("./builder");
const ckb_exchange_timelock_1 = require("../types/ckb-exchange-timelock");
const ecpair_1 = require("@nervosnetwork/ckb-sdk-utils/lib/ecpair");
const time_lock_signer_1 = require("../signer/time-lock-signer");
const helpers_1 = require("../helpers");
/**
 * The object that combine `ExchangeTimeLockMultiTx`'s builder, signer and deployment.
 */
class TimeLockMultiTx {
    constructor(_rpc, builder, signer) {
        this._rpc = _rpc;
        this.builder = builder;
        this.signer = signer;
    }
    /**
     * create ExchangeTimeLockMultiTx
     * @param fromOutPoint The `outpoint` where `NFT` from.
     * @param adminLockScript The `lock script` of admin address,where nft finally to,uses multiple signature
     * @param userLockScript  The `lock script` of user address,where nft finally to,uses single signature
     * @param threshold The `threshole` from `ExchagneTimeLock`'s multiple signature
     * @param requestFirstN The first nth public keys must match,which from `ExchagneTimeLock`'s multiple signature
     * @param singlePubKey The public key for `ExchagneTimeLock`'s single signature
     * @param multiPrivateKey The private keys for `ExchagneTimeLock`'s multiple signature
     * @param env The running enviment.One of `dev`,`testnet`
     * @returns ExchangeTimeLockMultiTx
     */
    static create(fromOutPoint, adminLockScript, userLockScript, threshold, requestFirstN, singlePubKey, multiPrivateKey, config) {
        return __awaiter(this, void 0, void 0, function* () {
            const rpc = new pw_core_1.RPC(config.ckbUrl);
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
            const singlePubKeyHash = new pw_core_1.Reader(new pw_core_1.Blake2bHasher()
                .hash(new pw_core_1.Reader(singlePubKey))
                .toArrayBuffer()
                .slice(0, 20));
            const userLockScriptHash = new pw_core_1.Reader(userLockScript.toHash().slice(0, 42));
            const timeLock = new ckb_exchange_timelock_1.TimeLock(1, new ckb_exchange_timelock_1.TimeLockArgs(threshold, requestFirstN, multiPubKeyHash, singlePubKeyHash, userLockScriptHash), []);
            let inputCell = yield pw_core_1.Cell.loadFromBlockchain(rpc, fromOutPoint);
            let outputCell = inputCell.clone();
            outputCell.lock = adminLockScript;
            const signer = new time_lock_signer_1.TimeLockMultiSigner(inputCell.lock.toHash(), multiPrivateKey, timeLock, new pw_core_1.Blake2bHasher());
            const builder = new builder_1.TimeLockMultiTxBuilder(inputCell, outputCell, timeLock, [
                config.getCellDep(helpers_1.CellDepType.ckb_exchange_timelock),
                config.getCellDep(helpers_1.CellDepType.secp256k1_dep_cell),
                config.getCellDep(helpers_1.CellDepType.secp256k1_lib_dep_cell),
                config.getCellDep(helpers_1.CellDepType.nft_type),
            ]);
            return new TimeLockMultiTx(rpc, builder, signer);
        });
    }
    /**
     * deploy `ExchangeTimeLockMultiTx`
     * @returns The transaction hash
     */
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
exports.TimeLockMultiTx = TimeLockMultiTx;
//# sourceMappingURL=core.js.map