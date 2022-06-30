import p5Types, { Vector } from 'p5'
import { useCallback, useRef } from 'react'
import { P5Sketch } from '../p5sketch'
import palettes from '../color-palettes.json'
import { choose, hexToAdjustable } from '../util'

function generate(palette?: string[]) {
  palette = palette || choose(palettes)

  const c = {
    palette,
    colors: {
      bg: hexToAdjustable(palette[0]),
    },
  }
  console.log(c)
  return c
}

let config = generate()

function evaluateBezier(a: Vector, b: Vector, c: Vector, d: Vector, t: number) {
  const e = Vector.lerp(a, b, t)
  const f = Vector.lerp(b, c, t)
  const g = Vector.lerp(c, d, t)

  const u = Vector.lerp(e, f, t)
  const v = Vector.lerp(f, g, t)

  const p = Vector.lerp(u, v, t)

  return p
}

function bezier(q: p5Types, a: Vector, b: Vector, c: Vector, d: Vector) {
  const step = 0.05
  let last = evaluateBezier(a, b, c, d, 0)

  q.stroke(config.palette[4])
  const steps = 1 / step

  for (let i = 0; i <= steps; i++) {
    const s = (i * 1.0) / steps
    const next = evaluateBezier(a, b, c, d, s)
    q.line(last.x, last.y, next.x, next.y)
    last = next
  }

  q.noStroke()

  const e = Vector.lerp(a, b, 0.5)
  const f = Vector.lerp(b, c, 0.5)
  const g = Vector.lerp(c, d, 0.5)

  const u = Vector.lerp(e, f, 0.5)
  const v = Vector.lerp(f, g, 0.5)

  for (const p of [a, b, c, d]) {
    q.circle(p.x, p.y, 3)
  }

  q.fill(config.palette[2])

  for (const p of [e, f, g]) {
    q.circle(p.x, p.y, 2)
  }

  q.fill(config.palette[3])

  for (const p of [u, v]) {
    q.circle(p.x, p.y, 1)
  }
}

function randomPoint(q: p5Types) {
  return q.createVector(Math.random() * q.width, Math.random() * q.height)
}

function makePoints(q: p5Types) {
  return [...Array(8)].map(() => randomPoint(q))
}

export function Bezier() {
  const gfx = useRef<p5Types.Graphics | null>(null)
  const points = useRef<Vector[] | null>(null)
  const setup = useCallback((q: p5Types) => {
    gfx.current = q.createGraphics(1280 / 10, 720 / 10)
    gfx.current.pixelDensity(q.pixelDensity())

    points.current = makePoints(q)
  }, [])

  const draw = useCallback((_q: p5Types) => {
    _q.background(config.colors.bg(1))
    _q.noSmooth()
    const t = _q.millis() / 1000

    if (gfx.current === null) return
    const q = gfx.current

    const a = q
      .createVector((1 / 3) * q.width, (1 / 3) * q.height)
      .add(3 * Math.sin(t), 3 * Math.cos(t))
    const b = q
      .createVector((1 / 3) * q.width, (2 / 3) * q.height)
      .add(8 * Math.sin(t), 3 * Math.cos(t))

    const c = q
      .createVector((2 / 3) * q.width, (1 / 3) * q.height)
      .add(30 * Math.sin(t), 3 * Math.cos(t * 2.45))
    const d = q
      .createVector((2 / 3) * q.width, (2 / 3) * q.height)
      .add(3 * Math.sin(t * 3.235), 30 * Math.cos(t))

    const i = q
      .createVector((2 / 4) * q.width, (1 / 5) * q.height)
      .add(30 * Math.sin(t), 3 * Math.cos(t * 2.45))
    const j = q
      .createVector((2 / 5) * q.width, (2 / 4) * q.height)
      .add(3 * Math.sin(t * 3.235), 30 * Math.cos(t))

    const k = q
      .createVector((3 / 4) * q.width, (2 / 7) * q.height)
      .add(9 * Math.sin(t), 20 * Math.cos(t * 4.45))
    const l = q
      .createVector((3 / 5) * q.width, (4 / 7) * q.height)
      .add(3 * Math.sin(t * 1.235), 16 * Math.cos(t / 0.124))

    q.background(config.colors.bg(1))
    q.fill(config.palette[1])
    q.noStroke()

    bezier(q, a, b, c, d)
    bezier(q, d, c, i, j)
    bezier(q, j, i, k, l)

    _q.image(q, 0, 0, _q.width, _q.height)
  }, [])
  return (
    <P5Sketch
      sketchName="Bezier"
      noSmooth
      autoSize
      draw={draw}
      setup={setup}
      width={1280}
      height={720}
      enableFullscreen
      enableScreenshot
      onMouseClicked={() => {
        config = generate()
      }}
    />
  )
}
