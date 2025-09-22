# is-railway 🚂

A lightweight, intelligent SDK for detecting Railway environment in Node.js applications and automatically configuring PostgreSQL connections for Railway compatibility.

## ✨ Features

- 🚂 **Smart Railway Detection** - Automatically detect if your app is running on Railway
- 🔧 **PostgreSQL Magic** - Auto-configure PostgreSQL connections for Railway's SSL setup  
- 🪶 **Zero Dependencies** - No external runtime dependencies (except optional logging)
- 📦 **TypeScript First** - Built with TypeScript, includes comprehensive type definitions
- 🎯 **Simple API** - Just a few functions, easy to use and understand
- 🔍 **Intelligent Logging** - Professional logging with WG Tech Labs log-engine integration
- ⚡ **Performance Optimized** - Minimal overhead, maximum efficiency
- 🛡️ **Production Ready** - Battle-tested and secure

## 📦 Installation

```bash
# Using pnpm (recommended)
pnpm add is-railway

# Using npm
npm install is-railway

# Using yarn
yarn add is-railway
```

## 🚀 Quick Start

```typescript
import { isRailway, getPostgresConfig } from 'is-railway';

// Check if running on Railway
if (isRailway()) {
  console.log('🚂 Running on Railway!');
  
  // Get Railway-optimized PostgreSQL config
  const config = getPostgresConfig(process.env.POSTGRES_URL);
  
  // Use the config with your PostgreSQL client
  const pool = new Pool({
    connectionString: config.connectionString,
    ssl: config.ssl
  });
}
```

## 🎯 Core Functions

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

The package automatically detects Railway by checking these core environment variables:

- **`POSTGRES_URL`** - PostgreSQL database connection (Railway's primary database service)
- **`REDIS_URL`** - Redis connection (Railway's caching service)

These variables are checked for `railway.internal` hostnames to determine Railway environment.

## 🔥 Advanced Usage

### PostgreSQL with Custom SSL Configuration

```typescript
import { getPostgresConfig } from 'is-railway';

// Custom SSL configuration
const config = getPostgresConfig(process.env.POSTGRES_URL, {
  rejectUnauthorized: false,    // Railway compatibility
  forceSSL: true,              // Force SSL even locally
  enableLogging: true          // Enable smart logging
});

const pool = new Pool({
  connectionString: config.connectionString,
  ssl: config.ssl,
  max: 20,                     // Railway can handle more connections
  idleTimeoutMillis: 30000
});
```

### Environment-Specific Application Configuration

```typescript
import { isRailway, getRailwayConfig } from 'is-railway';

const railwayConfig = getRailwayConfig();

const appConfig = {
  port: process.env.PORT || 3000,
  ssl: railwayConfig.ssl,
  environment: railwayConfig.environment,
  
  // Railway-specific optimizations
  ...(railwayConfig.isRailway && {
    trustProxy: true,
    compression: true,
    logging: 'info'
  }),
  
  // Local development settings
  ...(!railwayConfig.isRailway && {
    cors: { origin: 'http://localhost:3000' },
    logging: 'debug'
  })
};
```

### Smart Database Connection Manager

```typescript
import { isRailway, getPostgresConfig } from 'is-railway';
import { Pool } from 'pg';

class DatabaseManager {
  private pool: Pool;

  constructor() {
    const config = getPostgresConfig(process.env.POSTGRES_URL);
    
    this.pool = new Pool({
      ...config,
      max: isRailway() ? 25 : 5,        // Scale pool based on environment
      ssl: config.ssl
    });

    // Railway-specific error handling
    this.pool.on('error', (err, client) => {
      console.error('Database error:', err);
      if (isRailway()) {
        // Railway-specific error reporting
        this.reportToMonitoring(err);
      }
    });
  }

  async healthCheck() {
    const railwayInfo = getRailwayConfig();
    const client = await this.pool.connect();
    
    try {
      await client.query('SELECT 1');
      return {
        status: 'healthy',
        environment: railwayInfo.environment,
        isRailway: railwayInfo.isRailway
      };
    } finally {
      client.release();
    }
  }
}
```

## 🎨 Logging Integration

The package includes optional integration with `@wgtechlabs/log-engine` for professional logging:

```typescript
// Automatic smart logging when Railway overrides user preferences
const config = getPostgresConfig(process.env.POSTGRES_URL, {
  rejectUnauthorized: true,  // This will be overridden on Railway
  enableLogging: true        // Enable helpful warnings
});

// Console output on Railway:
// [11:32AM][WARN]: Railway detected: Overriding rejectUnauthorized=true to false for Railway compatibility

// Console output locally:
// [11:32AM][INFO]: Local environment detected: Added sslmode=disable for optimal PostgreSQL performance
```

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
