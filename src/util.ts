export function choose<T>(from: T[]) {
  if (from.length === 0) throw new Error('Cannot choose from empty list')
  return from[Math.floor(Math.random() * from.length)]
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
  return [...Array(rows)].map((_, ri) =>
    [...Array(columns)].map((_, ci) => [ri / rows, ci / columns])
  )
}
