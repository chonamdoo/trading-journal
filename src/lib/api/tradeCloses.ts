/**
 * 분할 청산(trade_closes) API 레이어
 *
 * 하나의 거래에 여러 번의 분할 청산을 기록한다.
 * quantity_pct 합계가 100%에 도달하면 부모 거래를 자동으로 closed 처리한다.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, TradeCloseRow, ApiResult } from '../supabase/types';

type Client = SupabaseClient<Database>;

/** 부동소수점 허용 오차 */
const PCT_TOLERANCE = 0.01;
/** 100% 도달 판정 임계값 */
const FULLY_CLOSED_THRESHOLD = 100 - PCT_TOLERANCE;

/** NUMERIC 필드를 number로 변환한다 */
function normalizeCloseRow(row: Record<string, unknown>): TradeCloseRow {
  return {
    ...row,
    exit_price: Number(row.exit_price),
    quantity_pct: Number(row.quantity_pct),
    pnl: Number(row.pnl),
  } as TradeCloseRow;
}

/** 거래의 모든 분할 청산 기록을 조회한다 */
export async function getTradeCloses(
  supabase: Client,
  tradeId: string,
): Promise<ApiResult<TradeCloseRow[]>> {
  try {
    const { data, error } = await supabase
      .from('trade_closes')
      .select('*')
      .eq('trade_id', tradeId)
      .order('created_at', { ascending: true });

    if (error) return { success: false, error: error.message };

    return {
      success: true,
      data: (data ?? []).map((r) => normalizeCloseRow(r as unknown as Record<string, unknown>)),
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : '분할 청산 조회 실패' };
  }
}

/** 여러 거래의 분할 청산 기록을 한번에 조회한다 */
export async function getTradeClosesByTradeIds(
  supabase: Client,
  tradeIds: string[],
): Promise<ApiResult<TradeCloseRow[]>> {
  if (tradeIds.length === 0) return { success: true, data: [] };

  try {
    const { data, error } = await supabase
      .from('trade_closes')
      .select('*')
      .in('trade_id', tradeIds)
      .order('created_at', { ascending: true });

    if (error) return { success: false, error: error.message };

    return {
      success: true,
      data: (data ?? []).map((r) => normalizeCloseRow(r as unknown as Record<string, unknown>)),
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : '분할 청산 조회 실패' };
  }
}

/**
 * 분할 청산을 추가한다.
 *
 * - quantity_pct 합계가 100%를 초과하면 에러 반환
 * - 합계가 정확히 100%에 도달하면 부모 거래를 자동으로 closed 처리
 * - PnL은 호출자가 계산하여 전달 (margin * leverage * ratio * quantity_pct/100)
 */
export async function addTradeClose(
  supabase: Client,
  params: {
    tradeId: string
    userId: string
    exitPrice: number
    exitDatetime: string
    quantityPct: number
    pnl: number
  },
): Promise<ApiResult<{ close: TradeCloseRow; isFullyClosed: boolean }>> {
  try {
    // 기존 분할 청산의 합계 조회
    const { data: existing, error: fetchErr } = await supabase
      .from('trade_closes')
      .select('quantity_pct')
      .eq('trade_id', params.tradeId);

    if (fetchErr) return { success: false, error: fetchErr.message };

    const usedPct = (existing ?? []).reduce(
      (sum, r) => sum + Number(r.quantity_pct),
      0,
    );
    const remainPct = 100 - usedPct;

    if (params.quantityPct > remainPct + PCT_TOLERANCE) {
      return {
        success: false,
        error: `잔여 수량(${remainPct.toFixed(1)}%)을 초과합니다.`,
      };
    }

    // 분할 청산 레코드 삽입
    const { data: closeRow, error: insertErr } = await supabase
      .from('trade_closes')
      .insert({
        trade_id: params.tradeId,
        user_id: params.userId,
        exit_price: params.exitPrice,
        exit_datetime: params.exitDatetime,
        quantity_pct: params.quantityPct,
        pnl: params.pnl,
      })
      .select()
      .single();

    if (insertErr || !closeRow) {
      return { success: false, error: insertErr?.message ?? '분할 청산 저장 실패' };
    }

    const totalPct = usedPct + params.quantityPct;
    const isFullyClosed = totalPct >= FULLY_CLOSED_THRESHOLD;

    // 100% 도달 시 부모 거래를 closed로 변경
    if (isFullyClosed) {
      // 모든 분할 청산의 PnL 합산
      const { data: allCloses } = await supabase
        .from('trade_closes')
        .select('pnl')
        .eq('trade_id', params.tradeId);

      const totalPnl = (allCloses ?? []).reduce(
        (sum, r) => sum + Number(r.pnl),
        0,
      );
      const roundedPnl = Math.round(totalPnl * 100) / 100;

      // 가중 평균 청산가 계산
      const { data: allClosesForAvg } = await supabase
        .from('trade_closes')
        .select('exit_price, quantity_pct')
        .eq('trade_id', params.tradeId);

      let avgExitPrice = params.exitPrice;
      if (allClosesForAvg && allClosesForAvg.length > 0) {
        const weightedSum = allClosesForAvg.reduce(
          (sum, r) => sum + Number(r.exit_price) * Number(r.quantity_pct),
          0,
        );
        const totalWeight = allClosesForAvg.reduce(
          (sum, r) => sum + Number(r.quantity_pct),
          0,
        );
        avgExitPrice = totalWeight > 0 ? weightedSum / totalWeight : params.exitPrice;
      }

      await supabase
        .from('trades')
        .update({
          status: 'closed' as const,
          exit_price: Math.round(avgExitPrice * 100000000) / 100000000,
          exit_datetime: params.exitDatetime,
          pnl: roundedPnl,
        })
        .eq('id', params.tradeId)
        .eq('status', 'open');
    }

    return {
      success: true,
      data: {
        close: normalizeCloseRow(closeRow as unknown as Record<string, unknown>),
        isFullyClosed,
      },
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : '분할 청산 추가 실패' };
  }
}

/** 분할 청산 레코드를 삭제한다 */
export async function deleteTradeClose(
  supabase: Client,
  closeId: string,
): Promise<ApiResult<null>> {
  try {
    const { error } = await supabase
      .from('trade_closes')
      .delete()
      .eq('id', closeId);

    if (error) return { success: false, error: error.message };
    return { success: true, data: null };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : '분할 청산 삭제 실패' };
  }
}
