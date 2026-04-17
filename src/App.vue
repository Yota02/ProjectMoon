<template>
  <div class="flex h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden relative">
    <!-- Sidebar de Navigation -->
    <aside
      class="w-64 bg-slate-900 border-r border-slate-800 flex flex-col hidden md:flex backdrop-blur-xl relative z-10"
    >
      <div class="p-6 overflow-y-auto flex-1">
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

        <nav id="sidebar-nav" class="space-y-2">
          <router-link
            v-for="item in availableNavItems"
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

      <div class="p-6 border-t border-slate-800 space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3 text-sm text-slate-400 font-mono">
            <BaseIcon name="calendar" :size="16" />
            <span class="text-white font-black tracking-widest">{{ gameStore.formattedDate }}</span>
          </div>
        </div>

        <TimeControls id="time-controls" />

        <div
          class="flex items-center justify-between bg-slate-950/80 p-3 rounded-xl border border-slate-800 shadow-inner"
        >
          <span class="text-[10px] text-slate-500 uppercase font-black tracking-widest">{{
            $t('sidebar.rythme')
          }}</span>
          <div class="flex items-center gap-2">
            <div
              :class="[
                'w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]',
                gameStore.gameSpeed === 0 ? 'bg-slate-600' : 'bg-emerald-500 animate-pulse',
              ]"
            ></div>
            <span class="text-[10px] font-mono text-emerald-400 font-bold uppercase">
              {{
                gameStore.gameSpeed === 0
                  ? $t('sidebar.pause')
                  : `x${gameStore.gameSpeed} (1 ${$t('sidebar.day')} / ${0.5 / (gameStore.gameSpeed || 1)}s)`
              }}
            </span>
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
        <div class="flex items-center gap-4">
          <div>
            <h2 class="text-2xl font-bold text-white flex items-center gap-3">
              {{ route.name === 'dashboard' ? $t('header.dashboard') : route.name }}
              
              <!-- Bouton Aide Optionnel -->
              <button 
                v-if="currentViewTutorial"
                @click="tutorialStore.startTutorial(currentViewTutorial, true)"
                class="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-blue-400 hover:border-blue-500/50 transition-all flex items-center justify-center text-xs font-bold"
                title="Aide sur cette section"
              >
                ?
              </button>
            </h2>
            <p class="text-slate-400 text-sm">{{ $t('header.welcome') }}</p>
          </div>
        </div>
        <div class="flex flex-col items-end gap-2">
          <div class="flex items-center gap-2 mb-1">
            <button
              @click="$i18n.locale = 'fr'"
              :class="[
                'text-[10px] font-bold px-1.5 py-0.5 rounded',
                $i18n.locale === 'fr'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-500 hover:text-slate-300',
              ]"
            >
              FR
            </button>
            <button
              @click="$i18n.locale = 'en'"
              :class="[
                'text-[10px] font-bold px-1.5 py-0.5 rounded',
                $i18n.locale === 'en'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-500 hover:text-slate-300',
              ]"
            >
              EN
            </button>
          </div>
          <GlobalResourceBar id="resource-bar" class="hidden xl:flex" />
          <div class="flex items-center gap-6">
            <div class="hidden lg:flex items-center gap-4">
              <div class="text-right">
                <p class="text-xs text-slate-500 uppercase tracking-wider font-bold">
                  {{ $t('header.credits') }}
                </p>
                <p class="font-mono text-emerald-400 font-bold">
                  {{ Math.floor(animatedArgent).toLocaleString() }} €
                </p>
              </div>
              <div class="text-right border-l border-slate-800 pl-4">
                <p class="text-xs text-slate-500 uppercase tracking-wider font-bold">
                  {{ $t('header.science') }}
                </p>
                <p class="font-mono text-blue-400 font-bold">
                  {{ Math.floor(animatedScience).toLocaleString() }}🧪
                </p>
              </div>
            </div>
            <div class="text-right hidden sm:block border-l border-slate-800 pl-4">
              <p class="text-xs text-slate-500 uppercase tracking-wider font-bold">
                {{ $t('header.campaign') }}
              </p>
              <p class="font-mono text-blue-400 font-bold">
                {{ $t('header.tier') }} {{ currentCampaignTierText }}
              </p>
              <p class="text-[11px] text-slate-400">
                {{ $t('header.progress') }} {{ campaignProgressPercent }}%
              </p>
            </div>
          </div>
        </div>
      </header>

      <!-- View Container -->
      <div class="flex-1 overflow-y-auto">
        <router-view v-slot="{ Component }">
          <transition :name="pageTransitionName" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>

    <!-- Global Modals -->
    <EventModal />
    <LogConsole />
    <LaunchCinematicOverlay />
    <TutorialOverlay />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { gameLoop } from './engine/GameLoop'
