<template>
  <div
    class="fixed bottom-6 right-6 z-40 transition-all duration-300"
    :class="isOpen ? 'w-96' : 'w-12'"
  >
    <!-- Toggle Button -->
    <button
      @click="isOpen = !isOpen"
      :class="[
        'absolute -top-12 right-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all',
        isOpen ? 'bg-slate-800 text-slate-400 rotate-180' : 'bg-blue-600 text-white animate-pulse'
      ]"
    >
      <BaseIcon name="history" :size="20" />
      <span
        v-if="!isOpen && unreadCount > 0"
        class="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-slate-950"
      >
        {{ unreadCount }}
      </span>
    </button>

    <!-- Console Panel -->
    <div
      v-if="isOpen"
      class="bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl flex flex-col h-[500px] overflow-hidden"
    >
      <!-- Header -->
      <div class="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/50">
        <div class="flex items-center gap-2">
          <BaseIcon name="history" class="text-blue-400" :size="16" />
          <h3 class="text-xs font-black uppercase tracking-widest text-white">{{ $t('log.title') }}</h3>
        </div>
        <button @click="unreadCount = 0" class="text-[10px] text-slate-500 hover:text-slate-300 uppercase font-bold">
          {{ $t('log.markRead') }}
        </button>
      </div>

      <!-- Logs List -->
      <div class="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs">
        <div
          v-for="log in logStore.entries"
          :key="log.id"
          :class="[
            'p-3 rounded-lg border leading-relaxed animate-in fade-in slide-in-from-right-2 duration-300',
            logStyles[log.type]
          ]"
        >
          <div class="flex justify-between items-start gap-2 mb-1 opacity-60 text-[10px] font-bold">
            <span>{{ log.date }}</span>
            <span v-if="log.category" class="uppercase">[{{ log.category }}]</span>
          </div>
          <p class="text-slate-200">{{ log.message }}</p>
        </div>

        <div v-if="logStore.entries.length === 0" class="h-full flex flex-col items-center justify-center text-slate-600 space-y-2 opacity-50">
          <BaseIcon name="history" :size="32" />
          <p class="font-sans italic">{{ $t('log.empty') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useLogStore } from '@/stores/useLogStore'
import BaseIcon from './BaseIcon.vue'

const logStore = useLogStore()
const isOpen = ref(false)
const unreadCount = ref(0)

const logStyles = {
  info: 'bg-slate-800/30 border-slate-700/50 text-blue-400',
  success: 'bg-emerald-900/20 border-emerald-500/20 text-emerald-400',
  warning: 'bg-amber-900/20 border-amber-500/20 text-amber-400',
  error: 'bg-red-900/20 border-red-500/20 text-red-400'
}

watch(() => logStore.entries.length, (newVal, oldVal) => {
  if (!isOpen.value && newVal > oldVal) {
    unreadCount.value += (newVal - oldVal)
  }
})

onMounted(() => {
  if (isOpen.value) unreadCount.value = 0
})

watch(isOpen, (val) => {
  if (val) unreadCount.value = 0
})
</script>
