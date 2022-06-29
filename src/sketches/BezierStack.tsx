import p5Types, { Vector, VERSION } from 'p5'
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
      line: hexToAdjustable(palette[4]),
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

function bezier(q: p5Types, points: [Vector, Vector, Vector, Vector], alpha: number) {
  const [a, b, c, d] = points
  const step = 0.05
  let last = evaluateBezier(a, b, c, d, 0)

  q.stroke(config.colors.line(alpha))
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

  // for (const p of [a, b, c, d]) {
  //   q.circle(p.x, p.y, 3)
  // }

  // q.fill(config.palette[2])

  // for (const p of [e, f, g]) {
  //   q.circle(p.x, p.y, 2)
  // }

  // q.fill(config.palette[3])

  // for (const p of [u, v]) {
  //   q.circle(p.x, p.y, 1)
  // }
}

function randomPoint(q: p5Types) {
  return q.createVector(Math.random() * q.width, Math.random() * q.height)
}

function makePoints(q: p5Types) {
  return [...Array(8)].map(() => randomPoint(q))
}

type Curve = [Vector, Vector, Vector, Vector]

export function BezierStack() {
  const gfx = useRef<p5Types.Graphics | null>(null)
  const points = useRef<Vector[] | null>(null)
  const setup = useCallback((q: p5Types) => {
    gfx.current = q.createGraphics(1280 / 10, 720 / 10)
    gfx.current.pixelDensity(q.pixelDensity())

    points.current = makePoints(q)
  }, [])

  function curve(q: p5Types, t: number, w: number, h: number, y: number) {
    const a = q
      .createVector((1 / 8) * w, (1 / 3) * h)
      .add(13 * Math.sin(t), 24 * Math.cos(t) + y)
    const b = q
      .createVector((1 / 8) * w, (2 / 3) * h)
      .add(8 * Math.sin(t), 15 * Math.cos(t) + y)

    const c = q
      .createVector((7 / 8) * w, (1 / 3) * h)
      .add(30 * Math.sin(t), 3 * Math.cos(t * 2.45) + y)
    const d = q
      .createVector((7 / 8) * w, (1 / 3) * h)
      .add(3 * Math.sin(t * 3.235), 16 * Math.cos(t) + y)

    return [a, b, c, d] as [Vector, Vector, Vector, Vector]
  }

  const draw = useCallback((_q: p5Types) => {
    _q.background(config.colors.bg(1))
    _q.noSmooth()
    const t = _q.millis() / 1000

    if (gfx.current === null) return
    const q = gfx.current

    const k = 8
    const curves: Curve[] = []
    for (let i = 0; i < k; i++) {
      const c = curve(
        q,
        t + (1 + 0.2 * i),
        q.width,
        q.height / k,
        ((1 + i) * q.height) / k
      )
      curves.push(c)
    }

    function crossCurve(curves: Curve[], idx: number) {
      return [curves[0][idx], curves[1][idx], curves[2][idx], curves[3][idx]] as Curve
    }

    function flipCurve([a, b, c, d]: Curve) {
      return [a, b.add(0, q.height / k), c.add(0, q.height / k), d] as Curve
    }

    q.background(config.colors.bg(1))
    q.fill(config.palette[1])
    q.noStroke()

    curves.forEach((c, i) => bezier(q, c, Math.abs(Math.sin(t + Math.PI / i))))
    curves
      .map(flipCurve)
      .forEach((c, i) => bezier(q, c, Math.abs(Math.sin(t + Math.PI / i))))

    _q.image(q, 0, 0, _q.width, _q.height)
  }, [])
  return (
    <P5Sketch
      noSmooth
      autoSize
      draw={draw}
      setup={setup}
      width={1280}
      height={720}
      onMouseClicked={() => {
        config = generate()
      }}
    />
  )
}
