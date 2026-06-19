<template>
  <Transition name="modal-fade">
    <div v-if="gamificationStore.showLevelUp" class="modal-overlay" @click="gamificationStore.dismissLevelUp()">
      <div class="level-up-card" @click.stop>
        <div class="stars">
          <span class="star s1">⭐</span>
          <span class="star s2">✨</span>
          <span class="star s3">⭐</span>
        </div>
        <div class="level-badge-big">{{ gamificationStore.newLevel }}</div>
        <div class="level-up-title">Level Up!</div>
        <div class="level-up-sub">Du bist jetzt Level {{ gamificationStore.newLevel }}</div>
        <button class="btn btn-primary btn-block" style="margin-top:24px" @click="gamificationStore.dismissLevelUp()">
          Weiter so!
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useGamificationStore } from '@/stores/gamification'
const gamificationStore = useGamificationStore()
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 500;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.level-up-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 40px 32px 32px;
  text-align: center;
  width: 100%;
  max-width: 320px;
  box-shadow: var(--shadow-lg);
  animation: levelUpPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.stars {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 24px;
}

.star {
  animation: starPop 0.4s ease both;
}
.s1 { animation-delay: 0.1s; }
.s2 { animation-delay: 0.2s; }
.s3 { animation-delay: 0.3s; }

.level-badge-big {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  color: white;
  font-size: 32px;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
}

.level-up-title {
  font-size: 28px;
  font-weight: 900;
  color: var(--text-primary);
  letter-spacing: -0.03em;
  margin-bottom: 6px;
}

.level-up-sub {
  font-size: 15px;
  color: var(--text-secondary);
  font-weight: 500;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@keyframes levelUpPop {
  from { opacity: 0; transform: scale(0.8) translateY(20px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

@keyframes starPop {
  from { opacity: 0; transform: scale(0) rotate(-30deg); }
  to { opacity: 1; transform: scale(1) rotate(0deg); }
}
</style>
