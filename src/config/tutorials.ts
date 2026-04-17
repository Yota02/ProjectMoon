import type { Tutorial } from '@/types/tutorial'

export const welcomeTutorial: Tutorial = {
  id: 'welcome',
  name: 'Bienvenue',
  steps: [
    {
      id: 'welcome-1',
      title: 'Bienvenue Commandant !',
      content: 'Félicitations pour votre nomination à la tête de l\'AeroCorp. Votre objectif est de conquérir l\'espace.',
    },
    {
      id: 'welcome-2',
      title: 'Vos Ressources',
      content: 'Ici vous pouvez suivre votre budget et vos points de science. Gérez-les avec prudence !',
      targetElement: '#resource-bar',
      position: 'bottom'
    }
  ]
}

export const researchTutorial: Tutorial = {
  id: 'research',
  name: 'Centre de Recherche',
  steps: [
    {
      id: 'res-1',
      title: 'La Science',
      content: 'Ici, vous utilisez vos points de science pour débloquer de nouvelles technologies.',
      targetElement: '#research-tree',
      position: 'right'
    },
    {
      id: 'res-2',
      title: 'Arbre Technologique',
      content: 'Débloquez les moteurs pour atteindre l\'orbite, puis la Lune.',
      targetElement: '.research-node',
      position: 'bottom'
    }
  ]
}

export const baseTutorial: Tutorial = {
  id: 'base',
  name: 'Gestion de la Base',
  steps: [
    {
      id: 'base-1',
      title: 'Construction',
      content: 'Placez des bâtiments pour générer de l\'énergie, des ressources ou loger votre personnel.',
      targetElement: '#base-grid',
      position: 'right'
    },
    {
      id: 'base-2',
      title: 'Bâtiments disponibles',
      content: 'Sélectionnez un bâtiment ici pour le construire sur la grille.',
      targetElement: '#building-selector',
      position: 'top'
    }
  ]
}

export const personnelTutorial: Tutorial = {
  id: 'personnel',
  name: 'Ressources Humaines',
  steps: [
    {
      id: 'pers-1',
      title: 'Recrutement',
      content: 'Engagez des scientifiques pour la recherche et des ingénieurs pour la construction.',
      targetElement: '#recruit-button',
      position: 'bottom'
    }
  ]
}

export const fleetTutorial: Tutorial = {
  id: 'fleet',
  name: 'Gestion de la Flotte',
  steps: [
    {
      id: 'fleet-1',
      title: 'Vos Vaisseaux',
      content: 'Concevez et construisez vos fusées ici pour lancer vos missions.',
      targetElement: '#fleet-list',
      position: 'right'
    }
  ]
}

export const allTutorials: Record<string, Tutorial> = {
  'welcome': welcomeTutorial,
  'research': researchTutorial,
  'base': baseTutorial,
  'personnel': personnelTutorial,
  'fleet': fleetTutorial,
  'missions': {
     id: 'missions',
     name: 'Centre de Mission',
     steps: [{ id: 'm1', title: 'Missions', content: 'Sélectionnez vos contrats ici.', targetElement: '#mission-list' }]
  }
}
