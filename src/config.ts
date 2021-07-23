import {CellDep, DepType, OutPoint} from '@lay2/pw-core';
import {readFileSync} from 'fs';
import {CellDepType} from './helpers';

export class RunningConfig {
  constructor(
    // ckb node url
    public ckb_url: string,
    // ckb indexer url
    public indexer_url: string,
    // the `secp256k1` system dep cell info
    public secp256k1DepCell: DepCellInfo,
    // the `ckb-dynamic-loading-secp256k1` dep cell info,from `https://github.com/jjyr/ckb-dynamic-loading-secp256k1`
    public secp256k1LibDepCell: DepCellInfo,
    // the `exchange lock` dep cell info.`ExchangeLock` is a lock contract used for single signature as well as multiple signature
    public ckbExchangeLock: DepCellInfo,
    // the `exchange timelock` dep cell info.`ExchangeTimeLock` is like `ExchangeLock` but with `since check` feature.
    public ckbExchangeTimelock: DepCellInfo,
    public nftType: DepCellInfo = new DepCellInfo('', '', '')
  ) {}
  getCellDep(type: CellDepType): CellDep {
    switch (type) {
      case CellDepType.secp256k1_dep_cell:
        return new CellDep(
          DepType.depGroup,
          new OutPoint(
            CONFIG.devConfig.secp256k1DepCell.txHash,
            CONFIG.devConfig.secp256k1DepCell.outputIndex
          )
        );
      case CellDepType.secp256k1_lib_dep_cell:
        return new CellDep(
          DepType.code,
          new OutPoint(
            CONFIG.devConfig.secp256k1LibDepCell.txHash,
            CONFIG.devConfig.secp256k1LibDepCell.outputIndex
          )
        );
      case CellDepType.ckb_exchange_lock:
        return new CellDep(
          DepType.code,
          new OutPoint(
            CONFIG.devConfig.ckbExchangeLock.txHash,
            CONFIG.devConfig.ckbExchangeLock.outputIndex
          )
        );
      case CellDepType.ckb_exchange_timelock:
        return new CellDep(
          DepType.code,
          new OutPoint(
            CONFIG.devConfig.ckbExchangeTimelock.txHash,
            CONFIG.devConfig.ckbExchangeTimelock.outputIndex
          )
        );
      case CellDepType.nft_type:
        return new CellDep(
          DepType.code,
          new OutPoint(
            CONFIG.devConfig.nftType.txHash,
            CONFIG.devConfig.nftType.outputIndex
          )
        );
      default:
        throw new Error('invalid cell dep type');
    }
  }
}
export class DepCellInfo {
  constructor(
    // the transaction hash
    public txHash: string,
    // the transaction output index
    public outputIndex: string,
    // type script hash
    public typeHash: string
  ) {}
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
    return JSON.parse(configStr);
  }
}

export const CONFIG = Config.parseFromFile('./config.json');
