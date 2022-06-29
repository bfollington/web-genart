export function random(): number {
  if ((window as any).fxrand) {
    return (window as any).fxrand()
  }

  return Math.random()
}
