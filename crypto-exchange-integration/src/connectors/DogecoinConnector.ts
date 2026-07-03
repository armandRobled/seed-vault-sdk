/**
 * Dogecoin RPC Connector
 * 
 * Implements JSON-RPC communication with Dogecoin Core nodes.
 * Supports mainnet, testnet, and regtest networks.
 * Reference: https://github.com/dogecoin/dogecoin
 */

import http from 'http';
import https from 'https';
import { URL } from 'url';
import { ConnectionError, RPCError } from '../errors/IntegrationErrors';
import {
  DogecoinBalance,
  DogecoinUTXO,
  DogecoinTransaction,
  DogecoinBlockInfo,
  BlockchainNetwork,
} from '../types';

interface DogecoinConfig {
  rpcUrl: string;
  rpcUser?: string;
  rpcPassword?: string;
  network?: BlockchainNetwork;
  timeout?: number;
}

interface JSONRPCRequest {
  jsonrpc: '2.0';
  method: string;
  params: any[];
  id: number;
}

interface JSONRPCResponse<T> {
  jsonrpc: '2.0';
  result?: T;
  error?: {
    code: number;
    message: string;
  };
  id: number;
}

/**
 * Dogecoin RPC Connector
 * 
 * Communicates with Dogecoin Core JSON-RPC interface.
 * Handles wallet operations, transactions, and blockchain queries.
 */
export class DogecoinConnector {
  private rpcUrl: string;
  private rpcUser: string;
  private rpcPassword: string;
  private network: BlockchainNetwork;
  private requestId: number = 0;
  private timeout: number;
  private protocol: typeof http | typeof https;

  constructor(config: DogecoinConfig) {
    this.rpcUrl = config.rpcUrl;
    this.rpcUser = config.rpcUser || '';
    this.rpcPassword = config.rpcPassword || '';
    this.network = config.network || 'mainnet';
    this.timeout = config.timeout || 30000;

    // Determine protocol based on URL
    this.protocol = this.rpcUrl.startsWith('https') ? https : http;

    // Validate RPC URL format
    try {
      new URL(this.rpcUrl);
    } catch (e) {
      throw new Error(`Invalid RPC URL: ${this.rpcUrl}`);
    }
  }

  /**
   * Execute JSON-RPC command against Dogecoin Core
   */
  private async rpcCall<T = any>(method: string, params: any[] = []): Promise<T> {
    return new Promise((resolve, reject) => {
      try {
        const auth = Buffer.from(`${this.rpcUser}:${this.rpcPassword}`).toString('base64');
        const url = new URL(this.rpcUrl);

        const postData = JSON.stringify({
          jsonrpc: '2.0',
          method,
          params,
          id: this.requestId++,
        } as JSONRPCRequest);

        const options = {
          hostname: url.hostname,
          port: url.port || (url.protocol === 'https:' ? 443 : 80),
          path: url.pathname || '/',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData),
            'Authorization': `Basic ${auth}`,
          },
          timeout: this.timeout,
        };

        const req = this.protocol.request(options, (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            try {
              const response: JSONRPCResponse<T> = JSON.parse(data);

              if (response.error) {
                reject(
                  new RPCError(
                    `Dogecoin RPC error: ${response.error.message}`,
                    response.error.code
                  )
                );
              } else if (response.result !== undefined) {
                resolve(response.result);
              } else {
                reject(new RPCError('Invalid JSON-RPC response'));
              }
            } catch (e) {
              reject(new Error(`Failed to parse Dogecoin RPC response: ${e}`));
            }
          });
        });

        req.on('error', (error) => {
          reject(
            new ConnectionError(`Dogecoin connection failed: ${error.message}`)
          );
        });

        req.on('timeout', () => {
          req.destroy();
          reject(new ConnectionError('Dogecoin RPC request timeout'));
        });

        req.write(postData);
        req.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Get wallet balance
   * 
   * @param minConfirmations Minimum number of confirmations
   * @returns Balance object with confirmed and unconfirmed amounts
   */
  async getBalance(minConfirmations: number = 1): Promise<DogecoinBalance> {
    const balance = await this.rpcCall<number>('getbalance', ['*', minConfirmations]);
    const unconfirmed = await this.rpcCall<number>('getunconfirmedbalance', []);
    const confirmed = balance - unconfirmed;

    return {
      balance,
      confirmed,
      unconfirmed,
    };
  }

  /**
   * Get list of wallet addresses
   */
  async getAddresses(): Promise<string[]> {
    return this.rpcCall<string[]>('getaddressesbyaccount', ['']);
  }

