/**
 * BitMEX API Authenticator
 * 
 * Implements HMAC-SHA256 based authentication for BitMEX API v1.
 * Reference: https://github.com/BitMEX/api-connectors
 */

import crypto from 'crypto';
import https from 'https';
import { AuthenticationError, ConnectionError, RateLimitError } from '../errors/IntegrationErrors';
import { BitMEXBalance, BitMEXPosition } from '../types';

interface BitMEXConfig {
  apiKey: string;
  apiSecret: string;
  baseUrl?: string;
  testMode?: boolean;
  timeout?: number;
}

interface BitMEXRequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  data?: Record<string, any>;
}

/**
 * BitMEX API Authenticator
 * 
 * Handles HMAC-SHA256 signing and authenticated requests to BitMEX API.
 */
export class BitMEXAuthenticator {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl: string;
  private timeout: number;

  constructor(config: BitMEXConfig) {
    this.apiKey = config.apiKey;
    this.apiSecret = config.apiSecret;
    this.baseUrl = config.baseUrl || 'https://www.bitmex.com/api/v1';
    if (config.testMode) {
      this.baseUrl = 'https://testnet.bitmex.com/api/v1';
    }
    this.timeout = config.timeout || 30000;

    if (!this.apiKey || !this.apiSecret) {
      throw new AuthenticationError('BitMEX requires both apiKey and apiSecret');
    }
  }

  /**
   * Generate HMAC-SHA256 signature for BitMEX API
   * 
   * Signature format: HEX(HMAC_SHA256(secret, verb + path + expires + data))
   * 
   * @param verb HTTP method (GET, POST, etc.)
   * @param path Request path (e.g., /api/v1/user)
   * @param expires Unix timestamp with grace period
   * @param data Request body (JSON string or empty)
   * @returns Hex-encoded signature
   */
  private generateSignature(verb: string, path: string, expires: number, data: string = ''): string {
    const message = verb + path + expires + data;
    const signature = crypto
      .createHmac('sha256', this.apiSecret)
      .update(message)
      .digest('hex');
    return signature;
  }

  /**
   * Execute authenticated request to BitMEX API
   * 
   * @param options Request options (method, path, data)
   * @returns Parsed JSON response
   */
  async request<T = any>(options: BitMEXRequestOptions): Promise<T> {
    return new Promise((resolve, reject) => {
      try {
        // Add 5s grace period for clock skew
        const expires = Math.floor(Date.now() / 1000) + 5;
        const requestBody = options.data ? JSON.stringify(options.data) : '';
        const signature = this.generateSignature(
          options.method,
          options.path,
          expires,
          requestBody
        );

        const url = new URL(`${this.baseUrl}${options.path}`);
        const httpsOptions = {
          hostname: url.hostname,
          port: url.port || 443,
          path: url.pathname + url.search,
          method: options.method,
          headers: {
            'api-expires': expires.toString(),
            'api-key': this.apiKey,
            'api-signature': signature,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(requestBody),
          },
          timeout: this.timeout,
        };

        const req = https.request(httpsOptions, (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            try {
              // Check for rate limiting
              if (res.statusCode === 429) {
                const retryAfter = parseInt(res.headers['retry-after']?.toString() || '60', 10);
                reject(
                  new RateLimitError(
                    'BitMEX API rate limit exceeded',
                    retryAfter
                  )
                );
                return;
              }

              if (res.statusCode && res.statusCode >= 400) {
                let errorMessage = `BitMEX API error: ${res.statusCode}`;
                try {
                  const errorData = JSON.parse(data);
                  errorMessage = errorData.error?.message || errorMessage;
                } catch (e) {
                  // Keep default error message
                }
                reject(new Error(errorMessage));
                return;
              }

              const response = JSON.parse(data);
              resolve(response);
            } catch (e) {
              reject(new Error(`Failed to parse BitMEX response: ${e}`));
            }
          });
        });

        req.on('error', (error) => {
          reject(new ConnectionError(`BitMEX connection failed: ${error.message}`));
        });

        req.on('timeout', () => {
          req.destroy();
          reject(new ConnectionError('BitMEX request timeout'));
        });

        if (requestBody) {
          req.write(requestBody);
        }
        req.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Get account information and balance
   */
  async getBalance(): Promise<BitMEXBalance> {
    return this.request({ method: 'GET', path: '/user' });
  }

  /**
   * Get current positions
   */
  async getPositions(): Promise<BitMEXPosition[]> {
    return this.request({
      method: 'GET',
      path: '/position',
    });
  }

  /**
   * Get position for specific symbol
   */
  async getPosition(symbol: string): Promise<BitMEXPosition> {
    const positions = await this.getPositions();
    const position = positions.find((p) => p.symbol === symbol);
    if (!position) {
      throw new Error(`Position not found for symbol: ${symbol}`);
    }
    return position;
  }

  /**
   * List open orders
   */
  async getOrders(filter?: Record<string, any>): Promise<any[]> {
    return this.request({
      method: 'GET',
      path: '/order',
      data: filter,
    });
  }

  /**
   * Create new order
   */
  async createOrder(orderData: Record<string, any>): Promise<any> {
    return this.request({
      method: 'POST',
      path: '/order',
      data: orderData,
    });
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId: string): Promise<any> {
    return this.request({
      method: 'DELETE',
      path: '/order',
      data: { orderID: orderId },
    });
  }

  /**
   * Get wallet information
   */
  async getWallet(): Promise<any> {
    return this.request({
      method: 'GET',
      path: '/user/wallet',
    });
  }

  /**
   * Get deposit address
   */
  async getDepositAddress(currency: string): Promise<string> {
    const wallet = await this.getWallet();
    const address = wallet[currency]?.address;
    if (!address) {
      throw new Error(`Deposit address not found for currency: ${currency}`);
    }
    return address;
  }
}
