import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useGameStore } from './useGameStore'

export interface CelestialBody {
  id: string
  name: string
  radius: number // Rayon visuel
  distance: number // Distance moyenne au soleil (AU simplifiée pour le rendu)
  period: number // Période orbitale en jours terrestres
  color: string
}

export interface Travel {
  id: string
  name: string
  originId: string
  destinationId: string
  departureDay: number
  duration: number // en jours
}

export const PLANETS: CelestialBody[] = [
  { id: 'sun', name: 'Soleil', radius: 25, distance: 0, period: 1, color: '#facc15' },
  { id: 'mercury', name: 'Mercure', radius: 4, distance: 50, period: 88, color: '#9ca3af' },
  { id: 'venus', name: 'Vénus', radius: 7, distance: 80, period: 225, color: '#fb923c' },
  { id: 'earth', name: 'Terre', radius: 8, distance: 120, period: 365, color: '#3b82f6' },
  { id: 'moon', name: 'Lune', radius: 3, distance: 15, period: 27, color: '#d1d5db' }, // Distance par rapport à la Terre
  { id: 'mars', name: 'Mars', radius: 6, distance: 170, period: 687, color: '#ef4444' },
  { id: 'jupiter', name: 'Jupiter', radius: 18, distance: 280, period: 4333, color: '#d97706' },
  { id: 'saturn', name: 'Saturne', radius: 15, distance: 380, period: 10759, color: '#eab308' },
]

export const useSolarSystemStore = defineStore('solarSystem', () => {
  const gameStore = useGameStore()
  const activeTravels = ref<Travel[]>([
    { id: 't1', name: 'Sonde Mars 1', originId: 'earth', destinationId: 'mars', departureDay: 0, duration: 200 }
  ])

  const getBodyPositionAt = (id: string, elapsedDays: number): { x: number, y: number } => {
    const planet = PLANETS.find(p => p.id === id)
    if (!planet) return { x: 0, y: 0 }
    if (planet.id === 'sun') return { x: 0, y: 0 }

    if (planet.id === 'moon') {
      const earthPos = getBodyPositionAt('earth', elapsedDays)
      const angle = (elapsedDays / planet.period) * 2 * Math.PI
      return {
        x: earthPos.x + Math.cos(angle) * planet.distance,
        y: earthPos.y + Math.sin(angle) * planet.distance
      }
    }

    const initialAngle = (planet.distance * 1337) % (2 * Math.PI)
    const angle = initialAngle + (elapsedDays / planet.period) * 2 * Math.PI
    
    return {
      x: Math.cos(angle) * planet.distance,
      y: Math.sin(angle) * planet.distance
    }
  }

  const planetPositions = computed(() => {
    return PLANETS.map(planet => ({
      ...planet,
      ...getBodyPositionAt(planet.id, gameStore.elapsedDays)
    }))
  })

  const travelPositions = computed(() => {
    const elapsedDays = gameStore.elapsedDays
    return activeTravels.value
      .filter(t => elapsedDays >= t.departureDay && elapsedDays <= t.departureDay + t.duration)
      .map(t => {
        const progress = (elapsedDays - t.departureDay) / t.duration
        
        // Position de l'origine au moment du départ
        const posOrigin = getBodyPositionAt(t.originId, t.departureDay)
        // Position de la destination au moment de l'arrivée
        const posDest = getBodyPositionAt(t.destinationId, t.departureDay + t.duration)

        // Interpolation linéaire entre les deux positions
        const x = posOrigin.x + (posDest.x - posOrigin.x) * progress
        const y = posOrigin.y + (posDest.y - posOrigin.y) * progress

        return {
          ...t,
          x,
          y,
          progress
        }
      })
  })

  const startTravel = (name: string, originId: string, destinationId: string, duration: number) => {
    activeTravels.value.push({
      id: Math.random().toString(36).substr(2, 9),
      name,
      originId,
      destinationId,
      departureDay: gameStore.elapsedDays,
      duration
    })
  }

  return {
    planets: PLANETS,
    planetPositions,
    activeTravels,
    travelPositions,
    startTravel,
    getBodyPositionAt
  }
})
