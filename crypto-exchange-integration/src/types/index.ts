/**
 * Type definitions for crypto exchange integration
 */

/**
 * Supported cryptocurrency platforms
 */
export type CryptoPlatform = 'bitmex' | 'dogecoin' | 'bitcoin';

/**
 * Account types: exchange trading or blockchain node/wallet
 */
export type AccountType = 'exchange' | 'blockchain';

/**
 * Blockchain networks
 */
export type BlockchainNetwork = 'mainnet' | 'testnet' | 'regtest';

/**
 * Credentials for different account types
 */
export interface AccountCredentials {
  // Exchange credentials
  apiKey?: string;
  apiSecret?: string;
  
  // Blockchain credentials
  rpcUrl?: string;
  rpcUser?: string;
  rpcPassword?: string;
  
  // Optional: wallet file path for offline signing
  walletPath?: string;
}

/**
 * Account configuration for registration
 */
export interface AccountConfig {
  id: string;
  type: AccountType;
  platform: CryptoPlatform;
  credentials: AccountCredentials;
  network?: BlockchainNetwork;
  enabled: boolean;
  metadata?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Account with stored metadata (from registry)
 */
export interface StoredAccount extends AccountConfig {
  createdAt: Date;
  updatedAt: Date;
}

/**
 * BitMEX API Response Types
 */
export interface BitMEXBalance {
  account: number;
  currency: string;
  prevDeposited: number;
  prevWithdrawn: number;
  prevTransferIn: number;
  prevTransferOut: number;
  prevAmount: number;
  prevTimestamp: string;
  deltaDeposited: number;
  deltaWithdrawn: number;
  deltaTransferIn: number;
  deltaTransferOut: number;
  deltaAmount: number;
  deposited: number;
  withdrawn: number;
  transferIn: number;
  transferOut: number;
  amount: number;
  pendingCredit: number;
  pendingDebit: number;
  confirmedDebit: number;
  timestamp: string;
  addr: string;
  script: string;
  withdrawalFlag: boolean;
}

export interface BitMEXPosition {
  account: number;
  symbol: string;
  currency: string;
  underlying: string;
  quoteCurrency: string;
  commission: number;
  initMarginReq: number;
  maintMarginReq: number;
  riskLimit: number;
  leverage: number;
  crossMargin: boolean;
  deleveragePercentile: number;
  rebalancedPnl: number;
  unrealisedPnl: number;
  unrealisedRoePcnt: number;
  unrealisedRoe: number;
  simpleQty?: number;
  simpleCost?: number;
  simpleValue?: number;
  simplePnl?: number;
  simplePnlPcnt?: number;
  avgCostPrice?: number;
  avgEntryPrice?: number;
  breakEvenPrice?: number;
  marginCallPrice?: number;
  liquidationPrice?: number;
  bankruptPrice?: number;
  timestamp: string;
  lastPrice?: number;
  lastValue?: number;
}

/**
 * Dogecoin RPC Response Types
 */
export interface DogecoinBalance {
  balance: number;
  confirmed: number;
  unconfirmed: number;
}

export interface DogecoinUTXO {
  txid: string;
  vout: number;
  address: string;
  account: string;
  scriptPubKey: string;
  amount: number;
  confirmations: number;
  spendable: boolean;
  solvable: boolean;
}

export interface DogecoinTransaction {
  amount: number;
  confirmations: number;
  blockhash?: string;
  blockheight?: number;
  blockindex?: number;
  blocktime?: number;
  txid: string;
  time: number;
  timereceived: number;
  bip125: boolean;
  comment?: string;
  to?: string;
}

export interface DogecoinBlockInfo {
  hash: string;
  confirmations: number;
  size: number;
  height: number;
  version: number;
  merkleroot: string;
  tx: string[];
  time: number;
  mediantime: number;
  nonce: number;
  bits: string;
  difficulty: number;
  chainwork: string;
  previousblockhash?: string;
  nextblockhash?: string;
}

/**
 * Error response structure
 */
export interface ErrorResponse {
  code: string;
  message: string;
  details?: any;
}
