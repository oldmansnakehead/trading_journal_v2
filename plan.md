# Implementation Plan: Trading Journal v2

แผนการพัฒนาโปรเจกต์ Trading Journal v2 โดยอ้างอิงจาก Requirement และ Tech Stack ที่กำหนดไว้

## 🎯 Tech Stack หลัก

| ส่วน | เทคโนโลยี |
|---|---|
| **Runtime** | Electron (Offline / Local 100%) |
| **Build / Dev** | electron-vite |
| **Language** | TypeScript (`strict: true`) |
| **Frontend** | Vue 3 (Composition API) + Pinia + Vue Router |
| **UI Framework** | shadcn-vue (+ Tailwind CSS) |
| **Database** | SQLite (`better-sqlite3`) ใช้ใน Main Process เท่านั้น |
| **ORM** | Drizzle ORM + drizzle-kit |
| **Image** | `sharp` (จัดการรูปภาพ) |
| **Export/Import** | `archiver` + `extract-zip` |
| **Packaging** | `electron-builder` + Auto Update (GitHub Releases) |
| **Testing** | Playwright (E2E Testing) |

---

## 📋 แผนการพัฒนา (Phases)

### Phase 1: Project Setup & Infrastructure (โครงสร้างพื้นฐาน)
- [ ] สร้างโปรเจกต์ด้วย `electron-vite` (แยก main / preload / renderer)
- [ ] ติดตั้งและตั้งค่า Vue 3, Pinia, Vue Router, และ shadcn-vue (Tailwind CSS)
- [ ] ตั้งค่า `better-sqlite3` และ `drizzle-orm` ใน main process
- [ ] สร้างระบบ IPC พื้นฐานและ `contextBridge` ใน preload
- [ ] กำหนด Data Folder (`app.getPath('userData')`) สำหรับเก็บไฟล์และฐานข้อมูล

### Phase 2: Database & Core Models (ระบบฐานข้อมูล)
- [ ] สร้าง Schema สำหรับ `Setup`, `Setup Session`, `Setup Playbook`, `Strategies`, `Custom Columns`, และ `Symbols`
- [ ] สร้าง Schema สำหรับ `Journal Entry` (รองรับ RR 3 รูปแบบ และ Dynamic Data จาก Custom Columns)
- [ ] ตั้งค่า Drizzle migration ให้รันอัตโนมัติเมื่อเปิดแอป
- [ ] สร้าง API Handler (IPC) สำหรับ CRUD ข้อมูลพื้นฐาน

### Phase 3: Core Features - Journaling (ระบบบันทึกการเทรด)
- [ ] สร้างหน้า UI สำหรับจัดการ Setup และการตั้งค่า (Settings)
- [ ] สร้างฟอร์มเพิ่ม/แก้ไข Journal Entry
- [ ] พัฒนาระบบอัปโหลดรูปภาพผ่าน `sharp` (บันทึกไฟล์เป็น Hash, เก็บลงโฟลเดอร์ `images/`)
- [ ] สร้าง Custom Protocol (`app-img://`) สำหรับดึงรูปมาแสดงผลใน Vue อย่างปลอดภัย
- [ ] คำนวณ TP Points อัตโนมัติจาก RR และ SL Points

### Phase 4: Dashboard & Reports (ระบบสถิติและรายงาน)
- [ ] สร้างระบบ Filter จากทุกฟิลด์และ Custom Columns
- [ ] สร้างระบบคำนวณ KPIs (Total Trades, Win Rate, AVG RR, Max Drawdown, PnL)
- [ ] สร้าง UI สำหรับสลับโหมดมุมมองสถิติ (Normal, BE, Trail+BE)
- [ ] แสดงผลกราฟ (Equity Curve, Drawdown, Profit by Session ฯลฯ)
- [ ] สร้างหน้า Trading Calendar

### Phase 5: Data Management (ระบบสำรองข้อมูล)
- [ ] พัฒนาฟังก์ชัน Export ข้อมูลเป็นไฟล์ `.zip` (มี `manifest.json`, `data.db`, `images/`)
- [ ] พัฒนาฟังก์ชัน Import (แตกไฟล์, เช็คเวอร์ชัน, สำรองข้อมูลเก่าก่อนทับ, แจ้งเตือนข้อผิดพลาด)
- [ ] ระบบ Auto-backup ภายในเครื่อง

### Phase 6: Packaging & Auto-Update (การแจกจ่ายแอป)
- [ ] ตั้งค่า `electron-builder` (ครอบคลุม `asarUnpack` สำหรับ native modules)
- [ ] ติดตั้งและเชื่อมต่อระบบ Auto Update ดึงข้อมูลจาก GitHub Releases
- [ ] ทดสอบ Build และ Publish สำหรับ OS ต่างๆ (Windows / macOS / Linux)

### Phase 7: E2E Testing & Reporting (ทดสอบระบบ)
- [ ] ตั้งค่า Playwright สำหรับเทสอบการทำงานของแอป Electron
- [ ] เขียน Automated Test ครอบคลุมฟีเจอร์หลัก (สร้าง Setup, บันทึก Journal, Export/Import)
- [ ] เพิ่มระบบสร้างรายงานผลแบบ **PDF** อัตโนมัติหลังรัน Test
- [ ] ในรายงาน PDF ต้องมี Screenshots พร้อมคำอธิบายผลลัพธ์โดยละเอียดแต่ละสเต็ป

---
*หมายเหตุ: แผนการทำงานนี้สามารถปรับเปลี่ยนได้ตามความเหมาะสมในระหว่างการพัฒนา*
