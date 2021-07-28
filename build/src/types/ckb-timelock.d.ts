import { Reader } from "@lay2/pw-core";
export declare class Args {
    threshold: number;
    request_first_n: number;
    multi_pubkey: Array<Reader>;
    single_pubkey: Reader;
    output_hash: Reader;
    constructor(threshold: number, request_first_n: number, multi_pubkey: Array<Reader>, single_pubkey: Reader, output_hash: Reader);
}
export declare class Lock {
    sign_flag: number;
    args: Args;
    signature: Array<Reader>;
    constructor(sign_flag: number, args: Args, signature: Array<Reader>);
}
