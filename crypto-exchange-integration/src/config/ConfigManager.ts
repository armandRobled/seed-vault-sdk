/**
 * Configuration Manager
 * 
 * Manages environment-based configuration for multi-account setup.
 */

import { AccountConfig } from '../types';

/**
 * Configuration Manager for multi-account setup
 */
export class ConfigManager {
  /**
   * Load BitMEX account configuration from environment
   */
  static loadBitMEXConfig(): AccountConfig {
    const apiKey = process.env.BITMEX_API_KEY;
    const apiSecret = process.env.BITMEX_API_SECRET;
    const testMode = process.env.BITMEX_TEST_MODE === 'true';

    if (!apiKey || !apiSecret) {
      throw new Error('BITMEX_API_KEY and BITMEX_API_SECRET environment variables required');
    }

    return {
      id: 'bitmex_main',
      type: 'exchange',
      platform: 'bitmex',
      credentials: {
        apiKey,
        apiSecret,
      },
      enabled: true,
      metadata: { testMode },
    };
  }

  /**
   * Load Dogecoin mainnet configuration from environment
   */
  static loadDogecoinMainnetConfig(): AccountConfig {
    const rpcUrl = process.env.DOGECOIN_MAINNET_RPC_URL || 'http://localhost:22555';
    const rpcUser = process.env.DOGECOIN_MAINNET_RPC_USER;
    const rpcPassword = process.env.DOGECOIN_MAINNET_RPC_PASSWORD;

    return {
      id: 'doge_mainnet',
      type: 'blockchain',
      platform: 'dogecoin',
      credentials: {
        rpcUrl,
        rpcUser,
        rpcPassword,
      },
      network: 'mainnet',
      enabled: true,
    };
  }

  /**
   * Load Dogecoin testnet configuration from environment
   */
  static loadDogecoinTestnetConfig(): AccountConfig {
    const rpcUrl = process.env.DOGECOIN_TESTNET_RPC_URL || 'http://localhost:44555';
    const rpcUser = process.env.DOGECOIN_TESTNET_RPC_USER;
    const rpcPassword = process.env.DOGECOIN_TESTNET_RPC_PASSWORD;

    return {
      id: 'doge_testnet',
      type: 'blockchain',
      platform: 'dogecoin',
      credentials: {
        rpcUrl,
        rpcUser,
        rpcPassword,
      },
      network: 'testnet',
      enabled: true,
    };
  }

  /**
   * Load Dogecoin regtest configuration from environment
   */
  static loadDogecoinRegtestConfig(): AccountConfig {
    const rpcUrl = process.env.DOGECOIN_REGTEST_RPC_URL || 'http://localhost:18332';
    const rpcUser = process.env.DOGECOIN_REGTEST_RPC_USER;
    const rpcPassword = process.env.DOGECOIN_REGTEST_RPC_PASSWORD;

    return {
      id: 'doge_regtest',
      type: 'blockchain',
      platform: 'dogecoin',
      credentials: {
        rpcUrl,
        rpcUser,
        rpcPassword,
      },
      network: 'regtest',
      enabled: true,
    };
  }

  /**
   * Load all default accounts from environment
   */
  static loadAllDefaults(): AccountConfig[] {
    const configs: AccountConfig[] = [];

    // Load BitMEX
    try {
      configs.push(this.loadBitMEXConfig());
    } catch (e) {
      console.warn('BitMEX config not available:', e);
    }

    // Load Dogecoin networks
    try {
      configs.push(this.loadDogecoinMainnetConfig());
    } catch (e) {
      console.warn('Dogecoin mainnet config not available:', e);
    }

    try {
      configs.push(this.loadDogecoinTestnetConfig());
    } catch (e) {
      console.warn('Dogecoin testnet config not available:', e);
    }

    try {
      configs.push(this.loadDogecoinRegtestConfig());
    } catch (e) {
      console.warn('Dogecoin regtest config not available:', e);
    }

    return configs;
  }
}
