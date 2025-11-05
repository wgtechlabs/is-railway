/**
 * Unit tests for is-railway package
 * 
 * Tests Railway environment detection and PostgreSQL configuration.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { LogEngine } from '@wgtechlabs/log-engine';
import { 
  isRailway, 
  isRailwayHost, 
  getPostgresConfig, 
  getRailwayDetection, 
  getRailwayConfig 
} from './index';

describe('is-railway', () => {
  // Store original env vars to restore after tests
  const originalEnv = process.env;

  beforeEach(() => {
    // Create a fresh copy of environment for each test
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('isRailwayHost', () => {
    it('should return true for Railway internal URLs', () => {
      expect(isRailwayHost('postgres://user:pass@postgres.railway.internal:5432/db')).toBe(true);
      expect(isRailwayHost('redis://redis.railway.internal:6379')).toBe(true);
      expect(isRailwayHost('mongodb://mongo.railway.internal:27017/db')).toBe(true);
    });

    it('should return false for non-Railway URLs', () => {
      expect(isRailwayHost('postgres://localhost:5432/db')).toBe(false);
      expect(isRailwayHost('redis://localhost:6379')).toBe(false);
      expect(isRailwayHost('https://example.com')).toBe(false);
    });

    it('should handle invalid URLs gracefully', () => {
      expect(isRailwayHost('not-a-url')).toBe(false);
      expect(isRailwayHost('')).toBe(false);
      expect(isRailwayHost(undefined)).toBe(false);
    });

    it('should be case insensitive', () => {
      expect(isRailwayHost('postgres://user:pass@POSTGRES.RAILWAY.INTERNAL:5432/db')).toBe(true);
      expect(isRailwayHost('postgres://user:pass@Postgres.Railway.Internal:5432/db')).toBe(true);
    });
  });

  describe('isRailway', () => {
    it('should return true when Railway environment variables are present', () => {
      process.env.POSTGRES_URL = 'postgres://user:pass@postgres.railway.internal:5432/db';
      expect(isRailway()).toBe(true);
    });

    it('should return true for any Railway environment variable', () => {
      process.env.REDIS_URL = 'redis://redis.railway.internal:6379';
      expect(isRailway()).toBe(true);
    });

    it('should return false when no Railway variables are present', () => {
      process.env.POSTGRES_URL = 'postgres://localhost:5432/db';
      process.env.REDIS_URL = 'redis://localhost:6379';
      expect(isRailway()).toBe(false);
    });

    it('should return false when no environment variables are set', () => {
      // Clear all environment variables
      process.env = {};
      expect(isRailway()).toBe(false);
    });
  });

  describe('getRailwayDetection', () => {
    it('should return detailed detection information', () => {
      process.env.POSTGRES_URL = 'postgres://user:pass@postgres.railway.internal:5432/db';
      process.env.REDIS_URL = 'redis://redis.railway.internal:6379';
      
      const detection = getRailwayDetection();
      
      expect(detection.isRailway).toBe(true);
      expect(detection.detectedVars).toContain('POSTGRES_URL');
      expect(detection.detectedVars).toContain('REDIS_URL');
      expect(detection.railwayHosts).toContain('postgres.railway.internal');
      expect(detection.railwayHosts).toContain('redis.railway.internal');
    });

    it('should handle no Railway detection', () => {
      process.env.POSTGRES_URL = 'postgres://localhost:5432/db';
      
      const detection = getRailwayDetection();
      
      expect(detection.isRailway).toBe(false);
      expect(detection.detectedVars).toHaveLength(0);
      expect(detection.railwayHosts).toHaveLength(0);
    });

    it('should deduplicate hosts', () => {
      process.env.DATABASE_URL = 'postgres://user:pass@postgres.railway.internal:5432/db';
      process.env.POSTGRES_URL = 'postgres://user2:pass2@postgres.railway.internal:5432/db2';
      
      const detection = getRailwayDetection();
      
      expect(detection.railwayHosts).toHaveLength(1);
      expect(detection.railwayHosts[0]).toBe('postgres.railway.internal');
    });
  });

  describe('getPostgresConfig', () => {
    it('should throw error for empty connection string', () => {
      expect(() => getPostgresConfig('')).toThrow('Connection string is required');
    });

    it('should return Railway-optimized config when Railway is detected', () => {
      process.env.DATABASE_URL = 'postgres://user:pass@postgres.railway.internal:5432/db';
      
      const config = getPostgresConfig('postgres://user:pass@postgres.railway.internal:5432/db');
      
      expect(config.ssl.rejectUnauthorized).toBe(false);
      expect(config.modified).toBe(true);
    });

    it('should add sslmode=disable for non-Railway environments', () => {
      process.env = {}; // Clear Railway detection
      
      const config = getPostgresConfig('postgres://localhost:5432/db');
      
      expect(config.connectionString).toContain('sslmode=disable');
      expect(config.modified).toBe(true);
    });

    it('should not modify connection string if sslmode already present', () => {
      process.env = {}; // Clear Railway detection
      
      const originalUrl = 'postgres://localhost:5432/db?sslmode=require';
      const config = getPostgresConfig(originalUrl);
      
      expect(config.connectionString).toBe(originalUrl);
    });

    it('should respect custom options', () => {
      const config = getPostgresConfig('postgres://localhost:5432/db', {
        rejectUnauthorized: true,
        ca: 'custom-ca',
        forceSSL: true
      });
      
      expect(config.ssl.ca).toBe('custom-ca');
      // forceSSL should prevent sslmode=disable
      expect(config.connectionString).not.toContain('sslmode=disable');
    });
  });

  describe('logging behavior', () => {
    let logEngineWarnSpy: ReturnType<typeof vi.spyOn>;
    let logEngineInfoSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      logEngineWarnSpy = vi.spyOn(LogEngine, 'warn').mockImplementation(() => {});
      logEngineInfoSpy = vi.spyOn(LogEngine, 'info').mockImplementation(() => {});
    });

    afterEach(() => {
      logEngineWarnSpy.mockRestore();
      logEngineInfoSpy.mockRestore();
    });

    it('should warn when overriding rejectUnauthorized on Railway', () => {
      process.env.POSTGRES_URL = 'postgres://user:pass@postgres.railway.internal:5432/db';
      
      getPostgresConfig('postgres://user:pass@postgres.railway.internal:5432/db', {
        rejectUnauthorized: true
      });
      
      expect(logEngineWarnSpy).toHaveBeenCalledWith(
        'Railway detected: Overriding rejectUnauthorized=true to false for Railway compatibility',
        {
          reason: 'Railway uses self-signed certificates that require rejectUnauthorized=false',
          originalValue: true,
          newValue: false
        }
      );
    });

    it('should not warn when rejectUnauthorized is already false on Railway', () => {
      process.env.DATABASE_URL = 'postgres://user:pass@postgres.railway.internal:5432/db';
      
      getPostgresConfig('postgres://user:pass@postgres.railway.internal:5432/db', {
        rejectUnauthorized: false
      });
      
      expect(logEngineWarnSpy).not.toHaveBeenCalled();
    });

    it('should log when adding sslmode=disable locally', () => {
      process.env = {}; // Clear Railway detection
      
      getPostgresConfig('postgres://localhost:5432/db');
      
      expect(logEngineInfoSpy).toHaveBeenCalledWith(
        'Local environment detected: Added sslmode=disable for optimal PostgreSQL performance',
        {
          environment: 'local',
          optimization: 'sslmode=disable',
          reason: 'Better performance for local development'
        }
      );
    });

    it('should respect enableLogging=false option', () => {
      process.env.DATABASE_URL = 'postgres://user:pass@postgres.railway.internal:5432/db';
      
      getPostgresConfig('postgres://user:pass@postgres.railway.internal:5432/db', {
        rejectUnauthorized: true,
        enableLogging: false
      });
      
      expect(logEngineWarnSpy).not.toHaveBeenCalled();
    });
  });

  describe('getRailwayConfig', () => {
    it('should return Railway configuration when detected', () => {
      process.env.POSTGRES_URL = 'postgres://user:pass@postgres.railway.internal:5432/db';
      
      const config = getRailwayConfig();
      
      expect(config.isRailway).toBe(true);
      expect(config.environment).toBe('railway');
      expect(config.ssl.enabled).toBe(true);
      expect(config.ssl.rejectUnauthorized).toBe(false);
      expect(config.detectedServices).toContain('POSTGRES_URL');
    });

    it('should return local configuration when Railway not detected', () => {
      process.env = {}; // Clear Railway detection
      
      const config = getRailwayConfig();
      
      expect(config.isRailway).toBe(false);
      expect(config.environment).toBe('local');
      expect(config.ssl.enabled).toBe(false);
      expect(config.detectedServices).toHaveLength(0);
    });
  });
});