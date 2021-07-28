import { Builder, Transaction, Cell, CellDep } from '@lay2/pw-core';
import { TimeLock } from '../types/ckb-exchange-timelock';
/**
 * Builder for `ExchangeTimeLocSingleTx`
 */
export declare class TimeLockSingleTxBuilder extends Builder {
    inputCell: Cell;
    outputCell: Cell;
    timeLock: TimeLock;
    cellDeps: CellDep[];
    constructor(inputCell: Cell, outputCell: Cell, timeLock: TimeLock, cellDeps: CellDep[]);
    /**
     * Build ExchangeTimeLocSingleTx
     * @returns ExchangeTimeLocSingleTx
     */
    build(): Promise<Transaction>;
}
