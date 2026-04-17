import { defineStore } from 'pinia'
import { gameEvents } from '@/engine/EventBus'

export interface LogEntry {
  id: string
  date: string
  timestamp: number
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  category?: string
}

export const useLogStore = defineStore('log', {
  state: () => ({
    entries: [] as LogEntry[],
    maxEntries: 100,
  }),
  actions: {
    addLog(message: string, type: LogEntry['type'] = 'info', category?: string) {
      const id = Math.random().toString(36).substring(2, 9)
      const entry: LogEntry = {
        id,
        date: '', // Will be filled below
        timestamp: Date.now(),
        message,
        type,
        category,
      }

      this.entries.unshift(entry)

      if (this.entries.length > this.maxEntries) {
        this.entries.pop()
      }
    },
    // We'll call this from gameStore to ensure date is synced
    addGameLog(date: string, message: string, type: LogEntry['type'] = 'info', category?: string) {
      const id = Math.random().toString(36).substring(2, 9)
      const entry: LogEntry = {
        id,
        date,
        timestamp: Date.now(),
        message,
        type,
        category,
      }
      this.entries.unshift(entry)
      if (this.entries.length > this.maxEntries) {
        this.entries.pop()
      }
    },
    setupListeners() {
      gameEvents.on('mission-success', (payload: any) => {
        this.addGameLog(payload.date || '---', `Mission "${payload.missionName}" réussie !`, 'success', 'Mission')
      })

      gameEvents.on('mission-failed', (payload: any) => {
        this.addGameLog(payload.date || '---', `ALERTE : La mission "${payload.missionName}" a échoué.`, 'error', 'Mission')
      })

      gameEvents.on('station-low-resource', (payload: any) => {
        this.addGameLog(payload.date || '---', `ALERTE : La Station ${payload.stationName} manque de ${payload.resourceName}.`, 'warning', 'Station')
      })

      gameEvents.on('research-completed', (payload: any) => {
        this.addGameLog(payload.date || '---', `Recherche terminée : ${payload.researchName}`, 'info', 'R&D')
      })

      gameEvents.on('contract-signed', (payload: any) => {
        this.addGameLog(payload.date || '---', `Nouveau contrat signé : ${payload.contractName}`, 'info', 'Finance')
      })
    }
  },

})
