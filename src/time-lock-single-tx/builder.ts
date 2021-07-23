import {
  Builder,
  Transaction,
  Cell,
  RawTransaction,
  Reader,
  CellDep,
} from '@lay2/pw-core';
import { TimeLock } from '../types/ckb-exchange-timelock';

/**
 * Builder for `ExchangeTimeLocSingleTx`
 */
export class TimeLockSingleTxBuilder extends Builder {
  constructor(
    public inputCell: Cell,
    public outputCell: Cell,
    public timeLock: TimeLock,
    public cellDeps:CellDep[],
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
        this.cellDeps,
      ),
      [calWitnessArgs]
    );
    for (let i in calTx.raw.inputs) {
      calTx.raw.inputs[i].since = '0xc00000000000003c';
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
        this.cellDeps
      ),
      [witnessArgs]
    );
    for (let i in tx.raw.inputs) {
      tx.raw.inputs[i].since = '0xc00000000000003c';
    }
    tx.raw.outputs[0].capacity = tx.raw.outputs[0].capacity.sub(fee);

    return tx;
  }
}
