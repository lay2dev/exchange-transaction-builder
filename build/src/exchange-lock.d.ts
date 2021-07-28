import { Address } from '@lay2/pw-core';
export declare class ExchangeLockAddr {
    private threshold;
    private requestFirstN;
    private singleKeyPair;
    private multiKeyPair;
    address: Address;
    constructor(threshold: number, requestFirstN: number, singlePrivateKey: string, multiPrivateKey: Array<string>);
}
