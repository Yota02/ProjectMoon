<template>
  <div class="flex h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden">
    <!-- Sidebar de Navigation -->
    <aside class="w-64 bg-slate-900 border-r border-slate-800 flex flex-col hidden md:flex">
      <div class="p-6">
        <div class="flex items-center gap-2 mb-8">
          <div
            class="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)]"
          >
            <BaseIcon name="rocket" class="text-white" />
          </div>
          <h1 class="text-xl font-black tracking-tight text-white">
            AERO<span class="text-blue-500">CORP</span>
          </h1>
        </div>

        <nav class="space-y-2">
          <router-link
            v-for="item in navItems"
            :key="item.id"
            :to="item.to"
            custom
            v-slot="{ navigate, isActive }"
          >
            <button
              @click="navigate"
              :class="[
                'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all group',
                isActive
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200',
              ]"
            >
              <BaseIcon
                :name="item.icon"
                :class="isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'"
              />
              {{ item.label }}
            </button>
          </router-link>
        </nav>
      </div>

      <div class="mt-auto p-6 border-t border-slate-800">
        <div class="flex items-center gap-3 text-sm text-slate-400 mb-2 font-mono">
          <BaseIcon name="calendar" :size="16" />
          <span class="text-white font-black tracking-widest">{{ gameStore.formattedDate }}</span>
        </div>
        <div class="flex items-center justify-between bg-slate-950/80 p-3 rounded-xl border border-slate-800 shadow-inner">
          <span class="text-[10px] text-slate-500 uppercase font-black tracking-widest">Rythme</span>
          <div class="flex items-center gap-2">
             <div class="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></div>
             <span class="text-[10px] font-mono text-emerald-400 font-bold">1 JOUR / 0.5s</span>
          </div>
        </div>
      </div>
    </aside>

    <!-- Contenu Principal -->
    <main class="flex-1 flex flex-col h-full overflow-hidden">
      <!-- Header / Top Bar -->
      <header
        class="p-6 lg:px-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/50 sticky top-0 z-10 backdrop-blur-md border-b border-slate-800/50"
      >
        <div>
          <h2 class="text-2xl font-bold text-white">
            {{ route.name === 'dashboard' ? 'Tableau de Bord' : route.name }}
          </h2>
          <p class="text-slate-400 text-sm">Bienvenue Directeur. Les systèmes sont nominaux.</p>
        </div>
        <div class="flex items-center gap-6">
          <div class="hidden lg:flex items-center gap-4">
            <div class="text-right">
              <p class="text-xs text-slate-500 uppercase tracking-wider font-bold">Crédits</p>
              <p class="font-mono text-emerald-400 font-bold">
                {{ resourceStore.argent.toLocaleString() }} €
              </p>
            </div>
            <div class="text-right border-l border-slate-800 pl-4">
              <p class="text-xs text-slate-500 uppercase tracking-wider font-bold">Science</p>
              <p class="font-mono text-blue-400 font-bold">
                {{ resourceStore.science.toLocaleString() }}🧪
              </p>
            </div>
          </div>
          <div class="text-right hidden sm:block border-l border-slate-800 pl-4">
            <p class="text-xs text-slate-500 uppercase tracking-wider font-bold">
              Prochaine fenêtre de tir
            </p>
            <p class="font-mono text-blue-400 font-bold">14j 08h 22m</p>
          </div>
        </div>
      </header>

      <!-- View Container -->
      <div class="flex-1 overflow-y-auto">
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { gameLoop } from './engine/GameLoop'
import { useResourceStore } from './stores/useResourceStore'
import { useResearchStore } from './stores/useResearchStore'
import { useGameStore } from './stores/useGameStore'
import { useFleetStore } from './stores/useFleetStore'
import BaseIcon from './components/ui/BaseIcon.vue'

const route = useRoute()
const resourceStore = useResourceStore()
const researchStore = useResearchStore()
const gameStore = useGameStore()
const fleetStore = useFleetStore()

const navItems = [
  { id: 'dashboard', label: "Vue d'ensemble", icon: 'dashboard', to: '/' },
  { id: 'base', label: 'Base', icon: 'home', to: '/base' },
  { id: 'missions', label: 'Missions', icon: 'globe', to: '/missions' },
  { id: 'fleet', label: 'Flotte & Lanceurs', icon: 'rocket', to: '/fleet' },
  { id: 'rd', label: 'Recherche (R&D)', icon: 'flask', to: '/rd' },
  { id: 'finance', label: 'Finances', icon: 'coins', to: '/finance' },
]

onMounted(() => {
  gameLoop.addTickHandler((deltaTime: number) => {
    gameStore.tick(deltaTime)
    resourceStore.tick(deltaTime)
    researchStore.tick(deltaTime)
    fleetStore.tick(deltaTime)
  })
  gameLoop.start()
})

onUnmounted(() => {
  gameLoop.stop()
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;700&display=swap');

body {
  font-family: 'Inter', sans-serif;
  @apply bg-slate-950 text-slate-200;
  margin: 0;
}

.page-enter-active,
.page-leave-active {
  transition:
    opacity 0.2s,
    transform 0.2s;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  @apply bg-slate-800 rounded-full;
}
::-webkit-scrollbar-thumb:hover {
  @apply bg-slate-700;
}
</style>
