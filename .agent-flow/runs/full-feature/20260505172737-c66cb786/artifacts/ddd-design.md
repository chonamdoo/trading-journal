# DDD Design

No new Domain Layer module is introduced in this slice.

Reason:
- Market Insight is public read-only provider aggregation.
- There is no persisted aggregate, user-owned invariant, or business use case to isolate yet.
- The Route Adapter remains the boundary for provider mapping and failure behavior.

Constraints:
- Keep UI unchanged.
- Keep response shape compatible with existing `MarketInsight` client type.
- Do not import Supabase or auth modules.

Updated:
- Refreshed during `ddd-design` phase after Agent Flow stale-artifact guard.
