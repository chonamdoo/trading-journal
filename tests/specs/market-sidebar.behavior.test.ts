import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('market sidebar derivatives visibility', () => {
  it('keeps the derivatives section visible when provider data is unavailable', () => {
    const sidePanel = readFileSync('src/components/trades/TradeSidePanel.tsx', 'utf8');

    expect(sidePanel).toMatch(/showDerivatives\s*=\s*insightLoading[\s\S]*derivativesStatus/);
    expect(sidePanel).toContain('수집 대기');
    expect(sidePanel).toMatch(/showDerivatives\s*&&/);
    expect(sidePanel).not.toContain('{(insightLoading || derivatives) && (');
  });
});
