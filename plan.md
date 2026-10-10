# Implementation Plan: Trading Journal v2

แผนการพัฒนาโปรเจกต์ Trading Journal v2 โดยอ้างอิงจาก Requirement และ Tech Stack ที่กำหนดไว้

## 🎯 Tech Stack หลัก

| ส่วน              | เทคโนโลยี                                             |
| ----------------- | ----------------------------------------------------- |
| **Runtime**       | Electron (Offline / Local 100%)                       |
| **Build / Dev**   | electron-vite                                         |
| **Language**      | TypeScript (`strict: true`)                           |
| **Frontend**      | Vue 3 (Composition API) + Pinia + Vue Router          |
| **UI Framework**  | shadcn-vue (+ Tailwind CSS)                           |
| **Database**      | SQLite (`better-sqlite3`) ใช้ใน Main Process เท่านั้น |
| **ORM**           | Drizzle ORM + drizzle-kit                             |
| **Image**         | `sharp` (จัดการรูปภาพ)                                |
| **Export/Import** | `archiver` + `extract-zip`                            |
| **Packaging**     | `electron-builder` + Auto Update (GitHub Releases)    |
| **Testing**       | Playwright (E2E Testing)                              |

---

## 📋 แผนการพัฒนา (Phases)

### Phase 1: Project Setup & Infrastructure (โครงสร้างพื้นฐาน)

- [x] สร้างโปรเจกต์ด้วย `electron-vite` (แยก main / preload / renderer)
- [x] ติดตั้งและตั้งค่า Vue 3, Pinia, Vue Router, และ shadcn-vue (Tailwind CSS)
- [x] ตั้งค่า `better-sqlite3` และ `drizzle-orm` ใน main process
- [x] สร้างระบบ IPC พื้นฐานและ `contextBridge` ใน preload
- [x] กำหนด Data Folder (`app.getPath('userData')`) สำหรับเก็บไฟล์และฐานข้อมูล

### Phase 2: Database & Core Models (ระบบฐานข้อมูล)

- [x] สร้าง Schema สำหรับ `Setup`, `Setup Session`, `Setup Playbook`, `Strategies`, `Custom Columns`, และ `Symbols`
- [x] สร้าง Schema สำหรับ `Journal Entry` (รองรับ RR 3 รูปแบบ และ Dynamic Data จาก Custom Columns)
- [x] ตั้งค่า Drizzle migration ให้รันอัตโนมัติเมื่อเปิดแอป
- [x] สร้าง API Handler (IPC) สำหรับ CRUD ข้อมูลพื้นฐาน

### Phase 3: Core Features - Journaling (ระบบบันทึกการเทรด)

- [x] สร้างหน้า UI สำหรับจัดการ Setup และการตั้งค่า (Settings)
- [x] สร้างฟอร์มเพิ่ม/แก้ไข Journal Entry
- [x] พัฒนาระบบอัปโหลดรูปภาพผ่าน `sharp` (บันทึกไฟล์เป็น Hash, เก็บลงโฟลเดอร์ `images/`)
- [x] สร้าง Custom Protocol (`app-img://`) สำหรับดึงรูปมาแสดงผลใน Vue อย่างปลอดภัย
- [x] คำนวณ TP Points อัตโนมัติจาก RR และ SL Points

### Phase 4: Dashboard & Reports (ระบบสถิติและรายงาน)

- [x] สร้างระบบ Filter จากทุกฟิลด์และ Custom Columns
- [x] สร้างระบบคำนวณ KPIs (Total Trades, Win Rate, AVG RR, Max Drawdown, PnL)
- [x] สร้าง UI สำหรับสลับโหมดมุมมองสถิติ (Normal, BE, Trail+BE)
- [x] แสดงผลกราฟ (สร้าง UI พื้นฐานด้วย Chart.js เช่น Doughnut, Bar, Area)
- [x] สร้างหน้า Trading Calendar (UI)

### Phase 5: Data Management (ระบบสำรองข้อมูล)

