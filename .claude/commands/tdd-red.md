# TDD RED Phase - Write Failing Tests

Enter the RED phase of Test-Driven Development for: $ARGUMENTS

## Strict Rules for RED Phase:

1. Write ONLY test code - NO implementation
2. Tests MUST fail (functionality doesn't exist)
3. NO mock implementations that make tests pass
4. Cover these scenarios:
   - Happy path (normal operation)
   - Edge cases (boundary conditions)
   - Error conditions (invalid inputs)
   - Qualiopi-specific requirements (if applicable)

## Frontend Test Template (Vue/Nuxt):

Use Vitest with @vue/test-utils or @nuxt/test-utils
Follow patterns in existing test files
Use data-testid attributes for reliable selection

## Backend Test Template (AdonisJS):

Use Japa with API client for functional tests
Use DatabaseTransactions trait
Create test data with factories

## After Writing Tests:

1. Run tests to confirm they fail
2. Document why each test fails
3. Commit with message: "test: add failing tests for $ARGUMENTS"

Remember: If tests pass initially, they're invalid!
