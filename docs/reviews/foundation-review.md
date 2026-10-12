# Foundation commit review

Reviewed 2026-10-12. Scope: commits 5522c11 through 8bbb1a8, especially main/preload, database, migrations, images, backup, packaging and safe tests. Historical line references below are from `git show <commit>:<file>`, not necessarily HEAD lines. Static review only; no application was launched and no user database was opened. Only a pure Node path-containment reproduction was executed. Requirements were checked at the introducing revision; incomplete future phases are not automatically findings.

## Commit ledger

| Commit | Result within this scope |
| --- | --- |
| 5522c11 | License only; no runtime finding |
| 9042991 | Context, ADR, hooks and placeholder MCP configuration; no runtime finding |
| e25ee07 | Ignore rules; no runtime finding |
| d0a0e8c | Requirements added; offline versus GitHub updater policy requires clarification |
| 179c7a6 | Plan added; no runtime finding |
| f71a088 | UI stack documentation changed; no runtime finding |
| 5f7d974 | Renderer sandbox explicitly disabled (F1) |
| 7d43177 | Playwright dependency/requirements; no new runtime finding |
| a628462 | Package renamed and lock regenerated; no independently verified new defect |
| e9f5984 | PDF E2E requirement; no runtime finding |
| 64b5552 | Packaged migration assets never copied to expected path (F2) |
| e1e7b5c | Protocol containment bypass (F3) |
| 727bb3a | Theme configuration; no foundation finding |
| 72e6cd5 | Remote renderer assets break offline requirement (F4) |
| 922f50e | Storybook/Vue Flow rule added; no runtime finding |
| 6fdb140 | Remote Storybook assets and new chart dependencies; F4 also applies to preview. Architecture rationale for chart dependency absent from ADR |
| d3d27ed | Unsafe export/import (F5-F7), URL images bypass local ingestion (F8), unsafe/weak E2E smoke test (F10). Historical normal-RR required inputs prevent BE-only entries; removed in 8bbb1a8 |
| 8bbb1a8 | Clear ignores failed backup (F7), journal deletion leaves image files (F9), E2E creates records in real profile (F10). Closes/reopens DB on import and adds migrations, resolving earlier open-connection replacement defect; rollback and validation still absent |

## Findings still present at HEAD b51bc16

### F1 — P2: Enable renderer sandbox

Introduced 5f7d974, `src/main/index.ts:16` (`sandbox: false`; HEAD line 31). Requirement section 8 explicitly requires `sandbox: true`. A renderer exploit lacks the required OS sandbox protection. Enable sandbox and verify the preload bundle works in it. The preload also exposes `electronAPI` in addition to specific domain APIs; its installed implementation was unavailable for inspection here, so unrestricted IPC behavior is a review follow-up rather than an independently verified finding.

### F2 — P1: Include migrations where packaged startup reads them

Introduced 64b5552, `src/main/db/client.ts:27-31` (HEAD 31-36). Packaged startup asks for `app.asar/out/main/db/migrations`; SQL and metadata exist only under `src/main/db/migrations`. `electron.vite.config.ts` has no static copy step and `electron-builder.yml` excludes source files without adding migration resources. Migration assets are not TypeScript imports that Vite can bundle. A packaged application cannot find `_journal.json`, so startup fails before creating the window. Add an explicit copy/resource rule and a packaged-startup check. This is a configuration-proven issue; no installer was generated during this review.

### F3 — P2: Check directory boundaries in image protocol

Introduced e1e7b5c, `src/main/index.ts:52-60` (HEAD 74-83). String `startsWith(dataDir)` accepts sibling paths sharing its prefix. Pure Node reproduction with dataDir `C:\Users\sample\AppData\Roaming\trading_journal_v2` and decoded path `../trading_journal_v2-other/secret.png` produced a target outside dataDir with `accepted: true`. Percent-encoded separators can reach this join operation. Use resolved-path boundary checking (and ideally limit to imagesDir), then `pathToFileURL` for Windows filenames. The complete Electron URL-loading exploit was not exercised.

### F4 — P2: Bundle renderer fonts locally

Introduced 72e6cd5, `src/renderer/index.html:13-18`; HEAD still requests Google Fonts at lines 13-19. Opening the application makes external requests and offline rendering cannot load the declared font, violating the already-existing offline/no-network requirement. Remote Phosphor script originally introduced here was removed by 6da901f, but Google Fonts remains. Storybook also adds remote font/icon resources in 6fdb140. Bundle font assets and remove external requests. The requirement for a GitHub updater conflicts with the blanket network ban and needs an explicit exception; it is not treated as an updater implementation bug in this report.

### F5 — P1: Snapshot SQLite before archiving

