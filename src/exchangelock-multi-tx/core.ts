import {
  Blake2bHasher,
  Cell,
  OutPoint,
  Reader,
  RPC,
  Script,
  transformers,
} from '@lay2/pw-core';
import {ExchangeLockMultiTxBuilder} from './builder';
import {ExchangeLock, ExchangeLockArgs} from '../types/ckb-exchange-lock';
import ECPair from '@nervosnetwork/ckb-sdk-utils/lib/ecpair';
import {DEV_CONFIG, TESTNET_CONFIG} from '../config';
import {ExchangeLockSigner} from '../signer/exchange-lock-signer';
import {CKBEnv} from '../helpers';

/**
 * The object that combine `ExchangeLockMultiTx`'s builder, signer and deployment.
 */
export class ExchangeLockMultiTx {
  constructor(
    private _rpc: RPC,
    private builder: ExchangeLockMultiTxBuilder,
    private signer: ExchangeLockSigner
  ) {}

  /**
   * create ExchangeLockMultiTx
   * @param fromOutPoint The `outpoint` where `NFT` from.
   * @param adminLockScript The `lock script` of admin address,where nft finally to,uses multiple signature
   * @param threshold The `threshole` from `ExchangeLock`'s multiple signature 
   * @param requestFirstN The first nth public keys must match,which from `ExchangeLock`'s multiple signature 
   * @param singlePrivateKey The private key for `ExchagneLock`'s single signature
   * @param multiPrivateKey The private keys for `ExchangeLock`'s multiple signature
   * @param env The running enviment.One of `dev`,`testnet`
   * @returns ExchangeLockMultiTx
   */
  static async create(
    fromOutPoint: OutPoint,
    adminLockScript: Script,
    threshold: number,
    requestFirstN: number,
    singlePrivateKey: string,
    multiPrivateKey: Array<string>,
    env: CKBEnv = CKBEnv.testnet
  ): Promise<ExchangeLockMultiTx> {
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

    let exchangeLock = new ExchangeLock(
      new ExchangeLockArgs(
        threshold,
        requestFirstN,
        singlePubKeyHash,
        multiPubKeyHash
      ),
      1,
      []
    );


    const inputCell = await Cell.loadFromBlockchain(rpc, fromOutPoint);
    let outputCell = inputCell.clone();
    outputCell.lock = adminLockScript;

    const signer = new ExchangeLockSigner(
      inputCell.lock.toHash(),
      singlePrivateKey,
      multiPrivateKey,
      exchangeLock.clone(),
      new Blake2bHasher()
    );

    const builder = new ExchangeLockMultiTxBuilder(
      inputCell,
      outputCell,
      exchangeLock,
      env
    );

    return await new ExchangeLockMultiTx(rpc, builder, signer);
  }

  /**
   * deploy `ExchangeLockMultiTx`
   * @returns The transaction hash
   */
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
