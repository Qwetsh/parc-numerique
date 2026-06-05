import { Suspense, useMemo, useState } from 'react'
import { Building3D } from '../college3d/Building3D'
import { FloorSwitcher } from '../college3d/FloorSwitcher'
import { Legend } from '../college3d/Legend'
import { RoomPanel } from '../college3d/RoomPanel'
import { SALLES } from '../data/parc'
import './VueCollege.css'

export function VueCollege() {
  const [etage, setEtage] = useState(1)
  const [selected, setSelected] = useState<string | null>(null)

  const salle = useMemo(
    () => (selected ? SALLES.find((s) => s.num === selected && s.etage === etage) ?? null : null),
    [selected, etage],
  )

  function changeFloor(f: number) {
    setSelected(null)
    setEtage(f)
  }

  return (
    <main className="main vc-main">
      <div className="stage">
        <div className="stage-head">
          <h2>Vue du collège</h2>
          <p>Cliquez une salle pour l'éclairer et voir son parc · glissez pour pivoter</p>
        </div>

        <Legend />

        <Suspense fallback={null}>
          <Building3D etage={etage} selected={selected} onSelect={setSelected} />
        </Suspense>

        <FloorSwitcher etage={etage} onChange={changeFloor} />

        <RoomPanel salle={salle} onClose={() => setSelected(null)} />
      </div>
    </main>
  )
}
