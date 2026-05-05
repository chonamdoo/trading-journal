# Refactor - SPEC-006 Favorites Toggle

Changed structure:
- Added domain toggle use case for Favorite Asset.
- Added repository toggleFavorite contract and Supabase implementation.
- Added POST /api/favorites/toggle Route Adapter.
- Added client fetchToggleFavorite wrapper and moved store action to server-side toggle endpoint.
- Kept /api/favorites/set and fetchSetFavorite for compatibility.

Focused tests:
- src/features/assets/assets.behavior.test.ts
- tests/api/favorites-toggle-route.behavior.test.ts
