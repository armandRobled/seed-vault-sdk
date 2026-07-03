/**
 * Comprehensive Test Suite for Crypto Exchange Integration
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import {
  AccountIntegrationManager,
  AccountConfig,
  ValidationError,
  NotFoundError,
} from '../../src';

describe('AccountIntegrationManager', () => {
  let manager: AccountIntegrationManager;

  beforeEach(() => {
    manager = new AccountIntegrationManager();
  });

  describe('Account Registration', () => {
    it('should register a valid BitMEX account', async () => {
      const config: AccountConfig = {
        id: 'test_bitmex',
        type: 'exchange',
        platform: 'bitmex',
        credentials: {
          apiKey: 'test_key',
          apiSecret: 'test_secret',
        },
        enabled: true,
      };

      const registered = await manager.registerAccount(config);
      expect(registered.id).toBe('test_bitmex');
      expect(registered.platform).toBe('bitmex');
    });

    it('should reject BitMEX account without credentials', async () => {
      const config: AccountConfig = {
        id: 'test_bitmex',
        type: 'exchange',
        platform: 'bitmex',
        credentials: {},
        enabled: true,
      };

      await expect(manager.registerAccount(config)).rejects.toThrow(ValidationError);
    });

    it('should register a valid Dogecoin account', async () => {
      const config: AccountConfig = {
        id: 'test_doge',
        type: 'blockchain',
        platform: 'dogecoin',
        credentials: {
          rpcUrl: 'http://localhost:22555',
        },
        network: 'mainnet',
        enabled: true,
      };

      const registered = await manager.registerAccount(config);
      expect(registered.id).toBe('test_doge');
      expect(registered.network).toBe('mainnet');
    });

    it('should reject Dogecoin account without RPC URL', async () => {
      const config: AccountConfig = {
        id: 'test_doge',
        type: 'blockchain',
        platform: 'dogecoin',
        credentials: {},
        enabled: true,
      };

      await expect(manager.registerAccount(config)).rejects.toThrow(ValidationError);
    });
  });

  describe('Account Retrieval', () => {
    beforeEach(async () => {
      await manager.registerAccount({
        id: 'test_account_1',
        type: 'exchange',
        platform: 'bitmex',
        credentials: {
          apiKey: 'key',
          apiSecret: 'secret',
        },
        enabled: true,
      });
    });

    it('should retrieve account by ID', async () => {
      const account = await manager.getAccount('test_account_1');
      expect(account.id).toBe('test_account_1');
    });

    it('should throw error for non-existent account', async () => {
      await expect(manager.getAccount('non_existent')).rejects.toThrow(NotFoundError);
    });

    it('should list all accounts', async () => {
      const accounts = await manager.getAccounts();
      expect(accounts.length).toBeGreaterThan(0);
      expect(accounts.some((a) => a.id === 'test_account_1')).toBe(true);
    });
  });

  describe('Account Filtering', () => {
    beforeEach(async () => {
      await manager.registerAccount({
        id: 'exchange_1',
        type: 'exchange',
        platform: 'bitmex',
        credentials: { apiKey: 'key', apiSecret: 'secret' },
        enabled: true,
      });

      await manager.registerAccount({
        id: 'blockchain_1',
        type: 'blockchain',
        platform: 'dogecoin',
        credentials: { rpcUrl: 'http://localhost:22555' },
        enabled: true,
      });
    });

    it('should filter accounts by type', async () => {
      const exchanges = await manager.getAccountsByType('exchange');
      expect(exchanges.every((a) => a.type === 'exchange')).toBe(true);
    });

    it('should filter accounts by platform', async () => {
      const dogecoin = await manager.getAccountsByPlatform('dogecoin');
      expect(dogecoin.every((a) => a.platform === 'dogecoin')).toBe(true);
    });

    it('should get only enabled accounts', async () => {
      const enabled = await manager.getEnabledAccounts();
      expect(enabled.every((a) => a.enabled === true)).toBe(true);
    });
  });

  describe('Account Management', () => {
    beforeEach(async () => {
      await manager.registerAccount({
        id: 'test_account',
        type: 'exchange',
        platform: 'bitmex',
        credentials: { apiKey: 'key', apiSecret: 'secret' },
        enabled: true,
      });
    });

    it('should update account metadata', async () => {
      const updated = await manager.updateAccount('test_account', {
        metadata: { description: 'Updated description' },
      });

      expect(updated.metadata?.description).toBe('Updated description');
    });

    it('should unregister account', async () => {
      await manager.unregisterAccount('test_account');
      await expect(manager.getAccount('test_account')).rejects.toThrow();
    });
  });
});

describe('AlertSystem', () => {
  const { AlertSystem, AlertSeverity } = require('../../src/advanced');

  let alertSystem: any;

  beforeEach(() => {
    alertSystem = new AlertSystem();
  });

  it('should create and store alerts', async () => {
    await alertSystem.alert(
      'TEST_ALERT',
      'Test Alert',
      'This is a test alert',
      AlertSeverity.INFO
    );

    const alerts = alertSystem.getAllAlerts();
    expect(alerts.length).toBe(1);
    expect(alerts[0].type).toBe('TEST_ALERT');
  });

  it('should filter alerts by severity', async () => {
    await alertSystem.alert(
      'INFO_ALERT',
      'Info',
      'Info message',
      AlertSeverity.INFO
    );
    await alertSystem.alert(
      'CRITICAL_ALERT',
      'Critical',
      'Critical message',
      AlertSeverity.CRITICAL
    );

    const critical = alertSystem.getAlertsBySeverity(AlertSeverity.CRITICAL);
    expect(critical.length).toBe(1);
  });

  it('should mark alerts as read', async () => {
    await alertSystem.alert(
      'TEST',
      'Test',
      'Test',
      AlertSeverity.INFO
    );

    const alerts = alertSystem.getAllAlerts();
    const alertId = alerts[0].id;

    alertSystem.markAsRead(alertId);
    const updated = alertSystem.getAlert(alertId);
    expect(updated.read).toBe(true);
  });
});

describe('PortfolioAnalytics', () => {
  const { PortfolioAnalytics } = require('../../src/advanced');

  let analytics: any;

  beforeEach(() => {
    analytics = new PortfolioAnalytics();
  });

  it('should record performance snapshots', () => {
    analytics.recordSnapshot(100000, 105000, 5, 0.05);
    analytics.recordSnapshot(100000, 108000, 5, 0.08);

    const metrics = analytics.calculateMetrics();
    expect(metrics.totalReturn).toBeGreaterThan(0);
  });

  it('should record trades and calculate win rate', () => {
    analytics.recordTrade(100, 110); // Win
    analytics.recordTrade(100, 90);  // Loss
    analytics.recordTrade(100, 115); // Win

    const metrics = analytics.calculateMetrics();
    expect(metrics.winRate).toBe(2 / 3);
  });

  it('should calculate Sharpe ratio', () => {
    for (let i = 0; i < 10; i++) {
      analytics.recordSnapshot(100000 + i * 1000, 100000 + i * 1000 + Math.random() * 500, 5, 0.01);
    }

    const metrics = analytics.calculateMetrics();
    expect(metrics.sharpeRatio).toBeGreaterThanOrEqual(0);
  });

  it('should calculate max drawdown', () => {
    analytics.recordSnapshot(100000, 100000, 5, 0);
    analytics.recordSnapshot(100000, 110000, 5, 0.1);
    analytics.recordSnapshot(100000, 95000, 5, -0.05);
    analytics.recordSnapshot(100000, 105000, 5, 0.05);

    const metrics = analytics.calculateMetrics();
    expect(metrics.maxDrawdown).toBeGreaterThan(0);
  });
});
