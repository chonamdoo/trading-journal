# Security Scenarios — Trading Journal

루트 `.claude/rules/security.md`의 Vibecoding 3대 + Protected Pipeline을 **이 프로젝트 데이터/스택에 매핑**한 표.
Code Reviewer / Security Expert가 매 변경마다 적용한다.

스택: Next.js 15 + Supabase + Vercel + Gemini API

---

## Layer 1 — 데이터 (RLS + 테이블 분리)

### 권한/과금/사용량 컬럼 격리 표

| 보호해야 할 정보 | ❌ 같이 두면 안 되는 곳 | ✅ 분리할 위치 | UPDATE 권한 |
|-----------------|----------------------|---------------|-------------|
| `subscription_tier` (free/pro) | `profiles` | `subscriptions` 테이블 (이미 존재) | service_role + RPC |
| `subscription_expires_at` | `profiles` | `subscriptions` | service_role + RPC |
| AI 호출 사용량 카운터 | `profiles`, `monthly_reports` | `ai_usage_counters` (신규) | RPC만 |
| 거래소 API Key (v2 거래소 연동 미구현 시 사전 준비) | `profiles`, `exchange_connections` | 별도 vault 테이블 + AES-256-GCM | service_role 전용 |
| 트레이딩 점수/등급 캐시 | 거래 데이터에 inline 저장 금지 | `ai_analysis_cache` (이미 존재) | RPC만 |

### 현재 스키마 점검 결과

**`profiles` 테이블 — 위험**:
```sql
profiles (
  id, email, display_name, initial_capital, currency,
  subscription_tier TEXT,            -- ⚠️ 사용자가 UPDATE할 수 있으면 무료→pro 승격 가능
  subscription_expires_at TIMESTAMPTZ -- ⚠️ 동일
)
```

**필요한 마이그레이션**:
```sql
-- 1. profiles의 subscription_* 컬럼을 별도 테이블로 이전
ALTER TABLE profiles DROP COLUMN subscription_tier;
ALTER TABLE profiles DROP COLUMN subscription_expires_at;

-- 2. RLS 재설정
CREATE POLICY "subscriptions_select_own" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);
-- INSERT/UPDATE/DELETE 정책은 만들지 않는다 (service_role만 접근)

-- 3. 사용자가 자기 등급 조회용 RPC
CREATE FUNCTION get_my_subscription()
RETURNS TABLE(tier text, expires_at timestamptz)
LANGUAGE sql SECURITY DEFINER SET search_path = ''
AS $$
  SELECT s.tier, s.expires_at
  FROM public.subscriptions s
  WHERE s.user_id = auth.uid()
    AND s.status = 'active'
  ORDER BY s.expires_at DESC LIMIT 1;
$$;
```

### RLS 시나리오 체크 (모든 변경에 적용)

| 시나리오 | 기대 결과 |
|---------|----------|
| `UPDATE profiles SET subscription_tier='pro' WHERE id = auth.uid()` | DENY (컬럼 자체가 없어야 함) |
| `UPDATE subscriptions SET tier='pro' WHERE user_id = auth.uid()` | DENY (UPDATE 정책 없음) |
| `UPDATE trades SET pnl=99999 WHERE id = (다른 사람 거래)` | DENY (RLS) |
| `SELECT * FROM trades WHERE user_id != auth.uid()` | 0 rows |
| `INSERT INTO trades (user_id, ...) VALUES ('다른 사람 id', ...)` | DENY (WITH CHECK) |
| `DELETE FROM subscriptions WHERE user_id = auth.uid()` | DENY |
| 익명 anon 키로 `SELECT * FROM subscriptions` | 0 rows or DENY |

---

## Layer 2 — 통신 (Vercel API Route 프록시)

### 비용 발생 외부 API 매핑

| 외부 API | 직접 호출 금지 | 백엔드 프록시 경로 | Vercel 환경변수 |
|---------|--------------|------------------|----------------|
| Gemini API (월간 리포트 생성) | `'use client'` 컴포넌트에서 절대 호출 금지 | `/api/ai/generate-report` (서버 액션 또는 Route Handler) | `GEMINI_API_KEY` (NEXT_PUBLIC 아님) |
| 거래소 API (Binance/Bybit 등 v2) | 모든 거래소 호출 | `/api/exchange/[name]/[action]` | `EXCHANGE_ENCRYPTION_KEY` (AES-256-GCM 마스터키) |
| 이미지 변환 (스크린샷 → AI 분석 v2) | 클라이언트 직접 업로드 X | `/api/ai/analyze-screenshot` | 동일 |

### 백엔드 프록시 표준 구조

