import p5Types, { Vector } from 'p5'
import { useCallback, useEffect, useRef } from 'react'
import { P5Sketch } from '../p5sketch'
import palettes from '../color-palettes.json'
import {
  choose,
  grid,
  hexToAdjustable,
  interpolateCosine,
  isFxHash,
  shuffle,
} from '../util'

/*
A tribute to vector fields of all kinds, a simple tool for us to glimpse the true complexity of things. 

Responsive (works on mobile)
s for screenshot
f for fullscreen

made with p5js
 */

function next(q: p5Types, t: number, x: number, y: number, a: number) {
  return q.createVector(
    x + q.map(Math.sin(t / 100), -1, 1, -a, a),
    y + q.map(Math.cos(t / 200), -1, 1, -a, a)
  )
}

const dzogchen = interpolateCosine(
  [239 / 255, 160 / 255, 87 / 255],
  [255 / 255, 228 / 255, 228 / 255],
  [94 / 255, 186 / 255, 234 / 255],
  [44 / 255, 160 / 255, 0 / 255]
)

const test = interpolateCosine(
  [0.5, 0.5, 0.5],
  [0.5, 0.5, 0.5],
  [1.0, 1.0, 1.0],
  [0.3, 0.2, 0.2]
)

const c = interpolateCosine(
  [0.5, 0.5, 0.5],
  [0.5, 0.5, 0.5],
  [1.0, 1.0, 1.0],
  [0.0, 0.1, 0.2]
)

const d = interpolateCosine(
  [0.5, 0.5, 0.5],
  [0.5, 0.5, 0.5],
  [1.0, 1.0, 0.5],
  [0.8, 0.9, 0.3]
)

const e = interpolateCosine(
  [0.5, 0.5, 0.5],
  [0.5, 0.5, 0.5],
  [1.0, 0.7, 0.4],
  [0.0, 0.15, 0.2]
)
const f = interpolateCosine(
  [0.5, 0.5, 0.5],
  [0.5, 0.5, 0.5],
  [2.0, 1.0, 0.0],
  [0.5, 0.2, 0.25]
)
const g = interpolateCosine(
  [0.8, 0.5, 0.4],
  [0.2, 0.4, 0.2],
  [2.0, 1.0, 1.0],
  [0.0, 0.25, 0.25]
)

function generate(palette?: string[]) {
  palette = palette || shuffle(choose(palettes))

  const conf = {
    palette: choose([dzogchen, test, c, d, e, f, g]),
    pNum: choose([3, 4, 5, 6, 7, 8]),
  }

  console.log(conf)
  return conf
}

const defaultPalette = ['#95A131', '#C8CD3B', '#F6F1DE', '#F5B9AE', '#EE0B5B']
let config = generate(isFxHash() ? undefined : defaultPalette)

;(window as any).$fxhashFeatures = {}

function isSmallScreen(q: p5Types) {
  return q.width < 30 || q.height < 30
}

function vShape(q: p5Types, A: number, r: number, a: number, b: number, c: number) {
  return A * q.pow(Math.E, -b * q.pow(q.abs(r), c)) * q.pow(q.abs(r), a)
}

function bumpiness(q: p5Types, A: number, r: number, f: number, angle: number) {
  return 1 + A * q.pow(r, 2) * q.sin(f * angle)
}

const scale = 1

export function Flower() {
  const dpr = useRef<number>(2)
  const vertices = useRef<Vector[][]>([])
  const setup = useCallback((q: p5Types) => {
    dpr.current = q.pixelDensity()
    const w = Math.round(q.width / (scale * dpr.current))
    const h = Math.round(q.height / (scale * dpr.current))
    q.noSmooth()
    // q.colorMode(q.HSB, 360, 100, 100)
    q.angleMode(q.DEGREES)
    q.noStroke()

    const pNum = config.pNum
    const fD = 200
    const pLen = 60
    const pSharp = 0.4

    const fHeight = 300
    const curve1 = 0.8
    const curve2 = 0.2

    const b = 2.5
    const bNum = 10
    const rows = 30,
      cols = 40

    for (let theta = 0; theta < rows; theta += 1) {
      vertices.current.push([])
      for (let phi = 0; phi < cols; phi += 1) {
        const r =
          ((pLen * q.pow(q.abs(q.sin(((pNum / 2) * phi * 360) / cols)), pSharp) + fD) *
            theta) /
          rows
        const x = r * q.cos((phi * 360) / cols)
        const y = r * q.sin((phi * 360) / cols)
        const z =
          vShape(q, fHeight, r / 100, curve1, curve2, 1.5) -
          200 +
          bumpiness(q, b, r / 100, bNum, (phi * 360) / cols)

        const pos = q.createVector(x, y, z)
        vertices.current[theta].push(pos)
      }
    }
    // q.drawingContext.filter = 'blur(8px)'
  }, [])

  const draw = useCallback((q: p5Types) => {
    const t = q.millis()
    // q.orbitControl(4, 4)
    // q.fill(0, 0, 0, 5)
    // q.translate(-q.width / 2, -q.height / 2, -1000)
    // q.rect(0, 0, q.width, q.height)
    // q.translate(q.width / 2, q.height / 2, 1000)

    q.rotateX(40 * q.sin(t / 100))
    q.rotateY(40 * q.cos(t / 100))

    const v = vertices.current

    const doFlower = () => {
      for (let theta = 0; theta < v.length; theta++) {
        for (let phi = 0; phi < v[theta].length; phi++) {
          q.fill(config.palette(theta / v.length + t / 3000))
          if (theta < v.length - 1 && phi < v[theta].length - 1) {
            q.beginShape()
            q.vertex(v[theta][phi].x, v[theta][phi].y, v[theta][phi].z)
            q.vertex(v[theta + 1][phi].x, v[theta + 1][phi].y, v[theta + 1][phi].z)
            q.vertex(
              v[theta + 1][phi + 1].x,
              v[theta + 1][phi + 1].y,
              v[theta + 1][phi + 1].z
            )
            q.vertex(v[theta][phi + 1].x, v[theta][phi + 1].y, v[theta][phi + 1].z)
            q.endShape(q.CLOSE)
          } else if (theta < v.length - 1 && phi == v[theta].length - 1) {
            q.beginShape()
            q.vertex(v[theta][phi].x, v[theta][phi].y, v[theta][phi].z)
            q.vertex(v[theta][0].x, v[theta][0].y, v[theta][0].z)
            q.vertex(v[theta + 1][0].x, v[theta + 1][0].y, v[theta + 1][0].z)
            q.vertex(v[theta + 1][phi].x, v[theta + 1][phi].y, v[theta + 1][phi].z)
            q.endShape(q.CLOSE)
          }
        }
      }
    }

    q.translate(
      500 * q.sin(q.cos(t / 10)),
      250 * q.cos(q.cos(q.sin(t)) / 25),
      250 * q.sin(t / 50 + Math.PI / 2)
    )
    doFlower()
  }, [])
  return (
    <P5Sketch
      noSmooth
      webgl
      draw={draw}
      setup={setup}
      autoSize
      width={1024}
      height={1024}
      enableFullscreen
      showFullscreenButton
      sketchName="Flower"
      enableScreenshot
      onMouseClicked={() => {
        if (!isFxHash()) {
          config = generate()
        }
      }}
    />
  )
}
