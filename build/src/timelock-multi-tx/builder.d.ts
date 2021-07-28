import { Builder, Transaction, Cell, CellDep } from '@lay2/pw-core';
import { TimeLock } from '../types/ckb-exchange-timelock';
/**
 * Builder for `ExchangeTimeLocMultiTx`
 */
export declare class TimeLockMultiTxBuilder extends Builder {
    inputCell: Cell;
    outputCell: Cell;
    timeLock: TimeLock;
    cellDeps: CellDep[];
    constructor(inputCell: Cell, outputCell: Cell, timeLock: TimeLock, cellDeps: CellDep[]);
    /**
     * Build ExchangeTimeLocMultiTx
     * @returns ExchangeTimeLocMultiTx
     */
    build(): Promise<Transaction>;
}
