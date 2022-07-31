import * as Tone from 'tone'
import { BiquadFilter, Sequence } from 'tone'
import { song } from '../patterns'
import { RadialAudioNodeMonitor } from '../RadialAudioNodeMonitor'

const numCols = 16
const vol = new Tone.Volume(-12).toDestination()

const onSeqStep = (_time: number, value: string) => {
  if (value !== '-') synth.triggerAttackRelease(value, '8n')
}

// const sequence = new Sequence(onSeqStep, song, '8n')
const bass = new Tone.Pattern(
  function (time, note) {
    if (note !== '-') synth.triggerAttackRelease(note, '8n')
  },
  ['C2', '-', 'E2', '-', 'D2', '-'],
  'upDown'
)
const pattern = new Tone.Pattern(
  function (time, note) {
    if (note !== '-') pad.triggerAttackRelease(note, '4n')
  },
  ['C2', 'D4', '-', 'E5', 'A3', '-', 'C3'],
  'upDown'
)

const pattern2 = new Tone.Pattern(
  function (time, note) {
    if (note !== '-') pad.triggerAttackRelease(note, '4n')
  },
  ['C4', 'D4', 'E5', 'A5', 'F5'],
  'alternateDown'
)

const sparkle = new Tone.Pattern(
  function (time, note) {
    if (note !== '-') pluck.triggerAttackRelease(note, '16n')
  },
  ['C4', '-', 'E5', '-', 'F5'],
  'randomWalk'
)

// Setup a reverb with ToneJS
const reverb = new Tone.Reverb({
  decay: 8,
  wet: 0.5,
  preDelay: 0.25,
})

// Load the reverb
reverb.generate()

// Create an effect node that creates a feedback delay
const effect = new Tone.FeedbackDelay(`${Math.floor(numCols / 2)}n`, 1 / 3)
effect.wet.value = 0.2

// Setup a synth with ToneJS
// We use a poly synth which can hold up to numRows voices
// Then we will play each note on a different voice
const synth = new Tone.PolySynth()

// Setup the synths a little bit
synth.set({
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

const pluck = new Tone.MetalSynth({
  harmonicity: 0.5,
  octaves: 2,
})

const filter = new Tone.Filter(1000)
const delay = new Tone.Delay(1.9)

// Wire up our nodes:
synth.connect(effect)
pad.connect(filter).connect(delay).connect(effect)
pluck.connect(effect)
synth.connect(vol)
pad.connect(vol)
effect.connect(reverb)
reverb.connect(vol)

export function Arpeggio() {
  return (
    <>
      <button
        type="button"
        onClick={() => {
          Tone.Transport.bpm.value = 240
          Tone.start()
          // sequence.start(0)
          const patterns = [pattern, bass, sparkle]
          patterns.forEach((p) => p.start())

          Tone.Transport.start()
        }}
      >
        Start
      </button>
      <RadialAudioNodeMonitor
        width={512}
        height={512}
        input={vol}
        fftAnalysisSampleRate={30}
        detail={4}
      />
    </>
  )
}
