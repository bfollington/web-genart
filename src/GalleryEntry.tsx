import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Bezier } from './sketches/Bezier'
import { AudioViz } from './sketches/SynthAudioNodeViz'
import { EyeballSoup } from './sketches/EyeballSoup'
import { Frame } from './Frame'
import { BezierStack } from './sketches/BezierStack'
import { Debug } from './sketches/Debug'
import { RainbowBody } from './sketches/RainbowBody'

function GalleryEntry() {
  return (
    <div className="App">
      <Frame>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RainbowBody />} />
            <Route path="/eyeball-soup" element={<EyeballSoup />} />
            <Route path="/debug" element={<Debug />} />
            <Route path="/bezier" element={<Bezier />} />
            <Route path="/audio-viz" element={<AudioViz />} />
          </Routes>
        </BrowserRouter>
      </Frame>
    </div>
  )
}

export default GalleryEntry
