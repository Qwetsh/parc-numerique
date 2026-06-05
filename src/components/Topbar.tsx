import type { ReactNode } from 'react'

/** Barre supérieure d'une page : titre, sous-titre et actions à droite. */
export function Topbar({ title, sub, children }: { title: string; sub?: string; children?: ReactNode }) {
  return (
    <header className="topbar">
      <div>
        <div className="page-title">{title}</div>
        {sub && <div className="page-sub">{sub}</div>}
      </div>
      <div className="topbar-spacer" />
      {children}
    </header>
  )
}
