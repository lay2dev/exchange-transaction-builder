import {
  Message,
  Signer,
  Keccak256Hasher,
  Reader,
  Hasher,
} from '@lay2/pw-core';
import ECPair from '@nervosnetwork/ckb-sdk-utils/lib/ecpair';
import {ExchangeLock} from '../types/ckb-exchange-lock';

/**
 * The signer for `ExchangeLock`'s single signature
 */
export class ExchangeLockSingleSigner extends Signer {
  private singleKeyPair: ECPair;
  constructor(
    private fromLockHash: string,
    singlePrivateKey: string,
    private exchangeLock: ExchangeLock,
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

    for (const message of messages) {
      if (this.fromLockHash === message.lock.toHash()) {
        console.log('message:', message.message);
        const m = new Keccak256Hasher()
          .update(new Reader('0x' + prefix.toString('hex')))
          .update(new Reader(message.message))
          .digest();
        console.log('keccak message:', m);
        if (this.exchangeLock.sign_flag == 1) {
          throw new Error("invalid `ExchangeLock`'s signFlag: should be `0`");
        } else {
          this.exchangeLock.signature.push(
            new Reader(this.singleKeyPair.signRecoverable(m.serializeJson()))
          );
          let lock = this.exchangeLock.serialize().serializeJson();
          console.log(lock);
          witnessLocks.push(lock);
        }
      } else {
        witnessLocks.push('0x');
      }
    }

    return witnessLocks;
  }
}

/**
 * The signer for `ExchangeLock`'s multiple signature
 */
 export class ExchangeLockMultiSigner extends Signer {
  private multiKeyPair: Array<ECPair>;
  constructor(
    private fromLockHash: string,
    multiPrivateKey: Array<string>,
    private exchangeLock: ExchangeLock,
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

    for (const message of messages) {
      if (this.fromLockHash === message.lock.toHash()) {
        console.log('message:', message.message);
        const m = new Keccak256Hasher()
          .update(new Reader('0x' + prefix.toString('hex')))
          .update(new Reader(message.message))
          .digest();
        console.log('keccak message:', m);
        if (this.exchangeLock.sign_flag == 1) {
          for (let keyPair of this.multiKeyPair) {
            this.exchangeLock.signature.push(
              new Reader(keyPair.signRecoverable(m.serializeJson()))
            );
          }
          let lock = this.exchangeLock.serialize().serializeJson();

          witnessLocks.push(lock);
        } else {
          throw new Error("invalid `ExchangeLock`'s signFlag: should be `1`");
        }
      } else {
        witnessLocks.push('0x');
      }
    }

    return witnessLocks;
  }
}
