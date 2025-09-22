/**
 * is-railway - Simple Railway Environment Detection SDK
 * 
 * A lightweight SDK for detecting Railway environment in Node.js applications
 * and automatically configuring PostgreSQL connections for Railway compatibility.
 * 
 * @author Waren Gonzaga, WG Technology Labs
 * @since 2025
 */

import type { PostgresConfig, RailwayDetectionResult, PostgresConfigOptions } from './types.js';
import { LogEngine } from '@wgtechlabs/log-engine';

// Configure LogEngine with no timestamps for cleaner output
LogEngine.configure({
  format: {
    includeIsoTimestamp: false,
    includeLocalTime: true
  }
});

/**
 * Environment variables commonly used by Railway services
 * These are checked for 'railway.internal' hostnames
 */
const RAILWAY_ENV_VARS = [
  'DATABASE_URL',
  'POSTGRES_URL', 
  'POSTGRESQL_URL',
  'REDIS_URL',
  'PLATFORM_REDIS_URL',
  'WEBHOOK_REDIS_URL',
  'MONGODB_URL',
  'MYSQL_URL'
] as const;

/**
 * Check if a URL contains Railway internal hostname
 * 
 * @param url - URL to check
 * @returns True if URL contains railway.internal hostname
 */
export function isRailwayHost(url: string | undefined): boolean {
  if (!url || url.trim() === '') {
    return false;
  }
  
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname.toLowerCase().includes('railway.internal');
  } catch {
    return false; // Invalid URL
  }
}

/**
 * Detect if current environment is Railway
 * 
 * @returns True if Railway environment is detected
 */
export function isRailway(): boolean {
  return RAILWAY_ENV_VARS.some(envVar => {
    const value = process.env[envVar];
    return isRailwayHost(value);
  });
}

/**
 * Get detailed Railway detection information
 * 
 * @returns Detailed detection result with found variables and hosts
 */
export function getRailwayDetection(): RailwayDetectionResult {
  const detectedVars: string[] = [];
  const railwayHosts: string[] = [];
  
  RAILWAY_ENV_VARS.forEach(envVar => {
    const value = process.env[envVar];
    if (isRailwayHost(value)) {
      detectedVars.push(envVar);
      try {
        const hostname = new URL(value!).hostname;
        if (!railwayHosts.includes(hostname)) {
          railwayHosts.push(hostname);
        }
      } catch {
        // Skip invalid URLs
      }
    }
  });
  
  return {
    isRailway: detectedVars.length > 0,
    detectedVars,
    railwayHosts
  };
}

/**
 * Configure PostgreSQL connection string for Railway environment
 * 
 * @param connectionString - Original PostgreSQL connection string
 * @param options - Configuration options
 * @returns Modified configuration optimized for Railway
 */
export function getPostgresConfig(
  connectionString: string,
  options: PostgresConfigOptions = {}
): PostgresConfig {
  if (!connectionString) {
    throw new Error('Connection string is required');
  }
  
  const {
    rejectUnauthorized = false, // Railway uses self-signed certificates
    ca,
    forceSSL = false,
    enableLogging = true
  } = options;
  
  // Default configuration for Railway
  const config: PostgresConfig = {
    connectionString,
    ssl: {
      rejectUnauthorized,
      ca
    },
    modified: false
  };
  
  // If we're in Railway environment, configure for Railway's SSL setup
  if (isRailway()) {
    // Warn user if we're overriding their rejectUnauthorized preference
    if (rejectUnauthorized === true && enableLogging) {
      LogEngine.warn('Railway detected: Overriding rejectUnauthorized=true to false for Railway compatibility', {
        reason: 'Railway uses self-signed certificates that require rejectUnauthorized=false',
        originalValue: true,
        newValue: false
      });
    }
    
    config.ssl.rejectUnauthorized = false; // Accept Railway's self-signed certificates
    config.modified = true;
  }
  
  // If forceSSL is disabled and not Railway, disable SSL completely
  if (!forceSSL && !isRailway() && !connectionString.includes('sslmode=')) {
    const separator = connectionString.includes('?') ? '&' : '?';
    config.connectionString = `${connectionString}${separator}sslmode=disable`;
    config.modified = true;
    
    // Inform user about SSL optimization for local development
    if (enableLogging) {
      LogEngine.info('Local environment detected: Added sslmode=disable for optimal PostgreSQL performance', {
        environment: 'local',
        optimization: 'sslmode=disable',
        reason: 'Better performance for local development'
      });
    }
  }
  
  return config;
}

/**
 * Get Railway-optimized environment configuration
 * Automatically detects Railway and provides appropriate settings
 * 
 * @returns Configuration object with Railway-specific settings
 */
export function getRailwayConfig() {
  const detection = getRailwayDetection();
  
  return {
    isRailway: detection.isRailway,
    ssl: {
      enabled: detection.isRailway,
      rejectUnauthorized: false, // Railway compatibility
      validateCertificate: false
    },
    environment: detection.isRailway ? 'railway' : 'local',
    detectedServices: detection.detectedVars,
    hosts: detection.railwayHosts
  };
}