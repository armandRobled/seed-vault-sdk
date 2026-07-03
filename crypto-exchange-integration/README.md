# Crypto Exchange Integration Module

A comprehensive TypeScript/Node.js module for integrating multiple cryptocurrency exchange accounts and blockchain nodes into a unified application.

## Features

- 🔐 **Secure Authentication**: HMAC-SHA256 signing for BitMEX API
- 💰 **Multi-Exchange Support**: BitMEX, Dogecoin (extensible architecture)
- 📱 **Blockchain Integration**: Full Dogecoin Core JSON-RPC support
- 🌐 **Multi-Network**: Mainnet, testnet, and regtest support
- 📋 **Account Management**: Registry for managing multiple account credentials
- ⚙️ **Configuration**: Environment-based configuration management
- 🛡️ **Error Handling**: Comprehensive error types and handling
- 📝 **TypeScript**: Full type safety and IntelliSense support

## Installation

```bash
cd crypto-exchange-integration
npm install
npm run build
```

## Quick Start

### 1. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

### 2. Basic Usage

```typescript
import {
  AccountIntegrationManager,
  ConfigManager,
} from './dist';

// Initialize manager
const manager = new AccountIntegrationManager();

// Register BitMEX account
await manager.registerAccount({
  id: 'bitmex_main',
  type: 'exchange',
  platform: 'bitmex',
  credentials: {
    apiKey: process.env.BITMEX_API_KEY!,
    apiSecret: process.env.BITMEX_API_SECRET!,
  },
  enabled: true,
});

// Register Dogecoin mainnet
await manager.registerAccount({
  id: 'doge_mainnet',
  type: 'blockchain',
  platform: 'dogecoin',
  credentials: {
    rpcUrl: 'http://localhost:22555',
    rpcUser: process.env.DOGECOIN_RPC_USER,
    rpcPassword: process.env.DOGECOIN_RPC_PASSWORD,
  },
  network: 'mainnet',
  enabled: true,
});

// Use accounts
const accounts = await manager.getAccounts();
console.log('Registered accounts:', accounts);
```

## API Reference

### AccountIntegrationManager

Main orchestrator for multi-account management.

#### Methods

- `registerAccount(config: AccountConfig): Promise<StoredAccount>`
- `getAccounts(): Promise<StoredAccount[]>`
- `getAccount(accountId: string): Promise<StoredAccount>`
- `getAccountsByPlatform(platform: CryptoPlatform): Promise<StoredAccount[]>`
- `getAccountsByType(type: 'exchange' | 'blockchain'): Promise<StoredAccount[]>`
- `getEnabledAccounts(): Promise<StoredAccount[]>`
- `updateAccount(accountId: string, updates: Partial<AccountConfig>): Promise<StoredAccount>`
- `unregisterAccount(accountId: string): Promise<void>`
- `getBitMEXAuthenticator(accountId: string): BitMEXAuthenticator`
- `getDogecoinConnector(accountId: string): DogecoinConnector`
- `getConnector(accountId: string): Connector`
- `listAccounts(): Promise<(StoredAccount & { connected: boolean })[]>`
- `getAccountCount(): Promise<number>`

### BitMEXAuthenticator

Handles authentication and requests to BitMEX API.

#### Methods

- `getBalance(): Promise<BitMEXBalance>`
- `getPositions(): Promise<BitMEXPosition[]>`
- `getPosition(symbol: string): Promise<BitMEXPosition>`
- `getOrders(filter?: Record<string, any>): Promise<any[]>`
- `createOrder(orderData: Record<string, any>): Promise<any>`
- `cancelOrder(orderId: string): Promise<any>`
- `getWallet(): Promise<any>`
- `getDepositAddress(currency: string): Promise<string>`

### DogecoinConnector

Handles JSON-RPC communication with Dogecoin Core nodes.

#### Methods

**Wallet Operations**
- `getBalance(minConfirmations?: number): Promise<DogecoinBalance>`
- `getAddresses(): Promise<string[]>`
- `getNewAddress(): Promise<string>`
- `getAddressInfo(address: string): Promise<any>`
- `sendTransaction(toAddress: string, amount: number): Promise<string>`
- `sendFrom(fromAccount: string, toAddress: string, amount: number): Promise<string>`

**UTXO Management**
- `listUnspent(minConf?: number, maxConf?: number, addresses?: string[]): Promise<DogecoinUTXO[]>`
- `createRawTransaction(inputs: Array<{txid: string, vout: number}>, outputs: Record<string, number>): Promise<string>`
- `signRawTransaction(hexstring: string): Promise<{hex: string, complete: boolean}>`
- `sendRawTransaction(hexstring: string): Promise<string>`
- `decodeRawTransaction(hexstring: string): Promise<any>`

**Blockchain Query**
- `getBlockHash(height: number): Promise<string>`
- `getBlock(hashOrHeight: string | number, verbose?: boolean): Promise<DogecoinBlockInfo>`
- `getBlockCount(): Promise<number>`
- `getBlockchainInfo(): Promise<any>`
- `getRawTransaction(txid: string, verbose?: boolean): Promise<DogecoinTransaction>`
- `getTransaction(txid: string): Promise<DogecoinTransaction>`
- `listTransactions(account?: string, count?: number, skip?: number): Promise<DogecoinTransaction[]>`

