/**
 * Example 4: Configuration Management
 * 
 * Demonstrates loading configurations from environment variables.
 */

import { AccountIntegrationManager, ConfigManager } from '../src';

async function main() {
  console.log('🚀 Configuration Management Example\n');

  const manager = new AccountIntegrationManager();

  try {
    // Load all available configurations
    console.log('📋 Loading configurations from environment...\n');
    const configs = ConfigManager.loadAllDefaults();

    if (configs.length === 0) {
      console.log('⚠️  No configurations loaded. Set environment variables:');
      console.log('   cp .env.example .env');
      console.log('   # Edit .env with your credentials');
      return;
    }

    console.log(`✅ Loaded ${configs.length} configuration(s):\n`);

    // Register all configs
    for (const config of configs) {
      console.log(`Registering: ${config.id}`);
      console.log(`  Platform: ${config.platform}`);
      console.log(`  Type: ${config.type}`);
      if (config.network) {
        console.log(`  Network: ${config.network}`);
      }
      console.log('');

      try {
        await manager.registerAccount(config);
        console.log('  ✅ Registered successfully\n');
      } catch (error) {
        console.log(`  ❌ Failed: ${error}\n`);
      }
    }

    // List all registered accounts
    console.log('\n📊 Summary:');
    const allAccounts = await manager.listAccounts();
    console.log(`Total accounts: ${allAccounts.length}`);

    const exchanges = allAccounts.filter((a) => a.type === 'exchange');
    const blockchains = allAccounts.filter((a) => a.type === 'blockchain');

    console.log(`  Exchanges: ${exchanges.length}`);
    console.log(`  Blockchains: ${blockchains.length}`);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main().catch(console.error);
