import { Address, Amount, Builder, Transaction, BuilderOption } from '@lay2/pw-core';
export declare class DeployBuilder extends Builder {
    private address;
    private amount;
    private withType?;
    protected options: BuilderOption;
    readonly SYSTEM_TYPE_ID = "0x00000000000000000000000000000000000000000000000000545950455f4944";
    constructor(address: Address, amount: Amount, withType?: boolean | undefined, options?: BuilderOption);
    build(fee?: Amount): Promise<Transaction>;
}
