import * as Tone from 'tone'
import { Sequence } from 'tone'
import './App.css'
import { AudioNodeMonitor } from './AudioNodeMonitor'
import { song } from './patterns'
import { EyeballSoup } from './sketches/eyeballSoup'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

const vol = new Tone.Volume(-12).toDestination()
const synth = new Tone.PolySynth()

synth.connect(vol)

const onSeqStep = (_time: number, value: string) => {
  if (value !== '-') synth.triggerAttackRelease(value, '8n')
}

const sequence = new Sequence(onSeqStep, song, '8n')

function AudioViz() {
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

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<EyeballSoup />} />
            <Route path="/eyeball-soup" element={<EyeballSoup />} />
            <Route path="/audio-viz" element={<AudioViz />} />
          </Routes>
        </BrowserRouter>
      </header>
    </div>
  )
}

export default App
