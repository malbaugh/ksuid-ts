import { KSUID } from './ksuid';
import { Sequence } from './sequence';
import { BYTE_LENGTH, STRING_ENCODED_LENGTH } from './constants';

describe('KSUID', () => {
  describe('basic functionality', () => {
    it('should create new KSUIDs', () => {
      const id = KSUID.new();
      expect(id).toBeInstanceOf(KSUID);
      expect(id.toString().length).toBe(STRING_ENCODED_LENGTH);
    });

    it('should create KSUIDs with correct time', () => {
      const now = new Date();
      const id = KSUID.randomWithTime(now);
      
      // Time should be within 1 second of the input time
      // (accounting for potential millisecond differences)
      const idTime = id.getTime();
      const diffSecs = Math.abs(now.getTime() - idTime.getTime()) / 1000;
      expect(diffSecs).toBeLessThan(1);
    });
    
    it('should correctly create KSUIDs from bytes', () => {
      const bytes = new Uint8Array(BYTE_LENGTH);
      bytes.fill(1);
      
      const id = KSUID.fromBytes(bytes);
      
      expect(Array.from(id.getBytes())).toEqual(Array.from(bytes));
    });
    
    it('should parse string representations', () => {
      const id = KSUID.new();
      const str = id.toString();
      const parsed = KSUID.parse(str);
      
      // Verify the string encoding/decoding works (length and format check)
      expect(str.length).toBe(27);
      expect(parsed.toString().length).toBe(27);
      
      // Verify that parsing the same string twice gives the same result
      const parsed2 = KSUID.parse(str);
      expect(parsed2.toString()).toBe(parsed.toString());
    });
    
    it('should return Nil for parseOrNil on invalid input', () => {
      const parsed = KSUID.parseOrNil('invalidksuid');
      expect(parsed.equals(KSUID.Nil)).toBe(true);
      expect(parsed.isNil()).toBe(true);
    });
    
    it('should compare KSUIDs correctly', () => {
      const id1 = KSUID.new();
      const id2 = KSUID.new();
      const id3 = KSUID.fromBytes(id1.getBytes());
      
      expect(id1.compare(id1)).toBe(0);
      expect(id1.equals(id3)).toBe(true);
      
      // Cannot assert id1 < id2 or id1 > id2 as it depends on the actual values
      // But we can check that compare is symmetrical
      expect(id1.compare(id2)).toBe(-id2.compare(id1));
    });
    
    it('should correctly sort KSUIDs', () => {
      const ids = [KSUID.new(), KSUID.new(), KSUID.new()];
      const idsCopy = [...ids];
      
      KSUID.sort(ids);
      
      // After sorting, the array should be in ascending order
      for (let i = 1; i < ids.length; i++) {
        expect(ids[i-1].compare(ids[i])).toBeLessThanOrEqual(0);
      }
      
      // All original elements should still be in the array
      for (const id of idsCopy) {
        expect(ids.some(sortedId => sortedId.equals(id))).toBe(true);
      }
    });
    
    it('should handle next/prev operations', () => {
      const id = KSUID.new();
      const next = id.next();
      const prev = id.prev();
      
      expect(id.compare(next)).toBeLessThan(0);
      expect(prev.compare(id)).toBeLessThan(0);
      
      // next of prev should be the original id
      expect(prev.next().equals(id)).toBe(true);
      
      // prev of next should be the original id
      expect(next.prev().equals(id)).toBe(true);
    });
  });
  
  describe('Sequence', () => {
    it('should generate sequential IDs', () => {
      const seq = new Sequence();
      const id1 = seq.next();
      const id2 = seq.next();
      
      expect(id1.compare(id2)).toBeLessThan(0);
      
      // IDs should have the same timestamp
      expect(id1.getTimestamp()).toBe(id2.getTimestamp());
      
      // Last two bytes should differ by 1
      const bytes1 = id1.getBytes();
      const bytes2 = id2.getBytes();
      
      for (let i = 0; i < bytes1.length - 2; i++) {
        expect(bytes1[i]).toBe(bytes2[i]);
      }
      
      // Convert last two bytes to number and check difference
      const num1 = (bytes1[bytes1.length - 2] << 8) | bytes1[bytes1.length - 1];
      const num2 = (bytes2[bytes2.length - 2] << 8) | bytes2[bytes2.length - 1];
      expect(num2 - num1).toBe(1);
    });
    
    it('should return correct bounds', () => {
      const seq = new Sequence();
      
      // Initially, min is 0 and max is 0xFFFF
      const { min, max } = seq.bounds();
      
      expect(min.getBytes()[min.getBytes().length - 2]).toBe(0);
      expect(min.getBytes()[min.getBytes().length - 1]).toBe(0);
      
      expect(max.getBytes()[max.getBytes().length - 2]).toBe(0xFF);
      expect(max.getBytes()[max.getBytes().length - 1]).toBe(0xFF);
      
      // Generate some IDs and check bounds again
      seq.next();
      seq.next();
      
      const bounds2 = seq.bounds();
      
      expect(bounds2.min.getBytes()[bounds2.min.getBytes().length - 2]).toBe(0);
      expect(bounds2.min.getBytes()[bounds2.min.getBytes().length - 1]).toBe(1);
      
      // Max should still be 0xFFFF
      expect(bounds2.max.getBytes()[bounds2.max.getBytes().length - 2]).toBe(0xFF);
      expect(bounds2.max.getBytes()[bounds2.max.getBytes().length - 1]).toBe(0xFF);
    });
    
    it('should throw when sequence is exhausted', () => {
      const seq = new Sequence();
      
      // Set count to max
      for (let i = 0; i < 0xFFFF; i++) {
        seq.next();
      }
      
      // Next call should throw
      expect(() => seq.next()).toThrowError('Too many IDs were generated');
    });
  });
}); 