import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@fontsource/reem-kufi/400.css'
import '@fontsource/reem-kufi/500.css'
import '@fontsource/reem-kufi/600.css'
import '@fontsource/changa/arabic-400.css'
import '@fontsource/changa/arabic-500.css'
import '@fontsource/changa/arabic-600.css'
import '@fontsource/changa/arabic-700.css'
import './styles/index.css'
import { LangProvider } from './state/LangContext'
import { TransitionProvider } from './state/TransitionContext'
import { startSmoothScroll } from './animations/lenis'
import App from './App'

// Before the first render, so the preloader can hold the page still.
startSmoothScroll()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <LangProvider>
        <TransitionProvider>
          <App />
        </TransitionProvider>
      </LangProvider>
    </BrowserRouter>
  </StrictMode>,
)
