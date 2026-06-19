<template>
  <div class="page">
    <div class="page-content">

      <!-- Notifications -->
      <div class="settings-section animate-slide-up">
        <div class="section-title">Benachrichtigungen</div>
        <div class="card settings-card">
          <div class="setting-row">
            <div class="setting-info">
              <div class="setting-label">Benachrichtigungen</div>
              <div class="setting-desc">{{ permissionHint }}</div>
            </div>
            <label class="toggle">
              <input
                type="checkbox"
                :checked="settings.notifications.enabled"
                @change="handleNotificationToggle"
              />
              <span class="toggle-thumb" />
            </label>
          </div>
        </div>
      </div>

      <div v-if="settings.notifications.enabled" class="settings-section animate-slide-up" style="animation-delay:0.05s">
        <div class="section-title">Werktags (Mo–Fr)</div>
        <div class="card settings-card">
          <div class="setting-row">
            <div class="setting-label">Vormittag</div>
            <input
              type="time"
              :value="settings.notifications.weekday.morning"
              class="time-input"
              @change="updateTime('weekday', 'morning', ($event.target as HTMLInputElement).value)"
            />
          </div>
          <div class="setting-divider"/>
          <div class="setting-row">
            <div class="setting-label">Nachmittag</div>
            <input
              type="time"
              :value="settings.notifications.weekday.afternoon"
              class="time-input"
              @change="updateTime('weekday', 'afternoon', ($event.target as HTMLInputElement).value)"
            />
          </div>
          <div class="setting-divider"/>
          <div class="setting-row">
            <div class="setting-label">Abend</div>
            <input
              type="time"
              :value="settings.notifications.weekday.evening"
              class="time-input"
              @change="updateTime('weekday', 'evening', ($event.target as HTMLInputElement).value)"
            />
          </div>
        </div>
      </div>

      <div v-if="settings.notifications.enabled" class="settings-section animate-slide-up" style="animation-delay:0.08s">
        <div class="section-title">Wochenende (Sa–So)</div>
        <div class="card settings-card">
          <div class="setting-row">
            <div class="setting-label">Mittag</div>
            <input
              type="time"
              :value="settings.notifications.weekend.noon"
              class="time-input"
              @change="updateTime('weekend', 'noon', ($event.target as HTMLInputElement).value)"
            />
          </div>
          <div class="setting-divider"/>
          <div class="setting-row">
            <div class="setting-label">Abend</div>
            <input
              type="time"
              :value="settings.notifications.weekend.evening"
              class="time-input"
              @change="updateTime('weekend', 'evening', ($event.target as HTMLInputElement).value)"
            />
          </div>
        </div>
      </div>

      <!-- Appearance -->
      <div class="settings-section animate-slide-up" style="animation-delay:0.1s">
        <div class="section-title">Erscheinungsbild</div>
        <div class="card settings-card">
          <div class="setting-row">
            <div class="setting-label">Theme</div>
            <div class="theme-buttons">
              <button
                v-for="t in THEMES"
                :key="t.value"
                class="theme-btn"
                :class="{ active: settings.theme === t.value }"
                @click="settingsStore.setTheme(t.value)"
              >
                {{ t.label }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Backup -->
      <div class="settings-section animate-slide-up" style="animation-delay:0.12s">
        <div class="section-title">Datensicherung</div>
        <div class="backup-hint card">
          <span class="backup-hint-icon">⚠️</span>
          <span>Daten werden im Browser gespeichert und gehen beim Cache-Leeren verloren. Erstelle regelmäßig ein Backup.</span>
        </div>
        <div class="card settings-card" style="margin-top:10px">
          <div class="setting-row">
            <div class="setting-info">
              <div class="setting-label">Backup exportieren</div>
              <div class="setting-desc">Alle Daten als JSON-Datei herunterladen</div>
            </div>
            <button class="action-icon-btn export" @click="handleExport" :disabled="exportLoading">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </button>
          </div>
          <div class="setting-divider"/>
          <div class="setting-row">
            <div class="setting-info">
              <div class="setting-label">Backup wiederherstellen</div>
              <div class="setting-desc">{{ lastBackupLabel }}</div>
            </div>
            <button class="action-icon-btn import" @click="handleImport" :disabled="importLoading">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            </button>
          </div>
        </div>
        <div v-if="feedbackMsg" class="feedback-msg" :class="feedbackType">{{ feedbackMsg }}</div>
      </div>

      <!-- Data -->
      <div class="settings-section animate-slide-up" style="animation-delay:0.14s">
        <div class="section-title">Daten</div>
        <div class="card settings-card">
          <div class="setting-row">
            <div class="setting-info">
              <div class="setting-label">Alle Daten löschen</div>
              <div class="setting-desc">Gewohnheiten, Statistiken und XP werden zurückgesetzt</div>
            </div>
          </div>
          <div class="setting-divider"/>
          <button class="btn btn-danger btn-block" style="margin-top:4px" @click="confirmReset = true">
            Daten zurücksetzen
          </button>
        </div>
      </div>

      <!-- App info -->
      <div class="app-info animate-fade-in" style="animation-delay:0.15s">
        <div class="app-info-icon">🎯</div>
        <div class="app-info-name">Habit Tracker</div>
        <div class="app-info-version">Version 1.0.0 · PWA</div>
      </div>

    </div>
  </div>

  <!-- Reset confirm -->
  <Modal v-model="confirmReset" title="Daten loschen?">
    <div class="reset-confirm">
      <p class="reset-text">
        Alle Gewohnheiten, Abschlusshistorie, XP und Achievements werden
        unwiderruflich geloscht. Bist du sicher?
      </p>
      <div class="reset-actions">
        <button class="btn btn-ghost" @click="confirmReset = false">Abbrechen</button>
        <button class="btn btn-danger" @click="executeReset">Alles loschen</button>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Modal from '@/components/shared/Modal.vue'
import { useSettingsStore } from '@/stores/settings'
import type { AppSettings } from '@/types'
import {
  requestNotificationPermission,
  getPermissionState,
  scheduleNotificationsForToday,
} from '@/utils/notifications'
import { useHabitsStore } from '@/stores/habits'
import { useGamificationStore } from '@/stores/gamification'
import { exportToJson, importFromJson } from '@/utils/backup'

const settingsStore = useSettingsStore()
const habitsStore = useHabitsStore()
const gamificationStore = useGamificationStore()
const { settings } = settingsStore

const confirmReset = ref(false)
const exportLoading = ref(false)
const importLoading = ref(false)
const feedbackMsg = ref('')
const feedbackType = ref<'success' | 'error'>('success')

const BACKUP_TS_KEY = 'habit-tracker-last-backup'

const lastBackupLabel = computed(() => {
  const ts = localStorage.getItem(BACKUP_TS_KEY)
  if (!ts) return 'Noch kein Backup erstellt'
  const d = new Date(ts)
  return `Letztes Backup: ${d.toLocaleDateString('de-DE')} ${d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`
})

function showFeedback(msg: string, type: 'success' | 'error'): void {
  feedbackMsg.value = msg
  feedbackType.value = type
  setTimeout(() => { feedbackMsg.value = '' }, 3500)
}

async function handleExport(): Promise<void> {
  exportLoading.value = true
  try {
    exportToJson({
      version: 1,
      exportedAt: new Date().toISOString(),
      habits: habitsStore.habits,
      completions: habitsStore.completions,
      exceptionDays: habitsStore.exceptionDays,
      profile: gamificationStore.profile,
      settings: settingsStore.settings,
    })
    localStorage.setItem(BACKUP_TS_KEY, new Date().toISOString())
    showFeedback('Backup erfolgreich heruntergeladen ✓', 'success')
  } catch {
    showFeedback('Export fehlgeschlagen', 'error')
  } finally {
    exportLoading.value = false
  }
}

async function handleImport(): Promise<void> {
  importLoading.value = true
  try {
    const data = await importFromJson()
    localStorage.setItem('habit-tracker-habits', JSON.stringify(data.habits))
    localStorage.setItem('habit-tracker-completions', JSON.stringify(data.completions))
    localStorage.setItem('habit-tracker-exceptions', JSON.stringify(data.exceptionDays))
    localStorage.setItem('habit-tracker-gamification', JSON.stringify(data.profile))
    localStorage.setItem('habit-tracker-settings', JSON.stringify(data.settings))
    localStorage.setItem(BACKUP_TS_KEY, data.exportedAt)
    showFeedback('Backup wiederhergestellt – App wird neu geladen…', 'success')
    setTimeout(() => window.location.reload(), 1500)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Fehler beim Importieren'
    showFeedback(msg, 'error')
  } finally {
    importLoading.value = false
  }
}


const THEMES: { value: AppSettings['theme']; label: string }[] = [
  { value: 'light', label: 'Hell' },
  { value: 'dark', label: 'Dunkel' },
  { value: 'system', label: 'System' },
]

const permissionHint = computed(() => {
  const state = getPermissionState()
  if (state === 'unsupported') return 'Nicht unterstuzt'
  if (state === 'denied') return 'Berechtigung verweigert – in Browsereinstellungen andern'
  if (state === 'granted') return 'Berechtigung erteilt'
  return 'Berechtigung anfordern'
})

async function handleNotificationToggle(): Promise<void> {
  if (!settings.notifications.enabled) {
    const granted = await requestNotificationPermission()
    if (!granted) return
    settingsStore.setNotificationsEnabled(true)
    scheduleNotificationsForToday(settings.notifications, habitsStore.todayExceptionDay !== null)
  } else {
    settingsStore.setNotificationsEnabled(false)
  }
}

function updateTime(type: 'weekday' | 'weekend', slot: string, time: string): void {
  settingsStore.updateNotificationTime(type, slot, time)
  if (settings.notifications.enabled) {
    scheduleNotificationsForToday(settings.notifications, habitsStore.todayExceptionDay !== null)
  }
}

function executeReset(): void {
  localStorage.clear()
  window.location.reload()
}
</script>

<style scoped>
.settings-section {
  margin-bottom: 20px;
}

.settings-card {
  padding: 0;
  overflow: hidden;
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
}

.setting-info {
  flex: 1;
}

.setting-label {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.setting-desc {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 2px;
}

.setting-divider {
  height: 1px;
  background: var(--border);
  margin: 0 16px;
}

.toggle {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 28px;
  flex-shrink: 0;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
  position: absolute;
}

.toggle-thumb {
  position: absolute;
  inset: 0;
  background: var(--border);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: background 0.2s;
}

.toggle-thumb::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 22px;
  height: 22px;
  border-radius: var(--radius-full);
  background: white;
  transition: transform 0.2s;
  box-shadow: 0 1px 4px rgba(0,0,0,0.2);
}

.toggle input:checked + .toggle-thumb {
  background: var(--color-primary);
}

.toggle input:checked + .toggle-thumb::after {
  transform: translateX(20px);
}

.time-input {
  padding: 8px 10px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-card-2);
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  min-width: 100px;
}

