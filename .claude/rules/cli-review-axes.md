# CLI 리뷰 축 (gemini / claude 공통)

> **언제 적용**: 3-CLI 교차 리뷰 시 (`codex exec`, `gemini -p`, `claude -p`) 각 CLI에 동일하게 입력. 결과는 `specs/NNN-*/REVIEW-{codex,gemini,claude}.md` 3개 + `REVIEW-summary.md`로 저장.

---

## 리뷰 축 (이 8가지에만 집중. 그 외는 언급 금지)

1. **프로젝트 구조** — 디렉토리 분리가 역할별로 합당한가? 순환 참조 위험은?
2. **아키텍처** — 계층 경계가 지켜지는가? 추상화가 실제 쓰이는가 아니면 죽었는가?
3. **함수 비대함** — 단일 함수가 너무 긴 곳(>80줄 순수 로직 또는 cyclomatic complexity 높음)?
4. **죽은 코드** — 호출되지 않는 export, 미사용 타입, TODO 상태의 공허한 함수?
5. **단일 책임 위반** — 이름과 달리 2가지 이상 일을 섞은 함수 / 클래스?
6. **보안 (Vibecoding 3대)** — RLS 누락 / 권한 컬럼 user-editable / 비용 엔드포인트 Rate Limit 부재 / `NEXT_PUBLIC_*`에 시크릿 / 클라이언트→Supabase 직접 접근 / `getSession()` 서버 사용 / 거래소 API 키 평문 / `SECURITY DEFINER`에 `SET search_path=''` 누락.
7. **프로젝트 컨벤션** — `ApiResult<T>` 반환 패턴 위반 / 서버 액션·Route Handler에 Zod 검증 부재 / `getErrorMessage` 중복 정의 / `parseNumeric` 미사용으로 NUMERIC 필드 문자열 누수 / Zustand 스토어 거치지 않고 컴포넌트가 `client-api.ts` 직접 호출.
8. **디자인 토큰 위반** (UI 변경 시에만) — 임의 hex (`bg-[#xxx]`) / `text-gray-*`·`text-zinc-*` / `rounded-{lg,md,2xl,3xl}` / 금액·%·날짜에 `font-sans` / 1px 실선 보더로 구역 분리 / KPI 값에 표준 Tailwind 크기.

---

## 출력 규격 (반드시 준수)

- **추론·일반론·서론 금지**. 구체 파일 경로 + 라인 번호 + 인용.
- 각 축당 Critical 최대 2건 + Medium 최대 3건 + Low 최대 2건.
- 등급 정의: Critical=즉시 조치, Medium=다음 PR, Low=기록용.
- 보안 축의 HIGH(=Vibecoding 3대 중 하나라도 위반) → 무조건 Critical로 승격.
- destructive 변경 (DELETE / DROP / TRUNCATE / 마이그레이션) 포함 시 → 롤백 절차 1줄 명시 강제.
- 확인 불가 항목은 "확인 불가 — 이유 명시"로 적고 억지로 채우지 말 것.
- 총 출력 600단어 이내.

---

## 출력 템플릿

```markdown
# REVIEW-{codex|gemini|claude} — SPEC-NNN {feature}

## 1. 프로젝트 구조
- [Critical|Medium|Low] `path/file.ts:LL` — 인용 + 1줄 지적

## 2. 아키텍처
- ...

## 3. 함수 비대함
- ...

## 4. 죽은 코드
- ...

## 5. 단일 책임 위반
- ...

## 6. 보안
- ...

## 7. 프로젝트 컨벤션
- ...

## 8. 디자인 토큰 (UI 변경 없으면 "해당 없음")
- ...

## 종합 판정
{Approve | Request Changes}

## 롤백 (destructive 변경 시 필수)
- 1줄
```

---

## 금지

- 칭찬, 개선 제안 없는 관찰만 있는 코멘트
- "아마도" "보통" "일반적으로" 류 추측
- 실제 읽지 않은 파일에 대한 지적
- 리팩터 판타지 (actionable 없는 이상론)
- **MINOR 지적으로 Request Changes** — Critical/High만 Request Changes, Medium/Low는 Comment만 (`evaluation-criteria.md` SSOT)
- **다른 CLI의 리뷰 결과 참조 / 합의 시도** — codex·gemini·claude 각각 독립 컨텍스트로 평가. 동일 결론이 나오면 신호, 다르면 원본 차이로 합의는 사용자가 한다.
- 거래 손익 계산 로직(`calc.ts`)에 대해 코드 인용 없이 "정확성 검토 필요" 류 일반론

---

## 호출 예시 (각 CLI 비대화형 모드)

```bash
# 변경된 파일 목록 (예시)
FILES="src/app/(main)/onboarding/page.tsx src/lib/api/profile.ts"
SPEC=specs/007-onboarding-page.md
PROMPT_FILE=.claude/rules/cli-review-axes.md

# codex (codex-cli)
codex exec --skip-git-repo-check \
  "Read $PROMPT_FILE and $SPEC. Review files: $FILES. Output to specs/007-onboarding-page/REVIEW-codex.md"

# gemini
gemini -p "$(cat $PROMPT_FILE) --- SPEC: $(cat $SPEC) --- Files: $FILES" \
  > specs/007-onboarding-page/REVIEW-gemini.md

# claude (headless)
claude -p "$(cat $PROMPT_FILE)" \
  --append-system-prompt "Review SPEC + files; output to REVIEW-claude.md only" \
  > specs/007-onboarding-page/REVIEW-claude.md
```

3개 산출물이 모두 생성되면 메인 세션이 `REVIEW-summary.md`로 통합:
- 3개 모두 합의한 Critical → 무조건 채택
- 1~2개만 지적한 Critical → 사용자 판단
- Medium/Low → 통계만 + 채택/기각 표
