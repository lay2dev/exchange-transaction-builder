import  {
  Address,
  Amount,
  AmountUnit,
  Builder,
  Transaction,
  Cell,
  RawTransaction,
  SerializeCellInput,
  Blake2bHasher,
  HashType,
  Script,
  BuilderOption,
  Reader,
  normalizers,
  CellInput,
  Hasher,
  transformers,
  Collector,
  WitnessArgs,
  OutPoint,
  RPC,
} from '@lay2/pw-core';
import {DEV_CONFIG, SYSTEM_TYPE_ID, TESTNET_CONFIG} from '../config';
import { CKBEnv } from '../helpers';
import { devChainConfig } from './deploy';

export class DeployBuilderOption implements BuilderOption {
  constructor(
    public feeRate?: number,
    public collector?: Collector,
    public witnessArgs?: WitnessArgs,
    public data?: string,
    public txHash?: string,
    public index?: string
  ) {}
}

export default class DeployBuilder extends Builder {
  // private _pwCore: PWCore;
  private rpc: RPC;
  constructor(
    private env:CKBEnv,
    private fromAddr: Address,
    private toAddr: Address,
    protected options: DeployBuilderOption = {}
  ) {
    super(options.feeRate, options.collector, options.witnessArgs);
    const nodeUrl = this.env == CKBEnv.dev ? DEV_CONFIG.ckb_url : TESTNET_CONFIG.ckb_url;
    this.rpc = new RPC(nodeUrl);
    // this._pwCore = new PWCore(CKB_URL);
  }

  private newOutputCell(): Cell {
    let outputCell = new Cell(
      new Amount('12600000000'),
      this.toAddr.toLockScript(),
      new Script(SYSTEM_TYPE_ID, '0x' + '0'.repeat(64), HashType.type)
    );
    if (this.options.data) {
      if (this.options.data.startsWith('0x')) {
        outputCell.setHexData(this.options.data);
      } else {
        outputCell.setData(this.options.data);
      }
    }
    let amount = outputCell.occupiedCapacity();
    outputCell.capacity = amount;
    return outputCell;
  }

  private async collectInputCell(
    neededAmount: Amount,
    inputCells: Array<Cell>,
    inputSum: Amount
  ): Promise<[Array<Cell>, Amount]> {
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
    return [inputCells, inputSum];
  }

  async build(fee: Amount = Amount.ZERO): Promise<Transaction> {
    const outputCell = this.newOutputCell();

    let neededAmount = outputCell.capacity
      .add(Builder.MIN_CHANGE)
      .add(Builder.MIN_CHANGE)
      .add(fee);
    let inputSum = new Amount('0');
    let inputCells: Cell[] = [];

    if (this.options.txHash && this.options.index) {
      let firstCell = await Cell.loadFromBlockchain(
        this.rpc,
        new OutPoint(this.options.txHash, this.options.index)
      );
      inputCells.push(firstCell);
      inputSum = inputSum.add(firstCell.capacity);
      outputCell.type = firstCell.type;
      outputCell.lock = firstCell.lock;

      [inputCells, inputSum] = await this.collectInputCell(
        neededAmount.sub(inputSum),
        inputCells,
        inputSum
      );
    } else {
      [inputCells, inputSum] = await this.collectInputCell(
        neededAmount,
        inputCells,
        inputSum
      );

      const firstInput = new Reader(
        SerializeCellInput(
          normalizers.NormalizeCellInput(
            transformers.TransformCellInput(
              inputCells[0].toCellInput() as CellInput
            )
          )
        )
      );
      const blake: Hasher = new Blake2bHasher();
      blake.update(firstInput);
      blake.update(new Reader('0x0000000000000000'));
      const args = blake.digest().serializeJson();
      outputCell.type = new Script(SYSTEM_TYPE_ID, args, HashType.type);
    }
    const changeCell = new Cell(
      inputSum.sub(outputCell.capacity),
      this.fromAddr.toLockScript()
    );

    const tx = new Transaction(
      new RawTransaction(
        inputCells,
        [outputCell, changeCell],
        [devChainConfig.defaultLock.cellDep]
      ),
      [Builder.WITNESS_ARGS.RawSecp256k1]
    );

    this.fee = Builder.calcFee(tx, this.feeRate);

    changeCell.capacity = changeCell.capacity.sub(this.fee);
    tx.raw.outputs.pop();
    tx.raw.outputs.push(changeCell);
    return tx;
  }
}
