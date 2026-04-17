<template>
  <transition name="launch-overlay">
    <div
      v-if="visible"
      class="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-slate-950/95 backdrop-blur-md"
    >
      <!-- Effet de flash à l'allumage -->
      <div 
        v-if="showFlash" 
        class="absolute inset-0 z-[250] bg-white animate-flash-out pointer-events-none"
      ></div>

      <!-- Arrière-plan cinématique -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute inset-0 bg-gradient-to-t from-orange-500/10 via-transparent to-transparent"></div>
        <!-- Étoiles lointaines -->
        <div v-for="n in 60" :key="'star-'+n" 
          class="absolute rounded-full bg-white"
          :class="{ 'animate-pulse': n % 3 === 0 }"
          :style="{
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
            width: (Math.random() * 2 + 1) + 'px',
            height: (Math.random() * 2 + 1) + 'px',
            animationDelay: Math.random() * 5 + 's',
            opacity: Math.random() * 0.7 + 0.1
          }"
        ></div>
      </div>

      <!-- Tour de lancement -->
      <div class="absolute bottom-0 w-full h-full flex justify-center items-end pointer-events-none transition-transform duration-[3000ms]"
        :style="phase === 'ascent' ? 'transform: translateY(200px)' : ''"
      >
        <div class="w-80 h-[600px] border-r-8 border-slate-800/60 relative -translate-x-32 flex flex-col justify-end">
          <div v-for="n in 12" :key="'str-'+n" 
            class="w-full h-1 bg-slate-800/60 mb-12 relative"
          >
            <div class="absolute right-0 top-0 w-12 h-24 border-r-4 border-t-4 border-slate-700/40 -translate-y-full"></div>
          </div>
        </div>
      </div>

      <!-- Conteneur principal de l'animation -->
      <div 
        class="relative w-full max-w-4xl h-full flex flex-col items-center justify-center transition-transform duration-75"
        :class="{ 'animate-shake': phase === 'ignition' || phase === 'ascent' }"
      >
        <!-- Infos Mission -->
        <div class="absolute top-20 text-center z-10 animate-fade-in">
          <h3 class="text-blue-400 text-xs font-black uppercase tracking-[0.5em] mb-3 opacity-60">
            Internal Systems Check: OK
          </h3>
          <h2 class="text-5xl font-black text-white tracking-tighter drop-shadow-[0_0_30px_rgba(59,130,246,0.5)] mb-2">
            {{ missionName }}
          </h2>
          <div class="flex items-center justify-center gap-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            <span>Lat: 28.57° N</span>
            <span>Long: 80.64° W</span>
            <span class="text-emerald-500 animate-pulse">Telemetry Active</span>
          </div>
        </div>

        <!-- Compte à rebours géant -->
        <div v-if="phase === 'countdown'" class="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span class="text-[24rem] font-black text-white/[0.03] select-none animate-countdown-zoom">
            {{ countdown }}
          </span>
        </div>

        <!-- La Fusée -->
        <div 
          class="relative transition-all duration-[4000ms] ease-in"
          :style="rocketStyle"
        >
          <!-- Fumée volumétrique -->
          <div v-if="phase === 'ignition' || phase === 'ascent'" class="absolute -bottom-16 left-1/2 -translate-x-1/2 w-[600px] h-64 flex justify-center items-end pointer-events-none">
            <div v-for="p in 30" :key="'smoke-'+p"
              class="absolute rounded-full bg-slate-200/20 blur-2xl animate-smoke-spread"
              :style="getSmokePuffStyle(p)"
            ></div>
          </div>

          <!-- Effet de chaleur au sol -->
          <div v-if="phase === 'ignition'" class="absolute -bottom-8 left-1/2 -translate-x-1/2 w-96 h-32 bg-orange-600/20 blur-3xl rounded-full animate-pulse"></div>

          <!-- Flammes propulsives -->
          <div v-if="phase === 'ignition' || phase === 'ascent'" class="absolute -bottom-48 left-1/2 -translate-x-1/2 w-16 flex flex-col items-center z-0">
            <!-- Cœur de flamme -->
            <div class="w-12 h-64 bg-gradient-to-t from-transparent via-orange-500 to-white rounded-full blur-sm animate-flame"></div>
            <!-- Éclat intérieur -->
            <div class="w-6 h-48 -mt-56 bg-white rounded-full blur-md animate-flame-inner"></div>
            <!-- Particules d'étincelles -->
            <div v-for="s in 10" :key="'spark-'+s"
              class="absolute w-1 h-1 bg-yellow-200 rounded-full animate-spark"
              :style="getSparkStyle(s)"
            ></div>
          </div>

          <!-- SVG de la fusée (Détaillé) -->
          <svg width="100" height="220" viewBox="0 0 100 220" fill="none" xmlns="http://www.w3.org/2000/svg" class="relative z-10 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
            <!-- Coiffe -->
            <path d="M50 0C50 0 25 30 25 60H75C75 30 50 0 50 0Z" fill="#F8FAFC" />
            <!-- Corps Principal -->
            <rect x="25" y="60" width="50" height="120" fill="url(#rocketGrad)" />
            <!-- Bandes Noires Style Saturn V -->
            <rect x="25" y="80" width="50" height="20" fill="#1E293B" />
            <rect x="25" y="140" width="50" height="20" fill="#1E293B" />
            <!-- Texte AERO -->
            <text x="50" y="115" text-anchor="middle" fill="#94A3B8" font-size="8" font-weight="900" font-family="monospace" opacity="0.5">AERO</text>
            
            <!-- Boosters Latéraux -->
            <path d="M10 110C10 110 0 130 0 160V190H20V160C20 130 10 110 10 110Z" fill="#E2E8F0" />
            <path d="M90 110C90 110 100 130 100 160V190H80V160C80 130 90 110 90 110Z" fill="#E2E8F0" />
            
            <!-- Ailerons -->
            <path d="M25 160L5 200H25V160Z" fill="#64748B" />
            <path d="M75 160L95 200H75V160Z" fill="#64748B" />
            <path d="M50 170L40 205H60L50 170Z" fill="#475569" />
            
            <!-- Tuyères -->
            <rect x="35" y="180" width="10" height="15" rx="2" fill="#334155" />
            <rect x="55" y="180" width="10" height="15" rx="2" fill="#334155" />
            <rect x="5" y="190" width="10" height="10" rx="1" fill="#334155" />
            <rect x="85" y="190" width="10" height="10" rx="1" fill="#334155" />

            <defs>
              <linearGradient id="rocketGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#F1F5F9" />
                <stop offset="50%" stop-color="#E2E8F0" />
                <stop offset="100%" stop-color="#F1F5F9" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <!-- Overlay de texte de statut -->
        <div class="absolute bottom-20 left-0 w-full flex flex-col items-center gap-6">
          <div class="bg-slate-900/80 border border-slate-700 px-8 py-4 rounded-full backdrop-blur-xl flex items-center gap-4 shadow-2xl">
            <div class="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
            <p class="text-blue-400 font-mono text-lg font-bold tracking-[0.2em]">
              STATUS: <span class="text-white uppercase">{{ statusText }}</span>
            </p>
          </div>

          <!-- Bouton Skip -->
          <button 
            @click="hideOverlay"
            class="text-slate-500 hover:text-white text-[10px] uppercase tracking-[0.3em] transition-colors border-b border-transparent hover:border-slate-500 pb-1"
          >
            Skip Cinematic [ESC]
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { gameEvents } from '@/engine/EventBus'

