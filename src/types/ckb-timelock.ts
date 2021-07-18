import { Reader } from "@lay2/pw-core";

export class Args{
    constructor(
        public threshold:number,
        public request_first_n:number,
        public multi_pubkey:Array<Reader>,
        public single_pubkey:Reader,
        public output_hash:Reader,
    ){}
}

export class Lock {
    constructor(
      public sign_flag: number,
      public args: Args,
      public signature: Array<Reader>
    ) {}
  }
  