// src/Arms.jsx
import React from 'react'
import * as THREE from 'three'
import { useTexture } from '@react-three/drei'

export default function Arms({
  style,
  frontPosition = [ 0, -0.8825,  0.0051 ],
  backPosition  = [ 0, -0.8825, -0.0001 ],
  sizeFront     = 3.225,
  sizeBack      = 3.225
}) {
  const frontTex = useTexture(`/arms/${style}_front.png`)
  const backTex  = useTexture(`/arms/${style}_back.png`)
  return (
    <>
      {/* Brazos frontales */}
      <mesh position={frontPosition}>
        <planeGeometry args={[sizeFront, sizeFront]} />
        <meshBasicMaterial
          map={frontTex}
          transparent
          alphaTest={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Brazos traseros */}
      <mesh position={backPosition} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[sizeBack, sizeBack]} />
        <meshBasicMaterial
          map={backTex}
          transparent
          alphaTest={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>
    </>
  )
}