- [x] พัฒนาฟังก์ชัน Export ข้อมูลเป็นไฟล์ `.zip` (มี `manifest.json`, `data.db`, `images/`)
- [x] พัฒนาฟังก์ชัน Import (แตกไฟล์, เช็คเวอร์ชัน, สำรองข้อมูลเก่าก่อนทับ, แจ้งเตือนข้อผิดพลาด)
- [x] ระบบ Auto-backup ภายในเครื่อง

### Phase 6: Packaging & Auto-Update (การแจกจ่ายแอป)

- [x] ตั้งค่า `electron-builder` (ครอบคลุม `asarUnpack` สำหรับ native modules)
- [x] ติดตั้งและเชื่อมต่อระบบ Auto Update ดึงข้อมูลจาก GitHub Releases
- [x] ทดสอบ Build และ Publish สำหรับ OS ต่างๆ (Windows / macOS / Linux)

### Phase 7: E2E Testing & Reporting (ทดสอบระบบ)

- [x] ตั้งค่า Playwright สำหรับเทสอบการทำงานของแอป Electron
- [x] เขียน Automated Test ครอบคลุมฟีเจอร์หลัก (สร้าง Setup, บันทึก Journal, Export/Import)
- [x] เพิ่มระบบสร้างรายงานผลแบบ **PDF** อัตโนมัติหลังรัน Test
- [x] ในรายงาน PDF ต้องมี Screenshots พร้อมคำอธิบายผลลัพธ์โดยละเอียดแต่ละสเต็ป

### Phase 8: Database & API Integration (การเชื่อมต่อข้อมูลจริง)

- [x] แทนที่ Mock Data ใน UI ด้วยการดึง/บันทึกข้อมูลจริงจาก SQLite ผ่าน IPC (Dashboard, Journal)
- [x] พัฒนาระบบ `Custom Columns` ในฝั่ง UI ให้รองรับ Dynamic Fields แบบเต็มรูปแบบ (อิงจาก DB)
- [x] ย้ายตรรกะการคำนวณสถิติ (KPIs) ที่ซับซ้อนไปไว้ใน Main Process เพื่อให้ query ข้อมูลได้รวดเร็ว
- [x] เชื่อมต่อระบบ Filter จากทุกฟิลด์ (รวมถึง Custom Columns) ให้คิวรีข้อมูลตามเงื่อนไขได้จริง
- [x] แทนที่ Mock Data ของ Calendar ด้วยข้อมูลจริง

### Phase 9: Advanced Dashboard & Simulation (การจำลองผลและรายงานขั้นสูง)

- [x] เพิ่ม Simulation Inputs บน Dashboard (Initial Balance, Risk per trade %) และนำมาคำนวณ
- [x] พัฒนากราฟหลักที่ยังขาดอยู่: Equity Curve (Simulated), Win/Loss Ratio
- [x] สร้างกราฟเพิ่มเติม: Drawdown (%), Net PnL (รายวัน), Performance by Side, Performance by Session (Radar), Performance by Time
- [x] สร้างหน้ารายงาน Winners and Losers Breakdown อย่างละเอียด
- [x] เชื่อมต่อระบบ Trading Calendar ให้โชว์ข้อมูลกำไร/ขาดทุนรายวันจากฐานข้อมูลจริง

---

_หมายเหตุ: แผนการทำงานนี้สามารถปรับเปลี่ยนได้ตามความเหมาะสมในระหว่างการพัฒนา_
### Phase 10: Settings & Refinements (ตั้งค่าระบบและเก็บรายละเอียด)

- [ ] พัฒนาระบบจัดการ Setup (Sessions, Playbooks, Strategies)
- [ ] พัฒนาระบบจัดการ Custom Columns ให้อ้างอิงกับ Setup
- [x] พัฒนาระบบจัดการ Symbols (เพิ่ม/ลบ)
- [ ] เพิ่มปุ่ม Lose (-1) ในหน้าบันทึก Journal สำหรับแต่ละประเภท RR
- [x] จัดการระบบ Image URLs และการแสดงผล Preview
- [ ] เชื่อมต่อ API ทั้งหมดในหน้า Settings ให้สมบูรณ์
