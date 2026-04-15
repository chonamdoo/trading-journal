# Safety Caps — trading-journal

## Cloud Budgets (hard cap)
- **Supabase**: Pro / 월 사용량 알림 설정 (대시보드 → Billing)
- **Vercel**: Spending Limit 설정 (대시보드 → Settings → Billing)
- **OpenAI / Anthropic**: 월 예산 + shutoff 알림

## Rate Limits (code-level)
- `/api/ai-*` — 10/min per user, 100/day per IP
- 인증 엔드포인트 — 5/min per IP

## Rollback SLA
- prod 이상 감지 → **5분 내 revert** (fix-forward 금지)
- DB migration 롤백: `supabase/migrations/` 역순 SQL 준비
- Vercel instant rollback: `vercel rollback <deployment-url>`

## Pre-Migration Checklist
1. [ ] 로컬에서 `supabase db reset` 통과
2. [ ] prod 백업 (`supabase db dump > backups/YYYY-MM-DD.sql`)
3. [ ] RLS 4 CRUD 정책 모두 존재 확인
4. [ ] `supabase db push` (의식적으로 수동 실행)

## Secret Locations (no hardcode)
- Supabase URL/anon key: `NEXT_PUBLIC_SUPABASE_*` (공개 OK)
- Supabase service_role: Vercel env only (서버 사이드)
- OpenAI/Anthropic keys: Vercel env only
