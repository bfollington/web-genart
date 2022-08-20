import { interpolateCosine } from './util'

export const dzogchen = interpolateCosine(
  [239 / 255, 160 / 255, 87 / 255],
  [255 / 255, 228 / 255, 228 / 255],
  [94 / 255, 186 / 255, 234 / 255],
  [44 / 255, 160 / 255, 0 / 255]
)

export const test = interpolateCosine(
  [0.5, 0.5, 0.5],
  [0.5, 0.5, 0.5],
  [1.0, 1.0, 1.0],
  [0.3, 0.2, 0.2]
)

export const c = interpolateCosine(
  [0.5, 0.5, 0.5],
  [0.5, 0.5, 0.5],
  [1.0, 1.0, 1.0],
  [0.0, 0.1, 0.2]
)

export const d = interpolateCosine(
  [0.5, 0.5, 0.5],
  [0.5, 0.5, 0.5],
  [1.0, 1.0, 0.5],
  [0.8, 0.9, 0.3]
)

export const e = interpolateCosine(
  [0.5, 0.5, 0.5],
  [0.5, 0.5, 0.5],
  [1.0, 0.7, 0.4],
  [0.0, 0.15, 0.2]
)

export const f = interpolateCosine(
  [0.5, 0.5, 0.5],
  [0.5, 0.5, 0.5],
  [2.0, 1.0, 0.0],
  [0.5, 0.2, 0.25]
)

export const g = interpolateCosine(
  [0.8, 0.5, 0.4],
  [0.2, 0.4, 0.2],
  [2.0, 1.0, 1.0],
  [0.0, 0.25, 0.25]
)
