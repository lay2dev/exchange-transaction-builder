import {CellDep, DepType, OutPoint} from '@lay2/pw-core';
import {readFileSync} from 'fs';
import {CellDepType} from './helpers';

export class RunningConfig {
  constructor(
    // ckb node url
    public ckbUrl: string,
    // ckb indexer url
    public indexerUrl: string,
    // the `secp256k1` system dep cell info
    public secp256k1DepCell: DepCellInfo,
    // the `ckb-dynamic-loading-secp256k1` dep cell info,from `https://github.com/jjyr/ckb-dynamic-loading-secp256k1`
    public secp256k1LibDepCell: DepCellInfo,
    // the `exchange lock` dep cell info.`ExchangeLock` is a lock contract used for single signature as well as multiple signature
    public ckbExchangeLock: DepCellInfo,
    // the `exchange timelock` dep cell info.`ExchangeTimeLock` is like `ExchangeLock` but with `since check` feature.
    public ckbExchangeTimelock: DepCellInfo,
    public nftType: DepCellInfo,
  ) {}

  static from(runningConfig: RunningConfigInner) {
    return new RunningConfig(
      runningConfig.ckbUrl,
      runningConfig.indexerUrl,
      DepCellInfo.from(runningConfig.secp256k1DepCell),
      DepCellInfo.from(runningConfig.secp256k1LibDepCell),
      DepCellInfo.from(runningConfig.ckbExchangeLock),
      DepCellInfo.from(runningConfig.ckbExchangeTimelock),
      DepCellInfo.from(runningConfig.nftType)
    );
  }

  getCellDep(type: CellDepType): CellDep {
    switch (type) {
      case CellDepType.secp256k1_dep_cell:
        return new CellDep(
          DepType.depGroup,
          new OutPoint(
            this.secp256k1DepCell.txHash,
            this.secp256k1DepCell.outputIndex
          )
        );
      case CellDepType.secp256k1_lib_dep_cell:
        return new CellDep(
          DepType.code,
          new OutPoint(
            this.secp256k1LibDepCell.txHash,
            this.secp256k1LibDepCell.outputIndex
          )
        );
      case CellDepType.ckb_exchange_lock:
        return new CellDep(
          DepType.code,
          new OutPoint(
            this.ckbExchangeLock.txHash,
            this.ckbExchangeLock.outputIndex
          )
        );
      case CellDepType.ckb_exchange_timelock:
        return new CellDep(
          DepType.code,
          new OutPoint(
            this.ckbExchangeTimelock.txHash,
            this.ckbExchangeTimelock.outputIndex
          )
        );
      case CellDepType.nft_type:
        return new CellDep(
          DepType.code,
          new OutPoint(this.nftType.txHash, this.nftType.outputIndex)
        );
      default:
        throw new Error('invalid cell dep type');
    }
  }
}

interface RunningConfigInner{
    ckbUrl: string,
    indexerUrl: string,
    secp256k1DepCell: DepCellInfoInner,
    secp256k1LibDepCell:DepCellInfoInner,
    ckbExchangeLock: DepCellInfoInner,
    ckbExchangeTimelock: DepCellInfoInner,
    nftType?: DepCellInfoInner,
}
export class DepCellInfo {
  constructor(
    // the transaction hash
    public txHash: string = "",
    // the transaction output index
    public outputIndex: string = "",
    // type script hash
    public typeHash: string = ""
  ) {}
  static from(info?:DepCellInfoInner){
    return info == undefined ? new DepCellInfo() : new DepCellInfo(info.txHash,info.outputIndex,info.typeHash);
  }
}
interface DepCellInfoInner{
  txHash: string,
  outputIndex: string,
  typeHash: string
}

export class Config {
  constructor(
    // configure for dev running environment
    public devConfig: RunningConfig,
    // configure for testnet running environment
    public testnetConfig: RunningConfig,
    // System type id used for contract deploy.
    public systemTypeId: string,
    // Private key for single signature
    public rootPrivateKey: string,
    // Private keys for multiple signature
    public accountPrivateKey: string[]
  ) {}

  static parseFromFile(path: string): Config {
    const configStr = readFileSync(path, {encoding: 'utf8'});
    const data:ConfigInnder = JSON.parse(configStr);
    return new Config(
      RunningConfig.from(data.devConfig),
      RunningConfig.from(data.testnetConfig),
      data.systemTypeId,
      data.rootPrivateKey,
      data.accountPrivateKey,
    );
  }
}

interface ConfigInnder{
  devConfig:RunningConfigInner,
  testnetConfig:RunningConfigInner,
  systemTypeId:string,
  rootPrivateKey:string,
  accountPrivateKey:string[],
}

export const CONFIG = Config.parseFromFile('./config.json');
