# Shared Custom Columns & Dashboard Attribute Ranking

## 🎯 ภาพรวม (Overview)

ฟีเจอร์นี้ถูกออกแบบมาเพื่อยกระดับความสามารถของ **Custom Columns** จากเดิมที่ถูกจำกัดให้สร้างผูกติดกับแต่ละ Setup แยกจากกัน ให้กลายเป็น **Shared Custom Column Library** ที่สามารถสร้างตัวแปรเทคนิคมาตรฐาน (เช่น คอลัมน์ `Zone` ที่มีตัวเลือก `FVG`, `OB`, `BREAKER BLOCK`) ขึ้นมาเพียงครั้งเดียว แล้วนำไปเลือกใช้ร่วมกับหลายกลยุทธ์ (Setups) ได้อย่างเป็นระบบ

นอกจากนี้ ยังต่อยอดด้วยการนำค่าของ Custom Column เหล่านี้มาประมวลผลเป็น **Custom Attribute Performance & Win/Loss Ranking** บนหน้า Dashboard เพื่อให้เทรดเดอร์วิเคราะห์จัดอันดับได้ว่า ตัวแปรเทคนิคตัวใดสร้างความได้เปรียบทางสถิติ (Edge) และอัตราการชนะ (Win Rate) สูงที่สุด

---

## 🏗️ สถาปัตยกรรมระบบ (Architecture)

### 1. Database Schema (M:N Relationship)

```
[ Setups ] 1 <---> N [ setup_custom_columns ] N <---> 1 [ custom_columns ]
                             (Junction)                        (Master)
```

1. **`custom_columns` (Master Definition):**
   - `id`: รหัสประจำคอลัมน์
   - `name`: ชื่อคอลัมน์ (เช่น `Zone`, `Entry Trigger`, `Session Context`)
   - `type`: ชนิดข้อมูล (`single_selector`, `multiple_selector`, `checkbox`, `number`, `string`, `boolean`)
   - `options`: รายการตัวเลือกในรูป JSON Array (เช่น `["FVG", "OB", "BREAKER BLOCK"]`)
   - `report_filter`: กำหนดว่าให้นำไปเป็นตัวกรองใน Dashboard หรือไม่
   - `description`: คำอธิบายเงื่อนไขของคอลัมน์
2. **`setup_custom_columns` (Junction Table):**
   - `setup_id`: รหัสกลยุทธ์ (FK -> `setups.id`)
   - `custom_column_id`: รหัสคอลัมน์ (FK -> `custom_columns.id`)
   - `is_required`: บังคับกรอกหรือไม่
   - `order_index`: ลำดับการแสดงผลในฟอร์มของ Setup นั้น
3. **`journal_entries.custom_data`:**
   - จัดเก็บข้อมูลค่าตัวแปรในรูป JSON Object:
     ```json
     {
       "1": "FVG",
       "2": ["15m CHoCH", "Liquidity Sweep"]
     }
     ```
     โดย Key คือ `custom_column_id` ทำให้ข้อมูลเชื่อมโยงกันอย่างเป็นมาตรฐานข้ามทุก Setup

---

## ⚙️ ฟังก์ชันการทำงานหลัก (Key Features)

### 1. การจัดการในหน้า Settings (`SetupSettings.vue`)
- **แท็บ Custom Columns Library:**
  - แสดงรายการคอลัมน์ส่วนกลางทั้งหมด
  - สร้างคอลัมน์ใหม่ กำหนดประเภท และเพิ่ม Options (เช่น `FVG`, `OB`, `BREAKER BLOCK`)
  - แสดงตัวเลขว่าคอลัมน์นี้ถูกใช้งานอยู่ในกี่ Setup
- **การผูกคอลัมน์ในแต่ละ Setup:**
  - ภายในแท็บ Trading Setups จะมีปุ่ม **"Manage Custom Columns"** หรือ **"Link from Library"**
  - แสดง Checkbox รายการคอลัมน์ที่มีอยู่ในระบบ ให้เลือกติ๊กเข้ามาใช้งานได้ทันทีโดยไม่ต้องสร้างใหม่
  - สามารถลากจัดลำดับการแสดงผล (Reorder) ภายใน Setup นั้นๆ ได้

### 2. การบันทึกไม้เทรด (`JournalEntryForm.vue`)
- เมื่อผู้ใช้เลือก Setup ใด ฟอร์มจะโหลด Custom Columns ทั้งหมดที่ผูกกับ Setup นั้นผ่านตาราง `setup_custom_columns`
- เรนเดอร์ตัวเลือก Options ให้เลือกอย่างถูกต้อง ป้องกันการพิมพ์ผิด (Typo)

### 3. การวิเคราะห์บน Dashboard (`DashboardView.vue`)
เพิ่มคอมโพเนนต์การวิเคราะห์ **Custom Attribute Performance Card**:
- **Attribute Selector:** มี Dropdown ให้เลือกคอลัมน์ประเภทตัวเลือก (เช่น `Zone`)
- **ตารางจัดอันดับ (Ranking Table):**
  - **Rank & Value:** เช่น `#1 BREAKER BLOCK`, `#2 FVG`, `#3 OB`
  - **Total Trades & Share %:** เช่น 42 ไม้ (45.6% ของไม้ทั้งหมด)
  - **Win Rate / Loss Rate / BE Rate:** คำนวณเปอร์เซ็นต์ พร้อมแถบสัดส่วนสี (เขียว/แดง/เทา)
  - **Avg Realized RR:** อัตราผลตอบแทนเฉลี่ยต่อไม้
  - **Total Net R / Net PnL:** ผลกำไรรวม
  - **Profit Factor:** Gross Profit หารด้วย Gross Loss
- **โหมดการวิเคราะห์ (Analysis Scope):**
  - **Cross-Setup Mode:** รวมสถิติทุก Setup ที่ใช้คอลัมน์ `Zone` เพื่อดูประสิทธิภาพของ Technical Element ในภาพรวม
  - **Filtered Mode:** ทำงานร่วมกับ `TradeFiltersBar` เพื่อดูสถิติเจาะจงเฉพาะ Setup A หรือเฉพาะคู่เงินและ Session ที่สนใจ
