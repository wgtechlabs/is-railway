/**
 * TypeScript definitions for is-railway package
 * 
 * Simple types for Railway environment detection and PostgreSQL configuration.
 */

/**
 * PostgreSQL connection configuration for Railway environment
 */
export interface PostgresConfig {
  /** The modified connection string optimized for Railway */
  connectionString: string;
  /** SSL configuration object for Railway compatibility */
  ssl: {
    /** Whether to reject unauthorized SSL certificates */
    rejectUnauthorized: boolean;
    /** Optional CA certificate for SSL validation */
    ca?: string;
  };
  /** Whether the original connection was modified for Railway */
  modified: boolean;
}

/**
 * Railway detection result with detailed information
 */
export interface RailwayDetectionResult {
  /** Whether Railway environment was detected */
  isRailway: boolean;
  /** Environment variables that indicated Railway presence */
  detectedVars: string[];
  /** Railway hostnames found in environment variables */
  railwayHosts: string[];
}

/**
 * Options for PostgreSQL configuration modification
 */
export interface PostgresConfigOptions {
  /** Whether to disable SSL certificate validation (default: true for Railway) */
  rejectUnauthorized?: boolean;
  /** Custom CA certificate for SSL validation */
  ca?: string;
  /** Whether to force SSL mode (default: false) */
  forceSSL?: boolean;
  /** Whether to enable logging of configuration changes (default: true) */
  enableLogging?: boolean;
}