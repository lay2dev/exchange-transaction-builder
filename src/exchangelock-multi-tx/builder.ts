import {
  Builder,
  Transaction,
  Cell,
  RawTransaction,
  Reader,
  CellDep,
} from '@lay2/pw-core';
import {ExchangeLock} from '../types/ckb-exchange-lock';

/**
 * Builder for `ExchangeLockMultiTx`
 */
export class ExchangeLockMultiTxBuilder extends Builder {
  constructor(
    public inputCell: Cell,
    public outputCell: Cell,
    public exchangeLock: ExchangeLock,
    public cellDeps: CellDep[]
  ) {
    super();
  }
  /**
   * Build ExchangeLockMultiTx
   * @returns ExchangeLockMultiTx
   */
  async build(): Promise<Transaction> {
    for (let _i in this.exchangeLock.args.multi_pubkey) {
      this.exchangeLock.signature.push(new Reader('0x' + '0'.repeat(130)));
    }
    const calWitnessArgs = {
      lock: this.exchangeLock.serialize().serializeJson(),
      input_type: '',
      output_type: '',
    };
    const calTx = new Transaction(
      new RawTransaction([this.inputCell], [this.outputCell], this.cellDeps),
      [calWitnessArgs]
    );

    const fee = Builder.calcFee(calTx, this.feeRate);

    this.exchangeLock.signature = [];
    const witnessArgs = {
      lock: this.exchangeLock.serialize().serializeJson(),
      input_type: '',
      output_type: '',
    };
    const tx = new Transaction(
      new RawTransaction([this.inputCell], [this.outputCell], this.cellDeps),
      [witnessArgs]
    );
    tx.raw.outputs[0].capacity = tx.raw.outputs[0].capacity.sub(fee);

    return tx;
  }
}
