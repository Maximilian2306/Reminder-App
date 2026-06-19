<template>
  <div class="habit-card" :class="{ done: isDone, exception: isException }">
    <button
      class="check-btn"
      :class="{ done: isDone }"
      :style="{ '--habit-color': habit.color }"
      @click="handleToggle"
      :disabled="isException"
      :aria-label="isDone ? 'Als unerledigt markieren' : 'Als erledigt markieren'"
    >
      <Transition name="check">
        <span v-if="isDone" class="check-icon" key="done">✓</span>
        <span v-else class="check-icon empty" key="empty" />
      </Transition>
    </button>

    <div class="habit-info">
      <div class="habit-top">
        <span class="habit-icon">{{ habit.icon }}</span>
        <span class="habit-name">{{ habit.name }}</span>
        <span v-if="streak > 0" class="streak-chip" :title="`${streak} Tage in Folge`">
          🔥 {{ streak }}
        </span>
      </div>
      <div class="habit-meta">
        <div class="progress-pills">
          <span class="pill" :class="weekPillClass">
            {{ weeklyCount }}/{{ habit.weeklyMinGoal }} diese Woche
          </span>
          <span class="pill" :class="monthPillClass">
            {{ monthlyCount }}/{{ habit.monthlyMinGoal }} diesen Monat
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Habit } from '@/types'
import { useHabitsStore } from '@/stores/habits'

const props = defineProps<{
  habit: Habit
}>()

const habitsStore = useHabitsStore()

const isDone = computed(() => habitsStore.isCompletedToday(props.habit.id))
const isException = computed(() => habitsStore.todayExceptionDay !== null)
const weeklyCount = computed(() => habitsStore.getWeeklyCount(props.habit.id))
const monthlyCount = computed(() => habitsStore.getMonthlyCount(props.habit.id))
const streak = computed(() => habitsStore.getStreak(props.habit.id))

const weekPillClass = computed(() => {
  if (weeklyCount.value >= props.habit.weeklyMinGoal) return 'pill-success'
  if (weeklyCount.value >= props.habit.weeklyMinGoal * 0.6) return 'pill-warning'
  return 'pill-default'
})

const monthPillClass = computed(() => {
  if (monthlyCount.value >= props.habit.monthlyMinGoal) return 'pill-success'
  if (monthlyCount.value >= props.habit.monthlyMinGoal * 0.6) return 'pill-warning'
  return 'pill-default'
})

const isAnimating = ref(false)

async function handleToggle(): Promise<void> {
  if (isAnimating.value) return
  isAnimating.value = true

  if (isDone.value) {
    habitsStore.uncompleteHabit(props.habit.id)
  } else {
    await habitsStore.completeHabit(props.habit.id)
  }

  setTimeout(() => { isAnimating.value = false }, 300)
}
</script>

<style scoped>
.habit-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: var(--bg-card);
  border-radius: var(--radius);
  padding: 14px;
  border: 1.5px solid var(--border);
  transition: all 0.2s ease;
  animation: slideUp 0.3s ease both;
}

.habit-card.done {
  background: var(--color-primary-lighter);
  border-color: var(--color-primary-light);
}

.habit-card.exception {
  opacity: 0.5;
}

.check-btn {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-full);
  border: 2.5px solid var(--habit-color, var(--color-primary));
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  -webkit-tap-highlight-color: transparent;
}

.check-btn.done {
  background: var(--habit-color, var(--color-primary));
  border-color: var(--habit-color, var(--color-primary));
  animation: pop 0.3s ease;
}

.check-btn:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

.check-icon {
  font-size: 18px;
  font-weight: 700;
  color: white;
  line-height: 1;
}

.check-icon.empty {
  display: block;
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background: var(--habit-color, var(--color-primary));
  opacity: 0.3;
}

.check-enter-active {
  animation: checkmark 0.3s ease;
}

.habit-info {
  flex: 1;
  min-width: 0;
}

.habit-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.habit-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.habit-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.streak-chip {
  font-size: 12px;
  font-weight: 700;
  color: #f97316;
  flex-shrink: 0;
}

.progress-pills {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.pill {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: var(--radius-full);
}

.pill-default {
  background: var(--bg-card-2);
  color: var(--text-secondary);
}

.pill-warning {
  background: var(--color-warning-light);
  color: var(--color-warning);
}

.pill-success {
  background: var(--color-success-light);
  color: var(--color-success);
}
</style>
