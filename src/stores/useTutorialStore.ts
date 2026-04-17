import { defineStore } from 'pinia'
import type { Tutorial, TutorialStep } from '@/types/tutorial'
import { allTutorials } from '@/config/tutorials'

export const useTutorialStore = defineStore('tutorial', {
  state: () => ({
    activeTutorial: null as Tutorial | null,
    currentStepIndex: -1,
    completedTutorials: [] as string[],
    isPaused: false,
  }),
  getters: {
    currentStep: (state): TutorialStep | null => {
      if (!state.activeTutorial || state.currentStepIndex === -1) return null
      return state.activeTutorial.steps[state.currentStepIndex]
    },
    isActive: (state) => state.activeTutorial !== null && !state.isPaused,
  },
  actions: {
    startTutorial(tutorial: Tutorial, force = false) {
      if (!force && this.completedTutorials.includes(tutorial.id)) return
      this.activeTutorial = tutorial
      this.currentStepIndex = 0
    },
    startTutorialById(id: string, force = true) {
      const tutorial = allTutorials[id]
      if (tutorial) {
        this.startTutorial(tutorial, force)
      }
    },
    nextStep() {
      if (!this.activeTutorial) return
      if (this.currentStepIndex < this.activeTutorial.steps.length - 1) {
        this.currentStepIndex++
      } else {
        this.completeTutorial()
      }
    },
    prevStep() {
      if (this.currentStepIndex > 0) {
        this.currentStepIndex--
      }
    },
    completeTutorial() {
      if (this.activeTutorial) {
        this.completedTutorials.push(this.activeTutorial.id)
        this.saveProgress()
      }
      this.activeTutorial = null
      this.currentStepIndex = -1
    },
    skipTutorial() {
      this.activeTutorial = null
      this.currentStepIndex = -1
    },
    saveProgress() {
      localStorage.setItem('completed_tutorials', JSON.stringify(this.completedTutorials))
    },
    loadProgress() {
      const saved = localStorage.getItem('completed_tutorials')
      if (saved) {
        this.completedTutorials = JSON.parse(saved)
      }
    }
  }
})
