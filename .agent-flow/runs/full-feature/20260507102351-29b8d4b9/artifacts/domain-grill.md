# Domain Grill - SPEC-005 Slice 5

Task: SPEC-005 Slice 5: Analysis Page Auto Generation Wiring.

## Decisions
- Analysis page is the primary automatic report generation entry point.
- Auto generation feedback must preserve whether the generated report is weekly or monthly.
- Existing page layout and design components remain unchanged.

## Terms
- Auto Generation Wiring: analysis page connection from `useAutoWeeklyReport` to user feedback UI.
- Generated Type: `weekly` or `monthly` report type returned by the hook while generation runs.

## Open Questions
- None.

## Sources Checked
- `specs/005-weekly-auto-report.md`
- `src/app/(main)/analysis/page.tsx`
- `src/hooks/useAutoWeeklyReport.ts`
- `src/components/ui/AutoReportToast.tsx`
