# Domain Map - SPEC-002 Slice 2

Referenced context:
- No domain glossary changes.

Boundary map:
- Legacy caller -> Mobile Compatibility Route -> 308 redirect -> Canonical Route Handler.

Dependency decision:
- Mobile compatibility routes do not import domain/data APIs.
- Redirect helper lives in `src/lib/api/mobile-redirect.ts`.
- Canonical route handlers remain responsible for auth, parsing, use case call, and response mapping.
