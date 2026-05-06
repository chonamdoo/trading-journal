# DDD Design - SPEC-002 Slice 2

Architecture impact:
- Route Adapter compatibility layer only.

Layer boundaries:
- Domain Layer: unchanged.
- Data Layer: unchanged.
- Presentation Layer: unchanged.
- Mobile compatibility routes no longer import data APIs.

Dependency rules:
- `src/lib/api/mobile-redirect.ts` depends only on Next request/response primitives.
- Canonical API routes remain the behavior owners.
