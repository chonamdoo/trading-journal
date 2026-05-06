# SPEC-003: 프리트레이드 체크리스트 + 마켓 인사이트

생성일: 2026-04-11
상태: completed

완료일: 2026-05-06

구현 근거:
- Market Insight API Boundary: PR #15
- Pre-trade Checklist UI: PR #16

## 기능 1: 프리트레이드 체크리스트

- `TradeForm.tsx` 저장 버튼 위에 3개 체크박스 섹션 추가
- 신규 입력 전용 (`isEdit === false`일 때만 표시)
- 미완료 항목 있어도 저장 가능 — warning toast만 표시
- 저장/초기화 시 체크 상태 리셋
- DB 저장 없음 (UI only)

### 체크 항목
1. 손절가(SL)를 설정했는가?
2. 총 자산의 2% 이내의 리스크인가?
3. 추격 매수가 아닌가?

## 기능 2: LIVE 마켓 인사이트

### 백엔드 프록시
- `src/app/api/market/insight/route.ts` — GET 엔드포인트
- 인증 불필요, IP Rate Limit (분당 30회)
- 인메모리 캐시 5분
- CoinGecko(글로벌 + BTC) + Alternative.me(Fear & Greed) 3개 API 병렬 호출
- stale 캐시 fallback, 502 graceful error

### 미들웨어
- `src/lib/supabase/middleware.ts` — `/api/market/` 경로 skip 추가

### 클라이언트
- `src/lib/api/client-api.ts` — `fetchMarketInsight()` 함수 추가
- `MarketInsight` 타입 export

### UI
- `TradeSidePanel.tsx` — 마켓 인사이트 섹션 추가
  - BTC 가격 + 24h 변화율
  - BTC 도미넌스
  - Fear & Greed (0-24: text-loss, 25-49: text-warning, 50+: text-profit)
  - 로딩 중: `-` 표시
  - 에러 시 섹션 미표시 (graceful degradation)

## 변경 파일
| 파일 | 변경 |
|------|------|
| `src/app/api/market/insight/route.ts` | 신규 생성 |
| `src/lib/supabase/middleware.ts` | `/api/market/` skip 추가 |
| `src/lib/api/client-api.ts` | `fetchMarketInsight` + `MarketInsight` 타입 추가 |
| `src/components/trades/TradeForm.tsx` | 체크리스트 섹션 추가 |
| `src/components/trades/TradeSidePanel.tsx` | 마켓 인사이트 섹션 추가 |
