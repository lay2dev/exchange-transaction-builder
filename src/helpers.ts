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
  RawTransaction,
  Reader,
  RPC,
  Script,
  Transaction,
  transformers,
} from '@lay2/pw-core';
import {exec} from 'child_process';
import {readdir, readFileSync} from 'fs';

import {devChainConfig} from './deploy/deploy';
import {ExchangeLockAddr} from './exchange-lock';
import ECPair from '@nervosnetwork/ckb-sdk-utils/lib/ecpair';
import {ExchangeLock, ExchangeLockArgs} from './types/ckb-exchange-lock';
import {DefaultSigner} from './signer/default-signer';
import { CONFIG } from './config-inner';

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
  const privateKey = CONFIG.rootPrivateKey
  const provider = new RawProvider(privateKey);
  const collector = new IndexerCollector(CONFIG.devConfig.indexerUrl);
  const pwcore = await new PWCore(CONFIG.devConfig.ckbUrl).init(
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
    CONFIG.accountPrivateKey[0],
    CONFIG.accountPrivateKey
  );
  const toAddr = exchangeLockAddr.address;

  // const fromBefore = await collector.getBalance(provider.address);
  // const toBefore = await collector.getBalance(toAddr);
  // The amount should be more than 61 CKB, unless the toAddr is acp address and there is already cell to receive CKB
  const txHash = await pwcore.send(
    toAddr,
    new Amount('100000', AmountUnit.ckb),
    options
  );
  console.log("toAddresScript:",toAddr.toLockScript());
  console.log("toAddr:",toAddr);
  console.log(txHash);
}

export async function transferAccountForNFT(
  fromOutPoint: OutPoint,
  threshold: number,
  requestFirstN: number,
  singlePrivateKey: string,
  multiPrivateKey: Array<string>,
  env: CKBEnv = CKBEnv.testnet
) {
  const nodeUrl =
    env == CKBEnv.dev ? CONFIG.devConfig.ckbUrl : CONFIG.testnetConfig.ckbUrl;
  const rpc = new RPC(nodeUrl);

  let multiKeyPair = [];
  let multiPubKeyHash = [];
  for (let privateKey of multiPrivateKey) {
    let keyPair = new ECPair(privateKey);
    multiKeyPair.push(keyPair);
    multiPubKeyHash.push(
      new Reader(
        new Blake2bHasher()
          .hash(new Reader(keyPair.publicKey))
          .toArrayBuffer()
          .slice(0, 20)
      )
    );
  }

  const singleKeyPair = new ECPair(singlePrivateKey);
  const singlePubKeyHash = new Reader(
    new Blake2bHasher()
      .hash(new Reader(singleKeyPair.publicKey))
      .toArrayBuffer()
      .slice(0, 20)
  );

  const exchangeLock = new ExchangeLock(
    new ExchangeLockArgs(
      threshold,
      requestFirstN,
      singlePubKeyHash,
      multiPubKeyHash
    ),
    0,
    []
  );

  const exchangeLockArgs = new Blake2bHasher()
    .hash(exchangeLock.args.serialize())
    .serializeJson()
    .slice(0, 42);

  const lockTypeHash = env == CKBEnv.dev ? CONFIG.devConfig.ckbExchangeLock.typeHash : CONFIG.testnetConfig.ckbExchangeLock.typeHash;
  let exchangeLockScript = new Script(
    lockTypeHash,
    exchangeLockArgs,
    HashType.type
  );

  const inputCell = await Cell.loadFromBlockchain(rpc, fromOutPoint);
  let outputCell = inputCell.clone();
  outputCell.lock = exchangeLockScript;
  const signer = new DefaultSigner(
    new Blake2bHasher(),
    CONFIG.rootPrivateKey,
    inputCell.lock.toHash()
  );

  const witnessArgs = {
    lock: new Reader('0x' + '0'.repeat(130)).serializeJson(),
    input_type: '',
    output_type: '',
  };

  const tx = new Transaction(
    new RawTransaction(
      [inputCell],
      [outputCell],
      [
        getCellDep(env, CellDepType.secp256k1_dep_cell),
        getCellDep(env, CellDepType.secp256k1_lib_dep_cell),
        getCellDep(env, CellDepType.nft_type),
      ]
    ),
    [witnessArgs]
  );

  const fee = Builder.calcFee(tx, Builder.MIN_FEE_RATE);
  tx.raw.outputs[0].capacity = tx.raw.outputs[0].capacity.sub(fee);
  let sign_tx = await signer.sign(tx);
  console.log(JSON.stringify(sign_tx, null, 2));
  sign_tx = sign_tx.validate();

  let transform = transformers.TransformTransaction(sign_tx);
  let txHash = await rpc.send_transaction(transform);
  console.log("txHash:",txHash);
}

export async function getCellDataHash(
  txHash: string,
  index: string,
  env: CKBEnv
) {
  const nodeUrl =
    env === CKBEnv.dev ? CONFIG.devConfig.ckbUrl : CONFIG.testnetConfig.ckbUrl;
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
  nft_type,
}
export function getCellDep(env: CKBEnv, type: CellDepType): CellDep {
  switch (env) {
    case CKBEnv.dev:
      switch (type) {
        case CellDepType.secp256k1_dep_cell:
          return new CellDep(
            DepType.depGroup,
            new OutPoint(
              CONFIG.devConfig.secp256k1DepCell.txHash,
              CONFIG.devConfig.secp256k1DepCell.outputIndex
            )
          );
        case CellDepType.secp256k1_lib_dep_cell:
          return new CellDep(
            DepType.code,
            new OutPoint(
              CONFIG.devConfig.secp256k1LibDepCell.txHash,
              CONFIG.devConfig.secp256k1LibDepCell.outputIndex
            )
          );
        case CellDepType.ckb_exchange_lock:
          return new CellDep(
            DepType.code,
            new OutPoint(
              CONFIG.devConfig.ckbExchangeLock.txHash,
              CONFIG.devConfig.ckbExchangeLock.outputIndex
            )
          );
        case CellDepType.ckb_exchange_timelock:
          return new CellDep(
            DepType.code,
            new OutPoint(
              CONFIG.devConfig.ckbExchangeTimelock.txHash,
              CONFIG.devConfig.ckbExchangeTimelock.outputIndex
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
              CONFIG.testnetConfig.secp256k1DepCell.txHash,
              CONFIG.testnetConfig.secp256k1DepCell.outputIndex
            )
          );
        case CellDepType.secp256k1_lib_dep_cell:
          return new CellDep(
            DepType.code,
            new OutPoint(
              CONFIG.testnetConfig.secp256k1LibDepCell.txHash,
              CONFIG.testnetConfig.secp256k1LibDepCell.outputIndex
            )
          );
        case CellDepType.ckb_exchange_lock:
          return new CellDep(
            DepType.code,
            new OutPoint(
              CONFIG.testnetConfig.ckbExchangeLock.txHash,
              CONFIG.testnetConfig.ckbExchangeLock.outputIndex
            )
          );
        case CellDepType.ckb_exchange_timelock:
          return new CellDep(
            DepType.code,
            new OutPoint(
              CONFIG.testnetConfig.ckbExchangeTimelock.txHash,
              CONFIG.testnetConfig.ckbExchangeTimelock.outputIndex
            )
          );
        case CellDepType.nft_type:
          return new CellDep(
            DepType.code,
            new OutPoint(
              CONFIG.testnetConfig.nftType.txHash,
              CONFIG.testnetConfig.nftType.outputIndex,
            )
          )
        default:
          throw new Error('invalid cell dep type');
      }
    default:
      throw new Error('invalid ckb env');
  }
}
