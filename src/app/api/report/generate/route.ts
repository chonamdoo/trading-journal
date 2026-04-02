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

    // 종목별 통계 사전 계산
    const assetStats: Record<string, { count: number; wins: number; pnl: number }> = {};
    for (const t of trades) {
      if (!assetStats[t.asset]) assetStats[t.asset] = { count: 0, wins: 0, pnl: 0 };
      assetStats[t.asset].count++;
      if ((t.pnl ?? 0) > 0) assetStats[t.asset].wins++;
      assetStats[t.asset].pnl += t.pnl ?? 0;
    }
    const assetStatsStr = Object.entries(assetStats)
      .sort((a, b) => b[1].pnl - a[1].pnl)
      .map(([sym, s]) => `${sym}: ${s.count}건, 승률 ${((s.wins / s.count) * 100).toFixed(1)}%, PnL ${s.pnl.toFixed(2)} USDT`)
      .join('\n');

    // 방향별 통계
    const longTrades = trades.filter((t) => t.direction === 'LONG');
    const shortTrades = trades.filter((t) => t.direction === 'SHORT');
    const longWins = longTrades.filter((t) => (t.pnl ?? 0) > 0).length;
    const shortWins = shortTrades.filter((t) => (t.pnl ?? 0) > 0).length;
    const longPnl = longTrades.reduce((s, t) => s + (t.pnl ?? 0), 0);
    const shortPnl = shortTrades.reduce((s, t) => s + (t.pnl ?? 0), 0);

    // 레버리지별 통계
    const levBuckets: Record<string, { count: number; wins: number; pnl: number }> = {};
    for (const t of trades) {
      const bucket = t.leverage <= 5 ? '1-5x' : t.leverage <= 10 ? '6-10x' : t.leverage <= 25 ? '11-25x' : t.leverage <= 50 ? '26-50x' : '51x+';
      if (!levBuckets[bucket]) levBuckets[bucket] = { count: 0, wins: 0, pnl: 0 };
      levBuckets[bucket].count++;
      if ((t.pnl ?? 0) > 0) levBuckets[bucket].wins++;
      levBuckets[bucket].pnl += t.pnl ?? 0;
    }
    const levStatsStr = Object.entries(levBuckets)
      .map(([b, s]) => `${b}: ${s.count}건, 승률 ${((s.wins / s.count) * 100).toFixed(1)}%, PnL ${s.pnl.toFixed(2)} USDT`)
      .join('\n');

    // 평균 수익/손실
    const winTrades = trades.filter((t) => (t.pnl ?? 0) > 0);
    const lossTrades = trades.filter((t) => (t.pnl ?? 0) < 0);
    const avgWin = winTrades.length ? winTrades.reduce((s, t) => s + (t.pnl ?? 0), 0) / winTrades.length : 0;
    const avgLoss = lossTrades.length ? lossTrades.reduce((s, t) => s + (t.pnl ?? 0), 0) / lossTrades.length : 0;
    const profitFactor = avgLoss !== 0 ? Math.abs(avgWin / avgLoss) : 0;
    const ev = (winRate / 100) * avgWin + ((100 - winRate) / 100) * avgLoss;

    // reason 비어있는 비율
    const emptyReasonPct = (trades.filter((t) => !t.reason || t.reason.trim() === '').length / trades.length * 100).toFixed(0);

    // Gemini 프롬프트 구성
    const prompt = `## 페르소나 및 임무
너는 월스트리트 출신의 '시니어 리스크 매니저'이자 '트레이딩 심리 분석가'다.
사용자의 한 달치 매매 데이터를 분석하여, 단순 요약을 넘어 수익 구조의 허점을 찌르고 장기적 생존 전략을 제시하라.
한국어로 작성하라.

## ⛔ 필수 제약 조건 (STRICT RULES)
1. **표 형식 금지**: 마크다운 표(|---|)를 절대 사용하지 마라. 모든 데이터는 '불렛 포인트(-)'와 '굵은 글씨'를 조합하여 서술형으로 작성하라.
2. **수치 기반 비판**: "수익이 났다"는 말 대신 "기대값(EV)이 낮아 파산 위험이 있다"는 식의 전문 용어를 사용하라.
3. **톤앤매너**: 칭찬보다는 냉철한 비판 위주로 작성하여 사용자가 경각심을 갖게 하라.

## 🔍 분석 프레임워크 (Core Pillars)
1. **엣지(Edge) 검증**: 수익이 시장의 변동성 덕분인지, 사용자의 타점 덕분인지 분석하라.
2. **자산 적합성(Asset Affinity)**: 특정 코인에서 반복되는 손실 패턴을 찾아내어 '거래 금지 종목'을 지정하라.
3. **심리적 편향**: 뇌동매매, 본절 집착, 포모(FOMO) 등 데이터 이면에 숨은 심리적 오류를 지적하라.
4. **리스크 관리**: 레버리지 대비 MDD(최대 낙폭) 가능성을 경고하고 자금 관리 규칙을 설정하라.

## 입력 데이터

### 기본 정보
- 분석 기간: ${year}년 ${month}월 (${periodStart} ~ ${periodEnd})
- 기본 자산: USDT

### 기본 통계
- 총 거래: **${trades.length}건** (승리 ${wins}건 / 패배 ${trades.length - wins}건)
- 승률: **${winRate.toFixed(1)}%**
- 총 손익: **${totalPnl.toFixed(2)} USDT**
- 평균 수익: **${avgWin.toFixed(2)} USDT** / 평균 손실: **${avgLoss.toFixed(2)} USDT**
- 손익비(Profit Factor): **${profitFactor.toFixed(2)}**
- 기대값(EV): **${ev.toFixed(2)} USDT/거래**
- 진입 이유 미기록 비율: **${emptyReasonPct}%**

### 종목별 통계
${assetStatsStr}

### 방향별 통계
- **LONG**: ${longTrades.length}건, 승률 ${longTrades.length ? ((longWins / longTrades.length) * 100).toFixed(1) : 0}%, PnL ${longPnl.toFixed(2)} USDT
- **SHORT**: ${shortTrades.length}건, 승률 ${shortTrades.length ? ((shortWins / shortTrades.length) * 100).toFixed(1) : 0}%, PnL ${shortPnl.toFixed(2)} USDT

### 레버리지별 통계
${levStatsStr}

### 전체 거래 내역
${JSON.stringify(tradesForAnalysis, null, 2)}

## 출력 형식 (마크다운, 표 사용 금지)
아래 형식을 정확히 지켜서 작성하라. 반드시 불렛 포인트와 볼드를 사용하고, 마크다운 표는 절대 금지다.

### 🎯 전문가 총평
한 줄 요약(볼드)으로 시작하라. 이후 2~3문장으로 이번 달 트레이딩의 핵심을 냉정하게 짚어라. 엣지 검증 결과(실력 vs 운)를 반드시 포함하라.

### 📊 수익 구조 해부 (EV·손익비·승률)
승률, 손익비, 기대값(EV)을 해석하고 이 구조가 장기적으로 수익을 낼 수 있는지 판단하라. "이 구조로 100회 거래 시 예상 결과"를 서술하라.

### 🏆 자산 적합성 분석
종목별 거래 횟수, 승률, 누적 손익을 불렛 포인트로 나열하라. 사용자와 궁합이 좋은 종목과 나쁜 종목을 명확히 분류하고, 거래 금지 종목을 지정하라.

### ⚖️ 방향별 분석
롱/숏 각각의 승률과 평균 수익을 비교하고, 어느 방향에 구조적 강점이 있는지 판단하라.

### 🔧 레버리지·리스크 프로파일
레버리지 구간별 성과를 분석하라. 리스크 관리 능력을 **1~10점**으로 평가하고 근거를 설명하라. MDD 위험을 경고하라.

### 🧠 심리적 편향 분석
거래 데이터에서 발견되는 심리적 오류를 지적하라. 진입 이유(reason), 메모(notes), 거래 패턴에서 뇌동매매, FOMO, 본절 집착 등의 흔적을 찾아라.

### ✅ Do More (적극 권장)
데이터에서 발견된 재현 가능한 승리 패턴을 구체적으로 명시하라. 종목, 방향, 레버리지, 진입 이유 조합을 제시하라.

### 🚫 Stop Doing (즉시 중단)
손실의 대부분을 차지하는 나쁜 습관을 명확히 규정하라. **금지 명령** 형태로 작성하라. (예: "금지: DOGE 20x 이상 롱 포지션")

${screenshotParts.length > 0 ? '### 📸 차트 패턴 분석\n첨부된 스크린샷에서 관찰되는 차트 패턴과 진입/청산 타이밍의 적절성을 분석하라.' : ''}

### 📋 다음 달 액션 플랜
구체적이고 실행 가능한 규칙을 **5개** 제시하라. 반드시 숫자와 기준이 명확해야 한다. (예: "레버리지 10x 이하로 제한", "1거래당 최대 증거금 자본의 5% 이내")

## ⚠️ 최종 지시
- 데이터에 없는 내용을 지어내지 마라.
- 달콤한 위로 대신 냉정한 팩트를 전달하라. 사용자가 불편해야 성장한다.
- 마크다운 표(|---|)를 사용하면 실격이다. 불렛 포인트만 사용하라.
- ${parseInt(emptyReasonPct) > 50 ? '진입 이유 미기록 비율이 ' + emptyReasonPct + '%로 매우 높다. 이것을 최우선으로 지적하고 "매매 일지를 쓰지 않는 트레이더는 도박꾼이다"라고 경고하라.' : ''}
- 물타기(scale-in) 데이터가 있다면 물타기 성공/실패율도 분석하라.`;

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
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${geminiKey}`,
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
          model_used: 'gemini-2.5-flash-lite',
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
