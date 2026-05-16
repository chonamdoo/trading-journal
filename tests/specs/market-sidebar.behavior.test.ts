import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('market sidebar economic calendar visibility', () => {
  it('shows the economic calendar section in the market sidebar', () => {
    const sidePanel = readFileSync('src/components/trades/TradeSidePanel.tsx', 'utf8');

    expect(sidePanel).toContain('fetchEconomicCalendar');
    expect(sidePanel).toContain('Next Events');
    expect(sidePanel).toContain('오늘 주요 지표 없음');
    expect(sidePanel).toContain('calendarLoading');
    expect(sidePanel).toContain('visibleCalendarEvents.map');
    expect(sidePanel).toContain('safeExternalUrl');
    expect(sidePanel).toContain('rel="noopener noreferrer"');
    expect(sidePanel).toContain('.finally(() =>');
    expect(sidePanel).not.toContain('href={event.url}');
    expect(sidePanel).not.toContain('파생상품 데이터');
  });
});