import { useResourceStore } from './stores/useResourceStore'
import { useResearchStore } from './stores/useResearchStore'
import { useGameStore } from './stores/useGameStore'
import { useFleetStore, type OrbitType } from './stores/useFleetStore'
import { useBaseStore } from './stores/useBaseStore'
import { useMissionStore } from './stores/useMissionStore'
import { usePersonnelStore } from './stores/usePersonnelStore'
import { useSatelliteStore } from './stores/useSatelliteStore'
import { useTutorialStore } from './stores/useTutorialStore'
import { welcomeTutorial, allTutorials } from './config/tutorials'
import BaseIcon from './components/ui/BaseIcon.vue'
import GlobalResourceBar from './components/GlobalResourceBar.vue'
import EventModal from './components/ui/EventModal.vue'
import TimeControls from './components/ui/TimeControls.vue'
import LogConsole from './components/ui/LogConsole.vue'
import LaunchCinematicOverlay from './components/ui/LaunchCinematicOverlay.vue'
import TutorialOverlay from './components/ui/TutorialOverlay.vue'

const { t } = useI18n()
const route = useRoute()
const resourceStore = useResourceStore()
const researchStore = useResearchStore()
const gameStore = useGameStore()
const fleetStore = useFleetStore()
const baseStore = useBaseStore()
const missionStore = useMissionStore()
const personnelStore = usePersonnelStore()
const satelliteStore = useSatelliteStore()
const tutorialStore = useTutorialStore()

const currentViewTutorial = computed(() => {
  const routeName = String(route.name || '').toLowerCase()
  const mapping: Record<string, string> = {
    'dashboard': 'welcome',
    'research': 'research',
    'rd': 'research',
    'base': 'base',
    'personnel': 'personnel',
    'fleet': 'fleet',
    'missions': 'missions',
    'stations': 'stations'
  }
  const tutorialId = mapping[routeName]
  return tutorialId ? allTutorials[tutorialId] : null
})

const sortedMainMissions = computed(() => {
  return [...missionStore.missions]
    .filter((mission) => mission.category === 'principale')
    .sort((a, b) => a.id - b.id)
})

const totalMainMissions = computed(() => sortedMainMissions.value.length)

const completedMainMissions = computed(() => {
  return sortedMainMissions.value.filter((mission) => mission.status === 'Succès').length
})

const currentCampaignTier = computed(() => {
  if (totalMainMissions.value === 0) return 0
  const firstNonSuccessIndex = sortedMainMissions.value.findIndex(
    (mission) => mission.status !== 'Succès',
  )
  if (firstNonSuccessIndex === -1) return totalMainMissions.value
  return firstNonSuccessIndex + 1
})

const currentCampaignTierText = computed(() => {
  if (totalMainMissions.value === 0) return '--/--'
  return `${currentCampaignTier.value}/${totalMainMissions.value}`
})

const currentMainMission = computed(() => {
  if (sortedMainMissions.value.length === 0) return null
  const firstNonSuccessIndex = sortedMainMissions.value.findIndex(
    (mission) => mission.status !== 'Succès',
  )
  if (firstNonSuccessIndex === -1) {
    return sortedMainMissions.value[sortedMainMissions.value.length - 1] ?? null
  }
  return sortedMainMissions.value[firstNonSuccessIndex] ?? null
})

const hasCompatibleReadyLauncherForMission = (requiredOrbit: OrbitType) => {
  return fleetStore.items.some((item) => {
    if (item.status !== 'Prêt') return false
    const design = fleetStore.designs.find((d) => d.id === item.designId)
    if (!design) return false
    if (!design.supportedOrbits.includes(requiredOrbit)) return false
    if (requiredOrbit === 'LUNAR' && !design.canReachMoon) return false
    return true
  })
}

const currentTierStepProgressPercent = computed(() => {
  const mission = currentMainMission.value
  if (!mission) return 0

  if (mission.status === 'Succès') return 100

  const steps = [
    personnelStore.hasIngenieur,
    hasCompatibleReadyLauncherForMission(mission.requiredOrbit),
    mission.cost ? resourceStore.argent >= mission.cost.argent : false,
    false,
  ]

  const done = steps.filter(Boolean).length
  return Math.round((done / steps.length) * 100)
})

const campaignProgressPercent = computed(() => {
  return currentTierStepProgressPercent.value
})

const pageTransitionName = computed(() => {
  const routeName = String(route.name ?? '').toLowerCase()
  if (routeName.includes('solaire') || route.path.startsWith('/solar')) {
    return 'page-space'
  }
  if (routeName.includes('base') || route.path.startsWith('/base')) {
    return 'page-base'
  }
  return 'page-management'
})

const hasBuilding = (buildingId: string) => {
  return baseStore.placedBuildings.some(
    (b) => b.buildingId === buildingId && baseStore.isBuildingConnected(b),
  )
}

