import { TIMESTAMP_BYTE_LENGTH } from './constants';

/**
 * Class representing an unsigned 128-bit integer
 * Implemented as an array of two 64-bit values [low, high]
 */
export class Uint128 {
  private readonly values: [bigint, bigint];

  constructor(high: bigint | number = 0n, low: bigint | number = 0n) {
    this.values = [
      typeof low === 'number' ? BigInt(low) : low,
      typeof high === 'number' ? BigInt(high) : high
    ];
  }

  /**
   * Create a Uint128 from a payload section of a KSUID
   */
  static fromPayload(payload: Uint8Array): Uint128 {
    // Convert the payload into two 64-bit bigints
    const high = this.bytesToBigInt(payload.slice(0, 8));
    const low = this.bytesToBigInt(payload.slice(8, 16));
    return new Uint128(high, low);
  }

  /**
   * Convert bytes to a bigint
   */
  private static bytesToBigInt(bytes: Uint8Array): bigint {
    let result = 0n;
    for (let i = 0; i < bytes.length; i++) {
      result = (result << 8n) | BigInt(bytes[i]);
    }
    return result;
  }

  /**
   * Get the KSUID from this Uint128 and the given timestamp
   */
  toKSUID(timestamp: number): Uint8Array {
    const result = new Uint8Array(20);
    
    // Write timestamp (4 bytes)
    result[0] = (timestamp >> 24) & 0xFF;
    result[1] = (timestamp >> 16) & 0xFF;
    result[2] = (timestamp >> 8) & 0xFF;
    result[3] = timestamp & 0xFF;
    
    // Write high 64 bits
    this.writeBigInt(result, 4, this.values[1], 8);
    
    // Write low 64 bits
    this.writeBigInt(result, 12, this.values[0], 8);
    
    return result;
  }

  /**
   * Write a bigint to a Uint8Array at a specific offset
   */
  private writeBigInt(array: Uint8Array, offset: number, value: bigint, length: number): void {
    for (let i = 0; i < length; i++) {
      const shift = BigInt(8 * (length - 1 - i));
      array[offset + i] = Number((value >> shift) & 0xFFn);
    }
  }

  /**
   * Convert Uint128 to bytes
   */
  toBytes(): Uint8Array {
    const result = new Uint8Array(16);
    this.writeBigInt(result, 0, this.values[1], 8);
    this.writeBigInt(result, 8, this.values[0], 8);
    return result;
  }

  /**
   * String representation of the Uint128
   */
  toString(): string {
    return `0x${this.values[1].toString(16).padStart(16, '0')}${this.values[0].toString(16).padStart(16, '0')}`;
  }

  /**
   * Compare with another Uint128
   */
  compare(other: Uint128): number {
    if (this.values[1] < other.values[1]) return -1;
    if (this.values[1] > other.values[1]) return 1;
    if (this.values[0] < other.values[0]) return -1;
    if (this.values[0] > other.values[0]) return 1;
    return 0;
  }

  /**
   * Add another Uint128
   */
  add(other: Uint128): Uint128 {
    let low = this.values[0] + other.values[0];
    let high = this.values[1] + other.values[1];
    
    // Handle carry
    if (low > 0xFFFFFFFFFFFFFFFFn) {
      high += 1n;
      low &= 0xFFFFFFFFFFFFFFFFn;
    }
    
    return new Uint128(high, low);
  }

  /**
   * Subtract another Uint128
   */
  subtract(other: Uint128): Uint128 {
    let low: bigint, high: bigint;
    
    if (this.values[0] >= other.values[0]) {
      low = this.values[0] - other.values[0];
      high = this.values[1] - other.values[1];
    } else {
      low = this.values[0] + 0x10000000000000000n - other.values[0];
      high = this.values[1] - 1n - other.values[1];
    }
    
    return new Uint128(high, low);
  }

  /**
   * Increment by 1
   */
  increment(): Uint128 {
    let low = this.values[0] + 1n;
    let high = this.values[1];
    
    if (low > 0xFFFFFFFFFFFFFFFFn) {
      high += 1n;
      low = 0n;
    }
    
    return new Uint128(high, low);
  }

  /**
   * Check if this Uint128 equals another
   */
  equals(other: Uint128): boolean {
    return this.values[0] === other.values[0] && this.values[1] === other.values[1];
  }

  /**
   * Get a Uint128 with value 0
   */
  static get ZERO(): Uint128 {
    return new Uint128(0n, 0n);
  }

  /**
   * Get a Uint128 with value 1
   */
  static get ONE(): Uint128 {
    return new Uint128(0n, 1n);
  }

  /**
   * Get a Uint128 with max value (all bits set to 1)
   */
  static get MAX(): Uint128 {
    return new Uint128(0xFFFFFFFFFFFFFFFFn, 0xFFFFFFFFFFFFFFFFn);
  }
}

/**
 * Extract Uint128 payload from a KSUID
 */
export function uint128Payload(ksuid: Uint8Array): Uint128 {
  return Uint128.fromPayload(ksuid.slice(TIMESTAMP_BYTE_LENGTH));
} 