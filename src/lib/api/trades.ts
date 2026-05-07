/**
 * 거래(Trades) API 레이어
 *
 * Supabase SDK의 빌더 패턴을 사용하여 SQL injection을 방지한다.
 * 모든 함수는 ApiResult<T> 패턴으로 에러를 반환한다.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  Database,
  TradeRow,
  TradeInsert,
  TradeUpdate,
  TradeFilterParams,
  ApiResult,
} from '../supabase/types';
import { getErrorMessage } from './utils';

type Client = SupabaseClient<Database>;

/** 기본 페이지 크기 */
const DEFAULT_PAGE_SIZE = 50;
const DRAFT_VISIBLE_HOURS = 24;

function activeDraftCutoffIso(): string {
  return new Date(Date.now() - DRAFT_VISIBLE_HOURS * 60 * 60 * 1000).toISOString();
}

/**
 * 거래 목록을 필터 조건에 따라 조회한다.
 */
export async function getTrades(
  supabase: Client,
  userId: string,
  filters?: TradeFilterParams
): Promise<ApiResult<{ trades: TradeRow[]; total: number }>> {
  try {
    const page = filters?.page ?? 1;
    const pageSize = filters?.pageSize ?? DEFAULT_PAGE_SIZE;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('trades')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    if (!filters?.includeExpiredDrafts) {
      query = query.or(`import_status.is.null,import_status.neq.draft,created_at.gte.${activeDraftCutoffIso()}`);
    }

    // 필터 적용
    if (filters?.asset) {
      query = query.eq('asset', filters.asset);
    }
    if (filters?.direction) {
      query = query.eq('direction', filters.direction);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.result === 'profit') {
      query = query.gt('pnl', 0);
    } else if (filters?.result === 'loss') {
      query = query.lt('pnl', 0);
    }
    if (filters?.dateFrom) {
      query = query.gte('date', filters.dateFrom);
    }
    if (filters?.dateTo) {
      query = query.lte('date', filters.dateTo);
    }

    // 페이지네이션 적용
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: {
        trades: normalizeTradeRows((data ?? []) as Record<string, unknown>[]),
        total: count ?? 0,
      },
    };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

/**
 * 단일 거래를 ID로 조회한다.
 */
export async function getTradeById(
  supabase: Client,
  tradeId: string
): Promise<ApiResult<TradeRow>> {
  try {
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('id', tradeId)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: normalizeTradeRow(data as Record<string, unknown>) };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

/**
 * 오픈 포지션 목록을 조회한다.
 */
export async function getOpenTrades(
  supabase: Client,
  userId: string
): Promise<ApiResult<TradeRow[]>> {
  try {
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'open')
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: normalizeTradeRows((data ?? []) as Record<string, unknown>[]) };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

/**
 * 최근 N건의 거래를 조회한다 (대시보드용).
 */
export async function getRecentTrades(
  supabase: Client,
  userId: string,
  limit: number = 5
): Promise<ApiResult<TradeRow[]>> {
  try {
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: normalizeTradeRows((data ?? []) as Record<string, unknown>[]) };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

/**
 * 새로운 거래를 생성한다.
 */
export async function createTrade(
  supabase: Client,
  trade: TradeInsert
): Promise<ApiResult<TradeRow>> {
  try {
    const { data, error } = await supabase
      .from('trades')
      .insert(trade)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: normalizeTradeRow(data as Record<string, unknown>) };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

/**
 * 거래를 수정한다.
 */
export async function updateTrade(
  supabase: Client,
  tradeId: string,
  updates: TradeUpdate
): Promise<ApiResult<TradeRow>> {
  try {
    const { data, error } = await supabase
      .from('trades')
      .update(updates)
      .eq('id', tradeId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: normalizeTradeRow(data as Record<string, unknown>) };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

/**
 * 오픈 포지션을 청산한다.
 * 청산 가격과 일시를 받아 PnL을 계산하고 상태를 closed로 변경한다.
 *
 * Race Condition 해결(C-5):
 * 기존 2단계(SELECT -> UPDATE)를 단일 UPDATE with status='open' 조건으로 변경하여
 * 동시 청산 요청 시 첫 번째 요청만 성공하도록 보장한다.
 */
export async function closeTrade(
  supabase: Client,
  tradeId: string,
  exitPrice: number,
  exitDatetime: string
): Promise<ApiResult<TradeRow>> {
  try {
    // 먼저 현재 거래 정보를 조회 (PnL 계산에 필요한 데이터)
    const { data: trade, error: fetchError } = await supabase
      .from('trades')
      .select('direction, margin, leverage, entry_price')
      .eq('id', tradeId)
      .eq('status', 'open')
      .single();

    if (fetchError) {
      return { success: false, error: '오픈 포지션을 찾을 수 없습니다.' };
    }

    // PnL 계산: margin * leverage * ((exitPrice - entryPrice) / entryPrice) * direction
    const directionMultiplier = trade.direction === 'LONG' ? 1 : -1;
    const pnl =
      Number(trade.margin) *
      trade.leverage *
      ((exitPrice - Number(trade.entry_price)) / Number(trade.entry_price)) *
      directionMultiplier;

    // 소수점 2자리로 반올림
    const roundedPnl = Math.round(pnl * 100) / 100;

    // 단일 UPDATE에 status='open' 조건을 포함하여 원자적 청산 보장
    // 이미 closed 상태이면 0 rows affected -> .single()이 에러를 반환한다
    const { data, error } = await supabase
      .from('trades')
      .update({
        exit_price: exitPrice,
        exit_datetime: new Date(exitDatetime).toISOString(),
        pnl: roundedPnl,
        status: 'closed' as const,
      })
      .eq('id', tradeId)
      .eq('status', 'open')
      .select()
      .single();

    if (error) {
      // status='open' 조건에 매칭되는 행이 없으면 이미 청산된 거래
      if (error.code === 'PGRST116') {
        return { success: false, error: '이미 청산된 거래이거나 존재하지 않는 거래입니다.' };
      }
      return { success: false, error: error.message };
    }

    return { success: true, data: normalizeTradeRow(data as Record<string, unknown>) };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

/**
 * 거래를 삭제한다.
 */
export async function deleteTrade(
  supabase: Client,
  tradeId: string
): Promise<ApiResult<void>> {
  try {
    const { error } = await supabase
      .from('trades')
      .delete()
      .eq('id', tradeId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

/**
 * 모든 종료된 거래를 조회한다 (통계/차트 계산용).
 * 페이지네이션 없이 전체를 반환한다.
 */
export async function getAllClosedTrades(
  supabase: Client,
  userId: string
): Promise<ApiResult<TradeRow[]>> {
  try {
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'closed')
      .order('date', { ascending: true });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: normalizeTradeRows((data ?? []) as Record<string, unknown>[]) };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

// ────────────────────────────────────────────
// 유틸리티
// ────────────────────────────────────────────

/**
 * Supabase NUMERIC 타입 -> number 변환 유틸리티 (I-3 해결)
 *
 * PostgreSQL의 NUMERIC(18,2) / NUMERIC(24,8) 타입은
 * Supabase JS SDK에서 정밀도 손실 방지를 위해 string으로 반환될 수 있다.
 * 이 함수는 string | number | null 값을 안전하게 number | null로 변환한다.
 */
export function parseNumeric(value: string | number | null | undefined): number | null {
  if (value == null) return null;
  const num = Number(value);
  if (Number.isNaN(num) || !Number.isFinite(num)) return null;
  return num;
}

/**
 * TradeRow의 NUMERIC 필드들을 number 타입으로 정규화한다.
 * DB에서 조회한 row를 FE에 전달하기 전에 호출해야 한다.
 */
export function normalizeTradeRow(row: Record<string, unknown>): TradeRow {
  return {
    ...row,
    entry_price: parseNumeric(row.entry_price as string | number) ?? 0,
    exit_price: parseNumeric(row.exit_price as string | number | null),
    stop_loss_price: parseNumeric(row.stop_loss_price as string | number | null),
    margin: parseNumeric(row.margin as string | number) ?? 0,
    pnl: parseNumeric(row.pnl as string | number | null),
    fee: parseNumeric(row.fee as string | number | null),
    funding_fee: parseNumeric(row.funding_fee as string | number | null) ?? 0,
  } as TradeRow;
}

/**
 * TradeRow 배열의 NUMERIC 필드들을 일괄 정규화한다.
 */
export function normalizeTradeRows(rows: Record<string, unknown>[]): TradeRow[] {
  return rows.map(normalizeTradeRow);
}
