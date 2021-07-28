import { Config, RunningConfig } from "./config";

export const devConfig = {
  ckbUrl: 'http://127.0.0.1:8114',
  indexerUrl: 'http://127.0.0.1:8116/indexer',
  secp256k1DepCell: {
    txHash:
      '0x169094447e4205f82dd5aebd8e0f41c9f3cc2b04fad83ef6deb2873aa5c36763',
    outputIndex: '0x0',
    typeHash:
      '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
  },
  secp256k1LibDepCell: {
    txHash:
      '0x65a0d1f5a318138e9a8763d4fb960e7b5f999ac9323f372edde788b8e92a3392',
    outputIndex: '0x0',
    typeHash:
      '0xd6f4d542acd12d4e0f565530b1ff4626928a81dfaf0bd1a2950b2b96c92bfee0',
  },
  ckbExchangeLock: {
    txHash:
      '0x640cf49f57210110be256ddd16e885c125e3721fe13bd0987f225c16ccc8cfd2',
    outputIndex: '0x0',
    typeHash:
      '0xe5e42c1fb347a0e2ffd5f5da4c564c472b8e71945167ad5a480047e5b66b821b',
  },
  ckbExchangeTimelock: {
    txHash:
      '0x342b5ed966bb299642310fe69562e6d33a6c4c229ab3b39a2ad187b81d862ed1',
    outputIndex: '0x0',
    typeHash:
      '0x822dbe56e83d6eadb7915d63395f8d174015dbfce76e08494874fbac0dba3f21',
  },
};

export const testnetConfig = {
  ckbUrl: 'https://testnet.ckb.dev',
  indexerUrl: 'https://testnet.ckb.dev/indexer',
  secp256k1DepCell: {
    txHash:
      '0xf8de3bb47d055cdf460d93a2a6e1b05f7432f9777c8c474abf4eec1d4aee5d37',
    outputIndex: '0x0',
    typeHash:
      '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
  },
  secp256k1LibDepCell: {
    txHash:
      '0xfb691d60047a16b4b30bfde1ce004e6ff92a19954f2334b3600802742f795726',
    outputIndex: '0x0',
    typeHash:
      '0x1c49a2839478f6a5ecb1ef3dad6d21815153059a7cbdfc3269ea7c38b996b52f',
  },
  ckbExchangeLock: {
    txHash:
      '0x659e46269ab831f86a3d50cd8fc04ae03931bcd81ae76c51a7f38db3959485ca',
    outputIndex: '0x0',
    typeHash:
      '0xe499b8b1da443048be8273da58af7b180d294b456feb808012b178d7ab67ee24',
  },
  ckbExchangeTimelock: {
    txHash:
      '0xd21041e3d58dbf76ec6184ad1b339aba6a8da06f14534f303561e8b8603b59be',
    outputIndex: '0x0',
    typeHash:
      '0xac6cbc6289beac9c33da093807e9c8851c6d9bf82c00ee8010208cbee8df5235',
  },
  nftType: {
    txHash:
      '0x82e429d6e078bdf626ee10325e366340f4decb54a2565627419450d2232b9045',
    outputIndex: '0x2',
    typeHash:
      '0xb1837b5ad01a88558731953062d1f5cb547adf89ece01e8934a9f0aeed2d959f',
  },
};
export const systemTypeId =
   '0x00000000000000000000000000000000000000000000000000545950455f4944';
export const rootPrivateKey =
   '0x7b075af14d5340073d469277d716c7dc8e43ff01bbb02d9e90af0aa2ed348397';
export const accountPrivateKey = [
  '0x7b075af14d5340073d469277d716c7dc8e43ff01bbb02d9e90af0aa2ed348397',
  '0x0a7042bf1cbe2555ddc91e5f20c71a8b514baf686c31d9dc4e817f9b0c8efa3d',
  '0x4de816697189d9d4e57afe195c6a4dfc890f6f04ab76394e10e3930934797d02',
  '0x14ab5b73e0a9044c36decf08e21d20c9a728e8fd334d46d62981a29e6f901179',
  '0x1bc900157a06bb50aed257b6e87e2ec8ee024cd3dc0581eefa826a5b4f5a0c96',
];


export const CONFIG = new Config(RunningConfig.from(devConfig),RunningConfig.from(testnetConfig),systemTypeId,rootPrivateKey,accountPrivateKey);