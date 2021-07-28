import { OutPoint, RPC, Script } from '@lay2/pw-core';
import { ExchangeLockMultiTxBuilder } from './builder';
import { RunningConfig } from '../config';
import { ExchangeLockMultiSigner } from '../signer/exchange-lock-signer';
/**
 * The object that combine `ExchangeLockMultiTx`'s builder, signer and deployment.
 */
export declare class ExchangeLockMultiTx {
    _rpc: RPC;
    builder: ExchangeLockMultiTxBuilder;
    signer: ExchangeLockMultiSigner;
    constructor(_rpc: RPC, builder: ExchangeLockMultiTxBuilder, signer: ExchangeLockMultiSigner);
    /**
     * create ExchangeLockMultiTx
     * @param fromOutPoint The `outpoint` where `NFT` from.
     * @param adminLockScript The `lock script` of admin address,where nft finally to,uses multiple signature
     * @param threshold The `threshole` from `ExchangeLock`'s multiple signature
     * @param requestFirstN The first nth public keys must match,which from `ExchangeLock`'s multiple signature
     * @param singlePubKey The public key for `ExchagneLock`'s single signature
     * @param multiPrivateKey The private keys for `ExchangeLock`'s multiple signature
     * @param cellDeps The cellDeps of the transaction,
     * @returns ExchangeLockMultiTx
     */
    static create(fromOutPoint: OutPoint, adminLockScript: Script, threshold: number, requestFirstN: number, singlePubKey: string, multiPrivateKey: Array<string>, config: RunningConfig): Promise<ExchangeLockMultiTx>;
    /**
     * deploy `ExchangeLockMultiTx`
     * @returns The transaction hash
     */
    send(): Promise<string>;
}
