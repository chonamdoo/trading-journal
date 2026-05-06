# Product Brief - SPEC-005 Slice 3

Users should not see repeated weekly report generation attempts for a week that already has a report.

## User
- Authenticated Trading Journal user opening analysis/report screens.

## Outcome
- Auto-check returns `needsWeekly: false` when the previous ISO week already has a weekly report.
- If there is no target weekly report and the target week has closed trades, auto-check can request weekly generation.

## Non-Goals
- No visual redesign.
- No Gemini prompt change.
- No production Supabase test.
