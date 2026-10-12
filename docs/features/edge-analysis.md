# Edge Analysis (การวิเคราะห์ความได้เปรียบของระบบเทรด)

## 🎯 ภาพรวม (Overview)

หน้า **Edge Analysis** (`/edge`) เป็นเครื่องมือวิเคราะห์และประเมินความได้เปรียบทางสถิติ (Statistical Edge) ของระบบเทรด เพื่อตอบโจทย์คำถามสำคัญที่สุดของนักเทรด:
1. **Performance by Setup:** Setup หรือกลยุทธ์ไหนทำเงินจริง (เปรียบเทียบ HA Model vs SMC Classic หรือ Setup อื่นๆ)
2. **R-Multiple Distribution:** ผลกำไรมาจากไม้ฟลุ๊ค/ไม้ใหญ่ไม่กี่ไม้ (Outlier-dependent) หรือกระจายตัวสม่ำเสมอ (Consistent Edge)
3. **Day × Hour Heatmap:** วันและช่วงเวลาใดที่ระบบเทรดทำงานได้ดีที่สุด (Prime Window) และช่วงไหนควรหลีกเลี่ยง (Danger Zone)
4. **MAE / MFE Analysis:** ต่อยอดจาก Potential MFE เพื่อวิเคราะห์ว่าวาง Stop Loss แน่นเกินไปหรือไม่ หรือปิด Take Profit เร็วเกินไปจนทิ้งกำไรไว้บนโต๊ะ

---

## 🗂️ ส่วนประกอบและฟีเจอร์ในหน้า Edge Analysis

### 1. Dynamic Multi-Cohort Setup Filters (ตัวกรองเปรียบเทียบ Setup อิสระแบบไม่จำกัด)
- **ปุ่ม `+ เพิ่ม Setup เปรียบเทียบ`:** ผู้ใช้สามารถเพิ่มการ์ด Setup ที่ต้องการนำมาประชันสถิติได้ไม่จำกัดจำนวน (ค่าเริ่มต้นเปิดไว้ 2 Setup เช่น Setup A vs Setup B)
- **การตั้งค่าเฉพาะแต่ละ Setup Card:**
  - **Setup Selector:** เลือกโมเดลการเทรดที่ต้องการ
  - **Symbol Selector:** เลือกระบุคู่เงิน (เช่น XAUUSD, EURUSD หรือ All)
  - **Session Selector:** เลือกระบุช่วงเวลา (London, New York, Asia ฯลฯ)
  - **Paper Trades Toggle:** เลือกเปิด/ปิดการนับไม้ทดสอบ
  - **Date Range (From - To):** กำหนดช่วงวันที่ที่ต้องการศึกษา
  - **Custom Columns Filtering:** หาก Setup นั้นมีการสร้าง Custom Columns และติ๊ก `report_filter = true` ฟิลด์ตัวกรองเฉพาะของ Setup นั้นจะแสดงขึ้นมาโดยอัตโนมัติ (รองรับ selector, switch, checkbox, string, number)
- **สีประจำกลุ่ม (Cohort Palette):** แต่ละ Setup จะได้รับสีประจำตัวอัตโนมัติ (Indigo, Emerald, Amber, Purple, Rose, Cyan) ซึ่งจะสะท้อนไปยังเส้นขอบการ์ด, ป้ายสรุป, แท่ง Histogram, และจุดบนกราฟ Scatter
- **ปุ่มลบ (Remove):** ตัด Setup ที่ไม่ต้องการเปรียบเทียบออกได้ทันที

---

