'use strict'

const BN = require('bn.js')
const EC = require('elliptic').ec
const ec = new EC('secp256k1')

class Point {
  constructor(x, y, isRed) {
    try {
      if (x && x.x && x.y) {
        // If x is already an EC point
        if (x.isInfinity()) {
          throw new Error('Invalid Point')
        }
        this._point = x
      } else if (x === undefined && y === undefined) {
        throw new Error('Invalid Point')
      } else if (x && x.isInfinity && x.isInfinity()) {
        throw new Error('Invalid Point')
      } else {
        // Regular point construction
        try {
          this._point = ec.curve.point(x, y, isRed)
          if (this._point.isInfinity()) {
            throw new Error('Invalid Point')
          }
        } catch (e) {
          throw new Error('Invalid Point')
        }
      }
      
      // Validate the point is on the curve
      if (!this._point.validate()) {
        throw new Error('Invalid Point')
      }
    } catch (e) {
      throw new Error('Invalid Point')
    }
  }

  get x() { return this._point.x }
  get y() { return this._point.y }
  getX() { 
    return new BN(this._point.getX().toArray()) 
  }
  getY() { 
    return new BN(this._point.getY().toArray()) 
  }
  isInfinity() { return this._point.isInfinity() }
  
  mul(k) { 
    if (!BN.isBN(k)) {
      throw new Error('Scalar must be a BigNumber')
    }
    const result = this._point.mul(k)
    try {
      return new Point(result)
    } catch (e) {
      // If point construction fails (e.g., infinity point), return raw EC point
      return result
    }
  }

  validate() {
    if (this.isInfinity()) {
      throw new Error('Invalid Point')
    }

    // Check if point is on curve using elliptic's built-in validation
    if (!this._point.validate()) {
      throw new Error('Invalid Point')
    }

    return this
  }

  static fromX(odd, x) {
    if (!BN.isBN(x)) {
      throw new Error('X must be a BigNumber')
    }
    try {
      const xRed = x.toRed(ec.curve.red)
      const point = ec.curve.pointFromX(xRed, odd)
      return new Point(point)
    } catch (e) {
      throw new Error('Invalid X')
    }
  }

  static getG() {
    return new Point(ec.curve.g)
  }

  static getN() {
    return new BN(ec.curve.n.toArray())
  }

  toBuffer() {
    if (this.isInfinity()) {
      throw new Error('Cannot compress infinity point')
    }

    const x = this.getX()
    const y = this.getY()
    const prefix = Buffer.from([y.isOdd() ? 0x03 : 0x02])
    const xbuf = x.toArrayLike(Buffer, 'be', 32)
    return Buffer.concat([prefix, xbuf])
  }

  toHex() {
    if (this.isInfinity()) {
      throw new Error('Cannot convert infinity point to hex')
    }
    return this.toBuffer().toString('hex')
  }

  static fromBuffer(buf) {
    if (!Buffer.isBuffer(buf) || buf.length !== 33) {
      throw new Error('Invalid buffer length')
    }

    const prefix = buf[0]
    let odd
    if (prefix === 0x03) {
      odd = true
    } else if (prefix === 0x02) {
      odd = false
    } else {
      throw new Error('Invalid compressed prefix')
    }

    const x = new BN(buf.slice(1, 33), 16, 'be')
    return Point.fromX(odd, x)
  }

  static fromHex(hex) {
    if (typeof hex !== 'string') {
      throw new Error('Input must be a hex string')
    }
    return Point.fromBuffer(Buffer.from(hex, 'hex'))
  }
}

module.exports = Point
