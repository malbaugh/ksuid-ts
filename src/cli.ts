#!/usr/bin/env node
/// <reference types="node" />

import { KSUID } from './ksuid';
import { Command } from 'commander';

/**
 * Convert a Uint8Array to a hex string
 */
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
}

const program = new Command();

program
  .name('ksuid')
  .description('Generate and inspect KSUIDs')
  .version('1.0.0');

program
  .option('-n <count>', 'Number of KSUIDs to generate when no arguments are given', '1')
  .option('-f <format>', 'Output format (string, inspect, time, timestamp, payload, raw)', 'string')
  .option('-t <template>', 'Go-like template string for custom formatting')
  .option('-v', 'Verbose mode', false);

program.parse(process.argv);

const options = program.opts();
const args = program.args;

// Format printing functions
const formatters: Record<string, (id: KSUID) => void> = {
  string: (id: KSUID) => {
    console.log(id.toString());
  },
  
  inspect: (id: KSUID) => {
    const inspectFormat = `
REPRESENTATION:

  String: %s
     Raw: %s

COMPONENTS:

       Time: %s
  Timestamp: %d
    Payload: %s

`;
    const formattedString = inspectFormat
      .replace('%s', id.toString())
      .replace('%s', bytesToHex(id.getBytes()))
      .replace('%s', id.getTime().toISOString())
      .replace('%d', id.getTimestamp().toString())
      .replace('%s', bytesToHex(id.getPayload()));
    
    console.log(formattedString);
  },
  
  time: (id: KSUID) => {
    console.log(id.getTime().toISOString());
  },
  
  timestamp: (id: KSUID) => {
    console.log(id.getTimestamp());
  },
  
  payload: (id: KSUID) => {
    process.stdout.write(Buffer.from(id.getPayload()));
  },
  
  raw: (id: KSUID) => {
    process.stdout.write(Buffer.from(id.getBytes()));
  },
  
  template: (id: KSUID) => {
    if (!options.t) {
      console.error('Template string is required for template format');
      process.exit(1);
    }
    
    // Very basic template implementation
    let output = options.t
      .replace(/{{.String}}/g, id.toString())
      .replace(/{{.Raw}}/g, bytesToHex(id.getBytes()))
      .replace(/{{.Time}}/g, id.getTime().toISOString())
      .replace(/{{.Timestamp}}/g, id.getTimestamp().toString())
      .replace(/{{.Payload}}/g, bytesToHex(id.getPayload()));
    
    console.log(output);
  }
};

// Choose formatter based on -f option
const format = (options.f || 'string').toLowerCase();
const print = formatters[format] || formatters.string;

if (!print) {
  console.error(`Invalid format: ${format}`);
  process.exit(1);
}

// Generate or parse KSUIDs
let ids: KSUID[] = [];

if (args.length === 0) {
  // Generate new KSUIDs
  const count = parseInt(options.n, 10) || 1;
  for (let i = 0; i < count; i++) {
    ids.push(KSUID.new());
  }
} else {
  // Parse provided KSUIDs
  for (const arg of args) {
    try {
      ids.push(KSUID.parse(arg));
    } catch (error) {
      console.error(`Error parsing "${arg}": ${(error as Error).message}`);
      process.exit(1);
    }
  }
}

// Output the KSUIDs
for (const id of ids) {
  if (options.v) {
    process.stdout.write(`${id.toString()}: `);
  }
  print(id);
} 