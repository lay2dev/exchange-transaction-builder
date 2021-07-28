import { CellDep, Script } from '@lay2/pw-core';
import { CKBEnv } from '../helpers';
export declare const devChainConfig: {
    daoType: {
        cellDep: CellDep;
        script: Script;
    };
    sudtType: {
        cellDep: CellDep;
        script: Script;
    };
    defaultLock: {
        cellDep: CellDep;
        script: Script;
    };
    multiSigLock: {
        cellDep: CellDep;
        script: Script;
    };
    pwLock: {
        cellDep: CellDep;
        script: Script;
    };
    acpLockList: Script[];
};
export default class Deploy {
    private filePath;
    private ckbEnv;
    private fromAddr;
    private collector;
    private toAddr;
    private rpc;
    private signer;
    private builder?;
    constructor(privateKey: string, filePath: string, ckbEnv?: CKBEnv);
    init(txHash?: string, index?: string): Promise<Deploy>;
    send(): Promise<string>;
}
