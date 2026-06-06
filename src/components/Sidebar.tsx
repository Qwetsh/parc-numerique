import { NavLink } from 'react-router-dom'
import {
  IconBuilding, IconDashboard, IconMemory, IconMonitor,
  IconPalette, IconRequest, IconSoftware, IconTicket,
} from './Icon'

const linkClass = ({ isActive }: { isActive: boolean }) => (isActive ? 'active' : undefined)

export function Sidebar() {
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
        <div className="avatar">RN</div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 550, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Référent numérique
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--ink-500)' }}>Connecté</div>
        </div>
      </div>
    </aside>
  )
}
