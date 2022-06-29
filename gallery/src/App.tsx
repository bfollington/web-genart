import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import { Frame } from './Frame'
import { Bezier } from './sketches/Bezier'
import { EyeballSoup } from './sketches/EyeballSoup'
import { AudioViz } from './sketches/SynthAudioNodeViz'

function App() {
  return (
    <div className="App">
      <Frame>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<EyeballSoup />} />
            <Route path="/eyeball-soup" element={<EyeballSoup />} />
            <Route path="/bezier" element={<Bezier />} />
            <Route path="/audio-viz" element={<AudioViz />} />
          </Routes>
        </BrowserRouter>
      </Frame>
    </div>
  )
}

export default App
