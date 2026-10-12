# Dashboard Table Pagination

## 🎯 ภาพรวม (Overview)

ระบบ Pagination สำหรับตารางบันทึกการเทรดล่าสุด (**Recent Trades**) ในหน้า Dashboard (`DashboardView.vue`) ถูกออกแบบมาเพื่อจัดการการแสดงผลข้อมูลประวัติการเทรดที่มีจำนวนมาก โดยไม่ให้เกิดผลกระทบต่อประสิทธิภาพการทำงานของ DOM (DOM overhead) พร้อมทั้งเพิ่มความยืดหยุ่นในการดูข้อมูลของผู้ใช้

---

## 🏗️ สถาปัตยกรรมและการออกแบบ (Architecture & Design)

ระบบแบ่งออกเป็น 3 ส่วนหลักตามหลัก Separation of Concerns:

```
src/
├── renderer/src/
│   ├── utils/
│   │   ├── pagination.ts         # Pure computational logic & range calculations
│   │   └── pagination.test.ts    # 100% test coverage for pagination logic
│   ├── components/
│   │   ├── ui/
│   │   │   └── BasePagination.vue # Reusable pagination UI component
│   │   ├── flow/
│   │   │   └── BasePaginationNode.vue # Custom Vue Flow node
│   │   └── views/
│   │       └── DashboardView.vue  # Integration into Recent Trades table
└── stories/
    ├── BasePagination.stories.ts     # Component Storybook story
    └── BasePaginationNode.stories.ts # Flow Node Storybook story
```

---

## ⚙️ คุณสมบัติหลัก (Key Features)

### 1. Reusable Engine (`pagination.ts`)
- **`calculatePagination(totalItems, currentPage, pageSize)`**: คำนวณช่วงรายการ (`startItem`, `endItem`), หน้าทั้งหมด (`totalPages`), สถานะ `hasNext` / `hasPrev`
- **`paginateItems<T>(items, currentPage, pageSize)`**: Slice อาเรย์ตามหน้าและขนาดที่ระบุอย่างปลอดภัย
- **`generateVisiblePages(totalPages, currentPage)`**: สร้างหมายเลขหน้าพร้อม Smart Ellipsis (เช่น `[1, 2, 3, 4, 5, '...', 10]` หรือ `[1, '...', 4, 5, 6, '...', 10]`)

### 2. BasePagination Component (`BasePagination.vue`)
- **Rows per page selector**: ให้ผู้ใช้เลือกจำนวนแถวต่อหน้าได้ (`10`, `25`, `50`, `100` แถวต่อหน้า)
- **Range Summary**: แสดงข้อความระบุช่วงรายการ เช่น *"Showing 1 to 10 of 45 trades"*
- **Navigation Controls**:
  - `<<` First Page
  - `<` Previous Page
  - Page Number Buttons พร้อม Active Highlight และ Hover States
  - `>` Next Page
  - `>>` Last Page
- **Auto Page Clamping**: ปรับ `currentPage` อัตโนมัติเมื่อผู้ใช้ลดจำนวนแถวต่อหน้าจนเกินหน้าสุดท้าย

### 3. Dashboard Integration (`DashboardView.vue`)
- **Preserved KPI & Chart Integrity**: การคำนวณสถิติภาพรวมทั้งหมด (Win Rate, Total Trades, Net PnL, Drawdown %, Equity Curve, Win/Loss Distribution) คำนวณจาก `filteredTrades` เต็มชุดข้อมูล ไม่ถูกตัดทอนโดย Pagination
- **Single Source of Truth**: `paginatedTrades` เป็น computed property ที่ slice มาจาก `displayTrades` (ซึ่งเรียงลำดับไม้ล่าสุดไว้บนสุด)
- **Smart Selection (Checkbox)**:
  - Checkbox ในหัวตาราง (`th`) จะสลับเลือกเฉพาะรายการในหน้าปัจจุบัน (`isPageSelected`)
  - มี Banner แถบสีแดงแสดงเมื่อมีรายการถูกเลือก พร้อมปุ่ม *"Select all X matching trades"* หากต้องการเลือกไม้ทั้งหมดข้ามหน้า
- **Filter Reset**: เมื่อผู้ใช้เปลี่ยนเงื่อนไขตัวกรอง (Filters Bar) ระบบจะรีเซ็ต `currentPage` กลับหน้า 1 ทันที

---

## 🧪 การทดสอบและการรับรอง (Verification & Testing)

1. **Unit Testing (`pagination.test.ts`)**:
   - 13 test cases ครอบคลุม: กรณีรายการว่าง (0 items), หน้าแรก, หน้ากลาง, หน้าสุดท้าย, ค่าติดลบ, ค่าเกินขอบเขต, การ slice ข้อมูล, และรูปแบบ ellipsis ทั้งหมด
2. **E2E Testing (`fill-trade.spec.ts`)**:
   - ตรวจสอบการแสดงผลของ `BasePagination` (`[data-testid="base-pagination"]`) และตัวเลือกขนาดหน้า (`[data-testid="pagination-page-size-select"]`)
3. **Storybook & Vue Flow (`AGENTS.md` Rule 5)**:
   - ผ่าน Storybook Component Story (`BasePagination.stories.ts`)
   - ผ่าน Vue Flow Node Story (`BasePaginationNode.stories.ts`)
