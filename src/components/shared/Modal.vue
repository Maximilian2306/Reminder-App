<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="modelValue" class="modal-overlay" @click="emit('update:modelValue', false)">
        <div class="modal-sheet" @click.stop>
          <div class="modal-handle" />
          <div class="modal-header" v-if="title">
            <h2 class="modal-title">{{ title }}</h2>
            <button class="modal-close" @click="emit('update:modelValue', false)">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean
  title?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: flex-end;
}

.modal-sheet {
  background: var(--bg-card);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  padding: 0 0 calc(24px + var(--safe-bottom));
  animation: sheetUp 0.35s cubic-bezier(0.32, 0.72, 0, 1);
}

.modal-handle {
  width: 36px;
  height: 4px;
  background: var(--border);
  border-radius: var(--radius-full);
  margin: 12px auto 0;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 0;
}

.modal-title {
  font-size: 18px;
  font-weight: 800;
  color: var(--text-primary);
}

.modal-close {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-card-2);
  color: var(--text-secondary);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.modal-body {
  padding: 20px;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.modal-fade-enter-active .modal-sheet {
  animation: sheetUp 0.35s cubic-bezier(0.32, 0.72, 0, 1);
}
.modal-fade-leave-active .modal-sheet {
  animation: sheetDown 0.25s ease forwards;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@keyframes sheetUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

@keyframes sheetDown {
  from { transform: translateY(0); }
  to { transform: translateY(100%); }
}
</style>
