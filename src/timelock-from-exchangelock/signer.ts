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
import * as ExchangeLock from '../schemas-types/ckb-lock-demo-type';

export class ExchangeLockSigner extends Signer {
  private singleKeyPair: ECPair;
  private multiKeyPair: Array<ECPair>;
  private singlePubKeyHash: ArrayBuffer;
  private multiPubKeyHash: ArrayBuffer[];
  constructor(
    private fromAddr: Address,
    singlePrivateKey: string,
    multiPrivateKey: Array<string>,
    private threshold: number,
    private requestFirstN: number,
    private signFlag: boolean,
    hasher: Hasher
  ) {
    super(hasher);

    let blake = new Blake2bHasher();
    this.singleKeyPair = new ECPair(singlePrivateKey);
    this.singlePubKeyHash = blake
      .hash(new Reader(this.singleKeyPair.publicKey))
      .toArrayBuffer()
      .slice(0, 20);
    blake.reset();
    this.multiKeyPair = [];
    this.multiPubKeyHash = [];
    for (let privateKey of multiPrivateKey) {
      let keyPair = new ECPair(privateKey);
      this.multiKeyPair.push(keyPair);
      this.multiPubKeyHash.push(
        blake.hash(new Reader(keyPair.publicKey)).toArrayBuffer().slice(0, 20)
      );
      blake.reset();
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
        if (this.signFlag) {
          let sig = [];
          for (let keyPair of this.multiKeyPair) {
            sig.push(new Reader(keyPair.signRecoverable(m.serializeJson())));
          }
          let lock = new Reader(
            ExchangeLock.SerializeLock({
              args: {
                threshold: this.threshold,
                request_first_n: this.requestFirstN,
                single_pubkey: this.singlePubKeyHash,
                multi_pubkey: this.multiPubKeyHash,
              },
              sign_flag: this.signFlag ? 1 : 0,
              signature: sig,
            })
          ).serializeJson();

          witnessLocks.push(lock);
        } else {
          const sig = new Reader(
            this.singleKeyPair.signRecoverable(m.serializeJson())
          );
          let lock = new Reader(
            ExchangeLock.SerializeLock({
              args: {
                threshold: this.threshold,
                request_first_n: this.requestFirstN,
                single_pubkey: this.singlePubKeyHash,
                multi_pubkey: this.multiPubKeyHash,
              },
              sign_flag: this.signFlag ? 1 : 0,
              signature: [sig],
            })
          ).serializeJson();
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
