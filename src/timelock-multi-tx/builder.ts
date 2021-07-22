import {
  Builder,
  Transaction,
  Cell,
  RawTransaction,
  Reader,
} from '@lay2/pw-core';
import {CellDepType, CKBEnv, getCellDep} from '../helpers';
import {TimeLock} from '../types/ckb-exchange-timelock';

/**
 * Builder for `ExchangeTimeLocMultiTx`
 */
export class TimeLockMultiTxBuilder extends Builder {
  constructor(
    private inputCell: Cell,
    private outputCell: Cell,
    private timeLock: TimeLock,
    private env: CKBEnv
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
        [
          getCellDep(this.env, CellDepType.ckb_exchange_timelock),
          getCellDep(this.env, CellDepType.secp256k1_dep_cell),
          getCellDep(this.env, CellDepType.secp256k1_lib_dep_cell),
          getCellDep(this.env,CellDepType.nft_type),
        ]
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
        [
          getCellDep(this.env, CellDepType.ckb_exchange_timelock),
          getCellDep(this.env, CellDepType.secp256k1_dep_cell),
          getCellDep(this.env, CellDepType.secp256k1_lib_dep_cell),
          getCellDep(this.env,CellDepType.nft_type),
        ]
      ),
      [witnessArgs]
    );

    tx.raw.outputs[0].capacity = tx.raw.outputs[0].capacity.sub(fee);

    return tx;
  }
}
