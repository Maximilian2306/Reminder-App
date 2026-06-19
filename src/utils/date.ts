export function toDateString(date: Date = new Date()): string {
  return date.toISOString().split('T')[0]
}

export function today(): string {
  return toDateString(new Date())
}

export function getWeekStart(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return toDateString(d)
}

export function getMonthKey(dateStr: string): string {
  return dateStr.substring(0, 7)
}

export function getDatesInWeek(weekStart: string): string[] {
  const dates: string[] = []
  const start = new Date(weekStart + 'T00:00:00')
  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    dates.push(toDateString(d))
  }
  return dates
}

export function getDatesInMonth(monthKey: string): string[] {
  const [year, month] = monthKey.split('-').map(Number)
  const days = new Date(year, month, 0).getDate()
  const dates: string[] = []
  for (let d = 1; d <= days; d++) {
    dates.push(`${monthKey}-${String(d).padStart(2, '0')}`)
  }
  return dates
}

export function getDayName(dateStr: string, short = false): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('de-DE', { weekday: short ? 'short' : 'long' })
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('de-DE', { day: 'numeric', month: 'long' })
}

export function isWeekend(dateStr: string): boolean {
  const d = new Date(dateStr + 'T00:00:00')
  return d.getDay() === 0 || d.getDay() === 6
}

export function daysRemainingInMonth(): number {
  const now = new Date()
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return lastDay.getDate() - now.getDate()
}

export function daysRemainingInWeek(): number {
  const day = new Date().getDay()
  return day === 0 ? 0 : 7 - day
}

export function getLast7Days(): string[] {
  const dates: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    dates.push(toDateString(d))
  }
  return dates
}

export function getLast30Days(): string[] {
  const dates: string[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    dates.push(toDateString(d))
  }
  return dates
}

export function formatRelativeDate(dateStr: string): string {
  const t = today()
  if (dateStr === t) return 'Heute'
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  if (dateStr === toDateString(yesterday)) return 'Gestern'
  return formatDate(dateStr)
}
