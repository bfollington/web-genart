import * as Tone from 'tone'
import { BiquadFilter, Sequence } from 'tone'
import {
  constructMajorChord,
  IChord,
  Note,
  OctaveNote,
  scales,
  strumChord,
} from '../music'
import { song } from '../patterns'
import { RadialAudioNodeMonitor } from '../RadialAudioNodeMonitor'

const numCols = 16
const vol = new Tone.Volume(-12).toDestination()

// PATTERNS

const bass = new Tone.Pattern(
  function (time, note) {
    if (note !== '-') bassSynth.triggerAttackRelease(note, '8n')
  },
  ['C2', '-', 'E2', '-', 'D2', '-'],
  'upDown'
)

// Walk along a series of notes, constructing a chord for each
const pattern = new Tone.Pattern(
  function (time, note) {
    if (note !== '-') {
      const chord = constructMajorChord(scales.aMinor, 4, note as OctaveNote)
      console.log(chord)
      strumChord(chord, chordSynth as any, '4n', 0.015, time)
    }
  },
  ['A-3', 'A-3', '-', 'E-4', 'F-3', '-', 'D-3'],
  'upDown'
)

const pattern2 = new Tone.Pattern(
  function (time, note) {
    if (note !== '-') pluck.triggerAttackRelease(note, '4n')
  },
  ['C4', 'D4', 'E5', 'A3', 'F5'],
  'alternateDown'
)

const sparkle = new Tone.Pattern(
  function (time, note) {
    if (note !== '-') pad.triggerAttackRelease(note, '16n')
  },
  ['C4', '-', 'E5', '-', 'F5'],
  'randomWalk'
)

// EFFECTS

// reverb
const reverb = new Tone.Reverb({
  decay: 8,
  wet: 0.5,
  preDelay: 0.25,
})
reverb.generate()

// feedback delay
const effect = new Tone.FeedbackDelay(`${Math.floor(numCols / 2)}n`, 1 / 3)
effect.wet.value = 0.2

// INSTRUMENTS

// bass synth
const bassSynth = new Tone.PolySynth()
bassSynth.set({
  oscillator: {
    type: 'triangle4',
  },
  volume: -10,
  envelope: {
    attack: 0.005,
    release: 0.05,
    sustain: 1,
  },
  detune: 8,
})

const chordSynth = new Tone.PolySynth({ maxPolyphony: 5 })
chordSynth.set({
  oscillator: {
    type: 'triangle4',
  },
  volume: -10,
  envelope: {
    attack: 0.005,
    release: 0.05,
    sustain: 1,
  },
})

const pad = new Tone.DuoSynth({
  voice0: {
    oscillator: {
      type: 'square',
    },
  },
  voice1: {
    oscillator: {
      type: 'triangle',
    },
  },
  detune: 8,
  volume: -10,
  vibratoAmount: 0.8,
  vibratoRate: 25,
})
pad.harmonicity.value = 0.5

const pluck = new Tone.PolySynth({
  maxPolyphony: 2,
  volume: -10,
})

const filter = new Tone.Filter(1000)
const delay = new Tone.Delay(1.9)

// Wire up our nodes:
bassSynth.connect(effect)
chordSynth.connect(effect)
pad.connect(filter).connect(delay).connect(effect)
pluck.connect(effect)
bassSynth.connect(vol)
pad.connect(vol)
effect.connect(reverb)
reverb.connect(vol)

console.log(IChord)

export function Chords() {
  return (
    <>
      <button
        type="button"
        onClick={() => {
          Tone.Transport.bpm.value = 120
          Tone.start()
          // sequence.start(0)
          const patterns = [pattern, bass, pattern2]
          patterns.forEach((p) => p.start())

          Tone.Transport.start()
        }}
      >
        Start
      </button>
      <RadialAudioNodeMonitor
        width={1024}
        height={1024}
        input={vol}
        fftAnalysisSampleRate={30}
        detail={4}
      />
    </>
  )
}
