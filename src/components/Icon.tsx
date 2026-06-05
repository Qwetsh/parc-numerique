/* Jeu d'icônes SVG (trait, hérite de currentColor). */
import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function Svg({ size = 18, children, ...rest }: IconProps & { children: React.ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...rest}>
      {children}
    </svg>
  )
}

export const IconDashboard = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="3" width="7" height="9" rx="1.5" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="12" width="7" height="9" rx="1.5" />
    <rect x="3" y="16" width="7" height="5" rx="1.5" />
  </Svg>
)

export const IconMonitor = (p: IconProps) => (
  <Svg {...p}>
    <rect x="2.5" y="4" width="19" height="12" rx="2" />
    <path d="M8 20h8M12 16v4" />
  </Svg>
)

export const IconBuilding = (p: IconProps) => (
  <Svg {...p}>
    <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
    <path d="m12 3 8 4.5-8 4.5-8-4.5L12 3Z" />
    <path d="M12 12v9" />
  </Svg>
)

export const IconTicket = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2H5a2 2 0 0 1-2-2 2 2 0 0 0 0-4Z" />
  </Svg>
)

export const IconSoftware = (p: IconProps) => (
  <Svg {...p}>
    <path d="m3 7 9-4 9 4v10l-9 4-9-4Z" />
    <path d="m3 7 9 5 9-5" />
  </Svg>
)

export const IconRequest = (p: IconProps) => (
  <Svg {...p}>
    <path d="M22 12h-6l-2 3h-4l-2-3H2" />
    <path d="M5 5h14l3 7v5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-5Z" />
  </Svg>
)

export const IconMemory = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="4" width="18" height="4" rx="1" />
    <path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8M10 12h4" />
  </Svg>
)

export const IconPalette = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="7.5" cy="10.5" r="1" fill="currentColor" stroke="none" />
    <circle cx="12" cy="8" r="1" fill="currentColor" stroke="none" />
    <circle cx="16.5" cy="10.5" r="1" fill="currentColor" stroke="none" />
    <path d="M12 21a3 3 0 0 1 0-6 2 2 0 0 0 0-4" />
  </Svg>
)

export const IconSearch = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3-3" />
  </Svg>
)

export const IconPlus = (p: IconProps) => (
  <Svg strokeWidth={2.2} {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
)

export const IconExport = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14" />
  </Svg>
)

export const IconClock = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Svg>
)

export const IconTrend = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 3v18h18" />
    <path d="m7 14 4-4 3 3 5-6" />
  </Svg>
)

export const IconAlert = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 9v4M12 17h.01" />
    <path d="M10.3 3.9 2 18a2 2 0 0 0 1.7 3h16.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
  </Svg>
)

export const IconArrowUp = (p: IconProps) => (
  <Svg strokeWidth={2.5} {...p}>
    <path d="M12 19V5M5 12l7-7 7 7" />
  </Svg>
)

export const IconClose = (p: IconProps) => (
  <Svg {...p}>
    <path d="m6 6 12 12M18 6 6 18" />
  </Svg>
)

export const IconCheck = (p: IconProps) => (
  <Svg strokeWidth={3} {...p}>
    <path d="m5 12 5 5L20 7" />
  </Svg>
)

/* Icônes par type d'équipement */
export const EQUIP_ICON: Record<string, React.ReactNode> = {
  'PC fixe': (<><rect x="2.5" y="4" width="19" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></>),
  'PC portable': (<><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M2 20h20" /></>),
  'Visualiseur': (<><path d="M12 3v6m0 0-2.5-2M12 9l2.5-2" /><rect x="4" y="13" width="16" height="8" rx="2" /></>),
  'VPI': (<><rect x="2" y="7" width="20" height="10" rx="2" /><path d="M7 21h10M12 17v4" /></>),
}

export function EquipIcon({ type, size = 16 }: { type: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      {EQUIP_ICON[type] ?? null}
    </svg>
  )
}
