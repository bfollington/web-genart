import "./App.css";

const isExport = process.env.REACT_APP_FXHASH;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Entry = require(isExport ? "./FxHashEntry" : "./GalleryEntry").default;

function App() {
  return (
    <div className="App">
      <Entry />
    </div>
  );
}

export default App;
