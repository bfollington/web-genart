import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Entry = require(process.env.REACT_APP_BUILD_TARGET === 'fxhash'
  ? './FxHashEntry'
  : './GalleryEntry').default

ReactDOM.render(
  <React.StrictMode>
    <Entry />
  </React.StrictMode>,
  document.getElementById('root') as HTMLElement
)
