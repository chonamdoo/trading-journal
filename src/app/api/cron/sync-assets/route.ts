import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Binance Futures 선물 종목을 동기화하는 Cron API
 *
 * Vercel Cron: 매일 00:00 UTC 실행
 * GET /api/cron/sync-assets
 */

interface BinanceSymbol {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  status: string;
  contractType: string;
}

interface BinanceExchangeInfo {
  symbols: BinanceSymbol[];
}

export async function GET(request: Request) {
  // Vercel Cron 인증 확인
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Binance Futures exchangeInfo 조회
    // fapi.binance.com은 미국 IP 차단 → api.binance.com 우선 시도
    const urls = [
      'https://api.binance.com/fapi/v1/exchangeInfo',
      'https://fapi.binance.com/fapi/v1/exchangeInfo',
    ];

    let res: Response | null = null;
    let lastError = '';

    for (const url of urls) {
      try {
        res = await fetch(url, { cache: 'no-store' });
        if (res.ok) break;
        lastError = `${url} → ${res.status}`;
        res = null;
      } catch (e) {
        lastError = `${url} → ${e instanceof Error ? e.message : 'fetch failed'}`;
        res = null;
      }
    }

    if (!res || !res.ok) {
      return NextResponse.json(
        { error: `Binance API unavailable: ${lastError}` },
        { status: 502 },
      );
    }

    const data: BinanceExchangeInfo = await res.json();

    // USDT 무기한 선물만 필터 (TRADING 상태)
    const assets = data.symbols
      .filter(
        (s) =>
          s.quoteAsset === 'USDT' &&
          s.contractType === 'PERPETUAL' &&
          s.status === 'TRADING',
      )
      .map((s) => ({
        symbol: s.baseAsset,
        base_asset: s.baseAsset,
        quote_asset: s.quoteAsset,
        is_active: true,
        synced_at: new Date().toISOString(),
      }));

    if (assets.length === 0) {
      return NextResponse.json({ error: 'No assets from Binance' }, { status: 502 });
    }

    const supabase = createAdminClient();

    // 기존 종목을 모두 비활성화 후 싱크된 종목만 활성화 (upsert)
    await supabase
      .from('supported_assets')
      .update({ is_active: false })
      .neq('symbol', '');

    const { error } = await supabase
      .from('supported_assets')
      .upsert(assets, { onConflict: 'symbol' });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      count: assets.length,
      synced_at: new Date().toISOString(),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
