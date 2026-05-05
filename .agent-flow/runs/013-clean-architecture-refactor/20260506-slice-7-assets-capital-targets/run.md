# Agent-Flow Run: Slice 7 Assets And Capital Targets

Status: completed
Branch: `codex/refactor-clean-architecture`
Issue: https://github.com/chonamdoo/trading-journal/issues/12

## Task

Migrate Asset, Supported Asset, Custom Asset, Favorite Asset, and Capital Target behavior behind feature boundaries without changing UI or API response shapes.

## Selected Behavior

- Supported Asset, Custom Asset, and Favorite Asset remain semantically distinct.
- Capital Target remains separate from Target Price.
- Assets and Capital Targets HTTP routes act as Route Adapters through Composition Roots.

## Gates

- RED: `npm test -- src/features/assets/assets.behavior.test.ts src/features/capital-targets/capital-targets.behavior.test.ts tests/api/assets-route.behavior.test.ts tests/api/targets-route.behavior.test.ts` failed on missing feature modules and route wiring.
- GREEN: selected Assets and Capital Targets behavior tests passed after module implementation.
- `npm test`: passed.
- `npx tsc --noEmit`: passed.
- `npm run lint`: passed with existing warnings.
- `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_ANON_KEY=local-anon-key npx next build`: passed.
- `git diff --check`: passed.

## Review

Fallback self-review: LGTM. Configured `.Codex/agents/code-reviewer.md` is still missing.
