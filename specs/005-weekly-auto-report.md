# SPEC-005: 주간 자동 리포트 생성

## 목적
분석 페이지 방문 시 주간 리포트를 자동 생성하여 매매 피드백 주기를 월→주 단위로 단축한다. Gemini Flash 저비용 모델로 간소 요약만 생성해 월 15,000원 예산 내 운용.

## 완료 조건
- [x] 분석 페이지 접속 시 주간 리포트 자동 생성 조건 체크 (마지막 생성일 7일+ 경과 AND 해당 주 closed trade 1건+)
- [x] `monthly_reports` 테이블에 `period_type`, `week` 컬럼 추가 마이그레이션
- [x] 월간/주간 Report Period 중복 방지 제약 적용 (월간 `user_id/year/month`, 주간 `user_id/year/week`)
- [x] `/api/report/generate` Route Handler에 `periodType: 'weekly' | 'monthly'` 분기
- [x] 주간 리포트용 간소 Gemini 프롬프트 (KPI 변화 + 감정 패턴 + 인사이트 1-2줄)
- [x] 주간: `gemini-2.5-flash-lite` 유지, 월간: `gemini-2.5-flash-lite` 유지 (현재 동일)
- [x] 자동 생성 중 토스트/배너 UI
- [x] AI 리포트 페이지에서 주간/월간 리포트 분리 표시
- [x] RLS 기존 패턴 유지 (`auth.uid() = user_id`)
- [x] Rate Limit 기존 `RATE_LIMITS.ai` (시간당 5회) 적용

## 구현 증거
- PR #22: 주간/월간 Report Period 스키마와 NULL-safe uniqueness 보정.
- PR #23: 주간 리포트 생성 API의 ISO week identity 충돌 키 보정.
- PR #24: `/api/report/auto-check` 대상 주차 중복 생성 방지.
- PR #25: AI 리포트 페이지 주간/월간 분리 표시.
- PR #26: 분석 페이지 자동 생성 토스트 wiring 보강.

## 파일 변경
| 경로 | 작업 | 비고 |
|------|------|------|
| `supabase/migrations/{timestamp}_weekly_reports.sql` | 신규 | period_type, week 컬럼 추가 + UNIQUE 변경 |
| `src/lib/supabase/types.ts` | 수정 | `MonthlyReportRow/Insert/Update`에 `period_type`, `week` 필드 추가 |
| `src/app/api/report/generate/route.ts` | 수정 | `periodType` 파라미터 분기, 주간 프롬프트 추가 |
| `src/lib/api/ai-report.ts` | 수정 | `getLatestWeeklyReport()` 함수 추가, `getReportByMonth` → period_type 필터 추가 |
| `src/lib/api/reports.ts` | 수정 | `getReports` 쿼리에 period_type 필터 옵션 추가 |
| `src/lib/api/client-api.ts` | 수정 | `generateWeeklyReport()`, `fetchReportsByType()` 함수 추가 |
| `src/hooks/useAutoWeeklyReport.ts` | 신규 | 자동 생성 조건 체크 + 백그라운드 호출 훅 |
| `src/app/(main)/analysis/page.tsx` | 수정 | `useAutoWeeklyReport` 훅 호출 추가 |
| `src/app/(main)/analysis/report/page.tsx` | 수정 | 주간/월간 리포트 분리 표시, 탭 또는 섹션 구분 |
| `src/types/ai-report.ts` | 수정 | `WeeklyReportData` 타입 추가 (간소 버전) |
| `src/components/ui/AutoReportToast.tsx` | 신규 | 자동 생성 진행 중 토스트 컴포넌트 |

## 데이터/API 계약

### DB 마이그레이션
```sql
-- 1. period_type 컬럼 추가 (기존 데이터는 'monthly')
ALTER TABLE monthly_reports
  ADD COLUMN period_type TEXT NOT NULL DEFAULT 'monthly';

-- 2. week 컬럼 추가 (ISO week number, monthly/yearly는 null)
ALTER TABLE monthly_reports
  ADD COLUMN week INT;

-- 3. 기존 UNIQUE 제약 교체
ALTER TABLE monthly_reports
  DROP CONSTRAINT monthly_reports_user_id_year_month_key;

ALTER TABLE monthly_reports
  ADD CONSTRAINT monthly_reports_user_period_unique
  UNIQUE (user_id, year, month, week, period_type);

-- 4. period_type CHECK 제약
ALTER TABLE monthly_reports
  ADD CONSTRAINT monthly_reports_period_type_check
  CHECK (period_type IN ('weekly', 'monthly', 'yearly'));

-- 5. 인덱스 (주간 리포트 최신 조회용)
CREATE INDEX idx_monthly_reports_weekly
  ON monthly_reports (user_id, period_type, created_at DESC)
  WHERE period_type = 'weekly';
```

### 타입 변경 (`types.ts`)
```typescript
// MonthlyReportRow 확장
export type MonthlyReportRow = {
  // ... 기존 필드 ...
  period_type: 'weekly' | 'monthly' | 'yearly'
  week: number | null
}
```

### API 계약 변경 (`/api/report/generate`)
```typescript
// 요청 Body 확장
{
  year: number
  month: number
  periodType: 'weekly' | 'monthly'  // 추가. 기본값 'monthly'
  week?: number                      // periodType='weekly' 시 필수 (ISO week)
}

// 응답: 기존과 동일
{ success: true, report: MonthlyReportRow }
```

