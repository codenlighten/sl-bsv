const bsv = require('bsv');
const Point = require('./crypto/point');

// Create a secure fork by replacing the vulnerable crypto components
const secureLib = {
  ...bsv,
  crypto: {
    ...bsv.crypto,
    Point: Point  // Replace with our secure implementation
  }
};

module.exports = secureLib;
