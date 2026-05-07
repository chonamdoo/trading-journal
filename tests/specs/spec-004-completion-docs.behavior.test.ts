import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../..');
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');

describe('SPEC-004 completion docs', () => {
  it('marks AI report components complete with the current component boundary', () => {
    const spec = read('specs/004-ai-report-components-page.md');
    const selfCheck = read('specs/004-SELF_CHECK.md');
    const index = read('specs/INDEX.md');
    const tradeForm = read('src/components/trades/TradeForm.tsx');
    const emotionTag = read('src/components/ai-report/EmotionTag.tsx');
    const reportRoute = read('src/app/api/report/generate/route.ts');

    expect(index).toContain('| 004 | ai-report-components-page (P0 컴포넌트 6개 + AI Report 페이지) | completed |');
    expect(spec).toContain('## 구현 완료 근거');
    expect(selfCheck).not.toContain('stats 저장 로직 미구현');

    for (const criterion of [
      'Emotion Tag 컴포넌트 — TradeForm에서 이미 사용 중인 감정 태그를 design-tokens 스펙에 맞게 독립 컴포넌트로 추출',
      'Master Score Ring 컴포넌트 — SVG 원형 프로그레스 (0~100, 등급별 색상)',
      'Behavioral Pattern Card 컴포넌트 — Critical/Caution/Positive 3단계 경고 카드',
      'Emotion Win Rate Bar 컴포넌트 — 감정별 승률 수평 바 (design-tokens 스펙 준수)',
      'Time Heatmap Grid 컴포넌트 — 요일(7)x시간대(12) 수익 히트맵',
      'AI Recommendation List 컴포넌트 — 번호 매긴 권고사항 + Impact 배지',
      'AI Report 전용 페이지 (`/analysis/report`) — 위 6개 + 기존 RadarChart + KPI 행 조합',
      'AI Report 생성 API 확장 — Gemini 프롬프트에 감정 데이터/행동 패턴/시간대 분석 추가',
      '기존 `/analysis` 페이지의 "AI 리포트" 탭 → `/analysis/report`로 라우팅 전환',
      '빈 상태, 로딩 스켈레톤, 에러 상태 처리',
      '반응형 (모바일 1열, 태블릿 2열, 데스크톱 4열 KPI)',
      'design-tokens의 No-Line Rule, Ghost Border Rule, 숫자 Mono 원칙 준수',
    ]) {
      expect(spec).toContain(`- [x] ${criterion}`);
    }

    expect(tradeForm).toContain("import { EmotionTag } from '@/components/ai-report/EmotionTag'");
    expect(tradeForm).toContain('<EmotionTag');
    expect(emotionTag).toContain('aria-pressed={active}');
    expect(emotionTag).toContain('tone ===');
    expect(reportRoute).toContain('stats: statsJson');
    expect(reportRoute).toContain('JSON.parse');
  });
});
