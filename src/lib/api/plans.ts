import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  ApiResult,
  Database,
  PlanStatusDb,
  TradingPlanInsert,
  TradingPlanRow,
  TradingPlanUpdate,
} from '../supabase/types';
import { getErrorMessage } from './utils';

type Client = SupabaseClient<Database>;

export interface PlanFilterParams {
  status?: PlanStatusDb;
  asset?: string;
}

function normalizePlanRow(row: Record<string, unknown>): TradingPlanRow {
  return {
    ...row,
    entry_price_min: row.entry_price_min != null ? Number(row.entry_price_min) : null,
    entry_price_max: row.entry_price_max != null ? Number(row.entry_price_max) : null,
    stop_loss_price: row.stop_loss_price != null ? Number(row.stop_loss_price) : null,
    risk_reward_ratio: row.risk_reward_ratio != null ? Number(row.risk_reward_ratio) : null,
    leverage_plan: row.leverage_plan != null ? Number(row.leverage_plan) : null,
    margin_plan: row.margin_plan != null ? Number(row.margin_plan) : null,
    confidence_level: Number(row.confidence_level),
    plan_adherence: row.plan_adherence != null ? Number(row.plan_adherence) : null,
    target_prices: row.target_prices ?? [],
  } as TradingPlanRow;
}

function normalizePlanRows(rows: Record<string, unknown>[]): TradingPlanRow[] {
  return rows.map(normalizePlanRow);
}

export async function getPlans(
  supabase: Client,
  userId: string,
  filters: PlanFilterParams = {},
): Promise<ApiResult<TradingPlanRow[]>> {
  try {
    let query = supabase
      .from('trading_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (filters.status) query = query.eq('status', filters.status);
    if (filters.asset) query = query.eq('asset', filters.asset);

    const { data, error } = await query;
    if (error) return { success: false, error: error.message };
    return { success: true, data: normalizePlanRows((data ?? []) as Record<string, unknown>[]) };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

export async function getActivePlans(
  supabase: Client,
  userId: string,
): Promise<ApiResult<TradingPlanRow[]>> {
  return getPlans(supabase, userId, { status: 'active' });
}

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
    return { success: true, data: normalizePlanRow(data as Record<string, unknown>) };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

export async function createPlan(
  supabase: Client,
  userId: string,
  data: Omit<TradingPlanInsert, 'user_id'>,
): Promise<ApiResult<TradingPlanRow>> {
  try {
    const { data: plan, error } = await supabase
      .from('trading_plans')
      .insert({ ...data, user_id: userId })
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: normalizePlanRow(plan as Record<string, unknown>) };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

export async function updatePlan(
  supabase: Client,
  planId: string,
  data: TradingPlanUpdate,
): Promise<ApiResult<TradingPlanRow>> {
  try {
    const { data: plan, error } = await supabase
      .from('trading_plans')
      .update(data)
      .eq('id', planId)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: normalizePlanRow(plan as Record<string, unknown>) };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

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

export async function linkPlanToTrade(
  supabase: Client,
  planId: string,
  tradeId: string,
): Promise<ApiResult<TradingPlanRow>> {
  return updatePlan(supabase, planId, {
    linked_trade_id: tradeId,
    linked_at: new Date().toISOString(),
    status: 'linked',
  });
}

export async function unlinkPlan(
  supabase: Client,
  planId: string,
): Promise<ApiResult<TradingPlanRow>> {
  return updatePlan(supabase, planId, {
    linked_trade_id: null,
    linked_at: null,
    status: 'active',
  });
}
