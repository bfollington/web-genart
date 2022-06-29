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

export function EyeballSoup() {
  const g = useRef<p5Types.Graphics | null>(null)
  const dpr = useRef<number>(1)
  const setup = useCallback((q: p5Types) => {
    dpr.current = q.pixelDensity()
    g.current = q.createGraphics(
      q.width / (scale * dpr.current),
      q.height / (scale * dpr.current)
    )
    q.noSmooth()
  }, [])

  const onResize = useCallback(
    (x: number, y: number) => {
      g.current?.resizeCanvas(x / (scale * dpr.current), y / (scale * dpr.current))
    },
    [g]
  )

  const draw = useCallback((_q: p5Types) => {
    _q.background(config.colors.bg(1))
    const t = _q.millis() / 10

    if (g.current === null) return
    const q = g.current

    q.background(config.colors.bg(0.5))
    const layout = grid(
      Math.min(24, Math.round(q.width / (16 / dpr.current))),
      Math.min(18, Math.round(q.height / (16 / dpr.current)))
    )

    const margin = q.createVector(q.width / 20, q.width / 20)
    const area = q.createVector(q.width - 2 * margin.x, q.height - 2 * margin.y)

    const displace = (v: Vector) => {
      const k = config.mouseDistort
      const displacement = q.createVector(
        _q.mouseX / (scale * dpr.current) - v.x,
        _q.mouseY / (scale * dpr.current) - v.y
      )
      displacement.mult(k / Math.pow(displacement.mag(), 2))

      return v.sub(displacement)
    }

    for (let ri = 0; ri < layout.cells.length; ri++) {
      const row = layout.cells[ri]
      for (let ci = 0; ci < row.length; ci++) {
        const cell = row[ci]
        const pos = q
          .createVector(
            area.x * cell[0] + 6 * Math.sin(t / 1000),
            area.y * cell[1] + 6 * Math.cos(Math.cos(Math.sin(t / 1000)))
          )
          .add(margin)

        drawStalk(
          q,
          dpr.current,
          pos.x,
          pos.y,
          t +
            (ci - (layout.columns / 2) * Math.sin(t / 500)) *
              Math.sin(Math.sin(t / 2000) + Math.cos(t / 1000)) *
              (ri - (layout.rows / 2) * Math.cos(t / 422 + 44)) *
              50,
          displace
        )
      }
    }

    _q.image(q, 0, 0, _q.width, _q.height)
  }, [])
  return (
    <P5Sketch
      noSmooth
      draw={draw}
      setup={setup}
      autoSize
      width={1024}
      height={1024}
      onResize={onResize}
      onMouseClicked={() => {
        if (!isFxHash()) {
          config = generate()
        }
      }}
    />
  )
}
