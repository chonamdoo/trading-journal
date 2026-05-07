import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  ApiResult,
  Database,
  PlanStatusDb,
  TradingPlanInsert,
  TradingPlanRow,
  TradingPlanUpdate,
} from '../supabase/types';
import { parseNumeric } from './trades';
import { getErrorMessage } from './utils';

type Client = SupabaseClient<Database>;

export interface PlanFilterParams {
  status?: PlanStatusDb;
  asset?: string;
}

function normalizePlanRow(row: Record<string, unknown>): TradingPlanRow {
  return {
    ...row,
    entry_price_min: parseNumeric(row.entry_price_min as string | number | null),
    entry_price_max: parseNumeric(row.entry_price_max as string | number | null),
    stop_loss_price: parseNumeric(row.stop_loss_price as string | number | null),
    risk_reward_ratio: parseNumeric(row.risk_reward_ratio as string | number | null),
    leverage_plan: parseNumeric(row.leverage_plan as string | number | null),
    margin_plan: parseNumeric(row.margin_plan as string | number | null),
    confidence_level: parseNumeric(row.confidence_level as string | number | null) ?? 0,
    plan_adherence: parseNumeric(row.plan_adherence as string | number | null),
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
  userId: string,
  planId: string,
): Promise<ApiResult<TradingPlanRow>> {
  try {
    const { data, error } = await supabase
      .from('trading_plans')
      .select('*')
      .eq('id', planId)
      .eq('user_id', userId)
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
  userId: string,
  planId: string,
  data: TradingPlanUpdate,
): Promise<ApiResult<TradingPlanRow>> {
  try {
    const { data: plan, error } = await supabase
      .from('trading_plans')
      .update(data)
      .eq('id', planId)
      .eq('user_id', userId)
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
  userId: string,
  planId: string,
): Promise<ApiResult<void>> {
  try {
    const { error } = await supabase
      .from('trading_plans')
      .delete()
      .eq('id', planId)
      .eq('user_id', userId);

    if (error) return { success: false, error: error.message };
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

export async function linkPlanToTrade(
  supabase: Client,
  userId: string,
  planId: string,
  tradeId: string,
): Promise<ApiResult<TradingPlanRow>> {
  const { data: trade, error } = await supabase
    .from('trades')
    .select('id')
    .eq('id', tradeId)
    .eq('user_id', userId)
    .single();

  if (error || !trade) {
    return { success: false, error: error?.message ?? 'Trade not found' };
  }

  return updatePlan(supabase, userId, planId, {
    linked_trade_id: tradeId,
    linked_at: new Date().toISOString(),
    status: 'linked',
  });
}

export async function unlinkPlan(
  supabase: Client,
  userId: string,
  planId: string,
): Promise<ApiResult<TradingPlanRow>> {
  return updatePlan(supabase, userId, planId, {
    linked_trade_id: null,
    linked_at: null,
    status: 'active',
  });
}
