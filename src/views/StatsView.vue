<template>
  <div class="page">
    <div class="page-content">

      <!-- XP Overview -->
      <div class="xp-card card animate-slide-up">
        <div class="xp-card-top">
          <div class="xp-level-display">
            <div class="xp-level-circle">{{ profile.level }}</div>
            <div>
              <div class="xp-level-label">Level</div>
              <div class="xp-total-label">{{ profile.totalXP.toLocaleString('de') }} XP gesamt</div>
            </div>
          </div>
          <div class="xp-next">
            <div class="xp-next-label">Nachstes Level</div>
            <div class="xp-next-value">noch {{ levelInfo.xpForNextLevel - levelInfo.currentXP }} XP</div>
          </div>
        </div>
        <div class="xp-bar-track">
          <div class="xp-bar-fill" :style="{ width: xpProgress + '%' }"/>
        </div>
        <div class="xp-bar-labels">
          <span>{{ levelInfo.currentXP }} XP</span>
          <span>{{ levelInfo.xpForNextLevel }} XP</span>
        </div>
      </div>

      <!-- Longest streak -->
      <div class="stats-row animate-slide-up" style="animation-delay:0.05s">
        <div class="stat-card card">
          <div class="stat-card-icon">🔥</div>
          <div class="stat-card-value">{{ longestStreak }}</div>
          <div class="stat-card-label">Langster Streak</div>
        </div>
        <div class="stat-card card">
          <div class="stat-card-icon">✅</div>
          <div class="stat-card-value">{{ totalCompletions }}</div>
          <div class="stat-card-label">Gesamt erledigt</div>
        </div>
        <div class="stat-card card">
          <div class="stat-card-icon">🎯</div>
          <div class="stat-card-value">{{ weeklyGoalsMet }}</div>
          <div class="stat-card-label">Wochenziele</div>
        </div>
      </div>

      <!-- Last 7 days heatmap -->
      <div class="section-title" style="margin-top:24px">Letzte 7 Tage</div>
      <div class="week-grid card animate-slide-up" style="animation-delay:0.1s">
        <div
          v-for="d in last7Days"
          :key="d.date"
          class="day-cell"
          :class="{ today: d.isToday, exception: d.isException }"
        >
          <div class="day-name">{{ d.shortName }}</div>
          <div
            class="day-bar-outer"
            :title="`${d.completed}/${d.total} erledigt`"
          >
            <div
              class="day-bar-inner"
              :style="{
                height: d.total > 0 ? (d.completed / d.total * 100) + '%' : '0%',
                background: d.isException ? 'var(--color-warning)' : 'var(--color-primary)'
              }"
            />
          </div>
          <div class="day-count">
            <span v-if="d.isException">—</span>
            <span v-else>{{ d.completed }}</span>
          </div>
        </div>
      </div>

      <!-- Per-habit stats -->
      <div class="section-title" style="margin-top:24px">Pro Gewohnheit</div>
      <div
        v-for="(habit, i) in habitsStore.activeHabits"
        :key="habit.id"
        class="habit-stat-card card animate-slide-up"
        :style="{ animationDelay: `${0.12 + i * 0.05}s` }"
      >
        <div class="habit-stat-header">
          <span class="habit-stat-icon">{{ habit.icon }}</span>
          <span class="habit-stat-name">{{ habit.name }}</span>
          <span class="streak-chip" v-if="getStreak(habit.id) > 0">
            🔥 {{ getStreak(habit.id) }}
          </span>
        </div>
        <div class="habit-stat-bars">
          <div class="mini-stat">
            <div class="mini-stat-label">Woche</div>
            <div class="mini-bar-track">
              <div
                class="mini-bar-fill"
                :style="{
                  width: weekPercent(habit) + '%',
                  background: habit.color
                }"
              />
            </div>
            <div class="mini-stat-count">{{ habitsStore.getWeeklyCount(habit.id) }}/{{ habit.weeklyMinGoal }}</div>
          </div>
          <div class="mini-stat">
            <div class="mini-stat-label">Monat</div>
            <div class="mini-bar-track">
              <div
                class="mini-bar-fill"
                :style="{
                  width: monthPercent(habit) + '%',
                  background: habit.color
                }"
              />
            </div>
            <div class="mini-stat-count">{{ habitsStore.getMonthlyCount(habit.id) }}/{{ habit.monthlyMinGoal }}</div>
          </div>
        </div>
      </div>

      <!-- Achievements -->
      <div class="section-title" style="margin-top:24px">Achievements ({{ unlockedCount }}/{{ ACHIEVEMENTS.length }})</div>
      <div class="achievements-grid animate-slide-up" style="animation-delay:0.15s">
        <div
          v-for="a in ACHIEVEMENTS"
          :key="a.id"
          class="achievement-chip"
          :class="{ locked: !gamificationStore.isUnlocked(a.id) }"
          :title="a.description"
        >
          <span class="ach-icon">{{ gamificationStore.isUnlocked(a.id) ? a.icon : '🔒' }}</span>
          <span class="ach-name">{{ a.name }}</span>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Habit } from '@/types'
