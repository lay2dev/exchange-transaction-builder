import { CellDep } from '@lay2/pw-core';
import { CellDepType } from './helpers';
export declare class RunningConfig implements RunningConfigInner {
    ckbUrl: string;
    indexerUrl: string;
    secp256k1DepCell: DepCellInfo;
    secp256k1LibDepCell: DepCellInfo;
    ckbExchangeLock: DepCellInfo;
    ckbExchangeTimelock: DepCellInfo;
    nftType: DepCellInfo;
    constructor(ckbUrl: string, indexerUrl: string, secp256k1DepCell: DepCellInfo, secp256k1LibDepCell: DepCellInfo, ckbExchangeLock: DepCellInfo, ckbExchangeTimelock: DepCellInfo, nftType: DepCellInfo);
    static from(runningConfig: RunningConfigInner): RunningConfig;
    getCellDep(type: CellDepType): CellDep;
}
interface RunningConfigInner {
    ckbUrl: string;
    indexerUrl: string;
    secp256k1DepCell: DepCellInfoInner;
    secp256k1LibDepCell: DepCellInfoInner;
    ckbExchangeLock: DepCellInfoInner;
    ckbExchangeTimelock: DepCellInfoInner;
    nftType?: DepCellInfoInner;
}
export declare class DepCellInfo {
    txHash: string;
    outputIndex: string;
    typeHash: string;
    constructor(txHash?: string, outputIndex?: string, typeHash?: string);
    static from(info?: DepCellInfoInner): DepCellInfo;
}
interface DepCellInfoInner {
    txHash: string;
    outputIndex: string;
    typeHash: string;
}
export declare class Config {
    devConfig: RunningConfig;
    testnetConfig: RunningConfig;
    systemTypeId: string;
    rootPrivateKey: string;
    accountPrivateKey: string[];
    constructor(devConfig: RunningConfig, testnetConfig: RunningConfig, systemTypeId: string, rootPrivateKey: string, accountPrivateKey: string[]);
}
export {};
