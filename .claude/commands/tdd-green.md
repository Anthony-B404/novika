# TDD GREEN Phase - Minimal Implementation

Enter the GREEN phase to make failing tests pass for: $ARGUMENTS

## Strict Rules for GREEN Phase:

1. Write MINIMAL code to pass tests
2. Do NOT modify any tests
3. Do NOT add features beyond test requirements
4. Do NOT optimize or refactor yet
5. Follow "simplest thing that could possibly work"

## Implementation Guidelines:

### Frontend (Vue/Nuxt):

- Use Composition API with TypeScript
- Follow existing component patterns
- Use shadcn-vue components where applicable
- Maintain reactivity with computed/ref

### Backend (AdonisJS):

- Follow RESTful conventions
- Use proper validators
- Implement using existing service patterns
- Handle errors as tests require

## Process:

1. Run failing tests first
2. Implement minimal solution
3. Run tests after each change
4. Continue until all tests pass
5. Commit: "feat: implement $ARGUMENTS to pass tests"

Success = All tests GREEN, zero test modifications
