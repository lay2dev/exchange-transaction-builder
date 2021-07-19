import PWCore, {
  Address,
  Amount,
  Blake2bHasher,
  Collector,
  Hasher,
  HashType,
  Reader,
  RPC,
  Script,
  transformers,
} from '@lay2/pw-core';
import {readFileSync} from 'fs';
import {TimeLockFromExchangeLockBuilder} from './builder';
import * as ExchangeLock from '../schemas-types/ckb-lock-demo-type';
import * as TimeLock from '../schemas-types/ckb-timelock';
import ECPair from '@nervosnetwork/ckb-sdk-utils/lib/ecpair';
import {ExchangeLockSigner} from './signer';
// import {ExchangeLockProvider} from './provider';
import {ckb_lock_demo, ckb_timelock} from '../config';

export class TimeLockFromExchangeLock {
  private readonly _rpc: RPC;
  private builder: TimeLockFromExchangeLockBuilder;
  private singleKeyPair: ECPair;
  private multiKeyPair: Array<ECPair>;
  private signer: ExchangeLockSigner;

  constructor(
    protected fee: Amount = Amount.ZERO,
    private amount: Amount,
    private threshold: number,
    private requestFirstN: number,
    singlePrivateKey: string,
    multiPrivateKey: Array<string>,
    nodeUrl: string,
    private feeRate?: number,
    private collector?: Collector
  ) {
    this._rpc = new RPC(nodeUrl);
    const blake = new Blake2bHasher();

    this.multiKeyPair = [];
    let multiPubKeyHash = [];
    for (let privateKey of multiPrivateKey) {
      let keyPair = new ECPair(privateKey);
      this.multiKeyPair.push(keyPair);
      multiPubKeyHash.push(
        blake.hash(new Reader(keyPair.publicKey)).toArrayBuffer().slice(0, 20)
      );
      blake.reset();
    }

    this.singleKeyPair = new ECPair(singlePrivateKey);
    const singlePubKeyHash = blake
      .hash(new Reader(this.singleKeyPair.publicKey))
      .toArrayBuffer()
      .slice(0, 20);
    blake.reset();

    const exchangeLockCodeHash = ckb_lock_demo.typeHash;

    const exchangeLockArgs = (new Blake2bHasher() as Hasher)
      .update(
        new Reader(
          ExchangeLock.SerializeArgs({
            threshold: this.threshold,
            request_first_n: this.requestFirstN,
            multi_pubkey: multiPubKeyHash,
            single_pubkey: singlePubKeyHash,
          })
        ).toArrayBuffer()
      )
      .digest()
      .serializeJson()
      .slice(0, 42);

    blake.reset();

    let exchangeLockScript = new Script(
      exchangeLockCodeHash,
      exchangeLockArgs,
      HashType.type
    );
    const exchangeLockScriptHash = new Reader(
      exchangeLockScript.toHash().slice(0, 42)
    );
    let fromAddr = Address.fromLockScript(exchangeLockScript);

    const timeLockCodeHash = ckb_timelock.typeHash;
    blake.reset();

    let timeLockScript = new Script(
      timeLockCodeHash,
      blake
        .hash(
          new Reader(
            TimeLock.SerializeArgs({
              threshold: this.threshold,
              request_first_n: this.requestFirstN,
              multi_pubkey: multiPubKeyHash,
              single_pubkey: singlePubKeyHash,
              output_hash: exchangeLockScriptHash,
            })
          )
        )
        .serializeJson()
        .slice(0, 42),
      HashType.type
    );
    blake.reset();
    const toAddr = Address.fromLockScript(timeLockScript);

    const witnessArgs = {
      lock: new Reader(
        ExchangeLock.SerializeLock({
          args: {
            threshold: this.threshold,
            request_first_n: this.requestFirstN,
            multi_pubkey: multiPubKeyHash,
            single_pubkey: singlePubKeyHash,
          },
          sign_flag: 0,
          signature: [],
        })
      ).serializeJson(),
      input_type: '',
      output_type: '',
    };
    this.builder = new TimeLockFromExchangeLockBuilder(
      fromAddr,
      toAddr,
      this.fee,
      this.amount,
      witnessArgs,
      this.feeRate,
      this.collector
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

    tx.validate();
    let sign_tx = await this.signer.sign(tx);
    console.log(JSON.stringify(sign_tx, null, 2));

    let transform = transformers.TransformTransaction(sign_tx);
    let txHash = this._rpc.send_transaction(transform);
    return txHash;
  }
}
