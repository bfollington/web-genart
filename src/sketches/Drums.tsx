import { Box, Cloud, Environment, OrbitControls, Sky } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
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
import { Stars } from '@react-three/drei'
import { atom, useAtom } from 'jotai'
import { useEffect } from 'react'
import { Color } from 'three'
import '../RefractionMaterial'
import Diamonds from './refraction/Diamonds'
import {
  Bloom,
  DepthOfField,
  EffectComposer,
  Noise,
  Vignette,
} from '@react-three/postprocessing'

const numCols = 16
const vol = new Tone.Volume(-12).toDestination()
const beats = atom(0)
// eslint-disable-next-line @typescript-eslint/no-empty-function
let onBeat = () => {}

// PATTERNS
const kick = new Tone.Pattern(
  function (time, note) {
    if (note !== '-') kickDrum.triggerAttackRelease(note, '8n')
  },
  ['-', 'C1', '-', 'E1', '-', 'D1', '-', 'C1', 'C1'],
  'upDown'
)

const bass = new Tone.Pattern(
  function (time, note) {
    if (note !== '-') bassSynth.triggerAttackRelease(note, '16n')
  },
  ['A#2', 'B1', 'E2', 'C3', 'F2'],
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
    if (note !== '-') {
      pluck.triggerAttackRelease(note, '4n')
      onBeat()
    }
  },
  ['C4', 'D4', 'E5', 'A3', 'F5'],
  'alternateDown'
)

const sparkle = new Tone.Pattern(
  function (time, note) {
    if (note !== '-') pad.triggerAttackRelease(note, '32n')
  },
  ['A#6', 'C5', 'F5', 'E7', 'F6', 'B6'],
  'alternateUp'
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

const kickDrum = new Tone.MembraneSynth()

kickDrum.set({
  volume: -10,
})

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
effect.connect(reverb)
reverb.connect(vol)
kickDrum.connect(vol)

console.log(IChord)

export function Drums() {
  return (
    <>
      <button
        type="button"
        onClick={() => {
          Tone.Transport.bpm.value = 240
          Tone.start()
          // sequence.start(0)
          const patterns = [kick, bass, sparkle]
          patterns.forEach((p) => p.start())

          Tone.Transport.start()
        }}
      >
        Start
      </button>
      <Sketch />
    </>
  )
}

function Sketch() {
  const [beatsValue, setBeats] = useAtom(beats)
  useEffect(() => {
    onBeat = () => setBeats((b) => b + 1)
  }, [setBeats])

  return (
    <Canvas>
      <Sky azimuth={0} inclination={0.8} rayleigh={0.2} distance={8} />
      {/* <Stars /> */}
      {/* <Cloud scale={2} position={[0, -10, -20]} color="white" /> */}
      <Diamonds />
      <pointLight position={[0, 0, 0]} intensity={0.5} />
      <OrbitControls />
      <EffectComposer>
        <DepthOfField focusDistance={0} focalLength={0.02} bokehScale={2} height={480} />
        <Bloom luminanceThreshold={0} luminanceSmoothing={0.9} height={800} />
        <Noise opacity={0.1} />
      </EffectComposer>
    </Canvas>
  )
}
