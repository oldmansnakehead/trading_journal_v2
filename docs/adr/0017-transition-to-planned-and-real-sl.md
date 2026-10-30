# ADR 0017: Transition from Min/Max SL to Planned SL and Real SL (MAE)

## Status
Accepted

## Context
During initial development of the Trade Research module (ADR 0014), the zone schema mirrored Min RR and Max RR by creating symmetric `min_sl_points` and `max_sl_points` inputs with an auto-copy rule.

However, in systematic trading practice:
1. **Planned Stop Loss is Singular**: A trader's predefined risk invalidation level (Planned SL) for an entry zone is fixed regardless of whether they take a conservative target (Min RR) or run to a peak target (Max RR). Having two SL fields was redundant and conceptually confusing.
2. **Need for Maximum Adverse Excursion (MAE)**: Traders need to track how deep price retraced before reversing and reaching targets (`Real SL` / Actual Drawdown). This statistical metric enables quantitative optimization of SL placement (tightening buffers to enhance edge and RR).
3. **Handling Deep Losses / Outliers**: When price completely blows through a zone/SL (extreme drop or invalidation), measuring deep excursions (e.g. 500+ points) is wasteful and distorts the average drawdown statistics. Such trades should leave `Real SL` empty (Null) so only valid trades contribute to the MAE metrics.

## Decision
1. **Schema & Migration**:
   - Added `sl_points` (Planned SL) and `real_sl_points` (Real Drawdown / MAE) to `research_entry_zones` via Drizzle migration `0007_mixed_celestials.sql`.
   - Backfilled existing `sl_points` from legacy `min_sl_points`.
2. **UX & Data Entry Form**:
   - Redesigned Zone Inputs: Replaced `[Min SL]` and `[Max SL]` with `[SL Points]` (Planned SL, mandatory base for 1R) and `[Real SL]` (Optional, labeled with "เว้นว่างได้ถ้าหลุด SL").
   - **One-Click Loss Quick Action**: Clicking `[SL (-1)]` or setting Loss automatically clears `real_sl_points` to `null` to prevent outlier pollution.
3. **Analytics & Aggregation**:
   - Updated `computeResearchAnalytics` and IPC handler `researchDashboard:getMetrics` to calculate both:
     - `avgSlPoints`: Average planned stop loss across all filled trades.
     - `avgRealSlPoints`: Average actual drawdown (MAE) calculated strictly over trades where `real_sl_points` is non-null.
4. **Dashboard & Exports**:
   - `ZoneComparisonTable.vue` displays planned average SL along with an amber `Real: XX pts` indicator.
   - Per-trade detail view in `ResearchDashboardView.vue` presents both Planned SL and Real SL.
   - Excel and AI JSON/Markdown exports updated to output `slPoints` and `realSlPoints`.

## Consequences
- **Positive**: Data entry is faster and aligned with natural trading psychology.
- **Positive**: Quantitative traders gain precise MAE analytics to optimize stop placement without statistical skew from catastrophic loss outliers.
- **Positive**: Full backward compatibility maintained for existing records and tests.
