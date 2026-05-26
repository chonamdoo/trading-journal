interface WinRateDonutSegmentColors {
  green: string;
  red: string;
  grid: string;
}

interface BuildWinRateDonutSegmentsParams {
  wins: number;
  losses: number;
  colors: WinRateDonutSegmentColors;
}

export function buildWinRateDonutSegments({
  wins,
  losses,
  colors,
}: BuildWinRateDonutSegmentsParams) {
  if (wins + losses <= 0) {
    return [{ name: '없음', value: 1, fill: colors.grid }];
  }

  return [
    { name: '익절', value: wins || 0, fill: colors.green },
    { name: '손절', value: losses || 0, fill: colors.red },
  ];
}
