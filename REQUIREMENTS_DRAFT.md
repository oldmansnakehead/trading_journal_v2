# Tech Stack & Architecture

> เอกสารนี้กำหนด stack และกฎทางสถาปัตยกรรมของโปรเจกต์ และ requirement โปรเจค
> AI agent (Claude Code / Antigravity) ต้องยึดตามเอกสารนี้ ห้ามเปลี่ยน library หลักโดยไม่ถามก่อน

## 1. ภาพรวม

- แอป desktop สำหรับใช้งานส่วนตัว ทำงาน **offline / local 100%**
- ไม่มี backend server, ไม่มี cloud, ไม่มีการเรียก API ภายนอก
- ข้อมูลทั้งหมด (database + รูปภาพ) อยู่ในเครื่อง และ **Export / Import ได้เสมอ** เป็นไฟล์เดียว

## 2. Stack

| ส่วน             | เทคโนโลยี                                  | หมายเหตุ                          |
| ---------------- | ------------------------------------------ | --------------------------------- |
| Runtime          | Electron                                   | ใช้เวอร์ชัน stable ล่าสุด         |
| Build / Dev      | electron-vite                              | แยก main / preload / renderer     |
| Language         | TypeScript                                 | `strict: true` ทุกส่วน            |
| Frontend         | Vue 3 (Composition API + `<script setup>`) |                                   |
| State            | Pinia                                      |                                   |
| Routing          | Vue Router (hash mode)                     |                                   |
| UI               | shadcn-vue                                 | ใช้ร่วมกับ Tailwind CSS           |
| Database         | SQLite ผ่าน better-sqlite3                 | ใช้ใน main process เท่านั้น       |
| ORM              | Drizzle ORM + drizzle-kit                  | schema และ migration              |
| Image processing | sharp                                      | ทำ thumbnail / resize (ถ้าจำเป็น) |
| Zip              | archiver (สร้าง) + extract-zip (แตก)       | สำหรับ export / import            |
| Packaging        | electron-builder                           | rebuild native module อัตโนมัติ   |
| Testing (E2E)    | Playwright                                 | สำหรับรัน Test อัตโนมัติ          |

**ห้ามใช้:** Prisma, ORM ที่ต้องใช้ engine binary แยก, database server ใด ๆ (MySQL, Postgres, MongoDB), cloud storage

## 3. โครงสร้างโปรเจกต์

```
src/
├── main/                 # Electron main process
│   ├── index.ts          # สร้าง window, register protocol, IPC
│   ├── db/
│   │   ├── client.ts     # เปิด/ปิด connection, PRAGMA
│   │   ├── schema.ts     # Drizzle schema
│   │   └── migrations/   # ไฟล์ที่ drizzle-kit generate
│   ├── services/
│   │   ├── images.ts     # บันทึก/ลบรูป, thumbnail
│   │   └── backup.ts     # export / import
│   ├── ipc/              # IPC handlers แยกตามโดเมน
│   └── paths.ts          # path ของ data folder ทั้งหมด
├── preload/
│   └── index.ts          # contextBridge expose API (typed)
├── shared/
│   └── types.ts          # type ที่ใช้ร่วมกันระหว่าง main และ renderer
└── renderer/             # Vue 3 app
    ├── components/
    ├── views/
    ├── stores/           # Pinia
    └── router/
```

## 4. ที่เก็บข้อมูล

ข้อมูลทั้งหมดอยู่ใน **data folder** เดียว (ห้ามเขียนลงโฟลเดอร์ของตัวแอป เพราะหลัง build จะเขียนไม่ได้)

```
<dataDir>/                # ค่าเริ่มต้น = app.getPath('userData')
├── data.db
├── images/
│   ├── <hash>.<ext>
│   └── thumbs/
│       └── <hash>.webp
└── backups/              # (optional) auto backup
```

- ทุก path ต้องได้มาจาก `src/main/paths.ts` ที่เดียว ห้าม hardcode
- ออกแบบให้เปลี่ยน `dataDir` ได้ในอนาคต (portable mode)

## 5. Database

