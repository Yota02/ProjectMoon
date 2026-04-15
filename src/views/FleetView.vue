<template>
  <div class="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto">
    <!-- En-tête avec statistiques -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard 
        title="Lanceurs Prêts" 
        :value="fleetStore.readyLaunchers.length" 
        icon="rocket" 
        color-class="bg-emerald-500"
        icon-color-class="text-emerald-400"
      />
      <StatCard 
        title="Vaisseaux Prêts" 
        :value="fleetStore.readyShips.length" 
        icon="globe" 
        color-class="bg-blue-500"
        icon-color-class="text-blue-400"
      />
      <StatCard 
        title="En Construction" 
        :value="buildingItems.length" 
        icon="dashboard" 
        color-class="bg-orange-500"
        icon-color-class="text-orange-400"
      />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Section Construction (Designs disponibles) -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Bureau d'Études : Création de nouveaux designs -->
        <div class="bg-gradient-to-br from-slate-900 to-indigo-950/30 border border-blue-500/20 p-6 rounded-2xl shadow-xl">
          <div class="flex items-center gap-3 mb-6">
            <div class="p-2 bg-blue-500/10 rounded-lg">
              <BaseIcon name="flask" class="text-blue-400" />
            </div>
            <div>
              <h3 class="text-lg font-bold text-white">Bureau d'Études</h3>
              <p class="text-xs text-slate-400">Concevez vos propres modèles de lanceurs.</p>
            </div>
          </div>

          <div v-if="fleetStore.availableDesigns.length > 0" class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="sm:col-span-1">
              <label class="block text-[10px] uppercase font-black text-slate-500 mb-1.5 tracking-widest">Base de Châssis</label>
              <select v-model="newDesignBase" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 focus:border-blue-500/50 outline-none">
                <option v-for="d in fleetStore.availableDesigns" :key="d.id" :value="d.id">{{ d.name }}</option>
              </select>
            </div>
            <div class="sm:col-span-1">
              <label class="block text-[10px] uppercase font-black text-slate-500 mb-1.5 tracking-widest">Nom du Modèle</label>
              <input v-model="newDesignName" type="text" placeholder="ex: Ariane 6, Falcon..." class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 focus:border-blue-500/50 outline-none" />
            </div>
            <div class="sm:col-span-1 flex items-end">
              <button 
                @click="handleCreateDesign"
                class="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-900/20"
              >
                Créer Modèle
              </button>
            </div>
          </div>
          <div v-else class="text-center py-4 bg-slate-950/50 rounded-xl border border-dashed border-slate-800">
             <p class="text-xs text-slate-500 italic">Débloquez des châssis de base via la R&D pour concevoir vos propres modèles.</p>
          </div>
        </div>

        <div class="flex items-center justify-between">
          <h3 class="text-xl font-bold text-white flex items-center gap-2">
            <BaseIcon name="rocket" class="text-blue-500" />
            Centre d'Assemblage
          </h3>
          <span class="text-xs font-mono text-slate-500 uppercase tracking-widest">Plans Disponibles</span>
        </div>

        <div v-if="fleetStore.availableDesigns.length === 0" class="bg-slate-900/50 border border-dashed border-slate-800 p-12 rounded-2xl text-center">
          <div class="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <BaseIcon name="flask" class="text-slate-600" :size="32" />
          </div>
          <h4 class="text-slate-400 font-medium">Aucun plan débloqué</h4>
          <p class="text-slate-500 text-sm mt-2 max-w-xs mx-auto">Recherchez de nouvelles technologies de lanceurs dans le centre de R&D pour commencer la production.</p>
          <router-link to="/rd" class="mt-6 inline-block text-blue-400 hover:text-blue-300 text-sm font-bold">Aller à la R&D →</router-link>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            v-for="design in fleetStore.availableDesigns" 
            :key="design.id"
            class="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors group"
          >
            <div class="flex justify-between items-start mb-4">
              <div>
                <h4 class="font-bold text-slate-100 group-hover:text-blue-400 transition-colors">{{ design.name }}</h4>
                <p class="text-xs text-slate-500 mt-1 line-clamp-2">{{ design.description }}</p>
              </div>
              <div class="bg-slate-800 p-2 rounded-lg">
                <BaseIcon :name="design.type === 'launcher' ? 'rocket' : 'globe'" class="text-slate-400" />
              </div>
            </div>

            <div class="space-y-3 mb-6">
              <div class="flex justify-between text-xs">
                <span class="text-slate-500">Coût:</span>
                <span class="font-mono text-emerald-400 font-bold">{{ design.cost.toLocaleString() }} €</span>
              </div>
              <div class="flex justify-between text-xs">
                <span class="text-slate-500">Temps:</span>
                <span class="font-mono text-slate-300">{{ design.constructionTime }}j</span>
              </div>
              <div class="flex justify-between text-xs">
                <span class="text-slate-500">Fiabilité:</span>
                <span class="font-mono text-blue-400">{{ design.baseReliability }}%</span>
              </div>
            </div>

            <button 
              @click="fleetStore.build(design.id)"
              :disabled="resourceStore.argent < design.cost"
              :class="[
                'w-full py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all',
                resourceStore.argent >= design.cost 
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20' 
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
              ]"
            >
              Lancer Construction
            </button>
          </div>
        </div>
      </div>

      <!-- Section Ma Flotte (État actuel) -->
      <div class="space-y-6">
        <h3 class="text-xl font-bold text-white flex items-center gap-2">
          <BaseIcon name="dashboard" class="text-emerald-500" />
          Inventaire & État
        </h3>

        <div class="space-y-2">
          <div v-if="fleetStore.items.length === 0" class="text-center py-10 bg-slate-900/30 rounded-xl border border-slate-800/50">
            <p class="text-slate-500 text-sm italic">Votre flotte est vide.</p>
          </div>
          
          <FleetItem 
            v-for="item in fleetStore.items" 
            :key="item.id"
            :name="item.name"
            :status="item.status"
            :reliability="item.reliability"
            :progress="item.constructionProgress"
            :icon="fleetStore.designs.find(d => d.id === item.designId)?.type === 'launcher' ? 'rocket' : 'globe'"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import { useFleetStore } from '../stores/useFleetStore'
import { useResourceStore } from '../stores/useResourceStore'
import StatCard from '../components/ui/StatCard.vue'
import BaseIcon from '../components/ui/BaseIcon.vue'
import FleetItem from '../components/ui/FleetItem.vue'

const fleetStore = useFleetStore()
const resourceStore = useResourceStore()

const newDesignName = ref('')
const newDesignBase = ref('')

// On initialise le châssis par défaut quand les plans deviennent disponibles
watchEffect(() => {
  if (fleetStore.availableDesigns.length > 0 && !newDesignBase.value) {
    newDesignBase.value = fleetStore.availableDesigns[0].id
  }
})

const handleCreateDesign = () => {
  if (!newDesignBase.value) return
  
  const base = fleetStore.designs.find(d => d.id === newDesignBase.value)
  if (!base) return

  fleetStore.createDesign(newDesignName.value, base.type, base.id)
  newDesignName.value = ''
}

const buildingItems = computed(() => 
  fleetStore.items.filter(i => i.status === 'En construction')
)
</script>
