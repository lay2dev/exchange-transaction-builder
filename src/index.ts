import {
  Amount,
  Blake2bHasher,
  ChainID,
  HashType,
  OutPoint,
  Reader,
  RPC,
  Script,
  WitnessArgs,
} from '@lay2/pw-core';
import Deploy, {devChainConfig} from './deploy/deploy';
import {
  CKBEnv,
  exportMoleculeTypes,
  getCellDataHash,
  transferAccount,
  transferAccountForNFT,
} from './helpers';
import {ExchangeLockSingleTx} from './exchangelock-single-tx/core';
import {TimeLockSingleTx} from './time-lock-single-tx/core';

import {Command} from 'commander';
import {readFileSync} from 'fs';
import {
  ACCOUNT_PRIVATE_KEY,
  DEV_CONFIG,
  ROOT_PRIVATE_KEY,
  TESTNET_CONFIG,
} from './config';
import {ExchangeLockMultiTx} from './exchangelock-multi-tx/core';
import {TimeLockMultiTx} from './timelock-multi-tx/core';
import {ExchangeLock, ExchangeLockArgs} from './types/ckb-exchange-lock';
import {SerializeLock} from './schemas-types/ckb-exchange-lock-type';
import ECPair from '@nervosnetwork/ckb-sdk-utils/lib/ecpair';
const program = new Command();
program.version('0.0.1');

program
  .command('deploy <binaryFilePath>')
  .description('deploy lock script')
  .option(
    '--txHash <txHash>',
    'Which of existing lock script                Example:0x788becd04bf3bb166faa1b5e1f906e0efbe172c6174813203c61e8838c452219'
  )
  .option(
    '--txOutputIndex <txOutputIndex>',
    'Which of existing lock script                Example:0x1'
  )
  .option(
    '--env <env>',
    'the deploy environment                       One of `dev`,`testnet`,`mainnet`'
  )
  .action(async (binaryFilePath, options) => {
    let deploy = await new Deploy(
      ROOT_PRIVATE_KEY,
      binaryFilePath,
      options.env
    ).init(options.txHash, options.txOutputIndex);
    const txHash = await deploy.send();
    console.log('txHash:', txHash);
  });

program
  .command('getCellInfo')
  .description('get cell info')
  .option(
    '--txHash <txHash>',
    'Which of cell                                Example:0x788becd04bf3bb166faa1b5e1f906e0efbe172c6174813203c61e8838c452219'
  )
  .option(
    '--txOutputIndex <txOutputIndex>',
    'Which of cell                                Example:0x1'
  )
  .option(
    '--env <env>',
    'the deploy environment                       One of `dev`,`testnet`,`mainnet`'
  )
  .action(async options => {
    console.log(options.txHash, options.txOutputIndex);
    await getCellDataHash(options.txHash, options.txOutputIndex, options.env);
  });

program
  .command('blake2b <input>')
  .description('blake2b Hash')
  .action(async input => {
    const blake = new Blake2bHasher();
    console.log(input);
    const data = new Reader('0x' + readFileSync(input, {encoding: 'hex'}));
    const output = blake.hash(data);
    console.log('blake2b Hash Result:', output.serializeJson());
  });

program
  .command('transfer_account')
  .description('transfer ckb account')
  .action(async () => {
    await transferAccount();
  });

program
  .command('transfer_account_for_nft')
  .description('transfer ckb nft account')
  .option(
    '--env <env>',
    'the deploy environment                       One of `dev`,`testnet`,`mainnet`'
  )
  .requiredOption(
    '--txHash <txHash>',
    'the hash from the transaction of input cell'
  )
  .requiredOption(
    '--txOutputIndex <txOutputIndex>',
    'the output index from the transaction of input cell'
  )
  .action(async options => {
    const fromOutPoint = new OutPoint(options.txHash, options.txOutputIndex);

    await transferAccountForNFT(
      fromOutPoint,
      3,
      1,
      ROOT_PRIVATE_KEY,
      ACCOUNT_PRIVATE_KEY,
      options.env
    );
  });

program
  .command('test')
  .description('just for test')

  .action(async () => {
    const lock = new ExchangeLock(
      new ExchangeLockArgs(3, 1, new Reader('0x' + '1'.repeat(40)), [
        new Reader('0x' + '2'.repeat(40)),
        new Reader('0x' + '3'.repeat(40)),
        new Reader('0x' + '4'.repeat(40)),
        new Reader('0x' + '5'.repeat(40)),
        new Reader('0x' + '6'.repeat(40)),
      ]),
      0,
      []
    );
    const witnessArgs = {
      lock: lock.serialize().serializeJson(),
      input_type: '',
      output_type: '',
    };
    console.log(lock.serialize().serializeJson());
    console.log(
      new Reader(
        SerializeLock({
          args: {
            threshold: 3,
            request_first_n: 1,
            single_pubkey: new Reader('0x' + '1'.repeat(40)),
            multi_pubkey: [
              new Reader('0x' + '2'.repeat(40)),
              new Reader('0x' + '3'.repeat(40)),
              new Reader('0x' + '4'.repeat(40)),
              new Reader('0x' + '5'.repeat(40)),
              new Reader('0x' + '6'.repeat(40)),
            ],
          },
          sign_flag: 0,
          signature: [],
        })
      ).serializeJson()
    );
  });

