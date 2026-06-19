<template>
  <div class="page">
    <div class="page-content">

      <!-- Date header -->
      <div class="date-section animate-slide-up">
        <div class="date-main">{{ dayName }}, {{ formattedDate }}</div>
        <div class="progress-summary">
          <span v-if="habitsStore.todayExceptionDay" class="exception-badge">Ausnahmetag</span>
          <span v-else class="progress-text">
            {{ todayProgress.completed }} von {{ todayProgress.total }} erledigt
          </span>
        </div>
      </div>

      <!-- Progress ring row -->
      <div class="overview-card card animate-slide-up" style="animation-delay:0.05s" v-if="todayProgress.total > 0">
        <div class="overview-ring-area">
          <svg class="ring-svg" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="32" fill="none" stroke="var(--color-primary-light)" stroke-width="8"/>
            <circle
              cx="40" cy="40" r="32"
              fill="none"
              stroke="var(--color-primary)"
              stroke-width="8"
              stroke-linecap="round"
              stroke-dasharray="201"
              :stroke-dashoffset="201 - (201 * ringPercent / 100)"
              transform="rotate(-90 40 40)"
              style="transition: stroke-dashoffset 0.6s cubic-bezier(0.4,0,0.2,1)"
            />
            <text x="40" y="44" text-anchor="middle" class="ring-text" font-size="16" font-weight="800">
              {{ ringPercent }}%
            </text>
          </svg>
        </div>
        <div class="overview-stats">
          <div class="stat-item">
            <span class="stat-value">{{ todayProgress.completed }}</span>
            <span class="stat-label">Erledigt</span>
          </div>
          <div class="stat-divider"/>
          <div class="stat-item">
            <span class="stat-value">{{ todayProgress.total - todayProgress.completed }}</span>
            <span class="stat-label">Offen</span>
          </div>
          <div class="stat-divider"/>
          <div class="stat-item">
            <span class="stat-value">{{ totalXpToday }}</span>
            <span class="stat-label">XP heute</span>
          </div>
        </div>
      </div>

      <!-- Exception day button -->
      <button
        class="exception-btn"
        :class="{ active: habitsStore.todayExceptionDay }"
        @click="toggleExceptionDay"
      >
        <span class="exception-icon">{{ habitsStore.todayExceptionDay ? '✓' : '🗓️' }}</span>
        <span>{{ habitsStore.todayExceptionDay ? 'Ausnahmetag aktiv' : 'Heute ist ein Ausnahmetag' }}</span>
      </button>

      <!-- Habits list -->
      <div v-if="habitsStore.activeHabits.length > 0">
        <div class="section-title" style="margin-top:24px">Deine Gewohnheiten</div>
        <div class="habits-list">
          <HabitCard
            v-for="(habit, i) in habitsStore.activeHabits"
            :key="habit.id"
            :habit="habit"
            :style="{ animationDelay: `${0.08 + i * 0.04}s` }"
          />
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="empty-state animate-fade-in">
        <span class="empty-state-icon">🌱</span>
        <div class="empty-state-title">Noch keine Gewohnheiten</div>
        <div class="empty-state-text">Erstelle deine erste Gewohnheit im "Ziele"-Tab.</div>
        <RouterLink to="/habits" class="btn btn-primary" style="margin-top:16px;display:inline-flex">
          Gewohnheit erstellen
        </RouterLink>
      </div>

      <!-- Week check alert -->
      <div
        v-if="weekAlerts.length > 0 && !habitsStore.todayExceptionDay"
        class="alert-section animate-slide-up"
        style="animation-delay:0.2s"
      >
        <div class="section-title">Wochencheck</div>
        <div class="alert-card card" v-for="alert in weekAlerts" :key="alert.habitId">
          <div class="alert-icon">⚠️</div>
          <div class="alert-text">
            Noch <strong>{{ alert.missing }} Einheit{{ alert.missing !== 1 ? 'en' : '' }}</strong>
            fur "{{ alert.name }}" diese Woche.
          </div>
        </div>
      </div>

      <!-- Month check alert -->
      <div
        v-if="monthAlerts.length > 0 && !habitsStore.todayExceptionDay"
        class="alert-section animate-slide-up"
        style="animation-delay:0.25s"
      >
        <div class="section-title">Monatscheck</div>
        <div class="alert-card card" v-for="alert in monthAlerts" :key="alert.habitId">
          <div class="alert-icon">📅</div>
          <div class="alert-text">
            Noch <strong>{{ alert.missing }} Einheit{{ alert.missing !== 1 ? 'en' : '' }}</strong>
            fur "{{ alert.name }}" diesen Monat.
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import HabitCard from '@/components/habits/HabitCard.vue'
import { useHabitsStore } from '@/stores/habits'
import { useGamificationStore } from '@/stores/gamification'
import { today, getDayName, formatDate, isWeekend, daysRemainingInWeek } from '@/utils/date'

