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
          class="mt-auto bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-sm w-full md:w-auto"
        >
          {{ isExporting ? 'Exporting...' : 'Export to .zip' }}
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
          @click="importBackup"
          :disabled="isImporting"
          class="mt-auto bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 text-gray-900 px-5 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-sm w-full md:w-auto"
        >
          {{ isImporting ? 'Importing...' : 'Import from .zip' }}
        </button>
      </div>
    </div>

    <!-- Info Section -->
    <div class="mt-8 bg-blue-50/50 rounded-2xl p-6 border border-blue-100 flex gap-4">
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
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isExporting = ref(false)
const isImporting = ref(false)

const exportBackup = async () => {
  if (isExporting.value) return
  isExporting.value = true
  try {
    // @ts-ignore
    const result = await window.api.backup.export()
    if (!result.success && result.error !== 'User canceled') {
      alert('Export failed: ' + result.error)
    }
  } catch (err: any) {
    alert('Export failed: ' + err.message)
  } finally {
    isExporting.value = false
  }
}

const importBackup = async () => {
  if (isImporting.value) return
  isImporting.value = true
  try {
    // @ts-ignore
    const result = await window.api.backup.import()
    if (!result.success && result.error !== 'User canceled') {
      alert('Import failed: ' + result.error)
    }
  } catch (err: any) {
    alert('Import failed: ' + err.message)
  } finally {
    isImporting.value = false
  }
}
</script>
