import * as Tone from 'tone'
import './App.css'

// Great Fairy Fountain melody
const notes = [
  'A6',
  'D6',
  'Bb5',
  'G5',
  //
  'G6',
  'D6',
  'Bb5',
  'G5',
  //
  'Gb6',
  'D6',
  'Bb5',
  'G5',
  //
  'G6',
  'D6',
  'Bb5',
  'G5',
  ////
  'G6',
  'C6',
  'A5',
  'F5',
  //
  'F6',
  'C6',
  'A5',
  'F5',
  //
  'E6',
  'C6',
  'A5',
  'F5',
  //
  'F6',
  'C6',
  'A5',
  'F5',
  ////
  'F6',
  'Bb5',
  'G5',
  'E5',
  //
  'E6',
  'Bb5',
  'G5',
  'E5',
  //
  'Eb6',
  'Bb5',
  'G5',
  'E5',
  //
  'E6',
  'Bb5',
  'G5',
  'E5',
  ////
  'E6',
  'A5',
  'F5',
  'D5',
  //
  'D6',
  'A5',
  'F5',
  'D5',
  //
  'Db6',
  'A5',
  'F5',
  'D5',
  //
  'D6',
  'A5',
  'F5',
  'D5',
  ////
]

const AMidi = [93, 86, 82, 79, 91, 86, 82, 79, 90, 86, 82, 79, 91, 86, 82, 79]
const BMidi = [91, 84, 81, 77, 89, 84, 81, 77, 88, 84, 81, 77, 89, 84, 81, 77]
const CMidi = [89, 82, 79, 76, 88, 82, 79, 76, 87, 82, 79, 76, 88, 82, 79, 76]
const DMidi = [88, 81, 77, 74, 86, 81, 77, 74, 85, 81, 77, 74, 86, 81, 77, 74]

const BMidiRel = BMidi.map((n, i) => AMidi[i] - n)
const CMidiRel = CMidi.map((n, i) => BMidi[i] - n)
const DMidiRel = DMidi.map((n, i) => CMidi[i] - n)

const root = 93
const basePattern = [
  [0, -7, -11, -14],
  [-2, -7, -11, -14],
  [-3, -7, -11, -14],
  [-2, -7, -11, -14],
]

function applyShift(pattern: number[][], shift: number[][]) {
  return pattern.map((p, i) => p.map((n, j) => n + shift[i][j]))
}

const patternWithRoot = basePattern.map((p) => p.map((n) => n + root))

function repeat<T>(val: T, count: number) {
  const res = [] as T[]
  for (let i = 0; i < count; i++) {
    res.push(val)
  }
  return res
}

const shiftA = [...repeat([-1, -2, -1, -2], 4)]
const shiftB = [[-2, -2, -2, -1], ...repeat([-1, -2, -2, -1], 3)]
const shiftC = [[-1, -1, -2, -2], ...repeat([-2, -1, -2, -2], 3)]

const A = patternWithRoot
const B = applyShift(A, shiftA)
const C = applyShift(B, shiftB)
const D = applyShift(C, shiftC)

export const song = [A, B, C, D].flat(2).map((m) => Tone.Midi(m).toNote())
