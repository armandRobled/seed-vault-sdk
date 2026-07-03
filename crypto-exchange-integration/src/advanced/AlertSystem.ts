/**
 * ADVANCED FEATURE: Alert & Notification System
 * 
 * Real-time alerts for:
 * - Price movements
 * - Risk events
 * - Account changes
 * - Trading opportunities
 */

import { EventEmitter } from 'events';

export enum AlertSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

export interface Alert {
  id: string;
  severity: AlertSeverity;
  type: string;
  title: string;
  message: string;
  timestamp: Date;
  data?: Record<string, any>;
  read: boolean;
}

type AlertHandler = (alert: Alert) => Promise<void> | void;

/**
 * Alert system for real-time notifications
 */
export class AlertSystem extends EventEmitter {
  private alerts: Map<string, Alert> = new Map();
  private handlers: Map<AlertSeverity, Set<AlertHandler>> = new Map();
  private maxAlerts: number = 1000;

  constructor() {
    super();
    // Initialize handlers map
    Object.values(AlertSeverity).forEach((severity) => {
      this.handlers.set(severity as AlertSeverity, new Set());
    });
  }

  /**
   * Register handler for specific severity level
   */
  onAlert(severity: AlertSeverity, handler: AlertHandler): void {
    const handlers = this.handlers.get(severity);
    if (handlers) {
      handlers.add(handler);
    }
  }

  /**
   * Create and emit new alert
   */
  async alert(
    type: string,
    title: string,
    message: string,
    severity: AlertSeverity = AlertSeverity.INFO,
    data?: Record<string, any>
  ): Promise<void> {
    const alertId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const alert: Alert = {
      id: alertId,
      severity,
      type,
      title,
      message,
      timestamp: new Date(),
      data,
      read: false,
    };

    // Store alert
    this.alerts.set(alertId, alert);

    // Cleanup old alerts if exceeding max
    if (this.alerts.size > this.maxAlerts) {
      const oldestKey = Array.from(this.alerts.keys())[0];
      this.alerts.delete(oldestKey);
    }

    // Execute handlers
    const handlers = this.handlers.get(severity);
    if (handlers) {
      for (const handler of handlers) {
        try {
          await handler(alert);
        } catch (error) {
          console.error('Alert handler error:', error);
        }
      }
    }

    // Emit event
    this.emit(severity, alert);
    this.emit('alert', alert);
  }

  /**
   * Get alert by ID
   */
  getAlert(id: string): Alert | undefined {
    return this.alerts.get(id);
  }

  /**
   * Get all alerts
   */
  getAllAlerts(): Alert[] {
    return Array.from(this.alerts.values());
  }

  /**
   * Get unread alerts
   */
  getUnreadAlerts(): Alert[] {
    return Array.from(this.alerts.values()).filter((a) => !a.read);
  }

  /**
   * Mark alert as read
   */
  markAsRead(id: string): void {
    const alert = this.alerts.get(id);
    if (alert) {
      alert.read = true;
    }
  }

  /**
   * Clear all alerts
   */
  clearAll(): void {
    this.alerts.clear();
  }

  /**
   * Get alerts by type
   */
  getAlertsByType(type: string): Alert[] {
    return Array.from(this.alerts.values()).filter((a) => a.type === type);
  }

  /**
   * Get alerts by severity
   */
  getAlertsBySeverity(severity: AlertSeverity): Alert[] {
    return Array.from(this.alerts.values()).filter((a) => a.severity === severity);
  }

  /**
   * Export alerts as JSON
   */
  exportJSON(): string {
    return JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        totalAlerts: this.alerts.size,
        alerts: Array.from(this.alerts.values()),
      },
      null,
      2
    );
  }
}
