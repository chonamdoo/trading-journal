# SPEC-001: UX 리디자인 v2 (사이드바 + 감정태그 + 요약바 + 인라인상세 + 명언)

## 목적
거래 일지의 데스크탑 레이아웃을 사이드바 기반으로 전환하고, 감정 태그/요약 바/인라인 상세/동기부여 명언 4가지 UX 개선을 추가하여 트레이더의 기록 효율과 자기 분석 경험을 높인다.

## 완료 조건
- [ ] 기능 1: lg: 이상에서 좌측 사이드바(축소/확장 토글), lg: 미만에서 하단 BottomNav
- [ ] 기능 2: trades 테이블에 emotion 컬럼 추가 + TradeForm 감정 칩 + TradeTable 감정 표시 + 분석 감정별 승률 차트
- [ ] 기능 3: 거래 내역 하단 sticky 요약 바 (순손익/승률/평균R배수/거래수)
- [ ] 기능 4: 거래 행 클릭 시 인라인 아코디언 펼침 (모달 제거)
- [ ] 기능 5: TradeForm 하단 트레이딩 명언 랜덤 배너
- [ ] 기존 기능 깨뜨리지 않음 (빌드/타입체크/린트 통과)
- [ ] 모바일 반응형 정상 동작

---

## 기능 1: 데스크탑 사이드바 (반응형)

### 현재 상태
- `AppShell.tsx` (line 40): `max-w-[960px] mx-auto` 단일 컬럼
- `NavTabs.tsx`: `hidden md:flex` 데스크탑 상단 탭 (6개 탭, `NAV_TABS` 상수 사용)
- `BottomNav.tsx`: `md:hidden` 모바일 하단 탭 (자체 `BOTTOM_TABS` 상수, lucide 아이콘 포함)

### 변경 사항

**브레이크포인트 변경**: `md:` (768px) → `lg:` (1024px) 기준
- lg: 이상 → 사이드바
- lg: 미만 → 하단 BottomNav (기존 `md:hidden` → `lg:hidden`으로 변경)

**Sidebar.tsx 신규 생성**:
- 클래스: `hidden lg:flex` (lg 미만에서 숨김)
- 축소형 (기본): width 60px, 아이콘만 표시
- 확장형 (토글): width 200px, 아이콘 + 라벨
- 토글 상태: `localStorage`에 저장 (`sidebar-expanded`)
- 탭 데이터: `NAV_TABS` + lucide 아이콘 (BottomNav의 아이콘 재사용)
- 활성 탭 판별 로직: NavTabs의 `getIsActive` 패턴 그대로
- 클라이언트 사이드 전환: NavTabs의 `handleClick` 패턴 (pushState + router.replace)
- 토글 버튼: 사이드바 하단, ChevronLeft/ChevronRight 아이콘
- 상단: 로고/앱 이름 ("거래일지"), 확장형에서만 텍스트 표시

**AppShell.tsx 수정**:
- `max-w-[960px] mx-auto` 제거
- 최상위 div → `flex` row 레이아웃
- `<Sidebar />` + `<div className="flex-1 min-w-0">` (콘텐츠 영역)
- 콘텐츠 영역 내부: 헤더 + 메인 + 토스트 (기존 구조 유지)
- 콘텐츠 패딩: `px-sp-9 pt-sp-10` 유지, `max-w-[1200px] mx-auto` 추가 (넓은 화면 가독성)
- `pb-24 md:pb-8` → `pb-24 lg:pb-8` (BottomNav 브레이크포인트 변경 반영)

**NavTabs.tsx 삭제**:
- 사이드바가 완전 대체. import/참조도 제거.

**BottomNav.tsx 수정**:
- `md:hidden` → `lg:hidden`

### 데이터/API 계약
- DB 변경 없음
- `NAV_TABS` 상수에 `icon` 필드 추가 필요 (또는 Sidebar에서 별도 매핑)

