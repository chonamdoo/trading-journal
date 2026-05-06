# Domain Map: SPEC-005 Slice 1

## Context Reference
Existing domain terms are in `CONTEXT.md`:
- Report
- AI Report
- Report Period
- User Profile

## Boundary
- Domain: Report Period identity rules.
- Data: Supabase `monthly_reports` schema and generated TypeScript DB types.
- Presentation: unchanged.

## Dependency Rule
Schema/type slice has no UI dependency. Report period uniqueness belongs below presentation and must be enforced by the database.

## Decision
Represent report identity as:
- monthly: `(user_id, year, month, period_type)` with `week = null`
- weekly: `(user_id, year, week, period_type)` with `week != null`

The DB must enforce this identity without relying on application code.
