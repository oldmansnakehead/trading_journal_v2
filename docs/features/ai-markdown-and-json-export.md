# AI Analysis Export Feature (Markdown, JSON & 1-Click Copy)

## ภาพรวมของฟีเจอร์ (Feature Overview)

ฟีเจอร์ **AI Analysis Export** ออกแบบมาเพื่อให้ผู้ใช้งานสามารถนำข้อมูลบันทึกการเทรดและตัวชี้วัดประสิทธิภาพ (KPIs) จากหน้า Dashboard ไปให้โมเดล AI (เช่น ChatGPT, Claude, Gemini, DeepSeek) วิเคราะห์ได้อย่างสะดวกรวดเร็ว แม่นยำ และตรงประเด็น โดยมีทั้งการส่งออกเป็นไฟล์เอกสาร Markdown (`.md`), ไฟล์โครงสร้าง JSON (`.json`), และปุ่มลัด **1-Click Copy AI Prompt** สำหรับคัดลอกลง Clipboard ทันที

---

## คุณสมบัติเด่น (Key Capabilities)

### 1. AI-Ready Markdown (.md)
- สร้างไฟล์ Markdown ที่จัดโครงสร้างให้เหมาะสมกับการอ่านของ LLM:
  - **Embedded System Prompt:** แนบคำสั่งให้ AI สวมบทบาทเป็น Quantitative Trading Coach วิเคราะห์ 4 มิติสำคัญ (Core Edge, Sub-segments, Behavioral/Psychological Patterns, และ Actionable Rules)
  - **KPIs Executive Summary Table:** ตารางสรุปตัวเลขสถิติหลัก
  - **Performance Breakdown Tables:** สรุปผลแบ่งตาม Setup, Trading Session, และ Position Side (BUY vs SELL)
  - **Detailed Trade Log Table:** ตารางประวัติการเทรดละเอียด พร้อม escape ตัวอักษร `|` ในช่อง Notes เพื่อไม่ให้ตารางพัง

### 2. 1-Click Copy AI Prompt
- ปุ่มลัดพิเศษบนเมนู Export ที่ให้ผู้ใช้กดเพียงครั้งเดียว ระบบจะแปลงข้อมูลที่กรองอยู่ปัจจุบันเป็น AI Prompt + สถิติ แล้วคัดลอกลง Clipboard ทันที
- ผู้ใช้เพียงสลับไปที่ ChatGPT หรือ Claude แล้วกด `Ctrl+V` ก็เริ่มการวิเคราะห์ได้ทันที ไม่ต้องดาวน์โหลดหรืออัปโหลดไฟล์

### 3. Structured Machine-Readable JSON (.json)
- เหมาะสำหรับนำไปต่อยอดกับโปรแกรม Python, AI Agents, หรือ Data Pipelines:
  - ระบุ `schemaVersion: "1.0.0"`
  - สรุปตัวเลขคำนวณ KPIs
  - สรุปข้อมูล Grouping (Setup, Session, Side)
  - รายการอาร์เรย์ของ trades พร้อมค่าตัวเลขที่แปลงเป็นชนิดข้อมูลที่ถูกต้อง

### 4. รวมศูนย์ใน Export Menu บนหน้า Dashboard
- รวมอยู่ในคอมโพเนนต์ `ExportExcelButton.vue` (ปรับปรุงเป็น Multi-Format Dropdown)
- มีให้ใช้งานทั้งที่ **Header Actions** (ส่งออกข้อมูลทั้งหมดที่ Filter) และ **Recent Trades Table Header** (ส่งออกเฉพาะไม้ที่เลือก หรือทั้งหมด)

---

## สรุปไฟล์ที่เกี่ยวข้องในระบบ (File Structure)

| ส่วนประกอบ | ตำแหน่งไฟล์ | คำอธิบาย |
| :--- | :--- | :--- |
| **Service & Generators** | `src/main/services/aiExport.ts` | ฟังก์ชันสร้าง Markdown, JSON, และ Native Save Dialog |
| **Unit Tests** | `src/main/services/aiExport.test.ts` | 6 Tests ครอบคลุมการสร้าง Prompt, KPI table, Breakdowns, Escaping, JSON parsing |
| **IPC Handlers** | `src/main/ipc/journalHandlers.ts` | Handler `journal:exportAi` และ `journal:generateAiReport` |
| **Preload API** | `src/preload/index.ts` & `index.d.ts` | สะพานเชื่อมคำสั่งระหว่าง Renderer และ Main Process |
| **UI Dropdown Component** | `src/renderer/src/components/ui/ExportExcelButton.vue` | เมนู Dropdown 4 ทางเลือกพร้อม Toast แจ้งเตือน |
| **ADR** | `docs/adr/0009-ai-markdown-and-json-export.md` | บันทึกการตัดสินใจทางสถาปัตยกรรม |

---

## ผลการทดสอบและการรับรอง (Verification Results)

1. **Unit Testing:** ผ่าน 63/63 tests ครบทุกเคส
2. **Typecheck:** ผ่านทั้ง Node และ Web (0 errors)
3. **E2E Playwright:** ผ่าน 2/2 tests พร้อมสร้างรายงาน PDF
