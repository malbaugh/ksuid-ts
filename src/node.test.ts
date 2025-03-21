import { KSUID } from './ksuid';
import { Sequence } from './sequence';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('KSUID Node.js Specific Tests', () => {
  it('should generate consistent KSUIDs', () => {
    const ids = Array.from({ length: 100 }, () => KSUID.new());
    
    // Check that all generated KSUIDs are unique
    const uniqueIds = new Set(ids.map(id => id.toString()));
    expect(uniqueIds.size).toBe(ids.length);
    
    // Check that timestamps are approximately correct (not asserting exact values)
    const now = Math.floor(Date.now() / 1000);
    
    ids.forEach(id => {
      const timestamp = id.getTimestamp();
      // The timestamp should be after the KSUID epoch (1400000000) and before now
      expect(timestamp).toBeGreaterThanOrEqual(0);
      expect(timestamp).toBeLessThanOrEqual(now - 1400000000);
    });
  });

  it('should save and load KSUIDs to/from files', () => {
    const id = KSUID.new();
    const idString = id.toString();
    const tempPath = path.join(os.tmpdir(), `ksuid-test-${Date.now()}.txt`);
    
    // Write to file
    fs.writeFileSync(tempPath, idString);
    
    // Read from file
    const loadedString = fs.readFileSync(tempPath, 'utf8');
    const loadedId = KSUID.parse(loadedString);
    
    // Clean up
    fs.unlinkSync(tempPath);
    
    // Verify the loaded string is valid
    expect(loadedId.toString().length).toBe(27);
    expect(loadedString).toBe(idString);
  });
  
  it('should handle binary representation correctly', () => {
    const id = KSUID.new();
    const bytes = id.getBytes();
    const tempPath = path.join(os.tmpdir(), `ksuid-binary-test-${Date.now()}.bin`);
    
    // Write binary representation to file
    fs.writeFileSync(tempPath, Buffer.from(bytes));
    
    // Read binary representation from file
    const loadedBytes = fs.readFileSync(tempPath);
    const loadedId = KSUID.fromBytes(new Uint8Array(loadedBytes));
    
    // Clean up
    fs.unlinkSync(tempPath);
    
    // Verify binary representation was handled correctly
    expect(loadedId.getBytes().length).toBe(20);
    expect(loadedId.toString().length).toBe(27);
    
    // Compare individual bytes for equality
    const originalBytes = id.getBytes();
    const newBytes = loadedId.getBytes();
    for (let i = 0; i < originalBytes.length; i++) {
      expect(newBytes[i]).toBe(originalBytes[i]);
    }
  });
  
  it('should work with large sequences', () => {
    const seq = new Sequence();
    const count = 1000;
    const ids: KSUID[] = [];
    
    for (let i = 0; i < count; i++) {
      ids.push(seq.next());
    }
    
    // Ensure the sequence is strictly monotonically increasing
    for (let i = 1; i < count; i++) {
      expect(ids[i-1].compare(ids[i])).toBe(-1);
    }
    
    // Check that bounds are accurate
    const { min, max } = seq.bounds();
    expect(ids[count-1].compare(min)).toBe(0);
    
    // Note: max is still 0xFFFF since we didn't exhaust the sequence
    expect(max.getBytes()[max.getBytes().length - 2]).toBe(0xFF);
    expect(max.getBytes()[max.getBytes().length - 1]).toBe(0xFF);
  });
}); 