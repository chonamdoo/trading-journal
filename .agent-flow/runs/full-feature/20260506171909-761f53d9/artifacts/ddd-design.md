# DDD Design

## Domain
Report Period identity:
- monthly report: one per user/year/month
- weekly report: one per user/year/week

## Data
Supabase migration owns invariant enforcement.

## Presentation
Unchanged.

## Repository/API
Unchanged in this slice.

## Dependency Rule
No Next.js, React, or Supabase client concerns enter domain logic. This slice is schema-only and keeps behavior below API/presentation.

## Implementation Choice
Use partial unique indexes instead of a plain unique constraint with nullable `week`.

Reason:
- `week = null` must not bypass monthly uniqueness.
- Partial indexes encode separate weekly/monthly identities clearly.

## Current Phase Confirmation
Reviewed at `ddd-design` phase. The only architecture boundary touched is Data/schema.
