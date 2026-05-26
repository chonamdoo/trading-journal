import { describe, expect, it } from 'vitest';

import { buildWinRateDonutSegments } from '@/components/charts/winRateDonutSegments';

describe('WinRateDonut segment colors', () => {
  const colors = {
    green: '#34D399',
    red: '#F87171',
    grid: 'rgba(255, 255, 255, 0.08)',
  };

  it('uses chart green for wins and chart red for losses', () => {
    expect(buildWinRateDonutSegments({ wins: 7, losses: 2, colors })).toEqual([
      { name: '익절', value: 7, fill: '#34D399' },
      { name: '손절', value: 2, fill: '#F87171' },
    ]);
  });

  it('keeps the grid color for the empty donut state', () => {
    expect(buildWinRateDonutSegments({ wins: 0, losses: 0, colors })).toEqual([
      { name: '없음', value: 1, fill: 'rgba(255, 255, 255, 0.08)' },
    ]);
  });
});
