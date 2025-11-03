# Test Suite

This directory contains all tests for the Open Certs OIDC application.

## Quick Start

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Directory Structure

```
tests/
├── README.md                       # This file
├── utils/                          # Test utilities and helpers
│   ├── apollo-mock-utils.tsx       # Apollo/GraphQL mocking
│   ├── dao-mock-utils.ts           # DAO mocking helpers
│   └── test-data-factory.ts        # Test data generators
│
├── lib/                            # Service layer tests
│   └── service/                    # Service tests
│       └── jwt-service-utils.test.ts
│
├── components/                     # React component tests
│   └── authentication-components/
│       ├── password-rules-display.test.tsx
│       └── login-form.test.tsx
│
└── graphql/                        # GraphQL tests
    └── resolvers/                  # Resolver tests
        └── user-resolvers.test.ts
```

## Test Utilities

### Apollo Mock Utils
- `ApolloMockWrapper` - Wraps components with Apollo MockedProvider
- `createSuccessMock()` - Creates successful GraphQL mock
- `createErrorMock()` - Creates error GraphQL mock
- `createGraphQLErrorMock()` - Creates GraphQL error response

### DAO Mock Utils
Factory functions for creating mock DAOs:
- `createMockIdentityDao()`
- `createMockTenantDao()`
- `createMockClientDao()`
- `createMockScopeDao()`
- `createMockAuthenticationGroupDao()`
- `createMockAuthorizationGroupDao()`
- And more...

### Test Data Factory
Functions for generating test data:
- `createMockUser()` - User/Identity objects
- `createMockTenant()` - Tenant objects
- `createMockClient()` - OAuth2 client objects
- `createMockScope()` - Scope objects
- `createMockOIDCContext()` - GraphQL context
- `createMockJWTPayload()` - JWT token payloads
- And more...

## Writing New Tests

### 1. Choose the Right Location

- **Service tests**: `tests/lib/service/`
- **Component tests**: `tests/components/`
- **Resolver tests**: `tests/graphql/resolvers/`
- **Utility tests**: `tests/utils/`

### 2. Use Test Utilities

Import and use the provided test utilities:

```typescript
import { createMockUser, createMockTenant } from '../../utils/test-data-factory';
import { createMockIdentityDao } from '../../utils/dao-mock-utils';

const user = createMockUser({ email: 'test@example.com' });
const mockDao = createMockIdentityDao();
mockDao.findById?.mockResolvedValue(user);
```

### 3. Follow Testing Patterns

See `TESTING.md` in the project root for comprehensive testing guidelines.

## Coverage Reports

After running `npm run test:coverage`, check:
- Console output for summary
- `coverage/lcov-report/index.html` for detailed report

## Tips

1. **Test Independence**: Each test should be independent
2. **Clear Names**: Use descriptive test names
3. **AAA Pattern**: Arrange, Act, Assert
4. **Mock External Deps**: Always mock DAOs, APIs, etc.
5. **Test Error Cases**: Don't just test happy paths

## Examples

### Service Test Example

```typescript
describe('UserService', () => {
  let mockDao: ReturnType<typeof createMockIdentityDao>;

  beforeEach(() => {
    mockDao = createMockIdentityDao();
  });

  it('should find user by ID', async () => {
    const user = createMockUser({ id: '123' });
    mockDao.findById?.mockResolvedValue(user);

    const result = await userService.findById('123');

    expect(result).toEqual(user);
  });
});
```

### Component Test Example

```typescript
import { render, screen } from '@testing-library/react';

describe('LoginForm', () => {
  it('should render login form', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });
});
```

### Resolver Test Example

```typescript
describe('User Resolvers', () => {
  it('should return user by ID', async () => {
    const mockUser = createMockUser();
    const mockContext = createMockOIDCContext();
    mockDao.findById?.mockResolvedValue(mockUser);

    const result = await resolvers.Query.getUserById(
      null,
      { id: mockUser.id },
      mockContext
    );

    expect(result).toEqual(mockUser);
  });
});
```

## Need Help?

- Read `TESTING.md` for comprehensive guide
- Check existing test files for patterns
- Consult [Jest docs](https://jestjs.io/)
- Ask the team!
