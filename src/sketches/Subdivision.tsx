import p5Types from 'p5'
import { useCallback, useRef } from 'react'
import { c, d, e, f, g, h, i } from '../colorGradients'
import { P5Sketch } from '../p5sketch'
import { random } from '../random'
import { choose, isFxHash } from '../util'

// config
function generate() {
  const iterations = 48 + 256 * random()
  const gridCells = gridCellSequence(choose([4, 5, 6, 7, 8]), choose([4, 5, 6, 7, 8]))
  for (let i = 0; i < iterations; i++) {
    splitRandomGridCell(gridCells)
  }
  const conf = {
    palette: choose([e, h, i]),
    grid: gridCells,
  }

  return conf
}

let config = generate()

const scale = 1

function createMargin(q: p5Types, marginFactor: number) {
  const margin = q.createVector(
    q.width / (marginFactor * scale),
    q.height / (marginFactor * scale)
  )
  const area = q.createVector(q.width - 2 * margin.x, q.height - 2 * margin.y)

  const rect = {
    left: margin.x,
    top: margin.y,
    right: area.x + margin.x,
    bottom: area.y + margin.y,
  }

  return { margin, area, rect }
}

type Cell = {
  x: number
  y: number
  w: number
  h: number
}

function gridCellSequence(columns: number, rows: number) {
  const cells: Cell[] = []

  for (let x = 0; x < columns; x++) {
    for (let y = 0; y < rows; y++) {
      cells.push({
        x: x / columns,
        y: y / rows,
        w: 1 / columns,
        h: 1 / rows,
      })
    }
  }

  return cells
}

function splitRandomGridCell(cells: Cell[]) {
  const idx = Math.floor(random() * cells.length)

  const original = cells[idx]
  cells.splice(idx, 1)

  cells.push({
    w: original.w / 2,
    h: original.h / 2,
    x: original.x,
    y: original.y,
  })
  cells.push({
    w: original.w / 2,
    h: original.h / 2,
    x: original.x + original.w / 2,
    y: original.y + original.h / 2,
  })
  cells.push({
    w: original.w / 2,
    h: original.h / 2,
    x: original.x + original.w / 2,
    y: original.y,
  })
  cells.push({
    w: original.w / 2,
    h: original.h / 2,
    x: original.x,
    y: original.y + original.h / 2,
  })
}

// main sketch
export function Subdivision() {
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

    q.background(0, 0, 0)

    const { margin, area, rect } = createMargin(q, 20)
    const palette = config.palette

    const r = 128

    for (const cell of config.grid) {
      const noiseT = _t / 100
      const l = margin.x + area.x * cell.x + q.noise(cell.x + noiseT, cell.y + noiseT)
      const t =
        margin.y + area.y * cell.y + q.cos(q.noise(cell.y + noiseT, cell.x + noiseT))
      const b = t + cell.h * area.y
      const r = l + cell.w * area.x
      const cx = (l + r) / 2
      const cy = (t + b) / 2
      const localTime = _t + cx * cy
      const k = 0.8 + 0.2 * q.cos(localTime)

      q.fill(...palette(q.sin(localTime)), 255)
      q.noStroke()
      q.circle(
        cx + 32 * q.sin(q.cos(localTime) + localTime),
        cy + 32 * q.cos(localTime / cx),
        24 * cell.w
      )

      q.noFill()
      q.strokeWeight(2)
      q.stroke(...palette(q.sin(localTime)), 255)
      q.rotate(0.001 * q.cos(localTime / 10))
      q.rect(
        l + 24 * q.sin(q.cos(localTime / 10)),
        t,
        k * cell.w * area.x,
        k * cell.h * area.y
      )

      q.stroke(...palette(q.sin(localTime + 0.25)), 255)
      q.strokeWeight(1)
      q.rect(
        cx - (cell.w / 2.5) * area.x,
        cy - (cell.h / 2.5) * area.x,
        ((k * cell.w) / 1.25) * area.x,
        ((k * cell.h) / 1.25) * area.y
      )
    }
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
        }
      }}
    />
  )
}
