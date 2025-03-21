import { 
  BASE62_CHARACTERS, 
  ZERO_STRING, 
  OFFSET_UPPERCASE, 
  OFFSET_LOWERCASE,
  STRING_ENCODED_LENGTH,
  BYTE_LENGTH
} from './constants';

/**
 * Converts a base 62 character into the number value that it represents
 */
export function base62Value(digit: string): number {
  const charCode = digit.charCodeAt(0);
  if (charCode >= 48 && charCode <= 57) { // 0-9
    return charCode - 48;
  } else if (charCode >= 65 && charCode <= 90) { // A-Z
    return OFFSET_UPPERCASE + (charCode - 65);
  } else { // a-z
    return OFFSET_LOWERCASE + (charCode - 97);
  }
}

/**
 * Encodes a Uint8Array to base62 string
 */
export function encodeBase62(bytes: Uint8Array): string {
  return fastEncodeBase62(bytes);
}

/**
 * Decodes a base62 string to Uint8Array
 */
export function decodeBase62(str: string): Uint8Array {
  const dst = new Uint8Array(BYTE_LENGTH);
  if (fastDecodeBase62(dst, new TextEncoder().encode(str))) {
    return dst;
  }
  throw new Error('Failed to decode base62 string');
}

/**
 * Optimized base62 encoding implementation
 */
export function fastEncodeBase62(src: Uint8Array): string {
  const dst = new Uint8Array(STRING_ENCODED_LENGTH);
  
  // Split src into 5 4-byte words
  const parts = [
    (src[0] << 24) | (src[1] << 16) | (src[2] << 8) | src[3],
    (src[4] << 24) | (src[5] << 16) | (src[6] << 8) | src[7],
    (src[8] << 24) | (src[9] << 16) | (src[10] << 8) | src[11],
    (src[12] << 24) | (src[13] << 16) | (src[14] << 8) | src[15],
    (src[16] << 24) | (src[17] << 16) | (src[18] << 8) | src[19],
  ];
  
  const srcBase = 4294967296; // 2^32
  const dstBase = 62;
  
  let bp = [...parts];
  let n = STRING_ENCODED_LENGTH;
  
  while (bp.length !== 0) {
    const quotient: number[] = [];
    let remainder = 0;
    
    for (const c of bp) {
      // This is emulating bigint arithmetic since JS doesn't handle 128-bit integers well
      const value = c + remainder * srcBase;
      const digit = Math.floor(value / dstBase);
      remainder = value % dstBase;
      
      if (quotient.length !== 0 || digit !== 0) {
        quotient.push(digit);
      }
    }
    
    n--;
    dst[n] = BASE62_CHARACTERS.charCodeAt(remainder);
    bp = quotient;
  }
  
  // Add padding at the head of the destination buffer
  for (let i = 0; i < n; i++) {
    dst[i] = ZERO_STRING.charCodeAt(i);
  }
  
  return new TextDecoder().decode(dst);
}

/**
 * Optimized base62 decoding implementation
 */
export function fastDecodeBase62(dst: Uint8Array, src: Uint8Array): boolean {
  if (src.length !== STRING_ENCODED_LENGTH) {
    return false;
  }
  
  const srcBase = 62;
  const dstBase = 4294967296; // 2^32
  
  // Convert base62 characters to their numeric value
  const parts = new Uint8Array(STRING_ENCODED_LENGTH);
  for (let i = 0; i < STRING_ENCODED_LENGTH; i++) {
    parts[i] = base62Value(String.fromCharCode(src[i]));
  }
  
  let n = BYTE_LENGTH;
  let bp = Array.from(parts);
  
  while (bp.length > 0) {
    const quotient: number[] = [];
    let remainder = 0;
    
    for (const c of bp) {
      const value = c + remainder * srcBase;
      const digit = Math.floor(value / dstBase);
      remainder = value % dstBase;
      
      if (quotient.length !== 0 || digit !== 0) {
        quotient.push(digit);
      }
    }
    
    if (n < 4) {
      return false;
    }
    
    dst[n-4] = (remainder >> 24) & 0xFF;
    dst[n-3] = (remainder >> 16) & 0xFF;
    dst[n-2] = (remainder >> 8) & 0xFF;
    dst[n-1] = remainder & 0xFF;
    n -= 4;
    bp = quotient;
  }
  
  // Zero out any remaining bytes
  for (let i = 0; i < n; i++) {
    dst[i] = 0;
  }
  
  return true;
} 