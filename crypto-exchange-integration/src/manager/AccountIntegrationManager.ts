/**
 * Account Integration Manager
 * 
 * Orchestrates multi-account integration with various cryptocurrency platforms.
 * Manages authentication, connections, and unified account access.
 */

import { BitMEXAuthenticator } from '../authenticators/BitMEXAuthenticator';
import { DogecoinConnector } from '../connectors/DogecoinConnector';
import { AccountRegistry } from '../registry/AccountRegistry';
import { AccountConfig, StoredAccount, CryptoPlatform, BlockchainNetwork } from '../types';
import { ValidationError, NotFoundError } from '../errors/IntegrationErrors';

type Connector = BitMEXAuthenticator | DogecoinConnector;

interface IntegrationManagerConfig {
  validateOnInit?: boolean;
  autoConnect?: boolean;
}

/**
 * Main orchestrator for multi-account cryptocurrency integration
 */
export class AccountIntegrationManager {
  private registry: AccountRegistry;
  private authenticators: Map<string, BitMEXAuthenticator> = new Map();
  private connectors: Map<string, DogecoinConnector> = new Map();
  private config: IntegrationManagerConfig;

  constructor(config: IntegrationManagerConfig = {}) {
    this.registry = new AccountRegistry();
    this.config = {
      validateOnInit: true,
      autoConnect: false,
      ...config,
    };
  }

  /**
   * Register and initialize a new account
   */
  async registerAccount(accountConfig: AccountConfig): Promise<StoredAccount> {
    // Validate credentials
    this.validateAccountConfig(accountConfig);

    // Store in registry
    const stored = await this.registry.add(accountConfig);

    // Initialize platform handler
    try {
      this.initializePlatformHandler(stored);
    } catch (error) {
      // Remove from registry if initialization fails
      await this.registry.remove(accountConfig.id);
      throw error;
    }

    return stored;
  }

  /**
   * Initialize platform-specific authenticator or connector
   */
  private initializePlatformHandler(config: StoredAccount): void {
    try {
      if (config.platform === 'bitmex') {
        const authenticator = new BitMEXAuthenticator({
          apiKey: config.credentials.apiKey!,
          apiSecret: config.credentials.apiSecret!,
          testMode: config.metadata?.testMode || false,
        });
        this.authenticators.set(config.id, authenticator);
      } else if (config.platform === 'dogecoin') {
        const connector = new DogecoinConnector({
          rpcUrl: config.credentials.rpcUrl!,
          rpcUser: config.credentials.rpcUser,
          rpcPassword: config.credentials.rpcPassword,
          network: (config.network as BlockchainNetwork) || 'mainnet',
        });
        this.connectors.set(config.id, connector);
      }
    } catch (error) {
      throw new Error(`Failed to initialize ${config.platform} handler: ${error}`);
    }
  }

  /**
   * Validate account configuration
   */
  private validateAccountConfig(config: AccountConfig): void {
    if (!config.id || typeof config.id !== 'string') {
      throw new ValidationError('Account ID is required and must be a string');
    }

    if (!config.platform || !['bitmex', 'dogecoin', 'bitcoin'].includes(config.platform)) {
      throw new ValidationError(`Invalid platform: ${config.platform}`);
    }

    if (config.platform === 'bitmex') {
      if (!config.credentials.apiKey || !config.credentials.apiSecret) {
        throw new ValidationError('BitMEX requires apiKey and apiSecret');
      }
    } else if (config.platform === 'dogecoin') {
      if (!config.credentials.rpcUrl) {
        throw new ValidationError('Dogecoin requires rpcUrl');
      }
    }
  }

  /**
   * Get BitMEX authenticator for account
   */
  getBitMEXAuthenticator(accountId: string): BitMEXAuthenticator {
    const auth = this.authenticators.get(accountId);
    if (!auth) {
      throw new NotFoundError(`BitMEX authenticator not found for account: ${accountId}`);
    }
    return auth;
  }

  /**
   * Get Dogecoin connector for account
   */
  getDogecoinConnector(accountId: string): DogecoinConnector {
    const connector = this.connectors.get(accountId);
    if (!connector) {
      throw new NotFoundError(`Dogecoin connector not found for account: ${accountId}`);
    }
    return connector;
  }

  /**
   * Get connector/authenticator by account ID
   */
  getConnector(accountId: string): Connector {
    const connector = this.connectors.get(accountId);
    if (connector) return connector;

    const authenticator = this.authenticators.get(accountId);
    if (authenticator) return authenticator;

    throw new NotFoundError(`No connector found for account: ${accountId}`);
  }

  /**
   * Get all registered accounts
   */
  async getAccounts(): Promise<StoredAccount[]> {
    return this.registry.getAll();
  }

  /**
   * Get account by ID
   */
  async getAccount(accountId: string): Promise<StoredAccount> {
    const account = await this.registry.getById(accountId);
    if (!account) {
      throw new NotFoundError(`Account not found: ${accountId}`);
    }
    return account;
  }

  /**
   * Get accounts by platform
   */
  async getAccountsByPlatform(platform: CryptoPlatform): Promise<StoredAccount[]> {
    return this.registry.getByPlatform(platform);
  }

  /**
   * Get accounts by type
   */
  async getAccountsByType(type: 'exchange' | 'blockchain'): Promise<StoredAccount[]> {
    return this.registry.getByType(type);
  }

  /**
   * Get enabled accounts
   */
  async getEnabledAccounts(): Promise<StoredAccount[]> {
    return this.registry.getEnabled();
  }

  /**
   * Update account
   */
  async updateAccount(
    accountId: string,
    updates: Partial<AccountConfig>
  ): Promise<StoredAccount> {
    const updated = await this.registry.update(accountId, updates);

    // Reinitialize handler if credentials changed
    if (updates.credentials) {
      this.authenticators.delete(accountId);
      this.connectors.delete(accountId);
      this.initializePlatformHandler(updated);
    }

    return updated;
  }

  /**
   * Unregister account
   */
  async unregisterAccount(accountId: string): Promise<void> {
    await this.registry.remove(accountId);
    this.authenticators.delete(accountId);
    this.connectors.delete(accountId);
  }

  /**
   * List all accounts with their status
   */
  async listAccounts(): Promise<(StoredAccount & { connected: boolean })[]> {
    const accounts = await this.registry.getAll();
    return accounts.map((account) => ({
      ...account,
      connected: Boolean(
        this.authenticators.has(account.id) || this.connectors.has(account.id)
      ),
    }));
  }

  /**
   * Get account count
   */
  async getAccountCount(): Promise<number> {
    return this.registry.count();
  }
}
