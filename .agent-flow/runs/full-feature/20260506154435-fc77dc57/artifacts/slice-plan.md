# Slice Plan - SPEC-002 Slice 3

Slice:
- Client Fetch Wrapper Foundation.

Implementation steps:
1. RED: add behavior tests for `apiFetch` and `apiFetchFormData`.
2. GREEN: update `src/lib/api/client.ts` minimally to satisfy the wrapper contract.
3. REFACTOR: extract shared request/response handling only if it reduces duplication.
4. Gates: run targeted tests, full tests, typecheck, lint, and build.

Out of scope:
- `src/hooks/useTrades.ts` migration.
- Resource-specific client API rewrites.
- Additional route handlers.

Runner note:
- Reconfirmed at slice-plan phase.
