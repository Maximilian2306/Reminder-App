<template>
  <div class="app-shell">
    <AppHeader />
    <RouterView class="page" />
    <BottomNav />
    <AchievementToast />
    <LevelUpModal />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import BottomNav from '@/components/layout/BottomNav.vue'
import AchievementToast from '@/components/gamification/AchievementToast.vue'
import LevelUpModal from '@/components/gamification/LevelUpModal.vue'
import { useSettingsStore } from '@/stores/settings'
import { useHabitsStore } from '@/stores/habits'
import { scheduleNotificationsForToday } from '@/utils/notifications'

const settingsStore = useSettingsStore()
const habitsStore = useHabitsStore()

onMounted(() => {
  if (settingsStore.settings.notifications.enabled) {
    const hasException = habitsStore.todayExceptionDay !== null
    scheduleNotificationsForToday(settingsStore.settings.notifications, hasException)
  }
})
</script>

<style scoped>
.app-shell {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}
</style>
