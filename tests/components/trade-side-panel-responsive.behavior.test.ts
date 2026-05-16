import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('trade side panel responsive market context', () => {
  it('renders the mobile risk check card and desktop terminal panel from the selected prototype', () => {
    const sidePanel = readFileSync('src/components/trades/TradeSidePanel.tsx', 'utf8');
    const newTradePage = readFileSync('src/app/(main)/trades/new/page.tsx', 'utf8');

    expect(sidePanel).toContain('진입 전 리스크 체크');
    expect(sidePanel).toContain('Market Summary');
    expect(sidePanel).toContain('Next Events');
    expect(sidePanel).toContain('리스크 모드');
    expect(sidePanel).toContain('min-[1120px]:hidden');
    expect(sidePanel).toContain('min-[1120px]:flex');
    expect(newTradePage).toContain('min-[1120px]:grid-cols-[minmax(0,1fr)_minmax(420px,500px)]');
    expect(newTradePage).not.toContain('hidden lg:block w-[280px]');
  });
});
