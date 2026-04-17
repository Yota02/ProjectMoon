<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { useTutorialStore } from '@/stores/useTutorialStore'

const tutorialStore = useTutorialStore()
const currentStep = computed(() => tutorialStore.currentStep)

const highlightStyle = ref({
  top: '0px',
  left: '0px',
  width: '0px',
  height: '0px',
  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
  borderRadius: '8px',
  position: 'absolute' as const,
  zIndex: 9998,
  pointerEvents: 'none' as const,
  transition: 'all 0.3s ease'
})

const tooltipStyle = ref({
  position: 'absolute' as const,
  zIndex: 9999,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  transition: 'all 0.3s ease'
})

const updateHighlight = () => {
  if (!currentStep.value?.targetElement) {
    // Si pas de cible, on centre la bulle et on assombrit tout
    highlightStyle.value = {
      ...highlightStyle.value,
      top: '50%',
      left: '50%',
      width: '0px',
      height: '0px',
    }
    tooltipStyle.value = {
      ...tooltipStyle.value,
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
    }
    return
  }

  const el = document.querySelector(currentStep.value.targetElement)
  if (el && el instanceof HTMLElement) {
    const rect = el.getBoundingClientRect()
    
    // Si l'élément n'est pas visible (ex: caché par un v-if ou hors écran)
    if (rect.width === 0 || rect.height === 0) {
      // On retente avec un petit délai ou on passe en mode "sans cible"
      return
    }

    const padding = 8
    
    highlightStyle.value = {
      ...highlightStyle.value,
      top: `${rect.top - padding}px`,
      left: `${rect.left - padding}px`,
      width: `${rect.width + padding * 2}px`,
      height: `${rect.height + padding * 2}px`,
    }

    // Calculer la position de la tooltip par rapport à l'élément
    let top = rect.bottom + 20
    let left = rect.left + rect.width / 2
    let transform = 'translateX(-50%)'

    if (currentStep.value.position === 'top') {
      top = rect.top - 20
      transform = 'translate(-50%, -100%)'
    } else if (currentStep.value.position === 'left') {
      top = rect.top + rect.height / 2
      left = rect.left - 20
      transform = 'translate(-100%, -50%)'
    } else if (currentStep.value.position === 'right') {
      top = rect.top + rect.height / 2
      left = rect.right + 20
      transform = 'translate(0, -50%)'
    } else if (currentStep.value.position === 'center') {
       top = window.innerHeight / 2
       left = window.innerWidth / 2
       transform = 'translate(-50%, -50%)'
    }

    tooltipStyle.value = {
      ...tooltipStyle.value,
      top: `${top}px`,
      left: `${left}px`,
      transform
    }
  } else {
    // Élement introuvable : on affiche la bulle au centre pour ne pas bloquer
    tooltipStyle.value = {
      ...tooltipStyle.value,
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
    }
    highlightStyle.value = {
      ...highlightStyle.value,
      width: '0px',
      height: '0px',
    }
  }
}

// Mettre à jour la position au scroll ou redimensionnement
onMounted(() => {
  window.addEventListener('resize', updateHighlight)
  window.addEventListener('scroll', updateHighlight)
  tutorialStore.loadProgress()
})

onUnmounted(() => {
  window.removeEventListener('resize', updateHighlight)
  window.removeEventListener('scroll', updateHighlight)
})

watch(() => currentStep.value, () => {
  // Petit délai pour laisser le DOM se mettre à jour si nécessaire
  setTimeout(updateHighlight, 50)
}, { deep: true })
</script>

<template>
  <div v-if="tutorialStore.isActive && currentStep" class="fixed inset-0 z-[9999] pointer-events-none">
    <!-- Overlay sombre avec trou -->
    <div :style="highlightStyle"></div>

    <!-- Bulle d'aide -->
    <div 
      :style="tooltipStyle" 
      class="pointer-events-auto bg-slate-800 border-2 border-blue-500 p-6 rounded-xl shadow-2xl max-w-sm w-full text-white"
    >
      <h3 class="text-xl font-bold mb-2 text-blue-400">{{ currentStep.title }}</h3>
      <p class="text-slate-300 mb-6 leading-relaxed">
        {{ currentStep.content }}
      </p>

      <div class="flex justify-between items-center">
        <button 
          @click="tutorialStore.skipTutorial" 
          class="text-sm text-slate-400 hover:text-white transition-colors"
        >
          Passer
        </button>
        <div class="flex gap-2">
          <button 
            v-if="tutorialStore.currentStepIndex > 0"
            @click="tutorialStore.prevStep" 
            class="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-bold transition-all"
          >
            Précédent
          </button>
          <button 
            @click="tutorialStore.nextStep" 
            class="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-bold transition-all transform hover:scale-105"
          >
            {{ tutorialStore.currentStepIndex === tutorialStore.activeTutorial!.steps.length - 1 ? 'Terminer' : 'Suivant' }}
          </button>
        </div>
      </div>

      <!-- Indicateur de progression -->
      <div class="mt-4 flex gap-1 justify-center">
        <div 
          v-for="(_, index) in tutorialStore.activeTutorial?.steps" 
          :key="index"
          class="h-1 rounded-full transition-all"
          :class="[index === tutorialStore.currentStepIndex ? 'bg-blue-500 w-4' : 'bg-slate-700 w-2']"
        ></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Optionnel : animation de pulsation sur le highlight */
@keyframes pulse-border {
  0% { box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7), 0 0 0 0px rgba(59, 130, 246, 0.5); }
  100% { box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7), 0 0 0 10px rgba(59, 130, 246, 0); }
}

div[style*="box-shadow"] {
  animation: pulse-border 2s infinite;
}
</style>
