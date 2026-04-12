'use client';

/**
 * 클라이언트용 fetch 함수 모음
 *
 * 각 함수는 apiFetch/apiFetchFormData를 통해 /api/* Route Handler를 호출한다.
 * 기존 서버용 함수(getTrades 등)는 Route Handler에서 계속 사용하므로 삭제하지 않는다.
 */

import { apiFetch, apiFetchFormData } from './client';
import type { ApiResult } from './client';
import type {
  TradeRow,
  TradeInsert,
  TradeUpdate,
  TradeFilterParams,
  DepositRow,
  DepositInsert,
  ProfileRow,
  ProfileUpdate,
  TargetRow,
  CustomAssetRow,
  TradingPlanRow,
  TradingPlanInsert,
  TradingPlanUpdate,
  MonthlyReportRow,
  TradeCloseRow,
  TradeScaleInRow,
  TradeScreenshotRow,
  ScaleInTypeDb,
} from '../supabase/types';

// ── Trades ──

export async function fetchTrades(
  filters?: TradeFilterParams,
): Promise<ApiResult<{ trades: TradeRow[]; total: number }>> {
  const params = new URLSearchParams();
  if (filters?.page) params.set('page', String(filters.page));
  if (filters?.pageSize) params.set('pageSize', String(filters.pageSize));
  if (filters?.asset) params.set('asset', filters.asset);
  if (filters?.direction) params.set('direction', filters.direction);
  if (filters?.status) params.set('status', filters.status);
  if (filters?.result) params.set('result', filters.result);
  if (filters?.dateFrom) params.set('dateFrom', filters.dateFrom);
  if (filters?.dateTo) params.set('dateTo', filters.dateTo);
  const qs = params.toString();
  const result = await apiFetch<{ success: boolean; data: { trades: TradeRow[]; total: number } }>(
    `/api/trades${qs ? `?${qs}` : ''}`,
  );
  if (!result.success) return result;
  return { success: true, data: result.data.data };
}

export async function fetchCreateTrade(
  data: Omit<TradeInsert, 'user_id'>,
): Promise<ApiResult<TradeRow>> {
  const result = await apiFetch<{ success: boolean; data: TradeRow }>(
    '/api/trades',
    { method: 'POST', body: JSON.stringify(data) },
  );
  if (!result.success) return result;
  return { success: true, data: result.data.data };
}

export async function fetchUpdateTrade(
  id: string,
  data: TradeUpdate,
): Promise<ApiResult<TradeRow>> {
  const result = await apiFetch<{ success: boolean; data: TradeRow }>(
    `/api/trades/${id}`,
    { method: 'PUT', body: JSON.stringify(data) },
  );
  if (!result.success) return result;
  return { success: true, data: result.data.data };
}

export async function fetchDeleteTrade(id: string): Promise<ApiResult<void>> {
  const result = await apiFetch<{ success: boolean }>(
    `/api/trades/${id}`,
    { method: 'DELETE' },
  );
  if (!result.success) return result;
  return { success: true, data: undefined };
}

export async function fetchCloseTrade(
  id: string,
  exitPrice: number,
  exitDatetime: string,
): Promise<ApiResult<TradeRow>> {
  const result = await apiFetch<{ success: boolean; data: TradeRow }>(
    `/api/trades/${id}/close`,
    { method: 'POST', body: JSON.stringify({ exitPrice, exitDatetime }) },
  );
  if (!result.success) return result;
  return { success: true, data: result.data.data };
}

export async function fetchTradeById(id: string): Promise<ApiResult<TradeRow>> {
  const result = await apiFetch<{ success: boolean; data: TradeRow }>(`/api/trades/${id}`);
  if (!result.success) return result;
  return { success: true, data: result.data.data };
}

// ── Trade Closes ──

export async function fetchTradeCloses(tradeId: string): Promise<ApiResult<TradeCloseRow[]>> {
  const result = await apiFetch<{ success: boolean; data: TradeCloseRow[] }>(
    `/api/trades/${tradeId}/closes`,
  );
  if (!result.success) return result;
  return { success: true, data: result.data.data };
}

