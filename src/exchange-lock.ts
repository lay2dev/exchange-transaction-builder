import {Address, Blake2bHasher, HashType, Reader, Script} from '@lay2/pw-core';
import ECPair from '@nervosnetwork/ckb-sdk-utils/lib/ecpair';
import { ckb_lock_demo } from './config';
import * as ExchangeLock from './schemas-types/ckb-exchange-lock-type';

export class ExchangeLockAddr {
  private singleKeyPair: ECPair;
  private multiKeyPair: Array<ECPair>;
  address:Address;
  constructor(
    private threshold: number,
    private requestFirstN: number,
    singlePrivateKey: string,
    multiPrivateKey: Array<string>,
  ) {
    const blake = new Blake2bHasher();

    this.multiKeyPair = [];
    let multiPubKeyHash = [];
    for (let privateKey of multiPrivateKey) {
      let keyPair = new ECPair(privateKey);
      this.multiKeyPair.push(keyPair);
      multiPubKeyHash.push(blake.hash(new Reader(keyPair.publicKey)).toArrayBuffer().slice(0,20));
      blake.reset();
    }

    this.singleKeyPair = new ECPair(singlePrivateKey);
    console.log("pubkey",this.singleKeyPair.publicKey);
    const singlePubKeyHash = blake.hash(new Reader(this.singleKeyPair.publicKey)).toArrayBuffer().slice(0,20);
    blake.reset();

    const exchangeLockCodeHash = ckb_lock_demo.typeHash;

    const exchangeLockArgs = blake.hash(new Reader(ExchangeLock.SerializeArgs({
      threshold: this.threshold,
      request_first_n: this.requestFirstN,
      multi_pubkey: multiPubKeyHash,
      single_pubkey: singlePubKeyHash,
    }))).serializeJson().slice(0,42);


    let exchangeLockScript = new Script(
      exchangeLockCodeHash,
      exchangeLockArgs,
      HashType.type
    );
    let addr = Address.fromLockScript(exchangeLockScript);
    this.address = addr;
  }
}
