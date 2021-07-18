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
import {ExchangeLockProvider} from './provider';

export class TimeLockFromExchangeLock {
  private readonly _rpc: RPC;
  private builder: TimeLockFromExchangeLockBuilder;
  private singleKeyPair: ECPair;
  private multiKeyPair: Array<ECPair>;
  private signer: ExchangeLockSigner;

  constructor(
    protected fee: Amount = Amount.ZERO,
    private timelockScriptCodePath: string,
    private exchangeLockScriptCodePath: string,
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
    console.log("pubkey:",this.singleKeyPair.publicKey);
    blake.reset();

    const exchangeLockCodeHash = "0x1c5e60fcd74d310e6314572dc6a411fcedad47c0c81657b2dc49b58219646767";

    const exchangeLockArgs = (new Blake2bHasher() as Hasher).update
      (
        new Reader(
          ExchangeLock.SerializeArgs({
            threshold: this.threshold,
            request_first_n: this.requestFirstN,
            multi_pubkey: multiPubKeyHash,
            single_pubkey: singlePubKeyHash,
          })
        ).toArrayBuffer()
      ).digest()
      .serializeJson()
      .slice(0, 42);
      console.log("exchangelockargs:" , exchangeLockArgs);

    blake.reset();

    console.log("args:" , new Reader(ExchangeLock.SerializeArgs({
      threshold: this.threshold,
      request_first_n: this.requestFirstN,
      multi_pubkey: multiPubKeyHash,
      single_pubkey: singlePubKeyHash,
    })).serializeJson());
    console.log("requestFirstN",this.requestFirstN);
    console.log("exchangelockargs:" + exchangeLockArgs);

    let exchangeLockScript = new Script(
      exchangeLockCodeHash,
      exchangeLockArgs,
      HashType.type
    );
    const exchangeLockScriptHash = new Reader(
      exchangeLockScript.toHash().slice(0, 42)
    );
    let fromAddr = Address.fromLockScript(exchangeLockScript);

    const timeLockCodeHash = "0x05e7342317bebee045b45808f1012fec22085680dac6560d1de05f8f68f7f031";
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

    const provider = new ExchangeLockProvider(
      fromAddr,
      singlePrivateKey,
      multiPrivateKey,
      threshold,
      requestFirstN,
      false,
    );
    this.signer = new ExchangeLockSigner(provider);
  }

  async send(): Promise<string> {
    const tx = await this.builder.build();

    tx.validate();
    let sign_tx = await this.signer.sign(tx);
    console.log(JSON.stringify(sign_tx, null, 2));

    let transform = transformers.TransformTransaction(sign_tx);
    // console.log(JSON.stringify(transform, null, 2));
    let txHash = this._rpc.send_transaction(transform);
    return txHash;
  }
}
