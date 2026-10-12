# Recent commit review — 2026-10-12

Scope: `95a4274` → `ed7c428` → `9ce8341` → `c8eaac4` → `b51bc16`, oldest first. Requirements and ADRs 0002–0006 checked. Static review of introducing diffs plus current files; this report does not claim historical app execution. Implementation and user data untouched.

| Commit | Review status | Evidence / scope |
| --- | --- | --- |
| 95a4274 | No actionable finding in inspected changes | Standard session selector, create-handler name/duplicate validation, session helpers. No dedicated handler execution performed. |
| ed7c428 | Findings, still open at HEAD | Tab state, save/close paths, setup/session loading, existing store tests. |
| 9ce8341 | Findings, still open at HEAD | Monte Carlo engine/view, shared filters, worker; unit suites pass but omit counterexamples below. |
| c8eaac4 | Findings, still open at HEAD | Edge calculations/view, custom-column representation, existing tests. |
| b51bc16 | Documentation-only; no new runtime finding | Edge feature documentation; inherited Edge issues remain. The “100% every test case” coverage statement is not supported by coverage evidence. |

## Actionable findings

1. **[P2] Saved tabs remain editable without becoming unsaved.** `src/renderer/src/stores/tradeTabs.ts:379` filters Save All candidates using `!t.isSaved`, while `:361` sets that flag permanently after success. `JournalEntryForm.vue:234` keeps the form editable; no edit watcher resets the flag, and close paths at `:1160`/`:1172` suppress the discard confirmation for saved tabs. Save a trade, change its notes/RR, then Save All or close it: changes are skipped/discarded while the badge still says saved. Single Save calls create again rather than update. Track dirty state and record identity, or explicitly lock saved drafts. Introduced `ed7c428`; unchanged through HEAD.

2. **[P2] Switching tabs clears session selections for setups with no custom columns.** `src/renderer/src/components/views/JournalEntryForm.vue:1115` treats an empty column list as unloaded; mount at `:1129` does likewise. Empty is a valid loaded result. `tradeTabs.ts:249` then clears `sessionName`, without rerunning date/session matching. Pick a setup with zero custom columns and a session, switch away/back (or leave/reenter the page): session is silently erased. Track metadata loading separately and preserve drafts on activation. Introduced `ed7c428`; unchanged through HEAD.

3. **[P2] Monte Carlo uses reverse chronological history.** `src/renderer/src/components/views/MonteCarloView.vue:798` maps filtered journal records directly; `src/main/ipc/journalHandlers.ts:86` returns descending entry time. The actual-equity overlay and block-bootstrap contiguous blocks therefore run newest to oldest, unlike a historical equity timeline. With historical outcomes +2R then -1R, simple capital 10,000/risk 1%, the plotted path becomes 10,000 → 9,900 → 10,100 instead of 10,000 → 10,200 → 10,100. Sort ascending before building the R series. Introduced `9ce8341`; unchanged through HEAD.

4. **[P2] Monte Carlo and other reports disagree on missing BE/Trail values.** `src/renderer/src/components/views/MonteCarloView.vue:750`/`:751` maps missing BE/Trail to zero; shared `statistics.ts:37`/`:38` falls back to Normal RR. A Normal-only +2R trade counts as +2R in dashboard/Edge BE mode and 0R in Monte Carlo BE mode, changing expectancy and the sampled distribution. Use a single agreed mode policy across report entry points. Introduced `9ce8341`; unchanged through HEAD. This finding concerns inconsistency; whether absent modes should fall back or be excluded needs a product policy.

5. **[P2] Validate simulation numeric inputs before starting the worker.** `src/renderer/src/components/views/MonteCarloView.vue:793` only checks trade count, despite free numeric inputs. The Run button at `:320` is not form submission, so HTML min/max/step do not enforce values. Engine `monteCarlo.ts:229`/`:230` accepts a fractional horizon/run count and invalid capital. Direct probes: `tradesPerRun=2.5` throws `Invalid array length`; `initialCapital=0` returns NaN median return. Errors are logged without a user message, leaving prior results visible. Require finite capital/risk/threshold and bounded positive integer counts, and display errors. Introduced `9ce8341`; unchanged through HEAD.

6. **[P2] MAE custom-column values cannot be read from actual saved records.** `src/renderer/src/utils/edgeAnalysis.ts:785`/`:786` looks for custom-data keys named `mae`/`adverse`; actual form data is keyed by numeric `col.id` (`JournalEntryForm.vue:627` etc.), not column name. The engine receives no column metadata to resolve names. A column named MAE with ID 42 and stored value -0.75 produces MAE 0 for a winner; losers fall back to realized Normal RR. The scatter silently uses assumed values instead of the recorded excursion. Resolve configured column IDs and distinguish missing MAE from measured zero. Introduced `c8eaac4`; unchanged through HEAD.

7. **[P2] Missing MFE is counted as perfect exit efficiency.** `src/renderer/src/utils/edgeAnalysis.ts:826`/`:827` substitutes realized RR when max RR is absent, then `:846`–`:849` includes that substitute in the efficiency average. A +2R trade with null max RR reports 100% capture efficiency and counts as having MFE. Unrecorded peaks can dominate the average and falsely suggest perfect exits. Keep inferred plotting bounds separate from measured MFE and exclude unrecorded peaks from excursion KPIs. Introduced `c8eaac4`; unchanged through HEAD.

## Executed verification

- Current working tree, targeted Vitest command: Monte Carlo, shared filters, Edge, trade-tabs suites — **4 files / 27 tests passed**, exit 0. No Electron launched; no database touched.
- Read-only probes compiled existing pure TypeScript engines in memory: ID-keyed MAE returned 0; unrecorded MFE winner returned 100% efficiency; zero-capital simulation returned NaN median; fractional horizon threw `Invalid array length`; shared BE helper returned 2 for Normal +2R with absent BE.
- `git diff <introducing commit> HEAD -- <flagged files>` confirms flagged implementations are unchanged. None of these findings is resolved by a later reviewed commit.
- Historical automated test/typecheck evidence is being collected separately by the main reviewer. Passing current tests does not imply all commits, UI flows, or statistical input boundaries pass.
