// src/Hair.jsx
import React from 'react'
import * as THREE from 'three'
import { useTexture } from '@react-three/drei'

export default function Hair({
  url,
  size = 5.459,
  position = [0, 1.0886, 1.1291],
}) {
  const texture = useTexture(url)

  return (
      <mesh position={position}>
        <planeGeometry args={[size, size]} />
        <meshBasicMaterial
          map={texture}
          transparent
          alphaTest={0.5}
          depthTest={true}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
  )
}