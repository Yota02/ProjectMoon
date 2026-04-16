import mitt from 'mitt'

export type GameEvents = {
  // Déclenché à chaque "jour" simulé
  'day-elapsed': { daysPassed: number; elapsedDays: number; currentDate: Date }
  // Déclenché au changement de mois (tous les 30 jours)
  'month-elapsed': { currentMonth: number; lastMonthDay: number }
  // Déclenché lors du tick global pour des mises à jour fluides/immédiates (UI, calculs temps réel)
  tick: { deltaTime: number }
  // Déclenché quand la course spatiale commence
  'space-race-started': {}
}

export const gameEvents = mitt<GameEvents>()
