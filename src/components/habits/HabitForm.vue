<template>
  <div class="habit-form">
    <div class="form-group">
      <label class="form-label">Name</label>
      <input
        v-model="form.name"
        class="form-input"
        placeholder="z.B. Gitarre spielen"
        maxlength="40"
        autofocus
      />
    </div>

    <div class="form-group">
      <label class="form-label">Kategorie</label>
      <div class="category-grid">
        <button
          v-for="cat in CATEGORIES"
          :key="cat.value"
          class="category-btn"
          :class="{ selected: form.category === cat.value }"
          @click="form.category = cat.value"
        >
          <span>{{ cat.icon }}</span>
          <span>{{ cat.label }}</span>
        </button>
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">Icon</label>
      <div class="icon-grid">
        <button
          v-for="icon in ICONS"
          :key="icon"
          class="icon-btn"
          :class="{ selected: form.icon === icon }"
          @click="form.icon = icon"
        >
          {{ icon }}
        </button>
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">Farbe</label>
      <div class="color-grid">
        <button
          v-for="color in COLORS"
          :key="color"
          class="color-btn"
          :class="{ selected: form.color === color }"
          :style="{ background: color }"
          @click="form.color = color"
        >
          <span v-if="form.color === color" class="color-check">✓</span>
        </button>
      </div>
    </div>

    <div class="form-row">
      <div class="form-group half">
        <label class="form-label">Min. pro Woche</label>
        <input
          v-model.number="form.weeklyMinGoal"
          type="number"
          class="form-input"
          min="1"
          max="21"
        />
      </div>
      <div class="form-group half">
        <label class="form-label">Min. pro Monat</label>
        <input
          v-model.number="form.monthlyMinGoal"
          type="number"
          class="form-input"
          min="1"
          max="90"
        />
      </div>
    </div>

    <div class="form-actions">
      <button class="btn btn-ghost" @click="emit('cancel')">Abbrechen</button>
      <button
        class="btn btn-primary"
        :disabled="!isValid"
        @click="handleSubmit"
      >
        {{ editHabit ? 'Speichern' : 'Erstellen' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import type { Habit, HabitCategory } from '@/types'

const props = defineProps<{
  editHabit?: Habit | null
}>()

const emit = defineEmits<{
  submit: [data: Omit<Habit, 'id' | 'createdAt' | 'isActive'>]
  cancel: []
}>()

const CATEGORIES: { value: HabitCategory; label: string; icon: string }[] = [
  { value: 'fitness', label: 'Fitness', icon: '💪' },
  { value: 'learning', label: 'Lernen', icon: '📚' },
  { value: 'health', label: 'Gesundheit', icon: '🥗' },
  { value: 'creativity', label: 'Kreativitat', icon: '🎨' },
  { value: 'business', label: 'Business', icon: '💼' },
  { value: 'mindfulness', label: 'Achtsamkeit', icon: '🧘' },
  { value: 'other', label: 'Sonstiges', icon: '✨' },
]

const ICONS = [
  '🏋️', '🚴', '🏃', '🧘', '🎸', '🎹', '📚', '✏️',
  '💻', '🎯', '🥗', '💧', '🛌', '🌿', '🧠', '📖',
  '📝', '🎬', '🎤', '🏊', '⚽', '🎾', '🧩', '💡',
]

const COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
  '#f59e0b', '#10b981', '#06b6d4', '#3b82f6',
  '#84cc16', '#f97316', '#a855f7', '#14b8a6',
]

const form = reactive({
  name: props.editHabit?.name ?? '',
  category: (props.editHabit?.category ?? 'other') as HabitCategory,
  icon: props.editHabit?.icon ?? '🎯',
  color: props.editHabit?.color ?? '#6366f1',
  weeklyMinGoal: props.editHabit?.weeklyMinGoal ?? 3,
  monthlyMinGoal: props.editHabit?.monthlyMinGoal ?? 10,
})

const isValid = computed(() =>
  form.name.trim().length > 0 &&
  form.weeklyMinGoal >= 1 &&
  form.monthlyMinGoal >= 1
)

function handleSubmit(): void {
  if (!isValid.value) return
  emit('submit', {
    name: form.name.trim(),
    category: form.category,
    icon: form.icon,
    color: form.color,
    weeklyMinGoal: form.weeklyMinGoal,
    monthlyMinGoal: form.monthlyMinGoal,
  })
}
</script>

<style scoped>
.habit-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group.half {
  flex: 1;
}

.form-row {
  display: flex;
  gap: 12px;
}

.form-label {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.form-input {
  padding: 12px 14px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-card-2);
  color: var(--text-primary);
  font-size: 15px;
  font-weight: 500;
  transition: border-color 0.15s;
  width: 100%;
}

.form-input:focus {
  border-color: var(--color-primary);
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.category-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 6px;
  border-radius: var(--radius-sm);
  border: 1.5px solid var(--border);
  background: var(--bg-card-2);
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  -webkit-tap-highlight-color: transparent;
}

.category-btn.selected {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 6px;
}

.icon-btn {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  border-radius: var(--radius-sm);
  border: 1.5px solid var(--border);
  background: var(--bg-card-2);
  cursor: pointer;
  transition: all 0.15s;
  -webkit-tap-highlight-color: transparent;
}

.icon-btn.selected {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
  transform: scale(1.1);
}

.color-grid {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.color-btn {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  border: 3px solid transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  -webkit-tap-highlight-color: transparent;
}

.color-btn.selected {
  border-color: var(--text-primary);
  transform: scale(1.15);
}

.color-check {
  font-size: 14px;
  font-weight: 700;
  color: white;
  text-shadow: 0 1px 3px rgba(0,0,0,0.4);
}

.form-actions {
  display: flex;
  gap: 12px;
  padding-top: 4px;
}

.form-actions .btn {
  flex: 1;
  padding: 14px;
  border-radius: var(--radius-sm);
}

.btn-primary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
