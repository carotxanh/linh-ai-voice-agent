import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import RealtimeTranscription from './pages/RealtimeTranscription.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RealtimeTranscription />
  </StrictMode>,
)
