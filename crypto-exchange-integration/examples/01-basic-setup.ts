/**
 * Example 1: Basic Multi-Account Setup
 * 
 * Demonstrates how to set up and register multiple accounts.
 */

import { AccountIntegrationManager, ConfigManager } from '../src';

async function main() {
  console.log('🚀 Crypto Exchange Integration - Basic Setup\n');

  // Initialize the manager
  const manager = new AccountIntegrationManager();

  try {
    // Register BitMEX account
    console.log('📝 Registering BitMEX account...');
    await manager.registerAccount({
      id: 'bitmex_main',
      type: 'exchange',
      platform: 'bitmex',
      credentials: {
        apiKey: process.env.BITMEX_API_KEY!,
        apiSecret: process.env.BITMEX_API_SECRET!,
      },
      enabled: true,
      metadata: { description: 'Main BitMEX trading account' },
    });
    console.log('✅ BitMEX account registered\n');

    // Register Dogecoin mainnet
    console.log('📝 Registering Dogecoin mainnet...');
    await manager.registerAccount({
      id: 'doge_mainnet',
      type: 'blockchain',
      platform: 'dogecoin',
      credentials: {
        rpcUrl: process.env.DOGECOIN_MAINNET_RPC_URL || 'http://localhost:22555',
        rpcUser: process.env.DOGECOIN_MAINNET_RPC_USER,
        rpcPassword: process.env.DOGECOIN_MAINNET_RPC_PASSWORD,
      },
      network: 'mainnet',
      enabled: true,
      metadata: { description: 'Dogecoin mainnet wallet' },
    });
    console.log('✅ Dogecoin mainnet registered\n');

    // List all accounts
    console.log('📋 Registered Accounts:');
    const accounts = await manager.listAccounts();
    accounts.forEach((account) => {
      console.log(`  - ${account.id} (${account.platform}/${account.type})`);
      console.log(`    Network: ${account.network || 'N/A'}`);
      console.log(`    Enabled: ${account.enabled}`);
      console.log(`    Connected: ${account.connected}`);
    });

    console.log(`\n📊 Total accounts: ${await manager.getAccountCount()}`);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main().catch(console.error);
