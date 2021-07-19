import {Amount, Blake2bHasher, ChainID, Reader, RPC} from '@lay2/pw-core';
import Deploy, {devChainConfig} from './deploy/deploy';
import {
  getCellDataHash,
  ROOT_PRIVATE_KEY,
  transferAccount,
} from './helpers';
import {TimeLockFromExchangeLock} from './timelock-from-exchangelock/core';
import * as ExchangeLock from './schemas-types/ckb-lock-demo-type';

// transferAccount()
//   .then(() => process.exit(0))
//   .catch(error => {
//     console.error(error);
//     process.exit(1);
//   });

// update scemas types for molecule
// exportMoleculeTypes();
// main()
//   .then(() => process.exit(0))
//   .catch(error => {
//     console.error(error);
//     process.exit(1);
//   });


import {Command} from 'commander';
import {readFileSync} from 'fs';
import {ACCOUNT_PRIVATE_KEY, CKB_DEV_URL} from './config';
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
  .action(async (binaryFilePath, options) => {
    let deploy = await new Deploy(ROOT_PRIVATE_KEY, binaryFilePath).init(
      options.txHash,
      options.txOutputIndex
    );
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
  .action(async options => {
    console.log(options.txHash, options.txOutputIndex);
    await getCellDataHash(options.txHash, options.txOutputIndex);
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
  .command('deploy_tx <txType>')
  .description('deploy transaction One of `TimeLockFromExchangeLock`')
  .action(async (txType) => {
    switch (txType) {
      case 'TimeLockFromExchangeLock':
        const txHash = await new TimeLockFromExchangeLock(
          undefined,
          './script_builder/release/ckb_timelock',
          './script_builder/release/ckb_lock_demo',
          new Amount('1000'),
          3,
          1,
          ACCOUNT_PRIVATE_KEY[0],
          ACCOUNT_PRIVATE_KEY,
          CKB_DEV_URL
        ).send();
        console.log("txHash:",txHash);
        break;

      default:
        console.log("invalid txType");
        break;
    }
  });

program.parseAsync(process.argv).then(() => {
  console.log();
  console.log('Done');
});