import { useHabitsStore } from '@/stores/habits'
import { useGamificationStore } from '@/stores/gamification'
import { getLast7Days, getDayName, today, getMonthKey, getDatesInMonth } from '@/utils/date'
import { ACHIEVEMENTS } from '@/utils/xp'

const habitsStore = useHabitsStore()
const gamificationStore = useGamificationStore()

const { profile, levelInfo, xpProgress } = gamificationStore

const longestStreak = computed(() => {
  return Math.max(
    profile.longestStreak,
    ...habitsStore.activeHabits.map(h => habitsStore.getStreak(h.id))
  )
})

const totalCompletions = computed(() =>
  habitsStore.activeHabits.reduce((s, h) => s + habitsStore.getTotalCompletions(h.id), 0)
)

const weeklyGoalsMet = computed(() =>
  habitsStore.activeHabits.filter(
    h => habitsStore.getWeeklyCount(h.id) >= h.weeklyMinGoal
  ).length
)

const todayStr = today()

const last7Days = computed(() => {
  const dates = getLast7Days()
  return dates.map(date => ({
    date,
    shortName: getDayName(date, true).substring(0, 2),
    isToday: date === todayStr,
    isException: habitsStore.isExceptionDay(date),
    total: habitsStore.activeHabits.length,
    completed: habitsStore.activeHabits.filter(h =>
      habitsStore.completions.some(c => c.habitId === h.id && c.date === date)
    ).length,
  }))
})

function getStreak(habitId: string): number {
  return habitsStore.getStreak(habitId)
}

function weekPercent(habit: Habit): number {
  return Math.min(100, (habitsStore.getWeeklyCount(habit.id) / habit.weeklyMinGoal) * 100)
}

function monthPercent(habit: Habit): number {
  return Math.min(100, (habitsStore.getMonthlyCount(habit.id) / habit.monthlyMinGoal) * 100)
}

const unlockedCount = computed(() =>
  ACHIEVEMENTS.filter(a => gamificationStore.isUnlocked(a.id)).length
)
</script>

<style scoped>
.xp-card {
  padding: 20px;
  margin-bottom: 0;
}

.xp-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.xp-level-display {
  display: flex;
  align-items: center;
  gap: 12px;
}

.xp-level-circle {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  color: white;
  font-size: 20px;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
}

.xp-level-label {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 600;
  text-transform: uppercase;
}

.xp-total-label {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
}

.xp-next {
  text-align: right;
}

.xp-next-label {
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 600;
}

.xp-next-value {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-primary);
}

.xp-bar-track {
  height: 10px;
  background: var(--color-primary-light);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: 6px;
}

.xp-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
  border-radius: var(--radius-full);
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.xp-bar-labels {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 600;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 14px;
}

.stat-card {
  text-align: center;
  padding: 16px 8px;
}

.stat-card-icon {
  font-size: 22px;
  margin-bottom: 6px;
}

.stat-card-value {
  font-size: 24px;
  font-weight: 900;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.stat-card-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  margin-top: 2px;
}

.week-grid {
  display: flex;
  justify-content: space-between;
  gap: 6px;
  padding: 16px;
}

.day-cell {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.day-cell.today .day-name {
  color: var(--color-primary);
  font-weight: 800;
}

.day-name {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
}

.day-bar-outer {
  width: 100%;
  height: 60px;
  background: var(--bg-card-2);
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.day-bar-inner {
  width: 100%;
  border-radius: 4px;
  transition: height 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.day-count {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-secondary);
}

.habit-stat-card {
  margin-bottom: 10px;
  padding: 14px;
}

.habit-stat-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.habit-stat-icon {
  font-size: 18px;
}

.habit-stat-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  flex: 1;
}

.streak-chip {
  font-size: 12px;
  font-weight: 700;
  color: #f97316;
}

.habit-stat-bars {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mini-stat {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mini-stat-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  width: 40px;
  text-transform: uppercase;
}

.mini-bar-track {
  flex: 1;
  height: 6px;
  background: var(--bg-card-2);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.mini-bar-fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.mini-stat-count {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-secondary);
  min-width: 36px;
  text-align: right;
}

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.achievement-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  border: 1.5px solid var(--border);
  transition: all 0.2s;
}

.achievement-chip.locked {
  opacity: 0.45;
  filter: grayscale(1);
}

.ach-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.ach-name {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-primary);
}
</style>
