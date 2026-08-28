import { lazy, Suspense } from 'react'
import { Outlet, Route, Routes } from 'react-router-dom'
import { Sidebar } from './components/Sidebar'
import { RouteProtegee } from './components/RouteProtegee'
import { Connexion } from './pages/Connexion'
import { Dashboard } from './pages/Dashboard'
import { Equipements } from './pages/Equipements'
import { Signalements } from './pages/Signalements'
import { Signaler } from './pages/Signaler'
import { AuthProvider } from './lib/auth'
import { ParcProvider } from './data/parcStore'

// La vue 3D (Three.js) est chargée à la demande pour garder le chargement
// initial léger.
const VueCollege = lazy(() => import('./pages/VueCollege').then((m) => ({ default: m.VueCollege })))

// Espace admin : réservé aux comptes habilités (RouteProtegee), puis
// Sidebar + inventaire chargé depuis Supabase (ParcProvider).
function AdminLayout() {
  return (
    <RouteProtegee>
      <ParcProvider>
        <div className="app">
          <Sidebar />
          <Outlet />
        </div>
      </ParcProvider>
    </RouteProtegee>
  )
}

function PageFallback() {
  return (
    <main className="main">
      <div className="content" style={{ color: 'var(--ink-400)', fontSize: 'var(--fs-sm)' }}>Chargement…</div>
    </main>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          {/* Page publique enseignant (QR code) — hors espace admin, sans store ni sidebar */}
          <Route path="/signaler/:equipementId" element={<Signaler />} />
          <Route path="/connexion" element={<Connexion />} />

          <Route element={<AdminLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/equipements" element={<Equipements />} />
            <Route path="/signalements" element={<Signalements />} />
            <Route path="/vue-college" element={<VueCollege />} />
          </Route>
        </Routes>
      </Suspense>
    </AuthProvider>
  )
}
