# Domain Map - SPEC-005 Slice 4

## Boundary
- Presentation: AI report page state chooses monthly or weekly period.
- API Client: `fetchReportsByType(periodType)` loads reports by period.
- Data Contract: `MonthlyReportRow.period_type` and `week` identify display period.

## Invariants
- Monthly reports display `YYYY년 M월`.
- Weekly reports display `YYYY년 W주차`.
- No production Supabase test.
- No design system component change.
