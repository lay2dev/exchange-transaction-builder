import { Reader } from '@lay2/pw-core';
import { SignFlag } from '..';
export declare class ExchangeLockArgs {
    threshold: number;
    request_first_n: number;
    single_pubkey: Reader;
    multi_pubkey: Array<Reader>;
    constructor(threshold: number, request_first_n: number, single_pubkey: Reader, multi_pubkey: Array<Reader>);
    serialize(): Reader;
    clone(): ExchangeLockArgs;
}
export declare class ExchangeLock {
    args: ExchangeLockArgs;
    sign_flag: SignFlag;
    signature: Array<Reader>;
    constructor(args: ExchangeLockArgs, sign_flag: SignFlag, signature: Array<Reader>);
    serialize(): Reader;
    clone(): ExchangeLock;
}
