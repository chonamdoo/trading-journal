'use client';

/**
 * 클라이언트용 fetch 함수 모음
 *
 * 각 함수는 apiFetch/apiFetchFormData를 통해 /api/* Route Handler를 호출한다.
 * 기존 서버용 함수(getTrades 등)는 Route Handler에서 계속 사용하므로 삭제하지 않는다.
 */

import { apiFetch, apiFetchBlob, apiFetchFormData } from './client';
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
  MonthlyReportRow,
  TradeCloseRow,
  TradeScaleInRow,
  TradeScreenshotRow,
  ScaleInTypeDb,
} from '../supabase/types';

export interface ExchangeConnectionPublic {
  id: string;
  exchange: 'binance' | 'bybit' | 'okx' | 'bitget';
  label: string | null;
  permissions_verified: boolean;
  is_active: boolean;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BinanceConnectionResponse extends ExchangeConnectionPublic {
  permissions?: {
    canRead: boolean;
    futuresEnabled: boolean;
    ipRestricted: boolean;
  };
}

export interface BybitConnectionResponse extends ExchangeConnectionPublic {
  permissions?: {
    canRead: boolean;
    derivativesEnabled: boolean;
    ipRestricted: boolean;
    unifiedTradingAccount: boolean;
  };
}

export interface OkxConnectionResponse extends ExchangeConnectionPublic {
  permissions?: {
    canRead: boolean;
    accountLevel: string | null;
    positionMode: string | null;
  };
}

export interface BitgetConnectionResponse extends ExchangeConnectionPublic {
  permissions?: {
    canRead: boolean;
    futuresReadEnabled: boolean;
    ipRestricted: boolean;
  };
}

export interface BybitSyncResponse {
  from: string;
  to: string;
  found: number;
  imported: number;
  skipped: number;
}

export interface BinanceSyncResponse extends BybitSyncResponse {
  symbols: string[];
}

export type GenericExchangeSyncResponse = BybitSyncResponse;

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
  if (filters?.includeExpiredDrafts) params.set('includeExpiredDrafts', 'true');
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

// ── Exchange Connections ──

export async function fetchBinanceConnection(): Promise<ApiResult<ExchangeConnectionPublic | null>> {
  const result = await apiFetch<{ success: boolean; data: ExchangeConnectionPublic | null }>(
    '/api/exchange/binance/connection',
  );
  if (!result.success) return result;
  return { success: true, data: result.data.data };
}

export async function fetchSaveBinanceConnection(params: {
  apiKey: string;
  apiSecret: string;
  label?: string;
}): Promise<ApiResult<BinanceConnectionResponse>> {
  const result = await apiFetch<{ success: boolean; data: BinanceConnectionResponse }>(
    '/api/exchange/binance/connection',
    { method: 'POST', body: JSON.stringify(params) },
  );
  if (!result.success) return result;
  return { success: true, data: result.data.data };
}

export async function fetchDeleteBinanceConnection(): Promise<ApiResult<void>> {
  const result = await apiFetch<{ success: boolean }>(
    '/api/exchange/binance/connection',
    { method: 'DELETE' },
  );
  if (!result.success) return result;
  return { success: true, data: undefined };
}

export async function fetchOkxConnection(): Promise<ApiResult<ExchangeConnectionPublic | null>> {
  const result = await apiFetch<{ success: boolean; data: ExchangeConnectionPublic | null }>(
    '/api/exchange/okx/connection',
  );
  if (!result.success) return result;
  return { success: true, data: result.data.data };
}

export async function fetchSaveOkxConnection(params: {
  apiKey: string;
  apiSecret: string;
  passphrase: string;
  label?: string;
}): Promise<ApiResult<OkxConnectionResponse>> {
  const result = await apiFetch<{ success: boolean; data: OkxConnectionResponse }>(
    '/api/exchange/okx/connection',
    { method: 'POST', body: JSON.stringify(params) },
  );
  if (!result.success) return result;
  return { success: true, data: result.data.data };
}

export async function fetchDeleteOkxConnection(): Promise<ApiResult<void>> {
  const result = await apiFetch<{ success: boolean }>(
    '/api/exchange/okx/connection',
    { method: 'DELETE' },
  );
  if (!result.success) return result;
  return { success: true, data: undefined };
}

export async function fetchSyncOkxTrades(params: { days?: number; from?: string; to?: string } = {}): Promise<ApiResult<GenericExchangeSyncResponse>> {
  const result = await apiFetch<{ success: boolean; data: GenericExchangeSyncResponse }>(
    '/api/exchange/okx/sync',
    { method: 'POST', body: JSON.stringify(params) },
  );
  if (!result.success) return result;
  return { success: true, data: result.data.data };
}

export async function fetchBitgetConnection(): Promise<ApiResult<ExchangeConnectionPublic | null>> {
  const result = await apiFetch<{ success: boolean; data: ExchangeConnectionPublic | null }>(
    '/api/exchange/bitget/connection',
  );
  if (!result.success) return result;
  return { success: true, data: result.data.data };
}

export async function fetchSaveBitgetConnection(params: {
  apiKey: string;
  apiSecret: string;
  passphrase: string;
  label?: string;
}): Promise<ApiResult<BitgetConnectionResponse>> {
  const result = await apiFetch<{ success: boolean; data: BitgetConnectionResponse }>(
    '/api/exchange/bitget/connection',
    { method: 'POST', body: JSON.stringify(params) },
  );
  if (!result.success) return result;
  return { success: true, data: result.data.data };
}

export async function fetchDeleteBitgetConnection(): Promise<ApiResult<void>> {
  const result = await apiFetch<{ success: boolean }>(
    '/api/exchange/bitget/connection',
    { method: 'DELETE' },
  );
  if (!result.success) return result;
  return { success: true, data: undefined };
}

export async function fetchSyncBitgetTrades(params: { days?: number; from?: string; to?: string } = {}): Promise<ApiResult<GenericExchangeSyncResponse>> {
  const result = await apiFetch<{ success: boolean; data: GenericExchangeSyncResponse }>(
    '/api/exchange/bitget/sync',
    { method: 'POST', body: JSON.stringify(params) },
  );
  if (!result.success) return result;
  return { success: true, data: result.data.data };
}

export async function fetchSyncBinanceTrades(params: { days?: number; from?: string; to?: string } = {}): Promise<ApiResult<BinanceSyncResponse>> {
  const result = await apiFetch<{ success: boolean; data: BinanceSyncResponse }>(
    '/api/exchange/binance/sync',
    { method: 'POST', body: JSON.stringify(params) },
  );
  if (!result.success) return result;
  return { success: true, data: result.data.data };
}

export async function fetchBybitConnection(): Promise<ApiResult<ExchangeConnectionPublic | null>> {
  const result = await apiFetch<{ success: boolean; data: ExchangeConnectionPublic | null }>(
    '/api/exchange/bybit/connection',
  );
  if (!result.success) return result;
  return { success: true, data: result.data.data };
}

export async function fetchSaveBybitConnection(params: {
  apiKey: string;
  apiSecret: string;
  label?: string;
}): Promise<ApiResult<BybitConnectionResponse>> {
  const result = await apiFetch<{ success: boolean; data: BybitConnectionResponse }>(
    '/api/exchange/bybit/connection',
    { method: 'POST', body: JSON.stringify(params) },
  );
  if (!result.success) return result;
  return { success: true, data: result.data.data };
}

export async function fetchDeleteBybitConnection(): Promise<ApiResult<void>> {
  const result = await apiFetch<{ success: boolean }>(
    '/api/exchange/bybit/connection',
    { method: 'DELETE' },
  );
  if (!result.success) return result;
  return { success: true, data: undefined };
}

export async function fetchSyncBybitTrades(params: { days?: number; from?: string; to?: string } = {}): Promise<ApiResult<BybitSyncResponse>> {
  const result = await apiFetch<{ success: boolean; data: BybitSyncResponse }>(
    '/api/exchange/bybit/sync',
    { method: 'POST', body: JSON.stringify(params) },
  );
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

export async function fetchScreenshotBlob(
  tradeId: string,
  screenshotId: string,
): Promise<ApiResult<Blob>> {
  return apiFetchBlob(`/api/trades/${tradeId}/screenshots/${screenshotId}/download`);
}

// ── Deposits ──

export async function fetchDeposits(): Promise<ApiResult<DepositRow[]>> {
  const result = await apiFetch<{ success: boolean; data: DepositRow[] }>('/api/deposits');
  if (!result.success) return result;
  return { success: true, data: result.data.data };
}

export async function fetchDepositTotal(): Promise<ApiResult<number>> {
  const result = await apiFetch<{ success: boolean; data: number }>('/api/deposits/total');
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

export async function fetchSetInitialCapital(amount: number): Promise<ApiResult<ProfileRow>> {
  const result = await apiFetch<{ success: boolean; data: ProfileRow }>(
    '/api/profile/initial-capital',
    { method: 'PUT', body: JSON.stringify({ amount }) },
  );
  if (!result.success) return result;
  return { success: true, data: result.data.data };
}

export async function fetchOnboardingStatus(): Promise<ApiResult<{ completed: boolean }>> {
  const result = await apiFetch<{ success: boolean; data: { completed: boolean } }>(
    '/api/profile/onboarding',
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

export async function fetchReorderTargets(targetIds: string[]): Promise<ApiResult<void>> {
  const result = await apiFetch<{ success: boolean; data: null }>(
    '/api/targets/reorder',
    { method: 'POST', body: JSON.stringify({ targetIds }) },
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

// ── Favorites ──

export async function fetchFavorites(): Promise<ApiResult<string[]>> {
  const result = await apiFetch<{ success: boolean; data: string[] }>('/api/favorites');
  if (!result.success) return result;
  return { success: true, data: result.data.data };
}

export async function fetchSetFavorite(
  symbol: string,
  favorited: boolean,
): Promise<ApiResult<{ favorited: boolean }>> {
  const result = await apiFetch<{
    success: boolean;
    data: { favorited: boolean };
  }>('/api/favorites/set', {
    method: 'POST',
    body: JSON.stringify({ symbol, favorited }),
  });
  if (!result.success) return result;
  return { success: true, data: result.data.data };
}

export async function fetchToggleFavorite(
  symbol: string,
): Promise<ApiResult<{ favorited: boolean; id?: string }>> {
  const result = await apiFetch<{
    success: boolean;
    data: { favorited: boolean; id?: string };
  }>('/api/favorites/toggle', {
    method: 'POST',
    body: JSON.stringify({ symbol }),
  });
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

// ── Import (레거시 v4 JSON 마이그레이션) ──

export interface ImportTrade {
  date: string
  entryDatetime?: string | null
  exitDatetime?: string | null
  asset: string
  direction: 'LONG' | 'SHORT'
  leverage: number
  entryPrice: number
  exitPrice?: number | null
  margin: number
  status?: 'open' | 'closed'
  pnl?: number | null
  reason?: string | null
  notes?: string | null
}

export interface ImportDeposit {
  date: string
  amount: number
  memo?: string | null
}

export interface ImportTarget {
  label: string
  amount: number
}

export interface ImportPayload {
  initialCapital: number
  trades: ImportTrade[]
  deposits: ImportDeposit[]
  targets: ImportTarget[]
  customAssets: string[]
}

export interface ImportResult {
  success: boolean
  trades: number
  deposits: number
  targets: number
  custom_assets: number
}

export async function fetchImportJson(
  payload: ImportPayload,
): Promise<ApiResult<ImportResult>> {
  const result = await apiFetch<{ success: boolean; data: ImportResult }>(
    '/api/import/json',
    { method: 'POST', body: JSON.stringify(payload) },
  );
  if (!result.success) return result;
  return { success: true, data: result.data.data };
}

// ── Data Reset (전체 데이터 초기화) ──

export interface ResetResult {
  success: boolean
  trades: number
  deposits: number
  targets: number
  monthly_reports: number
  weekly_reports: number
  trading_plans: number
  storage_files_removed: number
  storage_files_failed: number
}

export async function fetchResetUserData(): Promise<ApiResult<ResetResult>> {
  const result = await apiFetch<{ success: boolean; data: ResetResult }>(
    '/api/reset',
    { method: 'POST', body: JSON.stringify({ confirm: '초기화' }) },
  )
  if (!result.success) return result
  return { success: true, data: result.data.data }
}

// ── Market Insight (공개 데이터 — 인증 불필요) ──

export interface MarketInsight {
  fearGreed: { value: number; classification: string };
  btcDominance: number;
  btcPrice: number;
  btcChange24h: number;
  totalMarketCap: number;
  derivatives: {
    symbol: string;
    fundingRate: number;
    fundingPaymentSide: 'long' | 'short' | 'neutral';
    longShortRatio: {
      longAccount: number;
      shortAccount: number;
      ratio: number;
    };
    openInterest: {
      baseAsset: number;
      notionalUsd: number;
    };
  } | null;
  derivativesStatus: {
    state: 'ready' | 'unavailable';
    source: 'binance-futures';
    reason?: string;
  };
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
