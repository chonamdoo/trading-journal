# Refactor - SPEC-005 Slice 5

## Summary
- Kept existing analysis page layout.
- Passed generated report type from hook to toast.
- Made `AutoReportToast.generatedType` optional for existing callers.

## Files
- `src/app/(main)/analysis/page.tsx`
- `src/components/ui/AutoReportToast.tsx`
- `tests/app/analysis-auto-report-wiring.behavior.test.ts`
- `tests/components/auto-report-toast.behavior.test.ts`
