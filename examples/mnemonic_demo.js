'use strict'

const Mnemonic = require('../src/mnemonic')

console.log('BSV Mnemonic Implementation Demo\n')

// Test different entropy sizes (128 bits = 12 words, 256 bits = 24 words)
console.log('Testing different mnemonic lengths:')

console.log('\n1. 12-word mnemonic (128 bits entropy):')
const mnemonic12 = new Mnemonic(128)
console.log('Phrase:', mnemonic12.phrase)
console.log('Word count:', mnemonic12.phrase.split(' ').length)
console.log('Is valid:', Mnemonic.isValid(mnemonic12.phrase))

console.log('\n2. 24-word mnemonic (256 bits entropy):')
const mnemonic24 = new Mnemonic(256)
console.log('Phrase:', mnemonic24.phrase)
console.log('Word count:', mnemonic24.phrase.split(' ').length)
console.log('Is valid:', Mnemonic.isValid(mnemonic24.phrase))

// Test seed generation with 24-word phrase
console.log('\n3. Generate seed from 24-word phrase:')
const seed24 = mnemonic24.toSeed('test passphrase')
console.log('Seed:', seed24.toString('hex'))

// Validate a known 24-word test vector
console.log('\n4. Validate known 24-word test vector:')
const test24 = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon art'
console.log('Is valid:', Mnemonic.isValid(test24))
try {
    const knownMnemonic = Mnemonic.fromString(test24)
    console.log('Successfully created mnemonic from test vector')
    console.log('Generated seed:', knownMnemonic.toSeed().toString('hex'))
} catch (e) {
    console.log('Error:', e.message)
}
