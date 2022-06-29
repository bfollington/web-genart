import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Bezier } from './sketches/Bezier'
import { AudioViz } from './sketches/SynthAudioNodeViz'
import { EyeballSoup } from './sketches/EyeballSoup'
import { Frame } from './Frame'
import { BezierStack } from './sketches/BezierStack'

function GalleryEntry() {
  return (
    <div className="App">
      <Frame>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<BezierStack />} />
            <Route path="/eyeball-soup" element={<EyeballSoup />} />
            <Route path="/bezier" element={<Bezier />} />
            <Route path="/audio-viz" element={<AudioViz />} />
          </Routes>
        </BrowserRouter>
      </Frame>
    </div>
  )
}

export default GalleryEntry
