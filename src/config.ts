export const DEV_CONFIG = {
  ckb_url:"http://127.0.0.1:8114",
  indexer_url:"http://127.0.0.1:8116/indexer",
  secp256k1_dep_cell:{
    txHash:"0x169094447e4205f82dd5aebd8e0f41c9f3cc2b04fad83ef6deb2873aa5c36763",
    outputIndex:"0x0",
    typeHash:"0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8"
  },
  secp256k1_lib_dep_cell:{
    txHash: '0x65a0d1f5a318138e9a8763d4fb960e7b5f999ac9323f372edde788b8e92a3392',
    outputIndex: '0x0',
    typeHash:
      '0xd6f4d542acd12d4e0f565530b1ff4626928a81dfaf0bd1a2950b2b96c92bfee0',
  },
  ckb_exchange_lock :{
    txHash: '0x164d2e7630cdcb9533c979ef4d844905b7f4f590ecf37d5d753957ae7e053932',
    outputIndex: '0x0',
    typeHash:
      '0x18e5f7aa6f195cca8054f1cb4c32a149d9f6eae21bfb6db71c7f63afcc0d2f74',
  },
  ckb_exchange_timelock :{
    txHash: '0x418b97d2b3c701a7b975ec4f93d03a7ecbcc2e6bd07aff28d3b4ca7421014fcf',
    outputIndex: '0x0',
    typeHash:
      '0x317e61e3dafb230f53d4e416824549567d216498bc8e1b0922af9bf89a1186c2',
  },
};

export const TESTNET_CONFIG = {
  ckb_url:"https://testnet.ckb.dev",
  indexer_url:"https://testnet.ckb.dev/indexer",
  secp256k1_dep_cell:{
    txHash:"0xf8de3bb47d055cdf460d93a2a6e1b05f7432f9777c8c474abf4eec1d4aee5d37",
    outputIndex:"0x0",
    typeHash:"0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8"
  },
  secp256k1_lib_dep_cell:{
    txHash: '0xfb691d60047a16b4b30bfde1ce004e6ff92a19954f2334b3600802742f795726',
    outputIndex: '0x0',
    typeHash:
      '0x1c49a2839478f6a5ecb1ef3dad6d21815153059a7cbdfc3269ea7c38b996b52f',
  },
  ckb_exchange_lock :{
    txHash: '0xcf9d94d3b4657f56cf638eb4102efe6705bffd1be3da9c9b59868cfa5dd17f88',
    outputIndex: '0x0',
    typeHash:
      '0xe499b8b1da443048be8273da58af7b180d294b456feb808012b178d7ab67ee24',
  },
  ckb_exchange_timelock :{
    txHash: '0x3e4dac4735bfca424d8ae719f85f90d968b97ea1a2282d4874446bf9fd8970b6',
    outputIndex: '0x0',
    typeHash:
      '0xac6cbc6289beac9c33da093807e9c8851c6d9bf82c00ee8010208cbee8df5235',
  },
};


export const SYSTEM_TYPE_ID =
  '0x00000000000000000000000000000000000000000000000000545950455f4944';

export const ROOT_PRIVATE_KEY = "0x7b075af14d5340073d469277d716c7dc8e43ff01bbb02d9e90af0aa2ed348397";
export const ACCOUNT_PRIVATE_KEY = [
  '0x7b075af14d5340073d469277d716c7dc8e43ff01bbb02d9e90af0aa2ed348397',
  '0x0a7042bf1cbe2555ddc91e5f20c71a8b514baf686c31d9dc4e817f9b0c8efa3d',
  '0x4de816697189d9d4e57afe195c6a4dfc890f6f04ab76394e10e3930934797d02',
  '0x14ab5b73e0a9044c36decf08e21d20c9a728e8fd334d46d62981a29e6f901179',
  '0x1bc900157a06bb50aed257b6e87e2ec8ee024cd3dc0581eefa826a5b4f5a0c96',
];