**Network Info**
- `getNetworkInfo(): Promise<any>`
- `getPeerInfo(): Promise<any[]>`
- `validateAddress(address: string): Promise<any>`
- `isValidAddress(address: string): Promise<boolean>`
- `getMiningInfo(): Promise<any>`

### ConfigManager

Manages environment-based configuration.

#### Methods

- `loadBitMEXConfig(): AccountConfig`
- `loadDogecoinMainnetConfig(): AccountConfig`
- `loadDogecoinTestnetConfig(): AccountConfig`
- `loadDogecoinRegtestConfig(): AccountConfig`
- `loadAllDefaults(): AccountConfig[]`

## Examples

### Example 1: BitMEX Trading Account

```typescript
const bitmexAuth = manager.getBitMEXAuthenticator('bitmex_main');

// Get balance
const balance = await bitmexAuth.getBalance();
console.log('BitMEX Balance:', balance);

// Get positions
const positions = await bitmexAuth.getPositions();
console.log('Open positions:', positions);

// Create order
const order = await bitmexAuth.createOrder({
  symbol: 'XBTUSD',
  orderQty: 1,
  price: 50000,
});
console.log('Order created:', order);
```

### Example 2: Dogecoin Wallet Operations

```typescript
const dogeConnector = manager.getDogecoinConnector('doge_mainnet');

// Get wallet balance
const balance = await dogeConnector.getBalance();
console.log('Balance:', balance);

// Generate new address
const newAddress = await dogeConnector.getNewAddress();
console.log('New address:', newAddress);

// Send transaction
const txId = await dogeConnector.sendTransaction('DMvqv7B8vM3NJ5Qv...', 10);
console.log('Transaction sent:', txId);
```

### Example 3: Multi-Account Setup

```typescript
const manager = new AccountIntegrationManager();

// Load all configurations from environment
const configs = ConfigManager.loadAllDefaults();

// Register all accounts
for (const config of configs) {
  await manager.registerAccount(config);
}

// List all accounts
const allAccounts = await manager.listAccounts();
console.log('All accounts:', allAccounts);

// Get only enabled accounts
const enabled = await manager.getEnabledAccounts();
console.log('Enabled accounts:', enabled);

// Get accounts by type
const exchanges = await manager.getAccountsByType('exchange');
const blockchains = await manager.getAccountsByType('blockchain');
console.log('Exchange accounts:', exchanges);
console.log('Blockchain accounts:', blockchains);
```

### Example 4: Error Handling

```typescript
import { ValidationError, ConnectionError, RPCError } from './dist';

try {
  await manager.registerAccount(invalidConfig);
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Invalid configuration:', error.message);
  } else if (error instanceof ConnectionError) {
    console.error('Connection failed:', error.message);
  } else if (error instanceof RPCError) {
    console.error('RPC error:', error.message, error.rpcCode);
  }
}
```

## Setting Up Dogecoin Core Node

### Installation

Download from [Dogecoin Releases](https://github.com/dogecoin/dogecoin/releases):

```bash
# Extract and install
tar xzf dogecoin-*.tar.gz
sudo cp dogecoin-*/bin/* /usr/local/bin/
```

### Configuration

Create `~/.dogecoin/dogecoin.conf`:

```conf
# Mainnet (default)
server=1
rpcuser=dogecoin_user
rpcpassword=dogecoin_password
rpcport=22555

# Or for testnet
# testnet=1
# rpcport=44555

# Or for regtest
# regtest=1
# rpcport=18332
```

### Starting Nodes

```bash
# Mainnet
dogecoind -daemon

# Testnet
dogecoind -daemon -testnet

# Regtest (local testing)
dogecoind -daemon -regtest

# Stop daemon
dogecoin-cli stop
```

### Verification

```bash
# Check blockchain info
dogecoin-cli getblockchaininfo

# Get wallet balance
dogecoin-cli getbalance

# List addresses
dogecoin-cli getaddressesbyaccount ""
```

## Error Types

- `ValidationError`: Configuration validation failed
- `AuthenticationError`: API authentication failed
- `ConnectionError`: Network connection failed
- `RPCError`: JSON-RPC call failed
- `RateLimitError`: API rate limit exceeded
- `NotFoundError`: Account or resource not found

## Development

```bash
# Build
npm run build

# Watch mode
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Tests
npm run test
npm run test:watch
```

## Security Considerations

1. **Never commit `.env` file** - Use `.env.example` as template
2. **Secure credential storage** - Consider using a secrets management system
3. **Use testnet for development** - Test with play coins before mainnet
4. **Validate RPC endpoints** - Use HTTPS for remote nodes
5. **Rate limiting** - Implement request rate limiting for production
6. **Key rotation** - Regularly rotate API keys

## License

MIT

## References

- [BitMEX API Documentation](https://www.bitmex.com/api/explorer/)
- [BitMEX API Connectors](https://github.com/BitMEX/api-connectors)
- [Dogecoin GitHub](https://github.com/dogecoin/dogecoin)
- [Dogecoin JSON-RPC API](https://developer.bitcoin.org/reference/rpc/)
- [Solana Mobile Seed Vault SDK](https://github.com/solana-mobile/seed-vault-sdk)
