"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = exports.DepCellInfo = exports.RunningConfig = void 0;
const pw_core_1 = require("@lay2/pw-core");
const helpers_1 = require("./helpers");
class RunningConfig {
    constructor(
    // ckb node url
    ckbUrl, 
    // ckb indexer url
    indexerUrl, 
    // the `secp256k1` system dep cell info
    secp256k1DepCell, 
    // the `ckb-dynamic-loading-secp256k1` dep cell info,from `https://github.com/jjyr/ckb-dynamic-loading-secp256k1`
    secp256k1LibDepCell, 
    // the `exchange lock` dep cell info.`ExchangeLock` is a lock contract used for single signature as well as multiple signature
    ckbExchangeLock, 
    // the `exchange timelock` dep cell info.`ExchangeTimeLock` is like `ExchangeLock` but with `since check` feature.
    ckbExchangeTimelock, nftType) {
        this.ckbUrl = ckbUrl;
        this.indexerUrl = indexerUrl;
        this.secp256k1DepCell = secp256k1DepCell;
        this.secp256k1LibDepCell = secp256k1LibDepCell;
        this.ckbExchangeLock = ckbExchangeLock;
        this.ckbExchangeTimelock = ckbExchangeTimelock;
        this.nftType = nftType;
    }
    static from(runningConfig) {
        return new RunningConfig(runningConfig.ckbUrl, runningConfig.indexerUrl, DepCellInfo.from(runningConfig.secp256k1DepCell), DepCellInfo.from(runningConfig.secp256k1LibDepCell), DepCellInfo.from(runningConfig.ckbExchangeLock), DepCellInfo.from(runningConfig.ckbExchangeTimelock), DepCellInfo.from(runningConfig.nftType));
    }
    getCellDep(type) {
        switch (type) {
            case helpers_1.CellDepType.secp256k1_dep_cell:
                return new pw_core_1.CellDep(pw_core_1.DepType.depGroup, new pw_core_1.OutPoint(this.secp256k1DepCell.txHash, this.secp256k1DepCell.outputIndex));
            case helpers_1.CellDepType.secp256k1_lib_dep_cell:
                return new pw_core_1.CellDep(pw_core_1.DepType.code, new pw_core_1.OutPoint(this.secp256k1LibDepCell.txHash, this.secp256k1LibDepCell.outputIndex));
            case helpers_1.CellDepType.ckb_exchange_lock:
                return new pw_core_1.CellDep(pw_core_1.DepType.code, new pw_core_1.OutPoint(this.ckbExchangeLock.txHash, this.ckbExchangeLock.outputIndex));
            case helpers_1.CellDepType.ckb_exchange_timelock:
                return new pw_core_1.CellDep(pw_core_1.DepType.code, new pw_core_1.OutPoint(this.ckbExchangeTimelock.txHash, this.ckbExchangeTimelock.outputIndex));
            case helpers_1.CellDepType.nft_type:
                return new pw_core_1.CellDep(pw_core_1.DepType.code, new pw_core_1.OutPoint(this.nftType.txHash, this.nftType.outputIndex));
            default:
                throw new Error('invalid cell dep type');
        }
    }
}
exports.RunningConfig = RunningConfig;
class DepCellInfo {
    constructor(
    // the transaction hash
    txHash = "", 
    // the transaction output index
    outputIndex = "", 
    // type script hash
    typeHash = "") {
        this.txHash = txHash;
        this.outputIndex = outputIndex;
        this.typeHash = typeHash;
    }
    static from(info) {
        return info == undefined ? new DepCellInfo() : new DepCellInfo(info.txHash, info.outputIndex, info.typeHash);
    }
}
exports.DepCellInfo = DepCellInfo;
class Config {
    constructor(
    // configure for dev running environment
    devConfig, 
    // configure for testnet running environment
    testnetConfig, 
    // System type id used for contract deploy.
    systemTypeId, 
    // Private key for single signature
    rootPrivateKey, 
    // Private keys for multiple signature
    accountPrivateKey) {
        this.devConfig = devConfig;
        this.testnetConfig = testnetConfig;
        this.systemTypeId = systemTypeId;
        this.rootPrivateKey = rootPrivateKey;
        this.accountPrivateKey = accountPrivateKey;
    }
}
exports.Config = Config;
//# sourceMappingURL=config.js.map