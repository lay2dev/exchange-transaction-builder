import {Amount, Blake2bHasher, ChainID, Reader, RPC} from '@lay2/pw-core';
import Deploy, {devChainConfig} from './deploy/deploy';
import {CKBEnv, exportMoleculeTypes, getCellDataHash, transferAccount} from './helpers';
import {ExchangeLockSingleTx} from './exchangelock-single-tx/core';
import {TimeLockSingleTx} from './time-lock-single-tx/core';

import {Command} from 'commander';
import {readFileSync} from 'fs';
import {ACCOUNT_PRIVATE_KEY, DEV_CONFIG, ROOT_PRIVATE_KEY} from './config';
import {ExchangeLockMultiTx} from './exchangelock-multi-tx/core';
import {TimeLockMultiTx} from './timelock-multi-tx/core';
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
    await getCellDataHash(options.txHash, options.txOutputIndex,options.env);
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
  .action(async (txType,options) => {
    let txHash;
    switch (txType) {
      case 'TimeLockSingleTx':
        txHash = await new TimeLockSingleTx(
          undefined,
          new Amount('1000'),
          3,
          1,
          ACCOUNT_PRIVATE_KEY[0],
          ACCOUNT_PRIVATE_KEY,
          DEV_CONFIG.ckb_url
        ).send();
        console.log('txHash:', txHash);
        break;
      case 'TimeLockMultiTx':
        txHash = await new TimeLockMultiTx(
          undefined,
          new Amount('1000'),
          3,
          1,
          ACCOUNT_PRIVATE_KEY[0],
          ACCOUNT_PRIVATE_KEY,
          DEV_CONFIG.ckb_url
        ).send();
        console.log('txHash:', txHash);
        break;
      case 'ExchangeLockSingleTx':
        txHash = await new ExchangeLockSingleTx(
          undefined,
          new Amount('1000'),
          3,
          1,
          ACCOUNT_PRIVATE_KEY[0],
          ACCOUNT_PRIVATE_KEY,
          DEV_CONFIG.ckb_url
        ).send();
        console.log('txHash:', txHash);
        break;
      case 'ExchangeLockMultiTx':
        txHash = await new ExchangeLockMultiTx(
          undefined,
          new Amount('1000'),
          3,
          1,
          ACCOUNT_PRIVATE_KEY[0],
          ACCOUNT_PRIVATE_KEY,
          options.env
        ).send();
        console.log('txHash:', txHash);
        break;
      default:
        console.log('invalid txType');
        break;
    }
  });

program.parseAsync(process.argv).then(() => {
  console.log();
  console.log('Done');
});
