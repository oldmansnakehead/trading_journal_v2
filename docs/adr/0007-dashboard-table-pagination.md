# 7. Dashboard Table Pagination & Reusable BasePagination Component

## Status

Accepted

## Context

ในหน้า `DashboardView.vue` ส่วนตาราง "Recent Trades" เดิมทีแสดงผลรายการบันทึกการเทรดทั้งหมดที่ผ่านการคัดกรอง (`displayTrades = [...filteredTrades].reverse()`) ออกมาใน DOM ทันทีในครั้งเดียว

เมื่อข้อมูลประวัติการเทรดมีจำนวนมาก (เช่น หลายร้อยหรือหลายพันรายการ):
1. **Performance:** การ render ตาราง DOM ขนาดใหญ่ที่มีทั้ง Checkbox, Icon, Tag, Tooltip, ปุ่ม Actions และ SVG Icons ส่งผลให้ DOM tree ใหญ่เกินความจำเป็นและอาจทำให้ UI กระตุกเมื่อขยับหรือเลื่อนดูข้อมูล
2. **User Experience:** ผู้ใช้ต้องเลื่อนหน้าจอยาวมากเพื่อดูหรือค้นหารายการเทรด ขาดการจัดหน้าและบอกจำนวนรายการต่อหน้า (Rows per page) ที่ยืดหยุ่น

## Decision

เราตัดสินใจสร้างคอมโพเนนต์การแบ่งหน้าส่วนกลาง (`BasePagination.vue`) และนำมาประยุกต์ใช้กับตาราง Recent Trades ในหน้า Dashboard:

1. **Reusable Component (`src/renderer/src/components/ui/BasePagination.vue`):**
   - รองรับ `v-model:currentPage` และ `v-model:pageSize`
   - กำหนดตัวเลือกจำนวนแถวต่อหน้า (`pageSizeOptions`: 10, 25, 50, 100)
   - แสดงช่วงรายการปัจจุบันและจำนวนทั้งหมด เช่น "Showing 1 to 10 of 45 trades"
   - ปุ่มเปลี่ยนหน้า: First (`<<`), Previous (`<`), ปุ่มตัวเลขหน้าพร้อม Smart Ellipsis (`...`), Next (`>`), Last (`>>`)
   - ปรับสถานะ disabled และ active อย่างชัดเจนตาม Design System ของแอปพลิเคชัน

2. **Integration ใน `DashboardView.vue`:**
   - เพิ่ม Reactive State: `currentPage = ref(1)` และ `pageSize = ref(10)`
   - คำนวณ `paginatedTrades` ด้วย slicing จาก `displayTrades`:
     `const paginatedTrades = computed(() => displayTrades.value.slice((currentPage - 1) * pageSize, currentPage * pageSize))`
   - ตัวชี้วัด KPIs ภาพรวม (Total Trades, Win Rate, PnL, Drawdown, Equity Curve, Win/Loss Distribution) ทั้งหมดยังคงคำนวณจาก `filteredTrades` เต็มชุดข้อมูลตามเดิม เพื่อรักษาความถูกต้องของสถิติ
   - ปรับการเลือก Checkbox ในส่วนหัวตาราง (`toggleSelectAll`) ให้ทำงานสอดคล้องกับ Pagination (สลับเลือกรายการในหน้าปัจจุบัน / ทั้งหมด) และรีเซ็ต `currentPage` กลับหน้า 1 เสมอเมื่อผู้ใช้เปลี่ยนตัวกรองข้อมูล

3. **Storybook & Vue Flow Integration:**
   - สร้าง Storybook Story (`src/stories/BasePagination.stories.ts`)
   - สร้าง Vue Flow Node (`BasePaginationNode.vue`) และ Story (`BasePaginationNode.stories.ts`) ตามกฎ Rule 5 ใน `AGENTS.md`

## Consequences

- **ข้อดี:**
  - เพิ่มประสิทธิภาพการเรนเดอร์ของหน้า Dashboard ได้อย่างมาก ไม่เกิด DOM overhead แม้มีข้อมูลเทรดเป็นพันรายการ
  - ผู้ใช้งานสามารถเลือกดู 10, 25, 50 หรือ 100 รายการต่อหน้าได้ตามความสะดวก
  - ได้ Reusable Component สำหรับใช้งานในตารางหรือหน้ารายงานอื่นๆ ต่อไป
- **ข้อเสีย:**
  - ตรรกะ Checkbox ทั้งหมดในตารางต้องคำนึงถึงทั้งหน้ารายการปัจจุบันและรายการทั้งหมด
