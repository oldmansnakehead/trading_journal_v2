# 14. Trade Research and Zone Statistics Module (ระบบจดสถิติและวิจัยโซนแยกอิสระ)

## Status

Accepted

## Context

ในการพัฒนา Trading Journal v2 โมดูล Journal เดิมถูกออกแบบมาเพื่อบันทึกประวัติการเทรดจริง (Execution Journal) ซึ่งมีลักษณะ:
- บันทึกรายละเอียดการเปิด-ปิดออเดอร์ (Entry & Exit Datetime)
- คำนวณกำไรขาดทุน PnL, Win/Loss Rate, RR ปกติ, BE, Trail
- บันทึกการเทรดแบบ 1 trade = 1 จุดเข้าที่เกิดขึ้นจริง

### ปัญหาและความต้องการใหม่:
1. **ความต้องการวิจัยเปรียบเทียบจุดเข้า (Zone Research / Multi-entry Hypothesis Testing):**
   ใน 1 เหตุการณ์หรือ 1 Setup นักเทรดมักมีตัวเลือกในการเข้าออเดอร์หลายจุด (เช่น โซน 1 เข้าที่ FVG, โซน 2 เข้าที่ Extreme OB, โซน 3 รอ Retest Break Block) เพื่อศึกษาว่า:
   - โซนไหนให้อัตราได้ของ (Fill Rate) หรือตกรถ (Miss Rate) บ่อยแค่ไหน
   - โซนไหนให้ Win Rate และ Risk:Reward สูงสุด
   - โซนไหนมีระยะ Stop Loss (SL Points) ที่คุ้มค่าที่สุด
2. **หากนำไปปนกับตาราง Journal เดิม:**
   - จะทำให้สถิติการเทรดจริง (Portfolio PnL, Actual Win Rate, Drawdown) ผิดเพี้ยนจากไม้สมมติ/ไม้เปรียบเทียบ
   - การกรอกข้อมูลใน Journal เดิมมีฟิลด์ละเอียดเกินไป (เช่น บังคับกรอก Exit Datetime, Multiple RR modes) ทำให้เสียเวลาในการจดสถิติหลายโซนพร้อมกัน
3. **ความต้องการความเร็วสูงสุดในการบันทึก:**
   - ผู้ใช้ต้องการบันทึกเวลาเข้าอย่างเดียว (ซ่อน Exit Date เว้นแต่ Setup นั้นจะเปิดใช้งาน)
   - ต้องการ Auto-sync Bias จากคอลัมน์แรก และ Auto-copy SL Points จาก Min ไป Max
   - มีปุ่ม One-click quick actions สำหรับ Loss (`-1`), Break-even (`0`), และ ตกรถ (`Missed`)

---

## Decision

เราตัดสินใจสร้างโมดูลใหม่ชื่อ **"จดสถิติ" (Trade & Zone Research)** แยกเป็นอิสระจากโมดูล Journal เดิมโดยสิ้นเชิง:

1. **โครงสร้างเมนูและการนำทาง:**
   - เพิ่มหมวดหมู่ `TRADE RESEARCH` ใน Sidebar ประกอบด้วย 3 เมนูย่อย:
     - `จดสถิติ (New Entry)`: ฟอร์มบันทึกข้อมูลสถิติที่เน้นความเร็ว
     - `สรุปผลวิจัย (Research Analytics)`: Dashboard ตารางเปรียบเทียบประสิทธิภาพแต่ละโซน (Fill Rate, Miss Rate, Win Rate, Avg Min/Max RR, Expected Value)
     - `ตั้งค่าสถิติ (Research Settings)`: หน้าตั้งค่า 5 แท็บ (Setups, Symbols, Setup Sessions, Setup Playbooks, Custom Columns)
2. **การแยก Database Schema:**
   - สร้างตารางเฉพาะสำหรับโมดูลวิจัย ได้แก่:
     - `research_setups` (เพิ่มฟิลด์ `enable_exit_date: boolean`)
     - `research_setup_sessions`
     - `research_setup_playbooks`
     - `research_setup_playbook_flows` (รองรับ Vue Flow)
     - `research_custom_columns`
     - `research_setup_custom_columns`
     - `research_entries`
     - `research_entry_zones` (ตารางลูกแยกบันทึกผลแต่ละ Custom Column)
   - ตารางที่แชร์ร่วมกัน: `symbols` (ใช้ตารางร่วมกับ Journal เดิม ไม่ต้องสร้างซ้ำ)
3. **Data Entry UX Logic:**
   - **Entry Datetime:** ระบุเวลาเข้าแล้วระบบคำนวณ Session ให้ทันที
   - **Exit Datetime:** แสดงให้กรอกเฉพาะเมื่อ Setup นั้นเปิด `enable_exit_date = true`
   - **Bias Auto-sync:** เลือกที่คอลัมน์แรกจะ sync ไปยังคอลัมน์อื่น ๆ ทั้งหมด แต่อันถัดไปสามารถ override แยกเดี่ยวได้
   - **SL Points Auto-copy:** กรอก Min SL Points แล้วก๊อปปี้ไป Max SL Points อัตโนมัติ (แก้ Max ไม่กระทบ Min)
   - **Loss RR:** กำหนดให้การแพ้บันทึก RR เป็น `-1`
   - **One-click Buttons:** ปุ่มลัด `[SL (-1)]`, `[BE (0)]`, `[Missed]`

---

## Consequences

### ข้อดี (Pros):
1. **ความสะอาดของข้อมูล (Data Integrity):** ข้อมูลการเทรดจริงบน Journal ไม่ถูกรบกวนจากข้อมูลวิจัยสมมติฐาน
2. **ความเร็วในการบันทึก (Frictionless Logging):** ขั้นตอนการบันทึกสถิติลดลงเหลือเพียงไม่กี่วินาทีต่อไม้ ด้วยระบบ Auto-sync และ One-click actions
3. **Insight เชิงเปรียบเทียบที่แม่นยำ:** สามารถเปรียบเทียบ Fill Rate, Win Rate, และ EV ของแต่ละ Entry Zone ได้ชัดเจนในหน้าเดียว
4. **Maintainability & Extensibility:** ตารางและโค้ดแยกขาดจากกันชัดเจน ลดผลกระทบข้างเคียง (Side-effects) ระหว่างระบบเดิมกับระบบใหม่

### ข้อควรระวัง (Cons / Trade-offs):
1. ต้องดูแล Schema และ Migration เพิ่มเติมสำหรับตารางตระกูล `research_*`
2. Component การตั้งค่าในหน้า Settings ต้องพัฒนาหรือแยกโค้ดให้สอดคล้องกันโดยไม่สร้างความสับสนแก่ผู้ใช้
