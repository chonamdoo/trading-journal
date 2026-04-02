import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * AI 월간 트레이딩 리포트 생성 API
 *
 * POST /api/report/generate
 * Body: { year: number, month: number }
 *
 * Gemini 2.0 Flash로 거래 데이터를 분석하여 마크다운 리포트를 생성한다.
 */

interface GeminiContent {
  parts: { text?: string; inlineData?: { mimeType: string; data: string } }[];
}

export async function POST(request: Request) {
  const supabase = await createClient();

  // 인증 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  const body = await request.json();
  const { year, month } = body as { year: number; month: number };

  if (!year || !month || month < 1 || month > 12) {
    return NextResponse.json({ error: '유효하지 않은 기간입니다.' }, { status: 400 });
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    return NextResponse.json({ error: 'Gemini API 키가 설정되지 않았습니다.' }, { status: 500 });
  }

  // 월 1회 제한: 이미 해당 월 리포트가 있으면 차단 (관리자 예외)
  const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map((e) => e.trim());
  const isAdmin = adminEmails.includes(user.email ?? '');

  if (!isAdmin) {
    const { data: existing } = await supabase
      .from('monthly_reports')
      .select('id')
      .eq('user_id', user.id)
      .eq('year', year)
      .eq('month', month)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: '이미 해당 월의 리포트가 생성되었습니다. 월 1회만 가능합니다.' },
        { status: 429 },
      );
    }
  }

  try {
    // 해당 월의 기간 계산
    const periodStart = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const periodEnd = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

    // 해당 기간 거래 조회 (종료된 거래만)
    const { data: trades, error: tradesError } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'closed')
      .gte('date', periodStart)
      .lte('date', periodEnd)
      .order('date', { ascending: true });

    if (tradesError) {
      return NextResponse.json({ error: tradesError.message }, { status: 500 });
    }

    if (!trades || trades.length === 0) {
      return NextResponse.json(
        { error: '해당 기간에 종료된 거래가 없습니다.' },
        { status: 400 },
      );
    }

    // 추가진입(scale-ins) 조회
    const tradeIds = trades.map((t) => t.id);
    const { data: scaleIns } = await supabase
      .from('trade_scale_ins')
      .select('*')
      .in('trade_id', tradeIds);

    // 분할청산(closes) 조회
    const { data: closes } = await supabase
      .from('trade_closes')
      .select('*')
      .in('trade_id', tradeIds);

    // 스크린샷 base64 변환 (수익/손실 상위 각 5건, 실패 시 스킵)
    const screenshotParts: { text?: string; inlineData?: { mimeType: string; data: string } }[] = [];
    try {
      const sortedByPnl = [...trades]
        .filter((t) => t.pnl != null)
        .sort((a, b) => (b.pnl ?? 0) - (a.pnl ?? 0));
      const topWins = sortedByPnl.slice(0, 5).map((t) => t.id);
      const topLosses = sortedByPnl.slice(-5).map((t) => t.id);
      const screenshotTradeIds = [...new Set([...topWins, ...topLosses])];

      const { data: screenshots } = await supabase
        .from('trade_screenshots')
        .select('*')
        .in('trade_id', screenshotTradeIds)
        .order('sort_order', { ascending: true });

      for (const ss of (screenshots ?? []).slice(0, 10)) {
        try {
          const { data: fileData } = await supabase.storage
            .from('trade-screenshots')
            .download(ss.storage_path);
          if (fileData) {
            const buffer = Buffer.from(await fileData.arrayBuffer());
            const base64 = buffer.toString('base64');
            const trade = trades.find((t) => t.id === ss.trade_id);
            screenshotParts.push({
              text: `[스크린샷: ${trade?.asset} ${trade?.direction} | PnL: ${trade?.pnl?.toFixed(2)} USDT]`,
            });
            screenshotParts.push({
              inlineData: { mimeType: ss.mime_type, data: base64 },
            });
          }
        } catch {
          // 개별 스크린샷 실패 시 스킵
        }
      }
    } catch {
      // 스크린샷 전체 실패 시 텍스트만으로 진행
    }

    // 통계 계산
    const wins = trades.filter((t) => (t.pnl ?? 0) > 0).length;
    const totalPnl = trades.reduce((sum, t) => sum + (t.pnl ?? 0), 0);
    const winRate = (wins / trades.length) * 100;

    // 거래 데이터를 분석용 JSON으로 변환
    const tradesForAnalysis = trades.map((t) => ({
      asset: t.asset,
      direction: t.direction,
      leverage: t.leverage,
      margin: t.margin,
      entry_price: t.entry_price,
      exit_price: t.exit_price,
      pnl: t.pnl,
      reason: t.reason,
      notes: t.notes,
      tags: t.tags,
      entry_datetime: t.entry_datetime,
      exit_datetime: t.exit_datetime,
      scale_ins: (scaleIns ?? [])
        .filter((si) => si.trade_id === t.id)
        .map((si) => ({
          type: si.type,
          entry_price: si.entry_price,
          margin: si.margin,
        })),
      closes: (closes ?? [])
        .filter((c) => c.trade_id === t.id)
        .map((c) => ({
          exit_price: c.exit_price,
          pnl: c.pnl,
          quantity_pct: c.quantity_pct,
        })),
    }));

    // Gemini 프롬프트 구성
    const prompt = `당신은 전문 암호화폐 선물 트레이딩 분석가입니다. 아래 데이터를 분석하여 한국어 월간 트레이딩 리포트를 작성해주세요.

## 분석 기간
${year}년 ${month}월 (${periodStart} ~ ${periodEnd})

## 거래 데이터 (${trades.length}건)
${JSON.stringify(tradesForAnalysis, null, 2)}

## 기본 통계
- 총 거래: ${trades.length}건
- 승리: ${wins}건 / 패배: ${trades.length - wins}건
- 승률: ${winRate.toFixed(1)}%
- 총 손익: ${totalPnl.toFixed(2)} USDT

## 분석 요청사항
아래 형식의 마크다운으로 리포트를 작성해주세요:

### 📊 성과 요약
전체적인 이번 달 트레이딩 성과를 2~3문장으로 요약해주세요.

### 🏆 종목별 분석
종목별 거래 횟수, 승률, 누적 손익을 표로 정리하고 인사이트를 제공해주세요.

### 📈 승리 패턴
승리한 거래들의 공통점을 분석해주세요 (진입 이유, 방향, 레버리지, 종목 등).

### 📉 손실 패턴
손실이 발생한 거래들의 공통점을 분석해주세요.

### ⚖️ 방향별 분석
롱/숏 각각의 승률과 평균 수익을 비교해주세요.

### 🔧 레버리지 분석
레버리지 구간별 성과를 분석해주세요.

${screenshotParts.length > 0 ? '### 📸 차트 패턴 분석\n첨부된 스크린샷에서 관찰되는 차트 패턴과 진입/청산 타이밍에 대해 분석해주세요.' : ''}

### 💡 개선 제안
구체적이고 실행 가능한 개선 제안을 3~5개 제시해주세요. 각 제안은 데이터에 기반해야 합니다.

### 📋 한줄 요약
이번 달 트레이딩을 한 문장으로 요약해주세요.

중요: 마크다운 형식을 정확히 지켜주세요. 데이터에 없는 내용을 지어내지 마세요. reason이나 notes가 비어있는 거래가 많으면 "진입 이유 기록 습관" 개선을 제안해주세요.`;

    // Gemini API 호출
    const contents = [
      {
        role: 'user' as const,
        parts: [
          { text: prompt },
          ...screenshotParts,
        ],
      },
    ];

    const geminiBody = {
      contents,
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 4096,
      },
    };

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiBody),
      },
    );

    const geminiData = await geminiRes.json().catch(() => null);

    if (!geminiRes.ok) {
      const errMsg = geminiData?.error?.message || JSON.stringify(geminiData).slice(0, 300);
      return NextResponse.json(
        { error: `Gemini API 오류 (${geminiRes.status}): ${errMsg}` },
        { status: 422 },
      );
    }

    const reportMarkdown =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    if (!reportMarkdown) {
      const blockReason = geminiData?.candidates?.[0]?.finishReason || 'unknown';
      return NextResponse.json(
        { error: `Gemini 응답 없음 (reason: ${blockReason})` },
        { status: 422 },
      );
    }

    // DB 저장 (upsert: 같은 월 재생성 시 덮어쓰기)
    const { data: report, error: saveError } = await supabase
      .from('monthly_reports')
      .upsert(
        {
          user_id: user.id,
          year,
          month,
          period_start: periodStart,
          period_end: periodEnd,
          trade_count: trades.length,
          win_rate: Math.round(winRate * 100) / 100,
          total_pnl: Math.round(totalPnl * 100) / 100,
          report_markdown: reportMarkdown,
          model_used: 'gemini-2.5-flash-preview',
        },
        { onConflict: 'user_id,year,month' },
      )
      .select()
      .single();

    if (saveError) {
      return NextResponse.json({ error: saveError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, report });
  } catch (err) {
    const msg = err instanceof Error ? `${err.message} | ${err.stack?.split('\n')[1]?.trim() ?? ''}` : '알 수 없는 오류';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
