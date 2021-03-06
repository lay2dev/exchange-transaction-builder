import {Address, Blake2bHasher, HashType, Reader, Script} from '@lay2/pw-core';
import { RunningConfig } from '..';
import {TimeLockArgs} from '../types/ckb-exchange-timelock';

/**
 * Address whose lock script is `ExchangeLock`
 */
export class ExchangeTimeLockAddr {
  public address: Address;
  /**
   * 
   * @param threshold 
   * @param requestFirstN The `threshole` from `ExchangeLock`'s multiple signature 
   * @param singlePubKey The public key for `ExchagneLock`'s single signature
   * @param multiPubKey The private keys for `ExchangeLock`'s multiple signature
   * @param outputHash The output `cell`'s `LockScript` hash should match when single signature
   */
  constructor(
    threshold: number,
    requestFirstN: number,
    singlePubKey: string,
    multiPubKey: Array<string>,
    outputHash:string,
    config:RunningConfig,
  ) {
    let multiPubKeyHash = [];
    for (let pubKey of multiPubKey) {
      multiPubKeyHash.push(
        new Reader(
          new Blake2bHasher()
            .hash(new Reader(pubKey))
            .toArrayBuffer()
            .slice(0, 20)
        )
      );
    }

    const singlePubKeyHash = new Reader(
      new Blake2bHasher()
        .hash(new Reader(singlePubKey))
        .toArrayBuffer()
        .slice(0, 20)
    );

    const exchangeLockCodeHash = config.ckbExchangeLock.typeHash;

    const timeLockArgs = new TimeLockArgs(
      threshold,
      requestFirstN,
      multiPubKeyHash,
      singlePubKeyHash,
      new Reader(outputHash),
    );

    let exchangeLockScript = new Script(
      exchangeLockCodeHash,
      new Blake2bHasher().hash(timeLockArgs.serialize()).serializeJson().slice(0,42),
      HashType.type
    );
    let addr = Address.fromLockScript(exchangeLockScript);
    this.address = addr;
  }
}
