<template>
  <div class="p-8 w-full max-w-4xl mx-auto">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Data Management</h1>
      <p class="text-gray-500 text-sm">Backup, restore, and manage your trading data.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Export Card -->
      <div
        class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-start gap-4"
      >
        <div
          class="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex justify-center items-center shrink-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" x2="12" y1="15" y2="3" />
          </svg>
        </div>
        <div>
          <h2 class="text-lg font-bold text-gray-900">Export Backup</h2>
          <p class="text-sm text-gray-500 mt-1">
            Download a complete .zip archive of your database and images. Useful for transferring to
            another device.
          </p>
        </div>
        <button
          @click="exportBackup"
          :disabled="isExporting"
          class="mt-auto bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-sm w-full md:w-auto flex items-center justify-center gap-2"
        >
          <svg
            v-if="isExporting"
            class="animate-spin h-4 w-4 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{{ isExporting ? 'Exporting...' : 'Export to .zip' }}</span>
        </button>
      </div>

      <!-- Import Card -->
      <div
        class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-start gap-4"
      >
        <div
          class="w-12 h-12 rounded-full bg-orange-50 text-orange-600 flex justify-center items-center shrink-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" x2="12" y1="3" y2="15" />
          </svg>
        </div>
        <div>
          <h2 class="text-lg font-bold text-gray-900">Import Backup</h2>
          <p class="text-sm text-gray-500 mt-1">
            Restore your data from a previous .zip backup. This will overwrite your current
            database.
          </p>
        </div>
        <button
          @click="showImportConfirmModal = true"
          :disabled="isImporting"
          class="mt-auto bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 text-gray-900 px-5 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-sm w-full md:w-auto flex items-center justify-center gap-2"
        >
          <svg
            v-if="isImporting"
            class="animate-spin h-4 w-4 text-gray-900"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{{ isImporting ? 'Importing...' : 'Import from .zip' }}</span>
        </button>
      </div>
    </div>

    <!-- Clear Database Card -->
    <div
      class="mt-6 bg-red-50/50 rounded-2xl p-6 border border-red-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
    >
      <div class="flex items-start gap-4">
        <div
          class="w-12 h-12 rounded-full bg-red-100 text-red-600 flex justify-center items-center shrink-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            <line x1="10" x2="10" y1="11" y2="17" />
            <line x1="14" x2="14" y1="11" y2="17" />
          </svg>
        </div>
        <div>
          <h2 class="text-lg font-bold text-gray-900">Clear Database</h2>
          <p class="text-sm text-gray-500 mt-1">
            Permanently erase all trades, setups, symbols, and uploaded images. A safety backup will be saved first.
          </p>
        </div>
      </div>
      <button
        @click="showClearModal = true"
        :disabled="isClearing"
        class="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-sm shrink-0 w-full md:w-auto flex items-center justify-center gap-2"
      >
        <svg
          v-if="isClearing"
          class="animate-spin h-4 w-4 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>{{ isClearing ? 'Clearing...' : 'Clear All Data' }}</span>
      </button>
    </div>

    <!-- Info Section -->
    <div class="mt-6 bg-blue-50/50 rounded-2xl p-6 border border-blue-100 flex gap-4">
      <div class="text-blue-500 mt-1">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </svg>
      </div>
      <div>
        <h3 class="font-bold text-blue-900 text-sm">Automatic Backups</h3>
        <p class="text-sm text-blue-700/80 mt-1">
          The system automatically creates a safe backup in the background every day when you open
          the app. You can find these in the internal app data folder.
        </p>
      </div>
    </div>

    <!-- Modals -->
    <!-- Import Confirmation Modal -->
    <BaseConfirmModal
      :isOpen="showImportConfirmModal"
      title="Confirm Database Import"
      message="Importing a backup will overwrite your current database and screenshots.&#10;&#10;An automatic backup of your current data will be created first. Are you sure you want to proceed?"
      confirmText="Select Backup File"
      cancelText="Cancel"
      variant="warning"
      @confirm="handleConfirmImport"
      @cancel="showImportConfirmModal = false"
    />

    <!-- Import Success Modal -->
    <BaseConfirmModal
      :isOpen="showImportSuccessModal"
      title="Import Completed Successfully"
      message="Your database and images have been restored successfully.&#10;&#10;The application will now reload to apply the imported data."
      confirmText="Reload Application"
      :showCancel="false"
      variant="success"
      @confirm="reloadApp"
    />

    <!-- Clear Database Confirmation Modal -->
    <BaseConfirmModal
      :isOpen="showClearModal"
      title="Clear All Database Data?"
      message="This will permanently delete all trades, setups, symbols, custom columns, and images.&#10;&#10;A safety backup of your current data will be created automatically in the backups folder before clearing."
      confirmText="Yes, Clear Everything"
      cancelText="Cancel"
      variant="danger"
      @confirm="handleConfirmClear"
      @cancel="showClearModal = false"
    />

    <!-- Clear Success Modal -->
    <BaseConfirmModal
      :isOpen="showClearSuccessModal"
      title="Database Cleared Successfully"
      message="All data and images have been erased. A safety backup has been created in the backups folder.&#10;&#10;The application will now reload."
      confirmText="Reload Application"
      :showCancel="false"
      variant="success"
      @confirm="reloadApp"
    />

    <!-- Toast Notification -->
    <BaseAlertDialog
      :isOpen="toast.isOpen"
      :title="toast.title"
      :message="toast.message"
      :variant="toast.variant"
      @close="toast.isOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BaseConfirmModal from '../ui/BaseConfirmModal.vue'
