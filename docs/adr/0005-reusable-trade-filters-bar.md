# 5. Reusable Trade Filters Bar & Custom Column Filtering

## Status

Accepted

## Context

เดิมหน้ารายงานหลัก (`DashboardView.vue`) มีตัวกรอง (Filters Bar) ที่ประกอบด้วย Setup, Symbol, Session, Paper Trades, Date Range, Simulation Inputs (Capital, Risk %, Return Calculation) และ Custom Columns (`reportFilter = true`) ที่สร้างจาก Setup แต่ละตัว

เมื่อมีการสร้างหน้าใหม่ **Monte Carlo Simulation** (`/monte-carlo`) พบว่า:
1. ผู้ใช้ต้องการกรองข้อมูลชุดเดียวกัน (รวมถึง Custom Columns ของแต่ละ Setup) ก่อนนำ R-multiples ไปสุ่มจำลอง
2. มีโค้ดตรรกะการกรองข้อมูลซ้ำซ้อนกันระหว่างหน้า Dashboard และ Monte Carlo
3. จำเป็นต้องมีกลไกส่งต่อสถานะตัวกรอง (รวมถึง Custom Fields) เมื่อผู้ใช้กดปุ่ม "Run Monte Carlo" จากหน้า Dashboard หรือ Reports

## Decision

เราตัดสินใจแยกตัวกรองและตรรกะการคัดกรองข้อมูลออกมาเป็นโมดูลส่วนกลาง (Shared Filtering Module):

1. **Filtering Engine (`src/renderer/src/utils/tradeFilters.ts`):**
   - แยก Interface `TradeFiltersState` และฟังก์ชัน `createDefaultFilters()` สำหรับสร้างค่าเริ่มต้นของตัวกรอง
   - สร้างฟังก์ชัน Pure Function `filterTrades(trades, filters, customColumns)` ที่รองรับชนิดข้อมูลทั้งหมดของ Custom Columns:
     - `switch` / `checkbox`: เทียบ Boolean (`true`/`false`)
     - `single_selector`: เทียบ String ค่าที่เลือก
     - `multiple_selector`: ตรวจสอบการมีอยู่ของค่าใน Array หรือ Substring
     - `string`: ค้นหาแบบ Case-insensitive
     - `number`: เทียบตัวเลขที่ตรงกัน
   - มี Unit Test ครอบคลุมทุกเงื่อนไข (`tradeFilters.test.ts`) 100%

2. **Reusable Component (`src/renderer/src/components/ui/TradeFiltersBar.vue`):**
   - ควบคุมการแสดงผลแถวหลัก (Setup, Symbol, Session, Paper Trades, From/To)
   - แสดงแถว Custom Columns อัตโนมัติเมื่อเลือก Setup ที่มีฟิลด์ `reportFilter === true`
   - มีตัวเลือก `showSimulationRow` และ `simulationModel` สำหรับหน้า Dashboard
   - รองรับ Slots: `#actions` และ `#footer` เพื่อให้แต่ละหน้าใส่ข้อมูลสรุปเพิ่มเติม เช่น สถิติ Win Rate/Expectancy ในหน้า Monte Carlo

3. **Query Parameter Propagation:**
   - ในหน้า Dashboard เมื่อกด "Run Monte Carlo" จะ serialize Custom Fields เป็น query parameters ในรูปแบบ `cf_<columnId>=<value>`
   - ในหน้า Monte Carlo เมื่อโหลดหน้า (`onMounted`) จะอ่าน query params และ map กลับเข้าสู่ `filters.customFields` ได้อัตโนมัติ

4. **Storybook & Vue Flow Integration:**
   - สร้าง Storybook Story (`src/stories/TradeFiltersBar.stories.ts`)
   - สร้าง Vue Flow Node (`TradeFiltersBarNode.vue`) และ Story (`TradeFiltersBarNode.stories.ts`) ตามกฎ Rule 5 ใน `AGENTS.md`

## Consequences

- **ข้อดี:**
  - Single Source of Truth สำหรับตรรกะการกรองข้อมูล ไม่เกิดความคลาดเคลื่อนระหว่างหน้า Dashboard และ Monte Carlo
  - โค้ดใน `DashboardView.vue` สั้นลงและบำรุงรักษาง่ายขึ้น
  - รองรับการขยายตัวกรองใหม่ในอนาคตได้ที่จุดเดียว
- **ข้อเสีย:**
  - ต้องส่งต่อ props และ v-model ระหว่างหน้ากับคอมโพเนนต์กลาง แต่จัดการได้ง่ายด้วย reactive state
