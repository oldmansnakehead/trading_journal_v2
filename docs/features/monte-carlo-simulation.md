# Monte Carlo Simulation & Trade Filtering

## 🎯 ภาพรวม (Overview)

หน้า **Monte Carlo Simulation** (`/monte-carlo`) เป็นเครื่องมือวิเคราะห์ทางสถิติและการจำลองอนาคตของพอร์ตการเทรด โดยแยกการทำงานออกจากหน้า Reports และ Dashboard ปกติ เพื่อรองรับการคำนวณแบบเข้มข้น (Intensive Computation) อิงตามหลักวิชาการของ:
1. **Van Tharp's R-multiple Bootstrap:** นำค่า R-multiples ของการเทรดในอดีตมาสุ่มสร้างเส้นทาง Equity จำลอง
2. **Kevin Davey's Risk Analysis:** วิเคราะห์ความเสี่ยงเชิงสถิติ เช่น โอกาสเกิดจุดขาดทุนสูงสุด (Max Drawdown at 95th Percentile), ความเสี่ยงพอร์ตแตก (Risk of Ruin ระหว่างทาง), และการกระจายตัวของไม้แพ้ต่อเนื่อง (Max Consecutive Losses)

---

## 🗂️ ส่วนประกอบและฟีเจอร์ในหน้า Monte Carlo

### 1. Header & RR Mode Selector
- สลับโหมดการคำนวณ R ได้ 3 แบบเหมือนหน้า Reports:
  - **Normal RR:** อิงค่าผลลัพธ์ RR ปกติ
  - **Break Even (BE):** อิงค่าผลลัพธ์แบบขยับบังทุน
  - **Trail + BE:** อิงค่าผลลัพธ์แบบ Trailing Stop พร้อมบังทุน

### 2. Trade Filters Bar (`TradeFiltersBar.vue`)
- ใช้ตัวกรองชุดเดียวกันกับหน้า Dashboard:
  - **Setup, Symbol, Session**
  - **Include Paper Trades** (ค่าเริ่มต้น = false ปิดการนับไม้ทดสอบ)
  - **Date Range (From - To)**
  - **Custom Columns Filtering:** หาก Setup นั้นมีการสร้าง Custom Columns และติ๊ก `report_filter = true` ตัวกรองจะแสดงขึ้นมาโดยอัตโนมัติ (รองรับ selector, switch, checkbox, text, number)
- สรุปข้อมูลเบื้องต้นทันที:
  - **Matching Trades:** จำนวนไม้ที่ตรงเงื่อนไข
  - **Win Rate %** และ **Expectancy (R)** ของข้อมูลจริง
  - **Validation Warnings:**
    - น้อยกว่า 2 ไม้: ปิดปุ่มรัน พร้อมแสดงข้อความ *"ต้องมีอย่างน้อย 2 ไม้เพื่อรันการจำลอง"*
    - น้อยกว่า 30 ไม้: แสดงแถบเตือนสีส้ม *"ข้อมูลน้อย ผลลัพธ์ยังไม่น่าเชื่อถือ (แนะนำ 30+ ไม้, ดีที่สุด 100+)"*

### 3. Simulation Settings Card
- **Initial Capital ($):** ทุนเริ่มต้นจำลอง (เช่น $10,000)
- **Risk per Trade (%):** ความเสี่ยงต่อไม้ (เช่น 1.0%)
- **Return Calculation:**
  - `Simple`: แต่ละไม้กำไร/ขาดทุนคงที่คำนวณจาก Initial Capital $\times$ Risk %
  - `Log (Compounded)`: คำนวณจากยอดคงเหลือปัจจุบัน (Current Balance) $\times$ Risk %
- **Simulation Method:**
  - `Bootstrap`: สุ่มค่า R แบบใส่คืน (With Replacement)
  - `Shuffle`: สลับลำดับไม้เดิมโดยไม่ใส่คืน (Without Replacement) โดยล็อกจำนวนไม้ต่อรอบเท่ากับจำนวนไม้จริง
  - `Block Bootstrap`: สุ่มบล็อกไม้ที่ติดกันแบบใส่คืน (รักษา autocorrelation ของผลการเทรด) พร้อมช่องระบุ Block Size (ค่าเริ่มต้น = 3)
- **Simulations Count:** จำนวนรอบจำลอง (ค่าเริ่มต้น 5,000 รอบ, สูงสุด 20,000 รอบ)
- **Trades per Run:** จำนวนไม้จำลองต่อ 1 รอบ (ค่าเริ่มต้นเท่ากับจำนวนไม้จริงที่ผ่านตัวกรอง)
- **Ruin Threshold (%):** เกณฑ์พอร์ตแตก (ค่าเริ่มต้น -30% จากทุนเริ่มต้น) ตรวจสอบแบบ **Anytime Ruin** (หาก Balance แตะหรือต่ำกว่าเกณฑ์ระหว่างทางถือว่า Ruin ทันที)
- **Random Seed:** Seed สำหรับ PRNG พร้อมปุ่ม Randomize ใหม่
- **Stress Test (Accordion):**
  - ลด R ของไม้ที่ชนะ $X\%$ (เช่น ปรับลด 15% เพื่อจำลอง slippage หรือสภาพตลาดแย่ลง)
  - สุ่มข้ามไม้ (Missed Trades) $Y\%$ (เช่น สุ่มข้าม 5% เพื่อจำลองกรณีตกรถหรือไม่ได้เข้าออเดอร์)
