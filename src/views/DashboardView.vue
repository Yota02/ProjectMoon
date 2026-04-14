<template>
  <div class="view-container">
    <div class="dashboard-header">
      <h2>Tableau de Bord</h2>
      <p>Aperçu global de votre station spatiale.</p>
    </div>
    
    <div class="dashboard-content">
      <ResourceDashboard />
      
      <div class="quick-links">
        <router-link to="/personnel" class="quick-link-card">
          <h3>👨‍🚀 Personnel</h3>
          <p>Gérez vos astronautes et recrutez de nouveaux talents.</p>
        </router-link>
        
        <router-link to="/missions" class="quick-link-card">
          <h3>🚀 Missions</h3>
          <p>Envoyez des expéditions pour explorer l'univers.</p>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ResourceDashboard from '../components/ResourceDashboard.vue'
</script>

<style scoped>
.view-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.dashboard-header h2 {
  font-size: 2rem;
  color: #4da8da;
  margin-bottom: 0.5rem;
}

.dashboard-header p {
  color: #a2a8d3;
  margin: 0;
}

.quick-links {
  display: flex;
  gap: 1.5rem;
  margin-top: 1rem;
}

.quick-link-card {
  flex: 1;
  background-color: #1a1a2e;
  border: 1px solid #16213e;
  border-radius: 12px;
  padding: 1.5rem;
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s, box-shadow 0.2s, background-color 0.2s;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.quick-link-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.4);
  background-color: #0f3460;
  border-color: #e94560;
}

.quick-link-card h3 {
  color: #e94560;
  margin-top: 0;
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.quick-link-card p {
  color: #a2a8d3;
  margin: 0;
  line-height: 1.4;
}
</style>
