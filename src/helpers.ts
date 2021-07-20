import PWCore, {
  Address,
  AddressType,
  Amount,
  AmountUnit,
  Blake2bHasher,
  Builder,
  Cell,
  CellDep,
  ChainID,
  DepType,
  HashType,
  IndexerCollector,
  OutPoint,
  RawProvider,
  Reader,
  RPC,
  Script,
} from '@lay2/pw-core';
import {exec} from 'child_process';
import {readdir, readFileSync} from 'fs';
import {ACCOUNT_PRIVATE_KEY, DEV_CONFIG, TESTNET_CONFIG} from './config';
import {devChainConfig} from './deploy/deploy';
import {ExchangeLockAddr} from './exchange-lock';

export const enum ROOT_ADDRESS {
  testnet = 'ckt1qyqr9t744z3dah6udvfczvzflcyfrwur0qpsxdz3g9',
  mainnet = 'ckb1qyqr9t744z3dah6udvfczvzflcyfrwur0qpsmguwye',
}

export const enum SCRIPT_PATH {
  ckb_lock_demo = './script_builder/release/ckb_lock_demo',
  ckb_timelock = './script_builder/release/ckb_timelock',
  secp256k1_blake2b_sighash_all_dual = './secp256k1_blake2b_sighash_all_dual',
}

export enum CKBEnv {
  testnet = 'testnet',
  mainnet = 'mainnet',
  dev = 'dev',
}

export function exportMoleculeTypes() {
  readdir('./schemas', function (err, files) {
    if (err) {
      throw new Error(err.message);
    }
    files.forEach(function (file) {
      const fileJson = file.replace(/\_/g, '-').replace('mol', 'json');
      const fileJs = file.replace(/\_/g, '-').replace('mol', 'js');
      exec(
        'moleculec --language - --schema-file ./schemas/' +
          file +
          ' --format json > ./schemas-json/' +
          fileJson,
        function (error, stdout, stderr) {
          if (error) {
            throw new Error('error:' + error);
          }
          if (stderr) {
            throw new Error('stderr:' + stderr);
          }
        }
      );
      exec(
        'moleculec-es -inputFile ./schemas-json/' +
          fileJson +
          ' -outputFile src/schemas-types/' +
          fileJs,
        function (error, stdout, stderr) {
          if (error) {
            throw new Error('error:' + error);
          }
          if (stderr) {
            throw new Error('stderr:' + stderr);
          }
        }
      );
    });
  });
}

export async function transferAccount() {
  // init `RawProvider` with private key
  const privateKey = ACCOUNT_PRIVATE_KEY[0];
  const provider = new RawProvider(privateKey);
  const collector = new IndexerCollector(DEV_CONFIG.indexer_url);
  const pwcore = await new PWCore(DEV_CONFIG.ckb_url).init(
    provider,
    collector,
    ChainID.ckb_dev,
    devChainConfig
  );

  // get address
  console.dir(provider.address, {depth: null});

  // // get balance
  // const balance = await collector.getBalance(provider.address);
  // console.log(`balance: ${balance}`);

  // for ckb system lock script, its length of witness lock is 65 bytes, use RawScep256K1 here.
  const options = {witnessArgs: Builder.WITNESS_ARGS.RawSecp256k1};
  // transfer
  const exchangeLockAddr = new ExchangeLockAddr(
    3,
    1,
    ACCOUNT_PRIVATE_KEY[0],
    ACCOUNT_PRIVATE_KEY
  );
  const toAddr = exchangeLockAddr.address;
  console.log(toAddr);

  // const fromBefore = await collector.getBalance(provider.address);
  // const toBefore = await collector.getBalance(toAddr);
  // The amount should be more than 61 CKB, unless the toAddr is acp address and there is already cell to receive CKB
  const txHash = await pwcore.send(
    toAddr,
    new Amount('100000', AmountUnit.ckb),
    options
  );
  console.log(txHash);
}

export async function getCellDataHash(
  txHash: string,
  index: string,
  env: CKBEnv
) {
  const nodeUrl =
    env === CKBEnv.dev ? DEV_CONFIG.ckb_url : TESTNET_CONFIG.ckb_url;
  const rpc = new RPC(nodeUrl);
  const cell = await Cell.loadFromBlockchain(rpc, new OutPoint(txHash, index));

  console.log('cell.data.length', new Reader(cell.getHexData()).length());

  const dataHash = new Blake2bHasher()
    .hash(new Reader(cell.getHexData()))
    .serializeJson();

  console.log('cell.dataHash', dataHash);
  console.log('cell.typeHash', cell.type?.toHash());
  console.log('cell.lockHahs', cell.lock.codeHash);
}

export enum CellDepType {
  secp256k1_dep_cell,
  secp256k1_lib_dep_cell,
  ckb_exchange_lock,
  ckb_exchange_timelock,
}
export function getCellDep(env: CKBEnv, type: CellDepType): CellDep {
  switch (env) {
    case CKBEnv.dev:
      switch (type) {
        case CellDepType.secp256k1_dep_cell:
          return new CellDep(
            DepType.depGroup,
            new OutPoint(
              DEV_CONFIG.secp256k1_dep_cell.txHash,
              DEV_CONFIG.secp256k1_dep_cell.outputIndex
            )
          );
        case CellDepType.secp256k1_lib_dep_cell:
          return new CellDep(
            DepType.code,
            new OutPoint(
              DEV_CONFIG.secp256k1_lib_dep_cell.txHash,
              DEV_CONFIG.secp256k1_lib_dep_cell.outputIndex
            )
          );
        case CellDepType.ckb_exchange_lock:
          return new CellDep(
            DepType.code,
            new OutPoint(
              DEV_CONFIG.ckb_exchange_lock.txHash,
              DEV_CONFIG.ckb_exchange_lock.outputIndex
            )
          );
        case CellDepType.ckb_exchange_timelock:
          return new CellDep(
            DepType.code,
            new OutPoint(
              DEV_CONFIG.ckb_exchange_timelock.txHash,
              DEV_CONFIG.ckb_exchange_timelock.outputIndex
            )
          );
        default:
          throw new Error('invalid cell dep type');
      }
    case CKBEnv.testnet:
      switch (type) {
        case CellDepType.secp256k1_dep_cell:
          return new CellDep(
            DepType.depGroup,
            new OutPoint(
              TESTNET_CONFIG.secp256k1_dep_cell.txHash,
              TESTNET_CONFIG.secp256k1_dep_cell.outputIndex
            )
          );
        case CellDepType.secp256k1_lib_dep_cell:
          return new CellDep(
            DepType.code,
            new OutPoint(
              TESTNET_CONFIG.secp256k1_lib_dep_cell.txHash,
              TESTNET_CONFIG.secp256k1_lib_dep_cell.outputIndex
            )
          );
        case CellDepType.ckb_exchange_lock:
          return new CellDep(
            DepType.code,
            new OutPoint(
              TESTNET_CONFIG.ckb_exchange_lock.txHash,
              TESTNET_CONFIG.ckb_exchange_lock.outputIndex
            )
          );
        case CellDepType.ckb_exchange_timelock:
          return new CellDep(
            DepType.code,
            new OutPoint(
              TESTNET_CONFIG.ckb_exchange_timelock.txHash,
              TESTNET_CONFIG.ckb_exchange_timelock.outputIndex
            )
          );
        default:
          throw new Error('invalid cell dep type');
      }
    default:
      throw new Error('invalid ckb env');
  }
}