- **Progress Bar & Status:** แสดงความคืบหน้าระหว่างรัน

### 4. Summary KPI Cards
1. **Median Return (%):** ผลตอบแทนกึ่งกลาง (P50)
2. **P5 Return (Worst 5%):** ผลตอบแทนในกรณีแย่ 5% ล่าง
3. **Probability of Profit (%):** โอกาสที่พอร์ตจะจบด้วยกำไร ($> \text{Initial Capital}$)
4. **Median Max Drawdown (%):** Drawdown กึ่งกลาง
5. **P95 Max Drawdown (%):** Drawdown ระดับความเสี่ยงรุนแรง (Worst 5%)
6. **Risk of Ruin (%):** สัดส่วนรอบที่พอร์ตเคยแตะ Ruin Threshold ระหว่างทาง
7. **P95 Max Consecutive Losses:** ไม้แพ้ต่อเนื่องสูงสุดที่ระดับ P95

### 5. Charts & Visualizations
- **Equity Cone Chart:**
  - แรเงาช่วงความเชื่อมั่น P5–P95 (Light Blue) และ P25–P75 (Medium Blue)
  - เส้น Median P50 (Deep Blue)
  - เส้น Actual Historical Equity ทับซ้อน (Dark Charcoal) เพื่อเปรียบเทียบผลจริงกับกรอบจำลอง
- **Max Drawdown Distribution (Histogram):**
  - แผนภูมิแจกแจงความถี่ของค่า Max DD พร้อมเส้นอ้างอิง Median และ P95
- **Final Balance Distribution (Histogram):**
  - แผนภูมิแจกแจงยอดเงินสุดท้ายของแต่ละรอบ พร้อมเส้นทุนเริ่มต้น
- **Max Consecutive Losses Distribution (Bar Chart):**
  - ความน่าจะเป็นของความยาวแท่งไม้แพ้ติดกัน
- **Percentiles Summary Table:**
  - ตารางสรุปค่าสถิติ P5, P25, P50, P75, P95 สำหรับ Final Balance, Total Return %, Max Drawdown %, และ Max Consecutive Losses
- **Disclaimer Note:** ข้อความเตือนทางสถิติด้านล่าง

---

## ⚙️ สถาปัตยกรรมทางเทคนิค (Technical Architecture)

```
┌─────────────────────────────────────────────────────────┐
│                      UI Layer                           │
│  - DashboardView.vue   ──────────┐                      │
│  - ReportsView.vue     ──────────┼──> MonteCarloView    │
│  - TradeFiltersBar.vue ──────────┘                      │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                  Trade Filters Utility                  │
│               (src/utils/tradeFilters.ts)               │
│  - filterTrades()                                       │
│  - Custom Columns Matching (all types)                  │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                 Background Web Worker                   │
│           (src/workers/monteCarlo.worker.ts)            │
│  - Offloads 5,000 - 20,000 simulations                  │
│  - PRNG: mulberry32 (Deterministic & Reproducible)      │
│  - Fallback: Inline execution if Worker unsupported    │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│              Monte Carlo Calculation Engine             │
│                (src/utils/monteCarlo.ts)                │
│  - Bootstrap / Shuffle / Block Bootstrap                │
│  - Simple vs Compounded Returns                         │
│  - Anytime Ruin Detection                               │
│  - Peak-to-Trough Drawdown                              │
│  - Percentile Sampling (Memory-efficient cone)          │
└─────────────────────────────────────────────────────────┘
```

---

## 🧪 การทดสอบและความถูกต้อง (Testing & Validation)

การคำนวณทั้งหมดได้รับการทดสอบครอบคลุมทั้ง Unit Tests และ Standalone Validation:
1. **Shuffle Invariance Test:**
   - ข้อมูล R: `[1, -1, 2, 3.5, 1]`
   - โหมด Shuffle, Simple, ทุน $10,000, Risk 1% ($100 ต่อ 1R)
   - ผลรวม $R = 6.5 \rightarrow \text{PnL} = 6.5 \times 100 = 650$
   - $\text{Final Balance} = 10,650$ เสมอทุกรอบ ไม่ว่าจะสลับลำดับอย่างไร
2. **Zero Drawdown Test:**
   - ข้อมูล R: ทุกตัวมีค่า $+1$
   - โหมด Bootstrap
   - $\text{Max Drawdown} = 0\%$ ทุกรอบการจำลอง
3. **Vitest Unit Tests:**
   - `src/renderer/src/utils/monteCarlo.test.ts` (ผ่าน 100%)
   - `src/renderer/src/utils/tradeFilters.test.ts` (ผ่าน 100%)
4. **Standalone Verification Script:**
   - `scratch/remove_required.js` (ผ่าน 100%)
