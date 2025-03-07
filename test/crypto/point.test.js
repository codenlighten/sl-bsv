const assert = require('assert');
const chai = require('chai');
const expect = chai.expect;
const BN = require('bn.js');
const Point = require('../../src/crypto/point');

describe('Secure Point Implementation', () => {
  describe('Basic Point Operations', () => {
    it('should create a valid point', () => {
      const G = Point.getG();
      expect(G).to.be.an.instanceOf(Point);
      expect(() => G.validate()).to.not.throw();
    });

    it('should reject invalid points', () => {
      expect(() => new Point(0, 0)).to.throw('Invalid Point');
    });

    it('should handle point multiplication', () => {
      const G = Point.getG();
      const n = Point.getN();
      const result = G.mul(n);
      expect(result.isInfinity()).to.be.true;
    });
  });

  describe('Point Serialization', () => {
    it('should correctly compress and decompress points', () => {
      const G = Point.getG();
      const compressed = G.toBuffer();
      expect(compressed.length).to.equal(33); // Compressed point format: prefix (1 byte) + x (32 bytes)
      
      const decompressed = Point.fromBuffer(compressed);
      expect(decompressed.getX().toString()).to.equal(G.getX().toString());
      expect(decompressed.getY().toString()).to.equal(G.getY().toString());
    });

    it('should handle hex serialization', () => {
      const G = Point.getG();
      const hex = G.toHex();
      const fromHex = Point.fromHex(hex);
      expect(fromHex.getX().toString()).to.equal(G.getX().toString());
    });
  });

  describe('Security Validations', () => {
    it('should validate point is on curve', () => {
      const G = Point.getG();
      expect(() => G.validate()).to.not.throw();
      
      // Try to create point with invalid y coordinate
      const x = G.getX();
      const y = new BN('1234567890');
      expect(() => new Point(x, y)).to.throw();
    });

    it('should reject infinity point', () => {
      const G = Point.getG();
      const n = Point.getN();
      const infinity = G.mul(n);
      expect(() => new Point(infinity.x, infinity.y)).to.throw('Invalid Point');
    });

    it('should validate scalar multiplication input', () => {
      const G = Point.getG();
      expect(() => G.mul('not a BN')).to.throw('Scalar must be a BigNumber');
    });
  });
});
