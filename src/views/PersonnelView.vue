<template>
  <div class="view-container">
    <div class="view-header">
      <h2>👨‍🚀 Gestion du Personnel</h2>
      <p>Recrutement et affectation de vos équipes.</p>
    </div>
    
    <div class="view-content">
      <PersonnelCenter />
    </div>
  </div>
</template>

<script setup lang="ts">
import PersonnelCenter from '../components/PersonnelCenter.vue'
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
