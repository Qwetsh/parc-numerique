import { Edges, Line, Text } from '@react-three/drei'
import type { StairSolid } from './geometry'
import { STAIR_SHADE } from './shades'

const GAP = 0.12

export function Stair3D({ solid }: { solid: StairSolid }) {
  const { x, z, w, d, h, label } = solid
  const bw = w - GAP
  const bd = d - GAP

  // marches : quelques lignes sur le toit
  const steps = []
  for (let i = 1; i < 6; i++) {
    const t = i / 6
    const zz = -bd / 2 + bd * t
    steps.push(
      <Line
        key={i}
        points={[
          [-bw / 2 + bw * 0.18, h + 0.07, zz],
          [bw / 2 - bw * 0.18, h + 0.07, zz],
        ]}
        color={STAIR_SHADE.line}
        lineWidth={1}
        transparent
        opacity={0.55}
      />,
    )
  }

  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[bw, h, bd]} />
        <meshStandardMaterial color={STAIR_SHADE.mid} roughness={0.9} metalness={0} />
      </mesh>
      <mesh position={[0, h + 0.03, 0]}>
        <boxGeometry args={[bw, 0.06, bd]} />
        <meshStandardMaterial color={STAIR_SHADE.top} roughness={0.95} />
        <Edges threshold={15} color={STAIR_SHADE.line} />
      </mesh>
      {steps}
      {label && (
        <Text
          position={[0, h + 0.08, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.46}
          color="#8593a6"
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      )}
    </group>
  )
}
