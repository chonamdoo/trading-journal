# Slice Plan

Slice 1: Market Insight API Boundary

Steps:
1. Add behavior tests for success mapping, stale fallback, and rate limit.
2. Run RED and record failing output.
3. Update route implementation only if tests expose gaps.
4. Run GREEN.
5. Run gates.
6. Review, commit, push/PR only when requested.

Files expected:
- `tests/api/market-insight-route.behavior.test.ts`
- `src/app/api/market/insight/route.ts`

Updated:
- Refreshed during `slice-plan` phase after Agent Flow stale-artifact guard.
