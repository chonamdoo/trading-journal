import type {
  ImportStatus,
  PositionDirection,
  TradeEmotion,
  TradeSource,
  TradeStatus,
} from '../../domain/entities/trade';

export interface TradeRowDto {
  id: string;
  user_id?: string;
  date: string;
  entry_datetime?: string | null;
  exit_datetime?: string | null;
  asset: string;
  direction: PositionDirection;
  leverage: number;
  entry_price: string | number;
  exit_price?: string | number | null;
  stop_loss_price?: string | number | null;
  margin: string | number;
  status: TradeStatus;
  pnl?: string | number | null;
  reason?: string | null;
  notes?: string | null;
  tags?: string[] | null;
  emotion?: TradeEmotion | null;
  source?: TradeSource | 'api' | null;
  exchange?: string | null;
  external_id?: string | null;
  fee?: string | number | null;
  funding_fee?: string | number | null;
  fee_asset?: string | null;
  synced_at?: string | null;
  import_status?: ImportStatus | null;
  raw_exchange_payload?: unknown;
  created_at?: string;
  updated_at?: string;
}
