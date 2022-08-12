import React from 'react'
import './index.css'
import { createRoot } from 'react-dom/client'

const container = document.getElementById('root') as HTMLElement
const root = createRoot(container)

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Entry = require(process.env.REACT_APP_BUILD_TARGET === 'fxhash'
  ? './FxHashEntry'
  : './GalleryEntry').default

root.render(
  <React.StrictMode>
    <Entry />
  </React.StrictMode>
)
