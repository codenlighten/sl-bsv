'use strict'

const BN = require('bn.js')
const unorm = require('unorm')
const pbkdf2 = require('pbkdf2')
const { Buffer } = require('buffer')
const { randomBytes, createHash } = require('crypto')

// Import our secure Point implementation
const Point = require('../crypto/point')

// Preconditions for input validation
const preconditions = {
  checkArgument: function(condition, message) {
    if (!condition) {
      throw new Error(message || 'Invalid argument')
    }
  },
  checkState: function(condition, message) {
    if (!condition) {
      throw new Error(message || 'Invalid state')
    }
  }
}

// Custom error types
class MnemonicError extends Error {
  constructor(message) {
    super(message)
    this.name = 'MnemonicError'
  }
}

class UnknownWordlistError extends MnemonicError {
  constructor(message) {
    super(message || 'Unknown wordlist')
    this.name = 'UnknownWordlistError'
  }
}

class InvalidMnemonicError extends MnemonicError {
  constructor(message) {
    super(message || 'Invalid mnemonic')
    this.name = 'InvalidMnemonicError'
  }
}

/**
 * Secure implementation of BIP39 Mnemonic code.
 * See BIP39 specification: https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki
 */
class Mnemonic {
  /**
   * @param {*=} data - a seed, phrase, or entropy to initialize (can be skipped)
   * @param {Array=} wordlist - the wordlist to generate mnemonics from
   */
  constructor(data, wordlist) {
    if (!(this instanceof Mnemonic)) {
      return new Mnemonic(data, wordlist)
    }

    // Handle data overloading
    let ent, phrase, seed
    if (Buffer.isBuffer(data)) {
      seed = data
    } else if (typeof data === 'string') {
      phrase = unorm.nfkd(data)
    } else if (typeof data === 'number') {
      ent = data
    } else if (Array.isArray(data)) {
      wordlist = data
      data = null
    } else if (data) {
      throw new Error('Data must be a Buffer, string, or integer')
    }
    ent = ent || 128

    // Validate and detect wordlist
    wordlist = wordlist || Mnemonic._getDictionary(phrase)
    if (phrase && !wordlist) {
      throw new UnknownWordlistError()
    }
    wordlist = wordlist || Mnemonic.Words.ENGLISH

    // Generate or validate phrase
    if (seed) {
      phrase = Mnemonic._entropy2mnemonic(seed, wordlist)
    }
    if (phrase && !Mnemonic.isValid(phrase, wordlist)) {
      throw new InvalidMnemonicError()
    }
    if (ent % 32 !== 0 || ent < 128) {
      throw new Error('Entropy must be >= 128 and a multiple of 32')
    }

    phrase = phrase || Mnemonic._generateMnemonic(ent, wordlist)

    // Make properties immutable
    Object.defineProperty(this, 'wordlist', {
      configurable: false,
      value: wordlist
    })

    Object.defineProperty(this, 'phrase', {
      configurable: false,
      value: phrase
    })
  }

  /**
   * Generate a random mnemonic
   * @param {Array} wordlist - Optional wordlist to use
   * @returns {Mnemonic}
   */
  static fromRandom(wordlist = Mnemonic.Words.ENGLISH) {
    return new Mnemonic(null, wordlist)
  }

  /**
   * Create a mnemonic from a string
   * @param {string} mnemonic - The mnemonic string
   * @param {Array} wordlist - Optional wordlist to use
   * @returns {Mnemonic}
   */
  static fromString(mnemonic, wordlist = Mnemonic.Words.ENGLISH) {
    preconditions.checkArgument(typeof mnemonic === 'string', 'Mnemonic must be a string')
    return new Mnemonic(mnemonic, wordlist)
  }

  /**
   * Check if a mnemonic is valid
   * @param {string} mnemonic - The mnemonic string
   * @param {Array} wordlist - Optional wordlist to use
   * @returns {boolean}
   */
  static isValid(mnemonic, wordlist) {
    try {
      mnemonic = unorm.nfkd(mnemonic)
      wordlist = wordlist || Mnemonic._getDictionary(mnemonic)

      if (!wordlist) {
        return false
      }

      const words = mnemonic.split(' ')
      let bin = ''
      
      // Convert words to binary
      for (let i = 0; i < words.length; i++) {
        const ind = wordlist.indexOf(words[i])
        if (ind < 0) return false
        bin = bin + ('00000000000' + ind.toString(2)).slice(-11)
      }

      // Validate checksum
      const cs = bin.length / 33
      const hashBits = bin.slice(-cs)
      const nonhashBits = bin.slice(0, bin.length - cs)
      
      // Convert binary to buffer
      const buf = Buffer.alloc(nonhashBits.length / 8)
      for (let i = 0; i < nonhashBits.length / 8; i++) {
        buf.writeUInt8(parseInt(bin.slice(i * 8, (i + 1) * 8), 2), i)
      }
      
      const expectedHashBits = Mnemonic._entropyChecksum(buf)
      return expectedHashBits === hashBits
    } catch (e) {
      return false
    }
  }

