<template>
  <Transition name="toast">
    <div v-if="currentToast" class="achievement-toast" @click="gamificationStore.dismissToast()">
      <div class="toast-icon">{{ currentToast.icon }}</div>
      <div class="toast-content">
        <div class="toast-title">Achievement freigeschaltet!</div>
        <div class="toast-name">{{ currentToast.name }}</div>
        <div class="toast-xp">+{{ currentToast.xpReward }} XP</div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useGamificationStore } from '@/stores/gamification'

const gamificationStore = useGamificationStore()

const currentToast = computed(() => gamificationStore.toastQueue[0] ?? null)

watch(currentToast, (val) => {
  if (val) {
    setTimeout(() => gamificationStore.dismissToast(), 3500)
  }
})
</script>

<style scoped>
.achievement-toast {
  position: fixed;
  top: calc(env(safe-area-inset-top, 0) + 80px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  padding: 14px 18px;
  border-radius: var(--radius);
  box-shadow: var(--shadow-lg);
  min-width: 280px;
  max-width: 340px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.toast-icon {
  font-size: 28px;
  flex-shrink: 0;
}

.toast-content {
  flex: 1;
}

.toast-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  opacity: 0.85;
  margin-bottom: 2px;
}

.toast-name {
  font-size: 15px;
  font-weight: 800;
  margin-bottom: 2px;
}

.toast-xp {
  font-size: 13px;
  font-weight: 600;
  opacity: 0.9;
}

.toast-enter-active {
  animation: toastIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toast-leave-active {
  animation: toastOut 0.3s ease forwards;
}

@keyframes toastIn {
  from { opacity: 0; transform: translateX(-50%) translateY(-20px) scale(0.9); }
  to { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
}

@keyframes toastOut {
  from { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
  to { opacity: 0; transform: translateX(-50%) translateY(-20px) scale(0.9); }
}
</style>
