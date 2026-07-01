import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
// Self-hosted fonts & icons (no CDN, works fully offline).
import '@fontsource-variable/fredoka/index.css'
import '@fontsource-variable/nunito/index.css'
import '@fontsource-variable/nunito/wght-italic.css'
import 'material-symbols/rounded.css'
import '@tabler/icons-webfont/dist/tabler-icons.min.css'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
