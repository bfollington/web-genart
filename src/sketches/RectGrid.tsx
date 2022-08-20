import p5Types from 'p5'
import { useCallback, useRef } from 'react'
import { c, d, e, f, g } from '../colorGradients'
import { P5Sketch } from '../p5sketch'
import { random } from '../random'
import { choose, grid, isFxHash } from '../util'

// config
function generate() {
  const conf = {
    palette: choose([c, d, e, f, g]),
    xMultiplier: random() + 0.2,
    yMultiplier: random() + 0.2,
    columns: Math.round(random() * 8 + 2),
    rows: Math.round(random() * 8 + 2),
  }

  return conf
}

let config = generate()
let baseGrid = grid(config.columns, config.rows)

const scale = 1

// main sketch
export function RectGrid() {
  const dpr = useRef<number>(1)

  const setup = useCallback((q: p5Types) => {
    dpr.current = q.pixelDensity()
    const w = Math.round(q.width / (scale * dpr.current))
    const h = Math.round(q.height / (scale * dpr.current))
    q.noSmooth()
  }, [])

  const draw = useCallback((q: p5Types) => {
    const _t = q.millis() / 1000
    const w = q.width
    const h = q.height

    q.background(0, 0, 0, 60)
    q.blendMode(q.ADD)

    const margin = q.createVector(q.width / (20 * scale), q.height / (20 * scale))
    const area = q.createVector(q.width - 2 * margin.x, q.height - 2 * margin.y)
    const palette = config.palette

    for (let x = 0; x < baseGrid.columns; x++) {
      for (let y = 0; y < baseGrid.rows; y++) {
        const [gx, gy] = baseGrid.cells[y][x]
        const localTime = _t + (x + 1) * (y + 1)
        const w =
          (area.x / baseGrid.rows) *
          q.map(q.sin(q.cos(config.xMultiplier * localTime) / 2), -1, 1, 0, 1)
        const h =
          (area.y / baseGrid.columns) *
          q.map(q.cos(q.sin(config.yMultiplier * localTime) * 2), -1, 1, 0, 1)
        const l = margin.x + area.x * gx
        const r = l + w
        const t = margin.y + area.y * gy
        const b = t + h
        const center = q.createVector(l + w / 2, t + h / 2)

        q.fill(...palette(q.sin(localTime / 3)), 80)
        q.noStroke()

        const curveRadius = 128
        for (let i = 0; i < 10; i++) {
          q.fill(...palette(q.sin(localTime / 3)), 40 * q.cos(i / 10.0))
          q.circle(
            center.x +
              curveRadius *
                config.xMultiplier *
                q.cos((q.cos(i / 5.0) + localTime) * config.xMultiplier),
            center.y +
              curveRadius *
                config.yMultiplier *
                q.sin((q.sin(i / 2.0) + localTime) * config.yMultiplier),
            q.cos(i / 2.5) * 48
          )
        }
      }
    }
    q.blendMode(q.BLEND)
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
      showFullscreenButton
      sketchName="RectGrid"
      enableScreenshot
      onMouseClicked={() => {
        if (!isFxHash()) {
          config = generate()
          baseGrid = grid(config.rows, config.columns)
        }
      }}
    />
  )
}
