import { Hasher, Message, Signer } from "@lay2/pw-core";
import ECPair from '@nervosnetwork/ckb-sdk-utils/lib/ecpair';
export declare class DefaultSigner extends Signer {
    keyPair: ECPair;
    fromLockHash: string;
    constructor(hash: Hasher, privateKey: string, fromLockHash: string);
    signMessages(messages: Message[]): Promise<string[]>;
}
