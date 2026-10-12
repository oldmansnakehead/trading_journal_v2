# 9. AI-Ready Markdown (.md) and JSON Export with One-Click Prompt Copy

## Status

Accepted

## Context

ผู้ใช้ต้องการนำข้อมูลบันทึกการเทรดและตัวชี้วัดประสิทธิภาพ (KPIs) จากหน้า Dashboard ไปให้ปัญญาประดิษฐ์ (AI เช่น ChatGPT, Claude, Gemini, DeepSeek) วิเคราะห์ค้นหาจุดแข็ง จุดอ่อน และข้อแนะนำในการปรับปรุงระบบเทรด

ความต้องการเชิงเทคนิคและประสบการณ์ผู้ใช้ (UX):
1. **AI-Friendly Format:** โมเดล Large Language Models (LLMs) ถูกฝึกฝนมาด้วยข้อความ Markdown อย่างเข้มข้น การนำเสนอข้อมูลแบบ Markdown พร้อมหัวข้อ ตาราง และ System Prompt Instructions จะช่วยให้ AI ตีความโครงสร้างข้อมูลได้แม่นยำที่สุด
2. **Instant Accessibility (1-Click Copy Prompt):** แทนที่จะต้องดาวน์โหลดไฟล์แล้วเปิดหน้าต่างแชตเพื่ออัปโหลดไฟล์ ผู้ใช้ควรสามารถกดปุ่ม "Copy AI Prompt" เพียงคลิกเดียว แล้วนำไปวาง (`Ctrl+V`) ในหน้าต่าง ChatGPT หรือ Claude เพื่อขอคำวิเคราะห์ได้ทันที
3. **Machine-Readable JSON Schema:** สำหรับระบบอัตโนมัติหรือ AI Agents ในอนาคต การส่งออกไฟล์ JSON ที่มี schema version และ metadata ครบถ้วนเป็นสิ่งจำเป็น
4. **Offline & Zero New Dependencies:** ตามกฎ `REQUIREMENTS_DRAFT.md` การประมวลผลทั้งหมดต้องเกิดขึ้นในระบบเครื่องผู้ใช้ (Local / Offline) และไม่ติดตั้งแพ็กเกจภายนอกเพิ่ม

## Decision

เราตัดสินใจพัฒนาระบบ AI Export Service และเชื่อมต่อเข้ากับคอมโพเนนต์การส่งออกข้อมูลดังนี้:

1. **AI Export Service (`src/main/services/aiExport.ts`):**
   - **`generateAiMarkdownReport`:**
     - หัวเรื่องและ Metadata: เวลาที่สร้าง, โหมด RR, ตัวกรองที่ใช้งาน, จำนวนไม้
     - **Instructions for AI Analyst:** แนบคำสั่งให้ AI สวมบทบาทเป็น Quantitative Trading Coach และ Behavioral Risk Analyst แบ่งการวิเคราะห์ออกเป็น 4 มิติ: Core Edge Assessment, Sub-segment Breakdown (Setup/Session/Side), Risk & Psychology Diagnostics, Actionable Action Plan
     - **KPIs Executive Summary Table:** สรุปตัวเลขสถิติหลักในรูปแบบตาราง Markdown
     - **Sub-segment Breakdowns:** ตารางสรุปแยกตาม Setup, Session, Side (BUY vs SELL)
     - **Detailed Trade Log Table:** ตารางรายการเทรดละเอียด พร้อมจัดการ escape pipe characters (`\|`) ใน Notes เพื่อรักษาความถูกต้องของโครงสร้างตาราง Markdown
   - **`generateAiJsonReport`:**
     - สร้างโครงสร้าง JSON ที่ระบุ `schemaVersion: "1.0.0"`, `reportType`, `generatedAt`, `breakdowns`, `kpis`, และ `trades`
   - **`exportAiReportToFile`:**
     - เรียกใช้ Electron `dialog.showSaveDialog` พร้อมตัวเลือก Filter:
       - `Markdown Document (*.md)`
       - `JSON Document (*.json)`

2. **IPC Integration & Preload Bridge:**
   - Handler ใน `src/main/ipc/journalHandlers.ts`:
     - `journal:exportAi`: สำหรับบันทึกไฟล์ `.md` หรือ `.json` ผ่าน save dialog
     - `journal:generateAiReport`: สำหรับส่งข้อความ Markdown/JSON กลับไปยัง Renderer เพื่อนำไปคัดลอกลง Clipboard
   - Preload API ขยายใน `src/preload/index.ts` และ `src/preload/index.d.ts`:
     - `api.journal.exportAi`
     - `api.journal.generateAiReport`

3. **Unified Multi-Format Export Dropdown (`ExportExcelButton.vue`):**
   - อัปเกรดคอมโพเนนต์ปุ่ม Export ให้เป็น Dropdown Menu ที่รองรับ 4 ฟอร์แมตหลัก:
     1. 📗 **Excel Workbook (.xlsx):** 2 ชีต (Trades + KPIs)
     2. 🤖 **Markdown for AI (.md):** บันทึกไฟล์รายงานพร้อม prompt
     3. 📋 **Copy AI Prompt (1-Click):** คัดลอก prompt และสถิติลง Clipboard ทันที พร้อม Toast แจ้งเตือน
     4. 📦 **JSON Format (.json):** สำหรับ AI script หรือ Data pipeline
   - รองรับ Fallback อัตโนมัติเมื่อรันในเบราว์เซอร์หรือ Storybook (ใช้ `navigator.clipboard.writeText` และ Blob download)

## Consequences

- **ข้อดี:**
  - อำนวยความสะดวกในการนำข้อมูลไปวิเคราะห์ต่อกับ AI ได้ทันทีโดยไม่ต้องจัดรูปแบบเอง
  - ปุ่ม 1-Click Copy Prompt ช่วยลดขั้นตอนจากเดิมที่ต้องดาวน์โหลดไฟล์แล้วแนบไฟล์ เหลือเพียงคลิกเดียวแล้ว Paste ในหน้าต่าง AI
  - ครอบคลุมการส่งออกทั้ง Excel, CSV, Markdown, และ JSON ภายในคอมโพเนนต์เดียวอย่างเป็นระเบียบ
  - ผ่าน Unit Tests ทั้งหมดโดยไม่มีการเพิ่ม third-party library
- **ข้อเสีย:**
  - รูปแบบ Prompt Template ใน Markdown เป็นแบบมาตรฐาน (ในอนาคตอาจเพิ่มหน้าต่างให้ผู้ใช้ปรับแต่ง System Prompt ได้ตามต้องการ)
