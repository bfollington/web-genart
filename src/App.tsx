import './App.css'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Entry = require(window.process &&
  window.process.env &&
  window.process.env.REACT_APP_FXHASH
  ? './FxHashEntry'
  : './GalleryEntry').default

function App() {
  return (
    <div className="App">
      <Entry />
    </div>
  )
}

export default App