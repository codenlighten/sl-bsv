'use strict';

// Import the raw wordlist without validation
const wordlist = require('../src/mnemonic/words/english.js').slice();

console.log('Total words:', wordlist.length);

const invalidWords = wordlist.filter(word => word.length < 4 || word.length > 8);
console.log('\nWords with invalid length (should be 4-8 characters):');
invalidWords.forEach(word => console.log(`${word} (${word.length} chars)`));

// Check for duplicate prefixes
const prefixes = new Set();
const duplicatePrefixes = [];
wordlist.forEach(word => {
    const prefix = word.slice(0, 4);
    if (prefixes.has(prefix)) {
        duplicatePrefixes.push({ word, prefix });
    }
    prefixes.add(prefix);
});

if (duplicatePrefixes.length > 0) {
    console.log('\nWords with duplicate prefixes:');
    duplicatePrefixes.forEach(({ word, prefix }) => 
        console.log(`${word} (prefix: ${prefix})`));
}
