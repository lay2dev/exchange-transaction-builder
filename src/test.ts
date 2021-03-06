import {
  Blake2bHasher,
  HashType,
  OutPoint,
  Reader,
  Script,
} from '@lay2/pw-core';
import Deploy from './deploy/deploy';
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
import {ExchangeLockMultiTx} from './exchangelock-multi-tx/core';
import {TimeLockMultiTx} from './timelock-multi-tx/core';
import {ExchangeLockArgs} from './types/ckb-exchange-lock';
import ECPair from '@nervosnetwork/ckb-sdk-utils/lib/ecpair';
import {ExchangeLockAddr} from './address';
import { CONFIG } from './config-inner';


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
      CONFIG.rootPrivateKey,
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
      CONFIG.rootPrivateKey,
      CONFIG.accountPrivateKey,
      options.env
    );
  });

program
  .command('test')
  .description('just for test')

  .action(async () => {
    let multiPubKeyHash = [];
    for (let privateKey of CONFIG.accountPrivateKey) {
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
    let lock_args_hash = new Reader(
      new Blake2bHasher().hash(
        new ExchangeLockArgs(
          3,
          1,
          new Reader(
            new Blake2bHasher()
              .hash(new ECPair(CONFIG.rootPrivateKey).publicKey)
              .toArrayBuffer()
              .slice(0, 20)
          ),
          multiPubKeyHash
        ).serialize()
      )
    ).serializeJson();
    console.log(lock_args_hash);
  });

program
  .command('moleculeTypeUpdate')
  .description('update molecule type')
  .action(async () => {
    await exportMoleculeTypes();
  });

program.command('getAddress').action(() => {
  const config = CONFIG;
  const keyPair = new ECPair(config.rootPrivateKey);
  const singlePubKey = keyPair.publicKey;
  let multiPubKey = [];
  for (let privateKey of config.accountPrivateKey) {
    multiPubKey.push(new ECPair(privateKey).publicKey);
  }
  const addr = new ExchangeLockAddr(3, 1, singlePubKey, multiPubKey,CONFIG.testnetConfig);
  console.log(addr.address.toCKBAddress());
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
        ? CONFIG.devConfig.secp256k1DepCell.typeHash
        : CONFIG.testnetConfig.secp256k1DepCell.typeHash,
      new Reader(
        new Blake2bHasher()
          .hash(new Reader(new ECPair(CONFIG.rootPrivateKey).publicKey))
          .toArrayBuffer()
          .slice(0, 20)
      ).serializeJson(),
      HashType.type
    );

    let multiPubKey = [];
    let multiPubKeyHash = [];
    for (let privateKey of CONFIG.accountPrivateKey) {
      let keyPair = new ECPair(privateKey);
      multiPubKey.push(keyPair.publicKey);
      multiPubKeyHash.push(
        new Reader(
          new Blake2bHasher()
            .hash(new Reader(keyPair.publicKey))
            .toArrayBuffer()
            .slice(0, 20)
        )
      );
    }

    const singlePubKey = new ECPair(CONFIG.rootPrivateKey).publicKey;
    const singlePubKeyHash = new Reader(
      new Blake2bHasher()
        .hash(new Reader(singlePubKey))
        .toArrayBuffer()
        .slice(0, 20)
    );

    const adminLockScript = new Script(
      options.env == CKBEnv.dev
        ? CONFIG.devConfig.ckbExchangeLock.typeHash
        : CONFIG.testnetConfig.ckbExchangeLock.typeHash,
      new Blake2bHasher()
        .hash(
          new ExchangeLockArgs(
            3,
            1,
            singlePubKeyHash,
            multiPubKeyHash
          ).serialize()
        )
        .serializeJson()
        .slice(0, 42),
      HashType.type
    );
    const config =
      options.env == CKBEnv.dev ? CONFIG.devConfig : CONFIG.testnetConfig;
    switch (txType) {
      case 'TimeLockSingleTx':
        fromOutPoint = new OutPoint(options.txHash, options.txOutputIndex);
        txHash = await (
          await TimeLockSingleTx.create(
            fromOutPoint,
            userLockScript,
            3,
            1,
            CONFIG.accountPrivateKey[0],
            multiPubKey,
            config
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
            singlePubKey,
            CONFIG.accountPrivateKey,
            config
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
            CONFIG.accountPrivateKey[0],
            multiPubKey,
            config
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
            singlePubKey,
            CONFIG.accountPrivateKey,
            config
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
