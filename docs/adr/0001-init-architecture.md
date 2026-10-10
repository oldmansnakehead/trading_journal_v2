# 1. Initial Architecture and AI Context Setup

## Status
Accepted

## Context
เราต้องการโครงสร้างโปรเจคที่เปิดให้ Google Antigravity และ Claude Code สามารถทำงานร่วมกันได้อย่างราบรื่นในโปรเจค Trading Journal v2 โดยไม่เกิดปัญหา Context ซ้อนทับกัน และช่วยประหยัด Token (Progressive Disclosure)

## Decision
เราตัดสินใจใช้โครงสร้างแบบแยก Context:
1. `AGENTS.md` เป็นจุดศูนย์กลางสำหรับ Antigravity
2. `CLAUDE.md` เป็นจุดศูนย์กลางสำหรับ Claude Code
3. ใช้ `docs/adr/` เป็น Source of Truth สำหรับสถาปัตยกรรมที่ AI ทุกตัวต้องเข้ามาอ่าน
4. แยก Skills ไปไว้ใน `.agents/skills` และ `.claude/skills` เพื่อให้โหลดใช้งานเมื่อจำเป็นเท่านั้น

## Consequences
- **ข้อดี:** ประหยัด Token, AI ไม่สับสน, การจัดการ Context เป็นระเบียบและ Scale ได้ง่าย
- **ข้อเสีย:** ต้องคอยซิงค์ (Sync) กฎบางอย่างระหว่างโฟลเดอร์ของ Antigravity และ Claude ให้ตรงกัน
