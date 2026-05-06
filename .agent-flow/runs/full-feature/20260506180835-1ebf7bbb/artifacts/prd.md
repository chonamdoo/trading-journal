# PRD - SPEC-005 Slice 3

## Problem
`/api/report/auto-check` only checks whether the latest weekly report was created within seven days. If the previous ISO week already has a weekly report whose `created_at` is older than seven days, the route can still ask the client to generate the same weekly period again.

## Goal
Align auto-check with the weekly report identity contract already used by schema and generation routes.

## Acceptance Criteria
- Target ISO week is checked by `user_id`, `year`, `week`, and `period_type = 'weekly'`.
- Existing target weekly report returns `needsWeekly: false`.
- No target weekly report plus at least one closed trade in the target week returns `needsWeekly: true`.
- Existing monthly behavior remains unchanged.
