# 8. Dashboard Data Export to Excel (.xlsx) and CSV

## Status

Accepted

## Context

ผู้ใช้งานต้องการส่งออกข้อมูลการเทรดและสรุปผลประสิทธิภาพ (KPIs) จากหน้า Dashboard ออกมาเป็นไฟล์ตารางคำนวณ Excel (`.xlsx`) และ Comma-Separated Values (`.csv`) เพื่อนำไปวิเคราะห์ต่อใน Microsoft Excel, Google Sheets, หรือโปรแกรม Data Analysis อื่นๆ

ข้อจำกัดสำคัญตาม `REQUIREMENTS_DRAFT.md` (ข้อ 12: Constraints & Prohibitions):
1. **ห้ามติดตั้ง npm package เพิ่มเติมโดยพลการ:** แอปพลิเคชันมี package `archiver` อยู่แล้วใน `package.json`
2. **Offline-first & Zero External Network:** การประมวลผลและการบันทึกไฟล์ต้องเกิดขึ้นบนเครื่องผู้ใช้ทั้งหมดโดยสมบูรณ์
3. **รองรับภาษาไทยและอักขระสากล (Unicode/UTF-8 BOM):** ในโปรแกรม Excel บน Windows การเปิดไฟล์ CSV ต้องมี UTF-8 BOM (`\uFEFF`) เสมอเพื่อป้องกันปัญหาภาษาต่างดาว (mojibake)
4. **ความเข้ากันได้ตาม AGENTS.md Rule 5:** เมื่อสร้าง Component ใหม่ ต้องสร้าง Storybook Story และ Vue Flow Node ควบคู่กันเสมอ

## Decision

เราตัดสินใจออกแบบสถาปัตยกรรมและพัฒนาฟีเจอร์ Dashboard Excel Export ดังนี้:

1. **Pure OpenXML (.xlsx) Generation (`src/main/services/excelExport.ts`):**
   - ไฟล์ Excel `.xlsx` ตามมาตรฐาน ECMA-376 คือ ZIP container ที่บรรจุไฟล์ XML
   - ใช้ package `archiver` ที่มีอยู่แล้วในการบีบอัดโครงสร้าง ZIP โดยไม่ต้องติดตั้ง library ภายนอกขนาดใหญ่ เช่น `exceljs` หรือ `xlsx`
   - โครงสร้างไฟล์ใน ZIP archive:
     - `[Content_Types].xml`: กำหนด content types สำหรับ workbook, worksheet, styles, rels
     - `_rels/.rels`: กำหนด root relationship ชี้ไปยัง `xl/workbook.xml`
     - `xl/workbook.xml`: นิยาม 2 Worksheets คือ **Trades** (ประวัติการเทรดละเอียด) และ **KPI Summary** (สรุปผลสถิติหลัก)
     - `xl/_rels/workbook.xml.rels`: กำหนด sheet relationships
     - `xl/styles.xml`: กำหนด cell formatting สำหรับ Header แถวแรก (Font Bold, Light Green Fill, Thin Border)
     - `xl/worksheets/sheet1.xml`: ตารางประวัติการเทรด (ID, วันที่, Setup, Symbol, Position, Session, RR, PnL, Quality, Notes, ฯลฯ)
     - `xl/worksheets/sheet2.xml`: ตารางสรุปภาพรวม KPI (Total Trades, Win Rate, Profit Factor, Net PnL, Gross Profit, Gross Loss, Max Drawdown)
   - ใช้ OpenXML inline strings (`t="inlineStr"` และ `<is><t>...</t></is>`) ช่วยลดความซับซ้อนของการบริหารจัดการ `sharedStrings.xml` และสร้างไฟล์ได้อย่างรวดเร็ว

2. **BOM-prefixed CSV Export Fallback:**
   - ในกรณีที่ผู้ใช้เลือกบันทึกเป็น `.csv` ระบบจะสร้างไฟล์ CSV ที่ขึ้นต้นด้วย UTF-8 BOM (`\uFEFF`) พร้อม escape quotation marks ตามมาตรฐาน RFC 4180 อย่างถูกต้อง

3. **IPC Architecture & Native Save Dialog:**
   - Handler ใน Main Process: `journal:exportExcel` ใน `src/main/ipc/journalHandlers.ts`
   - เรียกใช้ `dialog.showSaveDialog` ของ Electron พร้อมตัวเลือก Format:
     - `Excel Workbook (*.xlsx)`
     - `Comma Separated Values (*.csv)`
   - Preload API: ขยาย `window.api.journal.exportExcel` ใน `src/preload/index.ts` และ `src/preload/index.d.ts`

4. **UI Component & Dashboard Integration (`ExportExcelButton.vue`):**
   - พัฒนา `src/renderer/src/components/ui/ExportExcelButton.vue`
   - ติดตั้งใน 2 ตำแหน่งสำคัญบนหน้า Dashboard:
     - **Header Actions:** ด้านบนสุดติดกับปุ่ม Export Image สำหรับ Export ข้อมูลสรุปทั้งหมดที่ผ่าน Filter
     - **Recent Trades Table Header:** ด้านบนตารางประวัติการเทรด รองรับการ Export เฉพาะรายการที่เลือก (Batch Selected Trades) หรือรายการทั้งหมดตาม Filter
   - มี Browser download fallback สำหรับ Storybook และ Preview mode

5. **Storybook & Vue Flow (`AGENTS.md` Rule 5):**
   - Storybook Story: `src/stories/ExportExcelButton.stories.ts`
   - Vue Flow Node: `src/renderer/src/components/flow/ExportExcelButtonNode.vue`
   - Vue Flow Story: `src/stories/ExportExcelButtonNode.stories.ts`

## Consequences

- **ข้อดี:**
  - ปฏิบัติตาม Zero-New-Dependency Constraint อย่างเคร่งครัด
  - ไฟล์ `.xlsx` ที่ได้เป็นมาตรฐาน ECMA-376 แท้ สามารถเปิดได้ทั้งใน Microsoft Excel, Apple Numbers, Google Sheets, LibreOffice Calc
  - รองรับการ Export 2 ชีตแยกกัน (Trades รายไม้ และ KPI Summary) ในไฟล์เดียวกัน
  - รองรับภาษาไทยและอักขระพิเศษได้ 100% ไม่เกิดภาษาต่างดาว
- **ข้อเสีย:**
  - ต้องดูแลรักษาโครงสร้าง OpenXML specification ใน `excelExport.ts` เอง (ครอบคลุมด้วย Unit Tests ละเอียด 10 ข้อ)