program
  .command('moleculeTypeUpdate')
  .description('update molecule type')
  .action(async () => {
    await exportMoleculeTypes();
  });

program
  .command('deploy_tx <txType>')
  .description(
    'deploy transaction One of `TimeLockSingleTx`,`ExchangeLockSingleTx`'
  )
  .option(
    '--env <env>',
    'the deploy environment                       One of `dev`,`testnet`,`mainnet`'
  )
  .requiredOption(
    '--txHash <txHash>',
    'the hash from the transaction of input cell'
  )
  .requiredOption(
    '--txOutputIndex <txOutputIndex>',
    'the output index from the transaction of input cell'
  )
  .action(async (txType, options) => {
    let txHash;
    let fromOutPoint;
    const userLockScript = new Script(
      options.env == CKBEnv.dev
        ? DEV_CONFIG.secp256k1_dep_cell.typeHash
        : TESTNET_CONFIG.secp256k1_dep_cell.typeHash,
      new ECPair(ROOT_PRIVATE_KEY).publicKey,
      HashType.type
    );

    let multiPubKeyHash = [];
    for (let privateKey of ACCOUNT_PRIVATE_KEY) {
      let keyPair = new ECPair(privateKey);
      multiPubKeyHash.push(
        new Reader(
          new Blake2bHasher()
            .hash(new Reader(keyPair.publicKey))
            .toArrayBuffer()
            .slice(0, 20)
        )
      );
    }

    const adminLockScript = new Script(
      options.env == CKBEnv.dev
        ? DEV_CONFIG.ckb_exchange_lock.typeHash
        : TESTNET_CONFIG.ckb_exchange_lock.typeHash,
      new Blake2bHasher()
        .hash(
          new ExchangeLockArgs(
            2,
            1,
            new Reader(
              new Blake2bHasher()
                .hash(new ECPair(ROOT_PRIVATE_KEY).publicKey)
                .toArrayBuffer()
                .slice(0, 20)
            ),
            multiPubKeyHash
          ).serialize()
        )
        .serializeJson()
        .slice(0, 42),
      HashType.type
    );
    switch (txType) {
      case 'TimeLockSingleTx':
        fromOutPoint = new OutPoint(options.txHash, options.txOutputIndex);
        txHash = await (
          await TimeLockSingleTx.create(
            fromOutPoint,
            userLockScript,
            3,
            1,
            ACCOUNT_PRIVATE_KEY[0],
            ACCOUNT_PRIVATE_KEY,
            options.env
          )
        ).send();
        console.log('txHash:', txHash);
        break;
      case 'TimeLockMultiTx':
        fromOutPoint = new OutPoint(options.txHash, options.txOutputIndex);
        txHash = await (
          await TimeLockMultiTx.create(
            fromOutPoint,
            adminLockScript,
            userLockScript,
            3,
            1,
            ACCOUNT_PRIVATE_KEY[0],
            ACCOUNT_PRIVATE_KEY,
            options.env
          )
        ).send();
        console.log('txHash:', txHash);
        break;
      case 'ExchangeLockSingleTx':
        fromOutPoint = new OutPoint(options.txHash, options.txOutputIndex);
        txHash = await (
          await ExchangeLockSingleTx.create(
            fromOutPoint,
            userLockScript,
            3,
            1,
            ACCOUNT_PRIVATE_KEY[0],
            ACCOUNT_PRIVATE_KEY,
            options.env
          )
        ).send();
        console.log('txHash:', txHash);
        break;
      case 'ExchangeLockMultiTx':
        fromOutPoint = new OutPoint(options.txHash, options.txOutputIndex);
        txHash = await (
          await ExchangeLockMultiTx.create(
            fromOutPoint,
            adminLockScript,
            3,
            1,
            ACCOUNT_PRIVATE_KEY[0],
            ACCOUNT_PRIVATE_KEY,
            options.env
          )
        ).send();
        console.log('txHash:', txHash);
        break;
      default:
        console.log('invalid txType');
        break;
    }
    console.log('txHash:', txHash);
  });

program.parseAsync(process.argv).then(() => {
  console.log();
  console.log('Done');
});
