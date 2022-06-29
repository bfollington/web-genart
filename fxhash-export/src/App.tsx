import "./App.css";
import { EyeballSoup } from "gallery/lib/sketches/EyeballSoup";
import { Frame } from "gallery/src/Frame";

function App() {
  return (
    <div className="App">
      <Frame>
        <EyeballSoup />
      </Frame>
    </div>
  );
}

export default App;
