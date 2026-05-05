# DDD Design - SPEC-006 Favorites Toggle

Domain terms:
- Favorite Asset: user-specific symbol marker.
- Toggle Favorite: if Favorite Asset exists, remove it; otherwise create it.

Dependency direction: Route Adapter -> Composition Root -> Domain UseCase -> Repository Interface -> Data Repository.