```typescript
// app/api/ai/generate-report/route.ts
import { createClient } from '@/lib/supabase/server'
import { ratelimit } from '@/lib/ratelimit'
import { z } from 'zod'

const Body = z.object({ year: z.number(), month: z.number() })

export async function POST(req: Request) {
  // 1. Auth
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 })

  // 2. Rate limit (사용자 + IP)
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  const { success: u } = await ratelimit.user.limit(user.id)
  const { success: i } = await ratelimit.ip.limit(ip)
  if (!u || !i) return Response.json({ error: 'rate_limited' }, { status: 429 })

  // 3. Quota 차감 (RPC)
  const { error: qErr } = await supabase.rpc('consume_ai_quota', { amount: 1 })
  if (qErr) return Response.json({ error: 'quota_exceeded' }, { status: 402 })

  // 4. 외부 API
  const body = Body.parse(await req.json())
  const result = await callGemini(process.env.GEMINI_API_KEY!, body)

  // 5. 사용량 로깅
  await supabase.from('ai_usage_log').insert({
    user_id: user.id, model: 'gemini', tokens: result.usage
  })

  return Response.json(result)
}
```

### `NEXT_PUBLIC_*` 점검 화이트리스트

| 변수 | 허용 여부 |
|------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ (공개 의도) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ (공개 의도, RLS로 방어) |
| `NEXT_PUBLIC_SITE_URL` | ✅ |
| `GEMINI_API_KEY` | ❌ → 서버 전용 |
| `SUPABASE_SERVICE_ROLE_KEY` | ❌ → 서버 전용 |
| `EXCHANGE_*_API_KEY` | ❌ → 서버 전용 |
| `STRIPE_SECRET_KEY` | ❌ → 서버 전용 |

---

## Layer 3 — 방어 (Rate Limit + Budget Cap)

### 비용 엔드포인트 Rate Limit 표

| 엔드포인트 | 사용자 분당 | 사용자 일당 | IP 분당 |
|----------|------------|------------|---------|
| `/api/ai/generate-report` | 2 | 10 | 5 |
| `/api/ai/analyze-screenshot` (v2) | 5 | 30 | 10 |
| `/api/exchange/sync` (v2) | 1 | 20 | 3 |
| `/api/auth/sign-in` | 5 | 50 | 10 |
| `/api/auth/sign-up` | 3 | 5 | 5 |
| `/api/auth/reset-password` | 2 | 5 | 3 |

### 클라우드 예산 하드 캡 체크리스트

- [ ] **Gemini API**: Google Cloud Console → Billing → Budget alerts (월 한도 + 50%/80%/100% 알림)
- [ ] **Vercel**: Settings → Billing → Spending Limit
- [ ] **Supabase**: Pro plan 시 Project Settings → Billing → Usage alerts
- [ ] **Upstash Redis** (Rate Limit 저장소 사용 시): Console → Budget alerts
- [ ] (v2) **거래소 API**: 각 거래소가 제공하는 API 사용량 알림

---

## Definition of Done — 이 프로젝트 버전

매 PR 머지 전 3가지 질문에 YES여야 함:

1. **"사용자가 브라우저 콘솔에서 본인을 PRO로 승격할 수 있는가?"**
   ```js
   // DevTools Console
   await supabase.from('profiles').update({subscription_tier: 'pro'}).eq('id', user.id)
   await supabase.from('subscriptions').update({tier: 'pro'}).eq('user_id', user.id)
   ```
   → 둘 다 DENY 또는 컬럼 없음이어야 합격

2. **"Network 탭에 Gemini API Key가 보이는가?"**
   - `/api/ai/generate-report` 요청 검사 → 헤더/페이로드/응답 어디에도 `GEMINI_API_KEY` 값 없음
   - 빌드 산출물 검색: `grep -rE "AIza[0-9A-Za-z_-]{35}" .next/` → 0 결과

3. **"`/api/ai/generate-report`를 1만 번 호출하면 내 지갑이 안전한가?"**
   - 11번째 호출에서 429 응답
   - 일일 한도 초과 시 402 응답
   - Gemini billing dashboard에서 월 예산 알림 도착
   - 최악의 경우에도 손실 ≤ 설정한 budget cap

---

## 우선순위 (구현 순서)

1. **HIGH** — `profiles.subscription_*` 컬럼 분리 마이그레이션 + RLS 재설정 (Layer 1)
2. **HIGH** — Gemini 호출을 클라이언트에서 직접 하고 있다면 즉시 `/api/ai/*` 백엔드 프록시로 이전 (Layer 2)
3. **HIGH** — `NEXT_PUBLIC_*` 변수 전수 점검 + 위험 변수 제거 (Layer 2)
4. **MEDIUM** — `@upstash/ratelimit` 도입 + 사용자/IP 이중 제한 (Layer 3)
5. **MEDIUM** — 클라우드 예산 알림 4개 항목 설정 (Layer 3)
6. **LOW** — 거래소 v2 구현 시 위 가이드 그대로 적용
