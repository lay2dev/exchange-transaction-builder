import {Amount, Blake2bHasher, ChainID, Reader, RPC} from '@lay2/pw-core';
import Deploy, {devChainConfig} from './deploy/deploy';
import {
  exportMoleculeTypes,
  getCellDataHash,
  ROOT_ADDRESS,
  ROOT_PRIVATE_KEY,
  SCRIPT_PATH,
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

// new TimeLockFromExchangeLock(
//   undefined,
//   './script_builder/release/ckb_timelock',
//   './script_builder/release/ckb_lock_demo',
//   new Amount('1000'),
//   3,
//   1,
//   '0x7b075af14d5340073d469277d716c7dc8e43ff01bbb02d9e90af0aa2ed348397',
//   [
//     '0x7b075af14d5340073d469277d716c7dc8e43ff01bbb02d9e90af0aa2ed348397',
//     '0x0a7042bf1cbe2555ddc91e5f20c71a8b514baf686c31d9dc4e817f9b0c8efa3d',
//     '0x4de816697189d9d4e57afe195c6a4dfc890f6f04ab76394e10e3930934797d02',
//     '0x14ab5b73e0a9044c36decf08e21d20c9a728e8fd334d46d62981a29e6f901179',
//     '0x1bc900157a06bb50aed257b6e87e2ec8ee024cd3dc0581eefa826a5b4f5a0c96',
//   ],
//   CKB_URL,
//   undefined,
//   undefined
// )
//   .send()
//   .then(() => process.exit(0))
//   .catch(error => {
//     console.error(error);
//     process.exit(1);
//   });
// let hash = new Blake2bHasher();
// console.log(hash.hash("111").serializeJson().slice(0,42));

// getCellDataHash(
//   '0x3222781a4604885e40393c15b2f441abc946a90057973738853291722f1585ce',
//   '0x0'
// );

import {Command} from 'commander';
import { readFileSync } from 'fs';
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
    let deploy = await new Deploy(
      ROOT_PRIVATE_KEY,
      binaryFilePath,

    ).init(
      options.txHash,
      options.txOutputIndex
    );
    const txHash = await deploy.send();
    console.log('txHash:', txHash);
  });

program.command('getCellInfo')
.description("get cell info")
.option(
  '--txHash <txHash>',
  'Which of cell                                Example:0x788becd04bf3bb166faa1b5e1f906e0efbe172c6174813203c61e8838c452219'
)
.option(
  '--txOutputIndex <txOutputIndex>',
  'Which of cell                                Example:0x1'
).action(async (options,) => {
  console.log(options.txHash,options.txOutputIndex);
  await getCellDataHash(options.txHash,options.txOutputIndex);
});

program.command('blake2b <input>')
.description("blake2b Hash")
.action(async (input,) => {
  const blake = new Blake2bHasher();
  console.log(input);
  const data = "0x" + readFileSync(input,{encoding:"hex"});
  const output = blake.hash(data);
  console.log("blake2b Hash Result:",output.serializeJson());
});

program.parseAsync(process.argv).then(() =>{
  console.log();
  console.log("Done");
});