- ใช้ `better-sqlite3` ใน **main process เท่านั้น** — renderer ห้ามเข้าถึง DB หรือ `fs` โดยตรง
- ตอนเปิด connection ให้ตั้งค่า:
  ```sql
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
  ```
- schema ทั้งหมดอยู่ใน `db/schema.ts` และเปลี่ยนผ่าน migration ของ drizzle-kit เท่านั้น
- รัน migration อัตโนมัติทุกครั้งที่เปิดแอป และทุกครั้งหลัง import
- ทุกตารางมี `id`, `created_at`, `updated_at`

## 6. รูปภาพ

- ตอนอัปโหลด: คัดลอกไฟล์เข้า `images/` ตั้งชื่อด้วย **SHA-256 hash ของเนื้อไฟล์** (กันชื่อซ้ำและรูปซ้ำ)
- ใน DB เก็บเฉพาะ **relative path** เช่น `images/ab12cd.jpg` — ห้ามเก็บ absolute path และห้ามเก็บรูปเป็น BLOB
- แสดงรูปใน renderer ผ่าน custom protocol `app-img://` ที่ register ด้วย `protocol.handle()`
  - ห้ามใช้ `file://` และห้ามปิด `webSecurity`
  - ต้องตรวจว่า path ที่ขอไม่หลุดออกนอก `dataDir` (กัน path traversal)
- เมื่อลบ record ให้ลบไฟล์รูปด้วย ถ้าไม่มี record อื่นอ้างอิงรูปนั้นอยู่

## 7. Export / Import

### Export

1. เรียก `db.backup(tmpPath)` (ห้ามคัดลอกไฟล์ `data.db` ตรง ๆ ขณะแอปเปิดอยู่)
2. zip รวม `data.db` (จากข้อ 1) + โฟลเดอร์ `images/` + `manifest.json`
3. ให้ผู้ใช้เลือกที่บันทึกผ่าน `dialog.showSaveDialog`
4. ชื่อไฟล์ค่าเริ่มต้น: `backup-YYYY-MM-DD-HHmm.zip`

`manifest.json`:

```json
{
  "app": "<app-name>",
  "appVersion": "1.0.0",
  "schemaVersion": 1,
  "exportedAt": "2026-10-10T11:48:00+07:00"
}
```

### Import

1. ให้ผู้ใช้เลือกไฟล์ `.zip` ผ่าน `dialog.showOpenDialog`
2. แตกไฟล์ไปที่โฟลเดอร์ชั่วคราว
3. ตรวจสอบ: มี `manifest.json`, `data.db` เปิดได้, `schemaVersion` ไม่ใหม่กว่าแอป
4. **สำรองข้อมูลปัจจุบันอัตโนมัติ** ไว้ใน `backups/` ก่อนเสมอ
5. ปิด DB connection → แทนที่ `data.db` และ `images/` → เปิด connection ใหม่ → รัน migration
6. แจ้ง renderer ให้ reload ข้อมูล (ไม่ต้องรีสตาร์ทแอป)
7. ถ้าขั้นตอนใดล้มเหลว ให้ restore จาก backup ในข้อ 4 และแจ้ง error ให้ผู้ใช้

## 8. Security (Electron)

- `contextIsolation: true`
- `nodeIntegration: false`
- `sandbox: true` สำหรับ renderer
- expose API ผ่าน `contextBridge` เป็นฟังก์ชันที่เจาะจง เช่น `api.items.list()` — ห้าม expose `ipcRenderer` ทั้งตัว
- validate input ทุกอย่างที่มาจาก renderer ใน IPC handler

## 9. IPC Convention

- ชื่อ channel: `<domain>:<action>` เช่น `items:list`, `items:create`, `backup:export`
- ใช้ `ipcMain.handle` / `ipcRenderer.invoke` (async request-response)
- type ของ request/response อยู่ใน `src/shared/types.ts`
- error ให้ throw จาก handler แล้วจัดการที่ฝั่ง renderer พร้อมแสดงข้อความให้ผู้ใช้

## 10. Packaging

