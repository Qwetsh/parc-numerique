/* ============================================================
   FAQ d'auto-dépannage affichée sur la page de signalement.
   Filtrée par type d'équipement. Contenu à co-rédiger / affiner
   avec les vrais cas récurrents du collège.
   `types` absent = question générale (affichée pour tous les types).
   ============================================================ */
export interface FaqEntry {
  q: string
  a: string
  types?: string[]
}

export const FAQ: FaqEntry[] = [
  // --- PC (fixe & portable) ---
  {
    q: 'Le PC ne s’allume pas',
    a: 'Vérifiez que la multiprise (ou l’interrupteur mural) est allumée, que le câble d’alimentation est bien branché à l’arrière de l’unité centrale, puis appuyez sur le bouton de l’unité centrale. Vérifiez aussi que l’écran est allumé (son propre bouton).',
    types: ['PC fixe', 'PC portable'],
  },
  {
    q: 'L’écran reste noir alors que le PC est allumé',
    a: 'Bougez la souris ou appuyez sur une touche pour réveiller l’écran. Vérifiez que le câble vidéo (HDMI/DisplayPort) est bien enfoncé des deux côtés, et que l’écran est réglé sur la bonne « source » (bouton Source/Input de l’écran).',
    types: ['PC fixe'],
  },
  {
    q: 'La session met très longtemps à ouvrir',
    a: 'Le premier démarrage de la journée peut être lent (mises à jour). Patientez 2–3 minutes. Si c’est récurrent ou bloqué au-delà, signalez-le ci-dessous.',
    types: ['PC fixe', 'PC portable'],
  },

  // --- VPI / vidéoprojecteur ---
  {
    q: 'Le vidéoprojecteur n’affiche rien',
    a: 'Vérifiez que le VPI est allumé (voyant en façade) et qu’il est sur la bonne source (HDMI/VGA). Côté PC, faites Windows + P puis choisissez « Dupliquer ». Vérifiez enfin que le câble est bien branché des deux côtés.',
    types: ['VPI'],
  },
  {
    q: 'L’image du VPI est floue ou mal cadrée',
    a: 'Réglez la molette de mise au point sur l’objectif. Si l’image déborde, ajustez la position ou le zoom. Une lentille poussiéreuse peut aussi réduire la netteté.',
    types: ['VPI'],
  },

  // --- Visualiseur ---
  {
    q: 'Le visualiseur n’apparaît pas à l’écran',
    a: 'Vérifiez qu’il est allumé et relié au PC/VPI, puis sélectionnez la bonne source d’affichage. Certains modèles ont un bouton pour basculer entre PC et visualiseur.',
    types: ['Visualiseur'],
  },

  // --- Tablette ---
  {
    q: 'La tablette ne s’allume pas / batterie vide',
    a: 'Branchez-la au moins 15 minutes avant de réessayer (le voyant de charge doit s’allumer). Vérifiez le câble et l’adaptateur secteur.',
    types: ['Tablette'],
  },

  // --- Général (tous types) ---
  {
    q: 'Pas de connexion / pas d’accès à internet',
    a: 'Pour un poste filaire : vérifiez que le câble réseau est bien branché, puis redémarrez. En Wifi : vérifiez que le bon réseau du collège est sélectionné. Si plusieurs appareils sont touchés, c’est probablement une panne réseau à signaler.',
  },
  {
    q: 'Aucun son',
    a: 'Vérifiez le volume Windows (icône haut-parleur en bas à droite) et qu’il n’est pas coupé. Vérifiez la sortie audio sélectionnée (enceintes/HDMI) et que les enceintes sont allumées et branchées.',
    types: ['PC fixe', 'PC portable', 'VPI'],
  },
]

/** Entrées FAQ pertinentes pour un type d'équipement donné (+ les générales). */
export function faqFor(type: string): FaqEntry[] {
  return FAQ.filter((e) => !e.types || e.types.includes(type))
}
