# REVIEW-gemini — SPEC-012 AI 리포트

## 1. 프로젝트 구조
- [Low] `src/components/analysis/AIReportSection.tsx:32` — `weekOfMonth` 유틸리티 함수가 UI 컴포넌트 파일 내부에 위치해 있어 재사용성이 떨어집니다. `lib/format.ts` 등의 파일로 분리해야 합니다.

## 2. 아키텍처
- (none)

## 3. 함수 비대함
- [Critical] `src/app/api/report/generate/route.ts:21` — `POST` 단일 함수가 약 500줄에 달하며, 순수 로직의 길이가 지나치게 길어 유지보수가 어렵습니다.

## 4. 죽은 코드
- (none)

## 5. 단일 책임 위반
- [Medium] `src/app/api/report/generate/route.ts:21` — `POST` 핸들러가 인증/권한 검사, Rate Limit, 복잡한 통계 계산, AI 프롬프트 생성, 외부 API 호출, DB 저장을 모두 혼합하여 단일 책임을 위반하고 있습니다.

## 6. 보안
- (none)

## 7. 프로젝트 컨벤션
- [Critical] `src/app/api/report/generate/route.ts:60` — Route Handler 내에서 사용자 입력을 파싱할 때 Zod 검증을 생략하고 `body as { ... }` 형태의 타입 단언을 사용했습니다.
- [Medium] `src/components/analysis/AIReportSection.tsx:59` — 컴포넌트가 Zustand 스토어를 거치지 않고 `fetchReports()`(`client-api.ts`)를 직접 호출했습니다.
- [Low] `src/app/api/report/generate/route.ts:30` — 에러 발생 시 `NextResponse.json({ error: ... })`을 반환하여 프로젝트의 `ApiResult<T>` 반환 패턴을 위반했습니다.

## 8. 디자인 토큰
- 해당 없음

## 종합 판정
Request Changes

## 롤백 (destructive 변경 시 필수)
- 해당 없음
