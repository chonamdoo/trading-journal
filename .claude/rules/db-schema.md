# DB 스키마 요약 (Supabase PostgreSQL)

필요할 때만 참조. 전체 마이그레이션은 `supabase/migrations/` 참조.

## 테이블 구조

```
profiles (1:1 auth.users)
├── id (UUID PK → auth.users)
├── email, display_name, initial_capital, currency
├── subscription_tier (TEXT: 'free'|'pro', DEFAULT 'free')
├── subscription_expires_at (TIMESTAMPTZ NULL)
└── created_at, updated_at

trades (user-owned)
├── id (UUID PK), user_id (FK profiles)
├── asset, direction ('LONG'|'SHORT'), status ('open'|'closed')
├── entry_price, exit_price, stop_loss_price
├── leverage, margin, pnl, pnl_percent
├── reason, notes, date
└── created_at, updated_at
  ├── trade_closes (분할청산) → trade_id FK
  ├── trade_scale_ins (분할매수) → trade_id FK
  └── trade_screenshots (스크린샷) → trade_id FK

deposits (user-owned)
├── id, user_id, amount, date, memo
└── created_at

targets (user-owned)
├── id, user_id, label, amount, sort_order
└── created_at

custom_assets (user-owned)
├── id, user_id, symbol (UNIQUE per user)
└── created_at

supported_assets (shared lookup, READ-ONLY)
├── id, base_asset, quote_asset, is_active
└── created_at

monthly_reports (user-owned)
├── id, user_id, year, month (UNIQUE per user/year/month)
├── report_text, stats (JSONB), model_used
└── created_at

trading_plans (user-owned)
├── id, user_id, linked_trade_id (FK trades, NULL)
├── asset, direction, status ('active'|'executed'|'cancelled'|'expired')
├── entry_price_min/max, stop_loss_price, take_profit_1/2/3
├── leverage_plan, margin_plan, risk_reward_ratio
├── thesis, invalidation, notes
└── created_at, updated_at

subscription_plans (shared lookup, READ-ONLY)
├── id, name, tier, price, currency, interval
├── features (JSONB), is_active, sort_order
└── created_at, updated_at

subscriptions (user-owned)
├── id, user_id (FK profiles), plan_id (FK subscription_plans)
├── status ('active'|'cancelled'|'expired'|'past_due')
├── started_at, expires_at, cancelled_at
├── payment_provider, provider_subscription_id, provider_customer_id
├── metadata (JSONB)
└── created_at, updated_at
```

## RLS 패턴

- 모든 user-owned 테이블: `auth.uid() = user_id` (SELECT/INSERT/UPDATE/DELETE)
- profiles: `auth.uid() = id`
- supported_assets, subscription_plans: `SELECT TO authenticated` (읽기 전용)
- subscriptions: SELECT/INSERT/UPDATE만 (DELETE 없음 — 이력 보존)

## 주요 인덱스

- trades: `(user_id, date DESC)`, `(user_id, status)`, `(user_id, asset)`
- trading_plans: `(user_id, status)`, `(user_id, asset)`, `(linked_trade_id)`
- subscriptions: `(user_id, status)`, `(expires_at) WHERE status='active'`
