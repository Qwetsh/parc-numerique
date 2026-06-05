import { Link } from 'react-router-dom'
import { IconClock } from '../components/Icon'
import { Wifi } from '../components/Wifi'
import './DesignSystem.css'

const ACCENT = [
  { nm: 'brand-50', hex: '#eef3fd', v: 'var(--brand-50)' },
  { nm: 'brand-100', hex: '#dde7fb', v: 'var(--brand-100)' },
  { nm: 'brand-500', hex: '#2e5fd6', v: 'var(--brand-500)' },
  { nm: 'brand-600 · action', hex: '#2350c0', v: 'var(--brand-600)' },
  { nm: 'brand-800', hex: '#18347d', v: 'var(--brand-800)' },
]
const NEUTRALS = [
  { nm: 'bg · fond app', hex: '#f4f6f9', v: 'var(--bg)' },
  { nm: 'ink-200', hex: '#e2e8f0', v: 'var(--ink-200)' },
  { nm: 'ink-500 · 2nd', hex: '#64748b', v: 'var(--ink-500)' },
  { nm: 'ink-700', hex: '#334155', v: 'var(--ink-700)' },
  { nm: 'ink-900 · titre', hex: '#0f172a', v: 'var(--ink-900)' },
]

const STATES = [
  { cls: 'ok', band: 'var(--ok-solid)', label: 'Fonctionnel', desc: 'Matériel en service, sans problème connu.', toks: ['ok-tint', 'ok-solid', 'ok-top'] },
  { cls: 'warn', band: 'var(--warn-solid)', label: 'Vétuste', desc: 'Plus de 5 ans ou obsolète, à renouveler.', toks: ['warn-tint', 'warn-solid', 'warn-top'] },
  { cls: 'bad', band: 'var(--bad-solid)', label: 'En panne', desc: 'Hors service, intervention requise.', toks: ['bad-tint', 'bad-solid', 'bad-top'] },
  { cls: 'gone', band: 'var(--gone-solid)', label: 'Réformé', desc: "Sorti de l'inventaire actif.", toks: ['gone-tint', 'gone-solid', 'gone-top'] },
  { cls: 'none', band: 'var(--none-line)', label: 'Sans poste', desc: 'Salle « X » du plan, non équipée.', toks: ['none-tint', 'none-line', 'none-ink'] },
]

const RADII = [
  { nm: 'r-sm', hex: '9px', v: 'var(--r-sm)' },
  { nm: 'r-md', hex: '13px', v: 'var(--r-md)' },
  { nm: 'r-lg', hex: '18px', v: 'var(--r-lg)' },
  { nm: 'r-xl', hex: '24px', v: 'var(--r-xl)' },
]
const SHADOWS = [
  { nm: 'sh-xs', v: 'var(--sh-xs)' },
  { nm: 'sh-sm', v: 'var(--sh-sm)' },
  { nm: 'sh-md', v: 'var(--sh-md)' },
  { nm: 'sh-lg', v: 'var(--sh-lg)' },
]

