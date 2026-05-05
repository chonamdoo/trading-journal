# Agent-Flow Run: Slice 4 Trades Lifecycle Expansion

Status: completed
Branch: `codex/refactor-clean-architecture`
Issue: https://github.com/chonamdoo/trading-journal/issues/12

## Task

Extend the Trades Domain Layer with Close and Scale-In lifecycle behavior.

## Selected Behavior

A Trade with Scale-Ins and Closes can calculate weighted average entry price, remaining Margin, Close Trading PnL, full close status, and preserve Averaging Down/Pyramiding as Scale-In types.

## Gates

- RED: `npm test -- src/features/trades/trades-lifecycle.behavior.test.ts` failed on missing lifecycle domain module.
- GREEN: lifecycle behavior test passed after domain implementation.
- `npm test`: passed.
- `npx tsc --noEmit`: passed.
- `npm run lint`: passed with existing warnings.
- `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_ANON_KEY=local-anon-key npx next build`: passed.
- `git diff --check`: passed.

## Review

Fallback self-review: LGTM. Configured `.Codex/agents/code-reviewer.md` is still missing.
