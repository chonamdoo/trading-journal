import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('market sidebar derivatives visibility', () => {
  it('keeps the derivatives section visible when provider data is unavailable', () => {
    const sidePanel = readFileSync('src/components/trades/TradeSidePanel.tsx', 'utf8');

    expect(sidePanel).toContain('const showDerivatives = insightLoading || insight?.derivativesStatus');
    expect(sidePanel).toContain('수집 대기');
    expect(sidePanel).toContain('{showDerivatives && (');
    expect(sidePanel).not.toContain('{(insightLoading || derivatives) && (');
  });
});
