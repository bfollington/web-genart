import "./App.css";
import { EyeballSoup } from "gallery/src/sketches/EyeballSoup";
import { Frame } from "gallery/src/Frame";
import { ReactNode } from "react";

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
