import { Reader } from '@lay2/pw-core';
export declare class Args {
    threshold: number;
    request_first_n: number;
    single_pubkey: Reader;
    multi_pubkey: Array<Reader>;
    constructor(threshold: number, request_first_n: number, single_pubkey: Reader, multi_pubkey: Array<Reader>);
}
export declare class Lock {
    args: Args;
    sign_flag: number;
    signature: Array<Reader>;
    constructor(args: Args, sign_flag: number, signature: Array<Reader>);
}
