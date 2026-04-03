/**
 * 트레이딩 플랜 API 레이어
 *
 * 매매 전 시나리오를 기록하고, 실제 거래와 연결하여 비교 복기한다.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, TradingPlanRow, TradingPlanInsert, TradingPlanUpdate, ApiResult, PlanStatusDb } from '../supabase/types';
import { parseNumeric } from './trades';

type Client = SupabaseClient<Database>;

const DEFAULT_PAGE_SIZE = 50;

/** NUMERIC 필드를 number로 변환한다 */
function normalizeRow(row: Record<string, unknown>): TradingPlanRow {
  return {
    ...row,
    entry_price_min: parseNumeric(row.entry_price_min as string | number | null),
    entry_price_max: parseNumeric(row.entry_price_max as string | number | null),
    stop_loss_price: parseNumeric(row.stop_loss_price as string | number | null),
    risk_reward_ratio: parseNumeric(row.risk_reward_ratio as string | number | null),
    margin_plan: parseNumeric(row.margin_plan as string | number | null),
    confidence_level: Number(row.confidence_level),
    leverage_plan: row.leverage_plan != null ? Number(row.leverage_plan) : null,
    plan_adherence: row.plan_adherence != null ? Number(row.plan_adherence) : null,
  } as TradingPlanRow;
}

function normalizeRows(rows: Record<string, unknown>[]): TradingPlanRow[] {
  return rows.map(normalizeRow);
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return '알 수 없는 오류가 발생했습니다.';
}

/** 필터 파라미터 */
export interface PlanFilterParams {
  status?: PlanStatusDb;
  asset?: string;
  page?: number;
  pageSize?: number;
}

/** 플랜 목록 조회 (필터 + 페이지네이션) */
export async function getPlans(
  supabase: Client,
  userId: string,
  filters?: PlanFilterParams,
): Promise<ApiResult<{ plans: TradingPlanRow[]; total: number }>> {
  try {
    const page = filters?.page ?? 1;
    const pageSize = filters?.pageSize ?? DEFAULT_PAGE_SIZE;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('trading_plans')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.asset) {
      query = query.eq('asset', filters.asset);
    }

    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) return { success: false, error: error.message };

    return {
      success: true,
      data: {
        plans: normalizeRows((data ?? []) as unknown as Record<string, unknown>[]),
        total: count ?? 0,
      },
    };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

/** 단일 플랜 조회 */
export async function getPlanById(
  supabase: Client,
  planId: string,
): Promise<ApiResult<TradingPlanRow>> {
  try {
    const { data, error } = await supabase
      .from('trading_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: normalizeRow(data as unknown as Record<string, unknown>) };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

/** 활성 플랜 조회 (대시보드용) */
export async function getActivePlans(
  supabase: Client,
  userId: string,
  limit: number = 3,
): Promise<ApiResult<TradingPlanRow[]>> {
  try {
    const { data, error } = await supabase
      .from('trading_plans')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) return { success: false, error: error.message };
    return { success: true, data: normalizeRows((data ?? []) as unknown as Record<string, unknown>[]) };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

/** 특정 거래에 연결된 플랜 조회 */
export async function getPlanByTradeId(
  supabase: Client,
  tradeId: string,
): Promise<ApiResult<TradingPlanRow | null>> {
  try {
    const { data, error } = await supabase
      .from('trading_plans')
      .select('*')
      .eq('linked_trade_id', tradeId)
      .maybeSingle();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data ? normalizeRow(data as unknown as Record<string, unknown>) : null };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

/** 플랜 생성 */
export async function createPlan(
  supabase: Client,
  plan: TradingPlanInsert,
): Promise<ApiResult<TradingPlanRow>> {
  try {
    const { data, error } = await supabase
      .from('trading_plans')
      .insert(plan)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: normalizeRow(data as unknown as Record<string, unknown>) };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

/** 플랜 수정 */
export async function updatePlan(
  supabase: Client,
  planId: string,
  updates: TradingPlanUpdate,
): Promise<ApiResult<TradingPlanRow>> {
  try {
    const { data, error } = await supabase
      .from('trading_plans')
      .update(updates)
      .eq('id', planId)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: normalizeRow(data as unknown as Record<string, unknown>) };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

/** 플랜-거래 연결 */
export async function linkPlanToTrade(
  supabase: Client,
  planId: string,
  tradeId: string,
): Promise<ApiResult<TradingPlanRow>> {
  try {
    const { data, error } = await supabase
      .from('trading_plans')
      .update({
        linked_trade_id: tradeId,
        linked_at: new Date().toISOString(),
        status: 'linked' as const,
      })
      .eq('id', planId)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: normalizeRow(data as unknown as Record<string, unknown>) };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

/** 플랜-거래 연결 해제 */
export async function unlinkPlan(
  supabase: Client,
  planId: string,
): Promise<ApiResult<TradingPlanRow>> {
  try {
    const { data, error } = await supabase
      .from('trading_plans')
      .update({
        linked_trade_id: null,
        linked_at: null,
        status: 'active' as const,
      })
      .eq('id', planId)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: normalizeRow(data as unknown as Record<string, unknown>) };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

/** 플랜 삭제 */
export async function deletePlan(
  supabase: Client,
  planId: string,
): Promise<ApiResult<void>> {
  try {
    const { error } = await supabase
      .from('trading_plans')
      .delete()
      .eq('id', planId);

    if (error) return { success: false, error: error.message };
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}
