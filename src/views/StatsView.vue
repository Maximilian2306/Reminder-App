<template>
  <div class="page">
    <div class="page-content">

      <!-- Tab bar -->
      <div class="tab-bar animate-fade-in">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-btn"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >{{ tab.label }}</button>
      </div>

      <!-- OVERVIEW TAB -->
      <template v-if="activeTab === 'overview'">
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
              <div class="xp-next-label">Nächstes Level</div>
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

        <div class="stats-row animate-slide-up" style="animation-delay:0.05s">
          <div class="stat-card card">
            <div class="stat-card-icon">&#x1f525;</div>
            <div class="stat-card-value">{{ longestStreak }}</div>
            <div class="stat-card-label">Längster Streak</div>
          </div>
          <div class="stat-card card">
            <div class="stat-card-icon">&#x2705;</div>
            <div class="stat-card-value">{{ totalCompletions }}</div>
            <div class="stat-card-label">Gesamt erledigt</div>
          </div>
          <div class="stat-card card">
            <div class="stat-card-icon">&#x1f3af;</div>
            <div class="stat-card-value">{{ weeklyGoalsMet }}</div>
            <div class="stat-card-label">Wochenziele</div>
          </div>
        </div>

        <div class="section-title" style="margin-top:24px">Letzte 7 Tage</div>
        <div class="week-grid card animate-slide-up" style="animation-delay:0.1s">
          <div
            v-for="d in last7Days"
            :key="d.date"
            class="day-cell"
            :class="{ today: d.isToday, exception: d.isException }"
          >
            <div class="day-name">{{ d.shortName }}</div>
            <div class="day-bar-outer" :title="`${d.completed}/${d.total} erledigt`">
              <div
                class="day-bar-inner"
                :style="{
                  height: d.total > 0 ? (d.completed / d.total * 100) + '%' : '0%',
                  background: d.isException ? 'var(--color-warning)' : 'var(--color-primary)'
                }"
              />
            </div>
            <div class="day-count">
              <span v-if="d.isException">&mdash;</span>
              <span v-else>{{ d.completed }}</span>
            </div>
          </div>
        </div>

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
              &#x1f525; {{ getStreak(habit.id) }}
            </span>
          </div>
          <div class="habit-stat-bars">
            <div class="mini-stat">
              <div class="mini-stat-label">Woche</div>
              <div class="mini-bar-track">
                <div
                  class="mini-bar-fill"
                  :style="{ width: weekPercent(habit) + '%', background: habit.color }"
                />
              </div>
              <div class="mini-stat-count">{{ habitsStore.getWeeklyCount(habit.id) }}/{{ habit.weeklyMinGoal }}</div>
            </div>
            <div class="mini-stat">
              <div class="mini-stat-label">Monat</div>
              <div class="mini-bar-track">
                <div
                  class="mini-bar-fill"
                  :style="{ width: monthPercent(habit) + '%', background: habit.color }"
                />
              </div>
              <div class="mini-stat-count">{{ habitsStore.getMonthlyCount(habit.id) }}/{{ habit.monthlyMinGoal }}</div>
            </div>
          </div>
        </div>

        <div class="section-title" style="margin-top:24px">Achievements ({{ unlockedCount }}/{{ ACHIEVEMENTS.length }})</div>
        <div class="achievements-grid animate-slide-up" style="animation-delay:0.15s">
          <div
            v-for="a in ACHIEVEMENTS"
            :key="a.id"
            class="achievement-chip"
            :class="{ locked: !gamificationStore.isUnlocked(a.id) }"
            :title="a.description"
          >
            <span class="ach-icon">{{ gamificationStore.isUnlocked(a.id) ? a.icon : '&#x1f512;' }}</span>
            <span class="ach-name">{{ a.name }}</span>
          </div>
        </div>
      </template>

      <!-- WEEK TAB -->
      <template v-if="activeTab === 'week'">
        <div class="view-nav animate-fade-in">
          <button class="nav-arrow" @click="shiftWeek(-1)">&larr;</button>
          <div class="view-nav-title">{{ weekLabel }}</div>
          <button class="nav-arrow" @click="shiftWeek(1)" :disabled="weekOffset >= 0">&rarr;</button>
        </div>

        <div class="goal-pills animate-slide-up" style="animation-delay:0.04s">
          <div
            v-for="habit in habitsStore.activeHabits"
            :key="habit.id"
            class="goal-pill"
            :class="{ done: weekHabitCount(habit.id) >= habit.weeklyMinGoal }"
          >
            <span class="goal-pill-icon">{{ habit.icon }}</span>
            <span class="goal-pill-text">{{ weekHabitCount(habit.id) }}/{{ habit.weeklyMinGoal }}</span>
          </div>
        </div>

        <div class="calendar-week card animate-slide-up" style="animation-delay:0.08s">
          <div class="cal-header-row">
            <div v-for="name in weekDayNames" :key="name" class="cal-header-cell">{{ name }}</div>
          </div>
          <div class="cal-week-row">
            <div
              v-for="d in currentWeekDays"
              :key="d.date"
              class="cal-day"
              :class="{
                'is-today': d.date === todayStr,
                'is-exception': d.isException,
                'has-completions': d.completed > 0,
                'all-done': d.completed >= d.total && d.total > 0,
              }"
            >
              <div class="cal-day-num">{{ d.dayNum }}</div>
              <div class="cal-day-dots">
                <span
                  v-for="n in d.total"
                  :key="n"
                  class="cal-dot"
                  :class="{ filled: n <= d.completed }"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="section-title" style="margin-top:20px">Details</div>
        <div
          v-for="d in currentWeekDays"
          :key="'detail-' + d.date"
          class="week-detail-row card animate-slide-up"
        >
          <div class="week-detail-date" :class="{ 'is-today': d.date === todayStr }">
            {{ d.shortName }} {{ d.dayNum }}.
          </div>
          <div class="week-detail-habits">
            <span
              v-for="habit in habitsStore.activeHabits"
              :key="habit.id"
              class="week-detail-dot"
              :class="{ completed: isCompletedOnDate(habit.id, d.date) }"
              :style="{ background: isCompletedOnDate(habit.id, d.date) ? habit.color : undefined }"
              :title="habit.name"
            >{{ habit.icon }}</span>
          </div>
        </div>
      </template>

      <!-- MONTH TAB -->
      <template v-if="activeTab === 'month'">
        <div class="view-nav animate-fade-in">
          <button class="nav-arrow" @click="shiftMonth(-1)">&larr;</button>
          <div class="view-nav-title">{{ monthLabel }}</div>
          <button class="nav-arrow" @click="shiftMonth(1)" :disabled="monthOffset >= 0">&rarr;</button>
        </div>

        <div class="goal-pills animate-slide-up" style="animation-delay:0.04s">
          <div
            v-for="habit in habitsStore.activeHabits"
            :key="habit.id"
            class="goal-pill"
            :class="{ done: monthHabitCount(habit.id) >= habit.monthlyMinGoal }"
          >
            <span class="goal-pill-icon">{{ habit.icon }}</span>
            <span class="goal-pill-text">{{ monthHabitCount(habit.id) }}/{{ habit.monthlyMinGoal }}</span>
          </div>
        </div>

        <div class="calendar-month card animate-slide-up" style="animation-delay:0.08s">
          <div class="cal-header-row">
            <div v-for="name in weekDayNames" :key="name" class="cal-header-cell">{{ name }}</div>
          </div>
          <div class="cal-month-grid">
            <div
              v-for="(cell, idx) in monthCalendarCells"
              :key="idx"
              class="cal-day"
              :class="{
                empty: !cell,
                'is-today': cell?.date === todayStr,
                'is-exception': cell?.isException,
                'has-completions': cell && cell.completed > 0,
                'all-done': cell && cell.completed >= cell.total && cell.total > 0,
              }"
            >
              <template v-if="cell">
                <div class="cal-day-num">{{ cell.dayNum }}</div>
                <div class="cal-day-indicator">
                  <div
                    v-if="cell.total > 0"
                    class="cal-fill-ring"
                    :style="{ '--fill-pct': (cell.completed / cell.total * 100) + '%' }"
                  />
                </div>
              </template>
            </div>
          </div>
        </div>

        <div class="section-title" style="margin-top:20px">Gewohnheiten</div>
        <div
          v-for="habit in habitsStore.activeHabits"
          :key="habit.id"
          class="month-habit-card card animate-slide-up"
        >
          <div class="month-habit-header">
            <span>{{ habit.icon }} {{ habit.name }}</span>
            <span class="month-habit-count" :class="{ done: monthHabitCount(habit.id) >= habit.monthlyMinGoal }">
              {{ monthHabitCount(habit.id) }}/{{ habit.monthlyMinGoal }}
            </span>
          </div>
          <div class="mini-bar-track" style="height:6px">
            <div
              class="mini-bar-fill"
              :style="{ width: Math.min(100, monthHabitCount(habit.id) / habit.monthlyMinGoal * 100) + '%', background: habit.color }"
            />
          </div>
        </div>
      </template>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Habit } from '@/types'
