/**
 * Supabase Database 타입 정의
 *
 * `supabase gen types typescript`으로 생성된 Database 구조 +
 * 앱에서 사용하는 커스텀 Row/Insert/Update 타입 별칭.
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

/** Supabase SDK가 요구하는 Database 타입 */
export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.4';
  };
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
      favorites: {
        Row: FavoriteRow;
        Insert: FavoriteInsert;
        Update: FavoriteUpdate;
        Relationships: [
          {
            foreignKeyName: 'favorites_user_id_fkey';
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
      supported_assets: {
        Row: {
          base_asset: string;
          is_active: boolean;
          quote_asset: string;
          symbol: string;
          synced_at: string;
        };
        Insert: {
          base_asset: string;
          is_active?: boolean;
          quote_asset?: string;
          symbol: string;
          synced_at?: string;
        };
        Update: {
          base_asset?: string;
          is_active?: boolean;
          quote_asset?: string;
          symbol?: string;
          synced_at?: string;
        };
        Relationships: [];
      };
      subscription_plans: {
        Row: SubscriptionPlanRow;
        Insert: {
          id?: string;
          name: string;
          tier: string;
          price?: number;
          currency?: string;
          interval?: string;
          features?: Json;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          tier?: string;
          price?: number;
          currency?: string;
          interval?: string;
          features?: Json;
          is_active?: boolean;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: SubscriptionRow;
        Insert: {
          id?: string;
          user_id: string;
          plan_id: string;
          status?: string;
          started_at?: string;
          expires_at?: string | null;
          cancelled_at?: string | null;
          payment_provider?: string | null;
          provider_subscription_id?: string | null;
          provider_customer_id?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          plan_id?: string;
          status?: string;
          expires_at?: string | null;
          cancelled_at?: string | null;
          payment_provider?: string | null;
          provider_subscription_id?: string | null;
          provider_customer_id?: string | null;
          metadata?: Json;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'subscriptions_plan_id_fkey';
            columns: ['plan_id'];
            isOneToOne: false;
            referencedRelation: 'subscription_plans';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'subscriptions_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      exchange_connections: {
        Row: ExchangeConnectionRow;
        Insert: ExchangeConnectionInsert;
        Update: ExchangeConnectionUpdate;
        Relationships: [
          {
            foreignKeyName: 'exchange_connections_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      sync_logs: {
        Row: SyncLogRow;
        Insert: SyncLogInsert;
        Update: SyncLogUpdate;
        Relationships: [
          {
            foreignKeyName: 'sync_logs_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'sync_logs_connection_id_fkey';
            columns: ['connection_id'];
            isOneToOne: false;
            referencedRelation: 'exchange_connections';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
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
      reset_user_data: {
        Args: {
          p_user_id: string;
        };
        Returns: Json;
      };
      toggle_favorite_asset: {
        Args: {
          p_user_id: string;
          p_symbol: string;
        };
        Returns: {
          favorited: boolean;
          id: string | null;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// ────────────────────────────────────────────
// profiles 테이블
// ────────────────────────────────────────────

export type SubscriptionTier = 'free' | 'pro';

export type ProfileRow = {
  id: string;
  email: string;
  display_name: string | null;
  initial_capital: number;
  currency: string;
  subscription_tier: SubscriptionTier;
  subscription_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export type ProfileInsert = {
  id: string;
  email: string;
  display_name?: string | null;
  initial_capital?: number;
  currency?: string;
  subscription_tier?: SubscriptionTier;
  subscription_expires_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type ProfileUpdate = {
  id?: string;
  email?: string;
  display_name?: string | null;
  initial_capital?: number;
  currency?: string;
  subscription_tier?: SubscriptionTier;
  subscription_expires_at?: string | null;
  updated_at?: string;
}

// ────────────────────────────────────────────
// subscription_plans 테이블
// ────────────────────────────────────────────

export type SubscriptionPlanFeatures = {
  max_trades_per_month: number;    // -1 = 무제한
  max_screenshots_per_trade: number;
  max_active_plans: number;        // -1 = 무제한
  ai_report: boolean;
  share_card_watermark: boolean;
  data_export: boolean;
}

export type SubscriptionPlanRow = {
  id: string;
  name: string;
  tier: SubscriptionTier;
  price: number;
  currency: string;
  interval: 'month' | 'year' | 'lifetime' | 'free';
  features: SubscriptionPlanFeatures;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// ────────────────────────────────────────────
// subscriptions 테이블
// ────────────────────────────────────────────

export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'past_due';

export type SubscriptionRow = {
  id: string;
  user_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  started_at: string;
  expires_at: string | null;
  cancelled_at: string | null;
  payment_provider: string | null;
  provider_subscription_id: string | null;
  provider_customer_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// ────────────────────────────────────────────
// trades 테이블
// ────────────────────────────────────────────

/** 거래 방향 */
export type TradeDirection = 'LONG' | 'SHORT';

/** 거래 상태 */
export type TradeStatus = 'open' | 'closed';
export type TradeSource = 'manual' | 'api' | 'csv';
export type TradeImportStatus = 'draft' | 'confirmed';

export type TradeRow = {
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
  emotion: string | null;
  exchange: string | null;
  external_id: string | null;
  source: TradeSource | null;
  fee: number | null;
  fee_asset: string | null;
  synced_at: string | null;
  import_status: TradeImportStatus | null;
  raw_exchange_payload: Json | null;
  created_at: string;
  updated_at: string;
}

export type TradeInsert = {
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
  emotion?: string | null;
  exchange?: string | null;
  external_id?: string | null;
  source?: TradeSource | null;
  fee?: number | null;
  fee_asset?: string | null;
  synced_at?: string | null;
  import_status?: TradeImportStatus | null;
  raw_exchange_payload?: Json | null;
}

export type TradeUpdate = {
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
  emotion?: string | null;
  exchange?: string | null;
  external_id?: string | null;
  source?: TradeSource | null;
  fee?: number | null;
  fee_asset?: string | null;
  synced_at?: string | null;
  import_status?: TradeImportStatus | null;
  raw_exchange_payload?: Json | null;
}

// ────────────────────────────────────────────
// exchange_connections / sync_logs 테이블
// ────────────────────────────────────────────

export type ExchangeName = 'binance' | 'bybit' | 'okx' | 'bitget' | 'flipster';
export type SyncStatus = 'running' | 'success' | 'failed' | 'partial';

export type ExchangeConnectionRow = {
  id: string;
  user_id: string;
  exchange: ExchangeName;
  label: string | null;
  api_key_encrypted: Json;
  api_secret_encrypted: Json;
  passphrase_encrypted: Json | null;
  permissions_verified: boolean;
  is_active: boolean;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
}

export type ExchangeConnectionInsert = {
  id?: string;
  user_id: string;
  exchange: ExchangeName;
  label?: string | null;
  api_key_encrypted: Json;
  api_secret_encrypted: Json;
  passphrase_encrypted?: Json | null;
  permissions_verified?: boolean;
  is_active?: boolean;
  last_synced_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type ExchangeConnectionUpdate = {
  label?: string | null;
  api_key_encrypted?: Json;
  api_secret_encrypted?: Json;
  passphrase_encrypted?: Json | null;
  permissions_verified?: boolean;
  is_active?: boolean;
  last_synced_at?: string | null;
  updated_at?: string;
}

export type SyncLogRow = {
  id: string;
  user_id: string;
  connection_id: string | null;
  exchange: ExchangeName;
  status: SyncStatus;
  started_at: string;
  completed_at: string | null;
  from_time: string | null;
  to_time: string | null;
  trades_found: number;
  trades_imported: number;
  trades_skipped: number;
  error_message: string | null;
  metadata: Json | null;
}

export type SyncLogInsert = {
  id?: string;
  user_id: string;
  connection_id?: string | null;
  exchange: ExchangeName;
  status?: SyncStatus;
  started_at?: string;
  completed_at?: string | null;
  from_time?: string | null;
  to_time?: string | null;
  trades_found?: number;
  trades_imported?: number;
  trades_skipped?: number;
  error_message?: string | null;
  metadata?: Json | null;
}

export type SyncLogUpdate = {
  connection_id?: string | null;
  status?: SyncStatus;
  completed_at?: string | null;
  from_time?: string | null;
  to_time?: string | null;
  trades_found?: number;
  trades_imported?: number;
  trades_skipped?: number;
  error_message?: string | null;
  metadata?: Json | null;
}

// ────────────────────────────────────────────
// deposits 테이블
// ────────────────────────────────────────────

export type DepositRow = {
  id: string;
  user_id: string;
  date: string;
  amount: number;
  memo: string | null;
  created_at: string;
}

export type DepositInsert = {
  id?: string;
  user_id: string;
  date: string;
  amount: number;
  memo?: string | null;
}

export type DepositUpdate = {
  date?: string;
  amount?: number;
  memo?: string | null;
}

// ────────────────────────────────────────────
// targets 테이블
// ────────────────────────────────────────────

export type TargetRow = {
  id: string;
  user_id: string;
  label: string;
  amount: number;
  sort_order: number;
  created_at: string;
}

export type TargetInsert = {
  id?: string;
  user_id: string;
  label: string;
  amount: number;
  sort_order?: number;
}

export type TargetUpdate = {
  label?: string;
  amount?: number;
  sort_order?: number;
}

// ────────────────────────────────────────────
// custom_assets 테이블
// ────────────────────────────────────────────

export type CustomAssetRow = {
  id: string;
  user_id: string;
  symbol: string;
  created_at: string;
}

export type CustomAssetInsert = {
  id?: string;
  user_id: string;
  symbol: string;
}

export type CustomAssetUpdate = {
  symbol?: string;
}

// ────────────────────────────────────────────
// favorites 테이블 (코인 즐겨찾기 토글)
// ────────────────────────────────────────────

export type FavoriteRow = {
  id: string;
  user_id: string;
  symbol: string;
  created_at: string;
}

export type FavoriteInsert = {
  id?: string;
  user_id: string;
  symbol: string;
}

export type FavoriteUpdate = {
  symbol?: string;
}

// ────────────────────────────────────────────
// trade_closes 테이블 (분할 청산)
// ────────────────────────────────────────────

export type TradeCloseRow = {
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

export type TradeCloseInsert = {
  id?: string;
  trade_id: string;
  user_id: string;
  exit_price: number;
  exit_datetime: string;
  quantity_pct: number;
  close_margin?: number | null;
  pnl: number;
}

export type TradeCloseUpdate = {
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

export type TradeScaleInRow = {
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

export type TradeScaleInInsert = {
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

export type TradeScaleInUpdate = {
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

export type TradeScreenshotRow = {
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

export type TradeScreenshotInsert = {
  id?: string;
  trade_id: string;
  user_id: string;
  storage_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  sort_order?: number;
}

export type TradeScreenshotUpdate = {
  sort_order?: number;
}

// ────────────────────────────────────────────
// monthly_reports 테이블 (AI 월간 리포트)
// ────────────────────────────────────────────

export type MonthlyReportRow = {
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
  stats: Json | null;
  model_used: string;
  created_at: string;
  period_type: 'weekly' | 'monthly' | 'yearly';
  week: number | null;
}

export type MonthlyReportInsert = {
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
  stats?: Json | null;
  model_used?: string;
  period_type?: 'weekly' | 'monthly' | 'yearly';
  week?: number | null;
}

export type MonthlyReportUpdate = {
  trade_count?: number;
  win_rate?: number | null;
  total_pnl?: number | null;
  report_markdown?: string;
  stats?: Json | null;
  model_used?: string;
  period_type?: 'weekly' | 'monthly' | 'yearly';
  week?: number | null;
}

// ────────────────────────────────────────────
// trading_plans 테이블
// ────────────────────────────────────────────

/** 플랜 상태 */
export type PlanStatusDb = 'draft' | 'active' | 'linked' | 'expired' | 'archived';

export type TradingPlanRow = {
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

export type TradingPlanInsert = {
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

export type TradingPlanUpdate = {
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
  /** true면 24시간이 지난 미확정 API 초안도 포함한다. 기본값은 제외. */
  includeExpiredDrafts?: boolean;
}

/** 마이그레이션 결과 */
export interface MigrationResult {
  success: boolean;
  trades: number;
  deposits: number;
  targets: number;
  custom_assets: number;
}
