import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Habit, HabitCompletion, ExceptionDay } from '@/types'
import { today, getWeekStart, getMonthKey, getDatesInWeek, getDatesInMonth } from '@/utils/date'
import { useGamificationStore } from './gamification'

const STORAGE_KEY = 'habit-tracker-habits'
const COMPLETIONS_KEY = 'habit-tracker-completions'
const EXCEPTIONS_KEY = 'habit-tracker-exceptions'

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function saveToStorage<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

export const useHabitsStore = defineStore('habits', () => {
  const habits = ref<Habit[]>(loadFromStorage(STORAGE_KEY, []))
  const completions = ref<HabitCompletion[]>(loadFromStorage(COMPLETIONS_KEY, []))
  const exceptionDays = ref<ExceptionDay[]>(loadFromStorage(EXCEPTIONS_KEY, []))

  function persist(): void {
    saveToStorage(STORAGE_KEY, habits.value)
    saveToStorage(COMPLETIONS_KEY, completions.value)
    saveToStorage(EXCEPTIONS_KEY, exceptionDays.value)
  }

  const activeHabits = computed(() => habits.value.filter(h => h.isActive))

  const todayDate = computed(() => today())

  const todayExceptionDay = computed(() =>
    exceptionDays.value.find(e => e.date === todayDate.value) ?? null
  )

  const todayCompletions = computed(() =>
    completions.value.filter(c => c.date === todayDate.value)
  )

  function isCompletedToday(habitId: string): boolean {
    return todayCompletions.value.some(c => c.habitId === habitId)
  }

  function getCompletionsForDate(habitId: string, date: string): HabitCompletion[] {
    return completions.value.filter(c => c.habitId === habitId && c.date === date)
  }

  function getWeeklyCount(habitId: string, weekStart?: string): number {
    const ws = weekStart ?? getWeekStart(today())
    const dates = getDatesInWeek(ws)
    return completions.value.filter(c => c.habitId === habitId && dates.includes(c.date)).length
  }

  function getMonthlyCount(habitId: string, monthKey?: string): number {
    const mk = monthKey ?? getMonthKey(today())
    const dates = getDatesInMonth(mk)
    return completions.value.filter(c => c.habitId === habitId && dates.includes(c.date)).length
  }

  function getStreak(habitId: string): number {
    let streak = 0
    const d = new Date()
    const exDates = new Set(exceptionDays.value.map(e => e.date))

    while (true) {
      const dateStr = d.toISOString().split('T')[0]
      if (exDates.has(dateStr)) {
        d.setDate(d.getDate() - 1)
        continue
      }
      const hasCompletion = completions.value.some(c => c.habitId === habitId && c.date === dateStr)
      if (!hasCompletion) break
      streak++
      d.setDate(d.getDate() - 1)
    }
    return streak
  }

  function getTotalCompletions(habitId: string): number {
    return completions.value.filter(c => c.habitId === habitId).length
  }

  async function completeHabit(habitId: string): Promise<void> {
    if (isCompletedToday(habitId)) return

    const completion: HabitCompletion = {
      id: crypto.randomUUID(),
      habitId,
      date: todayDate.value,
      completedAt: new Date().toISOString(),
    }
    completions.value = [...completions.value, completion]
    persist()

    const gamification = useGamificationStore()
    const habit = habits.value.find(h => h.id === habitId)
    if (!habit) return

    gamification.addXP(15, `Gewohnheit abgeschlossen: ${habit.name}`)

    const weeklyCount = getWeeklyCount(habitId)
    if (weeklyCount === habit.weeklyMinGoal) {
      gamification.addXP(75, `Wochenziel erreicht: ${habit.name}`)
      gamification.tryUnlockAchievement('weekly_goal_1', completions.value.length)
    }

    const monthlyCount = getMonthlyCount(habitId)
    if (monthlyCount === habit.monthlyMinGoal) {
      gamification.addXP(200, `Monatsziel erreicht: ${habit.name}`)
      gamification.tryUnlockAchievement('monthly_goal_1', completions.value.length)
    }

    const total = getTotalCompletions(habitId)
    if (total === 1) gamification.tryUnlockAchievement('first_habit', total)
    if (total === 50) gamification.tryUnlockAchievement('total_50', total)
    if (total === 200) gamification.tryUnlockAchievement('total_200', total)

    const streak = getStreak(habitId)
    if (streak === 3) gamification.tryUnlockAchievement('streak_3', streak)
    if (streak === 7) gamification.tryUnlockAchievement('streak_7', streak)
    if (streak === 30) gamification.tryUnlockAchievement('streak_30', streak)
  }

  function uncompleteHabit(habitId: string): void {
    completions.value = completions.value.filter(
      c => !(c.habitId === habitId && c.date === todayDate.value)
    )
    persist()
  }

  function addHabit(data: Omit<Habit, 'id' | 'createdAt' | 'isActive'>): Habit {
    const habit: Habit = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      isActive: true,
    }
    habits.value = [...habits.value, habit]
    persist()
    return habit
  }

  function updateHabit(id: string, data: Partial<Omit<Habit, 'id' | 'createdAt'>>): void {
    habits.value = habits.value.map(h => (h.id === id ? { ...h, ...data } : h))
    persist()
  }

  function deleteHabit(id: string): void {
    habits.value = habits.value.filter(h => h.id !== id)
    completions.value = completions.value.filter(c => c.habitId !== id)
    persist()
  }

  function setExceptionDay(date: string, reason?: string): void {
    if (exceptionDays.value.some(e => e.date === date)) return
    exceptionDays.value = [...exceptionDays.value, { date, reason }]
    persist()
  }

  function removeExceptionDay(date: string): void {
    exceptionDays.value = exceptionDays.value.filter(e => e.date !== date)
    persist()
  }

  function isExceptionDay(date: string): boolean {
    return exceptionDays.value.some(e => e.date === date)
  }

  function getTodayProgress(): { completed: number; total: number } {
    const total = activeHabits.value.length
    const completed = activeHabits.value.filter(h => isCompletedToday(h.id)).length
    return { completed, total }
  }

  return {
    habits,
    completions,
    exceptionDays,
    activeHabits,
    todayDate,
    todayExceptionDay,
    todayCompletions,
    isCompletedToday,
    getCompletionsForDate,
    getWeeklyCount,
    getMonthlyCount,
    getStreak,
    getTotalCompletions,
    completeHabit,
    uncompleteHabit,
    addHabit,
    updateHabit,
    deleteHabit,
    setExceptionDay,
    removeExceptionDay,
    isExceptionDay,
    getTodayProgress,
  }
})
