import {Reader} from '@lay2/pw-core';
import {SerializeArgs, SerializeLock} from '../schemas-types/ckb-timelock';

export class TimeLockArgs {
  constructor(
    public threshold: number,
    public request_first_n: number,
    public multi_pubkey: Array<Reader>,
    public single_pubkey: Reader,
    public output_hash: Reader
  ) {}
  serialize() {
    return new Reader(SerializeArgs(this));
  }
}

export class TimeLock {
  constructor(
    public sign_flag: number,
    public args: TimeLockArgs,
    public signature: Array<Reader>
  ) {}
  serialize() {
    return new Reader(SerializeLock(this));
  }
}
