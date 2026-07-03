# 🚀 Advanced Features Guide

## Overview

The crypto-exchange-integration module now includes advanced trading features that go beyond basic account management. These features enable sophisticated portfolio management, automated trading, real-time monitoring, and advanced Dogecoin automation.

## 🤖 Advanced Trading Bot

### Features
- **Portfolio Monitoring**: Real-time tracking of positions and balances
- **Risk Management**: Automatic risk limit enforcement
- **Performance Metrics**: Live P&L calculation
- **Alert System**: Triggered alerts for risk events

### Usage

```typescript
import { AccountIntegrationManager } from './src';
import { AdvancedTradingBot, AlertSystem, AlertSeverity } from './src/advanced';

const manager = new AccountIntegrationManager();
const alertSystem = new AlertSystem();

// Register account and initialize bot
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

const bot = new AdvancedTradingBot(manager, {
  maxPositionSize: 10000,
  maxDrawdown: 0.1,
  takeProfitPercent: 0.1,
  stopLossPercent: 0.05,
});

// Setup alerts
alertSystem.onAlert(AlertSeverity.CRITICAL, async (alert) => {
  console.log(`🚨 ${alert.title}: ${alert.message}`);
});

// Listen to bot events
bot.on('portfolio:updated', (metrics) => {
  console.log(`P&L: ${metrics.totalPnL}`);
});

bot.on('risk:alert', async (data) => {
  await alertSystem.alert(
    'RISK_EVENT',
    'Risk Alert',
    `Drawdown: ${data.current}`,
    AlertSeverity.CRITICAL
  );
});

// Initialize and start monitoring
await bot.initialize('bitmex_trading');
bot.start(60000); // Monitor every 60 seconds
```

## 📊 Portfolio Analytics

### Metrics Calculated
- Total Return
- Annualized Return
- Sharpe Ratio
- Maximum Drawdown
- Win Rate
- Profit Factor
- Average Win/Loss

### Usage

```typescript
import { PortfolioAnalytics } from './src/advanced';

const analytics = new PortfolioAnalytics();

// Record performance snapshots
analytics.recordSnapshot(
  balance, // Current balance
  equity,  // Total equity
  positions, // Number of positions
  roi     // Return on investment
);

// Record trades
analytics.recordTrade(entryPrice, exitPrice);

// Calculate metrics
const metrics = analytics.calculateMetrics();
console.log(`Sharpe Ratio: ${metrics.sharpeRatio}`);
console.log(`Win Rate: ${metrics.winRate * 100}%`);

// Generate report
const report = analytics.generateReport();
console.log(report);

// Export data
const json = analytics.exportJSON();
```

## 🔔 Alert System

### Alert Severity Levels
- **INFO**: General information
- **WARNING**: Important but not critical
- **ERROR**: Error events
- **CRITICAL**: Critical events requiring immediate attention

### Usage

```typescript
import { AlertSystem, AlertSeverity } from './src/advanced';

const alerts = new AlertSystem();

// Register handlers
alerts.onAlert(AlertSeverity.CRITICAL, async (alert) => {
  // Send email/SMS/webhook
  await sendCriticalAlert(alert);
});

alerts.onAlert(AlertSeverity.WARNING, async (alert) => {
  console.log(`Warning: ${alert.title}`);
});

// Create alerts
await alerts.alert(
  'PRICE_ALERT',
  'Price Movement',
  'BTC moved 5% in 1 minute',
  AlertSeverity.WARNING,
  { symbol: 'XBTUSD', movement: 0.05 }
);

// Manage alerts
const unreadAlerts = alerts.getUnreadAlerts();
alerts.markAsRead(unreadAlerts[0].id);

// Export alerts
const json = alerts.exportJSON();
```

## ⚙️ Dogecoin Automation

### Features
- **Multi-Signature Transactions**: Require multiple signatures
- **Recurring Payments**: Automated scheduled payments
- **Payment Splitting**: Distribute funds to multiple addresses
- **Execution Scheduler**: Automatic execution of due payments

### Usage

```typescript
import { DogecoinAutomation } from './src/advanced';

const dogecoin = manager.getDogecoinConnector('doge_mainnet');
const automation = new DogecoinAutomation(dogecoin);

// Create multi-signature transaction
const multiSigTx = await automation.createMultiSigTransaction(
  [
    { address: 'DNnGtXk9khadE7EKCmQzxjnehenX92PKAv', amount: 10 },
    { address: 'DMvqv7B8vM3NJ5QvP8DhC1yYXpBMhF5dS4', amount: 5 },
  ],
  2 // Require 2 signatures
);

// Sign transaction
automation.signMultiSigTransaction(multiSigTx.id, 'signature1');
automation.signMultiSigTransaction(multiSigTx.id, 'signature2');

// Execute when ready
const txHash = await automation.executeMultiSigTransaction(multiSigTx.id);

// Create recurring payment
const recurring = automation.createRecurringPayment(
  'DMvqv7B8vM3NJ5QvP8DhC1yYXpBMhF5dS4',
  [
    { address: 'DNnGtXk9khadE7EKCmQzxjnehenX92PKAv', percentage: 60 },
    { address: 'DAJtD9XFu5kFZdKnHDPCPqTnRYjvA7FPbP', percentage: 40 },
  ],
  'weekly', // daily, weekly, monthly
  100 // 100 DOGE
);

// Start automation scheduler
automation.startScheduler(3600000); // Check every hour
```

