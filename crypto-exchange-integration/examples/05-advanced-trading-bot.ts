/**
 * Example 5: Advanced Trading Bot Setup
 * 
 * Demonstrates advanced trading bot with:
 * - Portfolio monitoring
 * - Risk management
 * - Alert system
 * - Analytics
 */

import {
  AccountIntegrationManager,
  ConfigManager,
} from '../src';
import {
  AdvancedTradingBot,
  PortfolioAnalytics,
  AlertSystem,
  AlertSeverity,
  RealtimeDashboard,
} from '../src/advanced';
import fs from 'fs';

async function main() {
  console.log('🤖 Advanced Trading Bot Example\n');

  const manager = new AccountIntegrationManager();
  const alertSystem = new AlertSystem();
  const analytics = new PortfolioAnalytics();
  const dashboard = new RealtimeDashboard();

  try {
    // Register BitMEX account
    console.log('📝 Setting up BitMEX account...');
    await manager.registerAccount({
      id: 'bitmex_trading',
      type: 'exchange',
      platform: 'bitmex',
      credentials: {
        apiKey: process.env.BITMEX_API_KEY!,
        apiSecret: process.env.BITMEX_API_SECRET!,
      },
      enabled: true,
    });

    // Initialize trading bot
    console.log('🚀 Initializing trading bot...\n');
    const bot = new AdvancedTradingBot(manager, {
      maxPositionSize: 5000,
      maxDrawdown: 0.1,
      takeProfitPercent: 0.15,
      stopLossPercent: 0.05,
    });

    // Setup alerts
    console.log('🔔 Setting up alert system...\n');
    alertSystem.onAlert(AlertSeverity.CRITICAL, async (alert) => {
      console.log(`🚨 CRITICAL ALERT: ${alert.title}`);
      console.log(`   ${alert.message}\n`);
    });

    alertSystem.onAlert(AlertSeverity.WARNING, async (alert) => {
      console.log(`⚠️  WARNING: ${alert.title}`);
    });

    // Subscribe to bot events
    bot.on('initialized', (data) => {
      console.log('✅ Bot initialized with portfolio:', data.portfolio);
    });

    bot.on('portfolio:updated', (metrics) => {
      console.log(`\n📊 Portfolio Updated:`);
      console.log(`   Total Value: $${metrics.totalValue.toFixed(2)}`);
      console.log(`   Total P&L: $${metrics.totalPnL.toFixed(2)} (${(metrics.totalPnLPercent * 100).toFixed(2)}%)`);

      // Record analytics snapshot
      analytics.recordSnapshot(
        metrics.totalValue,
        metrics.totalValue,
        metrics.positions.length,
        metrics.totalPnLPercent
      );

      // Update dashboard
      dashboard.setState({
        totalValue: metrics.totalValue,
        totalPnL: metrics.totalPnL,
        totalPnLPercent: metrics.totalPnLPercent,
        positions: metrics.positions.map((pos) => ({
          symbol: pos.symbol,
          quantity: pos.quantity,
          value: pos.quantity * pos.currentPrice,
          pnl: pos.pnl,
          pnlPercent: pos.pnlPercent,
        })),
      });
    });

    bot.on('risk:alert', async (data) => {
      await alertSystem.alert(
        'RISK_EVENT',
        'Risk Management Alert',
        `${data.type}: Current ${(data.current * 100).toFixed(2)}% vs Limit ${(data.limit * 100).toFixed(2)}%`,
        AlertSeverity.CRITICAL,
        data
      );
    });

    bot.on('risk:take-profit-triggered', async (data) => {
      await alertSystem.alert(
        'TAKE_PROFIT',
        'Take Profit Triggered',
        `Position ${data.symbol} has reached take profit level with P&L: $${data.pnl.toFixed(2)}`,
        AlertSeverity.INFO
      );
    });

    bot.on('risk:stop-loss-triggered', async (data) => {
      await alertSystem.alert(
        'STOP_LOSS',
        'Stop Loss Triggered',
        `Position ${data.symbol} has hit stop loss with P&L: $${data.pnl.toFixed(2)}`,
        AlertSeverity.WARNING
      );
    });

    // Initialize bot (this would fetch portfolio data in real scenario)
    console.log('\n📈 Fetching initial portfolio data...');
    try {
      await bot.initialize('bitmex_trading');
      console.log('✅ Bot initialized successfully');
    } catch (error) {
      console.log('ℹ️  Portfolio fetch requires valid BitMEX API credentials');
    }

    // Generate analytics report
    console.log('\n' + analytics.generateReport());

    // Generate dashboard HTML
    const html = dashboard.generateHTMLDashboard();
    fs.writeFileSync('/tmp/dashboard.html', html);
    console.log('\n✅ Dashboard saved to /tmp/dashboard.html');

    // Display active alerts
    console.log('\n🔔 Alert System Status:');
    console.log(`   Total Alerts: ${alertSystem.getAllAlerts().length}`);
    console.log(`   Unread Alerts: ${alertSystem.getUnreadAlerts().length}`);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main().catch(console.error);