- ใช้ electron-builder
- `better-sqlite3` และ `sharp` เป็น native module → ใส่ใน `asarUnpack`
- target: ระบุใน requirement (Windows / macOS / Linux)
- ระบบอัปเดตอัตโนมัติ: ต้องมีระบบ Auto Update ของ Electron โดยหลักจะอัปเดตผ่าน GitHub Releases

## 11. Testing (E2E) & Dynamic PDF Reporting

- ใช้ Playwright สำหรับรัน Automated E2E Test ครอบคลุมการเปิดแอป, Responsive Navigation ที่ 900px, Settings, การสร้าง Setup/Symbol, การบันทึก Trade, และการตรวจสอบตาราง Dashboard
- เมื่อรัน Test เสร็จสิ้น ต้องสร้างรายงานผลลัพธ์ออกมาเป็นไฟล์ **PDF** (`e2e/report.pdf`) อัตโนมัติจากผลลัพธ์จริง (ไม่ใช่ Mock) แม้การทดสอบจะล้มเหลว
- ในรายงาน PDF ต้องประกอบด้วย:
  - สรุปภาพรวม (Total Tests, Passed, Failed, Skipped, Duration, Timestamp)
  - รายละเอียดแต่ละขั้นตอน (Step breakdown พร้อมสถานะและระยะเวลา)
  - รูปภาพ (Screenshots) จริงจากการทดสอบทุกขั้นตอน (`main-window`, `setup-created`, `symbol-created`, `trade-entry-filled`, `toast-success`, `dashboard-verified`)
  - ข้อความแจ้งเตือน Error อย่างละเอียด (หากมีข้อผิดพลาดเกิดขึ้น)

## 12. กฎสำหรับ AI agent

- ทำตามเอกสารนี้ก่อน ถ้า requirement ขัดกับเอกสารนี้ให้ถามก่อนทำ
- ห้ามเพิ่ม dependency ใหม่ที่ไม่อยู่ในตารางข้อ 2 โดยไม่บอกเหตุผล
- ห้ามเพิ่มการเชื่อมต่อ network ใด ๆ
- เขียน TypeScript ให้มี type ครบ หลีกเลี่ยง `any`
- เมื่อแก้ schema ต้อง generate migration ด้วยทุกครั้ง

## 12. โครงสร้างข้อมูลและโมเดล (Data Models & Schema)

ระบบออกแบบมาเพื่อให้ความอิสระกับผู้ใช้ในการเก็บสถิติและทดสอบกลยุทธ์ เพราะผู้ใช้แต่ละคนมีวิธีการเก็บข้อมูลและตั้งสมมติฐานที่ไม่เหมือนกัน โดยมี `Setup` เป็นแกนกลางในการผูกข้อมูล

### 12.1. ตารางหลัก (Core Tables)

- **Setup**
  - `name` (String): ชื่อ Setup
  - `description` (Text): คำอธิบาย
  - `type` (String): ประเภทของบัญชีหรือการทดสอบ เช่น demo, บัญชีจริง
- **Setup Session (ตารางเวลา ผูกกับ Setup)**
  - `setup_id` (FK)
  - `start_time` (Time): เวลาเริ่มต้น
  - `end_time` (Time): เวลาสิ้นสุด
  - `session_name` (Enum): ให้ผู้ใช้เลือกจาก `Asia`, `Tokyo`, `London`, `London Close`, `New York`
  - _หมายเหตุ:_ ผู้ใช้สามารถกำหนดเวลาได้อย่างอิสระ และไม่จำเป็นต้องกรอกเวลาให้ครบทุก session
- **Setup Playbook (ผูกกับ Setup)**
  - `setup_id` (FK)
  - `content` (Text): เป็นฟิลด์ที่ให้ผู้ใช้ระบุข้อความยาวๆ เพื่อจดสมมติฐาน กฎเกณฑ์ และเงื่อนไขต่างๆ ของ Setup นั้นอย่างละเอียด เพื่อให้กลับมาอ่านแล้วไม่ลืม
