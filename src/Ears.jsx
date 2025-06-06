// src/Ears.jsx
import React from 'react'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

export default function Ears({
  leftStyle,
  rightStyle,
  positions = {
    left:  [-1.1291, 1.0888, -0],
    right: [ 1.1291, 1.0888, -0]
  },
  sizes = { left: 5.459, right: 5.459 }
}) {
  // cargamos ambos PNG
  const leftTex  = useTexture(`/ears/${leftStyle}_left.png`)
  const rightTex = useTexture(`/ears/${rightStyle}_right.png`)

  return (
    <>
      {/* Oreja izquierda */}
      <mesh
        position={positions.left}
        rotation={[0, Math.PI / 2, 0]}  // giramos 90° hacia el frente
        renderOrder={1}
      >
        <planeGeometry args={[sizes.left, sizes.left]} />
        <meshBasicMaterial
          map={leftTex}
          transparent={true}
          alphaTest={0.5}
          depthTest={true}
          depthWrite={true}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Oreja derecha */}
      <mesh
        position={positions.right}
        rotation={[0, -Math.PI / 2, 0]} // giramos -90° hacia el frente
        renderOrder={1}
      >
        <planeGeometry args={[sizes.right, sizes.right]} />
        <meshBasicMaterial
          map={rightTex}
          transparent={true}
          alphaTest={0.5}
          depthTest={true}
          depthWrite={true}
          side={THREE.DoubleSide}
        />
      </mesh>
    </>
  )
}