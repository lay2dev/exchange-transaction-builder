import {Reader} from '@lay2/pw-core';
import {
  SerializeArgs,
  SerializeLock,
} from '../schemas-types/ckb-lock-demo-type';

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
}
