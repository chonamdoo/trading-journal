# REVIEW-gemini — SPEC-011 데이터 초기화

## 1. 프로젝트 구조
- (none)

## 2. 아키텍처
- (none)

## 3. 함수 비대함
- [Medium] `src/app/(main)/settings/page.tsx:88` — `SettingsPage` 컴포넌트가 800줄 이상으로 지나치게 방대함. 교환소 연결, 목표 자산 관리, 데이터 초기화 모달 등의 상태와 UI가 한 곳에 집중되어 있어 하위 컴포넌트로의 분리가 권장됨.

## 4. 죽은 코드
- (none)

## 5. 단일 책임 위반
- [Low] `src/app/api/reset/route.ts:52` — Route Handler 안에서 DB RPC 호출과 Storage Chunk 제거 반복문이 함께 작성됨. Storage 청소 로직을 별도의 유틸 함수로 추출하면 책임 분리에 유리함.

## 6. 보안
- (none)

## 7. 프로젝트 컨벤션
- (none)

## 8. 디자인 토큰 (UI 변경 없으면 "해당 없음")
- (none)

## 종합 판정
Approve

## 롤백 (destructive 변경 시 필수)
- 코드 원복 및 `DROP FUNCTION reset_user_data`로 기능 롤백을 수행하되, 이미 삭제된 사용자의 데이터는 DB 복구(PITR)를 통해서만 복구 가능.
