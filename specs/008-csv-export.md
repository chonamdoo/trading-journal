# SPEC-008: CSV 내보내기 — 거래 기록 다운로드

생성일: 2026-04-27
Tier: M (2 파일 신규/변경, <120줄, 단일 기능, 외부 의존성 無, read-only)
상태: in-progress

---

## 1. 배경

`src/app/(main)/settings/page.tsx:1326-1341` "CSV 내보내기" 버튼이 클릭 시 `showToast('info', '준비 중입니다.')`만 호출. 실제 다운로드 로직 없음.

## 2. 목표

사용자가 자신의 거래 기록 전체를 한 번에 CSV 파일로 다운로드할 수 있게 한다. Excel 한글 깨짐 방지(UTF-8 BOM), 한국어 헤더, RFC 4180 호환 quoting.

## 3. 변경 범위

### F1. `src/lib/csv-export.ts` (신규)
거래 배열 → CSV 문자열 변환 유틸 1개 + 다운로드 트리거 1개.

```
columnsKo = [
  일자, 진입시각, 청산시각, 코인, 방향, 레버리지,
  진입가, 청산가, 손절가, 증거금USDT, 상태,
  손익USDT, 손익률%, 진입이유, 메모, 복기태그, 거래소
]
```

- `tradesToCsv(trades: Trade[]): string` — UTF-8 BOM(`﻿`) 시작, RFC 4180 quoting (`"`, `,`, `\n` 포함 셀은 `"..."` 감싸고 내부 `"`는 `""`로 escape)
- `direction` → `LONG=롱, SHORT=숏`. `status` → `open=오픈, closed=청산`. `tags`는 `|` 구분
- 손익률% — pnl이 있으면 `(pnl / margin) * 100` 소수 2자리. 없으면 빈 문자열
- `downloadCsv(filename: string, csv: string): void` — Blob + `URL.createObjectURL` + `<a download>` 클릭 후 revoke

### F2. `src/app/(main)/settings/page.tsx`
- 데이터 관리 섹션의 "CSV 내보내기" 버튼 onClick 교체:
  - `useTradeStore`에서 `trades` 구독
  - `trades.length === 0`이면 `showToast('error', '내보낼 거래 기록이 없습니다.')`
  - 그 외에는 `downloadCsv(\`trades_\${YYYY-MM-DD}.csv\`, tradesToCsv(trades))` + 성공 토스트

### F3. `specs/INDEX.md` 업데이트

## 4. 비범위

- 분할 청산(`trade_closes`) / 추가 진입(`trade_scale_ins`) 별도 시트 — 단일 row 요약만
- 거래소별 임포트 호환 포맷 (Binance/Bybit reimport)
- 컬럼 선택 / 기간 필터 UI
- 서버 사이드 export — `useTradeStore`에 이미 전체 trades 로드되어 있어 클라이언트 충분
- 스크린샷 / 입금 / 목표 export

## 5. Acceptance Criteria

- [ ] "CSV 내보내기" 클릭 시 `trades_2026-04-27.csv` 파일이 다운로드됨
- [ ] Excel for Mac / Windows에서 한글 깨짐 없이 열림 (UTF-8 BOM 동작)
- [ ] `notes`에 콤마/줄바꿈/큰따옴표가 있어도 CSV 파싱 깨지지 않음 (RFC 4180)
- [ ] `direction`, `status`가 한국어로 표시됨
- [ ] 거래 0건 시 "내보낼 거래 기록이 없습니다" 에러 토스트
- [ ] TYPECHECK / BUILD PASS

## 6. 보안 / 컨벤션 체크

- 클라이언트→Supabase 직접 호출 없음 (이미 store에 로드된 데이터 사용)
- 외부 API / 시크릿 / RLS 영향 없음 (read-only, 본인 데이터만)
- 새 의존성 추가 없음 (Blob/URL.createObjectURL은 브라우저 표준)
- 디자인 토큰 — 버튼 onClick만 변경, UI 변경 없음

## 7. 롤백

- DB 영향 없음. 2개 코드 파일 revert로 즉시 복구
- 다운로드된 파일은 사용자 디스크에만 존재 — 시스템 영향 0

## 8. 리뷰 (2-CLI)

- `specs/008-csv-export/REVIEW-gemini.md`
- `specs/008-csv-export/REVIEW-claude.md`
- `specs/008-csv-export/REVIEW-summary.md`