const availableNavItems = computed(() => {
  const items = [
    {
      id: 'dashboard',
      label: t('sidebar.dashboard'),
      icon: 'dashboard',
      to: '/',
      requiredBuilding: null,
    },
    { id: 'solar', label: t('sidebar.solar'), icon: 'globe', to: '/solar', requiredBuilding: null },
    {
      id: 'stations',
      label: t('sidebar.stations'),
      icon: 'globe',
      to: '/stations',
      requiredBuilding: 'hq',
    },
    { id: 'base', label: t('sidebar.base'), icon: 'home', to: '/base', requiredBuilding: null },
    {
      id: 'training',
      label: t('sidebar.training'),
      icon: 'graduation',
      to: '/training',
      requiredBuilding: 'training_center',
    },
    {
      id: 'missions',
      label: t('sidebar.missions'),
      icon: 'globe',
      to: '/missions',
      requiredBuilding: 'hq',
    },
    {
      id: 'fleet',
      label: t('sidebar.fleet'),
      icon: 'rocket',
      to: '/fleet',
      requiredBuilding: 'launch_pad',
    },
    {
      id: 'satellites',
      label: t('sidebar.satellites'),
      icon: 'globe',
      to: '/satellites',
      requiredBuilding: 'hq',
    },
    { id: 'rd', label: t('sidebar.rd'), icon: 'flask', to: '/rd', requiredBuilding: 'lab' },
    {
      id: 'finance',
      label: t('sidebar.finance'),
      icon: 'coins',
      to: '/finance',
      requiredBuilding: null,
    },
  ]
  return items.filter((item) => {
    if (!item.requiredBuilding) return true
    return hasBuilding(item.requiredBuilding)
  })
})

const animatedArgent = ref(resourceStore.argent)
const animatedScience = ref(resourceStore.science)

let argentAnimationFrame: number | null = null
let scienceAnimationFrame: number | null = null

const animateCounter = (
  current: number,
  target: number,
  setter: (value: number) => void,
  getFrame: () => number | null,
  setFrame: (id: number | null) => void,
) => {
  const runningFrame = getFrame()
  if (runningFrame !== null) {
    window.cancelAnimationFrame(runningFrame)
    setFrame(null)
  }

  const start = current
  const delta = target - start
  if (Math.abs(delta) < 0.01) {
    setter(target)
    return
  }

  const duration = Math.min(600, Math.max(300, 320 + Math.abs(delta) * 0.04))
  const startTime = performance.now()

  const step = (now: number) => {
    const progress = Math.min(1, (now - startTime) / duration)
    const eased = 1 - Math.pow(1 - progress, 3)
    setter(start + delta * eased)

    if (progress < 1) {
      const frame = window.requestAnimationFrame(step)
      setFrame(frame)
      return
    }

    setFrame(null)
  }

  const initialFrame = window.requestAnimationFrame(step)
  setFrame(initialFrame)
}

watch(
  () => resourceStore.argent,
  (nextArgent) => {
    animateCounter(
      animatedArgent.value,
      nextArgent,
      (value) => {
        animatedArgent.value = value
      },
      () => argentAnimationFrame,
      (id) => {
        argentAnimationFrame = id
      },
    )
  },
)

watch(
  () => resourceStore.science,
  (nextScience) => {
    animateCounter(
      animatedScience.value,
      nextScience,
      (value) => {
        animatedScience.value = value
      },
      () => scienceAnimationFrame,
      (id) => {
        scienceAnimationFrame = id
      },
    )
  },
)


onMounted(() => {
  gameLoop.addTickHandler((deltaTime: number) => {
    gameStore.tick(deltaTime)
    resourceStore.tick(deltaTime)
    researchStore.tick(deltaTime)
    fleetStore.tick(deltaTime)
    satelliteStore.tick(deltaTime)
  })
  gameLoop.start()
})

onUnmounted(() => {
  gameLoop.stop()
  if (argentAnimationFrame !== null) window.cancelAnimationFrame(argentAnimationFrame)
  if (scienceAnimationFrame !== null) window.cancelAnimationFrame(scienceAnimationFrame)
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;700&display=swap');

body {
  font-family: 'Inter', sans-serif;
  @apply bg-slate-950 text-slate-200;
  margin: 0;
}

.page-management-enter-active,
.page-management-leave-active {
  transition:
    opacity 0.24s ease,
    transform 0.24s ease;
}

.page-management-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.page-management-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.page-space-enter-active,
.page-space-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease,
    filter 0.3s ease;
}

.page-space-enter-from {
  opacity: 0;
  transform: scale(0.96);
  filter: blur(4px);
}

.page-space-leave-to {
  opacity: 0;
  transform: scale(1.03);
  filter: blur(2px);
}

.page-base-enter-active,
.page-base-leave-active {
  transition:
    opacity 0.28s ease,
    transform 0.28s ease,
    clip-path 0.28s ease;
}

.page-base-enter-from {
  opacity: 0;
  transform: translateX(26px);
  clip-path: inset(0 0 0 18%);
}

.page-base-leave-to {
  opacity: 0;
  transform: translateX(-18px);
  clip-path: inset(0 14% 0 0);
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
