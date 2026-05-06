# DDD Design

## Domain
Weekly Report identity is ISO week based.

## Data
Database unique index: `(user_id, year, week)` where `period_type = 'weekly'`.

## API
Route lookup must use the same identity.

## Presentation
Unchanged.

## Verdict
verdict: approve

## Current Phase Confirmation
Reviewed at `ddd-design` phase. API must match data identity.
