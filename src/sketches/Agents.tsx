import { OrbitControls, Sphere } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import {
  Bloom,
  ColorAverage,
  ColorDepth,
  DepthOfField,
  EffectComposer,
  Noise,
  Outline,
  Pixelation,
} from '@react-three/postprocessing'
import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Color, InstancedMesh, Object3D, Vector3 } from 'three'
import { random } from '../random'
import { choose } from '../util'

type Agent = {
  id: number
  mass: number
  charge: number
  color: Color
  position: Vector3
  velocity: Vector3
}

function colorFromCharge(charge: number) {
  switch (charge) {
    case -2:
      return new Color(185 / 255, 255 / 255, 248 / 255)
    case -1:
      return new Color(111 / 255, 237 / 255, 214 / 255)
    case 0:
      return new Color(255 / 255, 149 / 255, 81 / 255)
    case 1:
      return new Color(255 / 255, 74 / 255, 74 / 255)
    case 2:
      return new Color(255 / 255, 0, 0)
    default:
      return new Color('white')
  }
}

const MAX_VELOCITY = 10
const BOUND = 200
const COUNT = 420
const agents: Agent[] = [...Array(COUNT)]
  .map((_, i) => ({
    id: i,
    mass: choose([1, 4, 8]),
    charge: choose([0, -1]),
    position: new Vector3(
      (2 * random() - 1) * BOUND,
      (2 * random() - 1) * BOUND,
      (2 * random() - 1) * BOUND
    ),
    velocity: new Vector3(0, 0, 0),
  }))
  .map((a) => ({
    ...a,
    color: colorFromCharge(a.charge),
  }))

const dummy = new Object3D()
const dummyColor = new Color()
const G = 0.01
const k = 0.5

function Simulation() {
  const model = useRef<InstancedMesh>(null)
  const colorArray = useMemo(
    () =>
      Float32Array.from(
        [...Array(COUNT)].flatMap((_, i) => dummyColor.set(agents[i].color).toArray())
      ),
    []
  )

  useFrame(({ clock }) => {
    agents.forEach((agent, i) => {
      const t = clock.getElapsedTime() / 2

      if (agent.position.length() > BOUND) {
        agent.velocity.multiplyScalar(-0.8)
        agent.position.clampLength(0, BOUND)
      }

      dummyColor.set(agent.color).toArray(colorArray, i * 3)

      agent.position.add(agent.velocity)
      dummy.position.copy(agent.position)
      const v = agent.velocity.clone().normalize()
      dummy.rotation.set(Math.atan2(v.y, v.x), Math.atan2(v.z, v.x), 0)
      dummy.scale.set(Math.abs(v.x) + 0.5, Math.abs(v.y) + 0.5, Math.abs(v.z) + 0.5)
      dummy.updateMatrix()

      if (model.current === null) return
      model.current.setMatrixAt(i, dummy.matrix)
      model.current.instanceMatrix.needsUpdate = true
    })

    for (let i = 0; i < agents.length; i++) {
      for (let j = i; j < agents.length; j++) {
        if (i === j) continue

        const diff = agents[i].position.clone().sub(agents[j].position)
        const d2 = Math.max(diff.length(), 0.01)
        const fG = -(G * (agents[i].mass * agents[j].mass)) / d2
        diff.normalize()
        diff.multiplyScalar(fG)

        agents[i].velocity.add(diff)
        agents[j].velocity.sub(diff)

        const fK = -(k * agents[i].charge * agents[j].charge) / d2
        diff.normalize()
        diff.multiplyScalar(fK)

        agents[i].velocity.add(diff)
        agents[j].velocity.sub(diff)

        agents[i].velocity.clampLength(0, MAX_VELOCITY)
        agents[j].velocity.clampLength(0, MAX_VELOCITY)
      }
    }
  })

  // debugger

  return (
    <instancedMesh
      scale={[0.1, 0.1, 0.1]}
      ref={model}
      args={[null as any, null as any, COUNT]}
    >
      <sphereGeometry args={[1.5]}>
        <instancedBufferAttribute attach="attributes-color" args={[colorArray, 3]} />
      </sphereGeometry>
      <meshStandardMaterial attach="material" vertexColors metalness={1} />
    </instancedMesh>
  )
}

export function Agents() {
  return (
    <Canvas>
      <Suspense>
        <pointLight color="#ffdddd" intensity={1} position={[500, 1, 3.5]} />
        <pointLight color="ddffdd" position={[-250, 100, 3.5]} />
        <Simulation />
      </Suspense>
      <OrbitControls />
      <EffectComposer>
        <Bloom
          luminanceThreshold={0}
          luminanceSmoothing={0.9}
          height={300}
          intensity={20}
        />
        {/* <ColorDepth /> */}
        <Noise opacity={0.3} />
      </EffectComposer>
    </Canvas>
  )
}
