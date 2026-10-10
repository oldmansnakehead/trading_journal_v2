# Trading Journal v2 - Antigravity Guidelines

## 🎯 Context
โปรเจคนี้คือ **Trading Journal v2** (บันทึกการเทรด) 
โฟกัสที่การออกแบบให้อ่านง่าย รวดเร็ว และรองรับฟีเจอร์คำนวณสถิติการเทรด

## 📜 Rules & Workflow

1. **Architecture & Design**: 
   - ก่อนเปลี่ยนแปลงโครงสร้างหลัก ให้ตรวจสอบไฟล์ใน `docs/adr/` เสมอ
   - หากมีการตัดสินใจทางสถาปัตยกรรมใหม่ (เช่น เลือก Database, เปลี่ยน Library) ต้องสร้างไฟล์ ADR ใหม่เพื่อบันทึกเหตุผล
2. **Progressive Disclosure**:
   - อย่าโหลดข้อมูลทุกอย่างเข้า Context พร้อมกัน 
   - ใช้งาน Skills จากโฟลเดอร์ `.agents/skills/` เมื่อเจอโดเมนเฉพาะทาง เช่น การคำนวณ Risk/Reward
3. **Subagents & Code Review**:
   - เมื่องานมีความซับซ้อน หรือต้องการค้นหาข้อมูลข้ามไฟล์จำนวนมาก ให้พิจารณาใช้ Subagents กระจายงาน
   - ใช้ Subagents ในการช่วยรีวิวโค้ดหรือ Security Review 
4. **Hooks**:
   - โปรเจคนี้รองรับ hooks (ดูใน `.agents/hooks.json`)

## 🛠️ Tech Stack
*(รอการอัปเดต)*