- **Custom Columns (ผูกกับ Setup)**
  - **จุดเด่น:** ระบบออกแบบมาให้ผู้ใช้สามารถ **เพิ่มคอลัมน์กี่รายการก็ได้ (ไม่จำกัดจำนวน)** เพื่อสร้างฟิลด์ทดสอบของตัวเองได้อย่างอิสระ
  - `setup_id` (FK)
  - `name` (String): ชื่อคอลัมน์ที่ผู้ใช้ต้องการตั้ง
  - `type` (Enum): ชนิดของข้อมูลที่เลือกได้อิสระ ได้แก่ `checkbox`, `multiple_selector`, `single_selector`, `number`, `string`, `boolean`
  - `report_filter` (Boolean): หากติ๊กเป็น `true` คอลัมน์ที่สร้างขึ้นมาใหม่นี้ จะไปปรากฏเป็นตัวกรอง (Filter) ในหน้ารายงานให้ใช้งานด้วย
- **Symbols** (ใช้ร่วมกันทุก Setup ไม่ต้องผูก)
  - `name` (String): เช่น XAUUSD, EURUSD

### 12.2. ตารางบันทึกการเทรด (Journal Entry)

- `setup_id` (FK)
- `entry_datetime` (DateTime)
- `exit_datetime` (DateTime)
- `symbol_id` (FK): เลือกจากตาราง Symbols
- `session_name` (String): ระบบจะเลือกให้อัตโนมัติโดยอิงจาก `entry_datetime` ไปเทียบกับเวลาใน Setup แต่ถ้าไม่เจอช่วงเวลาที่ตรง ระบบจะอนุญาตให้ผู้ใช้เลือกเองได้
- `position` (Enum): `Buy`, `Sell`
- `direction_bias` (Enum): `Bullish`, `Bearish`
- `entry_timeframe` (String): เลือกจาก Selector ซึ่งอ้างอิงจากข้อมูลที่ตั้งค่าไว้ในหน้า Settings
- `news` (Boolean): Checkbox สำหรับระบุว่ามีข่าวหรือไม่
- `quality` (Enum): ระดับคุณภาพของการเทรด เลือกเป็นสี `Red`, `Orange`, `Yellow`, `Blue`, `Green`
- `is_test` (Boolean): Checkbox ระบุว่าเป็นรายการทดสอบ (หากติ๊ก รายการนี้อาจถูกกรองออกหรือไม่นำไปนับสถิติในหน้ารายงาน)
- `images` (JSON/Array): ใส่กี่รูปก็ได้ (เก็บเป็น Image URLs/Relative paths)
- `notes` (Text): หมายเหตุ (รองรับข้อความยาว)
- **Risk:Reward (RR) Data:**
  ใน 1 รายการเทรด จะมีให้กรอกผลลัพธ์ 3 แบบพร้อมกัน (หรือจะกรอกแค่อันใดอันหนึ่งก็ได้ เพื่อความยืดหยุ่น) โดยระบบจะคำนวณ `TP points` ให้อัตโนมัติจากค่า `RR` และ `SL points`
  1. **RR ปกติ:** `rr`, `max_rr`, `sl_points`, `tp_points`
  2. **RR Break Even (BE):** `rr`, `max_rr`, `sl_points`, `tp_points`
  3. **RR Trail + Break Even:** `rr`, `max_rr`, `sl_points`, `tp_points`
  - _หมายเหตุการใช้งานปุ่ม Lose:_ แต่ละประเภท RR จะมีปุ่ม `Lose` ให้กด เมื่อกดแล้วระบบจะบันทึกค่านั้นเป็น `-1` ตัวอย่างเช่น ในไม้เดียวกัน RR ปกติอาจจะแพ้ (ผู้ใช้กรอก -1) แต่ถ้านับแบบ BE อาจจะเก็บได้ 1RR (ผู้ใช้กรอก 1) และถ้านับแบบ Trail อาจจะปิดกำไรได้ 0.5RR (ผู้ใช้กรอก 0.5) ทำให้สามารถเก็บสถิติความแตกต่างของแต่ละวิธีจัดการออเดอร์ในไม้เดียวได้

---

## 13. ระบบรายงานและสถิติ (Reports & Dashboard)

