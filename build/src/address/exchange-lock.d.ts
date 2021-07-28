import { Address } from '@lay2/pw-core';
import { RunningConfig } from '..';
/**
 * Address whose lock script is `ExchangeLock`
 */
export declare class ExchangeLockAddr {
    address: Address;
    /**
     *
     * @param threshold
     * @param requestFirstN The `threshole` from `ExchangeLock`'s multiple signature
     * @param singlePubKey The public key for `ExchagneLock`'s single signature
     * @param multiPubKey The private keys for `ExchangeLock`'s multiple signature
     */
    constructor(threshold: number, requestFirstN: number, singlePubKey: string, multiPubKey: Array<string>, config: RunningConfig);
}
