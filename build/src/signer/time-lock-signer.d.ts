import { Message, Signer, Hasher } from '@lay2/pw-core';
import ECPair from '@nervosnetwork/ckb-sdk-utils/lib/ecpair';
import { TimeLock } from '../types/ckb-exchange-timelock';
/**
 * The signer for `ExchangeTimeLock`'s single signature
 */
export declare class TimeLockSingleSigner extends Signer {
    fromLockHash: string;
    timeLock: TimeLock;
    singleKeyPair: ECPair;
    constructor(fromLockHash: string, singlePrivateKey: string, timeLock: TimeLock, hasher: Hasher);
    /**
     *
     * @param messages Signing message
     * @returns Signed witnessArgs's lock
     */
    signMessages(messages: Message[]): Promise<string[]>;
}
/**
 * The signer for `ExchangeTimeLock`'s multiple signature.
 */
export declare class TimeLockMultiSigner extends Signer {
    private fromLockHash;
    private timeLock;
    private multiKeyPair;
    constructor(fromLockHash: string, multiPrivateKey: Array<string>, timeLock: TimeLock, hasher: Hasher);
    /**
     *
     * @param messages Signing message
     * @returns Signed witnessArgs's lock
     */
    signMessages(messages: Message[]): Promise<string[]>;
}
