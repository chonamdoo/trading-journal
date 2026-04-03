/**
 * Supabase Database 타입 정의
 *
 * Supabase CLI의 `supabase gen types typescript` 명령으로 자동 생성할 수도 있지만,
 * 초기 개발 단계에서는 수동으로 정의하여 사용한다.
 */

// ────────────────────────────────────────────
// Database 스키마 타입 (Supabase SDK 호환)
// ────────────────────────────────────────────

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/** Supabase SDK가 요구하는 Database 인터페이스 */
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
        Relationships: [];
      };
      trades: {
        Row: TradeRow;
        Insert: TradeInsert;
        Update: TradeUpdate;
        Relationships: [
          {
            foreignKeyName: 'trades_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      deposits: {
        Row: DepositRow;
        Insert: DepositInsert;
        Update: DepositUpdate;
        Relationships: [
          {
            foreignKeyName: 'deposits_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      targets: {
        Row: TargetRow;
        Insert: TargetInsert;
        Update: TargetUpdate;
        Relationships: [
          {
            foreignKeyName: 'targets_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      trade_screenshots: {
        Row: TradeScreenshotRow;
        Insert: TradeScreenshotInsert;
        Update: TradeScreenshotUpdate;
        Relationships: [
          {
            foreignKeyName: 'trade_screenshots_trade_id_fkey';
            columns: ['trade_id'];
            isOneToOne: false;
            referencedRelation: 'trades';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'trade_screenshots_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      trade_closes: {
        Row: TradeCloseRow;
        Insert: TradeCloseInsert;
        Update: TradeCloseUpdate;
        Relationships: [
          {
            foreignKeyName: 'trade_closes_trade_id_fkey';
            columns: ['trade_id'];
            isOneToOne: false;
            referencedRelation: 'trades';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'trade_closes_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      trade_scale_ins: {
        Row: TradeScaleInRow;
        Insert: TradeScaleInInsert;
        Update: TradeScaleInUpdate;
        Relationships: [
          {
            foreignKeyName: 'trade_scale_ins_trade_id_fkey';
            columns: ['trade_id'];
            isOneToOne: false;
            referencedRelation: 'trades';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'trade_scale_ins_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      custom_assets: {
        Row: CustomAssetRow;
        Insert: CustomAssetInsert;
        Update: CustomAssetUpdate;
        Relationships: [
          {
            foreignKeyName: 'custom_assets_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      monthly_reports: {
        Row: MonthlyReportRow;
        Insert: MonthlyReportInsert;
        Update: MonthlyReportUpdate;
        Relationships: [
          {
            foreignKeyName: 'monthly_reports_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      trading_plans: {
        Row: TradingPlanRow;
        Insert: TradingPlanInsert;
        Update: TradingPlanUpdate;
        Relationships: [
          {
            foreignKeyName: 'trading_plans_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'trading_plans_linked_trade_id_fkey';
            columns: ['linked_trade_id'];
            isOneToOne: false;
            referencedRelation: 'trades';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      migrate_json_data: {
        Args: {
          p_user_id: string;
          p_initial_capital: number;
          p_trades: Json;
          p_deposits: Json;
          p_targets: Json;
          p_custom_assets: Json;
        };
        Returns: Json;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// ────────────────────────────────────────────
// profiles 테이블
// ────────────────────────────────────────────

export interface ProfileRow {
  id: string;
  email: string;
  display_name: string | null;
  initial_capital: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface ProfileInsert {
  id: string;
  email: string;
  display_name?: string | null;
  initial_capital?: number;
  currency?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProfileUpdate {
  id?: string;
  email?: string;
  display_name?: string | null;
  initial_capital?: number;
  currency?: string;
  updated_at?: string;
}

// ────────────────────────────────────────────
// trades 테이블
// ────────────────────────────────────────────

/** 거래 방향 */
export type TradeDirection = 'LONG' | 'SHORT';

/** 거래 상태 */
export type TradeStatus = 'open' | 'closed';

export interface TradeRow {
  id: string;
  user_id: string;
  date: string;
  entry_datetime: string | null;
  exit_datetime: string | null;
  asset: string;
  direction: TradeDirection;
  leverage: number;
  entry_price: number;
  exit_price: number | null;
  stop_loss_price: number | null;
  margin: number;
  status: TradeStatus;
  pnl: number | null;
  reason: string | null;
  notes: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface TradeInsert {
  id?: string;
  user_id: string;
  date: string;
  entry_datetime?: string | null;
  exit_datetime?: string | null;
  asset: string;
  direction: TradeDirection;
  leverage?: number;
  entry_price: number;
  exit_price?: number | null;
  stop_loss_price?: number | null;
  margin: number;
  status?: TradeStatus;
  pnl?: number | null;
  reason?: string | null;
  notes?: string | null;
  tags?: string[] | null;
}

export interface TradeUpdate {
  date?: string;
  entry_datetime?: string | null;
  exit_datetime?: string | null;
  asset?: string;
  direction?: TradeDirection;
  leverage?: number;
  entry_price?: number;
  exit_price?: number | null;
  stop_loss_price?: number | null;
  margin?: number;
  status?: TradeStatus;
  pnl?: number | null;
  reason?: string | null;
  notes?: string | null;
  tags?: string[] | null;
}

// ────────────────────────────────────────────
// deposits 테이블
// ────────────────────────────────────────────

export interface DepositRow {
  id: string;
  user_id: string;
  date: string;
  amount: number;
  memo: string | null;
  created_at: string;
}

export interface DepositInsert {
  id?: string;
  user_id: string;
  date: string;
  amount: number;
  memo?: string | null;
}

export interface DepositUpdate {
  date?: string;
  amount?: number;
  memo?: string | null;
}

// ────────────────────────────────────────────
// targets 테이블
// ────────────────────────────────────────────

export interface TargetRow {
  id: string;
  user_id: string;
  label: string;
  amount: number;
  sort_order: number;
  created_at: string;
}

export interface TargetInsert {
  id?: string;
  user_id: string;
  label: string;
  amount: number;
  sort_order?: number;
}

export interface TargetUpdate {
  label?: string;
  amount?: number;
  sort_order?: number;
}

// ────────────────────────────────────────────
// custom_assets 테이블
// ────────────────────────────────────────────

export interface CustomAssetRow {
  id: string;
  user_id: string;
  symbol: string;
  created_at: string;
}

export interface CustomAssetInsert {
  id?: string;
  user_id: string;
  symbol: string;
}

export interface CustomAssetUpdate {
  symbol?: string;
}

// ────────────────────────────────────────────
// trade_closes 테이블 (분할 청산)
// ────────────────────────────────────────────

export interface TradeCloseRow {
  id: string;
  trade_id: string;
  user_id: string;
  exit_price: number;
  exit_datetime: string;
  quantity_pct: number;
  close_margin: number | null;
  pnl: number;
  created_at: string;
}

export interface TradeCloseInsert {
  id?: string;
  trade_id: string;
  user_id: string;
  exit_price: number;
  exit_datetime: string;
  quantity_pct: number;
  close_margin?: number | null;
  pnl: number;
}

export interface TradeCloseUpdate {
  exit_price?: number;
  exit_datetime?: string;
  quantity_pct?: number;
  close_margin?: number | null;
  pnl?: number;
}

// ────────────────────────────────────────────
// trade_scale_ins 테이블 (물타기/불타기)
// ────────────────────────────────────────────

/** 추가진입 타입 */
export type ScaleInTypeDb = 'scale_in_down' | 'scale_in_up';

export interface TradeScaleInRow {
  id: string;
  trade_id: string;
  user_id: string;
  entry_price: number;
  margin: number;
  quantity: number | null;
  entry_datetime: string;
  type: ScaleInTypeDb;
  note: string | null;
  created_at: string;
}

export interface TradeScaleInInsert {
  id?: string;
  trade_id: string;
  user_id: string;
  entry_price: number;
  margin: number;
  quantity?: number | null;
  entry_datetime: string;
  type: ScaleInTypeDb;
  note?: string | null;
}

export interface TradeScaleInUpdate {
  entry_price?: number;
  margin?: number;
  quantity?: number | null;
  entry_datetime?: string;
  type?: ScaleInTypeDb;
  note?: string | null;
}

// ────────────────────────────────────────────
// trade_screenshots 테이블
// ────────────────────────────────────────────

export interface TradeScreenshotRow {
  id: string;
  trade_id: string;
  user_id: string;
  storage_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  sort_order: number;
  created_at: string;
}

export interface TradeScreenshotInsert {
  id?: string;
  trade_id: string;
  user_id: string;
  storage_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  sort_order?: number;
}

export interface TradeScreenshotUpdate {
  sort_order?: number;
}

// ────────────────────────────────────────────
// monthly_reports 테이블 (AI 월간 리포트)
// ────────────────────────────────────────────

export interface MonthlyReportRow {
  id: string;
  user_id: string;
  year: number;
  month: number;
  period_start: string;
  period_end: string;
  trade_count: number;
  win_rate: number | null;
  total_pnl: number | null;
  report_markdown: string;
  model_used: string;
  created_at: string;
}

export interface MonthlyReportInsert {
  id?: string;
  user_id: string;
  year: number;
  month: number;
  period_start: string;
  period_end: string;
  trade_count: number;
  win_rate?: number | null;
  total_pnl?: number | null;
  report_markdown: string;
  model_used?: string;
}

export interface MonthlyReportUpdate {
  trade_count?: number;
  win_rate?: number | null;
  total_pnl?: number | null;
  report_markdown?: string;
  model_used?: string;
}

// ────────────────────────────────────────────
// trading_plans 테이블
// ────────────────────────────────────────────

/** 플랜 상태 */
export type PlanStatusDb = 'draft' | 'active' | 'linked' | 'expired' | 'archived';

export interface TradingPlanRow {
  id: string;
  user_id: string;
  title: string;
  asset: string;
  direction: TradeDirection;
  entry_conditions: string;
  entry_price_min: number | null;
  entry_price_max: number | null;
  target_prices: Json;
  stop_loss_price: number | null;
  risk_reward_ratio: number | null;
  position_size_plan: string | null;
  leverage_plan: number | null;
  margin_plan: number | null;
  confidence_level: number;
  market_analysis: string | null;
  invalidation_conditions: string | null;
  status: PlanStatusDb;
  linked_trade_id: string | null;
  linked_at: string | null;
  review_notes: string | null;
  plan_adherence: number | null;
  created_at: string;
  updated_at: string;
}

export interface TradingPlanInsert {
  id?: string;
  user_id: string;
  title: string;
  asset: string;
  direction: TradeDirection;
  entry_conditions: string;
  entry_price_min?: number | null;
  entry_price_max?: number | null;
  target_prices?: Json;
  stop_loss_price?: number | null;
  risk_reward_ratio?: number | null;
  position_size_plan?: string | null;
  leverage_plan?: number | null;
  margin_plan?: number | null;
  confidence_level?: number;
  market_analysis?: string | null;
  invalidation_conditions?: string | null;
  status?: PlanStatusDb;
  linked_trade_id?: string | null;
  linked_at?: string | null;
  review_notes?: string | null;
  plan_adherence?: number | null;
}

export interface TradingPlanUpdate {
  title?: string;
  asset?: string;
  direction?: TradeDirection;
  entry_conditions?: string;
  entry_price_min?: number | null;
  entry_price_max?: number | null;
  target_prices?: Json;
  stop_loss_price?: number | null;
  risk_reward_ratio?: number | null;
  position_size_plan?: string | null;
  leverage_plan?: number | null;
  margin_plan?: number | null;
  confidence_level?: number;
  market_analysis?: string | null;
  invalidation_conditions?: string | null;
  status?: PlanStatusDb;
  linked_trade_id?: string | null;
  linked_at?: string | null;
  review_notes?: string | null;
  plan_adherence?: number | null;
}

// ────────────────────────────────────────────
// 공통 유틸리티 타입
// ────────────────────────────────────────────

/** API 응답 래퍼 (Result 패턴) */
export type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/** 페이지네이션 파라미터 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

/** 거래 필터 파라미터 */
export interface TradeFilterParams extends PaginationParams {
  asset?: string;
  direction?: TradeDirection;
  status?: TradeStatus;
  /** 결과 필터: 'profit' | 'loss' */
  result?: 'profit' | 'loss';
  dateFrom?: string;
  dateTo?: string;
}

/** 마이그레이션 결과 */
export interface MigrationResult {
  success: boolean;
  trades: number;
  deposits: number;
  targets: number;
  custom_assets: number;
}
