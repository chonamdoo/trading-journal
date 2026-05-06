# PRD

## Problem
The database now enforces weekly uniqueness by `(user_id, year, week)` but `/api/report/generate` still searches for existing weekly rows using `(user_id, year, month, week)`. If a weekly row exists with a different stored month for the same ISO week, the API misses it and attempts an insert that can violate the unique index.

## Goal
Weekly report generation updates the existing weekly row by ISO week identity.

## Acceptance Criteria
- Weekly existing-row lookup does not filter by month.
- Weekly insert/update still stores the requested month as metadata.
- Monthly logic remains unchanged.
- Behavior test fails before the route fix and passes after.
