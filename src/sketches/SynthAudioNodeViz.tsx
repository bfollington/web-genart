import * as Tone from 'tone'
import { Sequence } from 'tone'
import { AudioNodeMonitor } from '../AudioNodeMonitor'
import { song } from '../patterns'

const vol = new Tone.Volume(-12).toDestination()
const synth = new Tone.PolySynth()

synth.connect(vol)

const onSeqStep = (_time: number, value: string) => {
  if (value !== '-') synth.triggerAttackRelease(value, '8n')
}

const sequence = new Sequence(onSeqStep, song, '8n')

export function AudioViz() {
  return (
    <>
      <button
        type="button"
        onClick={() => {
          Tone.start()
          sequence.start(0)
          Tone.Transport.start()
        }}
      >
        Start
      </button>
      <AudioNodeMonitor
        width={512}
        height={128}
        input={vol}
        fftAnalysisSampleRate={30}
        detail={4}
      />
    </>
  )
}
