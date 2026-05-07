# Domain Grill - SPEC-005 Slice 4

Task: SPEC-005 Slice 4: AI Report Weekly Monthly Presentation.

## Decisions
- Report Period is the presentation boundary for AI report detail selection.
- The AI report page must let users distinguish monthly and weekly reports.
- Monthly remains the default period to preserve current first-load behavior.
- Existing visual language and design components remain unchanged.

## Terms
- Monthly Report: AI report for one calendar month.
- Weekly Report: AI report for one ISO week.
- Report Period Selection: UI state that chooses which report period list drives the report hero/cards.

## Open Questions
- None for this slice.

## Sources Checked
- `specs/005-weekly-auto-report.md`
- `src/app/(main)/analysis/report/page.tsx`
- `src/lib/api/client-api.ts`
