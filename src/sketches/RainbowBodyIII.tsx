import p5Types, { Vector } from 'p5'
import { useCallback, useEffect, useRef } from 'react'
import { P5Sketch } from '../p5sketch'
import palettes from '../color-palettes.json'
import {
  choose,
  grid,
  hexToAdjustable,
  interpolateCosine,
  isFxHash,
  shuffle,
} from '../util'
import { random } from '../random'
import { isJsxOpeningFragment } from 'typescript'

/*
A tribute to vector fields of all kinds, a simple tool for us to glimpse the true complexity of things. 

Responsive (works on mobile)
s for screenshot
f for fullscreen

made with p5js
 */

function next(q: p5Types, t: number, x: number, y: number, a: number) {
  return q.createVector(
    x + q.map(Math.sin(t / 100), -1, 1, -a, a),
    y + q.map(Math.cos(t / 200), -1, 1, -a, a)
  )
}

const dzogchen = interpolateCosine(
  [239 / 255, 160 / 255, 87 / 255],
  [255 / 255, 228 / 255, 228 / 255],
  [94 / 255, 186 / 255, 234 / 255],
  [44 / 255, 160 / 255, 0 / 255]
)

const test = interpolateCosine(
  [0.5, 0.5, 0.5],
  [0.5, 0.5, 0.5],
  [1.0, 1.0, 1.0],
  [0.3, 0.2, 0.2]
)

const c = interpolateCosine(
  [0.5, 0.5, 0.5],
  [0.5, 0.5, 0.5],
  [1.0, 1.0, 1.0],
  [0.0, 0.1, 0.2]
)

const d = interpolateCosine(
  [0.5, 0.5, 0.5],
  [0.5, 0.5, 0.5],
  [1.0, 1.0, 0.5],
  [0.8, 0.9, 0.3]
)

const e = interpolateCosine(
  [0.5, 0.5, 0.5],
  [0.5, 0.5, 0.5],
  [1.0, 0.7, 0.4],
  [0.0, 0.15, 0.2]
)
const f = interpolateCosine(
  [0.5, 0.5, 0.5],
  [0.5, 0.5, 0.5],
  [2.0, 1.0, 0.0],
  [0.5, 0.2, 0.25]
)
const g = interpolateCosine(
  [0.8, 0.5, 0.4],
  [0.2, 0.4, 0.2],
  [2.0, 1.0, 1.0],
  [0.0, 0.25, 0.25]
)

function generate(palette?: string[]) {
  palette = palette || shuffle(choose(palettes))

  const conf = {
    palette: choose([dzogchen, test, c, d, e, f, g]),
    ringACount: choose([4, 6, 7, 8, 9]),
    ringBCount: choose([3, 4, 5, 6, 7, 8, 9]),
    coreRadius: choose([256, 320, 360, 420, 512, 640]),
    ringARadius: choose([256, 320, 480, 512]),
    ringBRadius: choose([560, 256, 360, 420, 640]),
    baseT: random() * 10,
    phaseOffset: choose([random() * Math.PI, 0]),
  }

  console.log(conf)
  return conf
}

const defaultPalette = ['#95A131', '#C8CD3B', '#F6F1DE', '#F5B9AE', '#EE0B5B']
let config = generate(isFxHash() ? undefined : defaultPalette)

;(window as any).$fxhashFeatures = {
  innerRings: config.ringACount,
  outerRings: config.ringBCount,
  heartSize: config.coreRadius,
}

function isSmallScreen(q: p5Types) {
  return q.width < 800 || q.height < 800
}

type Interpolator = (t: number) => [number, number, number]

function drawRadialGradient(
  q: p5Types,
  x: number,
  y: number,
  radius: number,
  t: number,
  alpha: number,
  color: Interpolator,
  localScale: number
) {
  for (let r = radius; r > 0; r -= 80 * localScale) {
    const c = color(r / radius + t)
    q.stroke(255, 255, 255, 16)
    q.strokeWeight(2)
    q.fill(...c, alpha)
    q.ellipse(x, y, r + 5, r + 5)
  }
}

function drawRectangleGradient(
  q: p5Types,
  x: number,
  y: number,
  w: number,
  h: number,
  t: number,
  step: number,
  color: Interpolator
) {
  for (let iw = x; iw < x + w; iw += step) {
    const c = color(iw / w + t)
    q.stroke(255, 255, 255, 2)
    q.strokeWeight(2)
    q.fill(...c, 80)
    q.rect(x + iw, y, step, h)
  }
}

const scale = 1

