# Domain Grill - SPEC-006 Favorites Toggle

Sources checked:
- specs/006-favorites-toggle.md
- CONTEXT.md
- src/features/assets/*

Resolved decisions:
- Favorite Asset is distinct from Supported Asset and Custom Asset.
- favorites table stores user-specific symbol toggles for both default and custom assets.
- custom_assets remains custom tradable symbol registration, not favorites.
- HTTP contract must include POST /api/favorites/toggle with body { symbol } and response { success, data: { favorited, id? } }.
- Existing UI/design must remain unchanged.

Open questions:
- None for this slice.
