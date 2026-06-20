import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserProfile, UnlockedAchievement } from '@/types'
import { levelFromTotalXP, progressPercent, ACHIEVEMENTS } from '@/utils/xp'

const STORAGE_KEY = 'habit-tracker-gamification'

function loadProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as UserProfile
  } catch { /* empty */ }
  return {
    level: 1,
    currentXP: 0,
    totalXP: 0,
    unlockedAchievements: [],
    longestStreak: 0,
  }
}

export interface XPEvent {
  id: string
  amount: number
  reason: string
  timestamp: number
}

export interface ToastAchievement {
  id: string
  name: string
  icon: string
  xpReward: number
}

export const useGamificationStore = defineStore('gamification', () => {
  const profile = ref<UserProfile>(loadProfile())
  const recentXPEvents = ref<XPEvent[]>([])
  const toastQueue = ref<ToastAchievement[]>([])
  const showLevelUp = ref(false)
  const newLevel = ref(0)

  function persist(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile.value))
  }

  const levelInfo = computed(() => levelFromTotalXP(profile.value.totalXP))

  const xpProgress = computed(() =>
    progressPercent(levelInfo.value.currentXP, levelInfo.value.xpForNextLevel)
  )

  function addXP(amount: number, reason: string): void {
    const previousLevel = levelInfo.value.level
    profile.value = {
      ...profile.value,
      totalXP: profile.value.totalXP + amount,
      currentXP: levelInfo.value.currentXP + amount,
    }

    const info = levelFromTotalXP(profile.value.totalXP)
    profile.value = {
      ...profile.value,
      level: info.level,
      currentXP: info.currentXP,
    }

    recentXPEvents.value = [
      ...recentXPEvents.value.slice(-9),
      { id: crypto.randomUUID(), amount, reason, timestamp: Date.now() },
    ]

    if (info.level > previousLevel) {
      newLevel.value = info.level
      showLevelUp.value = true
      tryUnlockAchievement(`level_${info.level}`, info.level)
    }

    persist()
  }

  function removeXP(amount: number): void {
    profile.value = {
      ...profile.value,
      totalXP: Math.max(0, profile.value.totalXP - amount),
    }
    const info = levelFromTotalXP(profile.value.totalXP)
    profile.value = {
      ...profile.value,
      level: info.level,
      currentXP: info.currentXP,
    }
    persist()
  }

  function resetXP(): void {
    profile.value = {
      level: 1,
      currentXP: 0,
      totalXP: 0,
      unlockedAchievements: [],
      longestStreak: 0,
    }
    recentXPEvents.value = []
    persist()
  }

  function tryUnlockAchievement(achievementId: string, value: number): void {
    if (profile.value.unlockedAchievements.some(a => a.achievementId === achievementId)) return

    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId)
    if (!achievement) return

    const unlocked: UnlockedAchievement = {
      achievementId,
      unlockedAt: new Date().toISOString(),
    }
    profile.value = {
      ...profile.value,
      unlockedAchievements: [...profile.value.unlockedAchievements, unlocked],
    }

    toastQueue.value = [
      ...toastQueue.value,
      { id: achievementId, name: achievement.name, icon: achievement.icon, xpReward: achievement.xpReward },
    ]

    addXP(achievement.xpReward, `Achievement: ${achievement.name}`)
    persist()
  }

  function dismissToast(): void {
    toastQueue.value = toastQueue.value.slice(1)
  }

  function dismissLevelUp(): void {
    showLevelUp.value = false
  }

  function updateLongestStreak(streak: number): void {
    if (streak > profile.value.longestStreak) {
      profile.value = { ...profile.value, longestStreak: streak }
      persist()
    }
  }

  function isUnlocked(achievementId: string): boolean {
    return profile.value.unlockedAchievements.some(a => a.achievementId === achievementId)
  }

  return {
    profile,
    recentXPEvents,
    toastQueue,
    showLevelUp,
    newLevel,
    levelInfo,
    xpProgress,
    addXP,
    removeXP,
    resetXP,
    tryUnlockAchievement,
    dismissToast,
    dismissLevelUp,
    updateLongestStreak,
    isUnlocked,
  }
})
