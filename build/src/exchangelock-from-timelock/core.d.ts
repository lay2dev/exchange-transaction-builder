import { Amount, Collector } from '@lay2/pw-core';
export declare class ExchangeLockFromTimeLock {
    protected fee: Amount;
    private amount;
    private threshold;
    private requestFirstN;
    private feeRate?;
    private collector?;
    private readonly _rpc;
    private builder;
    private singleKeyPair;
    private multiKeyPair;
    private signer;
    constructor(fee: Amount, amount: Amount, threshold: number, requestFirstN: number, singlePrivateKey: string, multiPrivateKey: Array<string>, nodeUrl: string, feeRate?: number | undefined, collector?: Collector | undefined);
    send(): Promise<string>;
}
