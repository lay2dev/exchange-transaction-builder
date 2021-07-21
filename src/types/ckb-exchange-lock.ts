import {Reader} from '@lay2/pw-core';
import {
  SerializeArgs,
  SerializeLock,
} from '../schemas-types/ckb-exchange-lock-type';

export class ExchangeLockArgs {
  constructor(
    public threshold: number,
    public request_first_n: number,
    public single_pubkey: Reader,
    public multi_pubkey: Array<Reader>
  ) {}
  serialize() {
    return new Reader(SerializeArgs(this));
  }
  clone() {
    return new ExchangeLockArgs(this.threshold,this.request_first_n,this.single_pubkey,this.multi_pubkey.slice());
  }
}

export class ExchangeLock {
  constructor(
    public args: ExchangeLockArgs,
    public sign_flag: number,
    public signature: Array<Reader>
  ) {}
  serialize() {
    return new Reader(SerializeLock(this));
  }
  clone(){
    return new ExchangeLock(this.args.clone(),this.sign_flag,this.signature.slice());
  }
}
