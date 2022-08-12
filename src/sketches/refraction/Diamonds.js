import { WebGLRenderTarget, Object3D } from 'three'
import React, { useRef, useMemo } from 'react'
import { useLoader, useThree, useFrame } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import BackfaceMaterial from './BackfaceMaterial'
import RefractionMaterial from './RefractionMaterial'
import { Box } from '@react-three/drei'

import { createRef } from 'react'
import { Vector3 } from 'three'

const state = {
  sections: 3,
  pages: 3,
  zoom: 7,
  images: [
    '/photo-1548191265-cc70d3d45ba1.jpeg',
    '/photo-1519608487953-e999c86e7455.jpeg',
    '/photo-1533577116850-9cc66cad8a9b.jpeg',
  ],
  diamonds: [
    // { x: 0, offjset: 0.1, pos: new Vector3(), factor: 1.25 },
    // { x: 0, offset: 1.1, pos: new Vector3(), factor: 1.5 },
    { x: 0, offset: 2.1, pos: new Vector3(), factor: 0.75 },
  ],
  top: createRef(),
}

const dummy = new Object3D()
export default function Diamonds() {
  const { size, gl, scene, camera, clock } = useThree()
  const model = useRef()
  const ratio = gl.getPixelRatio()

  const [envFbo, backfaceFbo, backfaceMaterial, refractionMaterial] = useMemo(() => {
    const envFbo = new WebGLRenderTarget(size.width * ratio, size.height * ratio)
    const backfaceFbo = new WebGLRenderTarget(size.width * ratio, size.height * ratio)
    const backfaceMaterial = new BackfaceMaterial()
    const refractionMaterial = new RefractionMaterial({
      envMap: envFbo.texture,
      backfaceMap: backfaceFbo.texture,
      resolution: [size.width * ratio, size.height * ratio],
    })
    return [envFbo, backfaceFbo, backfaceMaterial, refractionMaterial]
  }, [size, ratio])

  useFrame(() => {
    state.diamonds.forEach((data, i) => {
      const t = clock.getElapsedTime() / 2
      const { x, offset, factor } = data
      data.pos.set(x, i * 2, 0)
      dummy.position.copy(data.pos)
      dummy.rotation.set(t, t, t)
      dummy.updateMatrix()
      model.current.setMatrixAt(i, dummy.matrix)
      model.current.instanceMatrix.needsUpdate = true
    })

    gl.autoClear = false
    camera.layers.set(0)
    gl.setRenderTarget(envFbo)
    gl.clearColor()
    gl.render(scene, camera)
    gl.clearDepth()
    camera.layers.set(1)
    model.current.material = backfaceMaterial
    gl.setRenderTarget(backfaceFbo)
    gl.clearDepth()
    gl.render(scene, camera)
    camera.layers.set(0)
    gl.setRenderTarget(null)
    gl.render(scene, camera)
    gl.clearDepth()
    camera.layers.set(1)
    model.current.material = refractionMaterial
    gl.render(scene, camera)
  }, 1)

  // debugger

  return (
    <instancedMesh
      ref={model}
      layers={1}
      args={[null, null, state.diamonds.length]}
      position={[0, 0, 0]}
    >
      <octahedronGeometry args={[3]} />
    </instancedMesh>
  )
}
