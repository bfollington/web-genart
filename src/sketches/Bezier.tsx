import p5Types, { Vector } from 'p5'
import { useCallback, useRef } from 'react'
import { P5Sketch } from '../p5sketch'
import palettes from '../color-palettes.json'
import { choose, hexToAdjustable } from '../util'

function generate(palette?: string[]) {
  palette = palette || choose(palettes)

  const c = {
    palette,
    colors: {
      bg: hexToAdjustable(palette[0]),
    },
  }
  console.log(c)
  return c
}

const defaultPalette = ['#95A131', '#C8CD3B', '#F6F1DE', '#F5B9AE', '#EE0B5B']
let config = generate(defaultPalette)

export function Bezier() {
  const g = useRef<p5Types.Graphics | null>(null)
  const setup = useCallback((q: p5Types) => {
    g.current = q.createGraphics(1280 / 10, 720 / 10)
    g.current.pixelDensity(q.pixelDensity())
  }, [])

  const draw = useCallback((_q: p5Types) => {
    _q.background(config.colors.bg(1))
    _q.noSmooth()
    const t = _q.millis() / 10

    if (g.current === null) return
    const q = g.current
    const scale = _q.width / q.width

    q.background(config.colors.bg(0.4))

    _q.image(q, 0, 0, _q.width, _q.height)
  }, [])
  return (
    <div>
      <P5Sketch
        noSmooth
        draw={draw}
        setup={setup}
        width={1280}
        height={720}
        onMouseClicked={() => {
          config = generate()
        }}
      />
      Click to randomise
    </div>
  )
}
