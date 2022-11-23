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
import { Chords } from './sketches/Chords'
import ScreenQuadScene from './sketches/FullscreenShader'
import FlightOfTheOctaHedra from './sketches/FlightOfTheOctahedra'
import RaymarchingTemplate from './sketches/RaymarchingTemplate'
import { Drums } from './sketches/Drums'
import { RainbowBodyIII } from './sketches/RainbowBodyIII'
import { Dungeon } from './sketches/Dungeon'
import { RectGrid } from './sketches/RectGrid'
import { Subdivision } from './sketches/Subdivision'
import { Agents } from './sketches/Agents'
import { Graph } from './sketches/Graph'
import Subconscious from './sketches/Subconscious'

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
            <Route path="/chords" element={<Chords />} />
            <Route path="/rainbow" element={<RainbowBody />} />
            <Route path="/rainbow-ii" element={<RainbowBodyII />} />
            <Route path="/rainbow-iii" element={<RainbowBodyIII />} />
            <Route path="/fullscreen-shader" element={<ScreenQuadScene />} />
            <Route path="/octahedra" element={<FlightOfTheOctaHedra />} />
            <Route path="/raymarching" element={<RaymarchingTemplate />} />
            <Route path="/drums" element={<Drums />} />
            <Route path="/dungeon" element={<Dungeon />} />
            <Route path="/rectgrid" element={<RectGrid />} />
            <Route path="/subdivision" element={<Subdivision />} />
            <Route path="/agents" element={<Agents />} />
            <Route path="/graph" element={<Graph />} />
            <Route path="/subconscious" element={<Subconscious />} />
          </Routes>
        </BrowserRouter>
      </Frame>
    </div>
  )
}

export default GalleryEntry