export async function fetchAddTradeClose(
  tradeId: string,
  params: {
    exitPrice: number;
    exitDatetime: string;
    quantityPct: number;
    closeMargin?: number | null;
    pnl: number;
  },
): Promise<ApiResult<{ close: TradeCloseRow; isFullyClosed: boolean }>> {
  const result = await apiFetch<{ success: boolean; data: { close: TradeCloseRow; isFullyClosed: boolean } }>(
    `/api/trades/${tradeId}/closes`,
    { method: 'POST', body: JSON.stringify(params) },
  );
  if (!result.success) return result;
  return { success: true, data: result.data.data };
}

export async function fetchDeleteTradeClose(
  tradeId: string,
  closeId: string,
): Promise<ApiResult<void>> {
  const result = await apiFetch<{ success: boolean }>(
    `/api/trades/${tradeId}/closes/${closeId}`,
    { method: 'DELETE' },
  );
  if (!result.success) return result;
  return { success: true, data: undefined };
}

// ── Trade Scale-ins ──

export async function fetchTradeScaleIns(tradeId: string): Promise<ApiResult<TradeScaleInRow[]>> {
  const result = await apiFetch<{ success: boolean; data: TradeScaleInRow[] }>(
    `/api/trades/${tradeId}/scale-ins`,
  );
  if (!result.success) return result;
  return { success: true, data: result.data.data };
}

export async function fetchAddTradeScaleIn(
  tradeId: string,
  params: {
    entryPrice: number;
    margin: number;
    quantity?: number | null;
    entryDatetime: string;
    type: ScaleInTypeDb;
    note?: string | null;
  },
): Promise<ApiResult<TradeScaleInRow>> {
  const result = await apiFetch<{ success: boolean; data: TradeScaleInRow }>(
    `/api/trades/${tradeId}/scale-ins`,
    { method: 'POST', body: JSON.stringify(params) },
  );
  if (!result.success) return result;
  return { success: true, data: result.data.data };
}

export async function fetchDeleteTradeScaleIn(
  tradeId: string,
  scaleInId: string,
): Promise<ApiResult<void>> {
  const result = await apiFetch<{ success: boolean }>(
    `/api/trades/${tradeId}/scale-ins/${scaleInId}`,
    { method: 'DELETE' },
  );
  if (!result.success) return result;
  return { success: true, data: undefined };
}

// ── Screenshots ──

export async function fetchScreenshots(
  tradeId: string,
): Promise<ApiResult<(TradeScreenshotRow & { url: string })[]>> {
  const result = await apiFetch<{ success: boolean; data: (TradeScreenshotRow & { url: string })[] }>(
    `/api/trades/${tradeId}/screenshots`,
  );
  if (!result.success) return result;
  return { success: true, data: result.data.data };
}

export async function fetchUploadScreenshot(
  tradeId: string,
  file: File,
  sortOrder: number,
): Promise<ApiResult<TradeScreenshotRow & { url: string }>> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('sortOrder', String(sortOrder));
  const result = await apiFetchFormData<{ success: boolean; data: TradeScreenshotRow & { url: string } }>(
    `/api/trades/${tradeId}/screenshots`,
    formData,
  );
  if (!result.success) return result;
  return { success: true, data: result.data.data };
}

export async function fetchDeleteScreenshot(
  tradeId: string,
  screenshotId: string,
  storagePath: string,
): Promise<ApiResult<void>> {
  const params = new URLSearchParams({ storagePath });
  const result = await apiFetch<{ success: boolean }>(
    `/api/trades/${tradeId}/screenshots/${screenshotId}?${params}`,
    { method: 'DELETE' },
  );
  if (!result.success) return result;
  return { success: true, data: undefined };
}

// ── Deposits ──

export async function fetchDeposits(): Promise<ApiResult<DepositRow[]>> {
  const result = await apiFetch<{ success: boolean; data: DepositRow[] }>('/api/deposits');
  if (!result.success) return result;
  return { success: true, data: result.data.data };
}

export async function fetchCreateDeposit(
  data: Omit<DepositInsert, 'user_id'>,
): Promise<ApiResult<DepositRow>> {
  const result = await apiFetch<{ success: boolean; data: DepositRow }>(
    '/api/deposits',
    { method: 'POST', body: JSON.stringify(data) },
  );
  if (!result.success) return result;
  return { success: true, data: result.data.data };
}

