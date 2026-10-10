---
name: analyze-trade
description: ใช้ Skill นี้เมื่อต้องการคำนวณสถิติการเทรด เช่น Win Rate, Risk/Reward Ratio, และ Maximum Drawdown
---

# Analyze Trade Skill

เมื่อถูกเรียกใช้งานด้วย Skill นี้ ให้ทำตามขั้นตอนดังนี้:

1. รับข้อมูลโครงสร้างตารางออเดอร์ หรือ JSON ข้อมูลการเทรด
2. คำนวณ Win Rate: (จำนวนที่กำไร / จำนวนที่เทรดทั้งหมด) * 100
3. คำนวณ Risk/Reward (R:R) โดยเฉลี่ย
4. สรุปผลลัพธ์ในรูปแบบ Markdown Table ที่อ่านง่าย
