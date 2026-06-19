export type HabitCategory =
  | 'fitness'
  | 'learning'
  | 'health'
  | 'creativity'
  | 'business'
  | 'mindfulness'
  | 'other'

export interface Habit {
  id: string
  name: string
  category: HabitCategory
  icon: string
  color: string
  weeklyMinGoal: number
  monthlyMinGoal: number
  createdAt: string
  isActive: boolean
}

export interface HabitCompletion {
  id: string
  habitId: string
  date: string
  completedAt: string
  note?: string
}

export interface ExceptionDay {
  date: string
  reason?: string
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  xpReward: number
}

export interface UnlockedAchievement {
  achievementId: string
  unlockedAt: string
}

export interface UserProfile {
  level: number
  currentXP: number
  totalXP: number
  unlockedAchievements: UnlockedAchievement[]
  longestStreak: number
}

export interface NotificationSettings {
  enabled: boolean
  weekday: {
    morning: string
    afternoon: string
    evening: string
  }
  weekend: {
    noon: string
    evening: string
  }
}

export interface AppSettings {
  notifications: NotificationSettings
  theme: 'light' | 'dark' | 'system'
}

export interface WeekStats {
  habitId: string
  weekStart: string
  completionCount: number
  goalMet: boolean
}

export interface MonthStats {
  habitId: string
  monthKey: string
  completionCount: number
  goalMet: boolean
}
