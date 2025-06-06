// src/Eyes.jsx
import React from 'react'
import { useTexture } from '@react-three/drei'

export default function Eyes({
  url,
  position = [0, 1.0886, 1.1291],
  size = 5.459
}) {
  const texture = useTexture(url)
  return (
    <mesh position={position}>
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial
        map={texture}
        transparent             // habilita transparencia
        depthTest={true}       // sigue probando visibilidad contra depth buffer
        depthWrite={false}     // ¡muy importante! que no escriba en el depth buffer
        alphaTest={0.5}        // descarta píxeles <50% opacos, evita sorting artifacts
      />
    </mesh>
  )
}