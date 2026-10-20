<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'

export interface UpdaterState {
  status: 'idle' | 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error'
  currentVersion: string
  updateInfo?: {
    version: string
    releaseName?: string
    releaseNotes?: string | Array<{ version: string; note: string | null }>
    releaseDate?: string
  } | null
  progress?: {
    percent: number
    bytesPerSecond: number
    transferred: number
    total: number
  } | null
  error?: string | null
}

const updaterState = ref<UpdaterState>({
  status: 'idle',
  currentVersion: '1.0.0',
  updateInfo: null,
  progress: null,
  error: null
})

let cleanupListener: (() => void) | null = null

const formattedSpeed = computed(() => {
  if (!updaterState.value.progress?.bytesPerSecond) return ''
  const mbps = updaterState.value.progress.bytesPerSecond / (1024 * 1024)
  return `${mbps.toFixed(1)} MB/s`
})

const formattedTransferred = computed(() => {
  if (!updaterState.value.progress) return ''
  const transMb = (updaterState.value.progress.transferred / (1024 * 1024)).toFixed(1)
  const totalMb = (updaterState.value.progress.total / (1024 * 1024)).toFixed(1)
  return `${transMb} / ${totalMb} MB`
})

const parsedReleaseNotes = computed(() => {
  const notes = updaterState.value.updateInfo?.releaseNotes
  if (!notes) return ''
  if (typeof notes === 'string') return notes
  if (Array.isArray(notes)) {
    return notes.map((n) => (typeof n === 'object' && n.note ? n.note : String(n))).join('\n')
  }
  return String(notes)
})

const loadInitialStatus = async () => {
  if (window.api?.updater) {
    try {
      const status = await window.api.updater.getStatus()
      if (status) {
        updaterState.value = status
      }
      const version = await window.api.updater.getVersion()
      if (version) {
        updaterState.value.currentVersion = version
      }
    } catch (err) {
      console.warn('Failed to get initial updater status:', err)
    }
  }
}

const checkForUpdates = async () => {
  if (!window.api?.updater) return
  try {
    updaterState.value.status = 'checking'
    updaterState.value.error = null
    const res = await window.api.updater.check()
    if (res) {
      updaterState.value = res
    }
  } catch (err: any) {
    updaterState.value.status = 'error'
    updaterState.value.error = err.message || 'Failed to check for updates'
  }
}

const downloadUpdate = async () => {
  if (!window.api?.updater) return
  try {
    updaterState.value.status = 'downloading'
    updaterState.value.error = null
    await window.api.updater.download()
  } catch (err: any) {
    updaterState.value.status = 'error'
    updaterState.value.error = err.message || 'Failed to download update'
  }
}

const installUpdate = async () => {
  if (!window.api?.updater) return
  try {
    await window.api.updater.install()
  } catch (err: any) {
    updaterState.value.status = 'error'
    updaterState.value.error = err.message || 'Failed to install update'
  }
}

const openReleasesPage = () => {
  window.open('https://github.com/oldmansnakehead/trading_journal_v2/releases', '_blank')
}

onMounted(() => {
  loadInitialStatus()

  if (window.api?.updater?.onStatusChange) {
    cleanupListener = window.api.updater.onStatusChange((newState) => {
      if (newState) {
        updaterState.value = newState
      }
    })
  }
})

onUnmounted(() => {
  if (cleanupListener) {
    cleanupListener()
  }
})
</script>

