# is-railway

A lightweight SDK for detecting Railway environment in Node.js applications and automatically configuring PostgreSQL connections for Railway compatibility.

## Features

- 🚂 **Railway Detection** - Automatically detect if your app is running on Railway
- 🔧 **PostgreSQL Helper** - Auto-configure PostgreSQL connections for Railway's SSL setup
- 🪶 **Zero Dependencies** - No external runtime dependencies
- 📦 **TypeScript First** - Built with TypeScript, includes type definitions
- 🎯 **Simple API** - Just a few functions, easy to use

## Installation

```bash
# Using pnpm (recommended)
pnpm add is-railway

# Using npm
npm install is-railway

# Using yarn
yarn add is-railway
```

## Quick Start

```typescript
import { isRailway, getPostgresConfig } from 'is-railway';

// Check if running on Railway
if (isRailway()) {
  console.log('🚂 Running on Railway!');
  
  // Get Railway-optimized PostgreSQL config
  const config = getPostgresConfig(process.env.DATABASE_URL);
  
  // Use the config with your PostgreSQL client
  const pool = new Pool({
    connectionString: config.connectionString,
    ssl: config.ssl
  });
}
```

## API Reference

### `isRailway(): boolean`

Detects if the current environment is Railway by checking for `railway.internal` hostnames in common environment variables.

```typescript
import { isRailway } from 'is-railway';

if (isRailway()) {
  // Configure for Railway environment
}
```

### `isRailwayHost(url): boolean`

Check if a specific URL is hosted on Railway.

```typescript
import { isRailwayHost } from 'is-railway';

const isRailwayDB = isRailwayHost(process.env.DATABASE_URL);
```

### `getPostgresConfig(connectionString, options?): PostgresConfig`

Get Railway-optimized PostgreSQL configuration.

```typescript
import { getPostgresConfig } from 'is-railway';

const config = getPostgresConfig(process.env.DATABASE_URL, {
  rejectUnauthorized: false, // Default for Railway
  forceSSL: false
});

// Use with pg
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: config.connectionString,
  ssl: config.ssl
});
```

### `getRailwayDetection(): RailwayDetectionResult`

Get detailed Railway detection information.

```typescript
import { getRailwayDetection } from 'is-railway';

const detection = getRailwayDetection();
console.log('Railway detected:', detection.isRailway);
console.log('Detected vars:', detection.detectedVars);
console.log('Railway hosts:', detection.railwayHosts);
```

### `getRailwayConfig()`

Get comprehensive Railway environment configuration.

```typescript
import { getRailwayConfig } from 'is-railway';

const config = getRailwayConfig();
console.log('Environment:', config.environment); // 'railway' or 'local'
console.log('SSL settings:', config.ssl);
```

## Environment Variables Checked

The package automatically checks these environment variables for Railway hostnames:

- `DATABASE_URL`
- `POSTGRES_URL`
- `POSTGRESQL_URL`
- `REDIS_URL`
- `PLATFORM_REDIS_URL`
- `WEBHOOK_REDIS_URL`
- `MONGODB_URL`
- `MYSQL_URL`

## TypeScript Support

Full TypeScript support with comprehensive type definitions:

```typescript
import { 
  isRailway, 
  getPostgresConfig, 
  type PostgresConfig, 
  type RailwayDetectionResult 
} from 'is-railway';

const config: PostgresConfig = getPostgresConfig(connectionString);
const detection: RailwayDetectionResult = getRailwayDetection();
```

## Use Cases

### PostgreSQL Connection

```typescript
import { Pool } from 'pg';
import { getPostgresConfig } from 'is-railway';

const config = getPostgresConfig(process.env.DATABASE_URL);
const pool = new Pool({
  connectionString: config.connectionString,
  ssl: config.ssl
});
```

### Conditional Configuration

```typescript
import { isRailway } from 'is-railway';

const config = {
  port: process.env.PORT || 3000,
  ssl: isRailway() ? { rejectUnauthorized: false } : false,
  logging: isRailway() ? 'error' : 'debug'
};
```

### Environment-Specific Logic

```typescript
import { getRailwayConfig } from 'is-railway';

const { environment, isRailway } = getRailwayConfig();

if (isRailway) {
  // Railway-specific optimizations
  app.set('trust proxy', true);
  app.use(compression());
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development

This project uses **pnpm** as the package manager for development:

```bash
# Install dependencies
pnpm install

# Build the project
pnpm build

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run linter
pnpm lint

# Development with auto-rebuild
pnpm dev
```

### Publishing

```bash
# This will clean, build, test, and publish
pnpm publish
```

## License

MIT © [Waren Gonzaga](https://warengonzaga.com)

---

Made with ❤️ by [WG Technology Labs](https://wgtechlabs.com)