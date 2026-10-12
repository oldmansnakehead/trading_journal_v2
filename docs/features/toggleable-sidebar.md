# Toggleable & Collapsible Navigation Sidebar Feature

## ภาพรวมของฟีเจอร์ (Feature Overview)

ฟีเจอร์ **Toggle Sidebar Show / Hide & Mini Rail Collapse** เพิ่มความสามารถในการซ่อนหรือย่อแถบเมนูด้านซ้ายบนหน้าจอเดสก์ท็อป เพื่อเปิดพื้นที่การแสดงผล 100% ให้กับหน้าจอรายงาน ชาร์ต และตารางบันทึกการเทรด พร้อมทั้งปุ่มทางลัดและคีย์ลัดสากล `Ctrl+B`

---

## คุณสมบัติเด่น (Key Capabilities)

### 1. โหมดการแสดงผล 3 ระดับ (3 Navigation Modes)
1. **Expanded Mode (ขยายเต็ม - ค่าเริ่มต้น):**
   - ความกว้าง `w-64 lg:w-72`
   - แสดงโลโก้, ชื่อโปรแกรม, ชื่อกลุ่มเมนู (Overview / Management), และชื่อเมนูครบถ้วน
2. **Mini Rail Mode (ย่อแถบไอคอน):**
   - ความกว้าง `w-20` (80px)
   - ซ่อนข้อความทั้งหมด แสดงเฉพาะไอคอนจัดกึ่งกลางพร้อม Tooltip กำกับชื่อหน้า
3. **Hidden Mode (ซ่อนสมบูรณ์):**
   - ความกว้าง `0px` (`w-0 -translate-x-full opacity-0 pointer-events-none`)
   - เนื้อหาหลัก (Main Content) ขยายเต็มพื้นที่ความกว้างหน้าต่าง 100%

### 2. ทางลัดและการควบคุม (Accessibility & Controls)
- **Desktop Control Header:** แถบควบคุมด้านบนแสดงปุ่ม `[ Hide/Show Sidebar ]` อย่างชัดเจนตลอดเวลา ทำให้ผู้ใช้คลิกเรียกคืน Sidebar ได้ทันทีแม้จะซ่อนอยู่
- **ปุ่มในตัว Sidebar:** ส่วนหัวของ Sidebar มีทั้งปุ่มซ่อน (Hide) และปุ่มย่อเป็น Mini Rail
- **คีย์ลัดระดับสากล `Ctrl+B` / `Cmd+B`:** กดสลับซ่อน/แสดง Sidebar ได้ทันทีจากทุกหน้าในโปรแกรม
- **Local Storage Persistence:** จดจำสถานะที่เลือก (`isVisible` และ `isCollapsed`) อัตโนมัติ

---

## สรุปไฟล์ที่เกี่ยวข้องในระบบ (File Structure)

| ส่วนประกอบ | ตำแหน่งไฟล์ | คำอธิบาย |
| :--- | :--- | :--- |
| **Pinia Store** | `src/renderer/src/stores/sidebar.ts` | Store จัดการ state `isVisible`, `isCollapsed`, `isMobileOpen` พร้อม LocalStorage |
| **Unit Tests** | `src/renderer/src/stores/sidebar.test.ts` | 5 Unit tests ทดสอบ toggle, set, collapse, และ mobile drawer |
| **Sidebar Component** | `src/renderer/src/components/ui/AppSidebar.vue` | Aside component พร้อม transitions และ mini rail layout |
| **App Shell** | `src/renderer/src/App.vue` | Header control bar และ global `Ctrl+B` keydown listener |
| **Storybook** | `src/stories/AppSidebar.stories.ts` | Stories สำหรับ Expanded, Collapsed Mini, และ Mobile view |
| **E2E Tests** | `e2e/app.spec.ts` | ทดสอบการคลิกปุ่ม Toggle ซ่อนและแสดง Sidebar |
| **ADR** | `docs/adr/0010-collapsible-and-toggleable-sidebar.md` | บันทึกการตัดสินใจทางสถาปัตยกรรม |
