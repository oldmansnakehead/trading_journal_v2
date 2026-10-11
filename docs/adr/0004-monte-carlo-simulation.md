# 4. Monte Carlo Simulation Architecture

## Status

Accepted

## Context

ระบบ Trading Journal ต้องการเครื่องมือประเมินความเสี่ยงและจำลองผลลัพธ์ในอนาคต (Account Equity Projection, Max Drawdown Risk, Risk of Ruin) ที่มีมาตรฐานสากล แยกออกจากหน้า Dashboard และ Reports เดิม โดยอ้างอิง:
1. **Van Tharp's R-multiple Bootstrap:** การจำลองผลลัพธ์โดยสุ่มค่า R-multiples จากข้อมูลประวัติการเทรดจริง
2. **Kevin Davey's Risk Analysis:** การวิเคราะห์ความเสี่ยงด้าน Drawdown (P95 Worst-case DD), Risk of Ruin ระหว่างทาง (ไม่ใช่แค่ยอดจบ), และการกระจายตัวของไม้แพ้ต่อเนื่อง (Max Consecutive Losses)

## Decision

เราตัดสินใจสร้างหน้าใหม่ `MonteCarloView.vue` ที่เส้นทาง `/monte-carlo` พร้อมสถาปัตยกรรมดังนี้:
1. **Modular Engine (`src/renderer/src/utils/monteCarlo.ts`):**
   - แยกตรรกะการคำนวณทั้งหมดออกเป็น Pure TypeScript functions ที่มี Unit Test ครอบคลุม 100%
   - รองรับ 3 วิธีการสุ่ม: Bootstrap (ใส่คืน), Shuffle (สลับลำดับไม้เดิมโดยไม่ใส่คืน), และ Block Bootstrap (สุ่มบล็อกไม้ติดกัน)
   - รองรับการคำนวณกำไร/ขาดทุนทั้งแบบ Simple และ Compounded
   - มีระบบ Stress Testing (ลด R ของไม้ชนะ และสุ่มข้ามไม้)
2. **Deterministic Seeded PRNG (`mulberry32`):**
   - ใช้ Seeded PRNG เพื่อให้ผลการจำลองสามารถทำซ้ำได้แน่นอน (Reproducible) เมื่อใช้ Seed เดิม
3. **Web Worker Offloading (`src/renderer/src/workers/monteCarlo.worker.ts`):**
   - รันการจำลองสูงสุด 20,000 รอบบน Web Worker ใน Background Thread เพื่อป้องกัน UI ค้างหรือกระตุก
   - มี Inline Fallback เมื่อรันในสภาพแวดล้อมที่ไม่รองรับ Worker
4. **Memory Optimization:**
   - สำหรับ Equity Cone ใช้การบันทึกค่าเฉพาะจุดสุ่มตัวอย่าง (Sampled Trade Steps) แทนการเก็บทุกเส้นทางครบ 20,000 เส้น ช่วยลดการใช้หน่วยความจำลงอย่างมหาศาล
5. **UI & Data Persistence:**
   - แสดงผลกราฟ Equity Cone (แรเงา Confidence Intervals P5–P95 และ P25–P75 พร้อมเส้น Actual Equity)
   - แสดง Histogram ของ Max Drawdown และ Final Balance พร้อมแผนภาพแท่ง Max Consecutive Losses
   - บันทึกการตั้งค่าล่าสุดลงใน `localStorage` (`mc_sim_settings`)

## Consequences

- **ข้อดี:**
  - ประสิทธิภาพสูง UI ไม่กระตุกแม้รันจำนวนรอบสูง (Responsive 60 FPS)
  - ผู้ใช้สามารถส่งตัวกรองจากหน้า Reports หรือ Dashboard มาจำลองได้ทันทีผ่าน Query String
  - การทดสอบทางสถิติแม่นยำและตรวจสอบผลได้เสมอ
- **ข้อเสีย:**
  - การเรนเดอร์หลายกราฟพร้อมกันอาจใช้ CPU ฝั่ง Client ชั่วขณะ ซึ่งจัดการได้ด้วยการรันแบบ Worker และแสดงผลเฉพาะเมื่อเสร็จสิ้น
