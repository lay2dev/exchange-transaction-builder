import { Address, Amount, Cell, Collector, CollectorOptions } from '@lay2/pw-core';
export declare class NFTCollector extends Collector {
    private indexer;
    constructor(indexerUrl: string);
    collect(address: Address, options: CollectorOptions): Promise<Cell[]>;
    getBalance(address: Address): Promise<Amount>;
}
