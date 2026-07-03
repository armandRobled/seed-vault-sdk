/**
 * Custom error classes for integration operations
 */

export class IntegrationError extends Error {
  constructor(message: string, public code: string, public details?: any) {
    super(message);
    this.name = 'IntegrationError';
    Object.setPrototypeOf(this, IntegrationError.prototype);
  }
}

export class ValidationError extends IntegrationError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class AuthenticationError extends IntegrationError {
  constructor(message: string, details?: any) {
    super(message, 'AUTHENTICATION_ERROR', details);
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

export class ConnectionError extends IntegrationError {
  constructor(message: string, details?: any) {
    super(message, 'CONNECTION_ERROR', details);
    this.name = 'ConnectionError';
    Object.setPrototypeOf(this, ConnectionError.prototype);
  }
}

export class RPCError extends IntegrationError {
  constructor(message: string, public rpcCode?: number, details?: any) {
    super(message, 'RPC_ERROR', { ...details, rpcCode });
    this.name = 'RPCError';
    Object.setPrototypeOf(this, RPCError.prototype);
  }
}

export class NotFoundError extends IntegrationError {
  constructor(message: string, details?: any) {
    super(message, 'NOT_FOUND', details);
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class RateLimitError extends IntegrationError {
  constructor(message: string, public retryAfter?: number, details?: any) {
    super(message, 'RATE_LIMIT', { ...details, retryAfter });
    this.name = 'RateLimitError';
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}
