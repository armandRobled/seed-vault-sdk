/**
 * ADVANCED FEATURE: Multi-Exchange Trading Bot
 * 
 * Automated trading across BitMEX and other platforms with:
 * - Portfolio rebalancing
 * - Risk management
 * - Real-time monitoring
 * - Profit/loss tracking
 */

import { AccountIntegrationManager } from './manager/AccountIntegrationManager';
import { BitMEXAuthenticator } from './authenticators/BitMEXAuthenticator';
import { EventEmitter } from 'events';

interface PortfolioPosition {
  symbol: string;
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
}

interface PortfolioMetrics {
  totalValue: number;
  totalPnL: number;
  totalPnLPercent: number;
  positions: PortfolioPosition[];
  timestamp: Date;
}

interface TradingRules {
  maxPositionSize: number; // Max USD per position
  maxDrawdown: number; // Max allowed drawdown %
  takeProfitPercent: number; // TP level %
  stopLossPercent: number; // SL level %
  rebalanceThreshold: number; // Rebalance when drift > %
}

/**
 * Advanced trading bot for multi-exchange portfolio management
 */
export class AdvancedTradingBot extends EventEmitter {
  private manager: AccountIntegrationManager;
  private bitmexAccount?: BitMEXAuthenticator;
  private portfolio: Map<string, PortfolioPosition> = new Map();
  private metrics: PortfolioMetrics | null = null;
  private rules: TradingRules;
  private isRunning: boolean = false;
  private monitoringInterval?: NodeJS.Timer;

  constructor(
    manager: AccountIntegrationManager,
    rules: Partial<TradingRules> = {}
  ) {
    super();
    this.manager = manager;
    this.rules = {
      maxPositionSize: 10000, // $10k per position
      maxDrawdown: 0.1, // 10% max drawdown
      takeProfitPercent: 0.1, // 10% TP
      stopLossPercent: 0.05, // 5% SL
      rebalanceThreshold: 0.15, // Rebalance if > 15% drift
      ...rules,
    };
  }

  /**
   * Initialize the bot with BitMEX account
   */
  async initialize(bitmexAccountId: string): Promise<void> {
    this.bitmexAccount = this.manager.getBitMEXAuthenticator(bitmexAccountId);
    await this.updatePortfolio();
    this.emit('initialized', { portfolio: this.portfolio });
  }

  /**
   * Update portfolio positions from BitMEX
   */
  async updatePortfolio(): Promise<PortfolioMetrics> {
    try {
      if (!this.bitmexAccount) throw new Error('Bot not initialized');

      const positions = await this.bitmexAccount.getPositions();
      const wallet = await this.bitmexAccount.getWallet();

      let totalValue = 0;
      let totalPnL = 0;

      // Update positions
      for (const pos of positions.filter((p) => p.simpleCost && p.simpleCost !== 0)) {
        const currentValue = pos.lastValue || 0;
        const pnl = pos.unrealisedPnl || 0;
        const pnlPercent = pos.unrealisedRoePcnt || 0;

        totalValue += currentValue;
        totalPnL += pnl;

        this.portfolio.set(pos.symbol, {
          symbol: pos.symbol,
          quantity: pos.simpleCost || 0,
          entryPrice: pos.avgEntryPrice || 0,
          currentPrice: pos.lastPrice || 0,
          pnl,
          pnlPercent,
        });
      }

      const totalPnLPercent = totalValue > 0 ? totalPnL / totalValue : 0;

      this.metrics = {
        totalValue,
        totalPnL,
        totalPnLPercent,
        positions: Array.from(this.portfolio.values()),
        timestamp: new Date(),
      };

      this.emit('portfolio:updated', this.metrics);
      return this.metrics;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Apply risk management rules
   */
  async applyRiskManagement(): Promise<void> {
    if (!this.metrics) return;

    // Check max drawdown
    if (this.metrics.totalPnLPercent < -this.rules.maxDrawdown) {
      this.emit('risk:alert', {
        type: 'MAX_DRAWDOWN_EXCEEDED',
        current: this.metrics.totalPnLPercent,
        limit: -this.rules.maxDrawdown,
      });
    }

    // Check individual positions
    for (const pos of this.metrics.positions) {
      if (pos.pnlPercent >= this.rules.takeProfitPercent) {
        this.emit('risk:take-profit-triggered', { symbol: pos.symbol, pnl: pos.pnl });
      }
      if (pos.pnlPercent <= -this.rules.stopLossPercent) {
        this.emit('risk:stop-loss-triggered', { symbol: pos.symbol, pnl: pos.pnl });
      }
    }
  }

  /**
   * Start continuous monitoring
   */
  start(intervalMs: number = 60000): void {
    if (this.isRunning) return;
    this.isRunning = true;

    this.monitoringInterval = setInterval(async () => {
      try {
        await this.updatePortfolio();
        await this.applyRiskManagement();
      } catch (error) {
        this.emit('error', error);
      }
    }, intervalMs);

    this.emit('bot:started', { intervalMs });
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    this.isRunning = false;
    this.emit('bot:stopped');
  }

  /**
   * Get current metrics
   */
  getMetrics(): PortfolioMetrics | null {
    return this.metrics;
  }

  /**
   * Export portfolio snapshot
   */
  exportSnapshot(): string {
    return JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        metrics: this.metrics,
        rules: this.rules,
      },
      null,
      2
    );
  }
}
