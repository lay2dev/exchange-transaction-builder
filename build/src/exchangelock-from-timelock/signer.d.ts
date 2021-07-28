import { Message, Signer, Reader, Address, Hasher } from '@lay2/pw-core';
export declare class TimeLockSigner extends Signer {
    private fromAddr;
    private threshold;
    private requestFirstN;
    private signFlag;
    private outputHash;
    private singleKeyPair;
    private multiKeyPair;
    private singlePubKeyHash;
    private multiPubKeyHash;
    constructor(fromAddr: Address, singlePrivateKey: string, multiPrivateKey: Array<string>, threshold: number, requestFirstN: number, signFlag: boolean, outputHash: Reader, hasher: Hasher);
    signMessages(messages: Message[]): Promise<string[]>;
}
