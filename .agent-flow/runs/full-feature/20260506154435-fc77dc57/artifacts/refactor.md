# Refactor - SPEC-002 Slice 3

Status:
- No broad refactor performed.

Changed structure:
- Added `readJsonBody` inside `src/lib/api/client.ts` to centralize empty-body and JSON parsing behavior for both JSON and FormData fetch paths.

Scope kept:
- Existing caller response shape is unchanged.
- Existing client API wrapper functions are unchanged.
- UI and route handlers are unchanged.
