# PRD Reference

Source PRD:
- `specs/003-checklist-market-insight.md`

Slice:
- Market Insight API Boundary

Acceptance criteria:
- `GET /api/market/insight` is public.
- Applies IP rate limit of 30 requests per minute.
- Fetches Alternative.me Fear & Greed, CoinGecko Global, and CoinGecko BTC price in parallel.
- Maps provider data into the existing `MarketInsight` response shape.
- Returns stale cache when providers fail after a prior successful response.
- Returns 502 when providers fail and no cache exists.
