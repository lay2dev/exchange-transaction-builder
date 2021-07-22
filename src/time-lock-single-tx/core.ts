import {
  Blake2bHasher,
  Cell,
  OutPoint,
  Reader,
  RPC,
  Script,
  transformers,
} from '@lay2/pw-core';
import {TimeLockSingleTxBuilder} from './builder';
import {TimeLock, TimeLockArgs} from '../types/ckb-exchange-timelock';
import ECPair from '@nervosnetwork/ckb-sdk-utils/lib/ecpair';
import {TimeLockSigner} from '../signer/time-lock-signer';
import {DEV_CONFIG, TESTNET_CONFIG, } from '../config';
import { CKBEnv } from '../helpers';

/**
 * The object that combine `ExchangeTimeLockSingleTx`'s builder, signer and deployment.
 */
export class TimeLockSingleTx {
  constructor(
    private readonly _rpc: RPC,
    private builder: TimeLockSingleTxBuilder,
    private signer: TimeLockSigner
  ) {}

  /**
   * create ExchangeTimeLockSingleTx
   * @param fromOutPoint The `outpoint` where `NFT` from.
   * @param userLockScript The `lock script` of user address,where nft finally to,uses single signature
   * @param threshold The `threshole` from `ExchagneTimeLock`'s multiple signature 
   * @param requestFirstN The first nth public keys must match,which from `ExchagneTimeLock`'s multiple signature 
   * @param singlePrivateKey The private key for `ExchagneTimeLock`'s single signature
   * @param multiPrivateKey The private keys for `ExchagneTimeLock`'s multiple signature
   * @param env The running enviment.One of `dev`,`testnet`
   * @returns ExchangeTimeLockSingleTx
   */
  static async create(
    fromOutPoint: OutPoint,
    userLockScript:Script,
    threshold: number,
    requestFirstN: number,
    singlePrivateKey: string,
    multiPrivateKey: Array<string>,
    env: CKBEnv = CKBEnv.testnet
  ):Promise<TimeLockSingleTx> {
    const nodeUrl =
      env == CKBEnv.dev ? DEV_CONFIG.ckb_url : TESTNET_CONFIG.ckb_url;
    const rpc = new RPC(nodeUrl);

    let multiKeyPair = [];
    let multiPubKeyHash = [];
    for (let privateKey of multiPrivateKey) {
      let keyPair = new ECPair(privateKey);
      multiKeyPair.push(keyPair);
      multiPubKeyHash.push(
        new Reader(
          new Blake2bHasher()
            .hash(new Reader(keyPair.publicKey))
            .toArrayBuffer()
            .slice(0, 20)
        )
      );
    }

    const singleKeyPair = new ECPair(singlePrivateKey);
    const singlePubKeyHash = new Reader(
      new Blake2bHasher()
        .hash(new Reader(singleKeyPair.publicKey))
        .toArrayBuffer()
        .slice(0, 20)
    );

    const userLockScriptHash = new Reader(
      userLockScript.toHash().slice(0, 42)
    );

    const timeLock = new TimeLock(
      0,
      new TimeLockArgs(
        threshold,
        requestFirstN,
        multiPubKeyHash,
        singlePubKeyHash,
        userLockScriptHash
      ),
      []
    );

    let inputCell = await Cell.loadFromBlockchain(rpc, fromOutPoint);
    let outputCell = inputCell.clone();
    outputCell.lock = userLockScript;

    const signer = new TimeLockSigner(
      inputCell.lock.toHash(),
      singlePrivateKey,
      multiPrivateKey,
      timeLock,
      new Blake2bHasher()
    );

    const builder = new TimeLockSingleTxBuilder(
      inputCell,
      outputCell,
      timeLock,
      env
    );

    return new TimeLockSingleTx(rpc, builder, signer);
  }

  async send(): Promise<string> {
    const tx = await this.builder.build();

    let sign_tx = await this.signer.sign(tx);
    console.log(JSON.stringify(sign_tx, null, 2));
    sign_tx = sign_tx.validate();

    let transform = transformers.TransformTransaction(sign_tx);
    let txHash = this._rpc.send_transaction(transform);
    return txHash;
  }
}
