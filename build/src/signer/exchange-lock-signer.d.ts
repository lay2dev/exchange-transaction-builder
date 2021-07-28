import { Message, Signer, Hasher } from '@lay2/pw-core';
import ECPair from '@nervosnetwork/ckb-sdk-utils/lib/ecpair';
import { ExchangeLock } from '../types/ckb-exchange-lock';
/**
 * The signer for `ExchangeLock`'s single signature
 */
export declare class ExchangeLockSingleSigner extends Signer {
    fromLockHash: string;
    exchangeLock: ExchangeLock;
    singleKeyPair: ECPair;
    constructor(fromLockHash: string, singlePrivateKey: string, exchangeLock: ExchangeLock, hasher: Hasher);
    /**
     *
     * @param messages Signing message
     * @returns Signed witnessArgs's lock
     */
    signMessages(messages: Message[]): Promise<string[]>;
}
/**
 * The signer for `ExchangeLock`'s multiple signature
 */
export declare class ExchangeLockMultiSigner extends Signer {
    private fromLockHash;
    private exchangeLock;
    private multiKeyPair;
    constructor(fromLockHash: string, multiPrivateKey: Array<string>, exchangeLock: ExchangeLock, hasher: Hasher);
    /**
     *
     * @param messages Signing message
     * @returns Signed witnessArgs's lock
     */
    signMessages(messages: Message[]): Promise<string[]>;
}
