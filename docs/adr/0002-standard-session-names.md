# 2. Standardized Market Session Names

## Status

Accepted

## Context

ในหน้าการตั้งค่า Setup Sessions (`SetupSettings.vue`) และการบันทึก Trade Journal ก่อนหน้านี้ ผู้ใช้สามารถพิมพ์ชื่อ Session ได้อย่างอิสระผ่าน Text Input ส่งผลให้เกิดความไม่สอดคล้องกันของชื่อเซสชันในระบบ (เช่น มีทั้ง `AS`, `Asia`, `LD`, `London`, `newyork`) ซึ่งส่งผลต่อ:
1. การคำนวณและแสดงผลกราฟ Radar ใน Performance by Session บนหน้า Dashboard
2. การคัดกรองข้อมูล Session Filter ใน Journal และ Calendar
3. ความสับสนในการจำแนกตลาด

## Decision

เราตัดสินใจกำหนดมาตรฐานชื่อ Trading Session ให้เลือกได้เฉพาะ 5 เซสชันสากลหลักเท่านั้น:
1. `London`
2. `New York`
3. `London Close`
4. `Asia`
5. `Tokyo`

โดยดำเนินการดังนี้:
1. ปรับ UI ใน Modal การเพิ่ม Setup Session ของ `SetupSettings.vue` จาก Text Input ให้เป็น `BaseSelect` (Dropdown Selector) โดยอนุญาตให้เลือกเฉพาะ 5 ชื่อดังกล่าว และกรอง Session ที่เพิ่มไปแล้วใน Setup นั้นออกเพื่อป้องกัน Duplicate
2. กำหนดช่วงเวลาเริ่มต้นแนะนำ (Default Timetable) สำหรับแต่ละเซสชันเพื่อความสะดวก แต่ยังคงเปิดให้ผู้ใช้ปรับแต่ง Start/End time ตาม Broker/Timezone ได้อย่างอิสระ
3. เพิ่ม Server-side Validation ใน Electron IPC Handler (`setupSessionHandlers.ts`) เพื่อปฏิเสธการบันทึกชื่อเซสชันนอกเหนือจาก 5 ชื่อมาตรฐานนี้
4. ข้อมูลเดิมในอดีต (Historical trades) จะไม่ถูก Force-merge เพื่อรักษาความถูกต้องของข้อมูลดิบที่มีอยู่

## Consequences

- **ข้อดี:** ป้องกันการตั้งชื่อผิดหรือสะกดไม่เหมือนกันข้ามแต่ละ Setup, หน้า Dashboard และ Report สามารถจัดกลุ่มสถิติได้อย่างถูกต้องและสม่ำเสมอ 100%
- **ข้อเสีย:** หากผู้ใช้มีช่วงเวลาเทรดพิเศษนอกเหนือจาก 5 เซสชันนี้ จะต้องจัดอยู่ในช่วงเวลาที่ใกล้เคียงของเซสชันหลักดังกล่าว
