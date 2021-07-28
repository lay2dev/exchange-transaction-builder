import { OutPoint, RPC, Script } from '@lay2/pw-core';
import { TimeLockSingleTxBuilder } from './builder';
import { TimeLockSingleSigner } from '../signer/time-lock-signer';
import { RunningConfig } from '..';
/**
 * The object that combine `ExchangeTimeLockSingleTx`'s builder, signer and deployment.
 */
export declare class TimeLockSingleTx {
    _rpc: RPC;
    builder: TimeLockSingleTxBuilder;
    signer: TimeLockSingleSigner;
    constructor(_rpc: RPC, builder: TimeLockSingleTxBuilder, signer: TimeLockSingleSigner);
    /**
     * create ExchangeTimeLockSingleTx
     * @param fromOutPoint The `outpoint` where `NFT` from.
     * @param userLockScript The `lock script` of user address,where nft finally to,uses single signature
     * @param threshold The `threshole` from `ExchagneTimeLock`'s multiple signature
     * @param requestFirstN The first nth public keys must match,which from `ExchagneTimeLock`'s multiple signature
     * @param singlePrivateKey The private key for `ExchagneTimeLock`'s single signature
     * @param multiPubKey The public keys for `ExchagneTimeLock`'s multiple signature
     * @param env The running enviment.One of `dev`,`testnet`
     * @returns ExchangeTimeLockSingleTx
     */
    static create(fromOutPoint: OutPoint, userLockScript: Script, threshold: number, requestFirstN: number, singlePrivateKey: string, multiPubKey: Array<string>, config: RunningConfig): Promise<TimeLockSingleTx>;
    send(): Promise<string>;
}
