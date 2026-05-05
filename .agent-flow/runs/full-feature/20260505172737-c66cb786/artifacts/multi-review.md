# Multi Review

Reviewers:
- Codex Main self-review: approve

Checks:
- Route remains public and does not import Supabase/auth.
- Response shape stays compatible with existing `MarketInsight`.
- Malformed provider payloads no longer cache fallback defaults.
- Tests isolate module-level cache and rate-limit state with `vi.resetModules()`.

Result:
- approve
