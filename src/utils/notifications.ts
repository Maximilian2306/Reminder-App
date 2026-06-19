import type { NotificationSettings } from '@/types'

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}

export function isNotificationsSupported(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator
}

export function getPermissionState(): NotificationPermission | 'unsupported' {
  if (!('Notification' in window)) return 'unsupported'
  return Notification.permission
}

export function sendLocalNotification(title: string, body: string, icon = '/icons/icon-192.png'): void {
  if (Notification.permission !== 'granted') return
  navigator.serviceWorker.ready.then(registration => {
    registration.showNotification(title, {
      body,
      icon,
      badge: '/icons/icon-192.png',
      vibrate: [200, 100, 200],
      silent: false,
    })
  })
}

interface ScheduledNotification {
  timeoutId: ReturnType<typeof setTimeout>
  scheduledFor: string
}

const scheduledNotifications: ScheduledNotification[] = []

export function clearAllScheduledNotifications(): void {
  scheduledNotifications.forEach(n => clearTimeout(n.timeoutId))
  scheduledNotifications.length = 0
}

export function scheduleNotificationsForToday(settings: NotificationSettings, hasExceptionDay: boolean): void {
  clearAllScheduledNotifications()
  if (!settings.enabled || hasExceptionDay) return
  if (Notification.permission !== 'granted') return

  const now = new Date()
  const isWeekend = now.getDay() === 0 || now.getDay() === 6

  const times = isWeekend
    ? [
        { time: settings.weekend.noon, label: 'mittag' },
        { time: settings.weekend.evening, label: 'abend' },
      ]
    : [
        { time: settings.weekday.morning, label: 'morgen' },
        { time: settings.weekday.afternoon, label: 'mittag' },
        { time: settings.weekday.evening, label: 'abend' },
      ]

  const messages: Record<string, string[]> = {
    morgen: [
      'Guten Morgen! Zeit fur deine Gewohnheiten.',
      'Ein neuer Tag, neue Chancen. Leg los!',
      'Starte deinen Tag mit einer guten Gewohnheit.',
    ],
    mittag: [
      'Mittagspause - hast du heute schon etwas erledigt?',
      'Halftime! Schau kurz nach deinen Zielen.',
      'Wie lauft dein Tag? Deine Gewohnheiten warten.',
    ],
    abend: [
      'Noch nicht fertig? Es ist noch nicht zu spat!',
      'Den Tag gut abschliessen - was hast du heute geschafft?',
      'Abend-Check: Noch eine Gewohnheit drauf?',
    ],
  }

  for (const { time, label } of times) {
    const [hours, minutes] = time.split(':').map(Number)
    const target = new Date()
    target.setHours(hours, minutes, 0, 0)

    const delay = target.getTime() - now.getTime()
    if (delay <= 0) continue

    const msgList = messages[label] ?? messages['mittag']
    const msg = msgList[Math.floor(Math.random() * msgList.length)]

    const timeoutId = setTimeout(() => {
      sendLocalNotification('Habit Tracker', msg)
    }, delay)

    scheduledNotifications.push({ timeoutId, scheduledFor: time })
  }
}
