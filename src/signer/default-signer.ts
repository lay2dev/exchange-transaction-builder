import { Address, Hasher, Message, Signer } from "@lay2/pw-core";
import ECPair from '@nervosnetwork/ckb-sdk-utils/lib/ecpair';

export class DefaultSigner extends Signer {
    private keyPair:ECPair;
    private fromAddr:Address;
    constructor(hash:Hasher,privateKey:string,fromAddr:Address){
        super(hash);
        this.keyPair = new ECPair(privateKey);
        this.fromAddr = fromAddr;
    }
  
    async signMessages(messages: Message[],): Promise<string[]> {
      const sigs = [];
      for (const message of messages) {
        if (
          this.fromAddr.toLockScript().toHash() === message.lock.toHash()
        ) {
          sigs.push(this.keyPair.signRecoverable(message.message));
        } else {
          sigs.push('0x');
        }
      }
  
      return sigs;
    }
  }