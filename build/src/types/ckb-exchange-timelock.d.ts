import { Reader } from '@lay2/pw-core';
import { SignFlag } from '.';
export declare class TimeLockArgs {
    threshold: number;
    request_first_n: number;
    multi_pubkey: Array<Reader>;
    single_pubkey: Reader;
    output_hash: Reader;
    constructor(threshold: number, request_first_n: number, multi_pubkey: Array<Reader>, single_pubkey: Reader, output_hash: Reader);
    serialize(): Reader;
}
export declare class TimeLock {
    sign_flag: SignFlag;
    args: TimeLockArgs;
    signature: Array<Reader>;
    constructor(sign_flag: SignFlag, args: TimeLockArgs, signature: Array<Reader>);
    serialize(): Reader;
}