type Phase = 'idle' | 'countdown' | 'ignition' | 'ascent' | 'complete'

const visible = ref(false)
const showFlash = ref(false)
const phase = ref<Phase>('idle')
const countdown = ref(5)
const missionName = ref('')
const activeMissionId = ref<number | null>(null)
const timeouts: number[] = []

const statusText = computed(() => {
  switch (phase.value) {
    case 'countdown': return `T-MINUS ${countdown.value}`
    case 'ignition': return 'Main Engine Ignition'
    case 'ascent': return 'Liftoff'
    case 'complete': return 'Successful Injection'
    default: return 'Standby'
  }
})

const rocketStyle = computed(() => {
  if (phase.value === 'ascent') {
    return { transform: 'translateY(-140vh) scale(0.6)', transitionTimingFunction: 'cubic-bezier(0.6, 0, 0.4, 1)' }
  }
  return { transform: 'translateY(0) scale(1.2)' }
})

const getSmokePuffStyle = (i: number) => {
  const size = 100 + Math.random() * 200
  const left = 50 + (Math.random() - 0.5) * 80
  const delay = Math.random() * 3
  const duration = 2 + Math.random() * 2
  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${left}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
    opacity: phase.value === 'ignition' ? 0.9 : 0.5
  }
}

const getSparkStyle = (i: number) => {
  return {
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 1}s`,
    animationDuration: `${0.5 + Math.random()}s`
  }
}

const startSequence = () => {
  phase.value = 'countdown'
  countdown.value = 5
  
  const timer = window.setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      window.clearInterval(timer)
      triggerIgnition()
    }
  }, 1000)
  
  timeouts.push(timer)
}

const triggerIgnition = () => {
  phase.value = 'ignition'
  showFlash.value = true
  
  window.setTimeout(() => {
    showFlash.value = false
  }, 150)
  
  timeouts.push(window.setTimeout(() => {
    phase.value = 'ascent'
  }, 2000))

  timeouts.push(window.setTimeout(() => {
    hideOverlay()
  }, 6500))
}

const hideOverlay = () => {
  while (timeouts.length) {
    const id = timeouts.pop()
    if (id !== undefined) window.clearTimeout(id)
  }
  visible.value = false
  phase.value = 'idle'
}

const onMissionLaunched = (payload: { missionId: number; missionName: string }) => {
  visible.value = true
  missionName.value = payload.missionName
  activeMissionId.value = payload.missionId
  startSequence()
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && visible.value) {
    hideOverlay()
  }
}

onMounted(() => {
  gameEvents.on('mission-launched', onMissionLaunched)
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  gameEvents.off('mission-launched', onMissionLaunched)
  window.removeEventListener('keydown', handleKeydown)
  hideOverlay()
})
</script>

<style scoped>
.launch-overlay-enter-active,
.launch-overlay-leave-active {
  transition: opacity 0.8s ease;
}

.launch-overlay-enter-from,
.launch-overlay-leave-to {
  opacity: 0;
}

@keyframes smoke-spread {
  0% { transform: translateY(0) scale(0.5); opacity: 0; }
  10% { opacity: 0.8; }
  100% { transform: translateY(-150px) scale(2.5) translateX(calc(var(--tw-translate-x) + 100px)); opacity: 0; }
}

.animate-smoke-spread {
  animation: smoke-spread 4s ease-out infinite;
}

@keyframes flame {
  0%, 100% { transform: scaleY(1) scaleX(1); opacity: 0.8; filter: blur(2px); }
  50% { transform: scaleY(1.3) scaleX(0.85); opacity: 1; filter: blur(4px); }
}

.animate-flame {
  animation: flame 0.08s ease-in-out infinite;
  transform-origin: top center;
}

@keyframes flame-inner {
  0%, 100% { transform: scaleY(1); opacity: 0.7; }
  50% { transform: scaleY(1.4); opacity: 1; }
}

.animate-flame-inner {
  animation: flame-inner 0.04s ease-in-out infinite;
  transform-origin: top center;
}

@keyframes spark {
  0% { transform: translateY(0) rotate(0deg); opacity: 1; }
  100% { transform: translateY(200px) rotate(360deg); opacity: 0; }
}

.animate-spark {
  animation: spark 1s linear infinite;
}

@keyframes shake {
  0%, 100% { transform: translate(0, 0); }
  20% { transform: translate(-3px, 3px); }
  40% { transform: translate(3px, -3px); }
  60% { transform: translate(-3px, -3px); }
  80% { transform: translate(3px, 3px); }
}

.animate-shake {
  animation: shake 0.05s linear infinite;
}

@keyframes countdown-zoom {
  0% { transform: scale(1); opacity: 0.05; }
  100% { transform: scale(1.5); opacity: 0; }
}

.animate-countdown-zoom {
  animation: countdown-zoom 1s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes flash-out {
  0% { opacity: 1; }
  100% { opacity: 0; }
}

.animate-flash-out {
  animation: flash-out 0.8s ease-out forwards;
}

.animate-fade-in {
  animation: fade-in 1.5s ease-out forwards;
}

@keyframes fade-in {
  0% { opacity: 0; transform: translateY(-20px); }
  100% { opacity: 1; transform: translateY(0); }
}
</style>
