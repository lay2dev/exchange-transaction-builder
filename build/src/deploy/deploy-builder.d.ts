import { Address, Amount, Builder, Transaction, BuilderOption, Collector, WitnessArgs } from '@lay2/pw-core';
import { CKBEnv } from '../helpers';
export declare class DeployBuilderOption implements BuilderOption {
    feeRate?: number | undefined;
    collector?: Collector | undefined;
    witnessArgs?: WitnessArgs | undefined;
    data?: string | undefined;
    txHash?: string | undefined;
    index?: string | undefined;
    constructor(feeRate?: number | undefined, collector?: Collector | undefined, witnessArgs?: WitnessArgs | undefined, data?: string | undefined, txHash?: string | undefined, index?: string | undefined);
}
export default class DeployBuilder extends Builder {
    private env;
    private fromAddr;
    private toAddr;
    protected options: DeployBuilderOption;
    private rpc;
    constructor(env: CKBEnv, fromAddr: Address, toAddr: Address, options?: DeployBuilderOption);
    private newOutputCell;
    private collectInputCell;
    build(fee?: Amount): Promise<Transaction>;
}
