# Trading Journal v2 📈

แอปพลิเคชัน Desktop สำหรับบันทึกและวิเคราะห์สถิติการเทรดส่วนตัว (Offline & Local 100%) พัฒนาด้วย Electron, Vue 3, TypeScript, Tailwind CSS และ SQLite (Drizzle ORM)

---

## 🚀 ฟีเจอร์หลัก (Key Features)

- **Journal Entry:** บันทึกการเทรดแบบ Multi-tab พร้อมรองรับ 3 โหมด RR (Normal, Break Even, Trail + BE), แท็ก Session อัตโนมัติ, แนบรูปภาพ, และสร้าง Custom Columns อิสระในแต่ละ Setup
- **Reports & Dashboard:** หน้าวิเคราะห์ผลตอบแทน, KPIs (Win Rate, Profit Factor, Max Drawdown, Net PnL), กราฟ Equity Curve, Net PnL breakdown รายวัน, Session Radar Chart, และตารางประวัติการเทรดล่าสุด (**Recent Trades**) พร้อมระบบ **Pagination** (`10`, `25`, `50`, `100` แถวต่อหน้า)
- **Monte Carlo Simulation (`/monte-carlo`):** จำลองความเสี่ยงและผลตอบแทนในอนาคตตามหลักการ Van Tharp's Bootstrap, Kevin Davey's Risk Analysis (P95 Max DD, Anytime Ruin %, Max Consecutive Losses) ประมวลผลผ่าน Web Worker
- **Edge Analysis (`/edge`):** วิเคราะห์ความได้เปรียบของระบบเทรด, เปรียบเทียบหลาย Setup พร้อมกัน (Multi-Cohort Comparison), R-Distribution, Day-Hour Heatmap, และ MAE/MFE Excursion Analysis
- **Trading Calendar (`/calendar`):** ปฏิทินแสดงสรุปผลกำไร/ขาดทุนสะสมรายวัน
- **Data Management (`/data`):** สำรองข้อมูลอัตโนมัติ (Auto-backup), Export/Import ไฟล์ `.zip` รวมฐานข้อมูลและรูปภาพแบบ Offline 100%
- **Responsive Navigation:** เมนู Sidebar แสดงผลสมบูรณ์ที่ความกว้าง 900px พร้อม Mobile Drawer สำหรับหน้าจอแคบ (< 768px)

---

## 🛠️ Tech Stack

- **Runtime:** Electron (Main + Preload + Renderer architecture)
- **Frontend:** Vue 3 (Composition API, `<script setup>`), Pinia, Vue Router (Hash mode)
- **Styling:** Tailwind CSS, Phosphor Icons
- **Database:** SQLite ผ่าน `better-sqlite3` ใน Main Process, Drizzle ORM
- **Testing:** Vitest (Unit Tests), Playwright (E2E Tests)
- **Reporting:** Dynamic PDF Reporter ผ่าน PDFKit
- **Design System:** Storybook 10 + Vue Flow

---

## 💻 การติดตั้งและคำสั่งที่ใช้บ่อย (Commands)

```bash
# ติดตั้ง dependencies
npm install

# รันโหมด Development (Hot Reload)
npm run dev

# ตรวจสอบ TypeScript Types (Node & Web)
npm run typecheck

# รัน Unit Tests (Vitest)
npm run test:unit

# รัน Automated E2E Tests และสร้าง Dynamic PDF Report (Playwright)
npm run test:e2e

# เปิด Storybook สำหรับ Component & Vue Flow
npm run storybook

# Build สำหรับ Production
npm run build
npm run build:win
```

---

## 📚 เอกสารประกอบ (Documentation)

- [Requirements Draft](REQUIREMENTS_DRAFT.md)
- [Antigravity Guidelines (AGENTS.md)](AGENTS.md)
- [Architectural Decision Records (docs/adr/)](docs/adr/)
- [Feature Documentation (docs/features/)](docs/features/)
  - [Dashboard Table Pagination](docs/features/dashboard-pagination.md)
  - [Responsive Navigation & E2E PDF Report](docs/features/responsive-navigation-and-e2e-pdf-report.md)
  - [Monte Carlo Simulation](docs/features/monte-carlo-simulation.md)
  - [Edge Analysis](docs/features/edge-analysis.md)
