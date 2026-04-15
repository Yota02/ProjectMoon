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
  min-height: calc(100vh - 80px); /* Ajusté pour la barre de navigation */
  overflow-x: hidden;
  padding: 2rem;
  background: radial-gradient(circle at 50% -20%, #1e293b 0%, #0f172a 100%);
}

.view-content {
  width: 100%;
  max-width: 1300px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
}

.aurora {
  position: absolute;
  border-radius: 999px;
  filter: blur(80px);
  opacity: 0.15;
  pointer-events: none;
  z-index: 1;
}

.aurora-left {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, #37d7ff 0%, rgba(55, 215, 255, 0) 70%);
  top: -100px;
  left: -200px;
  animation: float 15s infinite alternate ease-in-out;
}

.aurora-right {
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, #ff6e7f 0%, rgba(255, 110, 127, 0) 70%);
  bottom: -150px;
  right: -250px;
  animation: float 20s infinite alternate-reverse ease-in-out;
}

@keyframes float {
  from { transform: translate(0, 0) rotate(0deg); }
  to { transform: translate(50px, 30px) rotate(10deg); }
}

@media (max-width: 900px) {
  .training-view {
    padding: 1rem;
  }
}
</style>
