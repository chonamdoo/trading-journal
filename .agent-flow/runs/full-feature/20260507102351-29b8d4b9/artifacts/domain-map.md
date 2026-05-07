# Domain Map - SPEC-005 Slice 5

## Boundary
- Presentation: `AnalysisPage` renders `AutoReportToast`.
- Hook: `useAutoWeeklyReport` owns auto-check and generation side effect.
- API: `/api/report/auto-check` and `/api/report/generate`.

## Invariants
- Analysis page does not call Supabase directly.
- Auto generation feedback uses hook state.
- No production Supabase tests.
