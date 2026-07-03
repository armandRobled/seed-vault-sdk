# Contributing Guide

## Welcome to Crypto Exchange Integration! 👋

Thank you for your interest in contributing. This guide will help you get started.

## Code of Conduct

- Be respectful and inclusive
- Collaborate constructively
- Report security issues privately
- Respect intellectual property

## Getting Started

### Prerequisites
- Node.js 18+ 
- TypeScript
- Git

### Setup Development Environment

```bash
# Clone repository
git clone https://github.com/armandRobled/seed-vault-sdk.git
cd seed-vault-sdk/crypto-exchange-integration

# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm run test
```

## Development Workflow

### 1. Create Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes
- Write clear, well-documented code
- Add TypeScript types
- Include JSDoc comments
- Follow existing patterns

### 3. Write Tests
```bash
# Add tests in tests/unit/
npm run test
npm run test:watch
```

### 4. Check Code Quality
```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Full build
npm run build
```

### 5. Commit Changes
```bash
# Follow conventional commits
git commit -m "feat: Add new feature"
git commit -m "fix: Resolve issue"
git commit -m "docs: Update documentation"
```

### 6. Push and Create PR
```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Commit Message Convention

Use conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Code style
- `refactor:` Code refactoring
- `test:` Tests
- `chore:` Build/dependency updates

Example:
```
feat(bitmex): Add order cancellation retry logic

Implements exponential backoff for failed order cancellations.
Fixes issue #123.
```

## Pull Request Process

1. **Update** branch with main: `git pull origin main`
2. **Pass all checks**: Build, tests, lint, type-check
3. **Add description**: Explain what and why
4. **Link issues**: Reference related issues
5. **Request review**: Get feedback from maintainers
6. **Resolve feedback**: Address comments
7. **Merge**: Squash and merge when approved

## Testing Requirements

- ✅ All tests passing
- ✅ New code has tests
- ✅ Coverage maintained (70%+)
- ✅ No console.log statements
- ✅ Error handling included

## Documentation Requirements

- ✅ JSDoc comments on all exports
- ✅ Usage examples in README
- ✅ Type definitions complete
- ✅ Error cases documented

## Code Style Guide

### TypeScript
```typescript
// ✅ Good
interface UserConfig {
  username: string;
  password: string;
}

export class AuthService {
  /**
   * Authenticate user with credentials
   * @param config - User configuration
   * @returns Authentication token
   * @throws AuthenticationError if credentials invalid
   */
  async authenticate(config: UserConfig): Promise<string> {
    // Implementation
  }
}

// ❌ Avoid
class authService {
  auth(cfg: any) {
    // No types, no docs
  }
}
```

### Error Handling
```typescript
// ✅ Good
try {
  const result = await apiCall();
} catch (error) {
  if (error instanceof ValidationError) {
    logger.error('Validation failed', { error });
  } else {
    throw new IntegrationError('API call failed', 'API_ERROR', { error });
  }
}

// ❌ Avoid
try {
  const result = await apiCall();
} catch (error) {
  console.log(error); // No error handling
}
```

## File Structure

```
src/
├── authenticators/      # Exchange authenticators
├── connectors/         # Blockchain connectors
├── advanced/          # Advanced features
├── registry/          # Account registry
├── manager/           # Main manager class
├── config/            # Configuration
├── errors/            # Error definitions
├── types/             # Type definitions
└── index.ts           # Main export
```

## Adding New Exchange

1. **Create authenticator** in `src/authenticators/ExchangeAuthenticator.ts`
2. **Add types** to `src/types/index.ts`
3. **Update manager** to support new platform
4. **Add configuration** to `ConfigManager`
5. **Write tests** in `tests/unit/`
6. **Create example** in `examples/`
7. **Document** in README

## Security Considerations

- Never commit credentials
- Use environment variables
- Validate all inputs
- Handle errors securely
- Review dependencies
- Implement rate limiting
- Add authentication checks

## Performance Guidelines

- Cache frequently accessed data
- Implement connection pooling
- Use async/await properly
- Minimize API calls
- Add request timeouts
- Monitor memory usage

## Reporting Issues

### Bug Reports
Include:
- Environment (OS, Node version)
- Steps to reproduce
- Expected vs actual behavior
- Error messages and logs

### Feature Requests
Include:
- Use case description
- Expected behavior
- Benefits of feature
- Possible implementation

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Jest Testing](https://jestjs.io/docs/getting-started)
- [BitMEX API](https://www.bitmex.com/api/explorer/)
- [Dogecoin JSON-RPC](https://developer.bitcoin.org/reference/rpc/)

## Questions?

- Check existing issues/discussions
- Read documentation
- Ask in GitHub Discussions
- Email maintainers

## License

By contributing, you agree your code is licensed under MIT License.

Thank you for contributing! 🙏
