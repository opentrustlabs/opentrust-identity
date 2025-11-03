# Test Setup Summary

## What Has Been Created

A comprehensive testing infrastructure has been set up for your Open Certs OIDC application.

### Configuration Files

1. **jest.config.ts** - Jest configuration with:
   - Next.js integration
   - TypeScript support
   - JSDOM test environment
   - Module path mapping (@/*)
   - Coverage configuration
   - Static asset mocking

2. **jest.setup.ts** - Global test setup with:
   - @testing-library/jest-dom matchers
   - Window mocks (matchMedia, IntersectionObserver, ResizeObserver)
   - Fetch mock
   - Automatic mock cleanup

3. **package.json** - Added test scripts:
   - `npm test` - Run tests
   - `npm run test:watch` - Watch mode
   - `npm run test:coverage` - Generate coverage
   - `npm run test:ci` - CI/CD optimized tests

### Test Utilities (`tests/utils/`)

1. **apollo-mock-utils.tsx** - GraphQL/Apollo testing helpers:
   - `ApolloMockWrapper` - Component wrapper with Apollo provider
   - `createSuccessMock()` - Mock successful GraphQL responses
   - `createErrorMock()` - Mock error responses
   - `createGraphQLErrorMock()` - Mock GraphQL errors
   - `waitForApollo()` - Wait for async operations

2. **dao-mock-utils.ts** - DAO mocking helpers:
   - Mock factory functions for all DAOs:
     - `createMockIdentityDao()`
     - `createMockTenantDao()`
     - `createMockClientDao()`
     - `createMockScopeDao()`
     - `createMockAuthenticationGroupDao()`
     - `createMockAuthorizationGroupDao()`
     - `createMockAuthDao()`
     - `createMockUserCredentialDao()`
     - `createMockUserMFARelDao()`
   - `createMockDaoFactory()` - Complete DAO factory
   - `resetDaoMocks()` - Reset all mocks

3. **test-data-factory.ts** - Test data generators:
   - User/Identity objects
   - Tenant objects
   - Client objects
   - Scope objects
   - Authentication/Authorization groups
   - MFA relationships
   - JWT payloads
   - Auth tokens (access, refresh, authorization codes)
   - OIDC context
   - Password policies
   - Login failure policies

### Sample Tests

1. **tests/lib/service/jwt-service-utils.test.ts**
   - Service layer testing example
   - DAO mocking patterns
   - Async operation testing

2. **tests/utils/password-utils.test.ts**
   - Utility function testing
   - Complete, runnable test suite
   - Password validation examples

3. **tests/components/authentication-components/password-rules-display.test.tsx**
   - Component rendering tests
   - Props handling
   - Conditional rendering
   - Accessibility testing

4. **tests/components/authentication-components/login-form.test.tsx**
   - User interaction testing
   - Form submission
   - Error handling
   - Loading states
   - Accessibility

5. **tests/graphql/resolvers/user-resolvers.test.ts**
   - GraphQL resolver testing
   - Context mocking
   - Authorization testing
   - Field resolver patterns

### Documentation

1. **TESTING.md** - Comprehensive testing guide with:
   - Getting started guide
   - Test structure overview
   - Running tests
   - Writing tests
   - Best practices
   - Examples for all test types
   - IAM-specific testing patterns
   - Debugging tips
   - Coverage goals

2. **tests/README.md** - Quick reference for:
   - Directory structure
   - Test utilities
   - Writing new tests
   - Examples

### CI/CD Integration

1. **.github/workflows/test.yml** - GitHub Actions workflow:
   - Runs on push and PR
   - Executes linter
   - Runs test suite
   - Generates coverage
   - Uploads to Codecov
   - Comments on PRs with coverage

### Static Asset Mocks (`__mocks__/`)

1. **styleMock.js** - Mock CSS imports
2. **fileMock.js** - Mock image/file imports

---

## Current Test Structure

```
tests/
├── README.md
├── utils/
│   ├── apollo-mock-utils.tsx
│   ├── dao-mock-utils.ts
│   ├── test-data-factory.ts
│   └── password-utils.test.ts
├── lib/
│   └── service/
│       └── jwt-service-utils.test.ts
├── components/
│   └── authentication-components/
│       ├── password-rules-display.test.tsx
│       └── login-form.test.tsx
└── graphql/
    └── resolvers/
        └── user-resolvers.test.ts
```

---

## How to Run Tests

```bash
# Install dependencies (if not already done)
npm install

# Run all tests
npm test

# Run tests in watch mode (auto re-run on changes)
npm run test:watch

# Run with coverage report
npm run test:coverage

# Run specific test file
npm test -- jwt-service-utils.test.ts

# Run tests matching a pattern
npm test -- --testPathPattern=components

# Run only tests with specific name
npm test -- --testNamePattern="should validate"
```

---

## Optional: Additional Package

For more realistic user interactions in component tests, consider installing:

```bash
npm install --save-dev @testing-library/user-event
```

This package provides better simulation of user events like typing, clicking, etc.

### Usage Example:

```typescript
import userEvent from '@testing-library/user-event';

it('should handle typing', async () => {
  const user = userEvent.setup();
  render(<LoginForm />);

  await user.type(screen.getByLabelText('Email'), 'test@example.com');
  await user.click(screen.getByRole('button', { name: /log in/i }));
});
```

---

## Next Steps

### 1. Write Tests for Existing Code

Start with the most critical components:

**High Priority:**
- `lib/service/authenticate-user-service.ts`
- `lib/service/register-user-service.ts`
- `lib/service/identity-service.ts`
- `lib/service/tenant-service.ts`
- `utils/authz-utils.ts`

**Medium Priority:**
- Component tests for authentication flows
- GraphQL resolver tests
- DAO implementation tests

### 2. Set Coverage Goals

Add to your workflow:
- Minimum 70% overall coverage
- 80%+ for service layer
- 90%+ for utilities
- Track coverage trends over time

### 3. Integrate with CI/CD

The GitHub Actions workflow has been created. To activate:
1. Push to your repository
2. Enable GitHub Actions if not already enabled
3. Tests will run automatically on push/PR

### 4. Consider Additional Testing Tools

- **Playwright** or **Cypress** - End-to-end testing
- **MSW (Mock Service Worker)** - API mocking
- **Storybook** - Component development and visual testing
- **React Testing Library + Testing Playground** - Better query selection

---

## Test Writing Patterns

### Service Layer Test Pattern

```typescript
describe('ServiceName', () => {
  let mockDao: ReturnType<typeof createMockDao>;

  beforeEach(() => {
    mockDao = createMockDao();
  });

  it('should perform operation', async () => {
    // Arrange
    const testData = createMockData();
    mockDao.method?.mockResolvedValue(testData);

    // Act
    const result = await service.operation();

    // Assert
    expect(result).toEqual(testData);
    expect(mockDao.method).toHaveBeenCalled();
  });
});
```

### Component Test Pattern

```typescript
describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<ComponentName />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    render(<ComponentName />);
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByText('Updated Text')).toBeInTheDocument();
    });
  });
});
```

### GraphQL Resolver Test Pattern

```typescript
describe('Resolver', () => {
  let mockContext: ReturnType<typeof createMockOIDCContext>;

  beforeEach(() => {
    mockContext = createMockOIDCContext();
  });

  it('should resolve query', async () => {
    const result = await resolver.Query.field(null, args, mockContext);
    expect(result).toBeDefined();
  });
});
```

---

## Coverage Report Location

After running `npm run test:coverage`, view:
- **Console**: Summary in terminal
- **HTML Report**: `coverage/lcov-report/index.html`
- **LCOV File**: `coverage/lcov.info` (for CI tools)

---

## Troubleshooting

### Tests not running?
```bash
# Clear Jest cache
npm test -- --clearCache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Import errors?
- Check path aliases in `jest.config.ts`
- Verify `tsconfig.json` paths match Jest config

### Mock not working?
- Use `jest.clearAllMocks()` in `afterEach()`
- Ensure mocks are defined before imports
- Check mock implementation matches interface

---

## Resources

- [TESTING.md](./TESTING.md) - Comprehensive testing guide
- [tests/README.md](./tests/README.md) - Quick reference
- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

## Summary

You now have a complete testing infrastructure ready for your IAM application:

✅ Jest configured for Next.js + TypeScript
✅ Test utilities for GraphQL, DAOs, and test data
✅ Sample tests demonstrating all patterns
✅ Comprehensive documentation
✅ CI/CD integration ready
✅ npm scripts for running tests

**You're ready to start writing tests!** 🎉

Begin with the most critical services and gradually expand coverage across your application.
