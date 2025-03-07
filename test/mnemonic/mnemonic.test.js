'use strict'

const assert = require('assert')
const Mnemonic = require('../../src/mnemonic')

describe('Secure Mnemonic Implementation', () => {
  describe('Basic Operations', () => {
    it('should generate a valid mnemonic', () => {
      const mnemonic = Mnemonic.fromRandom()
      assert(Mnemonic.isValid(mnemonic.phrase))
    })

    it('should create mnemonic from string', () => {
      // Using a valid BSV mnemonic with correct checksum
      const phrase = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
      const mnemonic = Mnemonic.fromString(phrase)
      assert.strictEqual(mnemonic.phrase, phrase)
      assert(Mnemonic.isValid(mnemonic.phrase))
    })

    it('should reject invalid mnemonic', () => {
      const invalidPhrase = 'invalid mnemonic phrase test'
      assert(!Mnemonic.isValid(invalidPhrase))
      assert.throws(() => Mnemonic.fromString(invalidPhrase), Error)
    })
  })

  describe('Seed Generation', () => {
    it('should generate valid seed', () => {
      const mnemonic = Mnemonic.fromRandom()
      const seed = mnemonic.toSeed()
      assert(Buffer.isBuffer(seed))
      assert.strictEqual(seed.length, 64)
    })

    it('should generate different seeds with different passphrases', () => {
      const mnemonic = Mnemonic.fromRandom()
      const seed1 = mnemonic.toSeed('passphrase1')
      const seed2 = mnemonic.toSeed('passphrase2')
      assert.notStrictEqual(seed1.toString('hex'), seed2.toString('hex'))
    })
  })

  describe('Security Validations', () => {
    it('should validate entropy size', () => {
      assert.throws(() => new Mnemonic(120), Error) // Invalid entropy bits
      assert.throws(() => new Mnemonic(129), Error) // Not multiple of 32
    })

    it('should validate wordlist', () => {
      // Using a valid BSV mnemonic with correct checksum
      const phrase = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
      assert.throws(() => new Mnemonic(phrase, ['invalid', 'wordlist']), Error)
    })

    it('should prevent wordlist modifications', () => {
      const mnemonic = Mnemonic.fromRandom()
      assert.throws(() => {
        mnemonic.wordlist.push('newword')
      }, TypeError)
    })

    it('should validate checksum', () => {
      // Using a valid BSV mnemonic and modifying last word to create invalid checksum
      const validPhrase = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
      const invalidPhrase = validPhrase.split(' ').slice(0, -1).concat(['zoo']).join(' ')
      assert(!Mnemonic.isValid(invalidPhrase))
    })
  })

  describe('Language Support', () => {
    it('should support English wordlist', () => {
      const mnemonic = Mnemonic.fromRandom()
      assert(mnemonic.wordlist === Mnemonic.Words.ENGLISH)
    })

    it('should detect wordlist from phrase', () => {
      // Using a valid BSV mnemonic with correct checksum
      const phrase = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
      const mnemonic = new Mnemonic(phrase)
      assert(mnemonic.wordlist === Mnemonic.Words.ENGLISH)
    })
  })
})