Introduced d3d27ed, `src/main/services/backup.ts:39-42`; HEAD 77-80 still calls `archive.file(dbPath)`. WAL mode is enabled, so exporting the live main DB alone can omit recent committed trades. 8bbb1a8 adds `checkpointDb()` but does not inspect a busy checkpoint result or prevent writes/checkpoints while asynchronous archiving streams the file. A checkpoint is not the SQLite backup API snapshot required by section 7. Use the native connection's backup API to a temporary DB, archive that stable file, then remove it. This affects manual, pre-import, pre-clear and automatic backups.

### F6 — P1: Validate and restore import before replacing live data

Introduced d3d27ed, `src/main/services/backup.ts:87-109`; at HEAD replacement/open/migration occurs at 148-163 and catch 170-183 only reopens the imported DB. A ZIP with the accepted manifest type and a non-SQLite `data.db`, a newer schema, a failing migration or an image-copy failure overwrites current data before failing; no restore from the pre-import ZIP occurs. Neither export manifest nor import checks a schemaVersion. Validate DB integrity/schema compatibility in the temporary directory, then replace DB/images as one recoverable operation, restoring both on any failure. 8bbb1a8 fixed close/reopen/migration handling, but this destructive-failure problem remains.

### F7 — P1: Abort destructive operations when safety backup fails

Import introduced d3d27ed, `src/main/services/backup.ts:84-85`; clear introduced 8bbb1a8, same file 215-220 (unchanged at HEAD). Both await an API returning `{success:false}` but ignore the result, then overwrite or delete all user records/images. Disk-full, archive engine or write errors therefore defeat the promised safety backup while destructive work continues. Check success and stop before touching data; return the export error. This is distinct from import rollback after successful safety backup.

### F8 — P2: Route journal screenshots through local image saving

Introduced d3d27ed, `src/renderer/src/components/views/JournalEntryForm.vue:860-883`. The form stores user-entered image URLs directly and never calls `window.api.images.save`; this remains the current form behavior. A remote screenshot is not included in backup images and depends on network availability/link lifetime, violating local-image storage and self-contained export requirements. Add local file ingestion through the existing image service and store only validated relative image paths. URL-only entry also cannot attach ordinary screenshots from disk through the promised upload workflow.

### F9 — P2: Delete unreferenced screenshots with journal records

Introduced 8bbb1a8, `src/main/ipc/journalHandlers.ts:134-151` (HEAD 159-176). Both single and bulk deletion remove only rows, without collecting and deleting their now-unreferenced image originals/thumbnails. Requirement section 6 explicitly requires cleanup while preserving images shared by other records. Local screenshots saved through the existing images API remain on disk and in subsequent backups indefinitely. Gather candidate paths before deletion, then reference-check before unlinking; cover setup cascade deletion too.

### F10 — P2: Isolate E2E from the real application profile

Launch introduced d3d27ed, `e2e/app.spec.ts:7`; mutating scenario introduced 8bbb1a8, `e2e/fill-trade.spec.ts:9,26-46`. Tests launch `.` without an isolated userData path, while production paths use `app.getPath('userData')`. Startup itself creates backups/migrates real data; fill-trade adds setups, symbols and journal entries to the ordinary profile. Test runs also lack deterministic empty fixtures. The smoke assertion only finds static `#app`, which exists even if Vue fails to mount. Provide a temporary data directory before app readiness, clean it afterward, and assert a rendered application control plus persisted result. These tests were deliberately not executed here.

## Historical defects resolved or narrowed

- d3d27ed import replaced DB while its connection remained open and skipped reopening/migrations/reload. 8bbb1a8 closes and reopens, runs migrations, and offers a renderer reload. F6/F7 remain.
- d3d27ed normal SL and RR inputs were `required`, preventing a BE-only/Trail-only journal entry despite flexible RR requirements. 8bbb1a8 removes those required attributes.
- Remote Phosphor renderer script from 72e6cd5 removed in 6da901f; fonts remain (F4).
- Backup stream error listener absent in d3d27ed added in 8bbb1a8. Export snapshot correctness is still F5.

## Follow-up validation checklist

- Package to a temporary output and verify migrations exist and an empty isolated profile opens.
- Exercise SQLite WAL snapshot consistency against disposable fixture data only.
- Inject export failure before import/clear and verify unchanged DB/images.
- Import corrupt and newer-schema fixtures and inject mid-image-copy failure; verify exact restoration.
- Verify encoded traversal is rejected and paths containing spaces, `#` and non-ASCII names load.
- Verify screenshot import/export round-trip without network and reference-aware single/bulk deletion.
- Run UI/E2E only after ensuring all app paths resolve to temporary test fixtures.
