# TDD Verification - Independent Review

Perform independent verification of implementation for: $ARGUMENTS

## Verification Steps:

1. **Test Independence Check**

   - Are tests testing behavior, not implementation?
   - Could implementation change without breaking tests?
   - Do tests avoid testing private methods?

2. **Overfitting Analysis**

   - Does implementation do exactly what tests require?
   - Are there hardcoded values matching test data?
   - Is the solution general, not specific to test cases?

3. **Coverage Validation**

   - Run: `npm run test:coverage` (frontend)
   - Run: `node ace test --coverage` (backend)
   - Verify 95% coverage for Qualiopi features
   - Check for untested edge cases

4. **Code Quality Review**

   - Is code readable and maintainable?
   - Are Qualiopi business rules clear?
   - Is error handling comprehensive?
   - Are GDPR requirements met?

5. **Performance Check**
   - Are database queries optimized?
   - Is pagination implemented where needed?
   - Are there any N+1 query problems?

Report findings and suggest improvements without breaking tests.