export async function fetchDeleteDeposit(id: string): Promise<ApiResult<void>> {
  const result = await apiFetch<{ success: boolean }>(
    `/api/deposits/${id}`,
    { method: 'DELETE' },
  );
  if (!result.success) return result;
  return { success: true, data: undefined };
}

// ── Profile ──

export async function fetchProfile(): Promise<ApiResult<ProfileRow>> {
  const result = await apiFetch<{ success: boolean; data: ProfileRow }>('/api/profile');
  if (!result.success) return result;
  return { success: true, data: result.data.data };
}

export async function fetchUpdateProfile(data: ProfileUpdate): Promise<ApiResult<ProfileRow>> {
  const result = await apiFetch<{ success: boolean; data: ProfileRow }>(
    '/api/profile',
    { method: 'PUT', body: JSON.stringify(data) },
  );
  if (!result.success) return result;
  return { success: true, data: result.data.data };
}

// ── Targets ──

export async function fetchTargets(): Promise<ApiResult<TargetRow[]>> {
  const result = await apiFetch<{ success: boolean; data: TargetRow[] }>('/api/targets');
  if (!result.success) return result;
  return { success: true, data: result.data.data };
}

export async function fetchCreateTarget(
  data: { label: string; amount: number },
): Promise<ApiResult<TargetRow>> {
  const result = await apiFetch<{ success: boolean; data: TargetRow }>(
    '/api/targets',
    { method: 'POST', body: JSON.stringify(data) },
  );
  if (!result.success) return result;
  return { success: true, data: result.data.data };
}

export async function fetchDeleteTarget(id: string): Promise<ApiResult<void>> {
  const result = await apiFetch<{ success: boolean }>(
    `/api/targets/${id}`,
    { method: 'DELETE' },
  );
  if (!result.success) return result;
  return { success: true, data: undefined };
}

// ── Assets ──

export async function fetchCustomAssets(): Promise<ApiResult<CustomAssetRow[]>> {
  const result = await apiFetch<{ success: boolean; data: CustomAssetRow[] }>('/api/assets/custom');
  if (!result.success) return result;
  return { success: true, data: result.data.data };
}

export async function fetchAddCustomAsset(symbol: string): Promise<ApiResult<CustomAssetRow>> {
  const result = await apiFetch<{ success: boolean; data: CustomAssetRow }>(
    '/api/assets/custom',
    { method: 'POST', body: JSON.stringify({ symbol }) },
  );
  if (!result.success) return result;
  return { success: true, data: result.data.data };
}

export async function fetchDeleteCustomAsset(id: string): Promise<ApiResult<void>> {
  const result = await apiFetch<{ success: boolean }>(
    `/api/assets/custom/${id}`,
    { method: 'DELETE' },
  );
  if (!result.success) return result;
  return { success: true, data: undefined };
}

// ── Plans ──

export async function fetchPlans(filters?: {
  status?: string;
  asset?: string;
  page?: number;
  pageSize?: number;
}): Promise<ApiResult<{ plans: TradingPlanRow[]; total: number }>> {
  const params = new URLSearchParams();
  if (filters?.status) params.set('status', filters.status);
  if (filters?.asset) params.set('asset', filters.asset);
  if (filters?.page) params.set('page', String(filters.page));
  if (filters?.pageSize) params.set('pageSize', String(filters.pageSize));
  const qs = params.toString();
  const result = await apiFetch<{ success: boolean; data: { plans: TradingPlanRow[]; total: number } }>(
    `/api/plans${qs ? `?${qs}` : ''}`,
  );
  if (!result.success) return result;
  return { success: true, data: result.data.data };
}

export async function fetchActivePlans(): Promise<ApiResult<TradingPlanRow[]>> {
  const result = await apiFetch<{ success: boolean; data: TradingPlanRow[] }>('/api/plans/active');
  if (!result.success) return result;
  return { success: true, data: result.data.data };
}

export async function fetchPlanById(id: string): Promise<ApiResult<TradingPlanRow>> {
  const result = await apiFetch<{ success: boolean; data: TradingPlanRow }>(`/api/plans/${id}`);
  if (!result.success) return result;
  return { success: true, data: result.data.data };
}

