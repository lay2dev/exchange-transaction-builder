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
exports.devChainConfig = void 0;
const pw_core_1 = require("@lay2/pw-core");
const fs = require("fs");
const helpers_1 = require("../helpers");
const deploy_builder_1 = require("./deploy-builder");
const ckb_sdk_utils_1 = require("@nervosnetwork/ckb-sdk-utils");
const default_signer_1 = require("../signer/default-signer");
const config_inner_1 = require("../config-inner");
exports.devChainConfig = {
    daoType: {
        cellDep: new pw_core_1.CellDep(pw_core_1.DepType.code, new pw_core_1.OutPoint('0xa563884b3686078ec7e7677a5f86449b15cf2693f3c1241766c6996f206cc542', '0x2')),
        script: new pw_core_1.Script('0x82d76d1b75fe2fd9a27dfbaa65a039221a380d76c926f378d3f81cf3e7e13f21', '0x', pw_core_1.HashType.type),
    },
    sudtType: {
        // 解锁sudt资产是传入的sudt 的cell deps
        cellDep: new pw_core_1.CellDep(pw_core_1.DepType.code, new pw_core_1.OutPoint('0xd42be1c44265657ea419c6983e617219c3f30ea979c4308c7c2df3cfd3782c71', '0x0')),
        //sudt资产的typescript，包含codeHash和hashType，args这里是‘0x’，在pw-core使用的时候，pw-core会自动将其替换成sudt 发行人的lockhash
        script: new pw_core_1.Script('0x48dbf59b4c7ee154728021b4869bceedf4eea6b43772e5d66ef8865b6ae7211', '0x', pw_core_1.HashType.data),
    },
    defaultLock: {
        // 解锁官方secp256k1 lock的cell deps
        cellDep: new pw_core_1.CellDep(pw_core_1.DepType.depGroup, new pw_core_1.OutPoint('0xf8de3bb47d055cdf460d93a2a6e1b05f7432f9777c8c474abf4eec1d4aee5d37', '0x0')),
        // 官方lock锁定cell的lockscript的构成内容，这个地方每条链基本是一样的，可以不用替换
        script: new pw_core_1.Script('0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8', '0x', pw_core_1.HashType.type),
    },
    multiSigLock: {
        cellDep: new pw_core_1.CellDep(pw_core_1.DepType.depGroup, new pw_core_1.OutPoint('0xace5ea83c478bb866edf122ff862085789158f5cbff155b7bb5f13058555b708', '0x1')),
        script: new pw_core_1.Script('0x5c5069eb0857efc65e1bca0c07df34c31663b3622fd3876c876320fc9634e2a8', '0x', pw_core_1.HashType.type),
    },
    pwLock: {
        cellDep: new pw_core_1.CellDep(pw_core_1.DepType.code, new pw_core_1.OutPoint('0x169094447e4205f82dd5aebd8e0f41c9f3cc2b04fad83ef6deb2873aa5c36763', '0x0')),
        script: new pw_core_1.Script('0x871a518c1f211e807af31a455d549bffcfb30daa844fdea878cf7643b024f752', '0x', pw_core_1.HashType.type),
    },
    acpLockList: [
        new pw_core_1.Script('0x871a518c1f211e807af31a455d549bffcfb30daa844fdea878cf7643b024f752', '0x', pw_core_1.HashType.type),
    ],
};
class Deploy {
    constructor(privateKey, filePath, ckbEnv = helpers_1.CKBEnv.dev) {
        this.filePath = filePath;
        this.ckbEnv = ckbEnv;
        // this.provider = new RawProvider(this.privateKey);
        const addressPrefix = this.ckbEnv === helpers_1.CKBEnv.dev || this.ckbEnv === helpers_1.CKBEnv.testnet ? ckb_sdk_utils_1.AddressPrefix.Testnet : ckb_sdk_utils_1.AddressPrefix.Mainnet;
        const fromAddrStr = ckb_sdk_utils_1.privateKeyToAddress(privateKey, { prefix: addressPrefix });
        this.fromAddr = new pw_core_1.Address(fromAddrStr, pw_core_1.AddressType.ckb);
        this.toAddr = this.fromAddr;
        const nodeUrl = this.ckbEnv === helpers_1.CKBEnv.dev ? config_inner_1.CONFIG.devConfig.ckbUrl : config_inner_1.CONFIG.testnetConfig.ckbUrl;
        const indexUrl = this.ckbEnv === helpers_1.CKBEnv.dev ? config_inner_1.CONFIG.devConfig.indexerUrl : config_inner_1.CONFIG.testnetConfig.indexerUrl;
        this.collector = new pw_core_1.IndexerCollector(indexUrl);
        this.rpc = new pw_core_1.RPC(nodeUrl);
        this.signer = new default_signer_1.DefaultSigner(new pw_core_1.Blake2bHasher(), privateKey, this.fromAddr.toLockScript().toHash());
    }
    init(txHash, index) {
        return __awaiter(this, void 0, void 0, function* () {
            let data = yield new Promise((resolve, reject) => {
                fs.readFile(this.filePath, (err, data) => {
                    if (err) {
                        reject(err);
                    }
                    resolve('0x' + data.toString('hex'));
                });
            });
            const options = {
                witnessArgs: pw_core_1.Builder.WITNESS_ARGS.RawSecp256k1,
                data,
                collector: this.collector,
                txHash,
                index,
            };
            this.builder = new deploy_builder_1.default(this.ckbEnv, this.fromAddr, this.toAddr, options);
            return this;
        });
    }
    send() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.builder) {
                throw new Error('Please set builder for Deploy');
            }
            let tx = yield this.builder.build();
            tx.validate();
            let signedTx = yield this.signer.sign(tx);
            // console.log("signed tx:",JSON.stringify(signedTx, null, 2));
            let trans = pw_core_1.transformers.TransformTransaction(signedTx);
            const txHash = this.rpc.send_transaction(trans);
            console.log("txHash:", txHash);
            return txHash;
        });
    }
}
exports.default = Deploy;
//# sourceMappingURL=deploy.js.map