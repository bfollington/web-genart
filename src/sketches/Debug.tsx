import p5Types, { Vector } from 'p5'
import { useCallback, useRef } from 'react'
import { P5Sketch } from '../p5sketch'
import palettes from '../color-palettes.json'
import { choose, grid, hexToAdjustable, isFxHash } from '../util'

function next(q: p5Types, t: number, x: number, y: number, a: number) {
  return q.createVector(
    x + q.map(Math.sin(t / 100), -1, 1, -a, a),
    y + q.map(Math.cos(t / 200), -1, 1, -a, a)
  )
}

function generate(palette?: string[]) {
  palette = palette || choose(palettes)

  const c = {
    palette,
    stalkLength: choose([3, 4, 5, 6, 7, 8]),
    timeScale: choose([2500000, 250000, 25000, 2500, -2500000, -250000, -25000, -2500]),
    mouseDistort: choose([16, 32, 8]),
    colors: {
      bg: hexToAdjustable(palette[0]),
      stalk: palette[1],
      bloom: palette[2],
      iris: palette[3],
    },
  }

  console.log(c)
  return c
}

const defaultPalette = ['#95A131', '#C8CD3B', '#F6F1DE', '#F5B9AE', '#EE0B5B']
let config = generate(isFxHash() ? undefined : defaultPalette)

;(window as any).$fxhashFeatures = {
  stalkLength: config.stalkLength,
  timeScale: config.timeScale,
  mouseDistort: config.mouseDistort,
}

function drawStalk(
  q: p5Types,
  dpr: number,
  x: number,
  y: number,
  t: number,
  displace: (v: Vector) => Vector
) {
  const k = 2 / dpr
  q.noStroke()
  q.fill(config.colors.stalk)
  q.circle(x, y, 2 * k)

  q.stroke(config.colors.stalk)
  q.strokeWeight(1 * k)

  let tip = q.createVector(x, y)
  for (let i = 0; i < config.stalkLength; i++) {
    const newTip = next(
      q,
      t + Math.sin(t / 1000) + i * config.timeScale,
      tip.x,
      tip.y,
      2 * k
    )
    displace(newTip)
    q.line(tip.x, tip.y, newTip.x, newTip.y)
    tip = newTip
  }

  q.noStroke()
  q.fill(config.colors.bloom)
  q.circle(tip.x, tip.y, k * (3 + 1 * Math.sin(t / 1000 - Math.PI / 4)))
  q.fill(config.colors.iris)
  q.circle(tip.x, tip.y, k * (1 * Math.cos(t / 100 - Math.PI / 4)))
}

const scale = 5

export function Debug() {
  const g = useRef<p5Types.Graphics | null>(null)
  const dpr = useRef<number>(1)
  const setup = useCallback((q: p5Types) => {
    dpr.current = q.pixelDensity()
    const w = Math.round(q.width / scale)
    const h = Math.round(q.height / scale)
    g.current = q.createGraphics(w, h)

    q.noSmooth()
  }, [])

  const onResize = useCallback(
    (x: number, y: number) => {
      const w = Math.round(x / scale)
      const h = Math.round(y / scale)
      g.current?.resizeCanvas(w, h)
    },
    [g]
  )

  const draw = useCallback((_q: p5Types) => {
    _q.background('blue')
    const t = _q.millis() / 10

    if (g.current === null) {
      _q.background('red')
      return
    }

    const q = g.current

    q.background(config.colors.bg(0.5))

    q.circle(0, 0, 4)
    q.circle(q.width, 0, 4)
    q.circle(0, q.height, 4)
    q.circle(q.width, q.height, 4)
    q.circle(q.width / 2, q.height / 2, 2)

    q.textSize(8)
    q.text(`dpr=${q.pixelDensity()}`, 8, 8)
    q.text(`w=${q.width}`, 8, 16)
    q.text(`h=${q.height}`, 8, 32)

    _q.image(q, 0, 0, _q.width, _q.height)
  }, [])
  return (
    <P5Sketch
      noSmooth
      draw={draw}
      setup={setup}
      autoSize
      width={1280}
      height={720}
      onResize={onResize}
      onMouseClicked={() => {
        if (!isFxHash()) {
          config = generate()
        }
      }}
    />
  )
}
