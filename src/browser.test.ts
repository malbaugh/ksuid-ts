import { KSUID } from './ksuid';
import { Sequence } from './sequence';

// These tests focus on functionality that should work in both browser and Node.js environments

describe('KSUID Browser Compatibility', () => {
  it('should generate new KSUIDs in any environment', () => {
    const id = KSUID.new();
    expect(id).toBeInstanceOf(KSUID);
  });

  it('should parse and stringify KSUIDs correctly', () => {
    const id = KSUID.new();
    const str = id.toString();
    const parsed = KSUID.parse(str);
    
    // Check that the string representation is valid
    expect(str.length).toBe(27); // String-encoded KSUID length
    expect(parsed.toString().length).toBe(27);
  });

  it('should work with sequences', () => {
    const seq = new Sequence();
    const id1 = seq.next();
    const id2 = seq.next();
    
    expect(id1.compare(id2)).toBeLessThan(0);
  });

  it('should properly handle timestamp operations', () => {
    const now = new Date();
    const id = KSUID.randomWithTime(now);
    const time = id.getTime();
    
    // Should be within 1 second
    const diffMs = Math.abs(now.getTime() - time.getTime());
    expect(diffMs).toBeLessThan(1000);
  });
  
  it('should properly compare KSUIDs', () => {
    const now = new Date();
    const earlier = new Date(now.getTime() - 10000);
    
    const id1 = KSUID.randomWithTime(earlier);
    const id2 = KSUID.randomWithTime(now);
    
    expect(id1.compare(id2)).toBeLessThan(0);
    expect(id2.compare(id1)).toBeGreaterThan(0);
    expect(id1.compare(id1)).toBe(0);
  });
  
  it('should properly handle the Nil KSUID', () => {
    const nilId = KSUID.Nil;
    expect(nilId.isNil()).toBe(true);
    
    const nonNilId = KSUID.new();
    expect(nonNilId.isNil()).toBe(false);
  });
}); 