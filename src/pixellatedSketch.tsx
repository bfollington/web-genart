import p5Types from 'p5'
import { useCallback, useRef } from 'react'
import './App.css'
import { P5Sketch } from './p5sketch'

function next(q: p5Types, t: number, x: number, y: number, a: number) {
  return q.createVector(
    x + q.map(Math.sin(t / 100), -1, 1, -a, a),
    y + q.map(Math.cos(t / 200), -1, 1, -a, a)
  )
}

function drawStalk(q: p5Types, x: number, y: number, t: number) {
  q.noStroke()
  q.fill('#A7DBD8')
  q.circle(x, y, 2)

  q.stroke('#A7DBD8')
  q.strokeWeight(1)
  q.noSmooth()

  let tip = q.createVector(x, y)
  for (let i = 0; i < 4; i++) {
    const newTip = next(q, t + Math.sin(t / 1000) + i * 2500000, tip.x, tip.y, 2)
    q.line(tip.x, tip.y, newTip.x, newTip.y)
    tip = newTip
  }

  q.noStroke()
  q.fill('#E0E4CC')
  q.circle(tip.x, tip.y, 3 + 1 * Math.sin(t / 1000 - Math.PI / 4))
  q.fill('#F38630')
  q.circle(tip.x, tip.y, 1 * Math.cos(t / 100 - Math.PI / 4))
}

function grid(rows: number, columns: number) {
  return [...Array(rows)].map((_, ri) =>
    [...Array(columns)].map((_, ci) => [ri / rows, ci / columns])
  )
}

export function PixelSketch() {
  const g = useRef<p5Types.Graphics | null>(null)
  const layout = grid(16, 12)
  const setup = useCallback((q: p5Types) => {
    g.current = q.createGraphics(128, 72)
    g.current.pixelDensity(q.pixelDensity())
  }, [])

  const draw = useCallback((_q: p5Types) => {
    _q.background(0)
    _q.noSmooth()
    const t = _q.millis() / 10

    if (g.current === null) return
    const q = g.current

    q.background('rgba(105,210,231,0.4)')

    for (let ri = 0; ri < layout.length; ri++) {
      const row = layout[ri]
      for (let ci = 0; ci < row.length; ci++) {
        const cell = row[ci]
        drawStalk(
          q,
          q.width * cell[0] + 10 * Math.sin(t / 1000),
          q.height * cell[1] + 10 * Math.cos(Math.cos(Math.sin(t / 1000))),
          t +
            (ci - 8 * Math.sin(t / 500)) *
              Math.sin(Math.sin(t / 2000) + Math.cos(t / 1000)) *
              (ri - 8 * Math.cos(t / 422 + 44)) *
              50
        )
      }
    }

    _q.image(q, 0, 0, _q.width, _q.height)
  }, [])
  return <P5Sketch noSmooth draw={draw} setup={setup} width={1280} height={720} />
}
