import {
  Message,
  Signer,
  Keccak256Hasher,
  Reader,
  Hasher,
} from '@lay2/pw-core';
import ECPair from '@nervosnetwork/ckb-sdk-utils/lib/ecpair';
import {TimeLock} from '../types/ckb-exchange-timelock';

/**
 * The signer for `ExchangeTimeLock`'s single signature
 */
export class TimeLockSingleSigner extends Signer {
  public singleKeyPair: ECPair;
  constructor(
    public fromLockHash: string,
    singlePrivateKey: string,
    public timeLock: TimeLock,
    hasher: Hasher
  ) {
    super(hasher);

    this.singleKeyPair = new ECPair(singlePrivateKey);

  }

  /**
   * 
   * @param messages Signing message
   * @returns Signed witnessArgs's lock
   */
  async signMessages(messages: Message[]): Promise<string[]> {
    const witnessLocks = [];
    var prefix = Buffer.from(
      '\u0019Ethereum Signed Message:\n' + '32',
      'utf-8'
    );
    let keccak = new Keccak256Hasher();
    for (const message of messages) {
      if (this.fromLockHash === message.lock.toHash()) {
        console.log('message:', message.message);
        const m = keccak
          .update(new Reader('0x' + prefix.toString('hex')))
          .update(new Reader(message.message))
          .digest();
        console.log('keccak message:', m);
        if (this.timeLock.sign_flag == 1) {
          throw new Error("invalid `ExchangeTimeLock`'s signFlag:should be 0");
        } else {
          this.timeLock.signature.push(
            new Reader(this.singleKeyPair.signRecoverable(m.serializeJson()))
          );
          let lock = this.timeLock.serialize().serializeJson();
          console.log(lock);
          witnessLocks.push(lock);
        }
        keccak.reset();
      } else {
        witnessLocks.push('0x');
      }
    }

    return witnessLocks;
  }
}



/**
 * The signer for `ExchangeTimeLock`'s multiple signature.
 */
 export class TimeLockMultiSigner extends Signer {
  private multiKeyPair: Array<ECPair>;
  constructor(
    private fromLockHash: string,
    multiPrivateKey: Array<string>,
    private timeLock: TimeLock,
    hasher: Hasher
  ) {
    super(hasher);


    this.multiKeyPair = [];
    for (let privateKey of multiPrivateKey) {
      let keyPair = new ECPair(privateKey);
      this.multiKeyPair.push(keyPair);
    }
  }

  /**
   * 
   * @param messages Signing message
   * @returns Signed witnessArgs's lock
   */
  async signMessages(messages: Message[]): Promise<string[]> {
    const witnessLocks = [];
    var prefix = Buffer.from(
      '\u0019Ethereum Signed Message:\n' + '32',
      'utf-8'
    );
    let keccak = new Keccak256Hasher();
    for (const message of messages) {
      if (this.fromLockHash === message.lock.toHash()) {
        console.log('message:', message.message);
        const m = keccak
          .update(new Reader('0x' + prefix.toString('hex')))
          .update(new Reader(message.message))
          .digest();
        console.log('keccak message:', m);
        if (this.timeLock.sign_flag == 1) {
          for (let keyPair of this.multiKeyPair) {
            this.timeLock.signature.push(
              new Reader(keyPair.signRecoverable(m.serializeJson()))
            );
          }
          let lock = this.timeLock.serialize().serializeJson();

          witnessLocks.push(lock);
        } else {
          throw new Error("invalid `ExchangeTimeLock`'s signFlag:should be 1");
        }
        keccak.reset();
      } else {
        witnessLocks.push('0x');
      }
    }

    return witnessLocks;
  }
}
