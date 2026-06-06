import BuildingTower3D from '../college3d/BuildingTower3D'
import './VueCollege.css'

export function VueCollege() {
  return (
    <main className="main vc-main">
      <div className="stage">
        <BuildingTower3D variant="page" />
      </div>
    </main>
  )
}
