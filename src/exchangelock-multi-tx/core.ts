import {
  Address,
  Amount,
  Blake2bHasher,
  Collector,
  HashType,
  Reader,
  RPC,
  Script,
  transformers,
} from '@lay2/pw-core';
import {ExchangeLockMultiTxBuilder} from './builder';
import {ExchangeLock, ExchangeLockArgs} from '../types/ckb-exchange-lock';
import ECPair from '@nervosnetwork/ckb-sdk-utils/lib/ecpair';
// import {ExchangeLockProvider} from './provider';
import {DEV_CONFIG, TESTNET_CONFIG, } from '../config';
import {ExchangeLockSigner} from '../signer/exchange-lock-signer';
import { CKBEnv } from '../helpers';

export class ExchangeLockMultiTx {
  private _rpc: RPC;
  private builder: ExchangeLockMultiTxBuilder;
  private signer: ExchangeLockSigner;

  constructor(
    fee: Amount = Amount.ZERO,
    amount: Amount,
    threshold: number,
    requestFirstN: number,
    singlePrivateKey: string,
    multiPrivateKey: Array<string>,
    env: CKBEnv,
    feeRate?: number,
    collector?: Collector
  ) {
    const nodeUrl = env == CKBEnv.dev ? DEV_CONFIG.ckb_url : TESTNET_CONFIG.ckb_url;
    this._rpc = new RPC(nodeUrl);

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

    const fromLock = new ExchangeLock(
      new ExchangeLockArgs(
        threshold,
        requestFirstN,
        singlePubKeyHash,
        multiPubKeyHash
      ),
      1,
      []
    );

    const fromLockArgs = new Blake2bHasher()
      .update(fromLock.args.serialize().toArrayBuffer())
      .digest()
      .serializeJson()
      .slice(0, 42);

    let fromLockScript = new Script(
      DEV_CONFIG.ckb_exchange_lock.typeHash,
      fromLockArgs,
      HashType.type
    );
    const fromAddr = Address.fromLockScript(fromLockScript);

    const toLock = new ExchangeLock(
      new ExchangeLockArgs(
        threshold,
        requestFirstN,
        singlePubKeyHash,
        multiPubKeyHash
      ),
      1,
      []
    );

    let toLockScript = new Script(
      DEV_CONFIG.ckb_exchange_lock.typeHash,
      new Blake2bHasher()
        .hash(toLock.args.serialize())
        .serializeJson()
        .slice(0, 42),
      HashType.type
    );

    let toAddr = Address.fromLockScript(toLockScript);

    const witnessArgs = {
      lock: fromLock.serialize().serializeJson(),
      input_type: '',
      output_type: '',
    };
    this.builder = new ExchangeLockMultiTxBuilder(
      fromAddr,
      toAddr,
      fee,
      amount,
      witnessArgs,
      feeRate,
      collector
    );

    this.signer = new ExchangeLockSigner(
      fromAddr,
      singlePrivateKey,
      multiPrivateKey,
      fromLock,
      new Blake2bHasher()
    );
  }

  async send(): Promise<string> {
    const tx = await this.builder.build();

    let sign_tx = await this.signer.sign(tx);
    console.log(JSON.stringify(sign_tx, null, 2));

    let transform = transformers.TransformTransaction(sign_tx);
    let txHash = this._rpc.send_transaction(transform);
    return txHash;
  }
}