import { useHabitsStore } from '@/stores/habits'
import { useGamificationStore } from '@/stores/gamification'
import { getLast7Days, getDayName, today, getWeekStart, getMonthKey, getDatesInWeek, getDatesInMonth, toDateString } from '@/utils/date'
import { ACHIEVEMENTS } from '@/utils/xp'

const habitsStore = useHabitsStore()
const gamificationStore = useGamificationStore()

const { profile, levelInfo, xpProgress } = gamificationStore

const tabs = [
  { key: 'overview', label: 'Überblick' },
  { key: 'week', label: 'Woche' },
  { key: 'month', label: 'Monat' },
] as const

type TabKey = typeof tabs[number]['key']
const activeTab = ref<TabKey>('overview')

const todayStr = today()
const weekDayNames = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

// --- OVERVIEW ---

const longestStreak = computed(() =>
  Math.max(profile.longestStreak, ...habitsStore.activeHabits.map(h => habitsStore.getStreak(h.id)))
)

const totalCompletions = computed(() =>
  habitsStore.activeHabits.reduce((s, h) => s + habitsStore.getTotalCompletions(h.id), 0)
)

const weeklyGoalsMet = computed(() =>
  habitsStore.activeHabits.filter(h => habitsStore.getWeeklyCount(h.id) >= h.weeklyMinGoal).length
)

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

