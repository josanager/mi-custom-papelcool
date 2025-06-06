// src/Hair.jsx
import React from 'react'
import * as THREE from 'three'
import { useTexture } from '@react-three/drei'
import './HairShaderMaterial'

export default function Hair({
  url,
  size = 5.459,
  position = [0, 1.0886, 1.1291],
  hue = 0,
  saturation = 1,
  light = 0,
}) {
  const texture = useTexture(url)

  return (
      <mesh position={position}>
        <planeGeometry args={[size, size]} />
        <hairShaderMaterial
          map={texture}
          uHue={hue}
          uSat={saturation}
          uLight={light}
          transparent
          alphaTest={0.5}
          depthTest={true}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
  )
}
