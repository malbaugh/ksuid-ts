import { 
  BYTE_LENGTH, 
  EPOCH_STAMP, 
  MAX_STRING_ENCODED, 
  MIN_STRING_ENCODED, 
  PAYLOAD_BYTE_LENGTH, 
  STRING_ENCODED_LENGTH, 
  TIMESTAMP_BYTE_LENGTH 
} from './constants';
import { encodeBase62, decodeBase62 } from './base62';
import { Uint128, uint128Payload } from './uint128';

/**
 * Generate cryptographically secure random bytes
 * Supports both browser and Node.js environments
 */
function getRandomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  
  // Browser
  if (typeof window !== 'undefined' && 
      window.crypto && 
      window.crypto.getRandomValues) {
    window.crypto.getRandomValues(bytes);
    return bytes;
  }
  
  // Node.js environment
  if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    try {
      // Direct require for Node.js environments
      // This will be properly handled by Jest when running in Node environment
      // @ts-ignore - Ignoring TS error since this is a runtime check
      const crypto = require('crypto');
      const nodeRandomBytes = crypto.randomBytes(length);
      for (let i = 0; i < length; i++) {
        bytes[i] = nodeRandomBytes[i];
      }
      return bytes;
    } catch (e: unknown) {
      // Handle errors when require is not available
      const errorMessage = e instanceof Error ? e.message : String(e);
      throw new Error('Failed to load crypto module: ' + errorMessage);
    }
  }
  
  throw new Error('No secure random number generator available');
}

/**
 * KSUID class
 * KSUIDs are 20 bytes:
 * - 00-03 byte: uint32 BE UTC timestamp with custom epoch
 * - 04-19 byte: random "payload"
 */
export class KSUID {
  private readonly bytes: Uint8Array;

  /**
   * Create a KSUID from raw bytes
   */
  constructor(bytes?: Uint8Array) {
    if (bytes) {
      if (bytes.length !== BYTE_LENGTH) {
        throw new Error(`Valid KSUIDs are ${BYTE_LENGTH} bytes`);
      }
      this.bytes = new Uint8Array(bytes);
    } else {
      this.bytes = new Uint8Array(BYTE_LENGTH);
    }
  }

  /**
   * Get the raw byte representation of KSUID
   */
  public getBytes(): Uint8Array {
    return new Uint8Array(this.bytes);
  }

  /**
   * Get the timestamp portion of the ID as a Date object
   */
  public getTime(): Date {
    return new Date((this.getTimestamp() + EPOCH_STAMP) * 1000);
  }

  /**
   * Get the timestamp portion of the ID as a bare integer (uncorrected for KSUID's special epoch)
   */
  public getTimestamp(): number {
    return (this.bytes[0] << 24) | (this.bytes[1] << 16) | (this.bytes[2] << 8) | this.bytes[3];
  }

  /**
   * Get the 16-byte random payload without the timestamp
   */
  public getPayload(): Uint8Array {
    return this.bytes.slice(TIMESTAMP_BYTE_LENGTH);
  }

  /**
   * String-encoded representation
   */
  public toString(): string {
    return encodeBase62(this.bytes);
  }

  /**
   * Check if this is a "nil" KSUID (all zeros)
   */
  public isNil(): boolean {
    return this.equals(KSUID.Nil);
  }

  /**
   * Compare this KSUID with another one
   * Returns negative if this < other, positive if this > other, 0 if equal
   */
  public compare(other: KSUID): number {
    // Ensure we're comparing the actual content of the bytes, not just references
    const thisBytes = this.getBytes();
    const otherBytes = other.getBytes();

    for (let i = 0; i < BYTE_LENGTH; i++) {
      if (thisBytes[i] !== otherBytes[i]) {
        return thisBytes[i] - otherBytes[i];
      }
    }
    return 0;
  }

  /**
   * Check if this KSUID equals another one
   */
  public equals(other: KSUID): boolean {
    // Compare string representations for more reliable equality
    return this.toString() === other.toString();
  }

  /**
   * Get the next KSUID after this one
   */
  public next(): KSUID {
    const timestamp = this.getTimestamp();
    const value = uint128Payload(this.bytes);
    const nextValue = value.increment();
    
    if (nextValue.equals(Uint128.ZERO)) { // overflow
      return new KSUID(nextValue.toKSUID(timestamp + 1));
    }
    
    return new KSUID(nextValue.toKSUID(timestamp));
  }

