<template>
  <div class="page">
    <div class="page-content">

      <!-- Add button -->
      <button class="add-btn btn btn-primary btn-block animate-slide-up" @click="showForm = true">
        <span>+</span> Neue Gewohnheit
      </button>

      <!-- Habits list -->
      <div v-if="habitsStore.activeHabits.length > 0" style="margin-top:20px">
        <div class="section-title">Alle Gewohnheiten ({{ habitsStore.activeHabits.length }})</div>
        <div class="habits-manage-list">
          <div
            v-for="(habit, i) in habitsStore.activeHabits"
            :key="habit.id"
            class="habit-manage-card card animate-slide-up"
            :style="{ animationDelay: `${i * 0.05}s` }"
          >
            <div class="habit-manage-left">
              <span class="habit-dot" :style="{ background: habit.color }" />
              <span class="habit-manage-icon">{{ habit.icon }}</span>
              <div class="habit-manage-info">
                <div class="habit-manage-name">{{ habit.name }}</div>
                <div class="habit-manage-meta">
                  <span class="chip chip-primary">{{ categoryLabel(habit.category) }}</span>
                  <span class="chip chip-primary">{{ habit.weeklyMinGoal }}x/Woche</span>
                  <span class="chip chip-primary">{{ habit.monthlyMinGoal }}x/Monat</span>
                </div>
              </div>
            </div>
            <div class="habit-manage-actions">
              <button class="action-btn edit" @click="startEdit(habit)" title="Bearbeiten">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button class="action-btn delete" @click="confirmDelete(habit)" title="Loschen">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state animate-fade-in" style="margin-top:40px">
        <span class="empty-state-icon">📋</span>
        <div class="empty-state-title">Noch keine Gewohnheiten</div>
        <div class="empty-state-text">Erstelle deine erste Gewohnheit und starte deine Reise.</div>
      </div>

    </div>
  </div>

  <!-- Create/Edit modal -->
  <Modal v-model="showForm" :title="editingHabit ? 'Gewohnheit bearbeiten' : 'Neue Gewohnheit'">
    <HabitForm
      :edit-habit="editingHabit"
      @submit="handleFormSubmit"
      @cancel="closeForm"
    />
  </Modal>

  <!-- Delete confirm modal -->
  <Modal v-model="showDeleteConfirm" title="Gewohnheit loschen?">
    <div class="delete-confirm">
      <p class="delete-text">
        Mochtest du <strong>"{{ deletingHabit?.name }}"</strong> und alle zugehorigen Daten wirklich loschen?
        Dieser Schritt kann nicht ruckgangig gemacht werden.
      </p>
      <div class="delete-actions">
        <button class="btn btn-ghost" @click="showDeleteConfirm = false">Abbrechen</button>
        <button class="btn btn-danger" @click="executeDelete">Loschen</button>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Habit, HabitCategory } from '@/types'
import HabitForm from '@/components/habits/HabitForm.vue'
import Modal from '@/components/shared/Modal.vue'
import { useHabitsStore } from '@/stores/habits'

const habitsStore = useHabitsStore()

const showForm = ref(false)
const editingHabit = ref<Habit | null>(null)
const showDeleteConfirm = ref(false)
const deletingHabit = ref<Habit | null>(null)

const CATEGORY_LABELS: Record<HabitCategory, string> = {
  fitness: 'Fitness',
  learning: 'Lernen',
  health: 'Gesundheit',
  creativity: 'Kreativitat',
  business: 'Business',
  mindfulness: 'Achtsamkeit',
  other: 'Sonstiges',
}

function categoryLabel(cat: HabitCategory): string {
  return CATEGORY_LABELS[cat] ?? cat
}

function startEdit(habit: Habit): void {
  editingHabit.value = habit
  showForm.value = true
}

function closeForm(): void {
  showForm.value = false
  editingHabit.value = null
}

function handleFormSubmit(data: Omit<Habit, 'id' | 'createdAt' | 'isActive'>): void {
  if (editingHabit.value) {
    habitsStore.updateHabit(editingHabit.value.id, data)
  } else {
    habitsStore.addHabit(data)
  }
  closeForm()
}

function confirmDelete(habit: Habit): void {
  deletingHabit.value = habit
  showDeleteConfirm.value = true
}

function executeDelete(): void {
  if (deletingHabit.value) {
    habitsStore.deleteHabit(deletingHabit.value.id)
  }
  showDeleteConfirm.value = false
  deletingHabit.value = null
}
</script>

<style scoped>
.add-btn {
  font-size: 15px;
  padding: 14px;
}

.habits-manage-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.habit-manage-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 14px;
}

.habit-manage-left {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.habit-dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  flex-shrink: 0;
  margin-top: 6px;
}

.habit-manage-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.habit-manage-info {
  flex: 1;
  min-width: 0;
}

.habit-manage-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.habit-manage-meta {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.habit-manage-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
  -webkit-tap-highlight-color: transparent;
}

.action-btn.edit {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.action-btn.delete {
  background: var(--color-danger-light);
  color: var(--color-danger);
}

.action-btn:active {
  transform: scale(0.92);
}

.delete-confirm {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.delete-text {
  font-size: 15px;
  color: var(--text-secondary);
  line-height: 1.6;
}

.delete-text strong {
  color: var(--text-primary);
}

.delete-actions {
  display: flex;
  gap: 12px;
}

.delete-actions .btn {
  flex: 1;
  padding: 14px;
  border-radius: var(--radius-sm);
}
</style>
