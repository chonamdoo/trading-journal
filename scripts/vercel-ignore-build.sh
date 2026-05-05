#!/usr/bin/env bash
set -euo pipefail

branch="${VERCEL_GIT_COMMIT_REF:-}"

case "$branch" in
  codex/refactor-*)
    echo "Skipping Vercel build for refactor branch: $branch"
    exit 0
    ;;
  *)
    echo "Continuing Vercel build for branch: ${branch:-unknown}"
    exit 1
    ;;
esac
