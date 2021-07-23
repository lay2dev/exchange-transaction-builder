# Exchange-transaction-builder
Exchange-transaction-builder is used for building `ckb` transaction about `exchange lock script`.

The process is:

![exchange-transaction-builder](images/exchange-transaction-builder.png)

## Quick Start

```
$ npm install https://github.com/lay2dev/exchange-transaction-builder.git
```
## Transaction Builder Configure Define
```js

export class RunningConfig {
  constructor(
    // ckb node url
    public ckbUrl: string,
    // ckb indexer url
    public indexerUrl: string,
    // the `secp256k1` system dep cell info
    public secp256k1DepCell: DepCellInfo,
    // the `ckb-dynamic-loading-secp256k1` dep cell info,from `https://github.com/jjyr/ckb-dynamic-loading-secp256k1`
    public secp256k1LibDepCell: DepCellInfo,
    // the `exchange lock` dep cell info.`ExchangeLock` is a lock contract used for single signature as well as multiple signature
    public ckbExchangeLock: DepCellInfo,
    // the `exchange timelock` dep cell info.`ExchangeTimeLock` is like `ExchangeLock` but with `since check` feature.
    public ckbExchangeTimelock: DepCellInfo,
    public nftType: DepCellInfo,
  ) {}
}

export class DepCellInfo {
  constructor(
    // the transaction hash
    public txHash: string = "",
    // the transaction output index
    public outputIndex: string = "",
    // type script hash
    public typeHash: string = ""
  ) {}
}
```

## Build ExchangeLockSingleTx

### Example
```typescript
import {RunningConfig,DepCellInfo, ExchangeLockSingleTx,PWCore} from "exchange-transaction-builder";

const tx = await ExchangeLockSingleTx.create(   //create ExchangeLockSingleTx
    fromOutPoint:PWCore.OutPoint,               //OutPoint where NFT from
    userLockScript:PWCore.Script,               //lock script from User Lock                            
    threshold:number,                       //threshold for multiple signature               
    requestFirstN:number,                   //first nth public keys must match,for multiple signature
    singleSignPrivateKey:string,            //private key for single signature
    multiPubKey:string[],                   //public keys for multiple signature
    config:RunningConfig,                   //the configure which depends on running environment
);
const txHash = await tx.send();             //deploy transaction
```
### Quick Start
```bash
$ npm run start deploy_tx ExchangeLockSingleTx --txHash [Your txHash] --txOutputIndex [Your txOutputIndex] --env [One of "dev","testnet"]
```
## Build ExchangeLockMultiTx

### Example
```typescript
import {RunningConfig,DepCellInfo, ExchangeLockMultiTx,PWCore} from "exchange-transaction-builder";

const tx = await ExchangeLockMultiTx.create(   //create ExchangeLockSingleTx
    fromOutPoint:PWCore.OutPoint,                  //OutPoint where NFT from
    adminLockScript:PWCore.Script,                  //lock script from Admin Lock                            
    threshold:number,                       //threshold for multiple signature               
    requestFirstN:number,                   //first nth public keys must match,for multiple signature
    singlePubKey:string,                    //single key for single signature
    multiSignPrivateKey:string[],           //private keys for multiple signature
    config:RunningConfig,                   //the configure which depends on running environment
);
const txHash = await tx.send();             //deploy transaction
```
### Quick Start
```bash
$ npm run start deploy_tx ExchangeLockMultiTx --txHash [Your txHash] --txOutputIndex [Your txOutputIndex] --env [One of "dev","testnet"]
```

## Build ExchangeTimeLockSingleTx

### Example
```typescript
import {RunningConfig,DepCellInfo, TimeLockSingleTx,PWCore} from "exchange-transaction-builder";
const tx = await TimeLockSingleTx.create(   //create ExchangeTimeLockSingleTx
    fromOutPoint:PWCore.OutPoint,                  //OutPoint where NFT from
    userLockScript:PWCore.Script,                  //lock script from User Lock                            
    threshold:number,                       //threshold for multiple signature               
    requestFirstN:number,                   //first nth public keys must match,for multiple signature
    singleSignPrivateKey:string,            //private key for single signature
    multiPubKey:string[],                   //public keys for multiple signature
    config:RunningConfig,                   //the configure which depends on running environment
);
const txHash = await tx.send();             //deploy transaction
```
### Quick Start
```bash
$ npm run start deploy_tx TimeLockSingleTx --txHash [Your txHash] --txOutputIndex [Your txOutputIndex] --env [One of "dev","testnet"]
```

## Build ExchangeTimeLockMultiTx

### Example
```typescript
import {RunningConfig,DepCellInfo, TimeLockMultiTx,PWCore} from "exchange-transaction-builder";

const tx = await TimeLockMultiTx.create(   //create ExchangeTimeLockMultiTx
    fromOutPoint:PWCore.OutPoint,                  //OutPoint where NFT from
    adminLockScript:PWCore.Script,                 //lock script from Admin Lock
    userLockScript:PWCore.Script,                  //lock script from User Lock                            
    threshold:number,                       //threshold for multiple signature               
    requestFirstN:number,                   //first nth public keys must match,for multiple signature
    singlePubKey:string,                    //public key for single signature
    multiSignPrivateKey:string[],           //private keys for multiple signature
    config:RunningConfig,                   //the configure which depends on running environment
);
const txHash = await tx.send();             //deploy transaction
```
### Quick Start
```bash
$ npm run start deploy_tx TimeLockMultiTx --txHash [Your txHash] --txOutputIndex [Your txOutputIndex] --env [One of "dev","testnet"]
```


## Get Address
```typescript
import {ExchangeLockAddr,} from "exchange-transaction-builder";

const exchangeLockAddr = new ExchangeLockAddr(  
    threshold:number,                       //threshold for multiple 
    requestFirstN:number,                   //first nth public keys must match,for multiple signature
    singlePubKey:string,                    //public key for single signature
    multiPubKey:string[],                   //public keys for multiple signature
    config:RunningConfig,                   //the configure which depends on running environment
);

const exchangeTimeLockAddr = new ExchangeTimeLockAddr(
    threshold: number,                      //threshold for multiple 
    requestFirstN: number,                  //first nth public keys must match,for multiple signature
    singlePubKey: string,                   //public key for single signature
    multiPubKey: Array<string>,             //public keys for multiple signature
    outputHash: string,                     //the user lock script hash 
    config:RunningConfig                    //the configure which depends on running environment
);
```