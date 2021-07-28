import { Address } from '@lay2/pw-core';
import { RunningConfig } from '..';
/**
 * Address whose lock script is `ExchangeLock`
 */
export declare class ExchangeTimeLockAddr {
    address: Address;
    /**
     *
     * @param threshold
     * @param requestFirstN The `threshole` from `ExchangeLock`'s multiple signature
     * @param singlePubKey The public key for `ExchagneLock`'s single signature
     * @param multiPubKey The private keys for `ExchangeLock`'s multiple signature
     * @param outputHash The output `cell`'s `LockScript` hash should match when single signature
     */
    constructor(threshold: number, requestFirstN: number, singlePubKey: string, multiPubKey: Array<string>, outputHash: string, config: RunningConfig);
}