### 엣지 케이스
- lg 경계에서 리사이즈 시 사이드바/BottomNav 전환이 깜빡이지 않을 것 (CSS only, JS 미개입)
- 사이드바 축소→확장 시 콘텐츠 영역이 자연스럽게 줄어들 것 (transition width)
- 확장형 사이드바에서 라벨이 길면 `truncate` 처리

---

## 기능 2: 감정 태그 시스템

### DB 변경 (마이그레이션 필수)

```sql
-- supabase/migrations/YYYYMMDDHHMMSS_add_emotion_column.sql
ALTER TABLE trades ADD COLUMN emotion TEXT DEFAULT NULL;
-- CHECK 제약: 허용 값만
ALTER TABLE trades ADD CONSTRAINT trades_emotion_check
  CHECK (emotion IS NULL OR emotion IN ('calm', 'confident', 'fomo', 'revenge', 'anxious'));
```

trades 기존 RLS 정책은 그대로 적용 (emotion은 단순 텍스트 컬럼, trades의 SELECT/INSERT/UPDATE/DELETE 정책이 이미 `auth.uid() = user_id` 로 보호됨).

### 타입 변경

**`src/lib/supabase/types.ts`**:
- `TradeRow`에 `emotion: string | null` 추가
- `TradeInsert`에 `emotion?: string | null` 추가
- `TradeUpdate`에 `emotion?: string | null` 추가

**`src/types/index.ts`**:
- `Emotion` 타입 추가: `'calm' | 'confident' | 'fomo' | 'revenge' | 'anxious'`
- `Trade` 인터페이스에 `emotion?: Emotion | null` 추가
- `TradeFormData`에 `emotion?: Emotion | null` 추가

### 감정 상수 정의

`src/lib/constants.ts`에 추가:

```typescript
export const EMOTIONS = [
  { id: 'calm', label: '침착', color: 'text-info', bgColor: 'bg-info-soft' },
  { id: 'confident', label: '확신', color: 'text-profit', bgColor: 'bg-profit-bg' },
  { id: 'fomo', label: 'FOMO', color: 'text-warning', bgColor: 'bg-warning-bg' },
  { id: 'revenge', label: '복수매매', color: 'text-loss', bgColor: 'bg-loss-bg' },
  { id: 'anxious', label: '불안', color: 'text-content-muted', bgColor: 'bg-surface-muted' },
] as const
```

### TradeForm.tsx 수정
- 코인/방향 선택 영역 다음, 레버리지 전에 감정 칩 5개 삽입
- UI: pill 형태 (`rounded-full px-3 py-1.5 text-[12px] font-semibold border transition-all`)
- 선택 시: 해당 감정의 `color` + `bgColor` + `border-{color}` 적용
- 미선택 시: `border-border-input bg-surface text-content-secondary`
- 선택 해제 가능 (같은 칩 다시 클릭)
- `handleSave`에서 `emotion` 필드를 `data`에 포함

### TradeTable.tsx 수정
- 테이블 헤더에 "감정" 컬럼 추가 (코인과 방향 사이, 또는 수익률 뒤)
- 각 행에 감정 칩 표시: `EMOTIONS` 상수에서 매칭하여 색상 적용
- emotion이 null이면 `—` 표시

### 분석 페이지 — 감정별 승률 차트
- `SlideCarousel`(`src/components/analysis/SlideCarousel.tsx`)에 새 슬라이드 1개 추가
- 차트: Recharts `BarChart` (가로 바), X축=감정 라벨, Y축=승률(%)
- 각 바에 거래 수 라벨 표시
- 데이터 계산: closed trades를 emotion별로 그룹화 → win count / total count
- emotion이 null인 거래는 "미설정" 그룹으로

### 엣지 케이스
- 기존 거래 데이터는 emotion=NULL → TradeTable에서 정상 표시 (빈 칩/대시)
- 감정 미선택 상태로 저장 가능 (optional)
- 분석 차트: 거래가 0건인 감정은 바 표시하되 0%로

---

## 기능 3: 거래 내역 하단 요약 바

