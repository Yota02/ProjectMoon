<template>
  <div class="training-view">
    <div class="aurora aurora-left"></div>
    <div class="aurora aurora-right"></div>

    <div class="view-content">
      <TrainingCenter />
    </div>
  </div>
</template>

<script setup lang="ts">
import TrainingCenter from '../components/TrainingCenter.vue'
</script>

<style scoped>
.training-view {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 100%;
  overflow: hidden;
  padding: 1.5rem;
}

.view-content {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
}

.aurora {
  position: absolute;
  border-radius: 999px;
  filter: blur(70px);
  opacity: 0.28;
  pointer-events: none;
  z-index: 1;
}

.aurora-left {
  width: 360px;
  height: 360px;
  background: radial-gradient(circle, #00d4ff 0%, rgba(0, 212, 255, 0) 70%);
  top: -120px;
  left: -120px;
}

.aurora-right {
  width: 420px;
  height: 420px;
  background: radial-gradient(circle, #ff8f4a 0%, rgba(255, 143, 74, 0) 70%);
  bottom: -160px;
  right: -140px;
}

@media (max-width: 900px) {
  .training-view {
    padding: 1rem;
  }
}
</style>
