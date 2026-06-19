import type { Habit, HabitCompletion, ExceptionDay, UserProfile, AppSettings } from '@/types'

export interface BackupData {
  version: number
  exportedAt: string
  habits: Habit[]
  completions: HabitCompletion[]
  exceptionDays: ExceptionDay[]
  profile: UserProfile
  settings: AppSettings
}

export function exportToJson(data: BackupData): void {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const date = new Date().toISOString().split('T')[0]
  a.href = url
  a.download = `habit-tracker-backup-${date}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function importFromJson(): Promise<BackupData> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json,application/json'
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) { reject(new Error('Keine Datei ausgewahlt')); return }
      const reader = new FileReader()
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result as string) as BackupData
          if (!data.version || !data.habits) {
            reject(new Error('Ungultiges Backup-Format'))
            return
          }
          resolve(data)
        } catch {
          reject(new Error('Datei konnte nicht gelesen werden'))
        }
      }
      reader.onerror = () => reject(new Error('Lesefehler'))
      reader.readAsText(file)
    }
    input.click()
  })
}
