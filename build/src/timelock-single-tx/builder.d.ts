import { Address, Amount, Builder, Transaction, Collector, WitnessArgs } from '@lay2/pw-core';
export declare class TimeLockSingleTxBuilder extends Builder {
    private fromAddr;
    private toAddr;
    protected fee: Amount;
    private amount;
    protected witnessArgs: WitnessArgs;
    constructor(fromAddr: Address, toAddr: Address, fee: Amount, amount: Amount, witnessArgs: WitnessArgs, feeRate?: number, collector?: Collector);
    build(): Promise<Transaction>;
}
