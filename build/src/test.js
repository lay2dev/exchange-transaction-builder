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
const pw_core_1 = require("@lay2/pw-core");
const deploy_1 = require("./deploy/deploy");
const helpers_1 = require("./helpers");
const core_1 = require("./exchangelock-single-tx/core");
const core_2 = require("./time-lock-single-tx/core");
const commander_1 = require("commander");
const fs_1 = require("fs");
const core_3 = require("./exchangelock-multi-tx/core");
const core_4 = require("./timelock-multi-tx/core");
const ckb_exchange_lock_1 = require("./types/ckb-exchange-lock");
const ecpair_1 = require("@nervosnetwork/ckb-sdk-utils/lib/ecpair");
const address_1 = require("./address");
const config_inner_1 = require("./config-inner");
const program = new commander_1.Command();
program.version('0.0.1');
program
    .command('deploy <binaryFilePath>')
    .description('deploy lock script')
    .option('--txHash <txHash>', 'Which of existing lock script                Example:0x788becd04bf3bb166faa1b5e1f906e0efbe172c6174813203c61e8838c452219')
    .option('--txOutputIndex <txOutputIndex>', 'Which of existing lock script                Example:0x1')
    .option('--env <env>', 'the deploy environment                       One of `dev`,`testnet`,`mainnet`')
    .action((binaryFilePath, options) => __awaiter(void 0, void 0, void 0, function* () {
    let deploy = yield new deploy_1.default(config_inner_1.CONFIG.rootPrivateKey, binaryFilePath, options.env).init(options.txHash, options.txOutputIndex);
    const txHash = yield deploy.send();
    console.log('txHash:', txHash);
}));
program
    .command('getCellInfo')
    .description('get cell info')
    .option('--txHash <txHash>', 'Which of cell                                Example:0x788becd04bf3bb166faa1b5e1f906e0efbe172c6174813203c61e8838c452219')
    .option('--txOutputIndex <txOutputIndex>', 'Which of cell                                Example:0x1')
    .option('--env <env>', 'the deploy environment                       One of `dev`,`testnet`,`mainnet`')
    .action((options) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(options.txHash, options.txOutputIndex);
    yield helpers_1.getCellDataHash(options.txHash, options.txOutputIndex, options.env);
}));
program
    .command('blake2b <input>')
    .description('blake2b Hash')
    .action((input) => __awaiter(void 0, void 0, void 0, function* () {
    const blake = new pw_core_1.Blake2bHasher();
    console.log(input);
    const data = new pw_core_1.Reader('0x' + fs_1.readFileSync(input, { encoding: 'hex' }));
    const output = blake.hash(data);
    console.log('blake2b Hash Result:', output.serializeJson());
}));
program
    .command('transfer_account')
    .description('transfer ckb account')
    .action(() => __awaiter(void 0, void 0, void 0, function* () {
    yield helpers_1.transferAccount();
}));
program
    .command('transfer_account_for_nft')
    .description('transfer ckb nft account')
    .option('--env <env>', 'the deploy environment                       One of `dev`,`testnet`,`mainnet`')
    .requiredOption('--txHash <txHash>', 'the hash from the transaction of input cell')
    .requiredOption('--txOutputIndex <txOutputIndex>', 'the output index from the transaction of input cell')
    .action((options) => __awaiter(void 0, void 0, void 0, function* () {
    const fromOutPoint = new pw_core_1.OutPoint(options.txHash, options.txOutputIndex);
    yield helpers_1.transferAccountForNFT(fromOutPoint, 3, 1, config_inner_1.CONFIG.rootPrivateKey, config_inner_1.CONFIG.accountPrivateKey, options.env);
}));
program
    .command('test')
    .description('just for test')
    .action(() => __awaiter(void 0, void 0, void 0, function* () {
    let multiPubKeyHash = [];
    for (let privateKey of config_inner_1.CONFIG.accountPrivateKey) {
        let keyPair = new ecpair_1.default(privateKey);
        multiPubKeyHash.push(new pw_core_1.Reader(new pw_core_1.Blake2bHasher()
            .hash(new pw_core_1.Reader(keyPair.publicKey))
            .toArrayBuffer()
            .slice(0, 20)));
    }
    let lock_args_hash = new pw_core_1.Reader(new pw_core_1.Blake2bHasher().hash(new ckb_exchange_lock_1.ExchangeLockArgs(3, 1, new pw_core_1.Reader(new pw_core_1.Blake2bHasher()
        .hash(new ecpair_1.default(config_inner_1.CONFIG.rootPrivateKey).publicKey)
        .toArrayBuffer()
        .slice(0, 20)), multiPubKeyHash).serialize())).serializeJson();
    console.log(lock_args_hash);
}));
program
    .command('moleculeTypeUpdate')
    .description('update molecule type')
    .action(() => __awaiter(void 0, void 0, void 0, function* () {
    yield helpers_1.exportMoleculeTypes();
}));
program.command('getAddress').action(() => {
    const config = config_inner_1.CONFIG;
    const keyPair = new ecpair_1.default(config.rootPrivateKey);
    const singlePubKey = keyPair.publicKey;
    let multiPubKey = [];
    for (let privateKey of config.accountPrivateKey) {
        multiPubKey.push(new ecpair_1.default(privateKey).publicKey);
    }
    const addr = new address_1.ExchangeLockAddr(3, 1, singlePubKey, multiPubKey, config_inner_1.CONFIG.testnetConfig);
    console.log(addr.address.toCKBAddress());
});
program
    .command('deploy_tx <txType>')
    .description('deploy transaction One of `TimeLockSingleTx`,`ExchangeLockSingleTx`')
    .option('--env <env>', 'the deploy environment                       One of `dev`,`testnet`,`mainnet`')
    .requiredOption('--txHash <txHash>', 'the hash from the transaction of input cell')
    .requiredOption('--txOutputIndex <txOutputIndex>', 'the output index from the transaction of input cell')
    .action((txType, options) => __awaiter(void 0, void 0, void 0, function* () {
    let txHash;
    let fromOutPoint;
    const userLockScript = new pw_core_1.Script(options.env == helpers_1.CKBEnv.dev
        ? config_inner_1.CONFIG.devConfig.secp256k1DepCell.typeHash
        : config_inner_1.CONFIG.testnetConfig.secp256k1DepCell.typeHash, new pw_core_1.Reader(new pw_core_1.Blake2bHasher()
        .hash(new pw_core_1.Reader(new ecpair_1.default(config_inner_1.CONFIG.rootPrivateKey).publicKey))
        .toArrayBuffer()
        .slice(0, 20)).serializeJson(), pw_core_1.HashType.type);
    let multiPubKey = [];
    let multiPubKeyHash = [];
    for (let privateKey of config_inner_1.CONFIG.accountPrivateKey) {
        let keyPair = new ecpair_1.default(privateKey);
        multiPubKey.push(keyPair.publicKey);
        multiPubKeyHash.push(new pw_core_1.Reader(new pw_core_1.Blake2bHasher()
            .hash(new pw_core_1.Reader(keyPair.publicKey))
            .toArrayBuffer()
            .slice(0, 20)));
    }
    const singlePubKey = new ecpair_1.default(config_inner_1.CONFIG.rootPrivateKey).publicKey;
    const singlePubKeyHash = new pw_core_1.Reader(new pw_core_1.Blake2bHasher()
        .hash(new pw_core_1.Reader(singlePubKey))
        .toArrayBuffer()
        .slice(0, 20));
    const adminLockScript = new pw_core_1.Script(options.env == helpers_1.CKBEnv.dev
        ? config_inner_1.CONFIG.devConfig.ckbExchangeLock.typeHash
        : config_inner_1.CONFIG.testnetConfig.ckbExchangeLock.typeHash, new pw_core_1.Blake2bHasher()
        .hash(new ckb_exchange_lock_1.ExchangeLockArgs(3, 1, singlePubKeyHash, multiPubKeyHash).serialize())
        .serializeJson()
        .slice(0, 42), pw_core_1.HashType.type);
    const config = options.env == helpers_1.CKBEnv.dev ? config_inner_1.CONFIG.devConfig : config_inner_1.CONFIG.testnetConfig;
    switch (txType) {
        case 'TimeLockSingleTx':
            fromOutPoint = new pw_core_1.OutPoint(options.txHash, options.txOutputIndex);
            txHash = yield (yield core_2.TimeLockSingleTx.create(fromOutPoint, userLockScript, 3, 1, config_inner_1.CONFIG.accountPrivateKey[0], multiPubKey, config)).send();
            console.log('txHash:', txHash);
            break;
        case 'TimeLockMultiTx':
            fromOutPoint = new pw_core_1.OutPoint(options.txHash, options.txOutputIndex);
            txHash = yield (yield core_4.TimeLockMultiTx.create(fromOutPoint, adminLockScript, userLockScript, 3, 1, singlePubKey, config_inner_1.CONFIG.accountPrivateKey, config)).send();
            console.log('txHash:', txHash);
            break;
        case 'ExchangeLockSingleTx':
            fromOutPoint = new pw_core_1.OutPoint(options.txHash, options.txOutputIndex);
            txHash = yield (yield core_1.ExchangeLockSingleTx.create(fromOutPoint, userLockScript, 3, 1, config_inner_1.CONFIG.accountPrivateKey[0], multiPubKey, config)).send();
            console.log('txHash:', txHash);
            break;
        case 'ExchangeLockMultiTx':
            fromOutPoint = new pw_core_1.OutPoint(options.txHash, options.txOutputIndex);
            txHash = yield (yield core_3.ExchangeLockMultiTx.create(fromOutPoint, adminLockScript, 3, 1, singlePubKey, config_inner_1.CONFIG.accountPrivateKey, config)).send();
            console.log('txHash:', txHash);
            break;
        default:
            console.log('invalid txType');
            break;
    }
    console.log('txHash:', txHash);
}));
program.parseAsync(process.argv).then(() => {
    console.log();
    console.log('Done');
});
//# sourceMappingURL=test.js.map