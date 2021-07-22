import {
  Builder,
  Transaction,
  Cell,
  RawTransaction,
  Reader,
} from '@lay2/pw-core';

import { CellDepType, CKBEnv, getCellDep } from '../helpers';
import { ExchangeLock } from '../types/ckb-exchange-lock';

/**
 * Builder for `ExchangeLockSingleTx`
 */
export class ExchangeLockSingleTxBuilder extends Builder {
  constructor(
    private inputCell: Cell,
    private outputCell: Cell,
    private exchangeLock: ExchangeLock,
    private env:CKBEnv,
    ) {
    super();
  }

  /**
   * Build ExchangeLockSingleTx
   * @returns ExchangeLockSingleTx
   */
  async build(): Promise<Transaction> {
    this.exchangeLock.signature = [new Reader("0x" + "0".repeat(130))];
    const calWitnessArgs = {
      lock: this.exchangeLock.serialize().serializeJson(),
      input_type: '',
      output_type: '',
    };
    const calTx = new Transaction(
      new RawTransaction(
        [this.inputCell],
        [this.outputCell],
        [
          getCellDep(this.env,CellDepType.ckb_exchange_lock),
          getCellDep(this.env,CellDepType.secp256k1_dep_cell),
          getCellDep(this.env,CellDepType.secp256k1_lib_dep_cell),
          getCellDep(this.env,CellDepType.nft_type),
        ]
      ),
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
      new RawTransaction(
        [this.inputCell],
        [this.outputCell],
        [
          getCellDep(this.env,CellDepType.ckb_exchange_lock),
          getCellDep(this.env,CellDepType.secp256k1_dep_cell),
          getCellDep(this.env,CellDepType.secp256k1_lib_dep_cell),
          getCellDep(this.env,CellDepType.nft_type),
        ]
      ),
      [witnessArgs]
    );
    tx.raw.outputs[0].capacity = tx.raw.outputs[0].capacity.sub(fee);

    return tx;
  }
}
