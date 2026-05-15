import { NextRequest, NextResponse } from 'next/server';

type EconomicCalendarImpact = 'low' | 'medium' | 'high';

interface InvestingCalendarPayload {
  data?: unknown;
}

interface ParsedCalendarEvent {
  id: string;
  eventAttrId: string;
  title: string;
  titleEn: string;
  ts: string;
  allDay: boolean;
  dateKey: string;
  impact: EconomicCalendarImpact;
  forecast: string | null;
  previous: string | null;
  actual: string | null;
  url: string;
}

export interface EconomicCalendarEvent {
  id: string;
  title: string;
  titleEn: string;
  ts: string;
  allDay: boolean;
  dateKey: string;
  impact: EconomicCalendarImpact;
  forecast: string | null;
  previous: string | null;
  actual: string | null;
  url: string;
}

let cache: { dateKey: string; data: EconomicCalendarEvent[]; timestamp: number } | null = null;

const CACHE_TTL = 30 * 60 * 1000;
const INVESTING_KR_URL = 'https://kr.investing.com/economic-calendar/Service/getCalendarFilteredData';
const INVESTING_EN_URL = 'https://www.investing.com/economic-calendar/Service/getCalendarFilteredData';
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const US_COUNTRY_ID = '5';
const MEDIUM_IMPORTANCE = '2';
const HIGH_IMPORTANCE = '3';
const INVESTING_FETCH_TIMEOUT_MS = 10_000;

function kstDateKey(date = new Date()): string {
  return new Date(date.getTime() + KST_OFFSET_MS).toISOString().slice(0, 10);
}

function validDateKey(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function calendarRequestBody(dateKey: string): URLSearchParams {
  const body = new URLSearchParams();
  body.append('country[]', US_COUNTRY_ID);
  body.append('importance[]', MEDIUM_IMPORTANCE);
  body.append('importance[]', HIGH_IMPORTANCE);
  body.set('dateFrom', dateKey);
  body.set('dateTo', dateKey);
  body.set('timeZone', '88');
  body.set('timeFrame', 'today');
  body.set('timeFilter', 'timeRemain');
  body.set('currentTab', 'custom');
  body.set('limit_from', '0');
  return body;
}

function decodeHtml(value: string): string {
  return value
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCharCode(parseInt(code, 16)));
}

function cleanHtml(value: string): string {
  return decodeHtml(value.replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

function textCell(row: string, className: string): string | null {
  const match = new RegExp(`<td\\b[^>]*class="[^"]*\\b${className}\\b[^"]*"[^>]*>([\\s\\S]*?)<\\/td>`).exec(row);
  const text = match ? cleanHtml(match[1]) : '';
  return text === '' ? null : text;
}

function parseImpact(row: string): EconomicCalendarImpact {
  const match = /data-img_key="bull([123])"/.exec(row);
  if (match?.[1] === '3') return 'high';
  if (match?.[1] === '2') return 'medium';
  return 'low';
}

function parseDateTime(dateTime: string): Pick<EconomicCalendarEvent, 'ts' | 'allDay' | 'dateKey'> {
  const match = /^(\d{4})\/(\d{2})\/(\d{2}) (\d{2}):(\d{2}):(\d{2})$/.exec(dateTime);
  if (!match) {
    const dateKey = kstDateKey();
    return { ts: `${dateKey}T00:00:00.000Z`, allDay: true, dateKey };
  }

  const [, year, month, day, hour, minute, second] = match;
  const dateKey = `${year}-${month}-${day}`;
  return {
    ts: new Date(`${dateKey}T${hour}:${minute}:${second}+09:00`).toISOString(),
    allDay: false,
    dateKey,
  };
}

function parseCalendarRows(html: string, baseUrl: string): ParsedCalendarEvent[] {
  const rows = html.match(/<tr\b(?=[^>]*class="[^"]*\bjs-event-item\b)[\s\S]*?<\/tr>/g) ?? [];

  return rows.flatMap((row) => {
    const rowId = /id="eventRowId_([^"]+)"/.exec(row)?.[1];
    const eventAttrId = /event_attr_ID="([^"]+)"/.exec(row)?.[1] ?? '';
    const dateTime = /data-event-datetime="([^"]+)"/.exec(row)?.[1] ?? '';
    const eventMatch = /<td\b[^>]*class="[^"]*\bevent\b[^"]*"[^>]*>[\s\S]*?<a\s+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i.exec(row);

    if (!rowId || !dateTime || !eventMatch) return [];

    const title = cleanHtml(eventMatch[2]);
    if (!title) return [];

    const date = parseDateTime(dateTime);
    return [{
      id: rowId,
      eventAttrId,
      title,
      titleEn: title,
      ...date,
      impact: parseImpact(row),
      forecast: textCell(row, 'fore'),
      previous: textCell(row, 'prev'),
      actual: textCell(row, 'act'),
      url: new URL(decodeHtml(eventMatch[1]), baseUrl).toString(),
    }];
  });
}

async function fetchInvestingCalendar(url: string, dateKey: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), INVESTING_FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        accept: 'application/json, text/javascript, */*; q=0.01',
        'content-type': 'application/x-www-form-urlencoded',
        'x-requested-with': 'XMLHttpRequest',
        referer: url.includes('kr.investing.com')
          ? 'https://kr.investing.com/economic-calendar/'
          : 'https://www.investing.com/economic-calendar/',
        'user-agent': 'Mozilla/5.0',
      },
      body: calendarRequestBody(dateKey),
      next: { revalidate: 900 },
      signal: controller.signal,
    });

    if (!res.ok) throw new Error('calendar-provider-unavailable');
    const payload = await res.json() as InvestingCalendarPayload;
    if (typeof payload.data !== 'string') throw new Error('calendar-provider-invalid-payload');
    return payload.data;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('calendar-provider-timeout');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function mergeCalendarEvents(koreanHtml: string, englishHtml: string): EconomicCalendarEvent[] {
  const koreanEvents = parseCalendarRows(koreanHtml, 'https://kr.investing.com');
  const englishEvents = parseCalendarRows(englishHtml, 'https://www.investing.com');
  const titleEnByEventAttrId = new Map(
    englishEvents.map((event) => [event.eventAttrId, event.title])
  );

  return koreanEvents
    .map(({ eventAttrId, ...event }) => ({
      ...event,
      titleEn: titleEnByEventAttrId.get(eventAttrId) ?? event.titleEn,
    }))
    .sort((a, b) => a.ts.localeCompare(b.ts));
}

export async function GET(req: NextRequest) {
  const requestedDateKey = req.nextUrl.searchParams.get('date') ?? kstDateKey();
  const dateKey = validDateKey(requestedDateKey) ? requestedDateKey : kstDateKey();

  if (cache && cache.dateKey === dateKey && Date.now() - cache.timestamp < CACHE_TTL) {
    return NextResponse.json(cache.data, {
      headers: { 'Cache-Control': 'public, max-age=1800' },
    });
  }

  try {
    const koreanHtml = await fetchInvestingCalendar(INVESTING_KR_URL, dateKey);
    let englishHtml = '';

    try {
      englishHtml = await fetchInvestingCalendar(INVESTING_EN_URL, dateKey);
    } catch {
      englishHtml = koreanHtml;
    }

    const data = mergeCalendarEvents(koreanHtml, englishHtml);
    cache = { dateKey, data, timestamp: Date.now() };

    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, max-age=1800' },
    });
  } catch {
    const fallback = cache?.dateKey === dateKey ? cache.data : [];
    return NextResponse.json(fallback, {
      headers: { 'Cache-Control': 'no-store' },
    });
  }
}