export async function fetchCreatePlan(
  data: Omit<TradingPlanInsert, 'user_id'>,
): Promise<ApiResult<TradingPlanRow>> {
  const result = await apiFetch<{ success: boolean; data: TradingPlanRow }>(
    '/api/plans',
    { method: 'POST', body: JSON.stringify(data) },
  );
  if (!result.success) return result;
  return { success: true, data: result.data.data };
}

export async function fetchUpdatePlan(
  id: string,
  data: TradingPlanUpdate,
): Promise<ApiResult<TradingPlanRow>> {
  const result = await apiFetch<{ success: boolean; data: TradingPlanRow }>(
    `/api/plans/${id}`,
    { method: 'PUT', body: JSON.stringify(data) },
  );
  if (!result.success) return result;
  return { success: true, data: result.data.data };
}

export async function fetchDeletePlan(id: string): Promise<ApiResult<void>> {
  const result = await apiFetch<{ success: boolean }>(
    `/api/plans/${id}`,
    { method: 'DELETE' },
  );
  if (!result.success) return result;
  return { success: true, data: undefined };
}

export async function fetchLinkPlanToTrade(
  planId: string,
  tradeId: string,
): Promise<ApiResult<TradingPlanRow>> {
  const result = await apiFetch<{ success: boolean; data: TradingPlanRow }>(
    `/api/plans/${planId}/link`,
    { method: 'POST', body: JSON.stringify({ tradeId }) },
  );
  if (!result.success) return result;
  return { success: true, data: result.data.data };
}

export async function fetchUnlinkPlan(planId: string): Promise<ApiResult<TradingPlanRow>> {
  const result = await apiFetch<{ success: boolean; data: TradingPlanRow }>(
    `/api/plans/${planId}/link`,
    { method: 'DELETE' },
  );
  if (!result.success) return result;
  return { success: true, data: result.data.data };
}

export async function fetchPlanByTradeId(
  tradeId: string,
): Promise<ApiResult<TradingPlanRow | null>> {
  const params = new URLSearchParams({ linkedTradeId: tradeId });
  const result = await apiFetch<{ success: boolean; data: TradingPlanRow | null }>(
    `/api/plans?${params}`,
  );
  if (!result.success) return result;
  return { success: true, data: result.data.data };
}

// ── Reports ──

export async function fetchReports(): Promise<ApiResult<MonthlyReportRow[]>> {
  const result = await apiFetch<{ success: boolean; data: MonthlyReportRow[] }>('/api/reports');
  if (!result.success) return result;
  return { success: true, data: result.data.data };
}

export async function fetchReportsByType(
  periodType: 'weekly' | 'monthly' | 'yearly',
): Promise<ApiResult<MonthlyReportRow[]>> {
  const params = new URLSearchParams({ periodType });
  const result = await apiFetch<{ success: boolean; data: MonthlyReportRow[] }>(
    `/api/reports?${params}`,
  );
  if (!result.success) return result;
  return { success: true, data: result.data.data };
}

export async function fetchReportById(id: string): Promise<ApiResult<MonthlyReportRow>> {
  const result = await apiFetch<{ success: boolean; data: MonthlyReportRow }>(`/api/reports/${id}`);
  if (!result.success) return result;
  return { success: true, data: result.data.data };
}

export async function generateWeeklyReport(
  year: number,
  month: number,
  week: number,
): Promise<ApiResult<MonthlyReportRow>> {
  const result = await apiFetch<{ success: boolean; report: MonthlyReportRow }>(
    '/api/report/generate',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ year, month, periodType: 'weekly', week }),
    },
  );
  if (!result.success) return result;
  return { success: true, data: result.data.report };
}

// ── Market Insight (공개 데이터 — 인증 불필요) ──

export interface MarketInsight {
  fearGreed: { value: number; classification: string };
  btcDominance: number;
  btcPrice: number;
  btcChange24h: number;
  totalMarketCap: number;
}

export async function fetchMarketInsight(): Promise<MarketInsight | null> {
  try {
    const res = await fetch('/api/market/insight');
    if (!res.ok) return null;
    return res.json() as Promise<MarketInsight>;
  } catch {
    return null;
  }
}
