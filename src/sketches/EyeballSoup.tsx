import p5Types, { Vector } from 'p5'
import { useCallback, useRef } from 'react'
import { P5Sketch } from '../p5sketch'
import palettes from '../color-palettes.json'
import { choose, grid, hexToAdjustable, isFxHash, shuffle } from '../util'

function next(q: p5Types, t: number, x: number, y: number, a: number) {
  return q.createVector(
    x + q.map(Math.sin(t / 100), -1, 1, -a, a),
    y + q.map(Math.cos(t / 200), -1, 1, -a, a)
  )
}

function generate(palette?: string[]) {
  palette = palette || shuffle(choose(palettes))

  const c = {
    palette,
    stalkLength: choose([3, 4, 5, 6, 7, 8]),
    timeScale: choose([2500000, 250000, 25000, 2500, -2500000, -250000, -25000, -2500]),
    mouseDistort: choose([16, 32, 8]),
    eyeballScale: choose([0.8, 1, 1.25, 1.5]),
    stalkType: choose(['lines' as const, 'points' as const]),
    colors: {
      bg: hexToAdjustable(palette[0]),
      stalk: hexToAdjustable(palette[1]),
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

function isSmallScreen(q: p5Types) {
  return q.width < 30 || q.height < 30
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
  q.fill(config.colors.stalk(1))
  q.circle(x, y, 2 * k)

  q.stroke(config.colors.stalk(1))
  q.strokeWeight(1 * k)
  q.noFill()

  if (config.stalkType === 'points') {
    q.beginShape(q.POINTS)
    q.vertex(x, y)
  }

  let tip = q.createVector(x, y)
  const tipLengthScale = isSmallScreen(q) ? 0.5 : 1
  for (let i = 0; i < config.stalkLength; i++) {
    const newTip = next(
      q,
      t + Math.sin(t / 1000) + i * config.timeScale,
      tip.x,
      tip.y,
      tipLengthScale * 2
    )
    displace(newTip)
    q.stroke(config.colors.stalk(1))

    switch (config.stalkType) {
      case 'lines':
        q.line(tip.x, tip.y, newTip.x, newTip.y)
        break
      case 'points':
        q.vertex(newTip.x, newTip.y)
        break
    }
    tip = newTip
  }

  if (config.stalkType === 'points') {
    q.endShape()
  }

  return {
    position: tip,
    t,
  }
}

function drawTip(q: p5Types, dpr: number, x: number, y: number, t: number) {
  const k = 2 / dpr
  q.noStroke()
  q.fill(config.colors.bloom)
  q.circle(x, y, k * (3 * config.eyeballScale + 1 * Math.sin(t / 1000 - Math.PI / 4)))
  q.fill(config.colors.iris)
  q.circle(x, y, k * (config.eyeballScale * Math.cos(t / 100 - Math.PI / 4)))
}

// may need to just check for overall canvas area instead of pixel ratio, don't want to exclude iPad
const scale = 5

export function EyeballSoup() {
  const g = useRef<p5Types.Graphics | null>(null)
  const dpr = useRef<number>(1)
  const setup = useCallback((q: p5Types) => {
    dpr.current = q.pixelDensity()
    const w = Math.round(q.width / (scale * dpr.current))
    const h = Math.round(q.height / (scale * dpr.current))
    g.current = q.createGraphics(w, h)
    q.noSmooth()
  }, [])

  const onResize = useCallback(
    (x: number, y: number) => {
      const w = Math.round(x / (scale * dpr.current))
      const h = Math.round(y / (scale * dpr.current))
      g.current?.resizeCanvas(w, h)
    },
    [g]
  )

  const draw = useCallback((_q: p5Types) => {
    _q.background(config.colors.bg(1))
    const t = _q.millis() / 10

    if (g.current === null) return
    const q = g.current

    q.background(config.colors.bg(0.5))
    const layout = isSmallScreen(q)
      ? grid(Math.round(q.height / 6), Math.round(q.width / 6))
      : grid(
          Math.min(18, Math.round(q.height / 10)),
          Math.min(24, Math.round(q.width / 10))
        )

    const margin = q.createVector(q.width / (4 * scale), q.width / (4 * scale))
    const area = q.createVector(q.width - 2 * margin.x, q.height - 2 * margin.y)

    const displace = (v: Vector) => {
      const k = config.mouseDistort
      const displacement = q.createVector(0, 0)

      if (!_q.touches || _q.touches.length === 0) {
        displacement.add(
          _q.mouseX / (scale * dpr.current) - v.x,
          _q.mouseY / (scale * dpr.current) - v.y
        )
      } else {
        for (const touch of _q.touches) {
          const { x, y } = touch as { x: number; y: number; id: number }

          displacement.add(
            x / (scale * dpr.current) - v.x,
            y / (scale * dpr.current) - v.y
          )
        }
      }

      displacement.mult(k / Math.pow(displacement.mag(), 2))

      if (isSmallScreen(q)) {
        displacement.div(2.5)
      }

      return v.sub(displacement)
    }

    const tips: { position: Vector; t: number }[] = []

    for (let ri = 0; ri < layout.cells.length; ri++) {
      const row = layout.cells[ri]
      for (let ci = 0; ci < row.length; ci++) {
        const cell = row[ci]
        const pos = q
          .createVector(
            (area.x / layout.columns) * (ci + 0.5),
            (area.y / layout.rows) * (ri + 0.5)
          )
          .add(margin)

        tips.push(
          drawStalk(
            q,
            dpr.current,
            pos.x,
            pos.y,
            t +
              (ci - layout.columns / 2) *
                Math.sin(t / 500) *
                Math.sin(Math.sin(t / 2000) + Math.cos(t / 1000)) *
                ((ri - layout.rows / 2) * Math.cos(t / 422 + 44)) *
                50,
            displace
          )
        )
      }

      tips.forEach(({ position: p, t }) => drawTip(q, dpr.current, p.x, p.y, t))
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
      enableFullscreen
      sketchName="Eyeball Soup"
      onResize={onResize}
      enableScreenshot
      onMouseClicked={() => {
        if (!isFxHash()) {
          config = generate()
        }
      }}
    />
  )
}
