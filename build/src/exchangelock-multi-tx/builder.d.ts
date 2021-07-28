import { Builder, Transaction, Cell, CellDep } from '@lay2/pw-core';
import { ExchangeLock } from '../types/ckb-exchange-lock';
/**
 * Builder for `ExchangeLockMultiTx`
 */
export declare class ExchangeLockMultiTxBuilder extends Builder {
    inputCell: Cell;
    outputCell: Cell;
    exchangeLock: ExchangeLock;
    cellDeps: CellDep[];
    constructor(inputCell: Cell, outputCell: Cell, exchangeLock: ExchangeLock, cellDeps: CellDep[]);
    /**
     * Build ExchangeLockMultiTx
     * @returns ExchangeLockMultiTx
     */
    build(): Promise<Transaction>;
}
