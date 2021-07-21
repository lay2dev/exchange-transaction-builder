import {
  Builder,
  Transaction,
  Cell,
  RawTransaction,
  WitnessArgs,
  OutPoint,
  RPC,
  Script,
  Reader,
} from '@lay2/pw-core';
import {CellDepType, CKBEnv, getCellDep} from '../helpers';
import { ExchangeLock } from '../types/ckb-exchange-lock';

export class ExchangeLockMultiTxBuilder extends Builder {
  constructor(
    private inputCell: Cell,
    private outputCell: Cell,
    protected exchangeLock: ExchangeLock,
    private env: CKBEnv
  ) {
    super();
  }

  async build(): Promise<Transaction> {
    for (let _i in this.exchangeLock.args.multi_pubkey){
      this.exchangeLock.signature.push(new Reader('0x' + '0'.repeat(130)));
    }
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
          getCellDep(this.env, CellDepType.ckb_exchange_lock),
          getCellDep(this.env, CellDepType.secp256k1_dep_cell),
          getCellDep(this.env, CellDepType.secp256k1_lib_dep_cell),
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
          getCellDep(this.env, CellDepType.ckb_exchange_lock),
          getCellDep(this.env, CellDepType.secp256k1_dep_cell),
          getCellDep(this.env, CellDepType.secp256k1_lib_dep_cell),
        ]
      ),
      [witnessArgs]
    );
    tx.raw.outputs[0].capacity = tx.raw.outputs[0].capacity.sub(fee);

    return tx;
  }
}
