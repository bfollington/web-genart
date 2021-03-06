import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Bezier } from './sketches/Bezier'
import { AudioViz } from './sketches/SynthAudioNodeViz'
import { EyeballSoup } from './sketches/EyeballSoup'
import { Frame } from './Frame'
import { BezierStack } from './sketches/BezierStack'
import { Debug } from './sketches/Debug'
import { RainbowBody } from './sketches/RainbowBody'
import { RainbowBodyII } from './sketches/RainbowBodyII'
import { Flower } from './sketches/Flower'
import { FlowerII } from './sketches/FlowerII'
import { Arpeggio } from './sketches/Arpeggio'

function GalleryEntry() {
  return (
    <div className="App">
      <Frame>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<FlowerII />} />
            <Route path="/flower" element={<Flower />} />
            <Route path="/eyeball-soup" element={<EyeballSoup />} />
            <Route path="/debug" element={<Debug />} />
            <Route path="/bezier" element={<Bezier />} />
            <Route path="/bezier-stack" element={<BezierStack />} />
            <Route path="/audio-viz" element={<AudioViz />} />
            <Route path="/arpeggio" element={<Arpeggio />} />
          </Routes>
        </BrowserRouter>
      </Frame>
    </div>
  )
}

export default GalleryEntry
