# REVIEW-gemini — SPEC-008 CSV 내보내기

## 1. 프로젝트 구조
- (none)

## 2. 아키텍처
- (none)

## 3. 함수 비대함
- (none)

## 4. 죽은 코드
- (none)

## 5. 단일 책임 위반
- (none)

## 6. 보안
- (none)

## 7. 프로젝트 컨벤션
- [Medium] `src/lib/csv-export.ts:25` — `((Number(trade.pnl) / Number(trade.margin)) * 100).toFixed(2)`: `parseNumeric` 미사용으로 NUMERIC 필드 처리 시 내장 `Number` 함수가 직접 사용되었습니다.

## 8. 디자인 토큰 (UI 변경 없으면 "해당 없음")
- (none)

## 종합 판정
Approve

## 롤백 (destructive 변경 시 필수)
- (none)
