import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  scenario: {
    targetWeeklyExists: true,
    closedTradeCount: 1,
  },
}));

class QueryMock {
  private readonly filters = new Map<string, unknown>();
  private readonly selectOptions?: { count?: string; head?: boolean };

  constructor(
    private readonly table: string,
    private readonly selected?: string,
    selectOptions?: { count?: string; head?: boolean },
  ) {
    this.selectOptions = selectOptions;
  }

  select(selected: string, options?: { count?: string; head?: boolean }) {
    return new QueryMock(this.table, selected, options);
  }

  eq(column: string, value: unknown) {
    this.filters.set(column, value);
    return this;
  }

  gte(column: string, value: unknown) {
    this.filters.set(`${column}>=`, value);
    return this;
  }

  lte(column: string, value: unknown) {
    this.filters.set(`${column}<=`, value);
    return this;
  }

  order() {
    return this;
  }

  limit() {
    return this;
  }

  maybeSingle() {
    if (this.table !== 'monthly_reports') {
      return Promise.resolve({ data: null, error: null });
    }

    if (this.filters.get('period_type') === 'monthly') {
      return Promise.resolve({ data: { id: 'monthly-1' }, error: null });
    }

    if (this.selected === 'created_at') {
      return Promise.resolve({
        data: { created_at: '2026-05-05T00:00:00.000Z' },
        error: null,
      });
    }

    if (this.filters.get('period_type') === 'weekly' && this.filters.has('week')) {
      return Promise.resolve({
        data: mocks.scenario.targetWeeklyExists ? { id: 'weekly-1' } : null,
        error: null,
      });
    }

    return Promise.resolve({ data: null, error: null });
  }

  then(resolve: (value: { count: number | null; error: null }) => void) {
    if (this.table === 'monthly_reports' && this.selectOptions?.count === 'exact') {
      resolve({ count: 0, error: null });
      return;
    }

    if (this.table === 'trades' && this.selectOptions?.count === 'exact') {
      resolve({ count: mocks.scenario.closedTradeCount, error: null });
      return;
    }

    resolve({ count: null, error: null });
  }
}

vi.mock('@/lib/api/auth', () => ({
  withAuth: async (_req: NextRequest, handler: (supabase: unknown, userId: string) => Promise<Response>) => {
    return handler(
      {
        from: (table: string) => new QueryMock(table),
      },
      'user-1',
    );
  },
}));

describe('GET /api/report/auto-check', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-14T12:00:00.000Z'));
    mocks.scenario.targetWeeklyExists = true;
    mocks.scenario.closedTradeCount = 1;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not request weekly generation when the target ISO week already has a report', async () => {
    const { GET } = await import('@/app/api/report/auto-check/route');

    const response = await GET(new NextRequest('http://localhost/api/report/auto-check'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.needsWeekly).toBe(false);
    expect(body.weeklyMeta).toBeNull();
  });

  it('requests weekly generation for the previous ISO week when no target report exists and closed trades exist', async () => {
    mocks.scenario.targetWeeklyExists = false;
    const { GET } = await import('@/app/api/report/auto-check/route');

    const response = await GET(new NextRequest('http://localhost/api/report/auto-check'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.needsWeekly).toBe(true);
    expect(body.weeklyMeta).toEqual({ year: 2026, month: 5, week: 19 });
  });
});