  /**
   * Get the previous KSUID before this one
   */
  public prev(): KSUID {
    const timestamp = this.getTimestamp();
    const value = uint128Payload(this.bytes);
    const prevValue = value.subtract(Uint128.ONE);
    
    if (prevValue.equals(Uint128.MAX)) { // overflow
      return new KSUID(prevValue.toKSUID(timestamp - 1));
    }
    
    return new KSUID(prevValue.toKSUID(timestamp));
  }

  // Static factory methods

  /**
   * Create a new KSUID with current timestamp and random payload
   */
  public static new(): KSUID {
    return KSUID.randomWithTime(new Date());
  }

  /**
   * Create a new KSUID with a specific timestamp and random payload
   */
  public static randomWithTime(time: Date): KSUID {
    // Generate random payload
    const payload = getRandomBytes(PAYLOAD_BYTE_LENGTH);
    
    // Create byte array for KSUID
    const bytes = new Uint8Array(BYTE_LENGTH);
    
    // Set timestamp
    const timestamp = Math.floor(time.getTime() / 1000) - EPOCH_STAMP;
    bytes[0] = (timestamp >> 24) & 0xFF;
    bytes[1] = (timestamp >> 16) & 0xFF;
    bytes[2] = (timestamp >> 8) & 0xFF;
    bytes[3] = timestamp & 0xFF;
    
    // Set payload
    bytes.set(payload, TIMESTAMP_BYTE_LENGTH);
    
    return new KSUID(bytes);
  }

  /**
   * Create a KSUID from parts (timestamp and payload)
   */
  public static fromParts(time: Date, payload: Uint8Array): KSUID {
    if (payload.length !== PAYLOAD_BYTE_LENGTH) {
      throw new Error(`Valid KSUID payloads are ${PAYLOAD_BYTE_LENGTH} bytes`);
    }
    
    const bytes = new Uint8Array(BYTE_LENGTH);
    
    // Set timestamp
    const timestamp = Math.floor(time.getTime() / 1000) - EPOCH_STAMP;
    bytes[0] = (timestamp >> 24) & 0xFF;
    bytes[1] = (timestamp >> 16) & 0xFF;
    bytes[2] = (timestamp >> 8) & 0xFF;
    bytes[3] = timestamp & 0xFF;
    
    // Set payload
    bytes.set(payload, TIMESTAMP_BYTE_LENGTH);
    
    return new KSUID(bytes);
  }

  /**
   * Create a KSUID from a byte array
   */
  public static fromBytes(bytes: Uint8Array): KSUID {
    return new KSUID(bytes);
  }

  /**
   * Parse a string-encoded KSUID
   */
  public static parse(str: string): KSUID {
    if (str.length !== STRING_ENCODED_LENGTH) {
      throw new Error(`Valid encoded KSUIDs are ${STRING_ENCODED_LENGTH} characters`);
    }
    
    if (str < MIN_STRING_ENCODED || str > MAX_STRING_ENCODED) {
      throw new Error(`Valid encoded KSUIDs are bounded by ${MIN_STRING_ENCODED} and ${MAX_STRING_ENCODED}`);
    }
    
    // Create a new KSUID from the decoded bytes
    const bytes = decodeBase62(str);
    // Make a copy of the bytes to ensure we're not sharing references
    const bytesCopy = new Uint8Array(bytes);
    return new KSUID(bytesCopy);
  }

  /**
   * Parse a string-encoded KSUID, returns Nil on error
   */
  public static parseOrNil(str: string): KSUID {
    try {
      return KSUID.parse(str);
    } catch (e) {
      return KSUID.Nil;
    }
  }

  /**
   * Sort an array of KSUIDs
   */
  public static sort(ids: KSUID[]): void {
    ids.sort((a, b) => a.compare(b));
  }

  /**
   * Check if an array of KSUIDs is sorted
   */
  public static isSorted(ids: KSUID[]): boolean {
    for (let i = 1; i < ids.length; i++) {
      if (ids[i - 1].compare(ids[i]) > 0) {
        return false;
      }
    }
    return true;
  }

  // Static instances

  /**
   * Represents a completely empty (invalid) KSUID
   */
  public static readonly Nil: KSUID = new KSUID(new Uint8Array(BYTE_LENGTH));

  /**
   * Represents the highest value a KSUID can have
   */
  public static readonly Max: KSUID = (() => {
    const bytes = new Uint8Array(BYTE_LENGTH);
    bytes.fill(0xFF);
    return new KSUID(bytes);
  })();
} 