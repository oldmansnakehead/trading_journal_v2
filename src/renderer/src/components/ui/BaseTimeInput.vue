<script setup lang="ts">
import { ref, watch } from 'vue'

const model = defineModel<string>() // format: HH:mm

const hoursInput = ref('')
const minutesInput = ref('')

const hoursInputRef = ref<HTMLInputElement | null>(null)
const minutesInputRef = ref<HTMLInputElement | null>(null)

const emitModel = () => {
  const h = hoursInput.value.padStart(2, '0')
  const m = (minutesInput.value || '00').padStart(2, '0')
  if (hoursInput.value || minutesInput.value) {
    model.value = `${h}:${m}`
  } else {
    model.value = ''
  }
}

const onHoursInput = () => {
  // Only allow numbers
  hoursInput.value = hoursInput.value.replace(/[^0-9]/g, '')
  if (hoursInput.value.length === 2 && minutesInputRef.value) {
    minutesInputRef.value.focus()
  }
  emitModel()
}

const onMinutesInput = () => {
  // Only allow numbers
  minutesInput.value = minutesInput.value.replace(/[^0-9]/g, '')
  emitModel()
}

const onMinutesKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Backspace' && minutesInput.value === '') {
    hoursInputRef.value?.focus()
  }
}

watch(
  model,
  (val) => {
    if (val) {
      const parts = val.split(':')
      if (parts.length >= 2) {
        // Only update if it's different to prevent cursor jump
        if (hoursInput.value.padStart(2, '0') !== parts[0]) {
          hoursInput.value = parts[0]
        }
        if ((minutesInput.value || '00').padStart(2, '0') !== parts[1]) {
          minutesInput.value = parts[1]
        }
      }
    } else {
      hoursInput.value = ''
      minutesInput.value = ''
    }
  },
  { immediate: true }
)

const updateTime = () => {
  if (!hoursInput.value && !minutesInput.value) {
    model.value = ''
    return
  }

  let hNum = parseInt(hoursInput.value)
  let mNum = parseInt(minutesInput.value)

  if (isNaN(hNum)) hNum = 0
  if (isNaN(mNum)) mNum = 0

  if (hNum > 23) hNum = 23
  if (hNum < 0) hNum = 0
  if (mNum > 59) mNum = 59
  if (mNum < 0) mNum = 0

  hoursInput.value = String(hNum).padStart(2, '0')
  minutesInput.value = String(mNum).padStart(2, '0')

  model.value = `${hoursInput.value}:${minutesInput.value}`
}

const onBlur = () => {
  updateTime()
}
</script>

<template>
  <div class="flex items-center gap-1.5">
    <input
      ref="hoursInputRef"
      type="text"
      v-model="hoursInput"
      @input="onHoursInput"
      @blur="onBlur"
      @keyup.enter="updateTime"
      maxlength="2"
      class="w-12 h-[42px] border border-gray-200 rounded-lg px-2 text-sm font-bold text-center focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900 bg-white"
      placeholder="HH"
    />
    <span class="text-gray-900 font-bold">:</span>
    <input
      ref="minutesInputRef"
      type="text"
      v-model="minutesInput"
      @input="onMinutesInput"
      @keydown="onMinutesKeydown"
      @blur="onBlur"
      @keyup.enter="updateTime"
      maxlength="2"
      class="w-12 h-[42px] border border-gray-200 rounded-lg px-2 text-sm font-bold text-center focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900 bg-white"
      placeholder="MM"
    />
  </div>
</template>