export function DesignSystem() {
  return (
    <div className="ds-page">
      <Link className="back-link" to="/vue-college">Voir la maquette →</Link>
      <div className="ds-wrap">
        <header className="ds-hero">
          <span className="ds-kicker">
            <IconClock size={14} /> Système de design · v1
          </span>
          <h1 className="ds-title">Parc&nbsp;numérique — direction&nbsp;visuelle</h1>
          <p className="ds-lede">
            Un outil d'inventaire et de pilotage clair, spacieux et contemporain. Base claire et calme,
            profondeur subtile, et un fil conducteur d'états sémantiques qui traverse toute l'application.
          </p>
        </header>

        {/* PRINCIPES */}
        <section className="ds">
          <div className="ds-head"><span className="num">00</span><h2>Principes</h2></div>
          <div className="principles">
            <div className="principle"><h4>Respirer</h4><p>Beaucoup d'espace blanc, coins arrondis doux, ombres légères plutôt que des bordures dures partout.</p></div>
            <div className="principle"><h4>L'état comme repère</h4><p>Vert, ambre, rouge, gris : un même langage de santé du matériel, partout, du badge à la maquette 3D.</p></div>
            <div className="principle"><h4>Jamais la couleur seule</h4><p>Chaque état est doublé d'un libellé et d'une icône — contrastes WCAG AA, focus clavier visible.</p></div>
          </div>
        </section>

        {/* COULEUR */}
        <section className="ds">
          <div className="ds-head"><span className="num">01</span><h2>Couleur</h2><p>Ardoise pour la structure, un bleu profond sobre pour l'action.</p></div>
          <div className="eyebrow" style={{ marginBottom: 12 }}>Accent — bleu profond</div>
          <div className="swatches" style={{ marginBottom: 'var(--sp-8)' }}>
            {ACCENT.map((c) => (
              <div className="sw" key={c.nm}>
                <div className="chipc" style={{ background: c.v }} />
                <div className="meta"><div className="nm">{c.nm}</div><div className="hex">{c.hex}</div></div>
              </div>
            ))}
          </div>
          <div className="eyebrow" style={{ marginBottom: 12 }}>Neutres — ardoise</div>
          <div className="swatches">
            {NEUTRALS.map((c) => (
              <div className="sw" key={c.nm}>
                <div className="chipc" style={{ background: c.v }} />
                <div className="meta"><div className="nm">{c.nm}</div><div className="hex">{c.hex}</div></div>
              </div>
            ))}
          </div>
        </section>

        {/* ÉTATS */}
        <section className="ds">
          <div className="ds-head"><span className="num">02</span><h2>États sémantiques</h2><p>Le fil conducteur. Chaque état décline un fond, un trait, un plein et une teinte de toit isométrique.</p></div>
          <div className="states">
            {STATES.map((s) => (
              <div className="state-card" key={s.cls}>
                <div className="band" style={{ background: s.band }} />
                <div className="body">
                  <div className="name">
                    <span className={`badge ${s.cls}`}><span className="dot" />{s.label}</span>
                  </div>
                  <div className="desc">{s.desc}</div>
                  <div className="toks">
                    {s.toks.map((t) => (
                      <div className="tok" key={t}>
                        <i style={{ background: `var(--${t})` }} />--{t}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* TYPO */}
        <section className="ds">
          <div className="ds-head"><span className="num">03</span><h2>Typographie</h2><p>Geist — sans-serif net et technique. Chiffres tabulaires pour les indicateurs.</p></div>
          <div className="type-row"><span className="lbl">display · 600</span><span className="spec">52 / -.02em</span><span className="ex tnum" style={{ fontSize: 52, fontWeight: 600, letterSpacing: '-.02em' }}>1&nbsp;248</span></div>
          <div className="type-row"><span className="lbl">h1 · 600</span><span className="spec">27 / -.02em</span><span className="ex" style={{ fontSize: 27, fontWeight: 600, letterSpacing: '-.02em' }}>Vue du collège</span></div>
          <div className="type-row"><span className="lbl">h2 · 600</span><span className="spec">19px</span><span className="ex" style={{ fontSize: 19, fontWeight: 600 }}>Équipements par salle</span></div>
          <div className="type-row"><span className="lbl">body · 450</span><span className="spec">14.5px / 1.55</span><span className="ex" style={{ fontSize: 14.5 }}>Salle informatique 210 — 14 postes fixes, dont un en panne.</span></div>
          <div className="type-row"><span className="lbl">mono</span><span className="spec">Geist Mono</span><span className="ex mono" style={{ fontSize: 14 }}>PC-FIX-0210-07</span></div>
          <div className="type-row" style={{ borderBottom: 'none' }}><span className="lbl">eyebrow · 600</span><span className="spec">11.5 / .08em</span><span className="ex eyebrow" style={{ fontSize: 11.5 }}>Indicateur clé</span></div>
        </section>

        {/* RAYONS / OMBRES */}
        <section className="ds">
          <div className="ds-head"><span className="num">04</span><h2>Rayons &amp; ombres</h2><p>Arrondis généreux, ombres douces et superposées pour une profondeur discrète.</p></div>
          <div className="eyebrow" style={{ marginBottom: 12 }}>Rayons</div>
          <div className="tile-grid" style={{ marginBottom: 'var(--sp-8)' }}>
            {RADII.map((r) => (
              <div className="tile" key={r.nm}>
                <div className="demo"><div className="rad-demo" style={{ borderRadius: r.v }} /></div>
                <div className="nm">{r.nm}</div><div className="hex">{r.hex}</div>
              </div>
            ))}
          </div>
          <div className="eyebrow" style={{ marginBottom: 12 }}>Ombres</div>
          <div className="tile-grid">
            {SHADOWS.map((s) => (
              <div className="tile" key={s.nm}>
                <div className="demo"><div className="sh-demo" style={{ boxShadow: s.v }} /></div>
                <div className="nm">{s.nm}</div>
              </div>
            ))}
          </div>
        </section>

        {/* COMPOSANTS */}
        <section className="ds">
          <div className="ds-head"><span className="num">05</span><h2>Composants</h2><p>Boutons, badges, indicateurs et cartes prêts à l'emploi.</p></div>
          <div className="comp-grid">
            <div className="demo-box">
              <div className="cap">Boutons</div>
              <div className="demo-stack">
                <button className="btn btn-primary">Ajouter un équipement</button>
                <button className="btn btn-ghost">Exporter</button>
                <button className="btn btn-subtle">Filtrer</button>
              </div>
            </div>
            <div className="demo-box">
              <div className="cap">Badges d'état</div>
              <div className="demo-stack">
                <span className="badge ok"><span className="dot" />Fonctionnel</span>
                <span className="badge warn"><span className="dot" />Vétuste</span>
                <span className="badge bad"><span className="dot" />En panne</span>
                <span className="badge gone"><span className="dot" />Réformé</span>
              </div>
            </div>
            <div className="demo-box">
              <div className="cap">Qualité wifi</div>
              <div className="demo-stack" style={{ gap: 'var(--sp-6)' }}>
                <span className="row gap-2"><Wifi level="bonne" /> Bonne</span>
                <span className="row gap-2"><Wifi level="moyenne" /> Moyenne</span>
                <span className="row gap-2"><Wifi level="faible" /> Faible</span>
              </div>
            </div>
            <div className="demo-box">
              <div className="cap">Recherche &amp; chips</div>
              <div className="demo-stack" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 'var(--sp-3)' }}>
                <div className="field">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="7" /><path d="m20 20-3-3" /></svg>
                  <input placeholder="Rechercher un équipement, une salle…" />
                </div>
                <div className="demo-stack">
                  <span className="chip">PC fixe</span><span className="chip">+ de 5 ans</span><span className="chip">CDI</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
