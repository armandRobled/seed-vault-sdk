/**
 * Account Registry
 * 
 * Manages storage and retrieval of account configurations.
 * Can be extended to use persistent storage (database, file system, etc.).
 */

import { AccountConfig, StoredAccount } from '../types';
import { NotFoundError } from '../errors/IntegrationErrors';

/**
 * In-memory implementation of account registry.
 * For production use, extend this with persistent storage.
 */
export class AccountRegistry {
  private accounts: Map<string, StoredAccount> = new Map();
  private idIndex: Map<string, string> = new Map(); // account id -> account key

  /**
   * Add or update account in registry
   */
  async add(config: AccountConfig): Promise<StoredAccount> {
    const now = new Date();
    const storedAccount: StoredAccount = {
      ...config,
      createdAt: config.createdAt || now,
      updatedAt: now,
    };

    this.accounts.set(config.id, storedAccount);
    this.idIndex.set(config.id, config.id);

    return storedAccount;
  }

  /**
   * Get account by ID
   */
  async getById(id: string): Promise<StoredAccount | null> {
    return this.accounts.get(id) || null;
  }

  /**
   * Get all registered accounts
   */
  async getAll(): Promise<StoredAccount[]> {
    return Array.from(this.accounts.values());
  }

  /**
   * Get accounts by platform
   */
  async getByPlatform(platform: string): Promise<StoredAccount[]> {
    return Array.from(this.accounts.values()).filter(
      (account) => account.platform === platform
    );
  }

  /**
   * Get accounts by type
   */
  async getByType(type: 'exchange' | 'blockchain'): Promise<StoredAccount[]> {
    return Array.from(this.accounts.values()).filter(
      (account) => account.type === type
    );
  }

  /**
   * Get enabled accounts
   */
  async getEnabled(): Promise<StoredAccount[]> {
    return Array.from(this.accounts.values()).filter(
      (account) => account.enabled === true
    );
  }

  /**
   * Update account
   */
  async update(id: string, updates: Partial<AccountConfig>): Promise<StoredAccount> {
    const account = this.accounts.get(id);
    if (!account) {
      throw new NotFoundError(`Account not found: ${id}`);
    }

    const updated: StoredAccount = {
      ...account,
      ...updates,
      updatedAt: new Date(),
    };

    this.accounts.set(id, updated);
    return updated;
  }

  /**
   * Remove account
   */
  async remove(id: string): Promise<void> {
    if (!this.accounts.has(id)) {
      throw new NotFoundError(`Account not found: ${id}`);
    }
    this.accounts.delete(id);
    this.idIndex.delete(id);
  }

  /**
   * Check if account exists
   */
  async exists(id: string): Promise<boolean> {
    return this.accounts.has(id);
  }

  /**
   * Get count of accounts
   */
  async count(): Promise<number> {
    return this.accounts.size;
  }

  /**
   * Clear all accounts
   */
  async clear(): Promise<void> {
    this.accounts.clear();
    this.idIndex.clear();
  }
}
