import p5Types from 'p5'
import { useCallback, useRef } from 'react'
import './App.css'
import { P5Sketch } from './p5sketch'

export function PixelSketch() {
  const g = useRef<p5Types.Graphics | null>(null)
  const setup = useCallback((q: p5Types) => {
    g.current = q.createGraphics(16, 16)
    g.current.pixelDensity(q.pixelDensity())
  }, [])

  const draw = useCallback((_q: p5Types) => {
    _q.background(0)
    _q.noSmooth()

    if (g.current === null) return
    const q = g.current

    q.background(0)

    q.stroke('red')
    q.strokeWeight(1)
    q.noSmooth()

    const tip = [
      q.width / 2 + q.map(Math.sin(_q.millis() / 100), -1, 1, -4, 4),
      q.height / 2 + q.map(Math.cos(_q.millis() / 200), -1, 1, -4, 4),
    ]

    q.line(q.width / 2, q.height, tip[0], tip[1])

    q.noStroke()
    q.fill('white')
    q.circle(tip[0], tip[1], 4)
    q.fill('black')
    q.circle(tip[0], tip[1], 1)

    _q.image(q, 0, 0, _q.width, _q.height)
  }, [])
  return <P5Sketch noSmooth draw={draw} setup={setup} width={256} height={256} />
}
