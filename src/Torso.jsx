// src/Torso.jsx
import * as THREE from 'three'
import React from 'react'
import { useTexture } from '@react-three/drei'

export default function Torso({
  style,
  positionFront = [0, -1.107,  0.4517],
  positionBack  = [0, -1.11, -0.455],
  sizeFront     = 4.898,
  sizeBack      = 4.9
}) {
  // Aquí usamos “frontTex” y “backTex” en lugar de “frontMap”/“backMap”
  const frontTex = useTexture(`/torso/${style}_front.png`)
  const backTex  = useTexture(`/torso/${style}_back.png`)

  return (
    <>
      <mesh position={positionFront}>
        <planeGeometry args={[sizeFront, sizeFront]} />
        <meshBasicMaterial
          map={frontTex}          // ← actualizamos aquí
          transparent
          alphaTest={0.5}
        />
      </mesh>

      <mesh position={positionBack} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[sizeBack, sizeBack]} />
        <meshBasicMaterial
          map={backTex}           // ← y aquí
          transparent
          alphaTest={0.5}
        />
      </mesh>
    </>
  )
}