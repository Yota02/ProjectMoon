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
  // Déclenché quand la vitesse de jeu change
  'speed-changed': { speed: number }
  // Déclenché lors d'un succès de mission
  'mission-success': { missionId: number; missionName: string; date: string }
  // Déclenché lors d'un échec de mission
  'mission-failed': { missionId: number; missionName: string; date: string }
  // Déclenché lors d'une alerte de ressources sur une station
  'station-low-resource': { stationId: string; stationName: string; resourceName: string; date: string }
  // Déclenché lors d'une recherche terminée
  'research-completed': { researchId: string; researchName: string; date: string }
  // Déclenché lors d'une signature de contrat ou subvention
  'contract-signed': { contractId: string; contractName: string; date: string }
}

export const gameEvents = mitt<GameEvents>()
