import "./App.css";

const isExport = process.env.REACT_APP_FXHASH;
const Entry = require(isExport ? "./FxHashEntry" : "./GalleryEntry").default;

function App() {
  return (
    <div className="App">
      <Entry />
    </div>
  );
}

export default App;
