export interface TutorialStep {
  id: string
  title: string
  content: string
  targetElement?: string // Sélecteur CSS pour le highlight
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
  view?: string // Sur quelle vue ce tutoriel doit s'afficher
  actionRequired?: 'click' | 'none' // Si on attend une action spécifique
}

export interface Tutorial {
  id: string
  name: string
  steps: TutorialStep[]
}
