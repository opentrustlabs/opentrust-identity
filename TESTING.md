# Testing Guide for Open Certs OIDC

This guide provides comprehensive documentation on how to write and run tests for the Open Certs OIDC identity and access management platform.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Test Structure](#test-structure)
3. [Running Tests](#running-tests)
4. [Writing Tests](#writing-tests)
5. [Test Utilities](#test-utilities)
6. [Best Practices](#best-practices)
7. [Examples](#examples)

---

## Getting Started

### Prerequisites

The following testing dependencies are already installed:
- **Jest** (v30.2.0) - Test runner
- **@testing-library/react** (v16.3.0) - React component testing utilities
- **@testing-library/jest-dom** (v6.9.1) - Custom Jest matchers for DOM
- **jest-environment-jsdom** (v30.2.0) - Browser-like environment for tests

### Configuration Files

- **jest.config.ts** - Main Jest configuration
- **jest.setup.ts** - Global test setup and environment configuration
- **__mocks__/** - Mock implementations for static assets and modules

---

## Test Structure

Tests are organized in the `tests/` directory, mirroring the application structure:

```
tests/
├── utils/                          # Test utilities and helpers
│   ├── apollo-mock-utils.tsx       # GraphQL/Apollo mocking helpers
│   ├── dao-mock-utils.ts           # DAO mocking helpers
│   └── test-data-factory.ts        # Test data generation utilities
│
├── lib/                            # Service layer tests
│   └── service/
│       └── jwt-service-utils.test.ts
│
├── components/                     # Component tests
│   └── authentication-components/
│       ├── password-rules-display.test.tsx
│       └── login-form.test.tsx
│
├── graphql/                        # GraphQL resolver tests
│   └── resolvers/
│       └── user-resolvers.test.ts
│
└── integration/                    # Integration tests (to be created)
```

---

## Running Tests

### Available Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (automatically re-run on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests in CI mode (optimized for continuous integration)
npm run test:ci
```

### Running Specific Tests

```bash
# Run tests in a specific file
npm test -- jwt-service-utils.test.ts

# Run tests matching a pattern
npm test -- --testPathPattern=components

# Run only tests with a specific name
npm test -- --testNamePattern="should validate password"
```

### Coverage Reports

After running `npm run test:coverage`, view the coverage report:
- Console summary in terminal
- Detailed HTML report in `coverage/lcov-report/index.html`

---

## Writing Tests

### Test File Naming

- Unit tests: `*.test.ts` or `*.test.tsx`
- Component tests: `*.test.tsx`
- Integration tests: `*.integration.test.ts`

### Basic Test Structure

```typescript
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

describe('FeatureName', () => {
  beforeEach(() => {
    // Setup before each test
  });

  afterEach(() => {
    // Cleanup after each test
    jest.clearAllMocks();
  });

  describe('specific functionality', () => {
    it('should do something specific', () => {
      // Arrange
      const input = 'test';

      // Act
      const result = doSomething(input);

      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

---

## Test Utilities

### 1. Apollo Mock Utilities (`tests/utils/apollo-mock-utils.tsx`)

Helpers for mocking GraphQL operations:

```typescript
import { ApolloMockWrapper, createSuccessMock, createErrorMock } from '../utils/apollo-mock-utils';

// Create a successful GraphQL mock
const mock = createSuccessMock(GET_USER_QUERY, {
  getUser: { id: '123', email: 'test@example.com' }
});

// Wrap component with Apollo provider
<ApolloMockWrapper mocks={[mock]}>
  <YourComponent />
</ApolloMockWrapper>
```

### 2. DAO Mock Utilities (`tests/utils/dao-mock-utils.ts`)

Helpers for mocking Data Access Objects:

```typescript
import { createMockIdentityDao, createMockTenantDao } from '../utils/dao-mock-utils';

// Create mock DAOs
const mockIdentityDao = createMockIdentityDao();
const mockTenantDao = createMockTenantDao();

// Setup mock responses
mockIdentityDao.findById?.mockResolvedValue(mockUser);
mockTenantDao.findById?.mockResolvedValue(mockTenant);
```

### 3. Test Data Factory (`tests/utils/test-data-factory.ts`)

Helpers for creating test data:

```typescript
import {
  createMockUser,
  createMockTenant,
  createMockClient,
  createMockOIDCContext,
} from '../utils/test-data-factory';

// Create test data with default values
const user = createMockUser();

// Override specific properties
const customUser = createMockUser({
  email: 'custom@example.com',
  firstName: 'Custom',
});

// Create OIDC context for resolver tests
const context = createMockOIDCContext({
  portalUserProfile: user,
});
```

---

## Best Practices

### 1. Test Independence

Each test should be independent and not rely on other tests:

```typescript
describe('UserService', () => {
  let mockDao: ReturnType<typeof createMockIdentityDao>;

  beforeEach(() => {
    // Fresh mocks for each test
    mockDao = createMockIdentityDao();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
```

### 2. AAA Pattern (Arrange, Act, Assert)

Structure your tests clearly:

```typescript
it('should create a new user', async () => {
  // Arrange
  const userData = createMockUser({ email: 'new@example.com' });
  mockDao.create?.mockResolvedValue(userData);

  // Act
  const result = await userService.createUser(userData);

  // Assert
  expect(result).toEqual(userData);
  expect(mockDao.create).toHaveBeenCalledWith(userData);
});
```

### 3. Test One Thing at a Time

Each test should verify a single behavior:

```typescript
// Good - Tests one specific behavior
it('should reject password without uppercase letter', () => {
  const result = validatePassword('password123!');
  expect(result.errors).toContain('Password must contain at least one uppercase letter');
});

// Avoid - Tests multiple behaviors
it('should validate password', () => {
  // Testing multiple things makes it hard to identify failures
});
```

### 4. Descriptive Test Names

Use clear, descriptive test names:

```typescript
// Good
it('should return null when user does not exist', async () => {
  // ...
});

// Avoid
it('test user', async () => {
  // ...
});
```

### 5. Mock External Dependencies

Always mock external dependencies (databases, APIs, services):

```typescript
// Mock the DaoFactory
jest.mock('@/lib/data-sources/dao-factory', () => ({
  DaoFactory: {
    getInstance: jest.fn(() => ({
      getIdentityDao: jest.fn(),
      getTenantDao: jest.fn(),
    })),
  },
}));
```

### 6. Test Error Cases

Don't just test the happy path:

```typescript
describe('getUserById', () => {
  it('should return user when found', async () => {
    // Test success case
  });

  it('should return null when user not found', async () => {
    // Test not found case
  });

  it('should throw error when database fails', async () => {
    // Test error case
    mockDao.findById?.mockRejectedValue(new Error('DB error'));
    await expect(service.getUserById('123')).rejects.toThrow('DB error');
  });
});
```

### 7. Component Testing Best Practices

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

it('should handle user input', async () => {
  render(<LoginForm />);

  // Use userEvent for more realistic interactions
  const user = userEvent.setup();
  const emailInput = screen.getByLabelText('Email');

  await user.type(emailInput, 'test@example.com');

  expect(emailInput).toHaveValue('test@example.com');
});
```

---

## Examples

### Example 1: Testing a Utility Function

See: `tests/utils/password-utils.test.ts`

```typescript
describe('Password Utilities', () => {
  it('should accept a valid password', () => {
    const result = validatePassword('ValidPass123!', defaultRules);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
```

### Example 2: Testing a React Component

See: `tests/components/authentication-components/login-form.test.tsx`

```typescript
describe('LoginForm', () => {
  it('should update email input when user types', () => {
    render(<LoginForm />);
    const emailInput = screen.getByTestId('email-input') as HTMLInputElement;
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    expect(emailInput.value).toBe('test@example.com');
  });
});
```

### Example 3: Testing GraphQL Resolvers

See: `tests/graphql/resolvers/user-resolvers.test.ts`

```typescript
describe('User Resolvers', () => {
  it('should return user by ID', async () => {
    const mockUser = createMockUser({ id: 'user-123' });
    mockIdentityDao.findById?.mockResolvedValue(mockUser);

    const result = await resolvers.Query.getUserById(
      null,
      { id: 'user-123' },
      mockContext
    );

    expect(result).toEqual(mockUser);
  });
});
```

### Example 4: Testing Service Layer

See: `tests/lib/service/jwt-service-utils.test.ts`

```typescript
describe('JWT Service', () => {
  beforeEach(() => {
    mockIdentityDao = createMockIdentityDao();
    mockClientDao = createMockClientDao();
  });

  it('should create access token for user', async () => {
    const user = createMockUser();
    mockIdentityDao.findById?.mockResolvedValue(user);

    const token = await jwtService.createAccessToken(user.id);

    expect(token).toBeDefined();
  });
});
```

---

## Testing Patterns for IAM Features

### 1. Testing Authentication

```typescript
describe('Authentication', () => {
  it('should authenticate user with valid credentials', async () => {
    const user = createMockUser({ email: 'user@example.com' });
    const credentials = createMockUserCredential({ userId: user.id });

    mockIdentityDao.findByEmail?.mockResolvedValue(user);
    mockCredentialDao.findByUserId?.mockResolvedValue(credentials);
    mockCredentialDao.validatePassword?.mockResolvedValue(true);

    const result = await authService.authenticate('user@example.com', 'password');

    expect(result.success).toBe(true);
  });

  it('should reject invalid password', async () => {
    mockCredentialDao.validatePassword?.mockResolvedValue(false);

    const result = await authService.authenticate('user@example.com', 'wrong');

    expect(result.success).toBe(false);
  });
});
```

### 2. Testing Authorization

```typescript
describe('Authorization', () => {
  it('should enforce scope-based authorization', () => {
    const user = createMockUser();
    const requiredScope = 'admin:write';

    const hasAccess = authzUtils.hasScope(user, requiredScope);

    expect(hasAccess).toBe(false);
  });

  it('should enforce tenant isolation', () => {
    const userFromTenantA = createMockUser({ tenantId: 'tenant-a' });
    const resourceFromTenantB = { tenantId: 'tenant-b' };

    const hasAccess = authzUtils.canAccessResource(userFromTenantA, resourceFromTenantB);

    expect(hasAccess).toBe(false);
  });
});
```

### 3. Testing MFA

```typescript
describe('Multi-Factor Authentication', () => {
  it('should validate TOTP code', async () => {
    const mfaRel = createMockMFARel({ mfaType: 'TOTP' });
    mockMFADao.findByUserId?.mockResolvedValue([mfaRel]);

    const isValid = await mfaService.validateTOTP(userId, '123456');

    expect(isValid).toBe(true);
  });
});
```

### 4. Testing Password Policies

```typescript
describe('Password Policy', () => {
  it('should enforce tenant password policy', () => {
    const policy = createMockPasswordPolicy({ minLength: 12 });
    const password = 'Short1!';

    const result = validatePasswordAgainstPolicy(password, policy);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Password must be at least 12 characters long');
  });
});
```

---

## Debugging Tests

### Running Tests in Debug Mode

1. Add `debugger` statement in your test
2. Run tests with Node inspector:
   ```bash
   node --inspect-brk node_modules/.bin/jest --runInBand
   ```
3. Open `chrome://inspect` in Chrome
4. Click "inspect" on the Node process

### Viewing Test Output

```typescript
// Log values during tests
it('should do something', () => {
  const result = doSomething();
  console.log('Result:', result);
  expect(result).toBe(expected);
});
```

### Using `.only` and `.skip`

```typescript
// Run only this test
it.only('should run only this test', () => {
  // ...
});

// Skip this test
it.skip('should skip this test', () => {
  // ...
});
```

---

## Coverage Goals

Aim for the following coverage targets:

- **Service Layer**: 80%+ coverage
- **Utility Functions**: 90%+ coverage
- **GraphQL Resolvers**: 70%+ coverage
- **Components**: 60%+ coverage
- **Overall**: 70%+ coverage

View coverage report after running `npm run test:coverage`.

---

## Common Patterns

### Mocking Environment Variables

```typescript
const originalEnv = process.env;

beforeEach(() => {
  jest.resetModules();
  process.env = { ...originalEnv, AUTH_DOMAIN: 'test.example.com' };
});

afterEach(() => {
  process.env = originalEnv;
});
```

### Mocking Dates

```typescript
beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2024-01-01'));
});

afterAll(() => {
  jest.useRealTimers();
});
```

### Testing Async Code

```typescript
it('should handle async operations', async () => {
  const promise = asyncFunction();
  await expect(promise).resolves.toBe(expected);
});

it('should handle async errors', async () => {
  const promise = asyncFunction();
  await expect(promise).rejects.toThrow('Error message');
});
```

---

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

## Contributing

When adding new features:
1. Write tests first (TDD approach recommended)
2. Ensure all tests pass before submitting PR
3. Maintain or improve code coverage
4. Follow the testing patterns outlined in this guide

---

## Next Steps

1. **Expand Test Coverage**: Add tests for more services, components, and resolvers
2. **Integration Tests**: Create end-to-end integration tests
3. **Performance Tests**: Add performance benchmarks for critical paths
4. **E2E Tests**: Consider adding Playwright or Cypress for full end-to-end testing

For questions or issues with testing, please open an issue on the project repository.
