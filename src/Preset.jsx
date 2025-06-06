// src/Preset.jsx
import React from 'react'
import { useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three'

export default function Preset({
  url,
  position = [0, 1.75, 1.13],
  size = 4
}) {
  const texture = useLoader(TextureLoader, url)
  return (
    <mesh position={position}>
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial
        map={texture}
        transparent
        toneMapped={false}
      />
    </mesh>
  )
}