function withTranslation(
  q: p5Types,
  x: number,
  y: number,
  routine: (q: p5Types) => void
) {
  q.translate(x, y)
  routine(q)
  q.translate(-x, -y)
}

function withRotation(q: p5Types, r: number, routine: (q: p5Types) => void) {
  q.rotate(r)
  routine(q)
  q.rotate(-r)
}

function drawBar(
  q: p5Types,
  midX: number,
  midY: number,
  x: number,
  y: number,
  rotation: number,
  t: number
) {
  withTranslation(q, midX + x, midY + y, (q) => {
    withRotation(q, rotation + t, (q) => {
      // q.stroke(255, 255, 255, 32)
      // q.strokeWeight(2)
      // q.noFill()
      // q.rect(0, 0, 192, 16)

      drawRectangleGradient(q, 0, 0, 1024, 16, t, 8, dzogchen)
    })
  })
}

export function RainbowBodyIII() {
  const dpr = useRef<number>(1)
  const setup = useCallback((q: p5Types) => {
    dpr.current = q.pixelDensity()
    const w = Math.round(q.width / (scale * dpr.current))
    const h = Math.round(q.height / (scale * dpr.current))
    q.noSmooth()
    // q.drawingContext.filter = 'blur(8px)'
  }, [])

  useEffect(() => {
    const i = setInterval(() => {
      if (!isFxHash()) {
        config = generate()
      }
    }, 30000)

    return () => clearInterval(i)
  }, [])

  const draw = useCallback((q: p5Types) => {
    const _t = config.baseT + q.millis() / 10000
    // const _t =
    //   q.millis() / 10000 +
    //   0.2 * Math.sin(q.millis() / 1000) +
    //   0.2 * Math.cos(Math.sin(q.millis() / 10000))

    const t =
      _t +
      4 *
        Math.sin(_t / 500) *
        Math.sin(Math.sin(_t / 2000) + Math.cos(_t / 1000)) *
        (4 * Math.cos(_t / 422 + 44)) *
        50

    q.background(0)
    const localScale = isSmallScreen(q) ? 0.6 : 1

    const margin = q.createVector(q.width / (8 * scale), q.width / (8 * scale))
    const area = q.createVector(q.width - 2 * margin.x, q.height - 2 * margin.y)
    const palette = config.palette

    q.translate(q.width, q.height / 4)
    q.rotate(45)
    drawRectangleGradient(
      q,
      -q.width / 2,
      -q.height / 2,
      q.width + q.height,
      q.height + q.width,
      t,
      24 * localScale,
      palette
    )
    q.rotate(-45)
    q.translate(-q.width, -q.height / 4)

    const midX = margin.x + area.x / 2
    const midY = margin.y + area.y / 2

    // drawBar(q, midX, midY, -320, -320, Math.PI / 4, t)
    // drawBar(q, midX, midY, 320, -320, (3 * Math.PI) / 4, t)
    // drawBar(q, midX, midY, 320, 320, (5 * Math.PI) / 4, t)
    // drawBar(q, midX, midY, -320, 320, (7 * Math.PI) / 4, t)
    const r =
      (area.y + config.coreRadius * (0.1 + Math.sin(t + config.phaseOffset))) * localScale
    const rr =
      (area.y + config.coreRadius * (0.1 + Math.sin(t + Math.PI / 2))) * localScale
    const rrr = (area.y + config.coreRadius * Math.sin(t + Math.PI)) * localScale

    q.blendMode(q.SCREEN)

    for (let i = 0; i < config.ringACount; i++) {
      const p = Math.PI / 4 + (i / config.ringACount) * Math.PI * 2 + Math.sin(_t)
      drawRadialGradient(
        q,
        midX + config.ringARadius * Math.cos(p) * localScale,
        midY + config.ringARadius * Math.sin(p) * localScale,
        r / 2,
        t / 2,
        32,
        palette,
        localScale
      )
    }

    for (let i = 0; i < config.ringBCount; i++) {
      const p = (i / config.ringBCount) * Math.PI * 2 + Math.cos(_t)
      drawRadialGradient(
        q,
        midX + config.ringBRadius * Math.cos(p) * localScale,
        midY + config.ringBRadius * Math.sin(p) * localScale,
        rr / 3,
        t / 3,
        48,
        palette,
        localScale
      )
    }

    drawRadialGradient(q, midX, midY, rrr, t, 16, palette, localScale)
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
      sketchName="Rainbow Body II"
      enableScreenshot
      onMouseClicked={() => {
        if (!isFxHash()) {
          config = generate()
        }
      }}
    />
  )
}
