# ADR 0019: Interactive Position Sizing and Lot Calculator

## Status
Accepted

## Context
Accurate position sizing is essential for disciplined risk management. Traders must calculate exact lot sizes according to account capital, maximum acceptable risk percentage, and technical stop loss distance without rounding risk upwards. 
The system requires a dedicated, visually intuitive Lot Size Calculator matching the trader's workflow:
1. **Directional Awareness**: Support BUY and SELL order types with dynamic price distance validation.
2. **Conservative Rounding (Floor)**: Enforce downward lot rounding (floor) so the realized risk never exceeds the planned risk budget.
3. **Multi-Asset Support**: Accommodate standard Gold (XAU/USD: 100 oz contract), standard Forex pairs (100,000 unit contract), JPY pairs, indices, and customizable contracts.
4. **Visual Risk & Scale Representation**: Interactive price scale diagram comparing Entry and SL levels.
5. **Human-Readable Narrative**: Clear summary explaining exact dollar and percentage loss if Stop Loss is reached.

## Decision
1. **Component Design (`LotCalculatorView.vue`)**:
   - Create a modern, dual-card calculator view with warm aesthetic palette (`#8E444E` burgundy accent, rose-tinted cards).
   - Left Card: Direction toggle (BUY/SELL), Account Balance, Risk %, Entry Price, Stop Loss Price, Quick presets, and visual price distance diagram.
   - Collapsible Advanced Settings for contract size, point size, and lot limits.
   - Right Card: Hero recommended lot display, 2x2 financial breakdown metrics (Risk Amount, SL Distance in Points, Loss per 1 Lot, Realized Risk $ and %), and one-click clipboard copy.
2. **Vue Flow & Storybook Compliance**:
   - In accordance with project guidelines, implement `LotCalculatorViewNode.vue`, `LotCalculatorView.stories.ts`, and `LotCalculatorViewNode.stories.ts`.
3. **Route & Navigation**:
   - Register route `/calculator` (`lot-calculator`).
   - Add `คำนวณ Lot (Lot Calculator)` to `AppSidebar.vue`.

## Consequences
- **Positive**: Eliminates mathematical calculation errors prior to trade entry.
- **Positive**: Aligns with professional risk management by guaranteeing risk never rounds up beyond budget.
- **Positive**: Reusable for quick planning and integrates with the overall trading journal ecosystem.
