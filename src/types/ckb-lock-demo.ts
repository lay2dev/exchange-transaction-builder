import {Reader} from '@lay2/pw-core';

export class Args {
  constructor(
    public threshold: number,
    public request_first_n: number,
    public single_pubkey: Reader,
    public multi_pubkey: Array<Reader>
  ) {}
}

export class Lock {
  constructor(
    public args: Args,
    public sign_flag: number,
    public signature: Array<Reader>
  ) {}
}
