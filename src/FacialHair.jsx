import React from 'react'
import { useTexture } from '@react-three/drei'

export default function FacialHair({
  url,
  position = [0, 1.0886, 1.1291],  // ajústalo a tu gusto
  size = 5.459
}) {
  const texture = useTexture(url)
  return (
    <mesh position={position} renderOrder={1}>
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial
        map={texture}
        transparent
        alphaTest={0.5}
        depthWrite={false}
      />
    </mesh>
  )
}