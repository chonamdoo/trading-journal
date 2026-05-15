import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('market sidebar economic calendar visibility', () => {
  it('shows the economic calendar section in the market sidebar', () => {
    const sidePanel = readFileSync('src/components/trades/TradeSidePanel.tsx', 'utf8');

    expect(sidePanel).toContain('fetchEconomicCalendar');
    expect(sidePanel).toContain('오늘 주요 경제 일정');
    expect(sidePanel).toContain('calendarLoading');
    expect(sidePanel).toMatch(/\{?\(insightLoading \|\| insight\)[\s\S]*\)\}\n\n\s+<div className="h-px bg-border my-4" \/>/);
    expect(sidePanel).not.toContain('파생상품 데이터');
  });
});