import BaseAlertDialog from '../ui/BaseAlertDialog.vue'

const isExporting = ref(false)
const isImporting = ref(false)
const isClearing = ref(false)

const showImportConfirmModal = ref(false)
const showImportSuccessModal = ref(false)
const showClearModal = ref(false)
const showClearSuccessModal = ref(false)

const toast = ref({
  isOpen: false,
  title: '',
  message: '',
  variant: 'info' as 'success' | 'error' | 'info'
})

const showToast = (title: string, message: string, variant: 'success' | 'error' | 'info' = 'info') => {
  toast.value = {
    isOpen: true,
    title,
    message,
    variant
  }
}

const reloadApp = () => {
  window.location.reload()
}

const exportBackup = async () => {
  if (isExporting.value) return
  isExporting.value = true
  try {
    const result = await window.api.backup.export()
    if (result.success) {
      showToast(
        'Export Successful',
        result.filePath
          ? `Backup saved to:\n${result.filePath}`
          : 'Backup file has been created successfully.',
        'success'
      )
    } else if (result.error && result.error !== 'User canceled') {
      showToast('Export Failed', result.error, 'error')
    }
  } catch (err: any) {
    showToast('Export Failed', err.message, 'error')
  } finally {
    isExporting.value = false
  }
}

const handleConfirmImport = async () => {
  showImportConfirmModal.value = false
  if (isImporting.value) return
  isImporting.value = true
  try {
    const result = await window.api.backup.import()
    if (result.success) {
      showImportSuccessModal.value = true
    } else if (result.error && result.error !== 'User canceled') {
      showToast('Import Failed', result.error, 'error')
    }
  } catch (err: any) {
    showToast('Import Failed', err.message, 'error')
  } finally {
    isImporting.value = false
  }
}

const handleConfirmClear = async () => {
  showClearModal.value = false
  if (isClearing.value) return
  isClearing.value = true
  try {
    const result = await window.api.backup.clear()
    if (result.success) {
      showClearSuccessModal.value = true
    } else if (result.error && result.error !== 'User canceled') {
      showToast('Clear Failed', result.error, 'error')
    }
  } catch (err: any) {
    showToast('Clear Failed', err.message, 'error')
  } finally {
    isClearing.value = false
  }
}
</script>