const habitsStore = useHabitsStore()
const gamificationStore = useGamificationStore()

const todayStr = today()
const dayName = getDayName(todayStr)
const formattedDate = formatDate(todayStr)

const todayProgress = computed(() => habitsStore.getTodayProgress())

const ringPercent = computed(() => {
  const { completed, total } = todayProgress.value
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
})

const totalXpToday = computed(() => {
  const events = gamificationStore.recentXPEvents
  const todayTs = new Date(todayStr + 'T00:00:00').getTime()
  return events
    .filter(e => e.timestamp >= todayTs)
    .reduce((sum, e) => sum + e.amount, 0)
})

function toggleExceptionDay(): void {
  if (habitsStore.todayExceptionDay) {
    habitsStore.removeExceptionDay(todayStr)
  } else {
    habitsStore.setExceptionDay(todayStr)
  }
}

const daysLeft = daysRemainingInWeek()

const weekAlerts = computed(() => {
  if (!isWeekend(todayStr) && daysLeft > 1) return []
  return habitsStore.activeHabits
    .map(h => ({
      habitId: h.id,
      name: h.name,
      missing: Math.max(0, h.weeklyMinGoal - habitsStore.getWeeklyCount(h.id)),
    }))
    .filter(a => a.missing > 0)
})

const monthAlerts = computed(() => {
  const d = new Date()
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
  const remaining = lastDay - d.getDate()
  if (remaining > 3) return []
  return habitsStore.activeHabits
    .map(h => ({
      habitId: h.id,
      name: h.name,
      missing: Math.max(0, h.monthlyMinGoal - habitsStore.getMonthlyCount(h.id)),
    }))
    .filter(a => a.missing > 0)
})
</script>

<style scoped>
.date-section {
  margin-bottom: 16px;
}

.date-main {
  font-size: 26px;
  font-weight: 900;
  color: var(--text-primary);
  letter-spacing: -0.03em;
  margin-bottom: 4px;
}

.progress-text {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
}

.exception-badge {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-warning);
  background: var(--color-warning-light);
  padding: 3px 10px;
  border-radius: var(--radius-full);
}

.overview-card {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 16px;
  padding: 16px 20px;
}

.overview-ring-area {
  flex-shrink: 0;
}

.ring-svg {
  width: 80px;
  height: 80px;
}

.ring-text {
  fill: var(--text-primary);
}

.overview-stats {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0;
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 22px;
  font-weight: 900;
  color: var(--text-primary);
  letter-spacing: -0.03em;
}

.stat-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-divider {
  width: 1px;
  height: 32px;
  background: var(--border);
}

.exception-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px 16px;
  border-radius: var(--radius-sm);
  border: 1.5px dashed var(--border);
  background: transparent;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 8px;
  -webkit-tap-highlight-color: transparent;
}

.exception-btn.active {
  background: var(--color-warning-light);
  border-color: var(--color-warning);
  color: var(--color-warning);
  border-style: solid;
}

.exception-icon {
  font-size: 16px;
}

.habits-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.alert-section {
  margin-top: 24px;
}

.alert-card {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  padding: 12px 14px;
  background: var(--color-warning-light);
  border-color: var(--color-warning-light);
}

.alert-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.alert-text {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.4;
}

.alert-text strong {
  color: var(--text-primary);
}
</style>
