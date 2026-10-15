# 11. Visual Strategy Playbook using Vue Flow

## Status

Accepted

## Context

ใน `REQUIREMENTS_DRAFT.md` (ข้อ 12.1) กำหนดให้มี **Setup Playbook** สำหรับจดสมมติฐาน กฎเกณฑ์ และเงื่อนไขต่างๆ ของ Setup อย่างละเอียด เพื่อให้เทรดเดอร์กลับมาทบทวนระบบเทรดของตนเองได้

เดิมทีระบบรองรับเพียง `<textarea>` ในการพิมพ์ข้อความธรรมดา ซึ่งมีข้อจำกัด:
1. การตัดสินใจของระบบเทรดมีลักษณะเป็นแผนผังเงื่อนไข (Decision Tree / Flowchart) เช่น Context -> Condition Filters -> Entry Trigger -> Risk Management ซึ่งการแสดงผลแบบ Flowchart อ่านและปฏิบัติตามได้ง่ายกว่า Plain Text มาก
2. เทรดเดอร์ไม่มีเครื่องมือวางผังกลยุทธ์เฉพาะทางที่จัดหมวดหมู่ประเภทของกฎ เช่น Market Bias, Liquidity Sweep, Execution Rules, และ Stop Loss / Invalidation
3. ขณะที่บันทึกไม้เทรดใน `JournalEntryForm` เทรดเดอร์ไม่สามารถเปิดดูหรือทบทวนเงื่อนไขกลยุทธ์ของ Setup นั้นได้โดยตรง ทำให้ต้องจำหรือสลับหน้าจอไปมา
4. ข้อกำหนดใน `AGENTS.md` (Rule 5) กำหนดให้ใช้ Vue Flow ควบคู่กับ Storybook เสมอเมื่อมีการพัฒนา Component หรือ Page ใหม่

## Decision

เราตัดสินใจออกแบบและพัฒนาระบบ **Visual Strategy Playbook** โดยใช้ `@vue-flow/core` ดังนี้:

1. **Database Schema & Separation:**
   - สร้างตารางใหม่ `setup_playbook_flows` ใน SQLite เพื่อแยกการจัดเก็บ Graph Data (Nodes, Edges, Viewport JSON) ออกจากตาราง Text Notes เดิม (`setup_playbooks`)
   - ผูก `setup_id` เป็น Unique Foreign Key Cascade Delete
   - รัน Migration ผ่าน `drizzle-kit`

2. **Dual-Mode Playbook Editor:**
   - ปรับปรุงแท็บ Setup Playbooks ใน `SetupSettings.vue` ให้มีปุ่มสลับระหว่าง:
     - **Visual Flowchart (Vue Flow):** แคนวาสแผนผังการตัดสินใจ พร้อม Floating Toolbar, Inspector, และ Zoom/Pan Controls
     - **Markdown Notes:** พื้นที่จดบันทึกและเงื่อนไขแบบข้อความ/Markdown
   - รองรับปุ่ม **Fullscreen Mode** เพื่อขยายแคนวาสเต็มหน้าจอทำงานได้อย่างสะดวก

3. **Trading-Specific Custom Nodes:**
   - พัฒนาชุด Node เฉพาะทาง 5 ประเภท:
     - `ContextBiasNode`: กำหนด Market Context / Trend / HTF Key Levels
     - `ConditionFilterNode`: กฎเกณฑ์และตัวกรอง เช่น Liquidity Sweep, FVG, Volume
     - `DecisionBranchNode`: ทางแยกตัดสินใจ (Yes / No)
     - `EntryTriggerNode`: เงื่อนไขเข้าออเดอร์ (Market Order / Limit Confirmation)
     - `RiskInvalidationNode`: จุดตัดขาดทุน SL, Multi-target TP, และเงื่อนไขยกเลิกแผน (Invalidation)

4. **Starter Templates & Import/Export:**
   - เตรียม Template เริ่มต้น: "SMC / ICT Strategy Flow", "Breakout & Retest Flow", และ "Blank Canvas"
   - รองรับการ Export เป็นภาพความละเอียดสูง **PNG** ด้วย `html-to-image`
   - รองรับการ Export / Import ข้อมูลผังเป็นไฟล์ **JSON** สำหรับแชร์หรือสำรองเฉพาะผังกลยุทธ์

5. **Journal Entry Integration:**
   - เพิ่มปุ่ม "View Playbook" ใน `JournalEntryForm.vue`
   - เปิดเป็น Modal (`PlaybookModal.vue`) ที่สามารถดูและแก้ไข (Live Edit & Save) ผังกลยุทธ์ได้ทันทีโดยไม่ต้องสลับหน้าจอ

6. **Component Architecture & Storybook (Rule 5):**
   - สร้าง `PlaybookFlowEditorNode.vue` สำหรับห่อหุ้ม Editor เป็น Vue Flow Node
   - สร้าง Storybook stories ครอบคลุมทั้ง `PlaybookFlowEditor.stories.ts` และ `PlaybookModal.stories.ts`

## Consequences

- **ข้อดี:**
  - เพิ่มศักยภาพในการสร้างแผนการเทรดที่มีแบบแผนสูง (Systematic Trading) เป็นภาพชัดเจน
  - เข้าถึง Playbook ได้ทั้งจากหน้าตั้งค่า (Settings) และหน้าบันทึกการเทรด (Journal Entry)
  - รองรับทั้ง Visual Flowchart และ Markdown Notes ไม่สูญเสียข้อมูลเดิม
  - รองรับ Export PNG นำไปประกอบการวิเคราะห์หรือแชร์ในกลุ่มเทรดเดอร์ได้ทันที
- **ข้อเสีย:**
  - เพิ่มขนาดและตารางข้อมูลใน SQLite (จัดการผ่าน Drizzle migration)
