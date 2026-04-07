---
description: 리뷰/보안 감사 요약. Reviewer가 참조. 반복 패턴, 미해결 이슈.
globs: ""
---

# 리뷰 요약 (Reviewer 에이전트용)

> 원본: review-phase1.md, review-phase2.md, review-fe.md, review-server.md, security-audit.md

---

## 1. Phase 1 리뷰 (기획/디자인 교차 리뷰) -- 판정: 조건부 승인

**필수 수정 5건 (대부분 해결됨)**:
- 디자인 가이드 플랫폼/차트 라이브러리를 Next.js+Recharts로 업데이트 -> 해결
- 인증 페이지(로그인/회원가입/온보딩) 디자인 추가 -> 해결
- 설정 페이지에 계정관리/마이그레이션 UI 반영 -> 해결
- SHORT PnL 계산식 명시 -> 해결
- profiles DELETE 정책 결정 -> CASCADE 방식 채택

**미해결**: 로딩 스켈레톤 디자인, 폼 에러 메시지 패턴, P1 차트 디자인 스펙

---

## 2. Phase 2 리뷰 (분석/AI/거래소 PRD) -- 판정: 조건부 승인

**필수 수정 5건**:
- [필수-01] 등급 체계 3단계 vs 4단계 불일치 -> 4단계(GREAT/GOOD/AVERAGE/WATCH OUT)로 통일 필요
- [필수-02] 종합 스코어 메트릭/가중치가 PRD와 디자인 간 불일치
- [필수-03] fee 컬럼 추가 후 분석 로직에 fee_included_in_pnl 분기 미반영
- [필수-04] Supabase 무료 티어 제약 분석 부재
- [필수-05] API Key 암호화 키 로테이션/비상대응 절차 부재

**미해결**: 슬라이드 개수/라우팅 불일치(4개 vs 9개), 등급별 색상 코드 차이, AI 비용 추정치 누락

---

## 3. FE 코드 리뷰 -- 판정: 조건부 승인 (56파일, C:3 M:8 m:7)

**Critical**: (1) package.json에 supabase/zod 의존성 누락 -> 해결, (2) Fragment import 위치 -> 해결, (3) useTrades 전역 상태 미공유 -> Zustand 스토어로 해결
**Major**: Auth TODO 미연동(M-2), 루트 라우팅 불일치(M-3), dangerouslySetInnerHTML(M-4), 에쿼티커브 스택 오류(M-5), stale closure(M-6), 모달 포커스트래핑 미구현(M-7), reset-password PUBLIC_ROUTES 누락(M-8)
**양호**: 디자인 토큰 일치, ApiResult<T> 패턴, 타입 시스템, 다크모드, KPI 3단계, Critical 버그 3건 해결

---

## 4. 서버 코드 리뷰 -- 판정: 조건부 승인 (10파일, C:2 M:6 m:8)

**Critical**: (1) migrate_json_data SECURITY DEFINER search_path 미설정 -> 해결, (2) closeTrade Race Condition -> UPDATE에 status='open' 조건 추가로 해결
**Major**: trades exit_datetime/status 정합성 CHECK 부재, updated_at 트리거 누락, calculateTotalAsset N+1, getDepositTotal 클라이언트 합산, reorderTargets 비원자적, getAllClosedTrades limit 미적용
**양호**: RLS CRUD별 완전 설정, Zod 마이그레이션 검증, ApiResult 패턴 통일, 인덱스 전략 적절

---

## 5. 보안 감사 -- 종합 등급: B+

**High (2건)**: (1) OAuth 콜백 Open Redirect (next 파라미터 미검증) -> 해결, (2) .env.local.example에 실제 URL 노출 -> 해결
**Medium (6건)**: Rate Limiting 미적용, 비밀번호 정책 부족(6자->8자), CSRF 미적용, 보안 헤더 미설정, closeTrade TOCTOU, TS 빌드 에러 무시
**양호**: RLS 완전, getUser() 서버 검증, SQL injection 방지, 환경변수 관리, Zod 입력 검증

---

## 반복 패턴/공통 이슈

1. **정합성 불일치**: PRD vs 디자인 간 등급/가중치/색상/라우팅 차이 반복 발생
2. **클라이언트 사이드 합산**: DB 집계(SUM RPC)로 이관 필요한 곳 다수
3. **getErrorMessage 중복**: 6개 API 파일에 동일 함수 반복 -> 공통 유틸 추출 필요
4. **RLS INSERT 정책**: ai_usage_log, sync_logs에서 WITH CHECK(true) 과도 권한
5. **Supabase 무료 티어**: 모든 리뷰에서 반복 지적, 유료 전환 기준선 미정의

---

## 원본 참조 가이드

| 필요한 정보 | 참조 파일 |
|------------|----------|
| PRD-디자인 정합성 이슈 전체 | review-phase1.md (전체 135행) |
| 등급/가중치/슬라이드 불일치 상세 | review-phase2.md 1.1절 |
| FE Critical/Major 수정 방법 코드 | review-fe.md Critical/Major 각 항목 |
| 서버 SQL/API 수정 코드 | review-server.md 1~2절 |
| OWASP Top 10 체크리스트 | security-audit.md 하단 테이블 |
| 보안 수정 우선순위 + 공수 | security-audit.md 최하단 테이블 |
