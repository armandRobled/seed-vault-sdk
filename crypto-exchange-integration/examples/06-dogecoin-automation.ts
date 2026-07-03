/**
 * Example 6: Dogecoin Automation & Recurring Payments
 * 
 * Demonstrates advanced Dogecoin features:
 * - Multi-signature transactions
 * - Recurring payments
 * - Automation scheduler
 */

import { AccountIntegrationManager } from '../src';
import { DogecoinAutomation } from '../src/advanced';

async function main() {
  console.log('⚙️  Dogecoin Automation & Recurring Payments Example\n');

  const manager = new AccountIntegrationManager();

  try {
    // Register Dogecoin account
    console.log('📝 Setting up Dogecoin account...');
    await manager.registerAccount({
      id: 'doge_automation',
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

    const dogecoin = manager.getDogecoinConnector('doge_automation');
    const automation = new DogecoinAutomation(dogecoin);

    console.log('✅ Connected to Dogecoin\n');

    // Example 1: Create multi-signature transaction
    console.log('🔐 Multi-Signature Transaction Example\n');
    const multiSigTx = await automation.createMultiSigTransaction(
      [
        { address: 'DNnGtXk9khadE7EKCmQzxjnehenX92PKAv', amount: 10 },
        { address: 'DMvqv7B8vM3NJ5QvP8DhC1yYXpBMhF5dS4', amount: 5 },
      ],
      2 // Require 2 signatures
    );
    console.log(`Created multi-sig transaction: ${multiSigTx.id}`);
    console.log(`Recipients: ${multiSigTx.recipients.map((r) => r.address).join(', ')}`);
    console.log(`Required Signatures: ${multiSigTx.requiredSignatures}\n`);

    // Example 2: Create recurring payment
    console.log('💰 Recurring Payment Setup\n');
    const recurringPayment = automation.createRecurringPayment(
      'DMvqv7B8vM3NJ5QvP8DhC1yYXpBMhF5dS4',
      [
        { address: 'DNnGtXk9khadE7EKCmQzxjnehenX92PKAv', percentage: 60 },
        { address: 'DAJtD9XFu5kFZdKnHDPCPqTnRYjvA7FPbP', percentage: 40 },
      ],
      'weekly',
      100 // 100 DOGE per week
    );
    console.log(`Created recurring payment: ${recurringPayment.id}`);
    console.log(`Amount: ${recurringPayment.amount} DOGE`);
    console.log(`Frequency: ${recurringPayment.frequency}`);
    console.log(`Recipients:`);
    recurringPayment.recipients.forEach((r) => {
      console.log(`  - ${r.address}: ${r.percentage}%`);
    });
    console.log(`Next Execution: ${recurringPayment.nextExecution.toLocaleString()}\n`);

    // Example 3: List recurring payments
    console.log('📋 All Recurring Payments:\n');
    const payments = automation.listRecurringPayments();
    payments.forEach((payment) => {
      console.log(`✓ ${payment.id}`);
      console.log(`  Status: ${payment.isActive ? '✅ Active' : '❌ Inactive'}`);
      console.log(`  Next: ${payment.nextExecution.toLocaleString()}`);
    });

    console.log('\n✅ Dogecoin automation ready!');
    console.log('   Note: Automation scheduler can be started with startScheduler()');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main().catch(console.error);
