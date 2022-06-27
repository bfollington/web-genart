import p5Types from 'p5'
import p5 from 'p5'
import { CSSProperties, useEffect, useRef } from 'react'

export function P5Sketch({
  setup,
  draw,
  width,
  height,
  pixelDensity = 1,
  noSmooth = false,
  style,
}: {
  setup: (q: p5Types, parentElement?: Element | null) => void
  draw: (q: p5Types) => void
  width: number
  height: number
  pixelDensity?: number
  noSmooth?: boolean
  style?: CSSProperties
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
      console.log('reset counter')
    }

    c.current++
    sketch.current = new p5((q) => {
      q.setup = () => {
        q.createCanvas(width, height).parent(elem.current)
        setup(q)
      }

      q.draw = () => draw(q)
    })

    return cleanup
  }, [setup, draw])

  return <div className={noSmooth ? 'no-smooth' : ''} ref={elem} />
}
