# Plan Review

## Verdict
verdict: approve

## Review
- Slice is narrow and independently shippable.
- Risk is correctly placed at the database boundary.
- No UI/design surface touched.
- Test can be deterministic by inspecting migration SQL contract.

## Required Validation
- RED test must fail against the current plain unique constraint.
- GREEN must pass after replacing it with NULL-safe uniqueness.
- Run targeted test, typecheck, lint, and full test suite if feasible.

## Current Phase Confirmation
Reviewed at `plan-review` phase. Verdict remains `verdict: approve`.
