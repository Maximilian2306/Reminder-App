import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { AppSettings } from '@/types'

const STORAGE_KEY = 'habit-tracker-settings'

const DEFAULT_SETTINGS: AppSettings = {
  notifications: {
    enabled: false,
    weekday: {
      morning: '08:00',
      afternoon: '13:00',
      evening: '20:00',
    },
    weekend: {
      noon: '12:00',
      evening: '18:00',
    },
  },
  theme: 'system',
}

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<AppSettings>) }
  } catch { /* empty */ }
  return { ...DEFAULT_SETTINGS }
}

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<AppSettings>(loadSettings())

  function persist(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings.value))
  }

  function updateNotificationTime(
    type: 'weekday' | 'weekend',
    slot: string,
    time: string
  ): void {
    if (type === 'weekday') {
      settings.value = {
        ...settings.value,
        notifications: {
          ...settings.value.notifications,
          weekday: {
            ...settings.value.notifications.weekday,
            [slot]: time,
          },
        },
      }
    } else {
      settings.value = {
        ...settings.value,
        notifications: {
          ...settings.value.notifications,
          weekend: {
            ...settings.value.notifications.weekend,
            [slot]: time,
          },
        },
      }
    }
    persist()
  }

  function setNotificationsEnabled(enabled: boolean): void {
    settings.value = {
      ...settings.value,
      notifications: { ...settings.value.notifications, enabled },
    }
    persist()
  }

  function setTheme(theme: AppSettings['theme']): void {
    settings.value = { ...settings.value, theme }
    persist()
    applyTheme(theme)
  }

  function applyTheme(theme: AppSettings['theme']): void {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const useDark = theme === 'dark' || (theme === 'system' && prefersDark)
    document.documentElement.classList.toggle('dark', useDark)
  }

  applyTheme(settings.value.theme)

  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  mq.addEventListener('change', () => {
    if (settings.value.theme === 'system') applyTheme('system')
  })

  return {
    settings,
    updateNotificationTime,
    setNotificationsEnabled,
    setTheme,
  }
})
