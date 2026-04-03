/**
 * 추가진입(물타기/불타기) API 레이어
 *
 * 하나의 오픈 포지션에 여러 번 추가진입을 기록한다.
 * 추가진입은 평균 진입가(WAP)와 총 증거금에 영향을 준다.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, TradeScaleInRow, ScaleInTypeDb, ApiResult } from '../supabase/types';

type Client = SupabaseClient<Database>;

/** NUMERIC 필드를 number로 변환한다 */
function normalizeRow(row: Record<string, unknown>): TradeScaleInRow {
  return {
    ...row,
    entry_price: Number(row.entry_price),
    margin: Number(row.margin),
    quantity: row.quantity != null ? Number(row.quantity) : null,
  } as TradeScaleInRow;
}

/** 거래의 모든 추가진입 기록을 조회한다 */
export async function getTradeScaleIns(
  supabase: Client,
  tradeId: string,
): Promise<ApiResult<TradeScaleInRow[]>> {
  try {
    const { data, error } = await supabase
      .from('trade_scale_ins')
      .select('*')
      .eq('trade_id', tradeId)
      .order('entry_datetime', { ascending: true });

    if (error) return { success: false, error: error.message };

    return {
      success: true,
      data: (data ?? []).map((r) => normalizeRow(r as unknown as Record<string, unknown>)),
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : '추가진입 조회 실패' };
  }
}

/** 여러 거래의 추가진입 기록을 한번에 조회한다 */
export async function getTradeScaleInsByTradeIds(
  supabase: Client,
  tradeIds: string[],
): Promise<ApiResult<TradeScaleInRow[]>> {
  if (tradeIds.length === 0) return { success: true, data: [] };

  try {
    const { data, error } = await supabase
      .from('trade_scale_ins')
      .select('*')
      .in('trade_id', tradeIds)
      .order('entry_datetime', { ascending: true });

    if (error) return { success: false, error: error.message };

    return {
      success: true,
      data: (data ?? []).map((r) => normalizeRow(r as unknown as Record<string, unknown>)),
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : '추가진입 조회 실패' };
  }
}

/**
 * 추가진입을 추가한다.
 *
 * - 부모 거래가 'open' 상태인지 확인
 * - 추가진입 레코드 삽입
 * - 부모 trades.entry_price는 변경하지 않음 (WAP는 항상 동적 계산)
 */
export async function addTradeScaleIn(
  supabase: Client,
  params: {
    tradeId: string
    userId: string
    entryPrice: number
    margin: number
    quantity?: number | null
    entryDatetime: string
    type: ScaleInTypeDb
    note?: string | null
  },
): Promise<ApiResult<TradeScaleInRow>> {
  try {
    // 부모 거래 상태 확인
    const { data: trade, error: tradeErr } = await supabase
      .from('trades')
      .select('id, status')
      .eq('id', params.tradeId)
      .single();

    if (tradeErr || !trade) {
      return { success: false, error: '거래를 찾을 수 없습니다.' };
    }

    if (trade.status !== 'open') {
      return { success: false, error: '이미 종료된 포지션에는 추가진입할 수 없습니다.' };
    }

    // 추가진입 삽입
    const { data, error } = await supabase
      .from('trade_scale_ins')
      .insert({
        trade_id: params.tradeId,
        user_id: params.userId,
        entry_price: params.entryPrice,
        margin: params.margin,
        quantity: params.quantity ?? null,
        entry_datetime: params.entryDatetime,
        type: params.type,
        note: params.note ?? null,
      })
      .select()
      .single();

    if (error || !data) {
      return { success: false, error: error?.message ?? '추가진입 저장 실패' };
    }

    return {
      success: true,
      data: normalizeRow(data as unknown as Record<string, unknown>),
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : '추가진입 추가 실패' };
  }
}

/**
 * 추가진입을 삭제한다.
 *
 * - 분할 청산 기록이 있는 경우 삭제 차단 (WAP가 변해서 기존 PnL이 부정확해짐)
 */
export async function deleteTradeScaleIn(
  supabase: Client,
  scaleInId: string,
  tradeId: string,
): Promise<ApiResult<null>> {
  try {
    // 분할 청산 존재 여부 확인
    const { count, error: countErr } = await supabase
      .from('trade_closes')
      .select('id', { count: 'exact', head: true })
      .eq('trade_id', tradeId);

    if (countErr) return { success: false, error: countErr.message };

    if (count && count > 0) {
      return {
        success: false,
        error: '분할 청산 기록이 있어 추가진입을 삭제할 수 없습니다. 분할 청산을 먼저 삭제해 주세요.',
      };
    }

    const { error } = await supabase
      .from('trade_scale_ins')
      .delete()
      .eq('id', scaleInId);

    if (error) return { success: false, error: error.message };
    return { success: true, data: null };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : '추가진입 삭제 실패' };
  }
}
