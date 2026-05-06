# Domain Grill - SPEC-005 Slice 3

Task: SPEC-005 Slice 3: Auto Weekly Report Check Hook.

## Decisions
- Auto weekly report generation is driven by `/api/report/auto-check`.
- The target report period is the previous ISO week.
- A weekly report that already exists for the target ISO week must suppress generation even if its `created_at` is older than seven days.
- Existing UI/design remains unchanged.

## Terms
- Weekly Report: AI report for one ISO week.
- Target Week: previous ISO week checked when the analysis/report page mounts.
- Auto Check: server route that tells the client whether background generation should run.

## Open Questions
- None for this slice.

## Sources Checked
- `specs/005-weekly-auto-report.md`
- `src/app/api/report/auto-check/route.ts`
- `src/hooks/useAutoWeeklyReport.ts`
