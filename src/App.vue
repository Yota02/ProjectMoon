<template>
  <div class="game-container">
    <header>
      <h1>🚀 Project Moon</h1>
      <p>Gérez votre centre spatial et explorez l'inconnu.</p>
    </header>

    <main>
      <ResourceDashboard />
      <MissionList />
    </main>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import ResourceDashboard from './components/ResourceDashboard.vue'
import MissionList from './components/MissionList.vue'
import { gameLoop } from './engine/GameLoop'
import { useResourceStore } from './stores/useResourceStore'

const resourceStore = useResourceStore()

// Relier le store de ressources au système de tick
onMounted(() => {
  gameLoop.addTickHandler((deltaTime) => {
    resourceStore.tick(deltaTime)
  })
  
  // Démarrer la boucle de jeu
  gameLoop.start()
})

onUnmounted(() => {
  gameLoop.stop()
})
</script>

<style>
body {
  margin: 0;
  font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #0b0f19;
  color: #fff;
  min-height: 100vh;
}
</style>

<style scoped>
.game-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

header {
  text-align: center;
  margin-bottom: 3rem;
}

h1 {
  font-size: 3rem;
  color: #4da8da;
  margin-bottom: 0.5rem;
  text-shadow: 0 0 10px rgba(77, 168, 218, 0.5);
}

header p {
  color: #a2a8d3;
  font-size: 1.2rem;
}
</style>
