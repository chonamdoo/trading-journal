# Push Watch

Use this skill after local verification is complete and the branch is ready to publish.

Run:

```bash
npx github:chonamdoo/agent-flow run push-watch
```

Flow:

1. Sanity check the branch and working tree.
2. Commit and push the current branch.
3. Open or record the pull request.
4. Watch PR checks and review threads.
5. Route failures through `pr-comment-fix` or `pr-ci-fix`; comment fixes must also resolve the corresponding GitHub review threads.
6. Push again and return to `pr-watch`.
7. When checks and comments are green, route to `merge`.

Rules:

- Protected branches are blocked: main, master, develop.
- Record PR watch state with `status: green`, `status: comments`, `status: ci-failed`, or `status: pending`.
- merge requires explicit approval. Do not merge unattended.
