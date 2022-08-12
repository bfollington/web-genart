import * as THREE from 'three'
import { extend, useThree, useFrame, Canvas } from '@react-three/fiber'
import { ScreenQuad, shaderMaterial } from '@react-three/drei'
import React from 'react'
import { ShaderMaterial } from 'three'

const ColorShiftMaterial = shaderMaterial(
  { time: 0, resolution: new THREE.Vector2() },
  `
  void main() {
    gl_Position = vec4(position, 1.0);
  }
  `,
  `
  uniform float time;
  uniform vec2 resolution;
  vec3 colorA = vec3(0.149,0.141,0.912);
  vec3 colorB = vec3(1.000,0.833,0.224);
  void main() {
    vec3 color = vec3(0.0);
    float pct = abs(sin(time));
    color = mix(colorA, colorB, pct);
    gl_FragColor = vec4(color,1.0);
    #include <tonemapping_fragment>
    #include <encodings_fragment>
  }
  `
)

extend({ ColorShiftMaterial })

type ColorShiftMaterialImpl = {
  time: number
  resolution: number[]
} & JSX.IntrinsicElements['shaderMaterial']

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      colorShiftMaterial: ColorShiftMaterialImpl
    }
  }
}

function ScreenQuadScene() {
  const size = useThree((state) => state.size)
  const ref = React.useRef<ShaderMaterial>(null)
  useFrame((state) => {
    if (!ref.current) return

    if (ref.current.uniforms) {
      ref.current.uniforms.time.value = state.clock.elapsedTime
    }
  })

  return (
    <ScreenQuad>
      <colorShiftMaterial ref={ref} time={0} resolution={[size.width, size.height]} />
    </ScreenQuad>
  )
}

const Scene = () => {
  return (
    <Canvas>
      <ScreenQuadScene />
    </Canvas>
  )
}

export default Scene
