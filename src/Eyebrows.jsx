// src/Eyebrows.jsx
import React from 'react'
import * as THREE from 'three'
import { useTexture } from '@react-three/drei'

export default function Eyebrows({
  url,
  position = [0, 1.0886, 1.1291],  // ajusta hasta que queden sobre las cejas
  size     = 5.459            // escala adecuada para tus cejas
}) {
  const texture = useTexture(url)
  return (
    <mesh position={position} renderOrder={1}>
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial
        map={texture}
        transparent={true}
        alphaTest={0.5}
        depthTest={false}
      />
    </mesh>
  )
}