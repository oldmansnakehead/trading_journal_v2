# ADR 0016: Standard Session Presets for Journal and Trade Research

## Status
Accepted

## Context
Traders consistently operate around defined global market session windows. Previously, configuring sessions required manual typing of start and end times for each session across different setups in both the Journal and the Trade Research modules. 

The user requested standardized session presets with one-click application and quick-pick presets in the session creation modal across both modules:
- **Asia**: `07:00 - 12:00`
- **London**: `14:00 - 18:00`
- **New York**: `19:00 - 22:00`
- **London Close**: `22:00 - 00:00`

## Decision
1. **Centralized Presets**:
   - Defined `DEFAULT_SESSION_PRESETS` in `src/renderer/src/utils/sessions.ts` with canonical session names and the specified time intervals.
   - Updated `STANDARD_SESSIONS` defaults to align with these hours.
2. **One-Click Bulk Apply Preset**:
   - Added `[⚡ ใส่ Preset มาตรฐาน (4 เซสชัน)]` button in both `SetupSettings.vue` (Journal) and `ResearchSettings.vue` (Research).
   - Clicking this automatically applies the full 4-session timetable to the active setup.
   - Enhanced IPC handlers `setupSessions:create` and `researchSessions:create` with an upsert/update mechanism so applying presets gracefully updates existing sessions without constraint errors or duplicate entries.
3. **Modal Quick-Pick Chips**:
   - In both Add Session modals, added responsive quick-pick preset chips (`Asia`, `London`, `New York`, `London Close`) that instantly populate session name, start time, and end time in a single click.
4. **Auto-Detection Verification**:
   - Time calculations seamlessly support overnight cross-midnight windows (e.g., `22:00 - 00:00`).
   - Integrated into Playwright E2E suites (`research.spec.ts` and `fill-trade.spec.ts`).

## Consequences
- **Positive**: Traders can set up session tracking with 1 click instead of 12 manual inputs per setup.
- **Positive**: Consistent session naming and hours across both Journal and Research engines.
- **Negative / Trade-off**: Predefined hours serve as defaults, but users can still customize individual session hours per setup as needed.
