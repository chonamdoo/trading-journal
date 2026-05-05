# Handoff: Slice 7 Assets And Capital Targets

Status: completed
Branch: `codex/refactor-clean-architecture`
Issue: https://github.com/chonamdoo/trading-journal/issues/12

## Changed Files

- `src/features/assets/assets.behavior.test.ts`
- `src/features/assets/domain/entities/asset.ts`
- `src/features/assets/domain/repositories/asset.repository.ts`
- `src/features/assets/domain/usecases/add-custom-asset.usecase.ts`
- `src/features/assets/domain/usecases/delete-custom-asset.usecase.ts`
- `src/features/assets/domain/usecases/list-all-assets.usecase.ts`
- `src/features/assets/domain/usecases/list-custom-assets.usecase.ts`
- `src/features/assets/domain/usecases/list-favorite-assets.usecase.ts`
- `src/features/assets/domain/usecases/set-favorite-asset.usecase.ts`
- `src/features/assets/data/dto/custom-asset-row.dto.ts`
- `src/features/assets/data/mappers/asset.mapper.ts`
- `src/features/assets/data/repositories/supabase-asset.repository.server.ts`
- `src/features/assets/presentation/mappers/asset-response.mapper.ts`
- `src/features/assets/di.server.ts`
- `src/features/capital-targets/capital-targets.behavior.test.ts`
- `src/features/capital-targets/domain/entities/capital-target.ts`
- `src/features/capital-targets/domain/repositories/capital-target.repository.ts`
- `src/features/capital-targets/domain/usecases/create-capital-target.usecase.ts`
- `src/features/capital-targets/domain/usecases/delete-capital-target.usecase.ts`
- `src/features/capital-targets/domain/usecases/list-capital-targets.usecase.ts`
- `src/features/capital-targets/domain/usecases/update-capital-target.usecase.ts`
- `src/features/capital-targets/data/dto/capital-target-row.dto.ts`
- `src/features/capital-targets/data/mappers/capital-target.mapper.ts`
- `src/features/capital-targets/data/repositories/supabase-capital-target.repository.server.ts`
- `src/features/capital-targets/presentation/mappers/capital-target-request.mapper.ts`
- `src/features/capital-targets/presentation/mappers/capital-target-response.mapper.ts`
- `src/features/capital-targets/di.server.ts`
- `src/app/api/assets/route.ts`
- `src/app/api/assets/custom/route.ts`
- `src/app/api/assets/custom/[id]/route.ts`
- `src/app/api/favorites/route.ts`
- `src/app/api/favorites/set/route.ts`
- `src/app/api/targets/route.ts`
- `src/app/api/targets/[id]/route.ts`
- `tests/api/assets-route.behavior.test.ts`
- `tests/api/targets-route.behavior.test.ts`
- `.agent-flow/runs/013-clean-architecture-refactor/20260506-slice-7-assets-capital-targets/run.md`
- `.agent-flow/runs/013-clean-architecture-refactor/20260506-slice-7-assets-capital-targets/review_decision.md`

## Verification

- RED confirmed for missing Assets and Capital Targets feature modules and route wiring.
- `npm test`: passed.
- `npx tsc --noEmit`: passed.
- `npm run lint`: passed with existing warnings.
- `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_ANON_KEY=local-anon-key npx next build`: passed.
- `git diff --check`: passed.

## Notes

- Existing UI and API response shapes were not changed.
- Asset variants remain semantically distinct: Supported Asset, Custom Asset, Favorite Asset.
- Capital Target remains separate from Target Price.
- Existing unrelated working-tree changes remain unstaged: `src/app/(main)/analysis/report/page.tsx`, `src/lib/api/ai-report.ts`, `.codex/config.toml`.

## Next

Proceed to Slice 8: Exchange Import Boundary.
