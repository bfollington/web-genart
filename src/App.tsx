import * as Tone from 'tone'
import { Sequence } from 'tone'
import './App.css'
import { AudioNodeMonitor } from './AudioNodeMonitor'
import { song } from './patterns'
import { PixelSketch } from './pixellatedSketch'

const vol = new Tone.Volume(-12).toDestination()
const synth = new Tone.PolySynth()

synth.connect(vol)

const onSeqStep = (time, value) => {
  if (value !== '-') synth.triggerAttackRelease(value, '8n')
}

const sequence = new Sequence(onSeqStep, song, '8n')

function App() {
  return (
    <div className="App">
      <header className="App-header">
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
        {/* <PixelSketch /> */}
      </header>
    </div>
  )
}

export default App
