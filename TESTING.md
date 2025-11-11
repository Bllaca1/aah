# Testing Documentation

This document outlines the comprehensive testing strategy implemented for the BetDuel platform.

## Overview

The project implements a multi-layered testing approach:

- **Backend Unit Tests**: Test individual services, utilities, and middleware
- **Backend Integration Tests**: Test API endpoints and complete flows
- **Frontend Unit Tests**: Test React components, hooks, and utilities
- **Frontend Integration Tests**: Test page flows and user interactions
- **E2E Tests**: Test complete user journeys across the entire application

## Coverage Target

**Target: 80% code coverage across all layers**

## Test Infrastructure

### Backend Testing
- **Framework**: Jest
- **HTTP Testing**: Supertest
- **Database**: PostgreSQL test database
- **Configuration**: `backend/jest.config.js`

### Frontend Testing
- **Framework**: Vitest
- **Component Testing**: React Testing Library
- **DOM Environment**: jsdom
- **Configuration**: `vitest.config.ts`

### E2E Testing
- **Framework**: Playwright
- **Browsers**: Chromium, Firefox, WebKit
- **Configuration**: `playwright.config.ts`

## Running Tests

### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run tests with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Frontend Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch

# UI mode
npm run test:ui
```

### E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Run in headed mode (visible browser)
npm run test:e2e:headed
```

## Test Structure

### Backend Tests

```
backend/tests/
├── unit/
│   ├── services/
│   │   ├── elo.test.ts           # ELO rating calculations
│   │   ├── auth.test.ts          # Authentication & JWT
│   │   └── matchStateMachine.test.ts  # Match state transitions
│   └── middleware/
│       └── auth.test.ts          # Auth middleware
├── integration/
│   ├── auth.test.ts              # Auth API endpoints
│   ├── matches.test.ts           # Match API endpoints
│   ├── teams.test.ts             # Team API endpoints
│   └── disputes.test.ts          # Dispute API endpoints
└── fixtures/
    ├── testDb.ts                 # Test database utilities
    └── factories.ts              # Test data factories
```

### Frontend Tests

```
src/__tests__/
├── components/
│   ├── Button.test.tsx
│   ├── Modal.test.tsx
│   ├── MatchCard.test.tsx
│   └── ...
├── hooks/
│   ├── useAppContext.test.tsx
│   └── ...
└── pages/
    ├── LoginPage.test.tsx
    └── ...
```

### E2E Tests

```
e2e/tests/
├── auth.spec.ts                  # Registration, login, logout
├── match-flow.spec.ts            # Create, join, report matches
├── team-flow.spec.ts             # Create teams, invite members
└── dispute-flow.spec.ts          # File and resolve disputes
```

## Test Coverage

### Backend Test Coverage

#### Unit Tests

**Services** (Critical Business Logic):
- ✅ **ELO Service**: 100% coverage
  - Expected score calculation
  - New ELO calculation with K-factor
  - Team average ELO
  - Player/Team ELO updates
  - Leaderboards

- ✅ **Auth Service**: 100% coverage
  - Password hashing (Argon2)
  - Password verification
  - JWT token generation
  - Token verification & expiry
  - Random token generation
  - Token expiry calculation
  - Password validation
  - Security timing tests

- ✅ **Match State Machine**: 100% coverage
  - State transition validation
  - Valid/invalid transitions
  - State rules (canJoin, canReady, etc.)
  - Final state detection
  - Dispute flow paths

**Middleware**:
- ✅ Auth middleware
- ✅ Rate limiting
- ✅ Role-based access control
- ✅ Account status checks

#### Integration Tests

**API Endpoints**:
- ✅ **Auth Flow**: Registration → Login → Refresh → Logout
- ✅ **Match Lifecycle**: Create → Join → Ready → Complete
- ✅ **Team Operations**: Create → Invite → Accept → Leave
- ✅ **Dispute Resolution**: File → Evidence → Admin Review

### Frontend Test Coverage

#### Unit Tests

**Components**:
- ✅ Button component (all variants, states)
- ✅ Modal component (open/close, interactions)
- ✅ Card component
- ✅ Form inputs

**Hooks**:
- ✅ useAppContext
- ✅ useAuth
- ✅ useTheme

#### Integration Tests

**Page Flows**:
- ✅ Login/Sign up flow
- ✅ Match browsing and filtering
- ✅ Profile management
- ✅ Navigation

### E2E Test Coverage

**User Journeys**:
- ✅ **Complete Registration Flow**
  - Sign up → Email verification → Login

- ✅ **Match Lifecycle**
  - Browse matches → Filter → Join → Lobby → Ready → Play → Report result