## 📡 Real-Time Dashboard

### Features
- **Live Streaming**: Real-time price and data updates
- **State Management**: Current portfolio state
- **Subscriptions**: Push updates to subscribers
- **HTML Export**: Generate web dashboard

### Usage

```typescript
import { RealtimeDashboard } from './src/advanced';

const dashboard = new RealtimeDashboard();

// Update stream data
dashboard.updateStream({
  symbol: 'XBTUSD',
  price: 50000,
  volume: 1000,
  timestamp: new Date(),
  bid: 49999,
  ask: 50001,
});

// Subscribe to updates
const unsubscribe = dashboard.subscribe((state) => {
  console.log(`Portfolio value: $${state.totalValue}`);
});

// Update state
dashboard.setState({
  totalValue: 100000,
  totalPnL: 5000,
  totalPnLPercent: 0.05,
});

// Generate HTML dashboard
const html = dashboard.generateHTMLDashboard();
fs.writeFileSync('dashboard.html', html);
```

## 📚 Complete Examples

### Example 5: Advanced Trading Bot
```bash
npx ts-node examples/05-advanced-trading-bot.ts
```

Demonstrates:
- Bot initialization with risk rules
- Alert system setup
- Event listening
- Portfolio monitoring
- Analytics reporting
- Dashboard generation

### Example 6: Dogecoin Automation
```bash
npx ts-node examples/06-dogecoin-automation.ts
```

Demonstrates:
- Multi-signature transactions
- Recurring payment setup
- Automation scheduler
- Payment distribution

## 🔧 Configuration

### Advanced Bot Rules

```typescript
const rules = {
  maxPositionSize: 10000,      // Max $10k per position
  maxDrawdown: 0.1,            // Max 10% drawdown
  takeProfitPercent: 0.1,      // Take profit at +10%
  stopLossPercent: 0.05,       // Stop loss at -5%
  rebalanceThreshold: 0.15,    // Rebalance if drift > 15%
};
```

## 📊 Performance Monitoring

### Track Performance

```typescript
// Record metrics
analytics.recordSnapshot(balance, equity, positions, roi);

// Generate performance report
const report = analytics.generateReport();
/* Output:
╔════════════════════════════════════════════════════════════╗
║          PORTFOLIO PERFORMANCE ANALYTICS REPORT            ║
╚════════════════════════════════════════════════════════════╝

📊 RETURNS
  Total Return:           5.25%
  Annualized Return:      62.48%

📈 RISK METRICS
  Sharpe Ratio:           2.15
  Max Drawdown:           -3.50%

🎯 TRADING PERFORMANCE
  Win Rate:               65.00%
  Profit Factor:          2.35
  Average Win:            250.00
  Average Loss:           -150.00
*/
```

## 🎯 Best Practices

1. **Start Small**: Test with small position sizes first
2. **Monitor Logs**: Keep detailed logs of all transactions
3. **Set Alerts**: Configure alerts for important events
4. **Backtest**: Use historical data before live trading
5. **Risk Management**: Always set stop losses and take profits
6. **Diversify**: Spread across multiple positions
7. **Documentation**: Document all configurations
8. **Security**: Never hardcode credentials

## 🐛 Troubleshooting

### Bot Won't Initialize
- Check BitMEX API credentials
- Verify network connectivity
- Check RPC endpoints

### Alerts Not Firing
- Verify alert handlers are registered
- Check event emitter subscriptions
- Review console logs

### Dogecoin Automation Failing
- Verify Dogecoin node is running
- Check RPC credentials
- Ensure sufficient DOGE balance

## 📖 Additional Resources

- [BitMEX API Docs](https://www.bitmex.com/api/explorer/)
- [Dogecoin JSON-RPC API](https://developer.bitcoin.org/reference/rpc/)
- [Portfolio Management Best Practices](https://www.investopedia.com/)
- [Risk Management Guide](https://www.riskmanagementmonitor.com/)

## 🤝 Contributing

To add new advanced features:

1. Create new file in `src/advanced/`
2. Implement feature class extending EventEmitter
3. Add export to `src/advanced/index.ts`
4. Create example in `examples/`
5. Document usage in this guide

## 📝 License

MIT