### 2. Head-to-Head Comparison Hero Card (ศึกประชัน Edge เมื่อเทียบ 2 Setup)
เมื่อผู้ใช้ตั้งการ์ดเปรียบเทียบไว้ 2 Setup การ์ดประชันตัวต่อตัวจะแสดงขึ้นมาด้านบน:
- **Left vs Right Cards:** แสดงสถิติหลักของทั้ง 2 Setup เคียงข้างกัน พร้อมตรา `VS`
- **ป้ายเกียรติยศ:** ประดับป้าย **👑 Higher Expectancy** ให้กับ Setup ที่มีอัตราผลตอบแทนคาดหวังเฉลี่ยต่อไม้สูงกว่า
- **Delta Difference Bar:** คำนวณผลต่างทางสถิติให้เห็นทันที:
  - **Expectancy Delta:** ผลต่างกำไรคาดหวังในหน่วย R (เช่น `+0.75R`)
  - **Win Rate Delta:** ผลต่างของเปอร์เซ็นต์ชนะ (เช่น `+50.0%`)
  - **Profit Factor Delta:** ผลต่างของอัตราส่วนกำไรต่อขาดทุน
  - **Net R Delta:** ผลต่างของกำไรสะสมสุทธิ
- **Verdict Note:** สรุปคำแนะนำว่า Setup ใดมี Edge ทางสถิติที่แข็งแกร่งกว่า

---

### 3. Performance by Setup (ตารางเปรียบเทียบสถิติเชิงลึก)
ตารางเปรียบเทียบสถิติของ Setup/เงื่อนไขที่เลือก:
- **คอลัมน์ในตาราง:**
  - **Setup / Filter Set:** ชื่อ Setup, สีประจำกลุ่ม, และแท็กสรุปเงื่อนไขตัวกรอง
  - **Trades (จำนวนไม้):** จำนวนไม้ทั้งหมดและสัดส่วน % จากไม้ที่นำมาเปรียบเทียบ
  - **Win Rate (WR %):** แสดงตัวเลขพร้อมแถบสีความก้าวหน้า
  - **W / L / BE:** จำนวนไม้ชนะ / แพ้ / เสมอ
  - **Expectancy (Avg R per trade):** กำไรคาดหวังเฉลี่ยต่อ 1 ไม้ในหน่วย R (ไฮไลต์สีเขียว/แดงชัดเจน)
  - **Profit Factor (PF):** อัตราส่วน Gross Profit R ต่อ Gross Loss R
  - **Net R:** ผลกำไรสุทธิรวมสะสม
  - **Avg Win / Loss:** ผลตอบแทนเฉลี่ยต่อไม้ชนะเทียบกับไม้แพ้ (Payoff Ratio)
  - **Avg MFE:** ค่าเฉลี่ยของระยะทางสูงสุดที่ราคาเคยวิ่งไปถึง (Potential Max RR)
  - **Edge Quality:** ประเมินคุณภาพระบบ (`Strong Edge`, `Moderate Edge`, `Negative Edge`)
- **การจัดเรียง (Sorting):** สลับจัดเรียงตารางตาม Expectancy, Win Rate, Profit Factor, จำนวนไม้, หรือ Net Total R ได้ทันที
- **Badge พิเศษ:** ป้าย **🏆 Best Edge** สำหรับ Expectancy สูงสุด และ **💎 Best PF** สำหรับ Profit Factor สูงสุด

---

### 4. R-Multiple Distribution (Histogram & Pareto Concentration Analysis)
- **Multi-Dataset Histogram:**
  - กราฟแท่งจัดกลุ่มผลลัพธ์ออกเป็นช่วง R-multiples: `< -1R`, `-1R`, `(-1, 0)R`, `0R (BE)`, `(0, 1]R`, `(1, 2]R`, `(2, 3]R`, `(3, 5]R`, `> 5R`
  - แสดงแท่งของแต่ละ Setup เคียงข้างกันตามสีประจำกลุ่ม ทำให้เห็นทันทีว่า Setup ไหนมีการกระจายของไม้ชนะที่กว้างกว่า
- **Pareto Concentration Test (ทดสอบการพึ่งพาไม้ฟลุ๊ค):**
  - คำนวณสัดส่วนกำไรจาก **Top 3 Trades** และ **Top 10% Trades**
  - มีกล่องวิเคราะห์เชิงสถิติ:
    - `⚠️ Outlier Dependent`: หากกำไรจาก 3 ไม้ใหญ่เกิน 60% ของกำไรทั้งหมด จะแจ้งเตือนว่าผลตอบแทนขึ้นกับไม้ใหญ่ไม่กี่ไม้
    - `✅ Consistent / Steady`: หากกำไรกระจายตัวสม่ำเสมอ แสดงถึงความเสถียรของกลยุทธ์
