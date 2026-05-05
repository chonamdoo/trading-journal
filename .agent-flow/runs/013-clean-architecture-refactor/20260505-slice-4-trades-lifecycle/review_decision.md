# Review Decision: Slice 4 Trades Lifecycle Expansion

Verdict: LGTM with degraded review

## Reason

The repo-configured `.Codex/agents/code-reviewer.md` is missing, so standard reviewer invocation was not available. Fallback self-review was performed against Slice 4 acceptance criteria.

## Findings

- No blocking issue found.
- Close and Scale-In domain entities stay free of Next.js, React, Supabase, and Data Layer imports.
- Lifecycle calculations preserve existing WAP, remaining Margin, close PnL, full close, and realized PnL behavior.
- Scale-In types use domain terms `averaging-down` and `pyramiding`.
- Existing UI/runtime behavior was not changed.

## Follow-up

Later slices can wire these domain calculations into existing close/scale-in routes.
