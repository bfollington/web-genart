import { random } from './random'

export type FxHashWindow = Window & {
  fxrand?: () => number
  isFxpreview?: boolean
}

export function choose<T>(from: T[]) {
  if (from.length === 0) throw new Error('Cannot choose from empty list')
  return from[Math.floor(random() * from.length)]
}

// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
export function shuffle(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    const temp = array[i]
    array[i] = array[j]
    array[j] = temp
  }

  return array
}

export function isFxHash() {
  const isExport = process.env.REACT_APP_BUILD_TARGET === 'fxhash'
  return !!isExport
}

export function isFxPreview() {
  return !!(window as FxHashWindow).isFxpreview
}

export function hexToRGB(hex: string, alpha?: number) {
  const r = parseInt(hex.slice(1, 3), 16),
    g = parseInt(hex.slice(3, 5), 16),
    b = parseInt(hex.slice(5, 7), 16)

  if (alpha) {
    return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')'
  } else {
    return 'rgb(' + r + ', ' + g + ', ' + b + ')'
  }
}

export function hexToAdjustable(hex: string) {
  return (alpha: number) => hexToRGB(hex, alpha)
}

export function grid(rows: number, columns: number) {
  return {
    cells: [...Array(rows)].map((_, ri) =>
      [...Array(columns)].map((_, ci) => [ri / rows, ci / columns])
    ),
    rows,
    columns,
  }
}

type RGBTriple = [number, number, number]
export function interpolateCosine(
  [ar, ag, ab]: RGBTriple,
  [br, bg, bb]: RGBTriple,
  [cr, cg, cb]: RGBTriple,
  [dr, dg, db]: RGBTriple
) {
  return (t: number) =>
    [
      ar + br * Math.cos(2 * Math.PI * (cr * t + dr)),
      ag + bg * Math.cos(2 * Math.PI * (cg * t + dg)),
      ab + bb * Math.cos(2 * Math.PI * (cb * t + db)),
    ].map((v) => Math.floor(Math.max(0, Math.min(1, v)) * 255)) as RGBTriple
}
