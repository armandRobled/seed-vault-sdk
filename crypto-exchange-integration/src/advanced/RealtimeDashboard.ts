/**
 * ADVANCED FEATURE: Dashboard & Real-Time Streaming
 * 
 * WebSocket-based real-time data streaming and dashboard:
 * - Live price feeds
 * - Portfolio updates
 * - Order execution
 * - Performance metrics
 */

import { EventEmitter } from 'events';

interface StreamData {
  symbol: string;
  price: number;
  volume: number;
  timestamp: Date;
  bid: number;
  ask: number;
}

interface DashboardState {
  accounts: Array<{ id: string; balance: number; lastUpdate: Date }>;
  positions: Array<{
    symbol: string;
    quantity: number;
    value: number;
    pnl: number;
    pnlPercent: number;
  }>;
  totalValue: number;
  totalPnL: number;
  totalPnLPercent: number;
}

/**
 * Real-time dashboard system
 */
export class RealtimeDashboard extends EventEmitter {
  private streams: Map<string, StreamData> = new Map();
  private state: DashboardState = {
    accounts: [],
    positions: [],
    totalValue: 0,
    totalPnL: 0,
    totalPnLPercent: 0,
  };
  private subscribers: Set<(state: DashboardState) => void> = new Set();
  private updateInterval?: NodeJS.Timer;

  /**
   * Update stream data for a symbol
   */
  updateStream(data: StreamData): void {
    this.streams.set(data.symbol, data);
    this.emit('stream:update', data);
    this.notifySubscribers();
  }

  /**
   * Update dashboard state
   */
  setState(state: Partial<DashboardState>): void {
    this.state = { ...this.state, ...state };
    this.notifySubscribers();
  }

  /**
   * Get current state
   */
  getState(): DashboardState {
    return { ...this.state };
  }

  /**
   * Subscribe to state changes
   */
  subscribe(callback: (state: DashboardState) => void): () => void {
    this.subscribers.add(callback);
    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Notify all subscribers
   */
  private notifySubscribers(): void {
    for (const callback of this.subscribers) {
      callback(this.state);
    }
  }

  /**
   * Get stream data
   */
  getStreamData(symbol: string): StreamData | undefined {
    return this.streams.get(symbol);
  }

  /**
   * Get all streams
   */
  getAllStreams(): StreamData[] {
    return Array.from(this.streams.values());
  }

  /**
   * Generate HTML dashboard
   */
  generateHTMLDashboard(): string {
    const positions = this.state.positions
      .map(
        (pos) =>
          `<tr>
        <td>${pos.symbol}</td>
        <td>${pos.quantity}</td>
        <td>$${pos.value.toFixed(2)}</td>
        <td style="color: ${pos.pnl >= 0 ? 'green' : 'red'};">$${pos.pnl.toFixed(2)} (${(pos.pnlPercent * 100).toFixed(2)}%)</td>
      </tr>`
      )
      .join('');

    return `
<!DOCTYPE html>
<html>
<head>
  <title>Trading Dashboard</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
    .header { background: #333; color: white; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
    .card { background: white; padding: 20px; margin: 10px 0; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
    table { width: 100%; border-collapse: collapse; }
    th { background: #333; color: white; padding: 10px; text-align: left; }
    td { padding: 10px; border-bottom: 1px solid #ddd; }
    .positive { color: green; }
    .negative { color: red; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 Trading Dashboard</h1>
    <p>Updated: ${new Date().toLocaleString()}</p>
  </div>
  
  <div class="card">
    <h2>Portfolio Summary</h2>
    <p><strong>Total Value:</strong> $${this.state.totalValue.toFixed(2)}</p>
    <p><strong>Total P&L:</strong> <span class="${this.state.totalPnL >= 0 ? 'positive' : 'negative'}">$${this.state.totalPnL.toFixed(2)} (${(this.state.totalPnLPercent * 100).toFixed(2)}%)</span></p>
  </div>
  
  <div class="card">
    <h2>Positions</h2>
    <table>
      <tr><th>Symbol</th><th>Quantity</th><th>Value</th><th>P&L</th></tr>
      ${positions}
    </table>
  </div>
  
  <div class="card">
    <h2>Active Accounts</h2>
    <ul>
      ${this.state.accounts.map((acc) => `<li>${acc.id}: $${acc.balance.toFixed(2)}</li>`).join('')}
    </ul>
  </div>
</body>
</html>
    `;
  }
}
