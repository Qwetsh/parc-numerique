/* ============================================================
   Tour 3D « éclatée » — les 4 étages empilés et espacés, intégrée
   au tableau de bord. Réutilise la géométrie de geometry.ts
   (buildFloor) ; rendu des solides en interne pour maîtriser
   l'opacité (estompage), le glow et l'interaction à deux niveaux :
     1. survol/clic d'un ÉTAGE (vue tour)
     2. après isolation d'un étage, survol/clic d'une SALLE
   La page /vue-college et Room3D restent inchangés.
   ============================================================ */
import { useMemo, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { Link } from 'react-router-dom'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Edges, Html, OrbitControls, Text } from '@react-three/drei'
import * as THREE from 'three'
import { buildFloor, corridorRect, PLINTH_RECT } from './geometry'
import type { RoomSolid, Solid } from './geometry'
import { ALERT_SHADE, CORR_FILL, PLINTH_SHADE, SHADE, STAIR_SHADE } from './shades'
import { Badge } from '../components/Badge'
import { ETAGE_COURT, ETAGE_LABEL, SALLES } from '../data/parc'
import type { Salle } from '../data/parc'
import { useParc } from '../data/parcStore'
import './BuildingTower3D.css'

const FLOORS = [0, 1, 2, 3]
const STEP = 3.6 // espacement vertical entre deux étages
const ROOM_GAP = 0.12
const floorBaseY = (etage: number) => etage * STEP
const TOWER_CENTER_Y = (FLOORS.length - 1) * STEP / 2 + 0.8

// Animation d'arrivée : chaque étage monte à sa place (de bas en haut, en cascade).
const ARRIVAL_DUR = 0.85 // durée (s) de la montée d'un étage
const ARRIVAL_STAGGER = 0.16 // décalage (s) entre deux étages
const ARRIVAL_RISE = 6 // hauteur (unités) de départ sous la position finale
const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3)

// Cadrage caméra selon le contexte (carte du dashboard vs page plein écran).
type Variant = 'card' | 'page'
const ZOOM: Record<Variant, { tower: number; focus: number }> = {
  card: { tower: 12.5, focus: 20 },
  page: { tower: 21, focus: 36 },
}

/* ---------------- une salle de la tour ---------------- */
interface TowerRoomProps {
  solid: RoomSolid
  selected: boolean
  interactive: boolean
  onSelect: (num: string) => void
}

function TowerRoom({ solid, selected, interactive, onSelect }: TowerRoomProps) {
  const { salle, x, z, w, d, h } = solid
  const { santeSalle, alerteSalle } = useParc()
  const sante = santeSalle(salle.etage, salle.num)
  const alerte = alerteSalle(salle.etage, salle.num)
  // Un signalement ouvert prime sur l'état d'inventaire : la salle vire au rouge d'alerte.
  const shade = alerte ? ALERT_SHADE : SHADE[sante]
  const bw = Math.max(0.4, w - ROOM_GAP)
  const bd = Math.max(0.4, d - ROOM_GAP)

  const group = useRef<THREE.Group>(null)
  const bodyMat = useRef<THREE.MeshStandardMaterial>(null)
  const roofMat = useRef<THREE.MeshStandardMaterial>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (!group.current) return
    const targetY = selected ? 0.5 : interactive && hovered ? 0.14 : 0
    group.current.position.y += (targetY - group.current.position.y) * 0.16
    let emis = selected ? 0.38 : interactive && hovered ? 0.2 : 0.05
    // Salle en alerte : halo lumineux qui pulse pour être repéré d'un coup d'œil.
    if (alerte && !selected) {
      const pulse = 0.5 + 0.5 * Math.sin(state.clock.elapsedTime * 3)
      emis = Math.max(emis, 0.3 + pulse * 0.4)
    }
    for (const m of [bodyMat.current, roofMat.current]) {
      if (m) m.emissiveIntensity += (emis - m.emissiveIntensity) * 0.16
    }
  })

  const handlers = interactive
    ? {
        onClick: (e: any) => { e.stopPropagation(); onSelect(salle.num) },
        onPointerOver: (e: any) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer' },
        onPointerOut: () => { setHovered(false); document.body.style.cursor = 'auto' },
      }
    : {}

  return (
    <group ref={group} position={[x, 0, z]} {...handlers}>
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[bw, h, bd]} />
        <meshStandardMaterial
          ref={bodyMat}
          color={shade.mid}
          emissive={shade.top}
          emissiveIntensity={0.05}
          transparent
          opacity={1}
          roughness={0.82}
          metalness={0.04}
        />
      </mesh>
      <mesh position={[0, h + 0.03, 0]}>
        <boxGeometry args={[bw, 0.06, bd]} />
        <meshStandardMaterial
          ref={roofMat}
          color={shade.top}
          emissive={shade.top}
          emissiveIntensity={0.05}
          transparent
          opacity={1}
          roughness={0.85}
        />
        <Edges threshold={15} color={shade.line} />
      </mesh>

      {/* numéro de salle (à plat sur le toit) — uniquement sur l'étage isolé */}
      {interactive && (
        <Text
          position={[0, h + 0.08, 0.12]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.58}
          color="#0f172a"
          anchorX="center"
          anchorY="middle"
          letterSpacing={-0.02}
          outlineWidth={0}
        >
          {salle.num}
        </Text>
      )}
    </group>
  )
}

