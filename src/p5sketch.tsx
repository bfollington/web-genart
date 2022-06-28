import p5Types from 'p5'
import p5 from 'p5'
import { CSSProperties, useEffect, useRef } from 'react'

export const p5Events = [
  'draw',
  'windowResized',
  'preload',
  'mouseClicked',
  'doubleClicked',
  'mouseMoved',
  'mousePressed',
  'mouseWheel',
  'mouseDragged',
  'mouseReleased',
  'keyPressed',
  'keyReleased',
  'keyTyped',
  'touchStarted',
  'touchMoved',
  'touchEnded',
  'deviceMoved',
  'deviceTurned',
  'deviceShaken',
]

export function P5Sketch({
  setup,
  draw,
  width,
  height,
  pixelDensity = 1,
  noSmooth = false,
  style,
  ...events
}: {
  setup: (q: p5Types, parentElement?: Element | null) => void
  draw: (q: p5Types) => void
  width: number
  height: number
  pixelDensity?: number
  noSmooth?: boolean
  style?: CSSProperties

  onMouseClicked?: (event: object | undefined) => void
}) {
  const elem = useRef(null)
  const sketch = useRef<p5Types | null>(null)
  const c = useRef(0)

  const setupRef = useRef(setup)
  const drawRef = useRef(draw)

  useEffect(() => {
    const cleanup = () => {
      sketch.current?.remove()
    }

    // A bunch of annoying checks to play nicely in React.StrictMode
    if (elem.current == null) return cleanup
    if (c.current > 0) {
      if (setupRef.current === setup && drawRef.current === draw) {
        return cleanup
      }

      setupRef.current = setup
      drawRef.current = draw
      c.current = 0
    }

    c.current++
    sketch.current = new p5((q: p5Types) => {
      q.setup = () => {
        q.createCanvas(width, height).parent(elem.current)
        setup(q)
      }

      q.draw = () => draw(q)
      if (events.onMouseClicked) {
        q.mouseClicked = events.onMouseClicked
      }
    })

    return cleanup
  }, [setup, draw])

  return <div className={noSmooth ? 'no-smooth' : ''} ref={elem} />
}
