import {
  Message,
  Provider,
  Signer,
  Keccak256Hasher,
  Reader,
} from '@lay2/pw-core';
import {ExchangeLockProvider} from './provider';

export class ExchangeLockSigner extends Signer {
  constructor(public readonly provider: ExchangeLockProvider) {
    super(provider.hasher());
  }

  async signMessages(messages: Message[]): Promise<string[]> {
    const sigs = [];
    var prefix = Buffer.from(
      '\u0019Ethereum Signed Message:\n' + '32',
      'utf-8'
    );
    let keccak = new Keccak256Hasher();
    for (const message of messages) {
      if (
        this.provider.address.toLockScript().toHash() === message.lock.toHash()
      ) {
        console.log('message:', message.message);
        const m = keccak
          .update(new Reader('0x' + prefix.toString('hex')))
          .update(new Reader(message.message))
          .digest();
        console.log('keccak message:', m);
        sigs.push(await this.provider.sign(m.serializeJson()));
        keccak.reset();
      } else {
        sigs.push('0x');
      }
    }

    return sigs;
  }
}
