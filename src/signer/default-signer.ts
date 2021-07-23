import { Hasher, Message, Signer } from "@lay2/pw-core";
import ECPair from '@nervosnetwork/ckb-sdk-utils/lib/ecpair';

export class DefaultSigner extends Signer {
    public keyPair:ECPair;
    public fromLockHash:string;
    constructor(hash:Hasher,privateKey:string,fromLockHash:string){
        super(hash);
        this.keyPair = new ECPair(privateKey);
        this.fromLockHash = fromLockHash;
    }

    async signMessages(messages: Message[],): Promise<string[]> {
      const sigs = [];
      for (const message of messages) {
        if (
          this.fromLockHash === message.lock.toHash()
        ) {
          sigs.push(this.keyPair.signRecoverable(message.message));
        } else {
          sigs.push('0x');
        }
      }
  
      return sigs;
    }
  }