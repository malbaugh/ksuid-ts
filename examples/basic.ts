import { KSUID, Sequence } from '../src';

// Basic KSUID generation
console.log('== Basic KSUID generation ==');
const id = KSUID.new();
console.log(`Generated KSUID: ${id.toString()}`);
console.log(`Timestamp: ${id.getTime().toISOString()}`);
console.log(`Raw bytes (hex): ${Array.from(id.getBytes()).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase()}`);
console.log();

// Parsing existing KSUIDs
console.log('== Parsing KSUIDs ==');
const parsed = KSUID.parse(id.toString());
console.log(`Parsed KSUID equals original: ${parsed.equals(id)}`);
console.log();

// Sequence generation
console.log('== Using Sequences ==');
const sequence = new Sequence();
console.log(`Sequence seed: ${sequence.seed.toString()}`);

const seqIds: KSUID[] = [];
for (let i = 0; i < 5; i++) {
  seqIds.push(sequence.next());
}

console.log('Generated sequence:');
seqIds.forEach((seqId, i) => {
  console.log(`${i+1}. ${seqId.toString()}`);
});

const { min, max } = sequence.bounds();
console.log(`Sequence bounds: min=${min.toString()}, max=${max.toString()}`);
console.log();

// Sorting KSUIDs
console.log('== Sorting KSUIDs ==');
const unsorted = [
  KSUID.randomWithTime(new Date(Date.now() - 60000)), // 1 minute ago
  KSUID.randomWithTime(new Date(Date.now() - 3600000)), // 1 hour ago
  KSUID.new(), // now
  KSUID.randomWithTime(new Date(Date.now() - 86400000)) // 1 day ago
];

console.log('Unsorted:');
unsorted.forEach((u, i) => {
  console.log(`${i+1}. ${u.toString()} (${u.getTime().toISOString()})`);
});

KSUID.sort(unsorted);

console.log('\nSorted:');
unsorted.forEach((u, i) => {
  console.log(`${i+1}. ${u.toString()} (${u.getTime().toISOString()})`);
});
console.log();

// Next/prev operations
console.log('== Next/Prev KSUIDs ==');
const original = KSUID.new();
console.log(`Original: ${original.toString()}`);
console.log(`Next: ${original.next().toString()}`);
console.log(`Previous: ${original.prev().toString()}`);
console.log();

// Using special KSUIDs
console.log('== Special KSUIDs ==');
console.log(`Nil KSUID: ${KSUID.Nil.toString()}`);
console.log(`Max KSUID: ${KSUID.Max.toString()}`); 