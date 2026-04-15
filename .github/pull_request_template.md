## 변경 요약
-

## Blast Radius
- [ ] Irreversible 작업 포함? (migration / RLS / 권한 / 결제 / 환경변수)
- [ ] 프로덕션 데이터 영향?
- [ ] 롤백 시나리오: (5분 내 revert / 수동 복구 필요)

## Verification
- [ ] Build PASS
- [ ] Typecheck PASS
- [ ] Lint PASS
- [ ] (UI 변경) 실제 동작 확인
- [ ] (DB 변경) 로컬 `supabase db reset` 통과
- [ ] (DB 변경) prod 백업 완료

## Related
SPEC-
