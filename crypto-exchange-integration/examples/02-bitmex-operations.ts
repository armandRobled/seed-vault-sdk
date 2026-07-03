/**
 * Example 2: BitMEX Operations
 * 
 * Demonstrates BitMEX API operations (balance, positions, orders).
 */

import { AccountIntegrationManager } from '../src';

async function main() {
  console.log('🚀 BitMEX Operations Example\n');

  const manager = new AccountIntegrationManager();

  try {
    // Register BitMEX account
    await manager.registerAccount({
      id: 'bitmex_main',
      type: 'exchange',
      platform: 'bitmex',
      credentials: {
        apiKey: process.env.BITMEX_API_KEY!,
        apiSecret: process.env.BITMEX_API_SECRET!,
      },
      enabled: true,
    });

    const bitmex = manager.getBitMEXAuthenticator('bitmex_main');

    // Get balance
    console.log('💰 Fetching account balance...');
    try {
      const balance = await bitmex.getBalance();
      console.log('Account Info:');
      console.log(`  Amount: ${balance.amount}`);
      console.log(`  Currency: ${balance.currency}\n`);
    } catch (error) {
      console.log('Note: Balance fetch may fail without valid API credentials\n');
    }

    // Get positions
    console.log('📊 Fetching positions...');
    try {
      const positions = await bitmex.getPositions();
      if (positions.length > 0) {
        console.log('Open Positions:');
        positions.slice(0, 3).forEach((pos) => {
          console.log(`  - ${pos.symbol}: Qty ${pos.simpleCost}`);
        });
      } else {
        console.log('No open positions');
      }
    } catch (error) {
      console.log('Note: Positions fetch may fail without valid API credentials\n');
    }

    // List orders
    console.log('\n📑 Fetching orders...');
    try {
      const orders = await bitmex.getOrders({ filter: { open: true } });
      console.log(`Found ${orders.length} open orders`);
    } catch (error) {
      console.log('Note: Orders fetch may fail without valid API credentials');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main().catch(console.error);
