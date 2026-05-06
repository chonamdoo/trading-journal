# Domain Map - SPEC-005 Slice 3

## Boundary
- Presentation: `useAutoWeeklyReport` consumes `/api/report/auto-check` and triggers report generation.
- API Boundary: `/api/report/auto-check` computes whether weekly/monthly generation is needed.
- Data Boundary: Supabase tables `monthly_reports` and `trades`.

## Invariants
- Weekly report identity is `(user_id, year, week, period_type = 'weekly')`.
- Target week lookup must not depend on display month.
- Production Supabase is not used by automated tests.

## Dependencies
- UI must stay unchanged.
- No Next/Supabase imports are introduced into domain modules.
