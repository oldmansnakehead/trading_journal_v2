# 15. Research Trade Editing, Date Range Filtering, and AI Markdown Export

Date: 2026-10-28

## Status
Accepted

## Context
Following the implementation of the core Trade Research and Zone Statistics module (ADR 0014), three critical operational needs emerged to complete the quantitative research lifecycle:
1. **Trade Editing (แก้ไขไม้สถิติย้อนหลัง):** Traders frequently log an initial entry with Min RR and SL Points during live execution, but price may continue to run throughout the day. They need to update `max_rr`, adjust notes, or fix typos without having to delete and re-enter the record.
2. **Date Range Filtering (ตัวกรองช่วงเวลา):** Researchers need to isolate statistical samples by time horizons (e.g., Today, This Week, This Month, or custom date ranges) to evaluate edge decay across market regimes and seasons.
3. **AI Deep Analysis Export (.md & Excel):** Traders want to export the complete research datasets—including setup parameters, zone comparison metrics, expected values, and granular per-trade zone performance—into structured Markdown (`.md`) files tailored for consumption by Large Language Models (LLMs) such as Claude, ChatGPT, or Gemini. The export must include structured analytical prompts and tabular data to guide AI agents in optimizing entries, reducing missed trades, and identifying statistical anomalies.

## Decisions

### 1. Research Trade Edit Workflow
- **Store Architecture (`useResearchEntryStore`):**
  - Added `editingEntryId: Ref<number | null>` and `isEditMode: ComputedRef<boolean>`.
  - Added `loadEntryForEdit(id: number)` to retrieve the trade via `researchEntries:get`, fetch associated setup sessions and custom columns, and pre-populate all form fields and zone parameters.
  - In `submitEntry()`, dispatch to `researchEntries:update(id, payload)` when in edit mode, returning `isUpdate: true`.
  - Added `cancelEdit()` to clear edit state and reset the form.
- **UI Integration:**
  - `ResearchEntryForm.vue` checks `route.query.id` on mount to initiate edit mode seamlessly.
  - Added visual edit indicators, a "บันทึกการแก้ไข (Update Entry)" button, and a "ยกเลิก (Cancel)" action redirecting back to `/research/dashboard`.
  - Added direct "แก้ไข (Edit)" action buttons in both the Recent Entries table and the Details Modal in `ResearchDashboardView.vue`.

### 2. Date Range Filtering in Analytics and Storage
- **Shared Types:** Extended `ResearchFilters` with optional `startDate?: string` and `endDate?: string`.
- **Drizzle ORM Queries (`researchHandlers.ts`):**
  - Updated `researchEntries:list` and `researchEntries:getAnalytics` to apply SQL conditions:
    - `gte(researchEntries.entryDatetime, filters.startDate)`
    - `lte(researchEntries.entryDatetime, endOfDayIso)`
- **UI Filter Bar (`ResearchFilterBar.vue`):**
  - Integrated date range preset options (`all`, `today`, `week`, `month`, `custom`) with native date inputs for custom ranges.

### 3. AI Markdown (.md) and Excel Export Service
- **Service Layer (`src/main/services/researchExport.ts`):**
  - `generateResearchAiMarkdown`: Generates an LLM-optimized Markdown document containing:
    1. System prompt & instructions for quantitative edge analysis and trade attribution.
    2. Setup metadata, type, and playbook rules.
    3. Aggregated Zone Comparison Table (Samples, Fill Rate, Miss Rate, Win Rate, Avg Min/Max RR, Avg SL Points, Expected Value).
    4. Top Zone Recommendation highlights (Best EV, Highest Win Rate, Lowest Miss Rate, Highest RR Potential).
    5. Session and timeframe distribution.
    6. Complete raw trade log table with individual zone outcomes, R-multiples, and qualitative notes.
  - `exportResearchAiReportToFile`: Uses Electron's native `dialog.showSaveDialog` to save `.md` and `.json` documents.
  - `exportResearchTradesToExcel`: Uses open XML/ZIP spreadsheet generation to export dual-sheet workbooks (Zone Analytics Summary and Granular Zone Entries).
- **Clipboard & Quick Action Integration:**
  - Added `research:generateAiReport` IPC handler enabling one-click "Copy AI Prompt & Data" to the system clipboard for immediate pasting into chat AI interfaces.
  - Added Export dropdown in `ResearchDashboardView.vue` with options for AI Markdown (.md), Clipboard Copy, and Excel (.xlsx).

## Consequences
- **Positive:**
  - Completes the end-to-end quantitative research workflow from data collection to AI-assisted analysis and optimization.
  - Zero cloud dependency: 100% offline generation of AI prompts and spreadsheets.
  - Seamless editing eliminates data entry friction and allows retrospective Max RR updates.
- **Negative / Trade-offs:**
  - Route state synchronization between `/research/dashboard` and `/research/entry?id=` requires careful store lifecycle management to prevent stale form data. Handled via route watchers and store reset methods.
