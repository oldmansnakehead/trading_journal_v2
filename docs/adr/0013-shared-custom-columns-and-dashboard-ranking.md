# 13. Shared Custom Columns Library and Dashboard Attribute Ranking

## Status

Accepted

## Context

ในระบบบันทึกการเทรด เทรดเดอร์มักมีตัวแปรเชิงเทคนิคเฉพาะตัวที่ต้องการทดสอบและเก็บสถิติ เช่น:
- **Zone:** `FVG` (Fair Value Gap), `OB` (Order Block), `BREAKER BLOCK`, `LIQUIDITY SWEEP`
- **Confirmation Model:** `CHoCH`, `BOS`, `Engulfing`, `Rejection Wick`
- **Higher Timeframe Bias:** `Daily Bullish`, `4H Liquidity Run`, `Weekly Range Bound`

### ปัญหาของสถาปัตยกรรมเดิม:
1. **คอลัมน์ผูกติดกับ Setup แบบ 1:N (`custom_columns.setup_id`):** 
   หากเทรดเดอร์มี 5 กลยุทธ์ (Setups) และทุกกลยุทธ์ต้องบันทึกตัวแปร `Zone` เหมือนกัน เทรดเดอร์ต้องสร้างคอลัมน์ `Zone` ซ้ำ 5 ครั้ง
2. **ความไม่สอดคล้องของข้อมูล (Data Inconsistency / Typo):**
   การสร้างแยกในแต่ละ Setup ทำให้เกิดชื่อสะกดต่างกัน เช่น `fvg`, `FVG`, `Fair Value Gap` ส่งผลให้ข้อมูลแตกกระจาย
3. **ขาดความสามารถในการวิเคราะห์สถิติภาพรวม (Cross-Strategy Edge Analysis):**
   บน Dashboard ไม่สามารถรวมผลตอบแทนของ `FVG` หรือ `OB` ข้ามกลยุทธ์ได้ ทำให้เทรดเดอร์ตอบไม่ได้ว่าในภาพรวมของตนเอง โซนประเภทไหนมี Win Rate หรือ Profit Factor ดีที่สุด

---

## Decision

เราตัดสินใจปรับปรุงโครงสร้างของ **Custom Columns** เป็นแบบ **Many-to-Many (Shared Library ผ่านตารางเชื่อม)** และเพิ่มระบบ **Custom Attribute Ranking บน Dashboard** ดังนี้:

### 1. การออกแบบ Database Schema (Master + Junction Table)

```
+---------------------------------------+
|            custom_columns             |  (Master Column Definitions)
+---------------------------------------+
| id            : INTEGER PRIMARY KEY   |
| name          : TEXT NOT NULL         |  (เช่น "Zone")
| type          : TEXT NOT NULL         |  (single_selector, multiple_selector...)
| options       : JSON TEXT             |  (เช่น ["FVG", "OB", "BREAKER BLOCK"])
| report_filter : BOOLEAN DEFAULT true  |
| description   : TEXT                  |
| is_global     : BOOLEAN DEFAULT true  |
+---------------------------------------+
                   |
                   | 1:N
                   v
+---------------------------------------+
|         setup_custom_columns          |  (Junction Table: M:N)
+---------------------------------------+
| id               : INTEGER PK         |
| setup_id         : INTEGER (FK)       |  (references setups.id ON DELETE CASCADE)
| custom_column_id : INTEGER (FK)       |  (references custom_columns.id ON DELETE CASCADE)
| is_required      : BOOLEAN DEFAULT 0  |
| order_index      : INTEGER DEFAULT 0  |
+---------------------------------------+
```

- **Backwards Compatibility:**
  ตาราง `custom_columns` เดิมจะถูกปรับให้ `setup_id` เป็น Nullable (หรือย้ายความสัมพันธ์เดิมเข้าสู่ `setup_custom_columns` อัตโนมัติผ่าน Migration) ข้อมูลเก่าของไม้เทรดใน `journal_entries.custom_data` ที่จัดเก็บในรูป `{ [custom_column_id]: value }` จะยังคงใช้งานได้ต่อเนื่อง 100%

### 2. กระบวนการในหน้า UI การตั้งค่า (Settings & Form)
1. **หน้า Settings (`SetupSettings.vue`):**
   - มีแท็บ **"Custom Columns Library"**: จัดการคอลัมน์ส่วนกลาง เพิ่ม/แก้ไขชื่อ และกำหนดชุดตัวเลือก (Options) ครั้งเดียว
   - ในแต่ละ Setup: มีปุ่ม **"Link from Library"** ให้ติ๊กเลือกคอลัมน์ส่วนกลางมาใช้งานใน Setup นั้นได้ทันที พร้อมกำหนดลำดับแสดงผล (`order_index`)
2. **หน้าบันทึกการเทรด (`JournalEntryForm.vue`):**
   - เมื่อเลือก Setup ระบบจะ Query คอลัมน์ที่ผูกกับ Setup นั้นผ่าน `setup_custom_columns` มาเรนเดอร์เป็น Input Form
   - บันทึกค่าลงใน `journal_entries.custom_data` โดยใช้ `custom_column_id` เป็น Key มาตรฐาน

### 3. การแสดงผลและการจัดอันดับบน Dashboard (Custom Attribute Ranking)
เพิ่ม Widget วิเคราะห์สถิติในหน้า Dashboard:
1. **Attribute Selector:** มี Dropdown ให้เลือก Custom Column ที่ต้องการดู (เช่น `Zone`)
2. **Performance Ranking Table:**
   - **Attribute Value:** เช่น `BREAKER BLOCK`, `FVG`, `OB`
   - **Trade Count & % Share:** จำนวนไม้และสัดส่วน
   - **Win Rate (%) & Loss Rate (%):** แถบสีเปรียบเทียบ Win/Loss/BE Visual Ratio
   - **Break Even Rate (%):** อัตราการเสมอทุน
   - **Avg RR:** ผลตอบแทนเฉลี่ยต่อไม้
   - **Total Net R / Net PnL:** กำไรสะสม
   - **Profit Factor:** อัตราส่วนกำไรต่อขาดทุน
3. **Multi-Scope Flexibility:**
   - ทำงานร่วมกับ `TradeFiltersBar`: สามารถดูผลของ `Zone` ในภาพรวมของทุก Setup หรือกรองเฉพาะบาง Setup / Date Range / Session ได้อย่างอิสระ

---

## Consequences

### ข้อดี:
- **Data Normalization:** กำหนดชื่อตัวแปรและ Options เพียงจุดเดียว ป้องกัน Typo และข้อมูลซ้ำซ้อน
- **Cross-Strategy Insights:** เทรดเดอร์สามารถค้นพบ Edge ที่แท้จริงขององค์ประกอบทางเทคนิคข้ามทุกกลยุทธ์
- **Reusability:** เพิ่ม Setup ใหม่ได้รวดเร็วเพียงคลิกเลือกคอลัมน์เดิมที่มีอยู่แล้วใน Library มาผูก

### ข้อควรคำนึง / การจัดการ:
- ต้องสร้าง Drizzle migration สำหรับเพิ่มตาราง `setup_custom_columns` และปรับ migration script ให้ถ่ายโอนข้อมูลเดิมอย่างปลอดภัย
- ต้องเพิ่ม IPC Handler ใหม่สำหรับจัดการ Junction Table (`setup_custom_columns`)