  /**
   * Generate and return a new wallet address
   */
  async getNewAddress(): Promise<string> {
    return this.rpcCall<string>('getnewaddress', []);
  }

  /**
   * Get address info and balance
   */
  async getAddressInfo(address: string): Promise<any> {
    return this.rpcCall('getaddressinfo', [address]);
  }

  /**
   * Send transaction to recipient
   * 
   * @param toAddress Recipient address
   * @param amount Amount to send
   * @returns Transaction ID
   */
  async sendTransaction(toAddress: string, amount: number): Promise<string> {
    return this.rpcCall<string>('sendtoaddress', [toAddress, amount]);
  }

  /**
   * Send from specific account
   */
  async sendFrom(fromAccount: string, toAddress: string, amount: number): Promise<string> {
    return this.rpcCall<string>('sendfrom', [fromAccount, toAddress, amount]);
  }

  /**
   * List unspent transaction outputs (UTXOs)
   */
  async listUnspent(
    minConf: number = 1,
    maxConf: number = 9999999,
    addresses?: string[]
  ): Promise<DogecoinUTXO[]> {
    const params = addresses ? [minConf, maxConf, addresses] : [minConf, maxConf];
    return this.rpcCall<DogecoinUTXO[]>('listunspent', params);
  }

  /**
   * Create raw transaction from UTXOs
   */
  async createRawTransaction(
    inputs: Array<{ txid: string; vout: number }>,
    outputs: Record<string, number>
  ): Promise<string> {
    return this.rpcCall<string>('createrawtransaction', [inputs, outputs]);
  }

  /**
   * Sign raw transaction with wallet keys
   */
  async signRawTransaction(hexstring: string): Promise<{ hex: string; complete: boolean }> {
    return this.rpcCall('signrawtransaction', [hexstring]);
  }

  /**
   * Broadcast raw transaction to network
   */
  async sendRawTransaction(hexstring: string): Promise<string> {
    return this.rpcCall<string>('sendrawtransaction', [hexstring]);
  }

  /**
   * Decode raw transaction
   */
  async decodeRawTransaction(hexstring: string): Promise<any> {
    return this.rpcCall('decoderawtransaction', [hexstring]);
  }

  /**
   * Get block hash at given height
   */
  async getBlockHash(height: number): Promise<string> {
    return this.rpcCall<string>('getblockhash', [height]);
  }

  /**
   * Get block information
   */
  async getBlock(hashOrHeight: string | number, verbose: boolean = true): Promise<DogecoinBlockInfo> {
    if (typeof hashOrHeight === 'number') {
      const hash = await this.getBlockHash(hashOrHeight);
      return this.rpcCall<DogecoinBlockInfo>('getblock', [hash, verbose]);
    }
    return this.rpcCall<DogecoinBlockInfo>('getblock', [hashOrHeight, verbose]);
  }

  /**
   * Get current block count
   */
  async getBlockCount(): Promise<number> {
    return this.rpcCall<number>('getblockcount', []);
  }

  /**
   * Get blockchain information
   */
  async getBlockchainInfo(): Promise<any> {
    return this.rpcCall('getblockchaininfo', []);
  }

  /**
   * Get raw transaction
   */
  async getRawTransaction(txid: string, verbose: boolean = true): Promise<DogecoinTransaction> {
    return this.rpcCall<DogecoinTransaction>('getrawtransaction', [txid, verbose ? 1 : 0]);
  }

  /**
   * Get transaction details
   */
  async getTransaction(txid: string): Promise<DogecoinTransaction> {
    return this.rpcCall<DogecoinTransaction>('gettransaction', [txid]);
  }

  /**
   * List transactions
   */
  async listTransactions(
    account: string = '*',
    count: number = 10,
    skip: number = 0
  ): Promise<DogecoinTransaction[]> {
    return this.rpcCall<DogecoinTransaction[]>('listtransactions', [
      account,
      count,
      skip,
    ]);
  }

  /**
   * Get network information
   */
  async getNetworkInfo(): Promise<any> {
    return this.rpcCall('getnetworkinfo', []);
  }

  /**
   * Get peer information
   */
  async getPeerInfo(): Promise<any[]> {
    return this.rpcCall('getpeerinfo', []);
  }

  /**
   * Validate address
   */
  async validateAddress(address: string): Promise<any> {
    return this.rpcCall('validateaddress', [address]);
  }

  /**
   * Get mining information
   */
  async getMiningInfo(): Promise<any> {
    return this.rpcCall('getmininginfo', []);
  }

  /**
   * Check if address is valid
   */
  async isValidAddress(address: string): Promise<boolean> {
    const info = await this.validateAddress(address);
    return info.isvalid === true;
  }
}
