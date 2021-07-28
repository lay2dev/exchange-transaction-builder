import { OutPoint, RPC, Script } from '@lay2/pw-core';
import { TimeLockMultiTxBuilder } from './builder';
import { TimeLockMultiSigner } from '../signer/time-lock-signer';
import { RunningConfig } from '..';
/**
 * The object that combine `ExchangeTimeLockMultiTx`'s builder, signer and deployment.
 */
export declare class TimeLockMultiTx {
    _rpc: RPC;
    builder: TimeLockMultiTxBuilder;
    signer: TimeLockMultiSigner;
    constructor(_rpc: RPC, builder: TimeLockMultiTxBuilder, signer: TimeLockMultiSigner);
    /**
     * create ExchangeTimeLockMultiTx
     * @param fromOutPoint The `outpoint` where `NFT` from.
     * @param adminLockScript The `lock script` of admin address,where nft finally to,uses multiple signature
     * @param userLockScript  The `lock script` of user address,where nft finally to,uses single signature
     * @param threshold The `threshole` from `ExchagneTimeLock`'s multiple signature
     * @param requestFirstN The first nth public keys must match,which from `ExchagneTimeLock`'s multiple signature
     * @param singlePubKey The public key for `ExchagneTimeLock`'s single signature
     * @param multiPrivateKey The private keys for `ExchagneTimeLock`'s multiple signature
     * @param env The running enviment.One of `dev`,`testnet`
     * @returns ExchangeTimeLockMultiTx
     */
    static create(fromOutPoint: OutPoint, adminLockScript: Script, userLockScript: Script, threshold: number, requestFirstN: number, singlePubKey: string, multiPrivateKey: Array<string>, config: RunningConfig): Promise<TimeLockMultiTx>;
    /**
     * deploy `ExchangeTimeLockMultiTx`
     * @returns The transaction hash
     */
    send(): Promise<string>;
}
