import { FxHashWindow } from "./util";

export function random(): number {
  const w = window as FxHashWindow;
  if (w.fxrand) {
    return w.fxrand();
  }

  return Math.random();
}
