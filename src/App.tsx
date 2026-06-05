import { lazy, Suspense } from 'react'
import { Outlet, Route, Routes } from 'react-router-dom'
import { Sidebar } from './components/Sidebar'
import { Dashboard } from './pages/Dashboard'
import { Equipements } from './pages/Equipements'

// La vue 3D (Three.js) et la page design sont chargées à la demande
// pour garder le chargement initial léger.
const VueCollege = lazy(() => import('./pages/VueCollege').then((m) => ({ default: m.VueCollege })))
const DesignSystem = lazy(() => import('./pages/DesignSystem').then((m) => ({ default: m.DesignSystem })))

function Layout() {
  return (
    <div className="app">
      <Sidebar />
      <Outlet />
    </div>
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
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/equipements" element={<Equipements />} />
          <Route path="/vue-college" element={<VueCollege />} />
        </Route>
        <Route path="/design-system" element={<DesignSystem />} />
      </Routes>
    </Suspense>
  )
}