- **สถิติเชิงพรรณนา:** Mean Expectancy, Median Outcome, Standard Deviation, และ Sample Skewness

---

### 5. Day × Hour Heatmap (Trading Time Performance)
- **Matrix 7 วัน (จันทร์ - อาทิตย์) × 24 ชั่วโมง (00:00 - 23:00):**
  - **Cohort Tab Switcher:** เลือกดู Heatmap ได้ทั้งแบบรวมทุก Setup (`All Compared`) หรือคลิกเจาะจงดูเฉพาะ Setup ใด Setup หนึ่ง
  - **สลับ Metric ได้ 4 รูปแบบ:**
    1. `Net R`: ผลกำไร/ขาดทุนสะสม (ไล่เฉดสีเขียวเข้ม/แดงเข้มตามความคุ้มค่า)
    2. `Win Rate %`: อัตราการชนะในชั่วโมงนั้น
    3. `Trades`: ความหนาแน่นของจำนวนออเดอร์
    4. `Expectancy (Avg R)`: ผลตอบแทนเฉลี่ยต่อไม้
  - **Margin Summaries:** สรุปผลรวมรายวัน (Day Total ทางขวา) และรายชั่วโมง (Hour Total ด้านล่าง)
- **Time Highlights:**
  - 🔥 **Prime Trading Window:** วันและชั่วโมงที่ทำกำไรสะสมได้สูงสุด
  - ⚠️ **Danger Zone:** วันและชั่วโมงที่มีผลขาดทุนสะสมมากที่สุด

---

### 6. MAE / MFE Analysis (กราฟ Scatter วิเคราะห์ SL แน่น / TP เร็ว)
- **โหมด Realized RR vs Potential MFE (ปิด TP เร็วไหม):**
  - แกน X = Realized RR (R ที่ได้จริง)
  - แกน Y = Potential MFE (Max RR ที่ราคาเคยวิ่งไปถึง)
  - เส้นประอ้างอิง $Y = X$ แสดงระดับ 100% Exit Efficiency (จุดสูงสุดที่ราคาเคยไปถึง)
  - จุดที่ลอยสูงกว่าเส้น $Y = X$ แสดงถึงกำไรที่ปล่อยทิ้งไว้บนโต๊ะ (Left on Table)
  - จุดฝั่งลบ ($X < 0$) ที่มี $Y \ge 1R$ คือ **Reversal Losses** (ไม้ที่เคยบวกเกิน 1R แต่ปล่อยให้กลับมาชน SL)
- **โหมด MAE vs MFE (วาง SL แน่นไหม):**
  - แกน X = MAE (Maximum Adverse Excursion / การย่อตัวในแดนลบ)
  - แกน Y = MFE (ระยะวิ่งสูงสุด)
- **Multi-Dataset Scatter Plot:** พล็อตจุดของแต่ละ Setup ด้วยสีประจำกลุ่มบนระนาบเดียวกัน พร้อม Tooltip แสดงรายละเอียดไม้
- **Comparative Excursion Cards:**
  - **Avg Exit Capture Efficiency (%):** สัดส่วนกำไรที่เก็บได้จริงเทียบกับระยะทางสูงสุด
  - **Total Left on Table (R):** กำไรรวมที่คืนตลาดไปหลังปิดออเดอร์
  - **Reversal Losses Counter:** จำนวนไม้ที่ควรปรับปรุงวินัยการเลื่อน Break Even
- **Actionable Advice:** คำแนะนำเชิงปฏิบัติการเพื่อนำไปปรับแก้ Trade Management กฎของ Setup

---

## ⚙️ สถาปัตยกรรมทางเทคนิค (Technical Architecture)

