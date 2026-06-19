export const XP_VALUES = {
  habitComplete: 15,
  weeklyGoalBonus: 75,
  monthlyGoalBonus: 200,
  streakBonus3: 10,
  streakBonus7: 25,
  streakBonus30: 100,
  exceptionDay: 0,
}

export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.4, level - 1))
}

export function totalXpForLevel(level: number): number {
  let total = 0
  for (let i = 1; i < level; i++) {
    total += xpForLevel(i)
  }
  return total
}

export function levelFromTotalXP(totalXP: number): { level: number; currentXP: number; xpForNextLevel: number } {
  let level = 1
  let remaining = totalXP
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level)
    level++
  }
  return {
    level,
    currentXP: remaining,
    xpForNextLevel: xpForLevel(level)
  }
}

export function progressPercent(currentXP: number, xpForNextLevel: number): number {
  return Math.min(100, Math.round((currentXP / xpForNextLevel) * 100))
}

export const ACHIEVEMENTS = [
  {
    id: 'first_habit',
    name: 'Erster Schritt',
    description: 'Erste Gewohnheit abgeschlossen',
    icon: '🌱',
    xpReward: 25,
  },
  {
    id: 'streak_3',
    name: '3-Tage-Streak',
    description: '3 Tage in Folge aktiv',
    icon: '🔥',
    xpReward: 50,
  },
  {
    id: 'streak_7',
    name: 'Woche voll',
    description: '7 Tage in Folge aktiv',
    icon: '⚡',
    xpReward: 100,
  },
  {
    id: 'streak_30',
    name: 'Monatsheld',
    description: '30 Tage in Folge aktiv',
    icon: '👑',
    xpReward: 300,
  },
  {
    id: 'weekly_goal_1',
    name: 'Wochenziel erreicht',
    description: 'Erstes Wochenziel abgehakt',
    icon: '🎯',
    xpReward: 75,
  },
  {
    id: 'monthly_goal_1',
    name: 'Monatsziel erreicht',
    description: 'Erstes Monatsziel abgehakt',
    icon: '🏆',
    xpReward: 200,
  },
  {
    id: 'level_5',
    name: 'Level 5',
    description: 'Level 5 erreicht',
    icon: '⭐',
    xpReward: 150,
  },
  {
    id: 'level_10',
    name: 'Level 10',
    description: 'Level 10 erreicht',
    icon: '💎',
    xpReward: 500,
  },
  {
    id: 'total_50',
    name: 'Fleißiger Starter',
    description: '50 Gewohnheiten insgesamt abgeschlossen',
    icon: '💪',
    xpReward: 100,
  },
  {
    id: 'total_200',
    name: 'Routineprofi',
    description: '200 Gewohnheiten insgesamt abgeschlossen',
    icon: '🚀',
    xpReward: 250,
  },
]
