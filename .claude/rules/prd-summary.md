---
description: PRD 3개 문서 요약. PM/Planner가 전체 PRD 대신 이것을 먼저 읽음. 상세 필요 시에만 원본 참조.
globs: ""
---

# PRD 요약

## 1. 기본 PRD (v1.1)
원본: `docs/trading-journal-prd.md` (553줄)

### 핵심 목적
암호화폐 선물 트레이더를 위한 웹 기반 거래 일지. Supabase + Next.js 풀스택.

### 주요 기능
- **인증**: Supabase Auth (이메일 + Google OAuth)
- **대시보드**: KPI 카드 8개, 자산 추이 차트, 오픈 포지션, 목표 트래커
- **거래 입력**: 코인/방향/레버리지/증거금/가격/이유/메모, 실시간 손익 미리보기
- **거래 내역**: 필터(코인/방향/결과/기간), 수정/삭제
- **분석**: 자산추이, 코인별 P&L, 기간별(일/주/월) 뷰
- **설정**: 프로필, 코인 관리, 목표, 입금, 데이터 가져오기/내보내기

### DB: profiles, trades, deposits, targets, custom_assets
### 구현: MVP 대부분 완료. P1 일부(AI 리포트, 플랜). P2 미구현.

---

## 2. v2 고급 분석 + AI 진단
원본: `docs/trading-journal-prd-v2-analysis.md` (1396줄)

### 핵심 목적
TradeZella 수준 고급 분석 대시보드 + AI 진단 기능 추가.

### 주요 기능
- **Performance** (3A): 요일별 P&L, 진입 시간대 분석
- **Trading Score** (3A): 6개 메트릭 기반 0~100 종합 스코어, 레이더 차트
- **Consistency** (3B): Essential/Advanced Stats, Equity Curve, Drawdown 등 7개 그래프
- **AI 분석** (3C): 전략 vs 실제 비교, 종합 리포트, 차트 이미지 분석(Vision)

### DB 추가: ai_analysis_cache, ai_usage_log, user_strategies
### 구현: AI 리포트 기본만 완료(Gemini). Score/Consistency/AI전략분석 미구현.

### 원본 필요 시: Score 메트릭 공식, calc.ts 함수 스펙, AI 프롬프트 템플릿

---

## 3. v2 거래소 API 연동
원본: `docs/trading-journal-prd-v2-exchange.md` (1961줄)

### 핵심 목적
8개 거래소 API 연동 + CSV 임포트로 수동 입력 제거.

### 주요 기능
- **API 연동**: Binance/Bybit/OKX/Bitget/BingX/MEXC/Gate.io/HTX
- **CSV 임포트**: 거래소별 자동 매핑 + 커스텀 매핑
- **동기화**: Full/Incremental/Re-sync/Auto Sync
- **보안**: API Key AES-256-GCM 암호화, Read-only 권한만

### DB 추가: exchange_connections, sync_logs, trades 확장(exchange, fee, source)
### 구현: 전체 미구현 (Phase 4)

### 원본 필요 시: 거래소별 API 엔드포인트/매핑, 암호화 흐름, CSV 파서 규칙
