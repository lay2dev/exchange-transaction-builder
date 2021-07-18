import {
  getDefaultPrefix,
  Platform,
  Provider,
  AddressPrefix as PwAddressPrefix,
  Address,
  Hasher,
  Blake2bHasher,
  Reader,
} from '@lay2/pw-core';
import ECPair from '@nervosnetwork/ckb-sdk-utils/lib/ecpair';
import {AddressPrefix, privateKeyToAddress} from '@nervosnetwork/ckb-sdk-utils';
import * as ExchangeLock from '../schemas-types/ckb-lock-demo-type';

export class ExchangeLockProvider extends Provider {
  private singleKeyPair: ECPair;
  private multiKeyPair: Array<ECPair>;
  private singlePubKeyHash: ArrayBuffer;
  private multiPubKeyHash: ArrayBuffer[];
  constructor(
    fromAddr: Address,
    singlePrivateKey: string,
    multiPrivateKey: Array<string>,
    private threshold: number,
    private requestFirstN: number,
    private signFlag: boolean
  ) {
    super(Platform.ckb);
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
    this.address = fromAddr;
  }

  async init(): Promise<Provider> {
    return this;
  }

  hasher(): Hasher {
    return new Blake2bHasher();
  }

  async close() {
    return true;
  }
  async sign(message: string): Promise<string> {
    if (this.signFlag) {
      let sig = [];
      for (let keyPair of this.multiKeyPair) {
        sig.push(new Reader(keyPair.signRecoverable(message)));
      }
      let lock = new Reader(
        ExchangeLock.SerializeLock({
          args: {
            threshold: this.threshold,
            request_first_n: this.requestFirstN,
            single_pubkey: this.singlePubKeyHash,
            multi_pubkey: this.multiPubKeyHash,
          },
          sign_flag: this.signFlag ? 1:0,
          signature: sig,
        })
      ).serializeJson();
      console.log(lock);
      return lock;
    } else {
      const sig = new Reader(this.singleKeyPair.signRecoverable(message));
      let lock = new Reader(
        ExchangeLock.SerializeLock({
          args: {
            threshold: this.threshold,
            request_first_n: this.requestFirstN,
            single_pubkey: this.singlePubKeyHash,
            multi_pubkey: this.multiPubKeyHash,
          },
          sign_flag: this.signFlag ? 1:0 ,
          signature: [sig],
        })
      ).serializeJson();
      console.log(lock);
      return lock;
    }
  }
}
