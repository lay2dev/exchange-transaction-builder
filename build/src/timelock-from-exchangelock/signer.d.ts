import { Message, Signer, Address, Hasher } from '@lay2/pw-core';
export declare class ExchangeLockSigner extends Signer {
    private fromAddr;
    private threshold;
    private requestFirstN;
    private signFlag;
    private singleKeyPair;
    private multiKeyPair;
    private singlePubKeyHash;
    private multiPubKeyHash;
    constructor(fromAddr: Address, singlePrivateKey: string, multiPrivateKey: Array<string>, threshold: number, requestFirstN: number, signFlag: boolean, hasher: Hasher);
    signMessages(messages: Message[]): Promise<string[]>;
}
