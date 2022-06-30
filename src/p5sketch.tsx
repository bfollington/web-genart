import p5Types from 'p5'
import p5 from 'p5'
import { useCallback, useEffect, useRef } from 'react'
import enterFullScreen from './enter-full-screen.svg'

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
  noSmooth = false,
  autoSize = false,
  webgl = false,
  sketchName,
  enableFullscreen = false,
  enableScreenshot = false,
  ...events
}: {
  setup: (q: p5Types, parentElement?: Element | null) => void
  draw: (q: p5Types) => void
  width: number
  height: number
  sketchName: string
  noSmooth?: boolean
  autoSize?: boolean
  webgl?: boolean
  enableFullscreen?: boolean
  enableScreenshot?: boolean

  onMouseClicked?: (event: any | undefined) => void
  onResize?: (x: number, y: number) => void
}) {
  const elem = useRef<HTMLDivElement>(null)
  const sketch = useRef<p5Types | null>(null)
  const c = useRef(0)

  const setupRef = useRef(setup)
  const drawRef = useRef(draw)

  const onFullscreen = useCallback(() => {
    const isFullscreen = sketch.current?.fullscreen() || false
    sketch.current?.fullscreen(!isFullscreen)
  }, [sketch])

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
        if (elem.current !== null) {
          if (autoSize) {
            const b = elem.current.getBoundingClientRect()
            q.createCanvas(
              b.width,
              Math.min(window.innerHeight, b.height),
              webgl ? q.WEBGL : q.P2D
            ).parent(elem.current)
          } else {
            q.createCanvas(width, height, webgl ? q.WEBGL : q.P2D).parent(elem.current)
          }
        }
        document.documentElement.style.setProperty('--height', `${window.innerHeight}px`)

        setup(q)
      }

      q.draw = () => draw(q)
      if (events.onMouseClicked) {
        q.mouseClicked = events.onMouseClicked
      }

      q.windowResized = () => {
        if (elem.current) {
          const b = elem.current.getBoundingClientRect()
          document.documentElement.style.setProperty(
            '--height',
            `${window.innerHeight}px`
          )

          if (autoSize) {
            q.resizeCanvas(b.width, Math.min(window.innerHeight, b.height))
          }

          events.onResize && events.onResize(b.width, b.height)
        }
      }

      q.keyPressed = () => {
        const code = q.keyCode
        if (code === 70 && enableFullscreen) {
          onFullscreen()
        }

        if (code == 83 && enableScreenshot) {
          q.saveCanvas(sketchName)
        }
      }
    })

    return cleanup
  }, [
    setup,
    draw,
    autoSize,
    events,
    height,
    enableFullscreen,
    webgl,
    width,
    onFullscreen,
  ])

  return (
    <div
      className={noSmooth ? 'p5js-container no-smooth' : 'p5js-container'}
      style={{ height: '100%' }}
      ref={elem}
    >
      {enableFullscreen && (
        <button onClick={onFullscreen} title="Enter fullscreen (f)">
          <img src={enterFullScreen} alt="icon for enter fullscreen" />
        </button>
      )}
    </div>
  )
}
