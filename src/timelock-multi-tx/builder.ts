import {
  Builder,
  Transaction,
  Cell,
  RawTransaction,
  Reader,
  CellDep,
} from '@lay2/pw-core';
import {CellDepType, CKBEnv, getCellDep} from '../helpers';
import {TimeLock} from '../types/ckb-exchange-timelock';

/**
 * Builder for `ExchangeTimeLocMultiTx`
 */
export class TimeLockMultiTxBuilder extends Builder {
  constructor(
    public inputCell: Cell,
    public outputCell: Cell,
    public timeLock: TimeLock,
    public cellDeps: CellDep[]
  ) {
    super();
  }

  /**
   * Build ExchangeTimeLocMultiTx
   * @returns ExchangeTimeLocMultiTx
   */
  async build(): Promise<Transaction> {
    for (let _i in this.timeLock.args.multi_pubkey) {
      this.timeLock.signature.push(new Reader('0x' + '0'.repeat(130)));
    }
    const calWitnessArgs = {
      lock: this.timeLock.serialize().serializeJson(),
      input_type: '',
      output_type: '',
    };
    let calTx = new Transaction(
      new RawTransaction(
        [this.inputCell],
        [this.outputCell],
        this.cellDeps
      ),
      [calWitnessArgs]
    );

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

    tx.raw.outputs[0].capacity = tx.raw.outputs[0].capacity.sub(fee);

    return tx;
  }
}