  /**
   * Generate a seed from mnemonic and optional passphrase
   * @param {string} passphrase - Optional passphrase
   * @returns {Buffer}
   */
  toSeed(passphrase = '') {
    preconditions.checkArgument(typeof passphrase === 'string', 'Passphrase must be a string')
    return pbkdf2.pbkdf2Sync(
      unorm.nfkd(this.phrase),
      unorm.nfkd('mnemonic' + passphrase),
      2048,
      64,
      'sha512'
    )
  }

  /**
   * Create a mnemonic from a seed
   * @param {Buffer} seed - The seed buffer
   * @param {Array} wordlist - Optional wordlist to use
   * @returns {Mnemonic}
   */
  static fromSeed(seed, wordlist) {
    preconditions.checkArgument(Buffer.isBuffer(seed), 'Seed must be a Buffer')
    preconditions.checkArgument(Array.isArray(wordlist), 'Wordlist must be an array')
    return new Mnemonic(seed, wordlist)
  }

  /**
   * Get string representation
   * @returns {string}
   */
  toString() {
    return this.phrase
  }

  /**
   * Generate mnemonic from entropy
   * @param {Buffer} entropy - Entropy buffer
   * @param {Array} wordlist - Wordlist to use
   * @returns {string}
   * @private
   */
  static _entropy2mnemonic(entropy, wordlist) {
    preconditions.checkArgument(Buffer.isBuffer(entropy), 'Entropy must be a Buffer')
    preconditions.checkArgument(Array.isArray(wordlist), 'Wordlist must be an array')

    const bin = entropy.toString('hex')
      .match(/.{1,2}/g)
      .map(byte => parseInt(byte, 16).toString(2).padStart(8, '0'))
      .join('')

    const cs = Mnemonic._entropyChecksum(entropy)
    const bits = bin + cs
    const chunks = bits.match(/(.{1,11})/g)
    
    return chunks
      .map(binary => wordlist[parseInt(binary, 2)])
      .join(' ')
  }

  /**
   * Generate random mnemonic
   * @param {number} ent - Entropy bits (128-256)
   * @param {Array} wordlist - Wordlist to use
   * @returns {string}
   * @private
   */
  static _generateMnemonic(ent, wordlist) {
    preconditions.checkArgument(ent >= 128 && ent <= 256 && ent % 32 === 0, 'Invalid entropy')
    preconditions.checkArgument(Array.isArray(wordlist), 'Wordlist must be an array')
    
    const entropy = randomBytes(ent / 8)
    return Mnemonic._entropy2mnemonic(entropy, wordlist)
  }

  /**
   * Calculate entropy checksum
   * @param {Buffer} entropy - Entropy buffer
   * @returns {string}
   * @private
   */
  static _entropyChecksum(entropy) {
    preconditions.checkArgument(Buffer.isBuffer(entropy), 'Entropy must be a Buffer')
    
    const hash = createHash('sha256')
      .update(entropy)
      .digest()

    const bits = entropy.length * 8
    const cs = bits / 32

    return hash.toString('hex')
      .match(/.{1,2}/g)
      .map(byte => parseInt(byte, 16).toString(2).padStart(8, '0'))
      .join('')
      .slice(0, cs)
  }

  /**
   * Check if mnemonic belongs to wordlist
   * @param {string} mnemonic - Mnemonic string
   * @param {Array} wordlist - Wordlist to check against
   * @returns {boolean}
   * @private
   */
  static _belongsToWordlist(mnemonic, wordlist) {
    preconditions.checkArgument(typeof mnemonic === 'string', 'Mnemonic must be a string')
    preconditions.checkArgument(Array.isArray(wordlist), 'Wordlist must be an array')
    
    const words = unorm.nfkd(mnemonic).split(' ')
    return words.every(word => wordlist.indexOf(word) >= 0)
  }

  /**
   * Detect wordlist from mnemonic
   * @param {string} mnemonic - Mnemonic string
   * @returns {Array|null}
   * @private
   */
  static _getDictionary(mnemonic) {
    if (!mnemonic) return null

    const dicts = Object.keys(Mnemonic.Words)
    for (const key of dicts) {
      if (Mnemonic._belongsToWordlist(mnemonic, Mnemonic.Words[key])) {
        return Mnemonic.Words[key]
      }
    }
    return null
  }
}

// Import wordlists
Mnemonic.Words = require('./words')

module.exports = Mnemonic
