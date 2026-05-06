import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const routeSource = readFileSync('src/app/api/report/generate/route.ts', 'utf8');

function weeklyExistingLookupBlock(): string {
  const start = routeSource.indexOf('const { data: existingWeekly } = await supabase');
  const end = routeSource.indexOf('const weeklyPayload = {', start);
  expect(start).toBeGreaterThan(-1);
  expect(end).toBeGreaterThan(start);
  return routeSource.slice(start, end);
}

describe('POST /api/report/generate weekly conflict key', () => {
  it('looks up existing weekly reports by ISO week identity, not display month', () => {
    const block = weeklyExistingLookupBlock();

    expect(block).toContain(".eq('user_id', user.id)");
    expect(block).toContain(".eq('year', year)");
    expect(block).toContain(".eq('week', week!)");
    expect(block).toContain(".eq('period_type', 'weekly')");
    expect(block).not.toContain(".eq('month', month)");
  });
});
