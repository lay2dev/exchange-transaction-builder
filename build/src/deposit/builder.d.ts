import { Address, Amount, Builder, Transaction, Collector } from '@lay2/pw-core';
export declare class DepositBuilder extends Builder {
    protected address: Address;
    protected amount: Amount;
    constructor(address: Address, amount: Amount, feeRate?: number, collector?: Collector);
    build(fee?: Amount): Promise<Transaction>;
}
