# DDD Design - SPEC-002 Slice 1

Architecture impact:
- Infrastructure/API boundary only.

Layer boundaries:
- Domain Layer: unchanged.
- Data Layer: unchanged.
- Presentation Layer: unchanged.
- Route Adapter auth boundary: `src/lib/api/auth.ts`.

Dependency rules:
- `mobile-auth.ts` re-exports from `auth.ts`; it does not duplicate auth logic.
- No Next.js or Supabase imports are introduced into Domain Layer.