### 신규 컴포넌트: `src/components/trades/TradeSummaryBar.tsx`

Props:
```typescript
interface TradeSummaryBarProps {
  trades: Trade[]  // 필터 적용된 거래 목록
}
```

표시 항목 (4개):
1. **총 순손익**: `trades`의 `pnl` 합계 (closed만), `font-mono`, `pnlColorClass` 적용
2. **승률**: win(pnl>0) / total(closed) * 100, `font-mono`
3. **평균 R배수**: 평균 (pnl / margin), `font-mono`
4. **거래 수**: `filteredTrades.length`, `font-mono`

UI:
- `sticky bottom-0` (데스크탑), 모바일에서는 `bottom-16` (BottomNav 높이 64px 위)
- lg: 이상에서는 `bottom-0` (사이드바 레이아웃이라 BottomNav 없음)
- `bg-surface/95 backdrop-blur-md border-t border-border`
- 4개 항목 `flex justify-around` 또는 `grid grid-cols-4`
- 각 항목: 라벨 (`text-[11px] text-content-muted uppercase`) + 값 (`text-sm font-mono font-semibold`)

### trades/page.tsx 수정
- `TradeSummaryBar`를 `TradeTable` 아래에 배치
- `filteredTrades`를 props로 전달

**문제**: 현재 `filteredTrades`는 `TradeTable` 내부에서 계산됨. 필터 상태를 상위로 끌어올리거나, TradeTable에서 필터된 결과를 콜백으로 반환해야 함.

**해결 방안**: `TradeTable`의 `filter` 상태와 필터 로직을 `trades/page.tsx`로 끌어올리기. `TradeTable`은 이미 필터된 `filteredTrades`를 받도록 변경. 필터 UI 컴포넌트도 분리 가능.

### 엣지 케이스
- 거래 0건: 요약 바 숨김 또는 "—" 표시
- 모든 거래가 open: 승률/R배수 "—"
- 필터 변경 시 즉시 갱신

---

## 기능 4: 인라인 상세 펼침 (아코디언)

### 현재 상태
- `TradeTable.tsx` (line 177): 행 클릭 → `setDetailTrade(t)` → `TradeDetailModal` 모달
- `TradeDetailModal.tsx`: 별도 모달 컴포넌트 (스크린샷, 메모, 상세, 수정/삭제 버튼)

### 변경 사항

**TradeTable.tsx 수정**:
- `detailTrade` 상태 → `expandedTradeId: string | null` 로 변경
- 행 클릭 시: 같은 행이면 닫기, 다른 행이면 해당 행 펼침
- 한 번에 1개만 펼침
- 펼침 행 바로 아래에 `<tr>` 추가 (`colSpan` 전체)

**인라인 상세 영역 (펼침 내용)**:
- 스크린샷 (있으면): 썸네일 가로 나열
- 매매 메모 (`reason`, `notes`): 있으면 표시
- 진입/청산 상세: 진입일시, 청산일시, 손절가, 보유기간
- 분할 청산/추가진입 (tradeCloses, tradeScaleIns)
- 감정 태그 (기능 2 연동)
- **수정/삭제 버튼**: 현재 테이블 행 끝의 버튼을 펼침 영역 하단으로 이동

**기존 테이블 행의 수정/삭제 버튼 제거** → 펼침 영역에서만 접근

**TradeDetailModal 관련**:
- `TradeDetailModal` import/렌더링은 제거
- 모달 삭제 확인은 유지 (deleteId + Modal)

**데이터 로딩**:
- 펼침 시 `onLoadScreenshots`, `onLoadTradeCloses`, `onLoadTradeScaleIns` 호출 (기존 TradeDetailModal과 동일한 lazy loading 패턴)

### UI 스타일
- 펼침 영역: `bg-surface-hover border-b border-border` 또는 `bg-bg-secondary`
- 패딩: `p-sp-8`
- 전환 애니메이션: `max-height` transition 또는 CSS `grid-template-rows: 0fr → 1fr`
- 펼침 행은 hover 배경색 변경 (구분)

