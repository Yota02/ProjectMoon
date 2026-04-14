<template>
  <div class="view-container">
    <div class="view-header">
      <h2>🚀 Centre des Missions</h2>
      <p>Lancement et suivi des missions d'exploration.</p>
    </div>
    
    <div class="view-content">
      <MissionList />
    </div>
  </div>
</template>

<script setup lang="ts">
import MissionList from '../components/MissionList.vue'
</script>

<style scoped>
.view-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.view-header h2 {
  font-size: 2rem;
  color: #4da8da;
  margin-bottom: 0.5rem;
}

.view-header p {
  color: #a2a8d3;
  margin: 0;
}
</style>