### 주간 리포트 자동 생성 조건 체크 API
새 엔드포인트 불필요. `useAutoWeeklyReport` 훅에서:
1. `getLatestWeeklyReport(supabase, userId)` → 마지막 주간 리포트 `created_at` 확인
2. 7일 이상 경과 시 → 현재 ISO week의 closed trade 수 조회
3. 1건 이상 → `/api/report/generate` POST (periodType: 'weekly')

### `useAutoWeeklyReport` 훅 시그니처
```typescript
function useAutoWeeklyReport(): {
  isGenerating: boolean
  error: string | null
}
```

### 주간 프롬프트 (간소 버전)
- 입력: 해당 주 closed trades (월~일)
- 출력: 마크다운 300자 이내 + JSON stats (headline, masterScore, kpis만)
- 모델: `gemini-2.5-flash-lite`
- `maxOutputTokens`: 1024 (월간 8192 대비 1/8)
- 구조: 전문가 총평 1줄 + KPI 변화 (전주 대비) + 감정 패턴 요약 + 핵심 인사이트 1줄

### `WeeklyReportData` 타입
```typescript
export interface WeeklyReportData {
  headline: string
  masterScore: number
  kpis: Pick<AIReportKPIs, 'winRate' | 'profitFactor'>
}
```

## 의존성
- 패키지 추가: 없음
- 환경변수 추가: 없음 (기존 `GEMINI_API_KEY` 사용)

## 엣지 케이스

### 데이터 관련
- **해당 주 closed trade 0건**: 자동 생성 스킵. UI 표시 없음
- **주간 리포트 이미 존재**: UNIQUE 제약으로 중복 방지. upsert 시 `onConflict: 'user_id,year,month,week,period_type'`
- **월 경계 걸친 주**: ISO week 기준. 예: 2026-04-27(월)~05-03(일)은 week=18, month=4로 기록 (주 시작일 기준)
- **첫 사용자 (리포트 0건)**: `getLatestWeeklyReport` null 반환 → 즉시 생성 조건 충족

### 동시성
- **분석 페이지 중복 방문**: `useAutoWeeklyReport` 내부에 `useRef` 플래그로 중복 호출 방지
- **동일 주 중복 생성 요청**: DB UNIQUE 제약 + API 내 존재 여부 사전 체크

### 비용
- **월 비용 상한**: 주간 리포트 1건당 ~1024 output tokens × 4주 × Flash 단가. 월간 1건 8192 tokens. 합산 월 15,000원 이내 — Generator가 실제 단가 계산 후 SELF_CHECK에 기록할 것
- **Rate Limit**: 기존 `ai` 레벨 (시간당 5회) 적용. 주간 자동 생성도 동일 제한

### UI
- **자동 생성 중 페이지 이탈**: 백그라운드 fetch이므로 중단됨. 다음 방문 시 재시도
- **에러 시**: 토스트로 에러 표시, 다음 방문 시 재시도. 연속 실패 제한 없음 (Rate Limit이 방어)
- **리포트 목록 빈 상태**: 주간/월간 각각 빈 상태 메시지

## 테스트 케이스
1. 주간 리포트 미존재 + 이번 주 closed trade 3건 → 분석 페이지 진입 시 자동 생성 시작
2. 주간 리포트 3일 전 생성됨 → 자동 생성 스킵
3. 주간 리포트 8일 전 생성 + 이번 주 closed trade 0건 → 자동 생성 스킵
4. 동일 주 리포트 중복 생성 시도 → DB UNIQUE 에러 → 정상 처리 (upsert)
5. Rate Limit 초과 시 → 429 에러 → 토스트 표시
6. 기존 월간 리포트 생성 플로우 → `periodType: 'monthly'` 기본값으로 기존 동작 유지
7. AI 리포트 페이지에서 주간/월간 리포트 분리 표시
8. 마이그레이션 후 기존 `monthly_reports` 데이터 → `period_type='monthly'`, `week=null` 유지

## 관련 기존 파일 (패턴 참조용)
- `src/app/api/report/generate/route.ts` — Gemini 호출, Rate Limit, upsert 패턴. 이 파일에 `periodType` 분기 추가
- `src/lib/api/ai-report.ts` — `getLatestReport`, `getReportByMonth` 패턴. 주간 버전 추가
- `src/lib/api/reports.ts` — `getReports`, `getReportById` 패턴
- `src/lib/api/client-api.ts:427-437` — `fetchReports`, `fetchReportById` 패턴
- `src/lib/api/rate-limit.ts:85-94` — `RATE_LIMITS` 정의
- `src/app/(main)/analysis/report/page.tsx` — AI 리포트 페이지 구조
- `src/app/(main)/analysis/page.tsx` — 분석 페이지 (자동 체크 훅 추가 위치)
- `supabase/migrations/004_monthly_reports.sql` — 기존 테이블 DDL
- `src/types/ai-report.ts` — `AIReportData`, `AIReportKPIs` 타입 정의

## Phase 2 참고 (이번 미구현)
- `period_type = 'yearly'` — 스키마에 CHECK 제약으로 미리 허용. 구현은 별도 SPEC
- 리포트 비교 뷰 (주간 vs 주간) — 별도 SPEC
