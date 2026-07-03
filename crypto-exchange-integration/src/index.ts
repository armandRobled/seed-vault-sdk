/**
 * Crypto Exchange Integration Module
 * 
 * Main entry point for multi-exchange cryptocurrency account integration.
 * Provides unified interface for managing multiple exchange and blockchain accounts.
 */

export * from './types';
export * from './authenticators/BitMEXAuthenticator';
export * from './connectors/DogecoinConnector';
export * from './registry/AccountRegistry';
export * from './manager/AccountIntegrationManager';
export * from './config/ConfigManager';
export * from './errors/IntegrationErrors';
