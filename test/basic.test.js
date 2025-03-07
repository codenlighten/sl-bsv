const assert = require('assert');
const bsv = require('../src/index.js');

describe('BSV Fork Basic Tests', () => {
  it('should export bsv module', () => {
    assert.strictEqual(typeof bsv, 'object');
    assert.strictEqual(typeof bsv.Address, 'function');
  });
});
