import { Box, OrbitControls, PointerLockControls, useTexture } from '@react-three/drei'
import { Canvas, Vector3 } from '@react-three/fiber'
import { Suspense } from 'react'
import * as ROT from 'rot-js'
import * as THREE from 'three'

function range<T>(from: number, to: number, defaultValue?: T) {
  return [...Array(to - from)].map((_, i) => defaultValue)
}

function intAverage(a: number, b: number) {
  return Math.round((a + b) / 2)
}
type Room = {
  _x1: number
  _x2: number
  _y1: number
  _y2: number
}
function centerOfRoom(room: Room) {
  return [intAverage(room._x1, room._x2), intAverage(room._y1, room._y2)]
}

type BrickCubeProps = {
  position: Vector3
}

function BrickCube({ position }: BrickCubeProps) {
  const tex = useTexture('/assets/dungeon/bricks.png')
  tex.minFilter = tex.magFilter = THREE.NearestFilter

  return (
    <Box position={position}>
      <meshStandardMaterial flatShading metalness={1} map={tex} />
    </Box>
  )
}

function generateMap() {
  const w = 32
  const h = 32
  const map = new ROT.Map.Digger(w, h)
  const debug = range(0, w).map((_) => range(0, h, 0))

  map.create((x, y, i) => {
    debug[x][y] = i
  })

  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      const cell = debug[x][y]
      // skip filled spaces
      if (cell !== 1) continue

      const hasFilledNeighbour = [
        [x - 1, y],
        [x - 1, y - 1],
        [x + 1, y],
        [x + 1, y + 1],
        [x, y + 1],
        [x - 1, y + 1],
        [x, y - 1],
        [x + 1, y - 1],
      ]
        .filter(([x, y]) => x > 0 && x < w && y > 0 && y < h)
        .map(([x, y]) => debug[x][y])
        .some((c) => c === 0)

      if (hasFilledNeighbour) {
        debug[x][y] = 3
      }
    }
  }

  console.log(map.getRooms(), map.getCorridors())

  console.log('\n' + debug.map((c) => c.join('')).join('\n'))

  return { grid: debug, map }
}

export function Dungeon() {
  const { grid, map } = generateMap()
  const startingRoom = map.getRooms()[0]
  const startingPosition = centerOfRoom(startingRoom)

  return (
    <Canvas>
      <Suspense>
        <pointLight position={[2, 1, 3.5]} />
        {grid.flatMap((col, x) =>
          col.map((cell, y) =>
            cell === 0 ? <BrickCube key={`${x},${y}`} position={[x, 0, y]} /> : undefined
          )
        )}

        {grid.flatMap((col, x) =>
          col.map((cell, y) =>
            cell === 3 ? (
              <>
                <BrickCube key={`${x},${y}`} position={[x, 0, y]} />
                <BrickCube key={`${x},${y}`} position={[x, 1, y]} />
                <BrickCube key={`${x},${y}`} position={[x, 2, y]} />
              </>
            ) : undefined
          )
        )}

        {map.getRooms().map((r) => {
          const [x, y] = centerOfRoom(r)
          return <pointLight key={`${x},${y}`} position={[x, 1, y]} />
        })}
      </Suspense>
      <OrbitControls />
    </Canvas>
  )
}