### 엣지 케이스
- 스크린샷/메모/분할청산이 모두 없는 거래: 최소 진입/청산 정보만 표시
- 펼침 상태에서 필터 변경 시: 펼침 닫힘
- 펼침 상태에서 삭제 → 모달 확인 → 삭제 후 펼침 초기화
- 모바일: 테이블 가로 스크롤 시 펼침 영역도 동일 너비

---

## 기능 5: 동기부여 명언 배너

### 신규 컴포넌트: `src/components/trades/MotivationBanner.tsx`

```typescript
// 클라이언트 컴포넌트 ('use client')
// 명언 배열 (10~15개)
const QUOTES = [
  '계획에 따라 매매하고, 매매에 따라 계획하라.',
  '시장은 당신의 감정을 먹고 산다.',
  '손절은 비용이 아니라 보험료다.',
  '수익은 인내의 보상이다.',
  '과거의 거래에서 배우되, 집착하지 마라.',
  '포지션 크기를 줄이면 멘탈이 편해진다.',
  '시장을 이기려 하지 말고, 시장에 순응하라.',
  '최고의 거래는 하지 않는 거래일 수 있다.',
  '일관성이 수익률을 만든다.',
  '리스크 관리는 기술이 아니라 습관이다.',
  '좋은 트레이더는 손실을 잘 관리하는 사람이다.',
  '하루의 목표를 정하고, 달성하면 멈춰라.',
] as const
```

UI:
- TradeForm 카드 하단 (저장 버튼 아래, Card 밖)
- `bg-surface-hover border border-border rounded-card p-sp-6`
- 좌측 아이콘: `Lightbulb` (lucide) `text-warning`
- 텍스트: `text-[13px] text-content-secondary italic`
- 새로고침마다 다른 명언: `Math.random()` 기반 선택 (useState 초기값)

### 배치
- `src/app/(main)/trades/new/page.tsx`에서 `TradeForm` 아래에 렌더링
- 또는 `TradeForm.tsx` 내부 하단에 포함 (Card 밖)

### 엣지 케이스
- 수정 모드(`isEdit`)에서는 표시하지 않음 (신규 입력 전용)
- SSR/hydration 불일치 방지: `useEffect`로 클라이언트에서만 랜덤 인덱스 설정

---

## 파일 변경 총괄

| 경로 | 작업 | 비고 |
|------|------|------|
| `src/components/layout/Sidebar.tsx` | 신규 | 데스크탑 사이드바 |
| `src/components/layout/AppShell.tsx` | 수정 | flex row 레이아웃, max-w 제거, Sidebar 추가 |
| `src/components/layout/NavTabs.tsx` | 삭제 | Sidebar로 대체 |
| `src/components/layout/BottomNav.tsx` | 수정 | md:hidden → lg:hidden |
| `src/lib/constants.ts` | 수정 | NAV_TABS에 icon 추가, EMOTIONS 상수 추가 |
| `supabase/migrations/YYYYMMDDHHMMSS_add_emotion_column.sql` | 신규 | emotion 컬럼 + CHECK 제약 |
| `src/lib/supabase/types.ts` | 수정 | TradeRow/Insert/Update에 emotion 추가 |
| `src/types/index.ts` | 수정 | Emotion 타입, Trade/TradeFormData에 emotion 추가 |
| `src/components/trades/TradeForm.tsx` | 수정 | 감정 칩 UI 추가, emotion 저장 |
| `src/components/trades/TradeTable.tsx` | 수정 | 감정 컬럼 추가, 인라인 아코디언으로 전환, 수정/삭제 버튼 이동 |
| `src/components/trades/TradeSummaryBar.tsx` | 신규 | sticky 요약 바 |
| `src/components/trades/MotivationBanner.tsx` | 신규 | 명언 배너 |
| `src/app/(main)/trades/page.tsx` | 수정 | 필터 상태 상위 이동, TradeSummaryBar 추가 |
| `src/app/(main)/trades/new/page.tsx` | 수정 | MotivationBanner 추가 |
| `src/components/analysis/SlideCarousel.tsx` 사용처 | 수정 | 감정별 승률 슬라이드 추가 (분석 페이지) |
| `src/app/(main)/analysis/page.tsx` | 수정 | 감정별 승률 슬라이드 데이터 계산/전달 |

