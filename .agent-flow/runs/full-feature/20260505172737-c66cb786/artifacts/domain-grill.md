# Domain Grill

Task: SPEC-003 Slice 1: Market Insight API Boundary

Decisions:
- Market Insight is public market context, not user-owned Trading Journal data.
- This slice only owns the API boundary: `GET /api/market/insight`.
- UI and checklist behavior are out of scope for this slice.
- The endpoint returns BTC price, BTC 24h change, BTC dominance, total market cap, and Fear & Greed.
- External provider outage should not break trade entry; stale cache may be returned.

Terms:
- Market Insight: read-only public market summary for the trade entry side panel.
- Stale cache fallback: return the last successful payload when external providers fail.
- Graceful error: return 502 when no cache exists and external market data cannot be fetched.

Assumptions:
- No authentication is required.
- IP rate limit remains 30 requests per minute.
- Production Supabase is not touched by this slice.

Sources checked:
- CoinGecko `/global` docs: https://docs.coingecko.com/reference/crypto-global
- CoinGecko `/simple/price` docs: https://docs.coingecko.com/v3.0.1/reference/simple-price
- Alternative.me Fear & Greed API docs: https://alternative.me/crypto/fear-and-greed-index/

Open questions:
- None for this API-boundary slice.
