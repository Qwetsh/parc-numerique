import { useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { ContactShadows, Line, OrbitControls } from '@react-three/drei'
import { Room3D } from './Room3D'
import { Stair3D } from './Stair3D'
import {
  buildFloor, corridorRect, PLINTH, PLINTH_RECT, TOTAL_X,
} from './geometry'
import { CORR_FILL, PLINTH_SHADE } from './shades'

interface Props {
  etage: number
  selected: string | null
  onSelect: (num: string | null) => void
}

function Scene({ etage, selected, onSelect }: Props) {
  const solids = useMemo(() => buildFloor(etage), [etage])
  const corr = corridorRect()
  const hasSelection = selected != null

  return (
    <>
      <ambientLight intensity={0.92} />
      <hemisphereLight args={['#ffffff', '#dbe2ec', 0.45]} />
      <directionalLight
        position={[14, 20, 9]}
        intensity={1.05}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-22}
        shadow-camera-right={22}
        shadow-camera-top={22}
        shadow-camera-bottom={-22}
        shadow-camera-near={0.5}
        shadow-camera-far={70}
        shadow-bias={-0.0002}
      />

      {/* socle */}
      <mesh position={[0, -PLINTH / 2, 0]} receiveShadow>
        <boxGeometry args={[PLINTH_RECT.w, PLINTH, PLINTH_RECT.d]} />
        <meshStandardMaterial color={PLINTH_SHADE.mid} roughness={0.95} />
      </mesh>
      {/* dalle supérieure du socle (reçoit les ombres) */}
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[PLINTH_RECT.w, PLINTH_RECT.d]} />
        <meshStandardMaterial color={PLINTH_SHADE.top} roughness={0.95} />
      </mesh>

      {/* couloir central */}
      <mesh position={[corr.x, 0.02, corr.z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[corr.w, corr.d]} />
        <meshStandardMaterial color={CORR_FILL} roughness={0.95} />
      </mesh>
      <Line
        points={[[corr.x - corr.w / 2, 0.04, corr.z], [corr.x + corr.w / 2, 0.04, corr.z]]}
        color="#cdd7e3"
        lineWidth={1}
        dashed
        dashSize={0.5}
        gapSize={0.45}
      />

      {/* volumes */}
      {solids.map((s, i) =>
        s.kind === 'room' ? (
          <Room3D
            key={s.salle.num}
            solid={s}
            selected={selected === s.salle.num}
            hasSelection={hasSelection}
            onSelect={onSelect}
          />
        ) : (
          <Stair3D key={`stair-${i}`} solid={s} />
        ),
      )}

      {/* ancrage doux sur le plan */}
      <ContactShadows
        position={[0, -PLINTH - 0.002, 0]}
        scale={TOTAL_X + 8}
        resolution={1024}
        blur={3}
        opacity={0.22}
        far={6}
        color="#1f2a44"
      />

      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minPolarAngle={0.35}
        maxPolarAngle={1.15}
        minZoom={14}
        maxZoom={60}
        target={[0, 0.7, 0]}
      />
    </>
  )
}

export function Building3D(props: Props) {
  return (
    <Canvas
      shadows
      orthographic
      camera={{ position: [24, 21, 24], zoom: 24, near: 0.1, far: 1000 }}
      gl={{ alpha: true, antialias: true }}
      style={{ width: '100%', height: '100%' }}
      onPointerMissed={() => props.onSelect(null)}
    >
      <Scene {...props} />
    </Canvas>
  )
}
