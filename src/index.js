const bsv = require('bsv');
const Point = require('./crypto/point');
const Mnemonic = require('./mnemonic');

// Create a secure fork by replacing the vulnerable crypto components
// and adding our BSV-compatible mnemonic implementation
const secureLib = {
  ...bsv,
  crypto: {
    ...bsv.crypto,
    Point: Point  // Replace with our secure implementation
  },
  Mnemonic: Mnemonic  // Add our BSV-compatible mnemonic implementation
};

module.exports = secureLib;
