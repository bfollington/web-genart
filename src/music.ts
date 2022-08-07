import * as Tone from 'tone'
import { Time } from 'tone/Tone/core/type/Units'
import { Instrument, InstrumentOptions } from 'tone/Tone/instrument/Instrument'

export const scales: { [name: string]: Scale } = {
  aMinor: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
  cMajor: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
}

export type Note = 'A' | 'B' | 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#'
export type Scale = Note[]
export type Chord = Note[]
export type OctaveNote = `${Note}-${number}`

export const scaleToOctave = (scale: Scale, octaveNumber: number) =>
  scale.map((note) => {
    const firstOctaveNoteIndex =
      scale.indexOf('C') !== -1 ? scale.indexOf('C') : scale.indexOf('C#')
    const noteOctaveNumber =
      scale.indexOf(note) < firstOctaveNoteIndex ? octaveNumber - 1 : octaveNumber
    return `${note}-${noteOctaveNumber}`
  }) as OctaveNote[]

function shiftOctave(note: OctaveNote, shift: number) {
  const parts = note.split('-')
  const updatedOctave = parseInt(parts[1]) + shift
  return `${parts[0]}-${updatedOctave}`
}

export const constructMajorChord = (
  scale: Scale,
  octave: number,
  rootNote: OctaveNote
): Chord => {
  const scaleWithOctave = scaleToOctave(scale, octave)

  const getNextChordNote = (note: OctaveNote, nextNoteNumber: number) => {
    const nextNoteInScaleIndex = scaleWithOctave.indexOf(note) + nextNoteNumber - 1
    let nextNote
    if (typeof scaleWithOctave[nextNoteInScaleIndex] !== 'undefined') {
      nextNote = scaleWithOctave[nextNoteInScaleIndex]
    } else {
      nextNote = scaleWithOctave[nextNoteInScaleIndex - 7]
      nextNote = shiftOctave(nextNote, 1)
    }

    return nextNote
  }

  const thirdNote = getNextChordNote(rootNote, 3)
  const fifthNote = getNextChordNote(rootNote, 5)
  const octaveRootNote = shiftOctave(rootNote, -1)
  const chord = [rootNote, thirdNote, fifthNote, octaveRootNote]

  return chord as Chord
}
export const IChord = constructMajorChord(scales.aMinor, 4, 'A-3')
// Output: ['A3', 'C4', 'E4']
const VChord = constructMajorChord(scales.aMinor, 4, 'E-4')
// Output: ['E4', 'G4', 'B4']
const VIChord = constructMajorChord(scales.aMinor, 3, 'F-3')
// Output: ['F3', 'A3', 'C3']
const IVChord = constructMajorChord(scales.aMinor, 3, 'D-3')
// Output: ['D3', 'F3', 'A3']

export function strumChord<O extends InstrumentOptions>(
  chord: Chord,
  instrument: Instrument<O>,
  duration: Time,
  strumDelay: number,
  time = 0
) {
  chord.forEach((note, i) => {
    console.log(i * strumDelay)
    instrument.triggerAttackRelease(
      note.replace('-', ''),
      duration,
      time + i * strumDelay
    )
  })
}
