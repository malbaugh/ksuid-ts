# KSUID - K-Sortable Unique IDentifier

TypeScript implementation of K-Sortable Unique IDentifiers.

KSUIDs are:
- **Sortable by creation time**: The first 4 bytes are a timestamp
- **Contain 16 random bytes**: Unlike UUID v1/v2, they don't expose the MAC address
- **URL safe representation**: Base62 encoded into a 27 character string

## Installation

```bash
npm install ksuid
```

## Usage

### Basic Usage

```typescript
import { KSUID } from 'ksuid';

// Generate a new KSUID
const id = KSUID.new();

// Get the string representation
console.log(id.toString());
// Output: something like "1BoZGMuixPtHRHwvkZxHEkfLxL4"

// Get the raw bytes
const bytes = id.getBytes();

// Get the timestamp portion
const timestamp = id.getTimestamp();
const date = id.getTime();

// Parse an existing KSUID from string
const parsed = KSUID.parse("1BoZGMuixPtHRHwvkZxHEkfLxL4");

// Compare KSUIDs
if (id.compare(parsed) === 0) {
  console.log("KSUIDs are equal");
}

// Sort KSUIDs
const ids = [KSUID.new(), KSUID.new(), KSUID.new()];
KSUID.sort(ids);
```

### Sequences

Generate a sequence of KSUIDs from a seed:

```typescript
import { KSUID, Sequence } from 'ksuid';

// Create a sequence with a random seed
const sequence = new Sequence();

// Or create a sequence with a specific seed
const seed = KSUID.new();
const customSequence = new Sequence({ seed });

// Generate up to 65536 KSUIDs from this seed
const id1 = sequence.next();
const id2 = sequence.next();
// ...

// Get the bounds of possible IDs
const { min, max } = sequence.bounds();
```

## Command Line Tool

This package includes a CLI tool for generating and inspecting KSUIDs.

```bash
# Install globally
npm install -g ksuid

# Generate a new KSUID
ksuid

# Generate multiple KSUIDs
ksuid -n 5

# Inspect a KSUID
ksuid -f inspect 1BoZGMuixPtHRHwvkZxHEkfLxL4

# See all options
ksuid --help
```

## How KSUIDs Work

Each KSUID is a 20-byte value:
- First 4 bytes: 32-bit unsigned integer timestamp with custom epoch (seconds since 2014-05-13)
- Last 16 bytes: Random bytes

When string-encoded, KSUIDs are base62 encoded into a 27-character string.

## License

MIT
