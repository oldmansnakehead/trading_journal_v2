# Responsive Navigation & Automated E2E Dynamic PDF Reporting

## 🎯 ภาพรวม (Overview)

เอกสารนี้บันทึกการแก้ปัญหาและระบบสถาปัตยกรรมของ 2 ส่วนสำคัญใน Trading Journal v2:
1. **Responsive Navigation ที่ความกว้างเริ่มต้น 900px และหน้าจอย่อ (`AppSidebar.vue`)**
2. **ระบบทดสอบ Automated Playwright E2E พร้อมรายงานผลจริงแบบ Dynamic PDF (`report.pdf`)**

---

## 🧭 Responsive Navigation System

### 1. ปัญหาเดิม
- ไฟล์ `src/main/index.ts` กำหนดขนาดหน้าต่างเริ่มต้นของ Electron ไว้ที่:
  ```ts
  width: 900,
  height: 670
  ```
- แต่ใน `src/renderer/src/App.vue` เดิม markup ของ Sidebar กำหนดเป็น:
  ```html
  <aside class="hidden lg:flex w-64 ...">
  ```
- Breakpoint `lg` ของ Tailwind CSS คือ **1024px** ส่งผลให้เมื่อเปิดแอปพลิเคชันขึ้นมาที่ขนาดเริ่มต้น 900px (หรือหน้าจอที่ต่ำกว่า 1024px) เมนูทั้งหมดจะถูกซ่อน และไม่มีปุ่มกดหรือ navigation ทางเลือก ทำให้ผู้ใช้หรือ automated test ไม่สามารถคลิกไปยังหน้า Settings, New Trade หรือหน้าอื่นๆ ได้

### 2. วิธีการแก้ไขและการออกแบบ
- แยกการจัดการเมนูออกมาเป็น Component ใหม่ [`AppSidebar.vue`](file:///I:/projects/trading_journal_v2/src/renderer/src/components/ui/AppSidebar.vue):
  - **Desktop / Tablet (`md:flex` - กว้างตั้งแต่ 768px ขึ้นไป):** แสดง Sidebar ทางซ้ายเต็มรูปแบบอย่างสวยงาม รองรับหน้าต่าง 900px เริ่มต้นได้ทันที
  - **Mobile (< 768px):** ซ่อน Sidebar อัตโนมัติ (`hidden md:flex`) และแสดง Mobile Topbar (`md:hidden`) พร้อมปุ่ม Hamburger Menu
  - **Mobile Slide-Out Drawer:** เมื่อกด Hamburger Menu จะเปิดลิ้นชักเมนู (Slide-out Drawer) ที่ครอบคลุมทุกลิงก์ (Dashboard, Win/Loss, Monte Carlo, Edge, Calendar, New Trade, Settings ฯลฯ) พร้อมปุ่มปิดและรองรับการกด `Escape` เพื่อปิด
- ปฏิบัติตามกฎข้อ 5 ใน `AGENTS.md`:
  - สร้าง Storybook Story: [`AppSidebar.stories.ts`](file:///I:/projects/trading_journal_v2/src/stories/AppSidebar.stories.ts) (ครอบคลุมทั้ง Desktop View และ Mobile View)
  - สร้าง Vue Flow Node: [`AppSidebarNode.vue`](file:///I:/projects/trading_journal_v2/src/renderer/src/components/flow/AppSidebarNode.vue)
  - สร้าง Vue Flow Story: [`AppSidebarNode.stories.ts`](file:///I:/projects/trading_journal_v2/src/stories/AppSidebarNode.stories.ts)

---

## 🧪 Automated E2E Testing & Dynamic PDF Reporting

### 1. ปัญหาเดิม
- `e2e/fill-trade.spec.ts` ล้มเหลวจาก selector ล้าสมัย (`h1:has-text("Trading Journal")` ซึ่งหน้าจริงคือ `"Reports & Dashboard"`) และ selectors สำหรับ dropdowns / inputs ไม่เสถียร
- `scripts/generate-pdf-report.js` เดิมเป็น mock script ที่ hardcode คำว่า `"PASSED"` และ mock step results ตายตัว ไม่ได้อ่านข้อมูลผลการรันจริงจาก Playwright

### 2. สถาปัตยกรรม Dynamic PDF Reporter
- **Playwright Configuration (`playwright.config.ts`)**:
  - เพิ่ม JSON Reporter: บันทึกข้อมูลผลลัพธ์โครงสร้างเต็มรูปแบบลงใน `e2e/test-results.json`
  - ผูกคลาส `PlaywrightPdfReporter` ใน `scripts/generate-pdf-report.js` เป็น custom reporter ของ Playwright ทำให้ PDF จะถูกสร้างขึ้นเสมอแม้ Test จะล้มเหลว
- **Dynamic PDF Generator Engine (`scripts/generate-pdf-report.js`)**:
  - อ่านผลลัพธ์สดจาก `e2e/test-results.json`
  - สรุป Executive Summary KPI Box (Total Tests, Passed, Failed, Skipped, Execution Duration, Timestamp)
  - แจกแจงผลราย Test Suite และแต่ละ Step พร้อมสถานะ ✅ / ❌ / ⚠️ และระยะเวลา (Duration) ในหน่วย ms/s
  - บันทึกและฝังภาพ Screenshots จริงจากขั้นตอนการทดสอบ:
    - `main-window.png`: หน้าต่างแอปขนาดเริ่มต้น 900px
    - `setup-created.png`: ผลการสร้าง Trading Setup ในหน้า Settings
    - `symbol-created.png`: ผลการสร้าง Trading Symbol
    - `trade-entry-filled.png`: การกรอกข้อมูลในหน้า New Trade
    - `toast-success.png`: แจ้งเตือนความสำเร็จเมื่อบันทึกข้อมูล
    - `dashboard-verified.png`: การยืนยันว่าข้อมูลใหม่ปรากฏในตาราง Recent Trades และมี Pagination
- **การรักษาข้อมูลเดิมของผู้ใช้**:
  - ในการรัน E2E ตัวทดสอบจะสร้าง Setup และ Symbol ด้วย Dynamic Suffix (`Date.now().toString().slice(-4)`) เพื่อไม่ให้เกิด Duplicate Key Violation บน SQLite Unique Constraint และไม่ลบข้อมูลประวัติการเทรดที่มีอยู่เดิมในเครื่อง