```
┌──────────────────────────────────────────────────────────┐
│                        UI Layer                          │
│  - EdgeAnalysisView.vue (Dynamic Multi-Cohort Manager)   │
│  - EdgeAnalysisViewNode.vue (Vue Flow Node)              │
│  - EdgeAnalysisView.stories.ts (Storybook)               │
└────────────────────────────┬─────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────┐
│                   Trade Filters Engine                   │
│               (src/utils/tradeFilters.ts)                │
│  - filterTrades(trades, filters, customColumns)          │
└────────────────────────────┬─────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────┐
│                   Edge Analysis Engine                   │
│               (src/utils/edgeAnalysis.ts)                │
│  - calculateCohortsPerformance() (Delta & Comparison)    │
│  - calculatePerformanceBySetup()                         │
│  - calculateRDistribution() (Pareto & Bins)              │
│  - calculateDayHourHeatmap() (7x24 Matrix)               │
│  - calculateMaeMfeScatter() (Excursion & Efficiency)     │
└──────────────────────────────────────────────────────────┘
```

### รายการไฟล์และโมดูลที่เกี่ยวข้อง

| ไฟล์ | หน้าที่และความรับผิดชอบ |
| :--- | :--- |
| `src/renderer/src/utils/edgeAnalysis.ts` | Pure TypeScript Calculation Engine สำหรับคำนวณสถิติ Edge ทั้งหมด |
| `src/renderer/src/utils/edgeAnalysis.test.ts` | Unit Test Suite ครอบคลุม 100% ทุกกรณีทดสอบ |
| `src/renderer/src/components/views/EdgeAnalysisView.vue` | หน้าจอหลัก Edge Analysis พร้อมระบบ Dynamic Multi-Cohort Setup Filters |
| `src/renderer/src/components/views/EdgeAnalysisViewNode.vue` | Vue Flow Node สำหรับแสดงผลใน Flow diagram |
| `src/renderer/src/components/views/EdgeAnalysisView.stories.ts` | Storybook Component Story |
| `src/stories/EdgeAnalysisViewNode.stories.ts` | Storybook Flow Node Story |
| `src/renderer/src/router/index.ts` | กำหนด Route `/edge` ใน Vue Router |
| `src/renderer/src/App.vue` | เมนูนำทางใน Sidebar |
| `docs/adr/0006-edge-analysis.md` | บันทึกการตัดสินใจทางสถาปัตยกรรม (ADR 0006) |
| `REQUIREMENTS_DRAFT.md` | ข้อกำหนดระบบในหมวดที่ 15 |

---

## 💡 แนวทางการนำไปประยุกต์ใช้งานจริง (Practical Trading Workflow)

1. **เลือกเปรียบเทียบ 2 โมเดลหลัก:**
   - กดเพิ่มการ์ดเปรียบเทียบ เช่น การ์ด 1 = `HA Model`, การ์ด 2 = `ICT / SMC Classic`
   - ตรวจสอบการ์ด **Head-to-Head** ว่าโมเดลใดมีค่า Expectancy และ Win Rate สูงกว่า
2. **วิเคราะห์ความเสถียรของกำไร (R-Distribution):**
   - ดูกราฟแท่ง Histogram หากกำไรมาจากไม้ 1-2 ไม้ที่ได้ 5R+ แต่ไม้ส่วนใหญ่แพ้ จะเข้าข่าย `Outlier Dependent` ซึ่งต้องระวังเมื่อสภาพตลาดเปลี่ยน
3. **กำหนดตารางเวลาเทรด (Time Optimization):**
   - ดู Heatmap เพื่อระบุ **Prime Window** และหลีกเลี่ยง **Danger Zone** เพื่อไม่ให้เข้าเทรดในช่วงเวลาที่ระบบมักเสียเปรียบ
4. **ปรับปรุงการออกออเดอร์ (Trade Management):**
   - ดูค่า **Left on Table** ใน MAE/MFE Scatter หากมีค่าสูงและ Capture Efficiency ต่ำกว่า 60% ควรพิจารณาแบ่งปิดกำไร (Partial TP) หรือใช้ Trailing Stop
   - หากมี **Reversal Losses** เกิดขึ้นหลายไม้ ควรตั้งกฎเลื่อน Break Even เมื่อราคาบวกถึง 1R ทันที
