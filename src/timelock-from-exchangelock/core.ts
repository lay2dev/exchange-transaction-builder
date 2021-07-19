import PWCore, {
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
import {TimeLockFromExchangeLockBuilder} from './builder';
import {ExchangeLock, ExchangeLockArgs} from '../types/ckb-lock-demo';
import {TimeLock, TimeLockArgs} from '../types/ckb-timelock';
import ECPair from '@nervosnetwork/ckb-sdk-utils/lib/ecpair';
import {ExchangeLockSigner} from './signer';
// import {ExchangeLockProvider} from './provider';
import {ckb_lock_demo, ckb_timelock} from '../config';

export class TimeLockFromExchangeLock {
  private readonly _rpc: RPC;
  private builder: TimeLockFromExchangeLockBuilder;
  private signer: ExchangeLockSigner;

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

    const exchangeLockArgs = new Blake2bHasher()
      .hash(exchangeLock.args.serialize())
      .serializeJson()
      .slice(0, 42);

    let exchangeLockScript = new Script(
      ckb_lock_demo.typeHash,
      exchangeLockArgs,
      HashType.type
    );
    const exchangeLockScriptHash = new Reader(
      exchangeLockScript.toHash().slice(0, 42)
    );
    const timeLock = new TimeLock(
      0,
      new TimeLockArgs(
        threshold,
        requestFirstN,
        multiPubKeyHash,
        singlePubKeyHash,
        exchangeLockScriptHash
      ),
      []
    );
    let fromAddr = Address.fromLockScript(exchangeLockScript);

    let timeLockScript = new Script(
      ckb_timelock.typeHash,
      new Blake2bHasher()
        .hash(timeLock.args.serialize())
        .serializeJson()
        .slice(0, 42),
      HashType.type
    );
    const toAddr = Address.fromLockScript(timeLockScript);

    const witnessArgs = {
      lock: exchangeLock.serialize().serializeJson(),
      input_type: '',
      output_type: '',
    };
    this.builder = new TimeLockFromExchangeLockBuilder(
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
      threshold,
      requestFirstN,
      false,
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
