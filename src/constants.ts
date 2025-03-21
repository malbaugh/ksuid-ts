// KSUID constants
export const EPOCH_STAMP = 1400000000;  // 14e8, March 2017

// Byte lengths
export const TIMESTAMP_BYTE_LENGTH = 4;  // Timestamp is a uint32
export const PAYLOAD_BYTE_LENGTH = 16;   // Payload is 16-bytes
export const BYTE_LENGTH = TIMESTAMP_BYTE_LENGTH + PAYLOAD_BYTE_LENGTH;  // KSUIDs are 20 bytes when binary encoded

// String encoding
export const STRING_ENCODED_LENGTH = 27;  // The length of a KSUID when string (base62) encoded
export const MIN_STRING_ENCODED = "000000000000000000000000000";  // A string-encoded minimum value for a KSUID
export const MAX_STRING_ENCODED = "aWgEPTl1tmebfsQzFP4bxwgy80V";  // A string-encoded maximum value for a KSUID

// Base62 character set for encoding
export const BASE62_CHARACTERS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
export const ZERO_STRING = "000000000000000000000000000";
export const OFFSET_UPPERCASE = 10;
export const OFFSET_LOWERCASE = 36; 