import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const koreanCalendarHtml = `
  <tr id="eventRowId_545080" class="js-event-item " event_attr_ID="2260" data-event-datetime="2026/05/15 00:30:00">
    <td class="first left time js-time">00:30</td>
    <td class="left flagCur noWrap"><span title="미국" class="ceFlags United_States">&nbsp;</span> USD</td>
    <td class="left textNum sentiment noWrap" data-img_key="bull2"></td>
    <td class="left event"><a href="/economic-calendar/atlanta-fed-gdpnow-2260" target="_blank"> 애틀랜타 연방준비은행의 GDPnow (2분기)</a></td>
    <td class="bold act greenFont event-545080-actual" id="eventActual_545080">2.5%</td>
    <td class="fore event-545080-forecast" id="eventForecast_545080">2.4%</td>
    <td class="prev blackFont event-545080-previous" id="eventPrevious_545080"><span>2.3%</span></td>
    <td data-name="애틀랜타 연방준비은행의 GDPnow" data-event-id="2260"></td>
  </tr>
`;

const englishCalendarHtml = `
  <tr id="eventRowId_545080" class="js-event-item " event_attr_ID="2260" data-event-datetime="2026/05/15 00:30:00">
    <td class="first left time js-time">00:30</td>
    <td class="left flagCur noWrap"><span title="United States" class="ceFlags United_States">&nbsp;</span> USD</td>
    <td class="left textNum sentiment noWrap" data-img_key="bull2"></td>
    <td class="left event"><a href="/economic-calendar/atlanta-fed-gdpnow-2260" target="_blank"> Atlanta Fed GDPNow (Q2)</a></td>
    <td class="bold act greenFont event-545080-actual" id="eventActual_545080">2.5%</td>
    <td class="fore event-545080-forecast" id="eventForecast_545080">2.4%</td>
    <td class="prev blackFont event-545080-previous" id="eventPrevious_545080"><span>2.3%</span></td>
    <td data-name="Atlanta Fed GDPNow" data-event-id="2260"></td>
  </tr>
`;

function calendarResponse(html: string) {
  return {
    ok: true,
    json: async () => ({ data: html }),
  };
}

async function loadRoute() {
  vi.resetModules();
  return import('@/app/api/calendar/route');
}

describe('GET /api/calendar', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-15T02:00:00+09:00'));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('maps Investing calendar rows into the app calendar shape', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(calendarResponse(koreanCalendarHtml))
      .mockResolvedValueOnce(calendarResponse(englishCalendarHtml));
    vi.stubGlobal('fetch', fetchMock);
    const { GET } = await loadRoute();

    const response = await GET(new NextRequest('http://localhost/api/calendar'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][1]?.signal).toBeInstanceOf(AbortSignal);
    expect(body).toEqual([
      {
        id: '545080',
        title: '애틀랜타 연방준비은행의 GDPnow (2분기)',
        titleEn: 'Atlanta Fed GDPNow (Q2)',
        ts: '2026-05-14T15:30:00.000Z',
        allDay: false,
        dateKey: '2026-05-15',
        impact: 'medium',
        forecast: '2.4%',
        previous: '2.3%',
        actual: '2.5%',
        url: 'https://kr.investing.com/economic-calendar/atlanta-fed-gdpnow-2260',
      },
    ]);
  });

  it('does not return cached events for a different requested date after provider failure', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(calendarResponse(koreanCalendarHtml))
      .mockResolvedValueOnce(calendarResponse(englishCalendarHtml))
      .mockResolvedValueOnce({ ok: false, json: async () => ({}) });
    vi.stubGlobal('fetch', fetchMock);
    const { GET } = await loadRoute();

    await GET(new NextRequest('http://localhost/api/calendar?date=2026-05-15'));
    const failedResponse = await GET(new NextRequest('http://localhost/api/calendar?date=2026-05-16'));
    const failedBody = await failedResponse.json();

    expect(failedResponse.status).toBe(502);
    expect(failedBody).toEqual({ error: 'calendar-provider-unavailable' });

    const callsAfterFailedDate = fetchMock.mock.calls.length;
    const cachedResponse = await GET(new NextRequest('http://localhost/api/calendar?date=2026-05-15'));
    const cachedBody = await cachedResponse.json();

    expect(cachedResponse.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(callsAfterFailedDate);
    expect(cachedBody).toEqual([
      expect.objectContaining({
        id: '545080',
        dateKey: '2026-05-15',
      }),
    ]);
  });

  it('returns stale same-date cached events when refresh fails after ttl', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(calendarResponse(koreanCalendarHtml))
      .mockResolvedValueOnce(calendarResponse(englishCalendarHtml))
      .mockResolvedValueOnce({ ok: false, json: async () => ({}) });
    vi.stubGlobal('fetch', fetchMock);
    const { GET } = await loadRoute();

    await GET(new NextRequest('http://localhost/api/calendar?date=2026-05-15'));

    vi.setSystemTime(new Date('2026-05-15T02:31:00+09:00'));
    const staleResponse = await GET(new NextRequest('http://localhost/api/calendar?date=2026-05-15'));
    const staleBody = await staleResponse.json();

    expect(staleResponse.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(staleBody).toEqual([
      expect.objectContaining({
        id: '545080',
        dateKey: '2026-05-15',
      }),
    ]);
  });

  it('uses the requested date when provider datetime is not parseable', async () => {
    const koreanAllDayHtml = koreanCalendarHtml.replace(
      'data-event-datetime="2026/05/15 00:30:00"',
      'data-event-datetime="Tentative"'
    );
    const englishAllDayHtml = englishCalendarHtml.replace(
      'data-event-datetime="2026/05/15 00:30:00"',
      'data-event-datetime="Tentative"'
    );
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(calendarResponse(koreanAllDayHtml))
      .mockResolvedValueOnce(calendarResponse(englishAllDayHtml));
    vi.stubGlobal('fetch', fetchMock);
    const { GET } = await loadRoute();

    const response = await GET(new NextRequest('http://localhost/api/calendar?date=2026-05-16'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual([
      expect.objectContaining({
        id: '545080',
        ts: '2026-05-16T00:00:00.000Z',
        allDay: true,
        dateKey: '2026-05-16',
      }),
    ]);
  });

  it('rejects invalid requested dates', async () => {
    vi.stubGlobal('fetch', vi.fn());
    const { GET } = await loadRoute();

    const malformedResponse = await GET(new NextRequest('http://localhost/api/calendar?date=foo'));
    const impossibleResponse = await GET(new NextRequest('http://localhost/api/calendar?date=2026-02-31'));

    expect(malformedResponse.status).toBe(400);
    expect(await malformedResponse.json()).toEqual({ error: 'invalid-date' });
    expect(impossibleResponse.status).toBe(400);
    expect(await impossibleResponse.json()).toEqual({ error: 'invalid-date' });
  });
});
