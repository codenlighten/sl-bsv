# sl-bsv

A security-enhanced fork of bsv@1.5 with improved elliptic curve implementation by [SmartLedger Solutions](https://smartledger.solutions).

## Security Improvements

This fork enhances the security of the original bsv library by:

1. **Updated Dependencies**
   - elliptic ^6.5.5 (latest secure version)
   - bn.js ^5.2.1 (improved BigNumber handling)

2. **Enhanced Point Implementation**
   - Strict input validation
   - Comprehensive point validation on curve
   - Secure infinity point handling
   - Type validation for scalar multiplication
   - Secure serialization methods

3. **Additional Security Features**
   - Points are validated during construction
   - Invalid points (including infinity) are rejected
   - Buffer operations include size validation
   - All operations use secure elliptic curve implementation

## Installation

```bash
npm install sl-bsv
```

## Usage

```javascript
const { Point } = require('sl-bsv');

// Create a point
const G = Point.getG();  // Get generator point

// Scalar multiplication
const privKey = new BN('1234567890');
const pubKey = G.mul(privKey);

// Point validation
pubKey.validate();  // Throws if point is invalid

// Serialization
const compressed = pubKey.toBuffer();
const hex = pubKey.toHex();
```

## API Reference

### Point Class

#### Constructor
- `new Point(x, y, isRed)` - Creates a new point with coordinates (x,y)
- Throws 'Invalid Point' if point is invalid or not on curve

#### Static Methods
- `Point.fromX(odd, x)` - Creates point from x-coordinate
- `Point.getG()` - Returns generator point
- `Point.getN()` - Returns curve order
- `Point.fromBuffer(buf)` - Creates point from compressed format
- `Point.fromHex(hex)` - Creates point from hex string

#### Instance Methods
- `point.validate()` - Validates point is on curve
- `point.mul(k)` - Scalar multiplication
- `point.toBuffer()` - Converts to compressed format
- `point.toHex()` - Converts to hex string
- `point.isInfinity()` - Checks if point is infinity

## Testing

```bash
npm test
```

## License

MIT License

Copyright (c) 2025 SmartLedger Solutions

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Security

If you discover a security vulnerability, please contact us at developer@smartledger.solutions

## Author

[SmartLedger Solutions](https://smartledger.solutions)

## Contributors

- [codenlighten](https://github.com/codenlighten)