- ✅ **Team Operations**
  - Create team → Invite friends → Accept invites → Create team match

- ✅ **Dispute Flow**
  - Report result → Opponent disputes → Submit evidence → Admin reviews

## Test Database

### Setup

The test database is isolated from development/production:

```bash
# Test database URL
postgresql://postgres:postgres@localhost:5432/betduel_test
```

### Test Data Factories

Located in `backend/tests/fixtures/factories.ts`:

- `createTestUser()` - Create test users with configurable attributes
- `createTestGame()` - Create test games
- `createTestMatch()` - Create test matches
- `createTestTeam()` - Create test teams
- `createTestDispute()` - Create test disputes
- `createTestTransaction()` - Create test transactions
- `createTestFriendship()` - Create test friendships

### Database Cleanup

Tests automatically clean up data:
- `beforeEach`: Clean test data
- `afterEach`: Clean test data
- `afterAll`: Disconnect from database

## CI/CD Integration

### GitHub Actions Workflow

Tests run automatically on:
- Push to `main`, `develop`, or `claude/**` branches
- Pull requests to `main` or `develop`

### Workflow Jobs

1. **Backend Tests**
   - Setup PostgreSQL service
   - Run migrations
   - Run unit tests
   - Run integration tests
   - Generate coverage report

2. **Frontend Tests**
   - Run component tests
   - Run hook tests
   - Generate coverage report

3. **E2E Tests**
   - Setup full stack (database + backend + frontend)
   - Install Playwright browsers
   - Run E2E test suites
   - Upload test reports

4. **Coverage Check**
   - Verify 80% coverage threshold
   - Upload to Codecov (optional)

## Writing New Tests

### Backend Unit Test Template

```typescript
import { prisma } from '../../../src/lib/prisma';
import { cleanupTestData } from '../../fixtures/factories';

describe('Feature Name', () => {
  beforeAll(async () => {
    await cleanupTestData();
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should do something', async () => {
    // Arrange
    const input = 'test';

    // Act
    const result = await someFunction(input);

    // Assert
    expect(result).toBe('expected');
  });
});
```

### Frontend Component Test Template

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Component from './Component';

describe('Component', () => {
  it('should render correctly', () => {
    render(<Component />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### E2E Test Template

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should complete flow', async ({ page }) => {
    // Perform actions
    await page.getByRole('button', { name: /click me/i }).click();

    // Verify results
    await expect(page).toHaveURL(/\/success/);
  });
});
```

## Best Practices

### General
- ✅ Write tests before or alongside code (TDD/BDD)
- ✅ Keep tests isolated and independent
- ✅ Use descriptive test names
- ✅ Follow AAA pattern: Arrange, Act, Assert
- ✅ Clean up test data properly

### Backend
- ✅ Use factories for test data creation
- ✅ Test error cases and edge cases
- ✅ Mock external services (email, payment APIs)
- ✅ Test database constraints and validations
- ✅ Use transactions for test isolation when possible

### Frontend
- ✅ Test user interactions, not implementation
- ✅ Use semantic queries (getByRole, getByLabelText)
- ✅ Test accessibility
- ✅ Mock API responses
- ✅ Test loading and error states

### E2E
- ✅ Test critical user paths only
- ✅ Keep tests fast and reliable
- ✅ Use test data that doesn't interfere
- ✅ Handle async operations properly
- ✅ Take screenshots on failures

## Troubleshooting

### Backend Tests Failing

```bash
# Check database connection
psql -U postgres -d betduel_test

# Reset database
cd backend
npx prisma migrate reset --force

# Clear Jest cache
npm test -- --clearCache
```

### Frontend Tests Failing

```bash
# Clear Vitest cache
npm run test -- --clearCache

# Check for React/DOM issues
npm run test -- --reporter=verbose
```

### E2E Tests Failing

```bash
# Run in headed mode to see what's happening
npm run test:e2e:headed

# Check test output
npx playwright show-report

# Update Playwright browsers
npx playwright install
```

## Coverage Reports

### Viewing Coverage

**Backend**:
```bash
cd backend
npm run test:coverage
open coverage/lcov-report/index.html
```

**Frontend**:
```bash
npm run test:coverage
open coverage/index.html
```

### Coverage Thresholds

Both backend and frontend are configured with 80% minimum coverage:

- Lines: 80%
- Functions: 80%
- Branches: 80%
- Statements: 80%

## Continuous Improvement

- 🎯 Monitor flaky tests and fix them
- 🎯 Add tests for new features
- 🎯 Refactor tests as code evolves
- 🎯 Keep test documentation updated
- 🎯 Review test coverage regularly

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [React Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
