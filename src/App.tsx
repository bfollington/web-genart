import './App.css'

const isFxhash = !!process.env.REACT_APP_FXHASH
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Entry = require(isFxhash ? './FxHashEntry' : './GalleryEntry').default

function App() {
  return (
    <div className="App">
      <Entry />
    </div>
  )
}

export default App