ระบบรายงานจะต้องสามารถปรับแต่งและจำลองสถิติเพื่อให้เห็นภาพการทดสอบในมุมกว้างได้

### 13.1. ตัวกรองข้อมูล (Filters & Simulation Settings)

- มีตัวกรอง (Filter) ให้เลือกใช้งานจาก **ทุกฟิลด์** ของ Journal Entry
- ส่วนของ `Custom Columns` หากตั้งค่า `report_filter` ไว้เป็น `true` จะปรากฏเป็นตัวกรองในหน้านี้ด้วย
- **Simulation Inputs:** สำหรับจำลองผลลัพธ์ภาพรวม โดยให้ผู้ใช้กรอก:
  - `Initial Balance` ($): ทุนเริ่มต้น
  - `Risk per trade` (%): ความเสี่ยงต่อการเทรด 1 ไม้
  - `Return Calculation` (Enum): `Simple`, `Log (compounded)`

### 13.2. การแสดงผลสถิติและตัวเลข (Metrics & KPIs)
 
 - มีตารางโชว์ข้อมูลการเทรดตามรายการที่ Filter (ตาราง Recent Trades)
 - **ระบบแบ่งหน้า (Table Pagination):**
   - มีระบบ Pagination ผ่านคอมโพเนนต์ส่วนกลาง `BasePagination` รองรับการปรับเปลี่ยนจำนวนแถวต่อหน้า (Rows per page: 10, 25, 50, 100)
   - ปุ่มเปลี่ยนหน้า: First (`<<`), Previous (`<`), ปุ่มหมายเลขหน้าพร้อม Smart Ellipsis, Next (`>`), Last (`>>`)
   - แสดงข้อความสรุปช่วงรายการ เช่น `Showing 1 to 10 of 45 trades`
   - **ความถูกต้องของสถิติ:** ตัวชี้วัด KPIs ภาพรวม (Win Rate, Total Trades, Net PnL, Drawdown ฯลฯ) และกราฟทั้งหมดยังคงคำนวณจาก `filteredTrades` เต็มชุดข้อมูลเสมอ (ไม่ถูกตัดทอนตามหน้าตาราง)
   - **ระบบเลือกข้อมูล (Selection):** Checkbox บนหัวตารางรองรับการเลือกไม้ในหน้าปัจจุบัน พร้อมตัวเลือก *"Select all matching trades"* สำหรับเลือกไม้ทั้งหมดข้ามหน้า
   - รีเซ็ตกลับไปหน้า 1 อัตโนมัติเมื่อผู้ใช้เปลี่ยนตัวกรองข้อมูล
 - **RR Mode Toggle:** ต้องมีปุ่มให้สลับมุมมองสถิติระหว่าง `Normal`, `BE`, `Trail+BE` ซึ่งเมื่อสลับ ค่าสถิติเฉลี่ยต่างๆ (เช่น AVG RR) จะเปลี่ยนไปตามประเภทที่เลือก
- **ข้อมูลสถิติที่แสดงด้านบน (อ้างอิงตาม UI):**
  - ข้อมูลรวม: Total trades (จำนวนที่ค้นหาเจอ), Wins, Losses, Net PnL, Gross Profit, Gross Loss, Profit Factor
  - ข้อมูล RR: AVG RR, MAX RR, AVG MAX RR, Total RR (RR ที่เก็บได้ทั้งหมด)
  - ข้อมูลอื่นๆ: AVG Win $, AVG Lose $, Consecutive Wins, Consecutive Losses, Final Balance, Max Drawdown %
  - Winners and Losers Breakdown อย่างละเอียด

### 13.3. กราฟและการแสดงผล (Charts & Visualizations)

