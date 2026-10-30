# ADR 0018: Advanced Zone Modeling - Invalidation Tags, No-Zone State, Zone Duplication, and Optimal SL

## Status
Accepted

## Context
Following the refinement of Planned SL and Real SL (ADR 0017), the quantitative model development workflow requires deeper behavioral trade attribution and flexible zone tracking:
1. **Invalidation Attribution**: When a trade hits Stop Loss (-1R), traders must record *why* the zone failed (e.g., trend against HTF, news volatility, fake inducement, liquidity hunt) to formulate explicit negative playbooks.
2. **"No Zone" vs "Missed" Distinction**: In a single setup session, certain zones may not form at all (e.g., price created an FVG but never formed a Breaker Block). Distinguishing "No Zone" (unformed) from "Missed" (formed but price missed entry) enables measuring **Formation Frequency** alongside Fill Rate.
3. **Multiple Zone Instances (Zone Duplication)**: Real market setups frequently present multiple instances of the same zone type within one trade context (e.g., two Breaker Blocks or separate taps). Traders must be able to duplicate any zone card and record individual executions.
4. **Per-Zone Entry & Exit Timing & Duration**: Different zones in the same setup trigger and conclude at different times. Storing entry/exit times per zone enables automatic calculation of holding duration (minutes and bars).
5. **Optimal SL "Sweet Spot" Quantitative Analytics**: Aggregating `real_sl_points` of winning trades using 85th-90th percentiles to recommend data-driven SL placement with calculated EV improvement.

## Decision
1. **Schema Enhancements (`research_entry_zones`)**:
   - `invalidation_reason`: Text (predefined quick tags + custom)
   - `is_no_zone`: Boolean (default false)
   - `holding_duration_minutes`: Integer
   - `holding_bars`: Integer
   - `entry_datetime`: Text ISO timestamp
   - `exit_datetime`: Text ISO timestamp
   - `zone_instance_name`: Text (e.g. "Zone Breaker #2")
2. **Form Interaction UX**:
   - Added `[+ ทำซ้ำโซน (Duplicate)]` button to clone any zone instance within the setup.
   - Added `[ ] ไม่เกิดโซน (No Zone)` checkbox alongside `[ ] ตกรถ (Missed)`.
   - Embedded per-zone Entry & Exit pickers with auto-duration computation.
   - Contextual Invalidation Reason chips appear when Loss is recorded.
3. **Analytics Engine**:
   - Calculate Formation Rate (`(total - no_zone) / total * 100`).
   - Calculate Optimal SL Sweet Spot based on winning trades' MAE distribution.
   - Aggregated holding times and invalidation breakdowns.

## Consequences
- **Positive**: Provides institutional-grade granularity for quant model development.
- **Positive**: Solves real-world multi-zone entry logging without rigid 1:1 constraints.
- **Positive**: Automatic duration calculation saves trader time.