/* ---------------- un étage complet ---------------- */
interface FloorGroupProps {
  etage: number
  focused: number | null
  hovered: number | null
  selectedRoom: string | null
  onHoverFloor: (e: number | null) => void
  onSelectFloor: (e: number) => void
  onSelectRoom: (num: string) => void
}

function FloorGroup({
  etage, focused, hovered, selectedRoom, onHoverFloor, onSelectFloor, onSelectRoom,
}: FloorGroupProps) {
  const solids = useMemo<Solid[]>(() => buildFloor(etage), [etage])
  const corr = corridorRect()
  const group = useRef<THREE.Group>(null)
  const slabMat = useRef<THREE.MeshStandardMaterial>(null)
  const opacity = useRef(0)
  const { santeSalle, alerteSalle } = useParc()

  const isFocused = focused === etage
  const isDimmed = focused !== null && !isFocused
  const isHovered = hovered === etage && focused === null
  const interactive = isFocused
  // hit box étage uniquement en vue tour ; en vue isolée, les salles de l'étage
  // focus doivent rester cliquables (le changement d'étage passe par les chips).
  const showHitBox = focused === null

  const summary = useMemo(() => {
    const salles = SALLES.filter((s) => s.etage === etage)
    const c: Record<string, number> = { panne: 0, vetuste: 0, fonctionnel: 0 }
    let alertes = 0
    salles.forEach((s) => {
      const k = santeSalle(s.etage, s.num); if (k in c) c[k]++
      if (alerteSalle(s.etage, s.num)) alertes++
    })
    return { total: salles.length, c, alertes }
  }, [etage, santeSalle, alerteSalle])

  const baseY = floorBaseY(etage)

  useFrame((state) => {
    if (!group.current) return
    // progression de l'animation d'arrivée (0 → 1), décalée par étage
    const p = easeOutCubic(
      Math.min(1, Math.max(0, (state.clock.elapsedTime - etage * ARRIVAL_STAGGER) / ARRIVAL_DUR)),
    )

    if (p < 1) {
      // montée en place depuis ARRIVAL_RISE unités plus bas, en fondu
      group.current.position.y = (baseY - ARRIVAL_RISE) + ARRIVAL_RISE * p
      opacity.current = p
    } else {
      // arrivé : lerp doux vers la position (avec soulèvement au survol)
      const lift = isHovered ? 0.32 : 0
      group.current.position.y += (baseY + lift - group.current.position.y) * 0.14
      const target = isDimmed ? 0.14 : 1
      opacity.current += (target - opacity.current) * 0.14
    }

    group.current.traverse((o) => {
      const m = (o as THREE.Mesh).material as THREE.Material | undefined
      if (m && o.userData.fade !== false) { m.transparent = true; m.opacity = opacity.current }
    })

    if (slabMat.current) {
      const glow = isFocused ? 0.5 : isHovered ? 0.42 : 0.16
      slabMat.current.emissiveIntensity += (glow - slabMat.current.emissiveIntensity) * 0.14
    }
  })

  return (
    <group ref={group} position={[0, baseY - ARRIVAL_RISE, 0]}>
      {/* dalle de l'étage (plateau flottant + arête lumineuse) */}
      <mesh position={[0, -0.09, 0]}>
        <boxGeometry args={[PLINTH_RECT.w, 0.16, PLINTH_RECT.d]} />
        <meshStandardMaterial
          ref={slabMat}
          color="#34507f"
          emissive="#5b8def"
          emissiveIntensity={0.16}
          transparent
          opacity={1}
          roughness={0.6}
          metalness={0.2}
        />
        <Edges threshold={15} color="#3f6fb0" />
      </mesh>

      {/* couloir central */}
      <mesh position={[corr.x, 0.02, corr.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[corr.w, corr.d]} />
        <meshStandardMaterial color={CORR_FILL} transparent opacity={1} roughness={0.95} />
      </mesh>

      {/* solides : salles / escaliers / cloisons / couloirs */}
      {solids.map((s, i) => {
        if (s.kind === 'room') {
          return (
            <TowerRoom
              key={s.salle.num}
              solid={s}
              selected={isFocused && selectedRoom === s.salle.num}
              interactive={interactive}
              onSelect={onSelectRoom}
            />
          )
        }
        if (s.kind === 'stair') {
          return (
            <mesh key={`st-${i}`} position={[s.x, s.h / 2, s.z]}>
              <boxGeometry args={[s.w - ROOM_GAP, s.h, s.d - ROOM_GAP]} />
              <meshStandardMaterial color={STAIR_SHADE.mid} transparent opacity={1} roughness={0.9} />
              <Edges threshold={15} color={STAIR_SHADE.line} />
            </mesh>
          )
        }
        if (s.kind === 'wall') {
          return (
            <mesh key={`wl-${i}`} position={[s.x, s.h / 2, s.z]}>
              <boxGeometry args={[s.w, s.h, s.d]} />
              <meshStandardMaterial color={PLINTH_SHADE.dark} transparent opacity={1} roughness={0.9} />
            </mesh>
          )
        }
        return (
          <mesh key={`co-${i}`} position={[s.x, 0.02, s.z]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[s.w, s.d]} />
            <meshStandardMaterial color={CORR_FILL} transparent opacity={1} roughness={0.95} />
          </mesh>
        )
      })}

      {/* zone de capture au niveau étage (invisible, raycast actif) */}
      {showHitBox && (
        <mesh
          position={[0, 1.1, 0]}
          userData={{ fade: false }}
          onPointerOver={(e) => { e.stopPropagation(); onHoverFloor(etage); document.body.style.cursor = 'pointer' }}
          onPointerOut={() => { onHoverFloor(null); document.body.style.cursor = 'auto' }}
          onClick={(e) => { e.stopPropagation(); onSelectFloor(etage) }}
        >
          <boxGeometry args={[PLINTH_RECT.w, 2.4, PLINTH_RECT.d]} />
          <meshBasicMaterial transparent opacity={0} colorWrite={false} depthWrite={false} />
        </mesh>
      )}

      {/* étiquette d'étage (chip DOM, sert aussi de bouton) */}
      <Html position={[-PLINTH_RECT.w / 2 - 0.4, 1.1, PLINTH_RECT.d / 2]} center>
        <button
          className={`tw-floor-chip ${isFocused ? 'is-focused' : ''} ${isHovered ? 'is-hovered' : ''} ${isDimmed ? 'is-dimmed' : ''}`}
          onClick={() => onSelectFloor(etage)}
          onPointerOver={() => focused === null && onHoverFloor(etage)}
          onPointerOut={() => onHoverFloor(null)}
        >
          <span className="tw-chip-code">{ETAGE_COURT[etage]}</span>
          <span className="tw-chip-dots">
            {summary.alertes > 0 && <i className="alert" title={`${summary.alertes} salle(s) avec signalement`} />}
            {summary.c.panne > 0 && <i className="bad" title={`${summary.c.panne} en panne`} />}
            {summary.c.vetuste > 0 && <i className="warn" title={`${summary.c.vetuste} vétuste`} />}
            {summary.c.fonctionnel > 0 && <i className="ok" />}
          </span>
        </button>
      </Html>
    </group>
  )
}

/* ---------------- pilotage caméra (zoom + cible) ---------------- */
function CameraRig(
  { focused, controls, zoom }:
  { focused: number | null; controls: RefObject<any>; zoom: { tower: number; focus: number } },
) {
  const { camera } = useThree()
  useFrame(() => {
    const cam = camera as THREE.OrthographicCamera
    const targetY = focused !== null ? floorBaseY(focused) + 0.8 : TOWER_CENTER_Y
    const targetZoom = focused !== null ? zoom.focus : zoom.tower
    cam.zoom += (targetZoom - cam.zoom) * 0.1
    cam.updateProjectionMatrix()
    if (controls.current) {
      controls.current.target.y += (targetY - controls.current.target.y) * 0.1
      controls.current.update()
    }
  })
  return null
}

/* ---------------- scène ---------------- */
interface SceneProps {
  focused: number | null
  hovered: number | null
  selectedRoom: string | null
  zoom: { tower: number; focus: number }
  onHoverFloor: (e: number | null) => void
  onSelectFloor: (e: number) => void
  onSelectRoom: (num: string) => void
}

function Scene({ zoom, ...props }: SceneProps) {
  const controls = useRef<any>(null)
  return (
    <>
      <ambientLight intensity={1.05} />
      <hemisphereLight args={['#cfe0ff', '#0b1120', 0.55]} />
      <directionalLight position={[10, 18, 8]} intensity={0.85} />
      {FLOORS.map((f) => (
        <FloorGroup key={f} etage={f} {...props} />
      ))}
      <CameraRig focused={props.focused} controls={controls} zoom={zoom} />
      <OrbitControls
        ref={controls}
        makeDefault
        enablePan={false}
        enableZoom={false}
        enableDamping
        dampingFactor={0.08}
        minPolarAngle={0.5}
        maxPolarAngle={1.25}
        target={[0, TOWER_CENTER_Y, 0]}
      />
    </>
  )
}

/* ---------------- détail salle (overlay DOM) ---------------- */
const ETAT_DOT: Record<string, string> = {
  fonctionnel: 'var(--ok-solid)', vetuste: 'var(--warn-solid)', panne: 'var(--bad-solid)', reforme: 'var(--gone-solid)',
}

function RoomDetail({ salle, onClose }: { salle: Salle; onClose: () => void }) {
  const { equipOf, santeSalle, signalementsOf } = useParc()
  const items = equipOf(salle.etage, salle.num)
  const sante = santeSalle(salle.etage, salle.num)
  const signalements = signalementsOf(salle.etage, salle.num)
  const liste = items.slice().sort((a, b) => a.reference.localeCompare(b.reference, 'fr', { numeric: true }))
  const total = items.length
  return (
    <div className="tw-detail">
      <button className="tw-detail-close" onClick={onClose} aria-label="Fermer">×</button>
      <div className="tw-detail-head">
        <span className="tw-detail-num">{salle.num}</span>
        <div>
          <div className="tw-detail-name">{salle.nom}</div>
          <div className="tw-detail-type">{salle.type} · {ETAGE_LABEL[salle.etage]}</div>
        </div>
      </div>
      <div className="tw-detail-tags">
        {signalements.length > 0 && (
          <span className="tw-detail-alert-chip">⚠ {signalements.length} signalement{signalements.length > 1 ? 's' : ''}</span>
        )}
        <Badge sante={sante} />
        {total > 0 && <span className="tw-detail-postes">{total} poste{total > 1 ? 's' : ''}</span>}
      </div>

      {signalements.length > 0 && (
        <div className="tw-detail-sgs">
          {signalements.map((s) => (
            <div className="tw-sg-row" key={s.id}>
              <div className="tw-sg-top">
                <span className="tw-sg-pb">{s.probleme}</span>
                {s.equipement_ref && <span className="tw-sg-ref">{s.equipement_ref}</span>}
              </div>
              {s.description && <p className="tw-sg-desc">{s.description}</p>}
              <div className="tw-sg-meta">
                {new Date(s.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
          <Link className="tw-sg-link" to="/signalements">Gérer les signalements →</Link>
        </div>
      )}
      {liste.length > 0 ? (
        <div className="tw-detail-eq">
          {liste.map((e) => (
            <div className="tw-eq-row" key={e.id}>
              <span className="tw-eq-dot" style={{ background: ETAT_DOT[e.etat] }} />
              <span className="tw-eq-t">{e.reference}</span>
              <span className="tw-eq-m">{e.type} · {e.modele}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="tw-detail-empty">Salle non équipée</div>
      )}
      <Link className="tw-detail-link" to="/vue-college">Voir dans la maquette →</Link>
    </div>
  )
}

/* ---------------- composant exporté (default → lazy depuis le dashboard) ---------------- */
export default function BuildingTower3D({ variant = 'card' }: { variant?: Variant } = {}) {
  const zoom = ZOOM[variant]
  const [focused, setFocused] = useState<number | null>(null)
  const [hovered, setHovered] = useState<number | null>(null)
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)

  const salle = useMemo(
    () => (focused !== null && selectedRoom
      ? SALLES.find((s) => s.etage === focused && s.num === selectedRoom) ?? null
      : null),
    [focused, selectedRoom],
  )

  function selectFloor(f: number) {
    setHovered(null)
    setSelectedRoom(null)
    setFocused(f)
  }
  function backToTower() {
    setSelectedRoom(null)
    setFocused(null)
  }

  return (
    <div className={`${variant === 'card' ? 'card ' : ''}tw-card tw-${variant}`}>
      <div className="tw-bar">
        <div className="tw-bar-l">
          {focused !== null && (
            <button className="tw-back" onClick={backToTower} aria-label="Retour à la tour">↩</button>
          )}
          <div>
            <h3>Maquette du collège</h3>
            <p>{focused !== null
              ? `${ETAGE_LABEL[focused]} · cliquez une salle`
              : 'Survolez puis cliquez un étage'}</p>
          </div>
        </div>
        {variant === 'card' && <Link to="/vue-college" className="tw-full">Plein écran →</Link>}
      </div>

      <div className="tw-canvas">
        <Canvas
          orthographic
          camera={{ position: [20, 14, 20], zoom: zoom.tower, near: 0.1, far: 1000 }}
          gl={{ alpha: true, antialias: true }}
          onPointerMissed={() => setSelectedRoom(null)}
        >
          <Scene
            focused={focused}
            hovered={hovered}
            selectedRoom={selectedRoom}
            zoom={zoom}
            onHoverFloor={setHovered}
            onSelectFloor={selectFloor}
            onSelectRoom={setSelectedRoom}
          />
        </Canvas>

        {salle && <RoomDetail salle={salle} onClose={() => setSelectedRoom(null)} />}
      </div>
    </div>
  )
}
