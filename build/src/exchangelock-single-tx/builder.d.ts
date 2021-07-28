import { Builder, Transaction, Cell, CellDep } from '@lay2/pw-core';
import { ExchangeLock } from '../types/ckb-exchange-lock';
/**
 * Builder for `ExchangeLockSingleTx`
 */
export declare class ExchangeLockSingleTxBuilder extends Builder {
    inputCell: Cell;
    outputCell: Cell;
    exchangeLock: ExchangeLock;
    cellDeps: CellDep[];
    constructor(inputCell: Cell, outputCell: Cell, exchangeLock: ExchangeLock, cellDeps: CellDep[]);
    /**
     * Build ExchangeLockSingleTx
     * @returns ExchangeLockSingleTx
     */
    build(): Promise<Transaction>;
}
