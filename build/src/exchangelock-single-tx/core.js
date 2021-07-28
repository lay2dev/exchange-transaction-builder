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
exports.ExchangeLockSingleTx = void 0;
const pw_core_1 = require("@lay2/pw-core");
const builder_1 = require("./builder");
const ckb_exchange_lock_1 = require("../types/ckb-exchange-lock");
const ckb_exchange_timelock_1 = require("../types/ckb-exchange-timelock");
const ecpair_1 = require("@nervosnetwork/ckb-sdk-utils/lib/ecpair");
const exchange_lock_signer_1 = require("../signer/exchange-lock-signer");
const helpers_1 = require("../helpers");
/**
 * The object that combine `ExchangeLockSingleTx`'s builder, signer and deployment.
 */
class ExchangeLockSingleTx {
    constructor(_rpc, builder, signer) {
        this._rpc = _rpc;
        this.builder = builder;
        this.signer = signer;
    }
    /**
     * create ExchangeLockSingleTx
     * @param fromOutPoint The `outpoint` where `NFT` from.
     * @param userLockScript The `lock script` of user address,where nft finally to,uses single signature
     * @param threshold The `threshole` from `ExchangeLock`'s multiple signature
     * @param requestFirstN The first nth public keys must match,which from `ExchangeLock`'s multiple signature
     * @param singlePrivateKey The private key for `ExchagneLock`'s single signature
     * @param multiPubKey The public keys for `ExchangeLock`'s multiple signature
     * @param env The running enviment.One of `dev`,`testnet`
     * @returns ExchangeLockSingleTx
     */
    static create(fromOutPoint, userLockScript, threshold, requestFirstN, singlePrivateKey, multiPubKey, config) {
        return __awaiter(this, void 0, void 0, function* () {
            const rpc = new pw_core_1.RPC(config.ckbUrl);
            let multiPubKeyHash = [];
            for (let pubkey of multiPubKey) {
                multiPubKeyHash.push(new pw_core_1.Reader(new pw_core_1.Blake2bHasher()
                    .hash(new pw_core_1.Reader(pubkey))
                    .toArrayBuffer()
                    .slice(0, 20)));
            }
            const singleKeyPair = new ecpair_1.default(singlePrivateKey);
            const singlePubKeyHash = new pw_core_1.Reader(new pw_core_1.Blake2bHasher()
                .hash(new pw_core_1.Reader(singleKeyPair.publicKey))
                .toArrayBuffer()
                .slice(0, 20));
            const exchangeLock = new ckb_exchange_lock_1.ExchangeLock(new ckb_exchange_lock_1.ExchangeLockArgs(threshold, requestFirstN, singlePubKeyHash, multiPubKeyHash), 0, []);
            let timeLockScript = new pw_core_1.Script(config.ckbExchangeTimelock.typeHash, new pw_core_1.Blake2bHasher()
                .hash(new ckb_exchange_timelock_1.TimeLockArgs(threshold, requestFirstN, multiPubKeyHash, singlePubKeyHash, new pw_core_1.Reader(userLockScript.toHash().slice(0, 42))).serialize())
                .serializeJson()
                .slice(0, 42), pw_core_1.HashType.type);
            const inputCell = yield pw_core_1.Cell.loadFromBlockchain(rpc, fromOutPoint);
            let outputCell = inputCell.clone();
            outputCell.lock = timeLockScript;
            const signer = new exchange_lock_signer_1.ExchangeLockSingleSigner(inputCell.lock.toHash(), singlePrivateKey, exchangeLock, new pw_core_1.Blake2bHasher());
            const builder = new builder_1.ExchangeLockSingleTxBuilder(inputCell, outputCell, exchangeLock, [
                config.getCellDep(helpers_1.CellDepType.ckb_exchange_lock),
                config.getCellDep(helpers_1.CellDepType.secp256k1_dep_cell),
                config.getCellDep(helpers_1.CellDepType.secp256k1_lib_dep_cell),
                config.getCellDep(helpers_1.CellDepType.nft_type),
            ]);
            return new ExchangeLockSingleTx(rpc, builder, signer);
        });
    }
    /**
     * deploy `ExchangeLockSingleTx`
     * @returns The transaction hash
     */
    send() {
        return __awaiter(this, void 0, void 0, function* () {
            const tx = yield this.builder.build();
            let sign_tx = yield this.signer.sign(tx);
            console.log(JSON.stringify(sign_tx, null, 2));
            sign_tx = sign_tx.validate();
            let transform = pw_core_1.transformers.TransformTransaction(sign_tx);
            console.log(JSON.stringify(transform, null, 2));
            let txHash = this._rpc.send_transaction(transform);
            return txHash;
        });
    }
}
exports.ExchangeLockSingleTx = ExchangeLockSingleTx;
//# sourceMappingURL=core.js.map