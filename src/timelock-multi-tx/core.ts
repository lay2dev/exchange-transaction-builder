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
import {TimeLockMultiTxBuilder} from './builder';
import {ExchangeLock, ExchangeLockArgs} from '../types/ckb-exchange-lock';
import {TimeLock, TimeLockArgs} from '../types/ckb-exchange-timelock';
import ECPair from '@nervosnetwork/ckb-sdk-utils/lib/ecpair';
import {TimeLockSigner} from '../signer/time-lock-signer';
// import {ExchangeLockProvider} from './provider';
import {DEV_CONFIG, } from '../config';

export class TimeLockMultiTx {
  private _rpc: RPC;
  private builder: TimeLockMultiTxBuilder;
  private signer: TimeLockSigner;

  constructor(
    fee: Amount = Amount.ZERO,
    amount: Amount,
    threshold: number,
    requestFirstN: number,
    singlePrivateKey: string,
    multiPrivateKey: Array<string>,
    nodeUrl: string,
    feeRate?: number,
    collector?: Collector
  ) {
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

    const toLockScriptHash = new Reader(
      toLockScript.toHash().slice(0, 42)
    );
    const fromLock = new TimeLock(
      1,
      new TimeLockArgs(
        threshold,
        requestFirstN,
        multiPubKeyHash,
        singlePubKeyHash,
        toLockScriptHash
      ),
      []
    );

    const fromLockArgs = new Blake2bHasher()
      .update(fromLock.args.serialize().toArrayBuffer())
      .digest()
      .serializeJson()
      .slice(0, 42);

    let fromLockScript = new Script(
      DEV_CONFIG.ckb_exchange_timelock.typeHash,
      fromLockArgs,
      HashType.type
    );
    const fromAddr = Address.fromLockScript(fromLockScript);

    const witnessArgs = {
      lock: fromLock.serialize().serializeJson(),
      input_type: '',
      output_type: '',
    };
    this.builder = new TimeLockMultiTxBuilder(
      fromAddr,
      toAddr,
      fee,
      amount,
      witnessArgs,
      feeRate,
      collector
    );

    this.signer = new TimeLockSigner(
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
