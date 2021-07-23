import {
  Blake2bHasher,
  Cell,
  HashType,
  OutPoint,
  Reader,
  RPC,
  Script,
  transformers,
} from '@lay2/pw-core';
import {ExchangeLockSingleTxBuilder} from './builder';
import {ExchangeLock, ExchangeLockArgs} from '../types/ckb-exchange-lock';
import {TimeLockArgs} from '../types/ckb-exchange-timelock';
import ECPair from '@nervosnetwork/ckb-sdk-utils/lib/ecpair';
import {ExchangeLockSingleSigner} from '../signer/exchange-lock-signer';
import {CONFIG} from '../config';
import {CellDepType, CKBEnv} from '../helpers';
import { RunningConfig } from '..';

/**
 * The object that combine `ExchangeLockSingleTx`'s builder, signer and deployment.
 */
export class ExchangeLockSingleTx {
  constructor(
    private readonly _rpc: RPC,
    private builder: ExchangeLockSingleTxBuilder,
    private signer: ExchangeLockSingleSigner
  ) {}
  
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
  static async create(
    fromOutPoint: OutPoint,
    userLockScript: Script,
    threshold: number,
    requestFirstN: number,
    singlePrivateKey: string,
    multiPubKey: Array<string>,
    config: RunningConfig
  ): Promise<ExchangeLockSingleTx> {
    const rpc = new RPC(config.ckb_url);

    let multiPubKeyHash = [];
    for (let pubkey of multiPubKey) {
      multiPubKeyHash.push(
        new Reader(
          new Blake2bHasher()
            .hash(new Reader(pubkey))
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

    const exchangeLock = new ExchangeLock(
      new ExchangeLockArgs(
        threshold,
        requestFirstN,
        singlePubKeyHash,
        multiPubKeyHash
      ),
      0,
      []
    );

    let timeLockScript = new Script(
      config.ckbExchangeLock.typeHash,
      new Blake2bHasher()
        .hash(
          new TimeLockArgs(
            threshold,
            requestFirstN,
            multiPubKeyHash,
            singlePubKeyHash,
            new Reader(userLockScript.toHash().slice(0, 42))
          ).serialize()
        )
        .serializeJson()
        .slice(0, 42),
      HashType.type
    );

    const inputCell = await Cell.loadFromBlockchain(rpc, fromOutPoint);
    let outputCell = inputCell.clone();
    outputCell.lock = timeLockScript;

    const signer = new ExchangeLockSingleSigner(
      inputCell.lock.toHash(),
      singlePrivateKey,
      exchangeLock,
      new Blake2bHasher()
    );

    const builder = new ExchangeLockSingleTxBuilder(
      inputCell,
      outputCell,
      exchangeLock,
      [
        config.getCellDep(CellDepType.ckb_exchange_lock),
        config.getCellDep(CellDepType.secp256k1_dep_cell),
        config.getCellDep(CellDepType.secp256k1_lib_dep_cell),
        config.getCellDep(CellDepType.nft_type),
      ]
    );

    return new ExchangeLockSingleTx(rpc, builder, signer);
  }

  /**
   * deploy `ExchangeLockSingleTx`
   * @returns The transaction hash
   */
  async send(): Promise<string> {
    const tx = await this.builder.build();

    let sign_tx = await this.signer.sign(tx);
    console.log(JSON.stringify(sign_tx, null, 2));
    sign_tx = sign_tx.validate();
    let transform = transformers.TransformTransaction(sign_tx);
    console.log(JSON.stringify(transform, null, 2));
    let txHash = this._rpc.send_transaction(transform);
    return txHash;
  }
}
