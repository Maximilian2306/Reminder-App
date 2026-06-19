<template>
  <header class="app-header">
    <div class="header-content">
      <div class="header-left">
        <span class="header-title">{{ pageTitle }}</span>
      </div>
      <div class="header-right">
        <div class="level-badge" title="Dein Level">
          <span class="level-icon">⚡</span>
          <span class="level-text">Lv. {{ profile.level }}</span>
        </div>
      </div>
    </div>
    <div class="xp-bar-wrapper">
      <template v-if="route.name === 'dashboard'">
        <div class="xp-bar-track">
          <div class="xp-bar-fill" :style="{ width: xpProgress + '%' }" />
        </div>
        <span class="xp-label">{{ levelInfo.currentXP }} / {{ levelInfo.xpForNextLevel }} XP</span>
      </template>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useGamificationStore } from '@/stores/gamification'

const route = useRoute()
const gamificationStore = useGamificationStore()
const { profile, levelInfo, xpProgress } = gamificationStore

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    dashboard: 'Heute',
    habits: 'Gewohnheiten',
    stats: 'Statistiken',
    settings: 'Einstellungen',
  }
  return titles[String(route.name)] ?? 'Habit Tracker'
})
</script>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: var(--bg-nav);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border);
  padding-top: env(safe-area-inset-top, 0);
  min-height: 92px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  height: 58px;
}

.header-title {
  font-size: 20px;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.level-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: var(--radius-full);
  background: var(--color-primary-light);
}

.level-icon {
  font-size: 14px;
}

.level-text {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-primary);
}

.xp-bar-wrapper {
  padding: 0 16px 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.xp-bar-track {
  flex: 1;
  height: 6px;
  background: var(--color-primary-light);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.xp-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
  border-radius: var(--radius-full);
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.xp-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  white-space: nowrap;
  min-width: 80px;
  text-align: right;
}
</style>