// --- WEEK VIEW ---

const weekOffset = ref(0)

function shiftWeek(dir: number): void {
  if (dir > 0 && weekOffset.value >= 0) return
  weekOffset.value += dir
}

const currentWeekStart = computed(() => {
  const d = new Date()
  d.setDate(d.getDate() + weekOffset.value * 7)
  return getWeekStart(toDateString(d))
})

const weekLabel = computed(() => {
  const dates = getDatesInWeek(currentWeekStart.value)
  const first = new Date(dates[0] + 'T00:00:00')
  const last = new Date(dates[6] + 'T00:00:00')
  const fmt = (d: Date) => d.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })
  return `${fmt(first)} – ${fmt(last)}`
})

const currentWeekDays = computed(() => {
  const dates = getDatesInWeek(currentWeekStart.value)
  return dates.map(date => ({
    date,
    dayNum: parseInt(date.split('-')[2]),
    shortName: getDayName(date, true).substring(0, 2),
    isException: habitsStore.isExceptionDay(date),
    total: habitsStore.activeHabits.length,
    completed: habitsStore.activeHabits.filter(h =>
      habitsStore.completions.some(c => c.habitId === h.id && c.date === date)
    ).length,
  }))
})

function weekHabitCount(habitId: string): number {
  return habitsStore.getWeeklyCount(habitId, currentWeekStart.value)
}

function isCompletedOnDate(habitId: string, date: string): boolean {
  return habitsStore.completions.some(c => c.habitId === habitId && c.date === date)
}

// --- MONTH VIEW ---

const monthOffset = ref(0)

function shiftMonth(dir: number): void {
  if (dir > 0 && monthOffset.value >= 0) return
  monthOffset.value += dir
}

const currentMonthKey = computed(() => {
  const d = new Date()
  d.setMonth(d.getMonth() + monthOffset.value)
  return getMonthKey(toDateString(d))
})

const monthLabel = computed(() => {
  const [year, month] = currentMonthKey.value.split('-').map(Number)
  const d = new Date(year, month - 1, 1)
  return d.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })
})

function monthHabitCount(habitId: string): number {
  return habitsStore.getMonthlyCount(habitId, currentMonthKey.value)
}

