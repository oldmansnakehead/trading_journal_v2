import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSidebarStore = defineStore('sidebar', () => {
  // Desktop show / hide visibility (always starts true for fresh session/launch)
  const isVisible = ref(true)

  // Desktop mini-rail collapse mode (default: false)
  const isCollapsed = ref(false)

  // Mobile drawer open state
  const isMobileOpen = ref(false)

  function toggleSidebar() {
    isVisible.value = !isVisible.value
  }

  function setVisible(val: boolean) {
    isVisible.value = val
  }

  function toggleCollapse() {
    isCollapsed.value = !isCollapsed.value
  }

  function setCollapsed(val: boolean) {
    isCollapsed.value = val
  }

  function openMobile() {
    isMobileOpen.value = true
  }

  function closeMobile() {
    isMobileOpen.value = false
  }

  function toggleMobile() {
    isMobileOpen.value = !isMobileOpen.value
  }

  return {
    isVisible,
    isCollapsed,
    isMobileOpen,
    toggleSidebar,
    setVisible,
    toggleCollapse,
    setCollapsed,
    openMobile,
    closeMobile,
    toggleMobile
  }
})
