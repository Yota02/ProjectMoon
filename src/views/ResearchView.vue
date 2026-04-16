<template>
  <div class="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto w-full">
    
    <!-- En-tête de la page -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <BaseIcon name="flask" :size="32" class="text-blue-500" />
          DÉPARTEMENT R&D
        </h1>
        <p class="text-slate-400 mt-2">Débloquez de nouvelles technologies pour conquérir le système solaire.</p>
      </div>
      
      <div class="flex items-center gap-4 bg-slate-900/80 border border-slate-700/50 p-4 rounded-2xl backdrop-blur-sm">
        <div class="text-right">
          <p class="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Science disponible</p>
          <p class="text-2xl font-mono text-blue-400 font-bold leading-none">{{ resourceStore.science }} 🧪</p>
        </div>
        <div class="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
          <BaseIcon name="flask" :size="20" class="text-blue-400" />
        </div>
      </div>
    </div>

    <!-- Navigation par sections -->
    <div class="flex flex-wrap gap-2 border-b border-slate-800 pb-px">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="[
          'px-6 py-4 text-sm font-bold transition-all relative',
          activeTab === tab.id 
            ? 'text-blue-400' 
            : 'text-slate-500 hover:text-slate-300'
        ]"
      >
        <span class="flex items-center gap-2">
          <BaseIcon :name="tab.icon" :size="16" />
          {{ tab.label }}
        </span>
        <div 
          v-if="activeTab === tab.id" 
          class="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
        ></div>
      </button>
    </div>

    <!-- Contenu de la section active -->
    <div class="min-h-[400px]">
      <transition name="fade-slide" mode="out-in">
        <ResearchSection 
          :key="activeTab"
          :title="activeTabLabel"
          :description="activeTabDescription"
          :researches="researchStore.getByCategory(activeTab)"
          :has-active-research="!!researchStore.activeResearchId"
          @start="researchStore.startResearch($event)"
          @navigate-to="handleNavigation"
        />
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useResearchStore } from '../stores/useResearchStore'
import { useResourceStore } from '../stores/useResourceStore'
import ResearchSection from '../components/research/ResearchSection.vue'
import BaseIcon from '../components/ui/BaseIcon.vue'

const researchStore = useResearchStore()
const resourceStore = useResourceStore()

const activeTab = ref('Lanceurs')

const tabs = [
  { id: 'Lanceurs', label: 'Lanceurs', icon: 'rocket', description: 'Améliorez vos capacités de mise en orbite et la puissance de vos fusées.' },
  { id: 'Bâtiments', label: 'Bâtiments', icon: 'building', description: 'Développez vos infrastructures pour optimiser vos opérations au sol.' },
  { id: 'Moteur', label: 'Moteur', icon: 'battery', description: 'Innovez dans les systèmes de propulsion pour des voyages plus longs.' },
  { id: 'Informatique', label: 'Informatique', icon: 'cpu', description: 'Améliorez la fiabilité et l\'automatisation de vos systèmes.' },
  { id: 'Humain', label: 'Humain', icon: 'user', description: 'Investissez dans la santé et l\'entraînement de vos équipes spatiale.' },
  { id: 'Economique', label: 'Economique', icon: 'coins', description: 'Optimisez vos revenus et votre gestion financière.' },
  { id: 'Colonisation', label: 'Colonisation', icon: 'globe', description: 'Établissez des bases durables sur d\'autres corps célestes.' },
]

const activeTabLabel = computed(() => activeTab.value)
const activeTabDescription = computed(() => tabs.find(t => t.id === activeTab.value)?.description || '')

const handleNavigation = (researchId: string) => {
  const research = researchStore.researches[researchId]
  if (research) {
    activeTab.value = research.category
    
    // On pourrait ajouter un scroll vers l'élément ici si besoin
    setTimeout(() => {
      const el = document.getElementById(`research-${researchId}`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        el.classList.add('ring-2', 'ring-blue-500', 'ring-offset-4', 'ring-offset-slate-900')
        setTimeout(() => {
          el.classList.remove('ring-2', 'ring-blue-500', 'ring-offset-4', 'ring-offset-slate-900')
        }, 2000)
      }
    }, 100)
  }
}
</script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease-out;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
</style>
