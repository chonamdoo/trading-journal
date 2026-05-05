# Slice Plan - SPEC-006 Favorites Toggle

Slice 1: Add POST /api/favorites/toggle behavior over existing assets feature module.

Acceptance:
- POST body { symbol } toggles existing favorite off and missing favorite on.
- Response shape { success, data: { favorited, id? } }.
- Existing UI remains unchanged.
- Existing /set endpoint can remain for compatibility unless unused cleanup is safe.
