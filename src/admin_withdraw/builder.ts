import PWCore, {
  Address,
  Amount,
  AmountUnit,
  Builder,
  Transaction,
  Cell,
  Collector,
  RawTransaction,
} from '@lay2/pw-core';

export class AdminWithdrawBuilder extends Builder {
  constructor(
    protected address: Address,
    protected amount: Amount,
    feeRate?: number,
    collector?: Collector
  ) {
    super(feeRate, collector);
  }
  async build(fee: Amount = Amount.ZERO): Promise<Transaction> {
    const outputCell = new Cell(this.amount, this.address.toLockScript());
    const neededAmount = this.amount
      .add(Builder.MIN_CHANGE)
      .add(Builder.MIN_CHANGE)
      .add(fee);
    let inputSum = new Amount('0');
    const inputCells: Cell[] = [];

    const cells = await this.collector.collect(PWCore.provider.address, {
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
      PWCore.provider.address.toLockScript()
    );

    const tx = new Transaction(
      new RawTransaction(
        inputCells,
        [outputCell, changeCell],
        [PWCore.config.defaultLock.cellDep]
      ),
      [Builder.WITNESS_ARGS.Secp256k1]
    );

    this.fee = Builder.calcFee(tx, this.feeRate);

    changeCell.capacity = changeCell.capacity.sub(this.fee);
    tx.raw.outputs.pop();
    tx.raw.outputs.push(changeCell);
    return tx;
  }
}
