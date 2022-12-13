import crypto from 'crypto';
import { ECPairFactory } from 'ecpair'
import * as ecc from 'tiny-secp256k1'
const ECPair = ECPairFactory(ecc)

export default class Oracle {
      constructor(privateKeyHex) {
            if (!privateKeyHex) 
                  throw new Error('Must provide a private key hex encoded')

            const keyPair = ECPair.fromPrivateKey(Buffer.from(privateKeyHex, 'hex'))
       
            this.keyPair = keyPair
      }

      priceAttestation({ price, timestamp }) {
            // Sanitize the price and timestamp
            const timestampInt = Math.trunc(timestamp);
            const priceInt = Math.trunc(price);
            // Concatenate timestamp and the price (no decimals)
            // 8 bytes for timestamp, 8 bytes for price
            const timpestampLE64 = uint64LE(timestampInt)
            const priceLE64 = uint64LE(priceInt)
            const message = Buffer.from([...timpestampLE64, ...priceLE64])
            // make a sha256 of the the message
            const hash = crypto.createHash('sha256').update(message).digest()
            // sign schnorr
            const signature = this.keyPair.signSchnorr(hash)

            return [timestampInt.toString(), priceInt.toString(), signature.toString('hex')]
      }

}

function uint64LE(x) {
      const buffer = Buffer.alloc(8)
      writeUInt64LE(buffer, x, 0)
      return buffer
}

// Copyright (c) 2011-2020 bitcoinjs-lib contributors (MIT License).
// Taken from https://github.com/bitcoinjs/bitcoinjs-lib/blob/master/ts_src/bufferutils.ts#L26-L36
function writeUInt64LE(buffer, value, offset) {
      verifuint(value, 0x001fffffffffffff)

      buffer.writeInt32LE(value & -1, offset)
      buffer.writeUInt32LE(Math.floor(value / 0x100000000), offset + 4)
      return offset + 8
}

// https://github.com/feross/buffer/blob/master/index.js#L1127
function verifuint(value, max) {
      if (typeof value !== 'number')
            throw new Error('cannot write a non-number as a number')
      if (value < 0)
            throw new Error('specified a negative value for writing an unsigned value')
      if (value > max) throw new Error('RangeError: value out of range')
      if (Math.floor(value) !== value)
            throw new Error('value has a fractional component')
}
