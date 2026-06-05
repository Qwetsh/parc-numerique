const ITEMS = [
  { glyph: '✓', bg: '#e6f5ec', border: '#5fb682', color: '#5fb682', label: 'Fonctionnel' },
  { glyph: '!', bg: '#fbeed8', border: '#d49a3a', color: '#d49a3a', label: 'Vétuste' },
  { glyph: '✕', bg: '#fbe4e0', border: '#d96a59', color: '#d96a59', label: 'En panne' },
  { glyph: '·', bg: '#eef2f7', border: '#c4cedb', color: '#9fadbe', label: 'Sans poste' },
]

export function Legend() {
  return (
    <div className="legend-box">
      <div className="lt">Santé du parc par salle</div>
      {ITEMS.map((it) => (
        <div className="li" key={it.label}>
          <span className="mk" style={{ background: it.bg, borderColor: it.border, color: it.color }}>{it.glyph}</span>
          {it.label}
        </div>
      ))}
      <div className="hint">La couleur est toujours doublée d'une icône et du détail dans le panneau.</div>
    </div>
  )
}