- **Equity Curve:** กราฟเส้นแสดงการเติบโตของพอร์ต
- **Drawdown (%):** กราฟพื้นที่สีแดงแสดงเปอร์เซ็นต์การขาดทุนสะสม
- **Net PnL Breakdown:** กราฟแท่งแสดงผลกำไร/ขาดทุนรายวัน (จันทร์-ศุกร์)
- **Performance by Side:** กราฟโดนัท/วงกลมแสดงสัดส่วน Total Trades และ Win Rate แยกระหว่าง Buy และ Sell
- **Performance by Session:** กราฟเรดาร์ (Radar Chart) แสดงสถิติ Win Rate, Total Trades, Avg RR, และ Profit แยกตาม Session
- **Performance by Time:** กราฟแท่งกระจายตามช่วงเวลาของวัน
- **Calendar (ปฏิทินการเทรด):** ปฏิทินแสดงสรุปข้อมูลรายวัน ว่าในวันนั้นๆ ได้กำไรเท่าไหร่ หรือเสียเท่าไหร่ เพื่อดูความต่อเนื่องของการเทรด

---

## 14. ระบบจำลอง Monte Carlo Simulation

ระบบจำลองสถานการณ์ความเสี่ยงและผลตอบแทนในอนาคต แยกเป็นหน้าใหม่ `/monte-carlo` ตามหลักวิชาการ:

### 14.1. ทฤษฎีและตัวชี้วัด (Theory & Risk Metrics)
- **Van Tharp's R-multiple Bootstrap:** สุ่มค่า R-multiples จากข้อมูลประวัติการเทรด
- **Kevin Davey's Risk Analysis:**
  - Max Drawdown ที่ระดับ P95 (Worst 5%)
  - Risk of Ruin ระหว่างทาง (Anytime Ruin)
  - Max Consecutive Losses distribution (การกระจายตัวของไม้แพ้ต่อเนื่อง)

### 14.2. การตั้งค่าและการคำนวณ (Simulation Settings & Methods)
- **โหมด RR:** Normal RR, Break Even (BE), Trail + BE
- **ตัวกรอง (Shared Filter):** ใช้ `TradeFiltersBar` รองรับ Setup, Symbol, Session, Paper Trades, Date Range, และ Setup Custom Columns
- **วิธีการสุ่ม:**
  - `Bootstrap`: สุ่มใส่คืน
  - `Shuffle`: สลับลำดับเดิม ไม่ใส่คืน (จำนวนไม้ล็อกเท่าจำนวนไม้จริง)
  - `Block Bootstrap`: สุ่มบล็อกไม้ติดกัน (รักษา Autocorrelation) พร้อมระบุ Block Size
- **การคำนวณผลตอบแทน:** Simple (Fixed Risk) หรือ Log Compounded
- **เกณฑ์และรอบจำลอง:** รอบจำลองสูงสุด 20,000 รอบ, Ruin Threshold % (Anytime), Seeded PRNG (`mulberry32`)
- **Stress Testing:** ปรับลด R ไม้ชนะ $X\%$, สุ่มข้ามไม้ $Y\%$
- **การประมวลผล:** ประมวลผลใน Web Worker พื้นหลัง ไม่ทำให้ UI ค้าง

### 14.3. การแสดงผล (Visualizations & Tables)
- Summary Cards (Median Return, P5 Return, Profit Probability, Median DD, P95 DD, Risk of Ruin, P95 Consec Losses)
- Equity Cone Chart (Percentiles 5/25/50/75/95 พร้อม Actual Equity ซ้อนทับ)
- Max Drawdown Histogram (พร้อมเส้น Median และ P95)
- Final Balance Histogram (พร้อมเส้นทุนเริ่มต้น)
- Max Consecutive Losses Distribution Bar Chart
- Detailed Percentile Statistics Table (P5, P25, P50, P75, P95)

---

## 15. ระบบวิเคราะห์ Edge (Edge Analysis)

หน้าวิเคราะห์ความได้เปรียบทางสถิติของระบบเทรด แยกเป็นหน้า `/edge`:

