import {
  Address,
  Amount,
  AmountUnit,
  Builder,
  Transaction,
  Cell,
  Collector,
  RawTransaction,
  WitnessArgs,
  IndexerCollector,
  CellDep,
  DepType,
  OutPoint,
  Reader,
} from '@lay2/pw-core';
import {DEV_CONFIG} from '../config';
import {devChainConfig} from '../deploy/deploy';
import {CellDepType, CKBEnv, getCellDep} from '../helpers';
import {TimeLock} from '../types/ckb-exchange-timelock';

export class TimeLockMultiTxBuilder extends Builder {
  constructor(
    private inputCell: Cell,
    private outputCell: Cell,
    private timeLock: TimeLock,
    private env: CKBEnv
  ) {
    super();
  }

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
          getCellDep(this.env, CellDepType.ckb_exchange_timelock),
          getCellDep(this.env, CellDepType.secp256k1_dep_cell),
          getCellDep(this.env, CellDepType.secp256k1_lib_dep_cell),
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
