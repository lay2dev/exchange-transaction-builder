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
} from '@lay2/pw-core';
import {
  CKB_EXCHANGE_LOCK,
  CKB_EXCHANGE_TIMELOCK,
  INDEXER_DEV_URL,
  SECP256K1_DEP_CELL,
} from '../config';
import {devChainConfig} from '../deploy/deploy';

export class TimeLockMultiTxBuilder extends Builder {
  constructor(
    private fromAddr: Address,
    private toAddr: Address,
    protected fee: Amount = Amount.ZERO,
    private amount: Amount,
    protected witnessArgs: WitnessArgs,
    feeRate: number = Builder.MIN_FEE_RATE,
    collector: Collector = new IndexerCollector(INDEXER_DEV_URL)
  ) {
    super(feeRate, collector, witnessArgs);
  }

  async build(): Promise<Transaction> {
    const outputCell = new Cell(this.amount, this.toAddr.toLockScript());

    const neededAmount = this.amount.add(Builder.MIN_CHANGE).add(this.fee);
    let inputSum = new Amount('0');
    const inputCells: Cell[] = [];

    console.log(this.fromAddr);

    const cells = await this.collector.collect(this.fromAddr, {
      neededAmount,
    });

    for (const cell of cells) {
      inputCells.push(cell);
      inputSum = inputSum.add(cell.capacity);
      if (inputSum.gte(neededAmount)) break;
    }

    if (inputSum.lt(neededAmount)) {
      throw new Error(
        `input capacity not enough,need ${neededAmount.toString(
          AmountUnit.ckb
        )},got ${inputSum.toString(AmountUnit.ckb)}`
      );
    }

    const changeCell = new Cell(
      inputSum.sub(outputCell.capacity),
      this.fromAddr.toLockScript()
    );

    let rawTx = new RawTransaction(
      inputCells,
      [outputCell, changeCell],
      [
        new CellDep(
          DepType.code,
          new OutPoint(CKB_EXCHANGE_LOCK.txHash, CKB_EXCHANGE_LOCK.outputIndex)
        ),
        new CellDep(
          DepType.code,
          new OutPoint(CKB_EXCHANGE_TIMELOCK.txHash, CKB_EXCHANGE_TIMELOCK.outputIndex)
        ),
        new CellDep(
          DepType.code,
          new OutPoint(SECP256K1_DEP_CELL.txHash, SECP256K1_DEP_CELL.outputIndex)
        ),
        devChainConfig.defaultLock.cellDep,
      ]
    );

    const tx = new Transaction(rawTx, [this.witnessArgs]);

    this.fee = Builder.calcFee(tx, this.feeRate).add(
      new Amount('1000', AmountUnit.shannon)
    );

    changeCell.capacity = changeCell.capacity.sub(this.fee);
    tx.raw.outputs.pop();
    tx.raw.outputs.push(changeCell);
    return tx;
  }
}
