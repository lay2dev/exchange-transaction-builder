import {
  Message,
  Provider,
  Signer,
  Keccak256Hasher,
  Reader,
  Address,
  Hasher,
  Blake2bHasher,
} from '@lay2/pw-core';
import ECPair from '@nervosnetwork/ckb-sdk-utils/lib/ecpair';
import {ExchangeLock} from '../types/ckb-lock-demo';

export class ExchangeLockSigner extends Signer {
  private singleKeyPair: ECPair;
  private multiKeyPair: Array<ECPair>;
  constructor(
    private fromAddr: Address,
    singlePrivateKey: string,
    multiPrivateKey: Array<string>,
    private exchangeLock: ExchangeLock,
    hasher: Hasher
  ) {
    super(hasher);

    this.singleKeyPair = new ECPair(singlePrivateKey);

    this.multiKeyPair = [];
    for (let privateKey of multiPrivateKey) {
      let keyPair = new ECPair(privateKey);
      this.multiKeyPair.push(keyPair);
    }
  }

  async signMessages(messages: Message[]): Promise<string[]> {
    const witnessLocks = [];
    var prefix = Buffer.from(
      '\u0019Ethereum Signed Message:\n' + '32',
      'utf-8'
    );
    let keccak = new Keccak256Hasher();
    for (const message of messages) {
      if (this.fromAddr.toLockScript().toHash() === message.lock.toHash()) {
        console.log('message:', message.message);
        const m = keccak
          .update(new Reader('0x' + prefix.toString('hex')))
          .update(new Reader(message.message))
          .digest();
        console.log('keccak message:', m);
        if (this.exchangeLock.sign_flag) {
          for (let keyPair of this.multiKeyPair) {
            this.exchangeLock.signature.push(
              new Reader(keyPair.signRecoverable(m.serializeJson()))
            );
          }
          let lock = this.exchangeLock.serialize().serializeJson();

          witnessLocks.push(lock);
        } else {
          this.exchangeLock.signature.push(
            new Reader(this.singleKeyPair.signRecoverable(m.serializeJson()))
          );
          let lock = this.exchangeLock.serialize().serializeJson();
          console.log(lock);
          witnessLocks.push(lock);
        }
        keccak.reset();
      } else {
        witnessLocks.push('0x');
      }
    }

    return witnessLocks;
  }
}
