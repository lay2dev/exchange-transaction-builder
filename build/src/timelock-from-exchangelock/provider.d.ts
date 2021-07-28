import { Provider, Address, Hasher } from '@lay2/pw-core';
export declare class ExchangeLockProvider extends Provider {
    private threshold;
    private requestFirstN;
    private signFlag;
    private singleKeyPair;
    private multiKeyPair;
    private singlePubKeyHash;
    private multiPubKeyHash;
    constructor(fromAddr: Address, singlePrivateKey: string, multiPrivateKey: Array<string>, threshold: number, requestFirstN: number, signFlag: boolean);
    init(): Promise<Provider>;
    hasher(): Hasher;
    close(): Promise<boolean>;
    sign(message: string): Promise<string>;
}
