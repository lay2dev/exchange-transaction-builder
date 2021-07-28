import { OutPoint, RPC, Script } from '@lay2/pw-core';
import { ExchangeLockSingleTxBuilder } from './builder';
import { ExchangeLockSingleSigner } from '../signer/exchange-lock-signer';
import { RunningConfig } from '..';
/**
 * The object that combine `ExchangeLockSingleTx`'s builder, signer and deployment.
 */
export declare class ExchangeLockSingleTx {
    _rpc: RPC;
    builder: ExchangeLockSingleTxBuilder;
    signer: ExchangeLockSingleSigner;
    constructor(_rpc: RPC, builder: ExchangeLockSingleTxBuilder, signer: ExchangeLockSingleSigner);
    /**
     * create ExchangeLockSingleTx
     * @param fromOutPoint The `outpoint` where `NFT` from.
     * @param userLockScript The `lock script` of user address,where nft finally to,uses single signature
     * @param threshold The `threshole` from `ExchangeLock`'s multiple signature
     * @param requestFirstN The first nth public keys must match,which from `ExchangeLock`'s multiple signature
     * @param singlePrivateKey The private key for `ExchagneLock`'s single signature
     * @param multiPubKey The public keys for `ExchangeLock`'s multiple signature
     * @param env The running enviment.One of `dev`,`testnet`
     * @returns ExchangeLockSingleTx
     */
    static create(fromOutPoint: OutPoint, userLockScript: Script, threshold: number, requestFirstN: number, singlePrivateKey: string, multiPubKey: Array<string>, config: RunningConfig): Promise<ExchangeLockSingleTx>;
    /**
     * deploy `ExchangeLockSingleTx`
     * @returns The transaction hash
     */
    send(): Promise<string>;
}
