<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" @click="$emit('close')"></div>
        
        <!-- Modal Content -->
        <div class="relative bg-slate-900 border border-slate-800 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <!-- Header -->
          <div class="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
            <div class="flex items-center gap-3">
              <div v-if="icon" class="p-2 bg-blue-600/10 rounded-lg text-blue-400">
                <BaseIcon :name="icon" :size="24" />
              </div>
              <h3 class="text-xl font-bold text-white uppercase tracking-tight">{{ title }}</h3>
            </div>
            <button 
              @click="$emit('close')" 
              class="text-slate-400 hover:text-white p-2 hover:bg-slate-800 rounded-full transition-colors"
            >
              <BaseIcon name="plus" :size="24" class="rotate-45" />
            </button>
          </div>
          
          <!-- Body -->
          <div class="flex-1 overflow-y-auto p-6 lg:p-8">
            <slot></slot>
          </div>
          
          <!-- Footer -->
          <div v-if="$slots.footer" class="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-3">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import BaseIcon from './BaseIcon.vue'

defineProps<{
  show: boolean
  title: string
  icon?: string
}>()

defineEmits(['close'])
</script>
