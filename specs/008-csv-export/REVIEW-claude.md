# REVIEW-claude — SPEC-008 csv-export

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
- [Low] `src/lib/csv-export.ts:44` — `Number(trade.pnl) / Number(trade.margin)` — `Trade` 타입(`src/types/index.ts:25,27`)이 이미 `number | null`이라 `Number()` 변환 불필요. 다른 lib 코드(예: `src/lib/calc.ts`)는 직접 산술. 일관성 차원 Low.
- [Low] SPEC §3.F2는 "`useTradeStore`에서 `trades` 구독"을 명시하나 구현은 `src/app/(main)/settings/page.tsx:96`에서 이미 사용 중이던 `useTrades()` 훅의 `trades`를 재사용. 기능 동치(훅이 store 래퍼)이며 신규 import 추가가 줄어 더 간결. SPEC 문구와 정확히 일치하지 않는다는 점만 기록.

## 8. 디자인 토큰
- 해당 없음 (UI 변경 없음, Button 마크업 그대로 onClick만 교체 — `settings/page.tsx:1335-1348`)

## 추가 관찰 (Medium — 수정은 다음 PR)
- [Medium] `src/lib/csv-export.ts:42-45` `pnlPct` — `trade.margin`이 0/falsy면 빈 문자열 반환, 의도된 동작이지만 `pnl !== 0 && margin === 0` 같은 비정상 데이터에서도 조용히 빈칸. SPEC §5의 손익률 계산 경계 케이스로 명시적 코멘트가 있으면 명료. Low로도 분류 가능.
- [Medium] `src/lib/csv-export.ts:79-89` `downloadCsv` — `URL.revokeObjectURL(url)`이 `a.click()` 직후 동기 호출. 모던 브라우저는 안전하지만 Safari iOS의 일부 케이스에서 다운로드 트리거가 비동기로 완료되면서 빈 파일이 저장된 보고가 있음. `setTimeout(() => URL.revokeObjectURL(url), 0)` 또는 마이크로태스크 지연이 더 안전. Acceptance Criteria 매크로(데스크톱 Excel)에는 영향 없으므로 Medium.

## 종합 판정
Approve

## 롤백
- 해당 없음 (DB/마이그레이션/인프라 변경 없음, SPEC §7대로 2 파일 revert로 복구)

Verdict: Approve
