import { CellDep, OutPoint } from '@lay2/pw-core';
export declare const enum ROOT_ADDRESS {
    testnet = "ckt1qyqr9t744z3dah6udvfczvzflcyfrwur0qpsxdz3g9",
    mainnet = "ckb1qyqr9t744z3dah6udvfczvzflcyfrwur0qpsmguwye"
}
export declare const enum SCRIPT_PATH {
    ckb_lock_demo = "./script_builder/release/ckb_lock_demo",
    ckb_timelock = "./script_builder/release/ckb_timelock",
    secp256k1_blake2b_sighash_all_dual = "./secp256k1_blake2b_sighash_all_dual"
}
export declare enum CKBEnv {
    testnet = "testnet",
    mainnet = "mainnet",
    dev = "dev"
}
export declare function exportMoleculeTypes(): void;
export declare function transferAccount(): Promise<void>;
export declare function transferAccountForNFT(fromOutPoint: OutPoint, threshold: number, requestFirstN: number, singlePrivateKey: string, multiPrivateKey: Array<string>, env?: CKBEnv): Promise<void>;
export declare function getCellDataHash(txHash: string, index: string, env: CKBEnv): Promise<void>;
export declare enum CellDepType {
    secp256k1_dep_cell = 0,
    secp256k1_lib_dep_cell = 1,
    ckb_exchange_lock = 2,
    ckb_exchange_timelock = 3,
    nft_type = 4
}
export declare function getCellDep(env: CKBEnv, type: CellDepType): CellDep;
