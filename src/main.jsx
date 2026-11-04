import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@fontsource/cormorant/400.css'
import '@fontsource/cormorant/500.css'
import '@fontsource/cormorant/400-italic.css'
import '@fontsource/jost/400.css'
import '@fontsource/jost/500.css'
import '@fontsource/amiri/400.css'
import '@fontsource/ibm-plex-sans-arabic/400.css'
import '@fontsource/ibm-plex-sans-arabic/500.css'
import '@fontsource/mrs-saint-delafield/400.css'
import './styles/index.css'
import { LangProvider } from './state/LangContext'
import { BagProvider } from './state/BagContext'
import { TransitionProvider } from './state/TransitionContext'
import { startSmoothScroll } from './animations/lenis'
import App from './App'

// Before the first render, so the preloader can hold the page still.
startSmoothScroll()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <LangProvider>
        <BagProvider>
          <TransitionProvider>
            <App />
          </TransitionProvider>
        </BagProvider>
      </LangProvider>
    </BrowserRouter>
  </StrictMode>,
)
