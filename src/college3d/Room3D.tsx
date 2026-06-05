import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Edges, Text } from '@react-three/drei'
import * as THREE from 'three'
import type { RoomSolid } from './geometry'
import { SHADE, SANTE_LABEL } from './shades'
import { nbPostes } from '../data/parc'

const GAP = 0.12
const INK = '#334155'
const INK_STRONG = '#0f172a'

interface Props {
  solid: RoomSolid
  selected: boolean
  hasSelection: boolean
  onSelect: (num: string) => void
}

export function Room3D({ solid, selected, hasSelection, onSelect }: Props) {
  const { salle, sante, x, z, w, d, h } = solid
  const shade = SHADE[sante]
  const bw = Math.max(0.4, w - GAP)
  const bd = Math.max(0.4, d - GAP)

  const group = useRef<THREE.Group>(null)
  const bodyMat = useRef<THREE.MeshStandardMaterial>(null)
  const roofMat = useRef<THREE.MeshStandardMaterial>(null)
  const [hovered, setHovered] = useState(false)

  useFrame(() => {
    if (!group.current) return
    const targetY = selected ? 0.7 : hovered ? 0.14 : 0
    group.current.position.y += (targetY - group.current.position.y) * 0.16

    const dim = hasSelection && !selected
    const targetOp = dim ? 0.34 : 1
    for (const m of [bodyMat.current, roofMat.current]) {
      if (m) m.opacity += (targetOp - m.opacity) * 0.16
    }
    // léger surcroît de luminosité sur la salle sélectionnée
    const targetEmis = selected ? 0.16 : 0
    if (bodyMat.current) bodyMat.current.emissiveIntensity += (targetEmis - bodyMat.current.emissiveIntensity) * 0.16
    if (roofMat.current) roofMat.current.emissiveIntensity += (targetEmis - roofMat.current.emissiveIntensity) * 0.16
  })

  const dimText = hasSelection && !selected
  const markerX = bw / 2 - 0.5
  const markerZ = -bd / 2 + 0.5

  return (
    <group
      ref={group}
      position={[x, 0, z]}
      onClick={(e) => { e.stopPropagation(); onSelect(salle.num) }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto' }}
    >
      {/* corps du volume */}
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[bw, h, bd]} />
        <meshStandardMaterial
          ref={bodyMat}
          color={shade.mid}
          emissive={shade.top}
          emissiveIntensity={0}
          transparent
          opacity={1}
          roughness={0.85}
          metalness={0}
        />
      </mesh>

      {/* toit teinté + contour */}
      <mesh position={[0, h + 0.03, 0]} castShadow>
        <boxGeometry args={[bw, 0.06, bd]} />
        <meshStandardMaterial
          ref={roofMat}
          color={shade.top}
          emissive={shade.top}
          emissiveIntensity={0}
          transparent
          opacity={1}
          roughness={0.9}
          metalness={0}
        />
        <Edges threshold={15} color={shade.line} />
      </mesh>

      {/* numéro de salle (à plat sur le toit) */}
      <Text
        position={[0, h + 0.08, 0.15]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.62}
        color={selected ? INK_STRONG : INK}
        anchorX="center"
        anchorY="middle"
        fillOpacity={dimText ? 0.34 : 1}
        outlineWidth={0}
        letterSpacing={-0.02}
      >
        {salle.num}
      </Text>

      {/* marqueur d'état (icône, jamais la couleur seule) */}
      <group position={[markerX, h + 0.07, markerZ]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.36, 32]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={dimText ? 0.34 : 1} roughness={0.6} />
          <Edges threshold={15} color={shade.line} />
        </mesh>
        <Text
          position={[0, 0.02, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.46}
          color={shade.line}
          anchorX="center"
          anchorY="middle"
          fillOpacity={dimText ? 0.34 : 1}
          fontWeight="bold"
        >
          {shade.glyph}
        </Text>
      </group>

      {/* accessibilité : description lisible par lecteur d'écran via le canvas */}
      <group userData={{ label: `${salle.nom}, ${SANTE_LABEL[sante]}, ${nbPostes(salle)} postes` }} />
    </group>
  )
}
