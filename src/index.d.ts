// Type definitions for KSUID
// TypeScript Version: 4.5

/**
 * KSUID - K-Sortable Unique IDentifier
 * Efficient 20-byte sortable identifiers with timestamp component
 */

// Constants
export const EPOCH_STAMP: number;
export const TIMESTAMP_BYTE_LENGTH: number;
export const PAYLOAD_BYTE_LENGTH: number;
export const BYTE_LENGTH: number;
export const STRING_ENCODED_LENGTH: number;

// Utility functions
export function encodeBase62(bytes: Uint8Array): string;
export function decodeBase62(str: string): Uint8Array;

/**
 * KSUID class - Represents a K-Sortable Unique IDentifier
 * KSUIDs are 20 bytes:
 * - First 4 bytes: timestamp with custom epoch (seconds since 2014-05-13)
 * - Last 16 bytes: random payload
 */
export class KSUID {
  /**
   * Create a KSUID from raw bytes
   */
  constructor(bytes?: Uint8Array);
  
  /**
   * Get the raw byte representation of KSUID
   */
  getBytes(): Uint8Array;
  
  /**
   * Get the timestamp portion of the ID as a Date object
   */
  getTime(): Date;
  
  /**
   * Get the timestamp portion of the ID as an integer (seconds since KSUID epoch)
   */
  getTimestamp(): number;
  
  /**
   * Get the 16-byte random payload without the timestamp
   */
  getPayload(): Uint8Array;
  
  /**
   * String-encoded representation (27 character base62 encoded string)
   */
  toString(): string;
  
  /**
   * Check if this is a "nil" KSUID (all zeros)
   */
  isNil(): boolean;
  
  /**
   * Compare this KSUID with another one
   * @returns Negative if this < other, zero if equal, positive if this > other
   */
  compare(other: KSUID): number;
  
  /**
   * Check if this KSUID equals another one
   */
  equals(other: KSUID): boolean;
  
  /**
   * Get the next KSUID after this one
   */
  next(): KSUID;
  
  /**
   * Get the previous KSUID before this one
   */
  prev(): KSUID;
  
  // Static factory methods
  
  /**
   * Create a new KSUID with current timestamp and random payload
   */
  static new(): KSUID;
  
  /**
   * Create a new KSUID with a specific timestamp and random payload
   */
  static randomWithTime(time: Date): KSUID;
  
  /**
   * Create a KSUID from timestamp and payload
   */
  static fromParts(time: Date, payload: Uint8Array): KSUID;
  
  /**
   * Create a KSUID from a byte array
   */
  static fromBytes(bytes: Uint8Array): KSUID;
  
  /**
   * Parse a string-encoded KSUID
   */
  static parse(str: string): KSUID;
  
  /**
   * Parse a string-encoded KSUID, returns Nil on error
   */
  static parseOrNil(str: string): KSUID;
  
  /**
   * Sort an array of KSUIDs
   */
  static sort(ids: KSUID[]): void;
  
  /**
   * Check if an array of KSUIDs is sorted
   */
  static isSorted(ids: KSUID[]): boolean;
  
  // Static instances
  
  /**
   * Represents a completely empty (invalid) KSUID
   */
  static readonly Nil: KSUID;
  
  /**
   * Represents the highest value a KSUID can have
   */
  static readonly Max: KSUID;
}

/**
 * Sequence class - generates a sequence of ordered KSUIDs from a seed
 * Up to 65536 KSUIDs can be generated from a single seed
 */
export class Sequence {
  /**
   * The seed KSUID is used as base for the generator
   */
  seed: KSUID;
  
  /**
   * Create a new Sequence with optional seed
   */
  constructor(options?: { seed?: KSUID });
  
  /**
   * Produces the next KSUID in the sequence
   * @returns The next KSUID or throws error if sequence is exhausted
   */
  next(): KSUID;
  
  /**
   * Returns the inclusive min and max bounds of KSUIDs that may be generated
   */
  bounds(): { min: KSUID, max: KSUID };
} 