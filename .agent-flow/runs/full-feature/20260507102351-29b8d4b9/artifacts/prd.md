# PRD - SPEC-005 Slice 5

## Problem
The analysis page triggers automatic report generation, but the feedback UI only receives generic generation state. The hook already exposes `generatedType`, so the wiring should preserve that state.

## Acceptance Criteria
- `AnalysisPage` reads `generatedType` from `useAutoWeeklyReport`.
- `AnalysisPage` passes `generatedType` to `AutoReportToast`.
- `AutoReportToast` displays weekly/monthly-specific generation and completion text.
- Existing visual component style remains unchanged.
