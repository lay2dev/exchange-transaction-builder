import PWCore, {
  Address,
  AddressType,
  Blake2bHasher,
  Builder,
  BuilderOption,
  CellDep,
  ChainID,
  Collector,
  Config,
  DepType,
  HashType,
  IndexerCollector,
  OutPoint,
  RawProvider,
  RPC,
  Script,
  Signer,
  transformers,
} from '@lay2/pw-core';
import * as fs from 'fs';
import {CKBEnv,  ROOT_ADDRESS} from '../helpers';
import DeployBuilder, {DeployBuilderOption} from './deploy-builder';
import {privateKeyToAddress,AddressOptions,AddressPrefix} from '@nervosnetwork/ckb-sdk-utils';
import { DefaultSigner } from '../signer/default-signer';
import { CKB_DEV_URL, INDEXER_DEV_URL } from '../config';

export const devChainConfig = {
  daoType: {
    cellDep: new CellDep(
      DepType.code,
      new OutPoint(
        '0xa563884b3686078ec7e7677a5f86449b15cf2693f3c1241766c6996f206cc542',
        '0x2'
      )
    ),
    script: new Script(
      '0x82d76d1b75fe2fd9a27dfbaa65a039221a380d76c926f378d3f81cf3e7e13f21',
      '0x',
      HashType.type
    ),
  },
  sudtType: {
    // 解锁sudt资产是传入的sudt 的cell deps
    cellDep: new CellDep(
      DepType.code,
      new OutPoint(
        '0xd42be1c44265657ea419c6983e617219c3f30ea979c4308c7c2df3cfd3782c71',
        '0x0'
      )
    ),
    //sudt资产的typescript，包含codeHash和hashType，args这里是‘0x’，在pw-core使用的时候，pw-core会自动将其替换成sudt 发行人的lockhash
    script: new Script(
      '0x48dbf59b4c7ee154728021b4869bceedf4eea6b43772e5d66ef8865b6ae7211',
      '0x',
      HashType.data
    ),
  },
  defaultLock: {
    // 解锁官方secp256k1 lock的cell deps
    cellDep: new CellDep(
      DepType.depGroup,
      new OutPoint(
        '0x169094447e4205f82dd5aebd8e0f41c9f3cc2b04fad83ef6deb2873aa5c36763',
        '0x0'
      )
    ),
    // 官方lock锁定cell的lockscript的构成内容，这个地方每条链基本是一样的，可以不用替换
    script: new Script(
      '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
      '0x',
      HashType.type
    ),
  },
  multiSigLock: {
    cellDep: new CellDep(
      DepType.depGroup,
      new OutPoint(
        '0xace5ea83c478bb866edf122ff862085789158f5cbff155b7bb5f13058555b708',
        '0x1'
      )
    ),
    script: new Script(
      '0x5c5069eb0857efc65e1bca0c07df34c31663b3622fd3876c876320fc9634e2a8',
      '0x',
      HashType.type
    ),
  },
  pwLock: {
    cellDep: new CellDep(
      DepType.code,
      new OutPoint(
        '0x169094447e4205f82dd5aebd8e0f41c9f3cc2b04fad83ef6deb2873aa5c36763',
        '0x0'
      )
    ),
    script: new Script(
      '0x871a518c1f211e807af31a455d549bffcfb30daa844fdea878cf7643b024f752',
      '0x',
      HashType.type
    ),
  },
  acpLockList: [
    new Script(
      '0x871a518c1f211e807af31a455d549bffcfb30daa844fdea878cf7643b024f752',
      '0x',
      HashType.type
    ),
  ],
};

export default class Deploy {
  private fromAddr: Address;
  private collector: Collector;
  private toAddr: Address;
  private rpc:RPC;
  private signer:Signer;
  private builder?: DeployBuilder;

  constructor(
    privateKey: string,
    private filePath: string,
    private ckbEnv:CKBEnv = CKBEnv.dev,
  ) {
    // this.provider = new RawProvider(this.privateKey);
    const addressPrefix = this.ckbEnv === CKBEnv.dev || this.ckbEnv === CKBEnv.testnet ? AddressPrefix.Testnet : AddressPrefix.Mainnet;
    const fromAddrStr = privateKeyToAddress(privateKey,{prefix:addressPrefix});
    this.fromAddr = new Address(fromAddrStr,AddressType.ckb,);
    this.toAddr = this.fromAddr;
    this.collector = new IndexerCollector(INDEXER_DEV_URL);
    const nodeUrl = this.ckbEnv === CKBEnv.dev ? CKB_DEV_URL : ROOT_ADDRESS.mainnet;
    this.rpc = new RPC(CKB_DEV_URL);
    this.signer = new DefaultSigner(new Blake2bHasher(),privateKey,this.fromAddr);
  }

  async init(
    txHash?: string,
    index?: string
  ): Promise<Deploy> {
    let data: string = await new Promise((resolve, reject) => {
      fs.readFile(this.filePath, (err, data) => {
        if (err) {
          reject(err);
        }
        resolve('0x' + data.toString('hex'));
      });
    });
    const options: DeployBuilderOption = {
      witnessArgs: Builder.WITNESS_ARGS.RawSecp256k1,
      data,
      collector: this.collector,
      txHash,
      index,
    };
    this.builder = new DeployBuilder(this.rpc,this.fromAddr,this.toAddr, options);

    // await this.builder.pwCore.init(
    //   this.provider,
    //   this.collector,
    //   chainId,
    //   config
    // );
    return this;
  }

  async send(): Promise<string> {
    if (!this.builder) {
      throw new Error('Please set builder for Deploy');
    }
    let tx = await this.builder.build();
    tx.validate();

    let signedTx = await this.signer.sign(tx);
    const txHash = this.rpc.send_transaction(transformers.TransformTransaction(signedTx));
    console.log("txHash:",txHash);
    return txHash;
  }
}
