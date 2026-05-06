# Domain Map

## Boundary
- Domain invariant: weekly report identity excludes month.
- Data boundary: Supabase `monthly_reports` partial unique index enforces `(user_id, year, week)` for weekly rows.
- API boundary: `/api/report/generate` must use the same identity key when selecting an existing weekly row.

## Decision
Align API lookup with database uniqueness:
- weekly select/update key: `user_id`, `year`, `week`, `period_type = 'weekly'`
- no `month` filter for weekly lookup