### 15.1. Performance by Setup (เปรียบเทียบโมเดล Setup แบบ Multi-Cohort)
- **ระบบเพิ่มตัวกรองเปรียบเทียบ Setup ได้ไม่จำกัด:** มีปุ่ม `+ เพิ่ม Setup เปรียบเทียบ` เพื่อให้ผู้ใช้เลือกเพิ่ม Setup ที่ต้องการเปรียบเทียบได้ตามต้องการ (เช่น เพิ่ม 2 ตัวเพื่อเทียบ 2 Setup หรือเพิ่ม 3, 4 Setup ได้ไม่จำกัด)
- แต่ละ Setup Filter Card สามารถกำหนดเงื่อนไขเฉพาะของตัวเองได้อย่างอิสระ: Setup Name, Symbol, Session, Date Range, Paper Trades Toggle, และ Custom Columns เฉพาะของ Setup นั้น
- **Head-to-Head Hero Card:** เมื่อเลือกเปรียบเทียบ 2 Setup (เช่น HA Model vs SMC Classic) ระบบจะแสดงการเปรียบเทียบตัวต่อตัวพร้อมสรุปผลต่าง (Delta): Expectancy Diff, Win Rate Diff, Profit Factor Diff, Net R Diff, และระบุ Setup ที่มี Edge สูงกว่า
- **ตัวชี้วัดหลักในตาราง:** Win Rate (WR %), Expectancy (Avg R per trade), Profit Factor (PF), จำนวนไม้ (Trades) & % Share, Total Net R, Avg Win R / Avg Loss R, Avg Potential MFE (Max RR), และ Kelly Criterion %
- ระบบจัดเรียง (Sorting) ตามตัวชี้วัดใดก็ได้ พร้อม Highlight ระบุ "Top Edge Setup" และ "Best Profit Factor"
- สลับโหมด RR ได้: Normal RR, Break Even (BE), Trail + BE

### 15.2. R-Multiple Distribution (การกระจายตัวของผลการเทรด)
- กราฟแท่ง Histogram แสดงจำนวนและความถี่ของ R-Multiples แต่ละไม้ (-1R, 1R, 2R, 3.5R...)
- แยกสีชัดเจน: แดง (Losses), เทา (BE / 0R), เขียว (Wins)
- วิเคราะห์ **Profit Concentration (Pareto Test)**: ตรวจสอบว่ากำไรมาจากไม้ใหญ่ไม่กี่ไม้ (Top 3 trades share > 60%) หรือกระจายตัวสม่ำเสมอ
- แสดงค่าสถิติเชิงพรรณนา: Mean Expectancy, Median Outcome, Standard Deviation, และ Distribution Skewness (Right-skewed vs Left-skewed)

### 15.3. Heatmap วัน × ชั่วโมง (Trading Time Performance)
- ตาราง Heatmap เมทริกซ์ 7 วัน (จันทร์ - อาทิตย์) × 24 ชั่วโมง (00:00 - 23:00)
- สลับ Metric การแสดงผลได้: Net R, Win Rate %, Trade Count, Expectancy (Avg R)
- สรุปขอบตาราง (Margin Totals) รายวัน (Day Total) และรายชั่วโมง (Hour Total)
- ระบุ **Prime Trading Window** (ช่วงเวลาที่ทำกำไรได้ดีที่สุด) และ **Danger Zone** (ช่วงเวลาที่มีผลขาดทุนสะสมมากที่สุด)

### 15.4. MAE / MFE Analysis (กราฟ Scatter วิเคราะห์ Excursion)
- กราฟ Scatter Plot ต่อยอดจากข้อมูล Potential MFE:
  - **Realized RR vs Potential MFE:** ตรวจสอบว่า "ปิด TP เร็วไปไหม" พร้อมเส้นอ้างอิง $Y = X$ (Peak Exit Efficiency)
  - **MAE vs MFE:** ตรวจสอบว่า "วาง SL แน่นไปไหม" วิเคราะห์ความสัมพันธ์ระหว่างการย่อลึก (Drawdown) กับการวิ่งไปถึงเป้าหมาย
- ตัวชี้วัด Excursion:
  - Exit Capture Efficiency (%) เฉลี่ยของไม้ชนะ
  - Total Profit Left on Table (R ที่เหลือทิ้งไว้หลังปิดออเดอร์)
  - Reversal Losses: ตรวจจับไม้ที่เคยบวก $\ge 1R$ แต่ปล่อยให้กลับมาแพ้ เพื่อแนะนำการตั้ง Break Even (BE)