.time-input:focus {
  border-color: var(--color-primary);
}

.theme-buttons {
  display: flex;
  gap: 6px;
}

.theme-btn {
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  background: var(--bg-card-2);
  border: 1.5px solid var(--border);
  cursor: pointer;
  transition: all 0.15s;
  -webkit-tap-highlight-color: transparent;
}

.theme-btn.active {
  background: var(--color-primary-light);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.app-info {
  text-align: center;
  padding: 32px 16px;
}

.app-info-icon {
  font-size: 40px;
  margin-bottom: 8px;
}

.app-info-name {
  font-size: 16px;
  font-weight: 800;
  color: var(--text-primary);
}

.app-info-version {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 4px;
}

.reset-confirm {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.reset-text {
  font-size: 15px;
  color: var(--text-secondary);
  line-height: 1.6;
}

.reset-actions {
  display: flex;
  gap: 12px;
}

.reset-actions .btn {
  flex: 1;
  padding: 14px;
  border-radius: var(--radius-sm);
}

.backup-hint {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  background: var(--color-warning-light);
  border-color: var(--color-warning-light);
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.backup-hint-icon {
  font-size: 16px;
  flex-shrink: 0;
  margin-top: 1px;
}

.action-icon-btn {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;
  -webkit-tap-highlight-color: transparent;
}

.action-icon-btn.export {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.action-icon-btn.import {
  background: var(--color-success-light);
  color: var(--color-success);
}

.action-icon-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.action-icon-btn:not(:disabled):active {
  transform: scale(0.92);
}

.feedback-msg {
  margin-top: 10px;
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 600;
  animation: fadeIn 0.2s ease;
}

.feedback-msg.success {
  background: var(--color-success-light);
  color: var(--color-success);
}

.feedback-msg.error {
  background: var(--color-danger-light);
  color: var(--color-danger);
}
</style>
