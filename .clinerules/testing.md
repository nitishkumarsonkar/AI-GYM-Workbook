# Testing Standards – AI GYM Workbook

## Scope
- Ensure critical flows (auth, workout planning, exercise browsing) have automated coverage or documented manual checks.
- Align test plans with [activeContext.md](../activeContext.md) priorities.

## Tools & Frameworks
- Prefer Jest/testing-library for unit and integration tests.
- Use Expo’s testing utilities for React Native components when appropriate.

## Expectations
- Write unit tests for pure logic (services, helpers).
- Provide smoke tests or QA checklists for complex screens if automation isn’t feasible.
- Mock Supabase interactions; don’t hit live services in unit tests.

## Workflow
- Run `npm test` (or relevant script) before submitting PRs.
- Document manual test cases in PR descriptions when automation is missing.

## Reporting
- Capture failing test logs with context and link them to logger output if relevant.