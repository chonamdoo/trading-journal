# PR Comment Fix

Status:
- fixed

PR:
- https://github.com/chonamdoo/trading-journal/pull/16

Resolved review items:
- Removed absolute local worktree path from workflow artifact.
- Changed manifest `run_dir` to repo-relative path.
- Reset pre-trade checklist immediately after successful trade save before screenshot upload.

Verification:
- `npm test -- tests/components/pre-trade-checklist.behavior.test.ts`
- `npx tsc --noEmit`
- `npm run lint`
- `git diff --check`
