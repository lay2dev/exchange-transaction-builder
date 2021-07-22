import {
  Builder,
  Transaction,
  Cell,
  RawTransaction,
  Reader,
} from '@lay2/pw-core';
import { CellDepType, CKBEnv, getCellDep } from '../helpers';
import { TimeLock } from '../types/ckb-exchange-timelock';

/**
 * Builder for `ExchangeTimeLocSingleTx`
 */
export class TimeLockSingleTxBuilder extends Builder {
  constructor(
    private inputCell: Cell,
    private outputCell: Cell,
    private timeLock: TimeLock,
    private env:CKBEnv,
  ) {
    super();
  }

  /**
   * Build ExchangeTimeLocSingleTx
   * @returns ExchangeTimeLocSingleTx
   */
  async build(): Promise<Transaction> {
    this.timeLock.signature = [new Reader("0x" + "0".repeat(130))];
    const calWitnessArgs = {
      lock: this.timeLock.serialize().serializeJson(),
      input_type: '',
      output_type: '',
    };
    let calTx = new Transaction(
      new RawTransaction(
        [this.inputCell],
        [this.outputCell],
        [
          getCellDep(this.env,CellDepType.ckb_exchange_timelock),
          getCellDep(this.env,CellDepType.secp256k1_dep_cell),
          getCellDep(this.env,CellDepType.secp256k1_lib_dep_cell),
          getCellDep(this.env,CellDepType.nft_type),
        ]
      ),
      [calWitnessArgs]
    );
    for (let i in calTx.raw.inputs) {
      calTx.raw.inputs[i].since = '0x8000000000000064';
    }
    const fee = Builder.calcFee(calTx, this.feeRate);
    
    this.timeLock.signature = [];
    const witnessArgs = {
      lock: this.timeLock.serialize().serializeJson(),
      input_type: '',
      output_type: '',
    };
    const tx = new Transaction(
      new RawTransaction(
        [this.inputCell],
        [this.outputCell],
        [
          getCellDep(this.env,CellDepType.ckb_exchange_timelock),
          getCellDep(this.env,CellDepType.secp256k1_dep_cell),
          getCellDep(this.env,CellDepType.secp256k1_lib_dep_cell),
          getCellDep(this.env,CellDepType.nft_type),
        ]
      ),
      [witnessArgs]
    );
    for (let i in tx.raw.inputs) {
      tx.raw.inputs[i].since = '0x8000000000000064';
    }
    tx.raw.outputs[0].capacity = tx.raw.outputs[0].capacity.sub(fee);

    return tx;
  }
}
