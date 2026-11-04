import { useCallback, useState } from 'react'
import { submit } from '../../utils/api'
import { useLang } from '../../state/LangContext'
import { ui } from '../../content/ui'

const MESSAGES = {
  email: { invalid: ui.errEmail },
  phone: { invalid: ui.errPhone },
  contact: { required: ui.errContact },
  consent: { required: ui.errConsent },
}

/** Sends a form to the Maison and maps server validation to readable messages. */
export function useSubmission() {
  const { lang, t } = useLang()
  const [state, setState] = useState({ status: 'idle', errors: {}, failure: null, reference: null })

  const send = useCallback(async (body) => {
    setState((s) => ({ ...s, status: 'sending', failure: null }))
    const result = await submit({ ...body, language: lang })
    if (result.reference) {
      setState({ status: 'sent', errors: {}, failure: null, reference: result.reference })
      return result
    }
    setState({ status: 'idle', errors: result.errors ?? {}, failure: result.failure ?? null, reference: null })
    return result
  }, [lang])

  const reset = useCallback(() => setState({ status: 'idle', errors: {}, failure: null, reference: null }), [])

  const errorFor = useCallback((field) => {
    const code = state.errors[field]
    if (!code) return null
    return t(MESSAGES[field]?.[code] ?? ui.errRequired)
  }, [state.errors, t])

  const failureMessage = state.failure ? t(state.failure === 'rate' ? ui.errRate : ui.errServer) : null

  return { ...state, send, reset, errorFor, failureMessage }
}
