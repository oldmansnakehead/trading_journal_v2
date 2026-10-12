# 10. Toggleable and Collapsible Navigation Sidebar

## Status

Accepted

## Context

บนหน้าจอขนาดเดสก์ท็อปและแท็บเล็ต (ความกว้างตั้งแต่ 768px ขึ้นไป รวมถึงขนาดหน้าต่างเริ่มต้น 900px) Sidebar แถบเมนูด้านซ้ายจะแสดงผลคงที่ (`w-64 lg:w-72`) ตลอดเวลา

ผู้ใช้ที่วิเคราะห์กราฟเทรด แดชบอร์ดสถิติ หรือตารางประวัติไม้ ต้องการความยืดหยุ่นในการ:
1. **ซ่อน / แสดง (Toggle Show & Hide):** ซ่อน Sidebar ทั้งหมดเพื่อให้พื้นที่หน้าจอ 100% ถูกจัดสรรให้กับชาร์ตและตารางสถิติได้อย่างเต็มตา
2. **ย่อเป็น Mini Icon Rail (Collapse to Icons):** ปรับลดความกว้างเหลือเพียงแถบไอคอน (`w-20`) เพื่อประหยัดพื้นที่แนวนอนแต่ยังคงคลิกเปลี่ยนหน้าได้รวดเร็ว
3. **การเข้าถึงสะดวกรวดเร็ว (Accessibility & Shortcuts):** สามารถกดคีย์ลัด `Ctrl+B` (หรือ `Cmd+B` บน macOS) หรือกดปุ่ม Toggle บนแถบ Header เพื่อสลับสถานะได้ทันที
4. **จดจำสถานะผู้ใช้ (State Persistence):** บันทึกการตั้งค่าลง `localStorage` เพื่อให้ผู้ใช้ไม่ต้องกดซ่อนใหม่ทุกครั้งที่รีเฟรชหรือเปิดโปรแกรม

## Decision

เราตัดสินใจออกแบบและพัฒนาระบบ Toggle Sidebar ดังนี้:

1. **Pinia Store (`src/renderer/src/stores/sidebar.ts`):**
   - จัดการ State:
     - `isVisible`: ควบคุมการแสดง/ซ่อน Desktop Sidebar (ค่าเริ่มต้น: `true` เพื่อความเข้ากันได้กับ E2E และผู้ใช้ใหม่)
     - `isCollapsed`: ควบคุมโหมด Mini Icon Rail (ค่าเริ่มต้น: `false`)
     - `isMobileOpen`: ควบคุมสถานะ Mobile Drawer (< 768px)
   - Persistence: บันทึกลง `localStorage` (`trading_journal_sidebar_visible` และ `trading_journal_sidebar_collapsed`)
   - Unit tests ครอบคลุมใน `src/renderer/src/stores/sidebar.test.ts` (ผ่าน 5/5 tests)

2. **Desktop Control Header (`src/renderer/src/App.vue`):**
   - เพิ่มแถบ Header ส่วนกลางด้านบน (`h-13`) แสดงปุ่ม `toggle-sidebar-btn` ที่ระบุสถานะ "Hide Sidebar" / "Show Sidebar" พร้อมป้ายกำกับคีย์ลัด `Ctrl+B`
   - เพิ่มปุ่ม `toggle-collapse-btn` สำหรับสลับระหว่างโหมดขยายเต็มและโหมด Mini Icons
   - ผูก Event Listener ดักจับคีย์ลัด `Ctrl+B` และ `Cmd+B` ในระดับ Application Global

3. **Smooth Responsive Aside (`src/renderer/src/components/ui/AppSidebar.vue`):**
   - ใช้ CSS Transition แอนิเมชันที่ลื่นไหล (`transition-all duration-300 ease-in-out`):
     - เมื่อซ่อน: `w-0 -translate-x-full opacity-0 pointer-events-none !border-r-0`
     - เมื่อย่อ (Mini Rail): `w-20 translate-x-0 opacity-100` พร้อมซ่อนป้ายชื่อเหลือเฉพาะไอคอนที่มี Tooltip
     - เมื่อขยายเต็ม: `w-64 lg:w-72 translate-x-0 opacity-100`
   - เพิ่มปุ่ม Toggle และ Collapse ไว้ที่ส่วนหัวของ Sidebar ควบคู่ไปด้วย เพื่อให้ซ่อนได้จากตัว Sidebar โดยตรง

4. **Storybook & Vue Flow (`AGENTS.md` Rule 5):**
   - Storybook: ปรับปรุง `src/stories/AppSidebar.stories.ts` รองรับทั้ง `DesktopExpanded`, `DesktopCollapsedMini`, และ `MobileView`
   - Vue Flow: ปรับปรุง `src/stories/AppSidebarNode.stories.ts` ให้รองรับ Pinia store

## Consequences

- **ข้อดี:**
  - เพิ่มพื้นที่หน้าจอสำหรับกราฟและตารางในหน้า Dashboard, Monte Carlo, Edge Analysis ได้อย่างมาก
  - รองรับทั้งการซ่อนสมบูรณ์ (0px) และการย่อเป็นแถบไอคอน (80px)
  - ใช้งานสะดวกผ่านปุ่ม UI หรือคีย์ลัดมาตรฐานสากล `Ctrl+B`
  - ไม่กระทบต่อการทำงานของหน้าจอมือถือ (< 768px) และคงความเสถียรของ E2E tests เดิม
- **ข้อเสีย:**
  - เพิ่มแถบ Header บางๆ (h-13) ในส่วนเนื้อหาหลักสำหรับเป็นจุดคลิก Toggle เมื่อ Sidebar ซ่อนอยู่
