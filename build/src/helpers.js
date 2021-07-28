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
exports.getCellDep = exports.CellDepType = exports.getCellDataHash = exports.transferAccountForNFT = exports.transferAccount = exports.exportMoleculeTypes = exports.CKBEnv = void 0;
const pw_core_1 = require("@lay2/pw-core");
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const deploy_1 = require("./deploy/deploy");
const exchange_lock_1 = require("./exchange-lock");
const ecpair_1 = require("@nervosnetwork/ckb-sdk-utils/lib/ecpair");
const ckb_exchange_lock_1 = require("./types/ckb-exchange-lock");
const default_signer_1 = require("./signer/default-signer");
const config_inner_1 = require("./config-inner");
var CKBEnv;
(function (CKBEnv) {
    CKBEnv["testnet"] = "testnet";
    CKBEnv["mainnet"] = "mainnet";
    CKBEnv["dev"] = "dev";
})(CKBEnv = exports.CKBEnv || (exports.CKBEnv = {}));
function exportMoleculeTypes() {
    fs_1.readdir('./schemas', function (err, files) {
        if (err) {
            throw new Error(err.message);
        }
        files.forEach(function (file) {
            const fileJson = file.replace(/\_/g, '-').replace('mol', 'json');
            const fileJs = file.replace(/\_/g, '-').replace('mol', 'js');
            child_process_1.exec('moleculec --language - --schema-file ./schemas/' +
                file +
                ' --format json > ./schemas-json/' +
                fileJson, function (error, stdout, stderr) {
                if (error) {
                    throw new Error('error:' + error);
                }
                if (stderr) {
                    throw new Error('stderr:' + stderr);
                }
            });
            child_process_1.exec('moleculec-es -inputFile ./schemas-json/' +
                fileJson +
                ' -outputFile src/schemas-types/' +
                fileJs, function (error, stdout, stderr) {
                if (error) {
                    throw new Error('error:' + error);
                }
                if (stderr) {
                    throw new Error('stderr:' + stderr);
                }
            });
        });
    });
}
exports.exportMoleculeTypes = exportMoleculeTypes;
function transferAccount() {
    return __awaiter(this, void 0, void 0, function* () {
        // init `RawProvider` with private key
        const privateKey = config_inner_1.CONFIG.rootPrivateKey;
        const provider = new pw_core_1.RawProvider(privateKey);
        const collector = new pw_core_1.IndexerCollector(config_inner_1.CONFIG.devConfig.indexerUrl);
        const pwcore = yield new pw_core_1.default(config_inner_1.CONFIG.devConfig.ckbUrl).init(provider, collector, pw_core_1.ChainID.ckb_dev, deploy_1.devChainConfig);
        // get address
        console.dir(provider.address, { depth: null });
        // // get balance
        // const balance = await collector.getBalance(provider.address);
        // console.log(`balance: ${balance}`);
        // for ckb system lock script, its length of witness lock is 65 bytes, use RawScep256K1 here.
        const options = { witnessArgs: pw_core_1.Builder.WITNESS_ARGS.RawSecp256k1 };
        // transfer
        const exchangeLockAddr = new exchange_lock_1.ExchangeLockAddr(3, 1, config_inner_1.CONFIG.accountPrivateKey[0], config_inner_1.CONFIG.accountPrivateKey);
        const toAddr = exchangeLockAddr.address;
        // const fromBefore = await collector.getBalance(provider.address);
        // const toBefore = await collector.getBalance(toAddr);
        // The amount should be more than 61 CKB, unless the toAddr is acp address and there is already cell to receive CKB
        const txHash = yield pwcore.send(toAddr, new pw_core_1.Amount('100000', pw_core_1.AmountUnit.ckb), options);
        console.log("toAddresScript:", toAddr.toLockScript());
        console.log("toAddr:", toAddr);
        console.log(txHash);
    });
}
exports.transferAccount = transferAccount;
function transferAccountForNFT(fromOutPoint, threshold, requestFirstN, singlePrivateKey, multiPrivateKey, env = CKBEnv.testnet) {
    return __awaiter(this, void 0, void 0, function* () {
        const nodeUrl = env == CKBEnv.dev ? config_inner_1.CONFIG.devConfig.ckbUrl : config_inner_1.CONFIG.testnetConfig.ckbUrl;
        const rpc = new pw_core_1.RPC(nodeUrl);
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
        const exchangeLock = new ckb_exchange_lock_1.ExchangeLock(new ckb_exchange_lock_1.ExchangeLockArgs(threshold, requestFirstN, singlePubKeyHash, multiPubKeyHash), 0, []);
        const exchangeLockArgs = new pw_core_1.Blake2bHasher()
            .hash(exchangeLock.args.serialize())
            .serializeJson()
            .slice(0, 42);
        const lockTypeHash = env == CKBEnv.dev ? config_inner_1.CONFIG.devConfig.ckbExchangeLock.typeHash : config_inner_1.CONFIG.testnetConfig.ckbExchangeLock.typeHash;
        let exchangeLockScript = new pw_core_1.Script(lockTypeHash, exchangeLockArgs, pw_core_1.HashType.type);
        const inputCell = yield pw_core_1.Cell.loadFromBlockchain(rpc, fromOutPoint);
        let outputCell = inputCell.clone();
        outputCell.lock = exchangeLockScript;
        const signer = new default_signer_1.DefaultSigner(new pw_core_1.Blake2bHasher(), config_inner_1.CONFIG.rootPrivateKey, inputCell.lock.toHash());
        const witnessArgs = {
            lock: new pw_core_1.Reader('0x' + '0'.repeat(130)).serializeJson(),
            input_type: '',
            output_type: '',
        };
        const tx = new pw_core_1.Transaction(new pw_core_1.RawTransaction([inputCell], [outputCell], [
            getCellDep(env, CellDepType.secp256k1_dep_cell),
            getCellDep(env, CellDepType.secp256k1_lib_dep_cell),
            getCellDep(env, CellDepType.nft_type),
        ]), [witnessArgs]);
        const fee = pw_core_1.Builder.calcFee(tx, pw_core_1.Builder.MIN_FEE_RATE);
        tx.raw.outputs[0].capacity = tx.raw.outputs[0].capacity.sub(fee);
        let sign_tx = yield signer.sign(tx);
        console.log(JSON.stringify(sign_tx, null, 2));
        sign_tx = sign_tx.validate();
        let transform = pw_core_1.transformers.TransformTransaction(sign_tx);
        let txHash = yield rpc.send_transaction(transform);
        console.log("txHash:", txHash);
    });
}
exports.transferAccountForNFT = transferAccountForNFT;
function getCellDataHash(txHash, index, env) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const nodeUrl = env === CKBEnv.dev ? config_inner_1.CONFIG.devConfig.ckbUrl : config_inner_1.CONFIG.testnetConfig.ckbUrl;
        const rpc = new pw_core_1.RPC(nodeUrl);
        const cell = yield pw_core_1.Cell.loadFromBlockchain(rpc, new pw_core_1.OutPoint(txHash, index));
        console.log('cell.data.length', new pw_core_1.Reader(cell.getHexData()).length());
        const dataHash = new pw_core_1.Blake2bHasher()
            .hash(new pw_core_1.Reader(cell.getHexData()))
            .serializeJson();
        console.log('cell.dataHash', dataHash);
        console.log('cell.typeHash', (_a = cell.type) === null || _a === void 0 ? void 0 : _a.toHash());
        console.log('cell.lockHahs', cell.lock.codeHash);
    });
}
exports.getCellDataHash = getCellDataHash;
var CellDepType;
(function (CellDepType) {
    CellDepType[CellDepType["secp256k1_dep_cell"] = 0] = "secp256k1_dep_cell";
    CellDepType[CellDepType["secp256k1_lib_dep_cell"] = 1] = "secp256k1_lib_dep_cell";
    CellDepType[CellDepType["ckb_exchange_lock"] = 2] = "ckb_exchange_lock";
    CellDepType[CellDepType["ckb_exchange_timelock"] = 3] = "ckb_exchange_timelock";
    CellDepType[CellDepType["nft_type"] = 4] = "nft_type";
})(CellDepType = exports.CellDepType || (exports.CellDepType = {}));
function getCellDep(env, type) {
    switch (env) {
        case CKBEnv.dev:
            switch (type) {
                case CellDepType.secp256k1_dep_cell:
                    return new pw_core_1.CellDep(pw_core_1.DepType.depGroup, new pw_core_1.OutPoint(config_inner_1.CONFIG.devConfig.secp256k1DepCell.txHash, config_inner_1.CONFIG.devConfig.secp256k1DepCell.outputIndex));
                case CellDepType.secp256k1_lib_dep_cell:
                    return new pw_core_1.CellDep(pw_core_1.DepType.code, new pw_core_1.OutPoint(config_inner_1.CONFIG.devConfig.secp256k1LibDepCell.txHash, config_inner_1.CONFIG.devConfig.secp256k1LibDepCell.outputIndex));
                case CellDepType.ckb_exchange_lock:
                    return new pw_core_1.CellDep(pw_core_1.DepType.code, new pw_core_1.OutPoint(config_inner_1.CONFIG.devConfig.ckbExchangeLock.txHash, config_inner_1.CONFIG.devConfig.ckbExchangeLock.outputIndex));
                case CellDepType.ckb_exchange_timelock:
                    return new pw_core_1.CellDep(pw_core_1.DepType.code, new pw_core_1.OutPoint(config_inner_1.CONFIG.devConfig.ckbExchangeTimelock.txHash, config_inner_1.CONFIG.devConfig.ckbExchangeTimelock.outputIndex));
                default:
                    throw new Error('invalid cell dep type');
            }
        case CKBEnv.testnet:
            switch (type) {
                case CellDepType.secp256k1_dep_cell:
                    return new pw_core_1.CellDep(pw_core_1.DepType.depGroup, new pw_core_1.OutPoint(config_inner_1.CONFIG.testnetConfig.secp256k1DepCell.txHash, config_inner_1.CONFIG.testnetConfig.secp256k1DepCell.outputIndex));
                case CellDepType.secp256k1_lib_dep_cell:
                    return new pw_core_1.CellDep(pw_core_1.DepType.code, new pw_core_1.OutPoint(config_inner_1.CONFIG.testnetConfig.secp256k1LibDepCell.txHash, config_inner_1.CONFIG.testnetConfig.secp256k1LibDepCell.outputIndex));
                case CellDepType.ckb_exchange_lock:
                    return new pw_core_1.CellDep(pw_core_1.DepType.code, new pw_core_1.OutPoint(config_inner_1.CONFIG.testnetConfig.ckbExchangeLock.txHash, config_inner_1.CONFIG.testnetConfig.ckbExchangeLock.outputIndex));
                case CellDepType.ckb_exchange_timelock:
                    return new pw_core_1.CellDep(pw_core_1.DepType.code, new pw_core_1.OutPoint(config_inner_1.CONFIG.testnetConfig.ckbExchangeTimelock.txHash, config_inner_1.CONFIG.testnetConfig.ckbExchangeTimelock.outputIndex));
                case CellDepType.nft_type:
                    return new pw_core_1.CellDep(pw_core_1.DepType.code, new pw_core_1.OutPoint(config_inner_1.CONFIG.testnetConfig.nftType.txHash, config_inner_1.CONFIG.testnetConfig.nftType.outputIndex));
                default:
                    throw new Error('invalid cell dep type');
            }
        default:
            throw new Error('invalid ckb env');
    }
}
exports.getCellDep = getCellDep;
//# sourceMappingURL=helpers.js.map