/**
 * ADVANCED FEATURE: Portfolio Analytics & Reporting
 * 
 * Comprehensive analytics for tracking performance across all accounts:
 * - Historical performance tracking
 * - Win rate calculations
 * - Volatility analysis
 * - Equity curves
 */

interface PerformanceSnapshot {
  timestamp: Date;
  balance: number;
  equity: number;
  positions: number;
  roi: number;
}

interface AnalyticsMetrics {
  totalReturn: number;
  annualizedReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  profitFactor: number;
  averageWin: number;
  averageLoss: number;
}

/**
 * Portfolio analytics engine
 */
export class PortfolioAnalytics {
  private history: PerformanceSnapshot[] = [];
  private trades: Array<{ entryPrice: number; exitPrice: number; profit: number }> = [];

  /**
   * Record performance snapshot
   */
  recordSnapshot(balance: number, equity: number, positions: number, roi: number): void {
    this.history.push({
      timestamp: new Date(),
      balance,
      equity,
      positions,
      roi,
    });
  }

  /**
   * Record completed trade
   */
  recordTrade(entryPrice: number, exitPrice: number): void {
    const profit = exitPrice - entryPrice;
    this.trades.push({ entryPrice, exitPrice, profit });
  }

  /**
   * Calculate analytics metrics
   */
  calculateMetrics(): AnalyticsMetrics {
    if (this.history.length < 2) {
      return {
        totalReturn: 0,
        annualizedReturn: 0,
        sharpeRatio: 0,
        maxDrawdown: 0,
        winRate: 0,
        profitFactor: 0,
        averageWin: 0,
        averageLoss: 0,
      };
    }

    // Calculate returns
    const firstSnapshot = this.history[0];
    const lastSnapshot = this.history[this.history.length - 1];
    const totalReturn = (lastSnapshot.equity - firstSnapshot.equity) / firstSnapshot.equity;

    // Calculate time period
    const dayCount =
      (lastSnapshot.timestamp.getTime() - firstSnapshot.timestamp.getTime()) /
      (1000 * 60 * 60 * 24);
    const annualizedReturn = totalReturn * (365 / dayCount);

    // Calculate max drawdown
    let peak = firstSnapshot.equity;
    let maxDrawdown = 0;
    for (const snapshot of this.history) {
      if (snapshot.equity > peak) peak = snapshot.equity;
      const drawdown = (peak - snapshot.equity) / peak;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    }

    // Calculate Sharpe ratio (simplified)
    const returns = [];
    for (let i = 1; i < this.history.length; i++) {
      const ret =
        (this.history[i].equity - this.history[i - 1].equity) / this.history[i - 1].equity;
      returns.push(ret);
    }
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    const sharpeRatio = stdDev > 0 ? (avgReturn * 252) / stdDev : 0; // 252 trading days

    // Calculate trade metrics
    const winningTrades = this.trades.filter((t) => t.profit > 0);
    const losingTrades = this.trades.filter((t) => t.profit < 0);
    const winRate = this.trades.length > 0 ? winningTrades.length / this.trades.length : 0;

    const totalWins = winningTrades.reduce((sum, t) => sum + t.profit, 0);
    const totalLosses = Math.abs(losingTrades.reduce((sum, t) => sum + t.profit, 0));
    const profitFactor = totalLosses > 0 ? totalWins / totalLosses : 0;

    const averageWin = winningTrades.length > 0 ? totalWins / winningTrades.length : 0;
    const averageLoss = losingTrades.length > 0 ? totalLosses / losingTrades.length : 0;

    return {
      totalReturn,
      annualizedReturn,
      sharpeRatio,
      maxDrawdown,
      winRate,
      profitFactor,
      averageWin,
      averageLoss,
    };
  }

  /**
   * Generate performance report
   */
  generateReport(): string {
    const metrics = this.calculateMetrics();
    return `
╔════════════════════════════════════════════════════════════╗
║          PORTFOLIO PERFORMANCE ANALYTICS REPORT            ║
╚════════════════════════════════════════════════════════════╝

📊 RETURNS
  Total Return:           ${(metrics.totalReturn * 100).toFixed(2)}%
  Annualized Return:      ${(metrics.annualizedReturn * 100).toFixed(2)}%

📈 RISK METRICS
  Sharpe Ratio:           ${metrics.sharpeRatio.toFixed(2)}
  Max Drawdown:           ${(metrics.maxDrawdown * 100).toFixed(2)}%

🎯 TRADING PERFORMANCE
  Win Rate:               ${(metrics.winRate * 100).toFixed(2)}%
  Profit Factor:          ${metrics.profitFactor.toFixed(2)}
  Average Win:            ${metrics.averageWin.toFixed(2)}
  Average Loss:           ${metrics.averageLoss.toFixed(2)}

📋 HISTORY
  Total Snapshots:        ${this.history.length}
  Total Trades:           ${this.trades.length}
  Winning Trades:         ${this.trades.filter((t) => t.profit > 0).length}
  Losing Trades:          ${this.trades.filter((t) => t.profit < 0).length}

`.trim();
  }

  /**
   * Export analytics as JSON
   */
  exportJSON(): string {
    return JSON.stringify(
      {
        metrics: this.calculateMetrics(),
        history: this.history,
        trades: this.trades,
        generatedAt: new Date().toISOString(),
      },
      null,
      2
    );
  }
}
