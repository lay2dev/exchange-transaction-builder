import PWCore, {
  Address,
  Amount,
  AmountUnit,
  Builder,
  Transaction,
  Cell,
  Collector,
  RawTransaction,
  Script,
  Blake2bHasher,
  Reader,
  HashType,
  Provider,
  RawProvider,
  WitnessArgs,
  SUDTCollector,
  IndexerCollector,
  CellDep,
  DepType,
  OutPoint,
} from '@lay2/pw-core';
import {readFile} from 'fs/promises';
import { INDEXER_DEV_URL } from '../config';
import { devChainConfig } from '../deploy/deploy';
import * as ExchangeLock from '../schemas-types/ckb-lock-demo-type';
import * as TimeLock from '../schemas-types/ckb-timelock';

export class TimeLockFromExchangeLockBuilder extends Builder {
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

    const neededAmount = this.amount
      .add(Builder.MIN_CHANGE)
      .add(Builder.MIN_CHANGE)
      .add(this.fee);
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

    const tx = new Transaction(
      new RawTransaction(
        inputCells,
        [outputCell, changeCell],
        [
          new CellDep(
            DepType.code,
            new OutPoint(
              '0x3222781a4604885e40393c15b2f441abc946a90057973738853291722f1585ce',
              '0x0'
            )
          ),
          new CellDep(
            DepType.code,
            new OutPoint(
              '0xd9fbf9d9a26243bb8245e1c637cea854af1331a1836e072cac214a7fc053dd9b',
              '0x0'
            )
          ),
          new CellDep(
            DepType.code,
            new OutPoint(
              '0x65a0d1f5a318138e9a8763d4fb960e7b5f999ac9323f372edde788b8e92a3392',
              '0x0'
            )
          ),
          devChainConfig.defaultLock.cellDep,
        ]
      ),
      [this.witnessArgs]
    );

    this.fee = Builder.calcFee(tx, this.feeRate).add(new Amount("1000",AmountUnit.shannon));

    changeCell.capacity = changeCell.capacity.sub(this.fee);
    tx.raw.outputs.pop();
    tx.raw.outputs.push(changeCell);
    return tx;
  }
}
