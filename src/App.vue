<template>
  <div class="game-container">
    <header>
      <h1>🚀 Project Moon</h1>
      <p>Gérez votre centre spatial et explorez l'inconnu.</p>
      
      <nav class="main-nav">
        <router-link to="/" class="nav-link">Tableau de bord</router-link>
        <router-link to="/personnel" class="nav-link">Personnel</router-link>
        <router-link to="/missions" class="nav-link">Missions</router-link>
      </nav>
    </header>

    <main>
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { gameLoop } from './engine/GameLoop'
import { useResourceStore } from './stores/useResourceStore'

const resourceStore = useResourceStore()

// Relier le store de ressources au système de tick
onMounted(() => {
  gameLoop.addTickHandler((deltaTime: number) => {
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
  margin-bottom: 2rem;
}

.main-nav {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  background-color: #1a1a2e;
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid #16213e;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.nav-link {
  color: #a2a8d3;
  text-decoration: none;
  font-weight: bold;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.nav-link:hover {
  background-color: #0f3460;
  color: #fff;
}

.nav-link.router-link-active {
  background-color: #e94560;
  color: #fff;
}

/* Transitions pour le routeur */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
