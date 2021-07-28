import { Amount, Collector } from '@lay2/pw-core';
export declare class ExchangeLockMultiTx {
    private _rpc;
    private builder;
    private signer;
    constructor(fee: Amount | undefined, amount: Amount, threshold: number, requestFirstN: number, singlePrivateKey: string, multiPrivateKey: Array<string>, nodeUrl: string, feeRate?: number, collector?: Collector);
    send(): Promise<string>;
}
