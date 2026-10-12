# 6. Edge Analysis Architecture

## Status

Accepted

## Context

ผู้ใช้ต้องการระบบ **วิเคราะห์ Edge (ความได้เปรียบทางสถิติของระบบเทรด)** ในหน้าใหม่ `/edge` เพื่อตอบโจทย์คำถามสำคัญ 4 ประการ:
1. **Performance by Setup:** ตารางเปรียบเทียบ Setup ต่างๆ เช่น HA Model เทียบกับ SMC Classic โดยวัด Win Rate (WR), Expectancy (Avg R), Profit Factor (PF), และจำนวนไม้ เพื่อระบุว่า Setup ไหนทำเงินจริง
2. **R-Multiple Distribution:** แผนภูมิแท่ง Histogram แสดงการกระจายตัวของ R-Multiples แต่ละไม้ (-1R, 1R, 2R, 3.5R...) และการวิเคราะห์ Profit Concentration (Pareto analysis) เพื่อตรวจสอบว่ากำไรมาจากไม้ใหญ่ไม่กี่ไม้ (Outlier-dependent) หรือกระจายตัวสม่ำเสมอ (Steady distribution)
3. **Heatmap วัน × ชั่วโมง:** ตาราง Heatmap 7 วัน × 24 ชั่วโมง เพื่อระบุ Prime Trading Window (ช่วงเวลาทำกำไรสูงสุด) และ Danger Zone (ช่วงเวลาที่มีผลขาดทุนสะสม)
4. **MAE / MFE Analysis:** ต่อยอดจาก Potential MFE ที่มีอยู่ในระบบ สร้างเป็นกราฟ Scatter Plot เพื่อวิเคราะห์ Excursion Efficiency: วาง Stop Loss แน่นเกินไปหรือไม่ (MAE Drawdown) และปิด Take Profit เร็วเกินไปหรือไม่ (Realized RR vs Potential MFE)

## Decision

เราตัดสินใจสร้างสถาปัตยกรรม Edge Analysis ดังนี้:

1. **Modular Calculation Engine (`src/renderer/src/utils/edgeAnalysis.ts`):**
   - พัฒนา Pure TypeScript Engine แยกอิสระจาก UI component
   - ครอบคลุม 4 ฟังก์ชันหลัก:
     - `calculatePerformanceBySetup`: คำนวณ WR, Expectancy, Gross Profit/Loss R, Profit Factor, Kelly Criterion % และระบุ Best Edge Setup
     - `calculateRDistribution`: จัดกลุ่มเข้า R-bins, คำนวณ Mean, Median, Sample Skewness, และ Top 3 / Top 10% Profit Share Ratio
     - `calculateDayHourHeatmap`: วิเคราะห์ผลการเทรดแยกตามวัน (Sun-Sat / Mon-Fri) และชั่วโมง (0-23) พร้อมสรุปขอบตาราง (Margin Totals)
     - `calculateMaeMfeScatter`: คำนวณ Exit Capture Efficiency (%), R ที่เหลือทิ้งไว้บนโต๊ะ (Left on Table), และตรวจจับ Reversal Losses (ไม้ที่เคยบวก $\ge 1R$ แต่กลับมาแพ้)
   - มี Unit Test ครอบคลุมทุกฟังก์ชัน (`src/renderer/src/utils/edgeAnalysis.test.ts`) 100%

2. **UI & Data Visualization (`src/renderer/src/components/views/EdgeAnalysisView.vue`):**
   - **Dynamic Multi-Cohort Setup Comparison:** ผู้ใช้สามารถเพิ่มตัวกรอง Setup เพื่อเปรียบเทียบได้ไม่จำกัด (Unlimited Setup Filters) โดยค่าเริ่มต้นจะเทียบ 2 Setup อัตโนมัติ (เช่น HA Model เทียบกับ SMC Classic)
   - แต่ละ Setup Card สามารถกำหนดเงื่อนไขเฉพาะของตัวเองได้อย่างอิสระ: Setup Name, Symbol, Session, Date Range, Paper Trades, และ Custom Columns เฉพาะของ Setup นั้น
   - **Head-to-Head Hero Card:** เมื่อเลือกเปรียบเทียบ 2 Setup ระบบจะแสดงการเปรียบเทียบตัวต่อตัวพร้อมคำนวณ Delta (Expectancy, Win Rate, Profit Factor, Net R) และระบุ Setup ที่ชนะการแข่งขัน Edge
   - ใช้ Chart.js / `vue-chartjs`:
     - `Bar`: Multi-dataset R-Distribution Histogram เปรียบเทียบแท่งผลตอบแทนเคียงข้างกันในแต่ละ R-bin
     - `Scatter`: Multi-dataset MAE/MFE Excursion พล็อตจุดของแต่ละ Setup ด้วยสีเฉพาะกลุ่มบนระนาบเดียวกัน พร้อมเส้น $Y = X$ Peak Exit Benchmark
   - Heatmap Grid แบบ Interactive: รองรับการสลับตัวชี้วัด (Net R, Win Rate %, Trade Count, Expectancy) และสามารถสลับดูเฉพาะ Setup ที่ต้องการ หรือดูภาพรวมทั้งหมดได้
   - Setup Comparison Table: รองรับการจัดเรียง (Sorting) ตาม Expectancy, Win Rate, Profit Factor, หรือจำนวนไม้ พร้อม Highlight "Top Edge"

3. **Storybook & Vue Flow Integration (ตาม AGENTS.md Rule 5):**
   - สร้าง Vue Flow Node: `src/renderer/src/components/views/EdgeAnalysisViewNode.vue`
   - สร้าง Storybook Stories:
     - `src/renderer/src/components/views/EdgeAnalysisView.stories.ts`
     - `src/stories/EdgeAnalysisViewNode.stories.ts`

4. **Routing & Navigation:**
   - เพิ่ม Route `/edge` ใน `src/renderer/src/router/index.ts`
   - เพิ่มเมนู Edge Analysis พร้อมไอคอน `ph-crosshair` ใน Navigation Sidebar (`src/renderer/src/App.vue`)

## Consequences

- **ข้อดี:**
  - ผู้ใช้สามารถตอบคำถาม "Setup ไหนทำเงินจริง", "เทรดช่วงไหนดีที่สุด", และ "ปิด TP เร็วไปไหม" ได้ทันทีจากข้อมูลเชิงประจักษ์
  - อิงจากข้อมูล MFE และ RR ที่มีอยู่ในระบบโดยไม่ต้องแก้ไข Database Schema
  - โค้ดคำนวณเป็น Pure Functions ทำให้อัปเดตและเขียน Unit Test ได้ง่ายและรวดเร็ว
- **ข้อเสีย:**
  - หากประวัติการเทรดยังมีจำนวนน้อย (เช่น ต่ำกว่า 10 ไม้) สถิติบางตัวเช่น Heatmap รายชั่วโมงจะยังเบาบาง ซึ่งระบบได้แสดงสถานะแจ้งเตือนไว้อย่างชัดเจน