const monthCalendarCells = computed(() => {
  const dates = getDatesInMonth(currentMonthKey.value)
  const firstDay = new Date(dates[0] + 'T00:00:00')
  let startDay = firstDay.getDay()
  startDay = startDay === 0 ? 6 : startDay - 1

  const cells: (null | { date: string; dayNum: number; isException: boolean; total: number; completed: number })[] = []

  for (let i = 0; i < startDay; i++) cells.push(null)

  for (const date of dates) {
    cells.push({
      date,
      dayNum: parseInt(date.split('-')[2]),
      isException: habitsStore.isExceptionDay(date),
      total: habitsStore.activeHabits.length,
      completed: habitsStore.activeHabits.filter(h =>
        habitsStore.completions.some(c => c.habitId === h.id && c.date === date)
      ).length,
    })
  }

  while (cells.length % 7 !== 0) cells.push(null)

  return cells
})
</script>

<style scoped>
/* Tab bar */
.tab-bar {
  display: flex;
  gap: 4px;
  background: var(--bg-card);
  border-radius: var(--radius-sm);
  padding: 4px;
  margin-bottom: 16px;
  border: 1.5px solid var(--border);
}

.tab-btn {
  flex: 1;
  padding: 8px 0;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn.active {
  background: var(--color-primary);
  color: white;
}

/* View nav (week/month arrows) */
.view-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.view-nav-title {
  font-size: 16px;
  font-weight: 800;
  color: var(--text-primary);
  text-transform: capitalize;
}

.nav-arrow {
  width: 36px;
  height: 36px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-arrow:disabled {
  opacity: 0.3;
  cursor: default;
}

/* Goal pills */
.goal-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
}

.goal-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  background: var(--bg-card);
  border: 1.5px solid var(--border);
  font-size: 13px;
  font-weight: 700;
  color: var(--text-secondary);
}

.goal-pill.done {
  border-color: var(--color-success);
  background: color-mix(in srgb, var(--color-success) 12%, transparent);
  color: var(--color-success);
}

.goal-pill-icon {
  font-size: 14px;
}

.goal-pill-text {
  font-variant-numeric: tabular-nums;
}

/* Calendar shared */
.cal-header-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  margin-bottom: 4px;
}

.cal-header-cell {
  text-align: center;
  font-size: 11px;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  padding: 4px 0;
}

/* Week calendar */
.calendar-week {
  padding: 12px;
}

.cal-week-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

/* Month calendar */
.calendar-month {
  padding: 12px;
}

.cal-month-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 3px;
}

/* Calendar day cell */
.cal-day {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  position: relative;
  gap: 2px;
}

.cal-day.empty {
  visibility: hidden;
}

.cal-day-num {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-secondary);
}

.cal-day.is-today .cal-day-num {
  color: var(--color-primary);
  font-weight: 900;
}

.cal-day.is-today {
  background: var(--color-primary-light);
}

.cal-day.is-exception {
  opacity: 0.5;
}

.cal-day.all-done {
  background: color-mix(in srgb, var(--color-success) 15%, transparent);
}

.cal-day.all-done .cal-day-num {
  color: var(--color-success);
}

/* Dots for week view */
.cal-day-dots {
  display: flex;
  gap: 2px;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 32px;
}

.cal-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--border);
}

.cal-dot.filled {
  background: var(--color-primary);
}

/* Fill ring for month view */
.cal-day-indicator {
  width: 8px;
  height: 3px;
  border-radius: 2px;
  background: var(--border);
  overflow: hidden;
}

.cal-fill-ring {
  height: 100%;
  width: var(--fill-pct);
  background: var(--color-primary);
  border-radius: 2px;
  transition: width 0.3s;
}

/* Week detail rows */
.week-detail-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  margin-bottom: 6px;
}

.week-detail-date {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-secondary);
  min-width: 52px;
}

.week-detail-date.is-today {
  color: var(--color-primary);
}

.week-detail-habits {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.week-detail-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  background: var(--bg-card-2);
  border: 1.5px solid var(--border);
  opacity: 0.35;
}

.week-detail-dot.completed {
  opacity: 1;
  border-color: transparent;
  color: white;
}

/* Month habit cards */
.month-habit-card {
  padding: 12px 14px;
  margin-bottom: 8px;
}

.month-habit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
}

.month-habit-count {
  font-variant-numeric: tabular-nums;
  color: var(--text-muted);
}

.month-habit-count.done {
  color: var(--color-success);
}

/* ---- OVERVIEW STYLES (kept from original) ---- */
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

.xp-next { text-align: right; }

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

.stat-card-icon { font-size: 22px; margin-bottom: 6px; }

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

.day-cell.today .day-name { color: var(--color-primary); font-weight: 800; }

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

.habit-stat-icon { font-size: 18px; }

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
