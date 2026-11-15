import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const KEY = 'ghalia.lang'
const LangContext = createContext(null)

function initialLang() {
  try {
    // Arabic first; English only when the visitor has chosen it.
    return localStorage.getItem(KEY) === 'en' ? 'en' : 'ar'
  } catch {
    return 'ar'
  }
}

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(initialLang)

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
  }, [lang])

  const setLang = useCallback((next) => {
    setLangState(next)
    try {
      localStorage.setItem(KEY, next)
    } catch { /* private window: the choice lasts this visit */ }
  }, [])

  const t = useCallback((value) => (value && typeof value === 'object' ? value[lang] : value), [lang])
  const value = useMemo(() => ({ lang, setLang, t, rtl: lang === 'ar' }), [lang, setLang, t])
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

export const useLang = () => useContext(LangContext)
