# Domain Map

Boundaries:
- Interface Adapter: `src/app/api/market/insight/route.ts`
- Provider Boundary: CoinGecko and Alternative.me HTTP APIs
- Client Boundary: existing `fetchMarketInsight()` remains outside this slice

Data flow:
- Request -> IP rate limit -> fresh cache check -> provider fetches -> response mapping -> cache write -> JSON response
- Provider failure -> stale cache response
- Provider failure without stale cache -> 502 response

Out of scope:
- TradeForm checklist UI
- TradeSidePanel rendering changes
- Supabase, auth, RLS, migrations
