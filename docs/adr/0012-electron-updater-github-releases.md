# 12. Electron Auto-Updater with GitHub Releases

## Status

Accepted

## Context

เพื่อให้ผู้ใช้งานแอปพลิเคชัน Trading Journal v2 ได้รับการอัปเดตฟีเจอร์ใหม่ การแก้บัก และแพตช์ความปลอดภัยโดยอัตโนมัติ โดยไม่ต้องดาวน์โหลดตัวติดตั้งใหม่มาลงทับด้วยตนเอง (Manual Update)

ระบบจำเป็นต้องมี:
1. การเชื่อมต่อ Auto-Updater เข้ากับ **GitHub Releases** ของ repository (`oldmansnakehead/trading_journal_v2`)
2. การสร้างและอัปโหลดไฟล์ตัวติดตั้ง (Installer `.exe`), Blockmap, และ `latest.yml` อัตโนมัติผ่าน GitHub Actions CI/CD เมื่อมีการสร้าง Release Tag (เช่น `v1.0.1`)
3. IPC Handlers และ Main Process Service สำหรับตรวจสอบเวอร์ชันใหม่, ดาวน์โหลดเบื้องหลัง, แสดงความคืบหน้า (Progress), และรีสตาร์ทเพื่อติดตั้ง (Restart & Install)
4. UI ในหน้าต่างแอปพลิเคชัน (Settings & Header Notification) สำหรับแจ้งเตือนผู้ใช้และกดตรวจสอบการอัปเดตได้ด้วยตนเอง

## Decision

เราตัดสินใจใช้ `electron-updater` ร่วมกับ GitHub Releases Provider และ GitHub Actions ดังนี้:

### 1. Electron Builder Configuration (`electron-builder.yml`)
- กำหนด `publish`:
  ```yaml
  publish:
    provider: github
    owner: oldmansnakehead
    repo: trading_journal_v2
    releaseType: release
  ```
- ตั้งค่า `appId` เป็น `com.tradingjournal.v2` และซิงค์ `electronApp.setAppUserModelId('com.tradingjournal.v2')` ใน Main Process เพื่อให้ Windows Notifications และ Taskbar Integration ของ NSIS ทำงานถูกต้อง
- กำหนดชื่อ Artifact ของ NSIS Installer: `${name}-${version}-setup.${ext}`

### 2. Main Process Architecture (`src/main/services/updater.ts` & `src/main/ipc/updaterHandlers.ts`)
- สร้าง Service ควบคุมสถานะการอัปเดต (State Machine):
  - `idle`: พร้อมทำงาน
  - `checking`: กำลังตรวจสอบเวอร์ชันล่าสุดจาก GitHub
  - `available`: พบเวอร์ชันใหม่ (พร้อมข้อมูล changelog / release notes)
  - `not-available`: แอปเป็นเวอร์ชันล่าสุดแล้ว
  - `downloading`: กำลังดาวน์โหลด (พร้อมเปอร์เซ็นต์และอัตราเร็ว)
  - `downloaded`: ดาวน์โหลดเสร็จสิ้น พร้อมรีสตาร์ทติดตั้ง
  - `error`: เกิดข้อผิดพลาดในการตรวจสอบหรือดาวน์โหลด
- กำหนด `autoUpdater.autoDownload = false` เพื่อให้ผู้ใช้สามารถควบคุมการดาวน์โหลดเองได้ ไม่เปลืองแบนด์วิดท์โดยไม่ตั้งใจ
- รองรับ IPC Channels:
  - `updater:check`: สั่งตรวจสอบอัปเดต
  - `updater:download`: สั่งเริ่มดาวน์โหลด
  - `updater:install`: สั่ง `quitAndInstall()`
  - `updater:getStatus`: ดึงสถานะปัจจุบัน
  - `updater:getVersion`: ดึงเวอร์ชันปัจจุบันของแอป (`app.getVersion()`)
- ส่ง Event Broadcast ไปยัง Renderer ผ่าน `mainWindow.webContents.send('updater:status-changed', state)`

### 3. Preload API & Type Definitions
- Expose ฟังก์ชัน `window.api.updater` ให้กับ Renderer Process อย่างปลอดภัยผ่าน `contextBridge`
- เพิ่ม Type Definitions ใน `src/preload/index.d.ts`

### 4. UI Components & UX
- พัฒนาคอมโพเนนต์ `AppUpdateCard.vue` สำหรับแสดงในหน้า **Settings -> App Updates**
- พัฒนาตัวแจ้งเตือนสถานะใน Header (`App.vue`) เมื่อพบว่ามีการอัปเดตใหม่พร้อมดาวน์โหลดหรือพร้อมติดตั้ง
- สร้าง Storybook Story (`AppUpdateCard.stories.ts`) และ Vue Flow Node (`AppUpdateCardNode.vue`) ตามระเบียบข้อบังคับ Rule 5 ใน `AGENTS.md`

### 5. GitHub Actions CI/CD (`.github/workflows/release.yml`)
- กำหนด Workflow ให้รันเมื่อมี Tag Push รูปแบบ `v*` (เช่น `v1.0.1`) หรือเรียกผ่าน `workflow_dispatch`
- ติดตั้ง Dependencies, รัน Typecheck และ Unit Tests
- ทำการ Build และ Publish Installer พร้อม `latest.yml` ขึ้นไปยัง GitHub Releases ผ่านคำสั่ง `electron-builder --win --publish always` โดยใช้ `GITHUB_TOKEN`

## Consequences

- **ข้อดี:**
  - อัปเดตแอปได้แบบไร้รอยต่อผ่านช่องทางมาตรฐานของ GitHub Releases โดยไม่มีค่าใช้จ่ายเซิร์ฟเวอร์แยก
  - ผู้ใช้ทราบสถานะเวอร์ชันปัจจุบันและประวัติการเปลี่ยนแปลง (Release Notes) ได้โดยตรงจากหน้า Settings
  - มี CI/CD อัตโนมัติ ลดความผิดพลาดจากการ Build & Release ด้วยมือ
- **ข้อเสีย / ข้อควรระวัง:**
  - ตัวติดตั้งบน Windows หากไม่มีการเซ็น Code Signing Certificate (EV/OV) ตัว Windows Defender SmartScreen อาจแสดงหน้าต่างเตือนในครั้งแรก ซึ่งเป็นปกติของ Open-source App ที่แจกจ่ายบน GitHub