<template>
  <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-6">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <i class="ph ph-arrow-circle-up text-2xl font-bold"></i>
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h3 class="text-lg font-bold text-gray-900">Application Updates</h3>
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
              v{{ updaterState.currentVersion }}
            </span>
          </div>
          <p class="text-sm text-gray-500 mt-0.5">
            Published via GitHub Releases (<span class="font-mono text-xs">oldmansnakehead/trading_journal_v2</span>)
          </p>
        </div>
      </div>

      <!-- Action Button Area -->
      <div class="flex items-center gap-3">
        <button
          v-if="updaterState.status === 'idle' || updaterState.status === 'not-available' || updaterState.status === 'error'"
          type="button"
          @click="checkForUpdates"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 active:scale-95 text-white text-sm font-semibold transition-all shadow-xs cursor-pointer"
        >
          <i class="ph ph-arrows-clockwise text-base"></i>
          <span>Check for Updates</span>
        </button>

        <button
          v-else-if="updaterState.status === 'checking'"
          disabled
          type="button"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-gray-400 text-sm font-semibold cursor-not-allowed"
        >
          <svg class="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Checking...</span>
        </button>

        <button
          v-else-if="updaterState.status === 'available'"
          type="button"
          @click="downloadUpdate"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-sm font-semibold transition-all shadow-xs cursor-pointer"
        >
          <i class="ph ph-download-simple text-base"></i>
          <span>Download v{{ updaterState.updateInfo?.version || 'Update' }}</span>
        </button>

        <button
          v-else-if="updaterState.status === 'downloaded'"
          type="button"
          @click="installUpdate"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 active:scale-95 text-white text-sm font-semibold transition-all shadow-sm cursor-pointer animate-pulse"
        >
          <i class="ph ph-arrow-counter-clockwise text-base"></i>
          <span>Restart & Install Now</span>
        </button>
      </div>
    </div>

    <!-- State Status Displays -->

    <!-- 1. Checking State -->
    <div v-if="updaterState.status === 'checking'" class="py-4 flex items-center gap-3 text-sm text-gray-600">
      <svg class="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span>Contacting GitHub Releases to check for newer versions...</span>
    </div>

    <!-- 2. Up to date State -->
    <div
      v-else-if="updaterState.status === 'not-available'"
      class="p-4 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-start gap-3"
    >
      <i class="ph ph-check-circle text-emerald-600 text-xl shrink-0 mt-0.5"></i>
      <div>
        <h4 class="text-sm font-bold text-emerald-900">You are up to date!</h4>
        <p class="text-xs text-emerald-700 mt-0.5">
          Trading Journal v{{ updaterState.currentVersion }} is the latest release available on GitHub.
        </p>
      </div>
    </div>

    <!-- 3. Update Available State -->
    <div
      v-else-if="updaterState.status === 'available'"
      class="p-4 rounded-xl bg-blue-50 border border-blue-200/60 flex flex-col gap-3"
    >
      <div class="flex items-start justify-between">
        <div class="flex items-start gap-3">
          <i class="ph ph-sparkle text-blue-600 text-xl shrink-0 mt-0.5"></i>
          <div>
            <h4 class="text-sm font-bold text-blue-900">
              New Update Available: v{{ updaterState.updateInfo?.version }}
            </h4>
            <p v-if="updaterState.updateInfo?.releaseDate" class="text-xs text-blue-600 mt-0.5">
              Released on: {{ new Date(updaterState.updateInfo.releaseDate).toLocaleDateString() }}
            </p>
          </div>
        </div>
        <span class="px-2 py-0.5 bg-blue-200/60 text-blue-800 text-xs font-semibold rounded-md">
          Ready to Download
        </span>
      </div>

      <!-- Release Notes Box -->
      <div
        v-if="parsedReleaseNotes"
        class="bg-white/80 rounded-lg p-3 border border-blue-100 max-h-48 overflow-y-auto text-xs text-gray-700 font-mono whitespace-pre-line"
      >
        {{ parsedReleaseNotes }}
      </div>
    </div>

    <!-- 4. Downloading Progress State -->
    <div
      v-else-if="updaterState.status === 'downloading'"
      class="p-4 rounded-xl bg-indigo-50 border border-indigo-200/60 flex flex-col gap-3"
    >
      <div class="flex items-center justify-between text-sm">
        <div class="flex items-center gap-2 text-indigo-900 font-bold">
          <i class="ph ph-cloud-arrow-down text-lg text-indigo-600 animate-bounce"></i>
          <span>Downloading Update (v{{ updaterState.updateInfo?.version || '' }})...</span>
        </div>
        <span class="font-bold text-indigo-700 text-xs">
          {{ updaterState.progress?.percent || 0 }}%
        </span>
      </div>

      <!-- Progress bar -->
      <div class="w-full bg-indigo-200/50 rounded-full h-2.5 overflow-hidden">
        <div
          class="bg-indigo-600 h-2.5 rounded-full transition-all duration-200"
          :style="{ width: `${updaterState.progress?.percent || 0}%` }"
        ></div>
      </div>

      <div class="flex items-center justify-between text-xs text-indigo-600 font-mono">
        <span>{{ formattedTransferred }}</span>
        <span>{{ formattedSpeed }}</span>
      </div>
    </div>

    <!-- 5. Downloaded State (Ready to Install) -->
    <div
      v-else-if="updaterState.status === 'downloaded'"
      class="p-4 rounded-xl bg-emerald-50 border border-emerald-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
    >
      <div class="flex items-start gap-3">
        <i class="ph ph-check-fat text-emerald-600 text-2xl shrink-0 mt-0.5"></i>
        <div>
          <h4 class="text-sm font-bold text-emerald-900">
            Update v{{ updaterState.updateInfo?.version }} Downloaded!
          </h4>
          <p class="text-xs text-emerald-700 mt-0.5">
            The new version is ready. Restart now to automatically install and apply the updates.
          </p>
        </div>
      </div>

      <button
        type="button"
        @click="installUpdate"
        class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer whitespace-nowrap active:scale-95"
      >
        Restart & Install
      </button>
    </div>

    <!-- 6. Error State -->
    <div
      v-else-if="updaterState.status === 'error'"
      class="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3"
    >
      <i class="ph ph-warning-circle text-red-600 text-xl shrink-0 mt-0.5"></i>
      <div class="flex-1">
        <h4 class="text-sm font-bold text-red-900">Update Check Error</h4>
        <p class="text-xs text-red-700 mt-0.5 font-mono break-all">
          {{ updaterState.error }}
        </p>
        <button
          type="button"
          @click="checkForUpdates"
          class="mt-2 text-xs font-bold text-red-800 underline hover:no-underline cursor-pointer"
        >
          Try checking again
        </button>
      </div>
    </div>

    <!-- Footer Information -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-400 gap-2 pt-2 border-t border-gray-100">
      <div class="flex items-center gap-1.5">
        <i class="ph ph-git-commit text-sm"></i>
        <span>Auto-updater downloads installers from GitHub Releases</span>
      </div>

      <button
        type="button"
        @click="openReleasesPage"
        class="inline-flex items-center gap-1 text-primary hover:underline font-medium cursor-pointer self-start sm:self-auto"
      >
        <span>View all releases on GitHub</span>
        <i class="ph ph-arrow-square-out text-sm"></i>
      </button>
    </div>
  </div>
</template>
