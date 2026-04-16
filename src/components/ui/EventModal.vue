<template>
  <Transition name="fade">
    <div v-if="eventStore.activeEventId && activeDef" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"></div>

      <!-- Modal Container -->
      <div
        class="relative w-full max-w-2xl bg-slate-900/40 border border-slate-800 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in zoom-in duration-300"
      >
        <!-- Modal Glow -->
        <div 
          class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"
          :class="{ 'via-red-500': activeDef.type === 'crisis', 'via-emerald-500': activeDef.type === 'opportunity' }"
        ></div>

        <div class="p-8 md:p-12">
          <!-- Type Badge -->
          <div class="flex justify-center mb-6">
            <span
              class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border"
              :class="{
                'bg-blue-500/10 text-blue-400 border-blue-500/20': activeDef.type === 'info',
                'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]': activeDef.type === 'crisis',
                'bg-emerald-500/10 text-emerald-400 border-emerald-200/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]': activeDef.type === 'opportunity'
              }"
            >
              {{ activeDef.type }}
            </span>
          </div>

          <!-- Content -->
          <div class="text-center space-y-4">
            <h2 class="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
              {{ activeDef.title }}
            </h2>
            <p class="text-slate-400 text-lg leading-relaxed max-w-lg mx-auto">
              {{ activeDef.description }}
            </p>
          </div>

          <!-- Choices -->
          <div class="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              v-for="choice in activeDef.choices"
              :key="choice.id"
              @click="eventStore.resolveEvent(choice.id)"
              class="group relative p-6 rounded-2xl border border-slate-800 bg-slate-800/30 hover:bg-slate-700/40 transition-all text-left overflow-hidden active:scale-95"
            >
              <div class="relative z-10">
                <p class="text-white font-bold group-hover:text-blue-400 transition-colors">
                  {{ choice.label }}
                </p>
              </div>
              <!-- Hover Glow -->
              <div class="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useEventStore } from '@/stores/useEventStore'

const eventStore = useEventStore()
const activeDef = computed(() => eventStore.activeEventDef)
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
