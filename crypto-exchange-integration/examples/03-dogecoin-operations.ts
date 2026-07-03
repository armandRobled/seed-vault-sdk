/**
 * Example 3: Dogecoin Wallet Operations
 * 
 * Demonstrates Dogecoin Core RPC operations (balance, addresses, transactions).
 */

import { AccountIntegrationManager } from '../src';

async function main() {
  console.log('🚀 Dogecoin Operations Example\n');

  const manager = new AccountIntegrationManager();

  try {
    // Register Dogecoin account
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
    });

    const doge = manager.getDogecoinConnector('doge_mainnet');

    // Get balance
    console.log('💰 Wallet Balance:');
    try {
      const balance = await doge.getBalance();
      console.log(`  Total: ${balance.balance} DOGE`);
      console.log(`  Confirmed: ${balance.confirmed} DOGE`);
      console.log(`  Unconfirmed: ${balance.unconfirmed} DOGE\n`);
    } catch (error) {
      console.log('❌ Could not connect to Dogecoin node');
      console.log('   Make sure dogecoind is running: dogecoind -daemon\n');
      return;
    }

    // Get addresses
    console.log('📍 Wallet Addresses:');
    const addresses = await doge.getAddresses();
    addresses.slice(0, 3).forEach((addr) => {
      console.log(`  - ${addr}`);
    });
    if (addresses.length > 3) {
      console.log(`  ... and ${addresses.length - 3} more`);
    }
    console.log('');

    // Get new address
    console.log('🔄 Generate New Address:');
    const newAddr = await doge.getNewAddress();
    console.log(`  ${newAddr}\n`);

    // Get blockchain info
    console.log('🔗 Blockchain Info:');
    const blockchainInfo = await doge.getBlockchainInfo();
    console.log(`  Current Block: ${blockchainInfo.blocks}`);
    console.log(`  Difficulty: ${blockchainInfo.difficulty}`);
    console.log(`  Network: ${blockchainInfo.chain}\n`);

    // List recent transactions
    console.log('📊 Recent Transactions:');
    const txs = await doge.listTransactions('*', 5);
    if (txs.length > 0) {
      txs.forEach((tx) => {
        console.log(`  - ${tx.txid}`);
        console.log(`    Amount: ${tx.amount}`);
        console.log(`    Confirmations: ${tx.confirmations}`);
      });
    } else {
      console.log('  No transactions found');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main().catch(console.error);
