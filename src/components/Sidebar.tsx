import { NavLink } from 'react-router-dom'
import {
  IconBuilding, IconDashboard, IconMemory, IconMonitor,
  IconPalette, IconRequest, IconSoftware, IconTicket,
} from './Icon'
import { deconnecter, useAuth } from '../lib/auth'
import { useParc } from '../data/parcStore'

const linkClass = ({ isActive }: { isActive: boolean }) => (isActive ? 'active' : undefined)

/** Initiales affichées dans la pastille, à partir de l'adresse connectée. */
function initiales(email: string | null): string {
  const local = email?.split('@')[0] ?? ''
  const parts = local.split(/[.\-_]/).filter(Boolean)
  const lettres = parts.length >= 2 ? parts[0][0] + parts[1][0] : local.slice(0, 2)
  return lettres.toUpperCase() || 'RN'
}

export function Sidebar() {
  const { email } = useAuth()
  const { signalementsActifs } = useParc()
  const nbSignalements = signalementsActifs.length

  return (
    <aside className="side">
      <div className="brand">
        <div className="brand-mark">
          <IconMonitor size={20} />
        </div>
        <div>
          <div className="brand-name">Parc numérique</div>
          <div className="brand-sub">Collège Pierre Mendès France</div>
        </div>
      </div>

      <div className="nav-group-label">Pilotage</div>
      <nav className="nav">
        <NavLink to="/" end className={linkClass}>
          <IconDashboard /> Tableau de bord
        </NavLink>
        <NavLink to="/equipements" className={linkClass}>
          <IconMonitor /> Équipements
        </NavLink>
        <NavLink to="/vue-college" className={linkClass}>
          <IconBuilding /> Vue du collège
        </NavLink>
        <NavLink to="/signalements" className={linkClass}>
          <IconTicket /> Signalements
          {nbSignalements > 0 && (
            <span className="nav-badge" title={`${nbSignalements} signalement(s) à traiter`}>{nbSignalements}</span>
          )}
        </NavLink>
      </nav>

      <div className="nav-group-label">Bientôt</div>
      <nav className="nav">
        <a className="soon"><IconSoftware /> Logiciels <span className="nav-soon-tag">Bientôt</span></a>
        <a className="soon"><IconRequest /> Demandes <span className="nav-soon-tag">Bientôt</span></a>
        <a className="soon"><IconMemory /> Mémoire <span className="nav-soon-tag">Bientôt</span></a>
      </nav>

      <div className="nav-group-label">Référence</div>
      <nav className="nav">
        <NavLink to="/design-system" className={linkClass}>
          <IconPalette /> Système de design
        </NavLink>
      </nav>

      <div className="side-foot">
        <div className="avatar">{initiales(email)}</div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 550, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Référent numérique
          </div>
          <div
            style={{ fontSize: 11.5, color: 'var(--ink-500)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            title={email ?? undefined}
          >
            {email ?? 'Non connecté'}
          </div>
        </div>
        <button className="side-logout" onClick={() => { void deconnecter() }} title="Se déconnecter">
          Quitter
        </button>
      </div>
    </aside>
  )
}