---

## 데이터/API 계약

### DB 변경
```
trades.emotion TEXT NULL CHECK (emotion IN ('calm','confident','fomo','revenge','anxious'))
```
기존 RLS 정책 변경 없음.

### 타입 시그니처 추가
```typescript
type Emotion = 'calm' | 'confident' | 'fomo' | 'revenge' | 'anxious'

// Trade 인터페이스에 추가
emotion?: Emotion | null

// TradeFormData에 추가
emotion?: Emotion | null
```

### API 함수
기존 `createTrade`, `updateTrade` 함수는 trades 테이블 전체 INSERT/UPDATE이므로 emotion 필드가 자동 포함됨. 별도 API 변경 불필요.

---

## 의존성
- 패키지 추가 없음 (lucide-react, recharts 기존 사용)
- 환경변수 추가 없음

---

## 엣지 케이스 (공통)
- 다크 모드: 모든 신규 컴포넌트가 시맨틱 토큰만 사용하여 자동 대응
- 반응형: lg 브레이크포인트 전환 시 사이드바↔BottomNav 동시 표시 방지 (CSS only)
- 기존 거래 데이터: emotion=NULL, 인라인 펼침/요약 바에서 정상 처리
- 빈 상태: 거래 0건 시 요약 바 숨김, 감정 차트 "데이터 없음" 표시

---

## 테스트 케이스

1. **사이드바 토글**: lg 화면에서 축소→확장 토글, 콘텐츠 영역 리사이즈 확인
2. **브레이크포인트 전환**: 1024px 경계에서 사이드바↔BottomNav 전환 확인
3. **감정 칩 선택**: TradeForm에서 감정 선택/해제, 저장 후 DB 확인
4. **감정 표시**: TradeTable에서 감정 칩 정상 렌더링 (null 포함)
5. **요약 바 갱신**: 필터 변경 시 요약 값 즉시 갱신
6. **요약 바 위치**: 모바일에서 BottomNav 위, 데스크탑에서 콘텐츠 하단
7. **인라인 펼침**: 행 클릭 → 펼침, 다른 행 클릭 → 이전 닫힘 + 새로 펼침
8. **인라인 데이터**: 펼침 시 스크린샷/분할청산 lazy loading 정상
9. **인라인 삭제**: 펼침 내 삭제 버튼 → 모달 확인 → 삭제 후 목록 갱신
10. **명언 랜덤**: 새로고침마다 다른 명언, hydration mismatch 없음
11. **명언 미표시**: 수정 모드에서 명언 배너 숨김
12. **감정별 승률**: 분석 페이지 캐러셀에 새 슬라이드 표시, 바차트 정상

---

## 관련 기존 파일 (패턴 참조용)

- `src/components/layout/BottomNav.tsx` — 탭 아이콘 매핑, 클라이언트 사이드 전환 패턴
- `src/components/layout/NavTabs.tsx` — getIsActive 판별, pushState + router.replace 패턴
- `src/components/layout/AppShell.tsx` — 전체 레이아웃 구조, useDataLoader 패턴
- `src/components/trades/TradeForm.tsx` — 폼 상태 관리, 칩 선택 UI (direction toggle 참조)
- `src/components/trades/TradeTable.tsx` — 테이블 구조, 필터 로직, 모달 연동
- `src/components/trades/TradeDetailModal.tsx` — 상세 표시 내용 (인라인으로 이전할 내용)
- `src/components/analysis/SlideCarousel.tsx` — 캐러셀 SlideItem 구조
- `src/lib/constants.ts` — NAV_TABS 상수 구조
- `tailwind.config.ts` — 디자인 토큰 (spacing, colors, borderRadius)
