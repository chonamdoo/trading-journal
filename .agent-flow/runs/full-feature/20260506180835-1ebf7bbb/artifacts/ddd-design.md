# DDD Design - SPEC-005 Slice 3

## Aggregate Boundary
Report Period is the identity boundary for generated reports.

## Rule
For weekly auto-check, existence of the target Weekly Report is determined by:

- `user_id`
- ISO `year`
- ISO `week`
- `period_type = 'weekly'`

## Implementation
- Compute target previous ISO week before report existence checks.
- Query `monthly_reports` for the target weekly identity.
- Only count closed trades when the target weekly report does not exist and no recent weekly suppression applies.

## Current Phase Confirmation
Confirmed during active `ddd-design` phase.
