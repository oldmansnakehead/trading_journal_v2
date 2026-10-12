# Dashboard Excel & CSV Export Feature

## ภาพรวมของฟีเจอร์ (Feature Overview)

ฟีเจอร์ **Export ข้อมูลเป็น Excel / CSV ในหน้า Dashboard** ช่วยให้เทรดเดอร์สามารถส่งออกประวัติการเทรดที่ผ่านการกรอง (Filtered Trades) พร้อมทั้งสรุปผลประสิทธิภาพ (KPI Summary) ออกมาเป็นไฟล์สเปรดชีต Excel มาตรฐาน (`.xlsx`) หรือไฟล์ Comma-Separated Values (`.csv`) เพื่อนำไปเปิดใช้งาน วิเคราะห์ต่อ หรือจัดเก็บรายงานได้อย่างสะดวกรวดเร็ว

---

## คุณสมบัติเด่น (Key Capabilities)

### 1. Dual-Sheet Excel Workbook (.xlsx)
เมื่อบันทึกเป็นไฟล์ `.xlsx` ไฟล์จะประกอบด้วย 2 แผ่นงาน (Worksheets):
- **Sheet 1: `Trades` (ประวัติการเทรดละเอียด)**
  - คอลัมน์ครบถ้วน: Trade ID, Entry Date, Setup, Symbol, Position (Buy/Sell), Session, Risk/Reward (RR), Profit/Loss ($), Trade Quality, Notes
  - ตกแต่งส่วนหัวตาราง (Header Row) ด้วยตัวหนา (Bold font), พื้นหลังเขียวอ่อน (Light Emerald), และเส้นขอบตาราง (Border)
- **Sheet 2: `KPI Summary` (บทสรุปประสิทธิภาพ)**
  - รวมสถิติสำคัญ: Total Trades, Winning Trades, Losing Trades, Break Even Trades, Win Rate (%), Profit Factor, Net PnL ($), Gross Profit ($), Gross Loss ($), Average RR, Max Drawdown ($)

### 2. Full Thai & Unicode Compatibility
- แก้ไขปัญหาภาษาต่างดาว (Mojibake) บนโปรแกรม Microsoft Excel บน Windows:
  - ในไฟล์ `.xlsx`: ข้อมูลและหัวข้อภาษาไทยถูก encode ในรูปแบบ XML UTF-8
  - ในไฟล์ `.csv`: มีการใส่ UTF-8 Byte Order Mark (`\uFEFF`) นำหน้าข้อมูลเสมอ ทำให้ Excel บน Windows แสดงผลภาษาไทยได้ถูกต้อง 100%

### 3. Native File Dialog & Export Selected Option
- เรียกใช้ Electron Native Save Dialog (`dialog.showSaveDialog`) ให้ผู้ใช้สามารถเลือกโฟลเดอร์ปลายทาง ตั้งชื่อไฟล์ และเลือกประเภทไฟล์ (`.xlsx` หรือ `.csv`) ได้ตามต้องการ
- รองรับ 2 จุดบริการในหน้า Dashboard:
  - **Header Actions (Top):** ส่งออกข้อมูลทั้งหมดที่ผ่านตัวกรองปัจจุบัน (Filtered Dataset) พร้อมสถิติ KPI
  - **Recent Trades Table Header:** ส่งออกเฉพาะรายการที่เลือก (Batch Selected Trades) เมื่อมีแถวถูกเลือก หรือส่งออกทั้งหมดเมื่อไม่ได้เลือกแถวใด

### 4. Zero Additional Dependencies
- ปฏิบัติตาม `REQUIREMENTS_DRAFT.md` อย่างเคร่งครัด โดยไม่เพิ่ม external library เช่น `exceljs` หรือ `xlsx`
- สร้างไฟล์ ZIP ตามมาตรฐาน ECMA-376 OpenXML โดยใช้แพ็กเกจ `archiver` ที่มีอยู่ในโปรเจกต์เดิม

---

## โครงสร้างไฟล์ที่เกี่ยวข้อง (Architecture & File Structure)

| หน้าที่ | ตำแหน่งไฟล์ | คำอธิบาย |
| :--- | :--- | :--- |
| **Main Service** | `src/main/services/excelExport.ts` | ฟังก์ชันสร้าง ECMA-376 `.xlsx` และ RFC 4180 `.csv` |
| **Unit Tests** | `src/main/services/excelExport.test.ts` | 10 Unit Tests ครอบคลุม XML escaping, column naming, sheet XML, BOM |
| **IPC Handler** | `src/main/ipc/journalHandlers.ts` | Handler `journal:exportExcel` เชื่อมต่อ native dialog และ service |
| **Preload Bridge** | `src/preload/index.ts` & `index.d.ts` | Type-safe IPC invocation บน `window.api.journal.exportExcel` |
| **UI Component** | `src/renderer/src/components/ui/ExportExcelButton.vue` | ปุ่ม Export พร้อมสถานะ Loading และ Toast Notification |
| **Storybook** | `src/stories/ExportExcelButton.stories.ts` | เรื่องราว Storybook สำหรับคอมโพเนนต์ปุ่ม Export |
| **Vue Flow Node** | `src/renderer/src/components/flow/ExportExcelButtonNode.vue` | Node สำหรับผังงาน Vue Flow ตามกฎ Rule 5 |
| **Flow Story** | `src/stories/ExportExcelButtonNode.stories.ts` | เรื่องราว Storybook สำหรับ Vue Flow Node |
| **Dashboard** | `src/renderer/src/components/views/DashboardView.vue` | การติดตั้งคอมโพเนนต์ลงในหน้า Dashboard |
| **ADR** | `docs/adr/0008-dashboard-excel-export.md` | บันทึกการตัดสินใจทางสถาปัตยกรรม |

---

## การทดสอบและการรับรองผล (Verification)

1. **Unit Testing:**
   - ทดสอบการคำนวณชื่อคอลัมน์ Excel: A..Z, AA..AZ, BA..
   - ทดสอบ XML character escaping (`&`, `<`, `>`, `"`, `'`)
   - ทดสอบการสร้าง XML Sheet และตาราง KPI Summary
   - ทดสอบ UTF-8 BOM ในไฟล์ CSV
   - **ผลลัพธ์:** ผ่านครบ 57/57 tests
2. **Typecheck:**
   - ตรวจสอบความถูกต้องของ TypeScript ทั้งฝั่ง Node และ Web (`npm run typecheck`)
   - **ผลลัพธ์:** 0 errors
3. **E2E Testing:**
   - ยืนยันการแสดงผลและพร้อมใช้งานของปุ่ม Export Excel ในหน้า Dashboard ผ่าน Playwright
