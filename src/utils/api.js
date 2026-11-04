/** Posts a form to the server. Resolves to { reference }, { errors } or { failure }. */
export async function submit(body) {
  let res
  try {
    res = await fetch('/api/submissions', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    return { failure: 'network' }
  }
  if (res.status === 429) return { failure: 'rate' }
  const data = await res.json().catch(() => null)
  if (res.status === 422 && data?.errors) return { errors: data.errors }
  if (res.ok && data?.reference) return { reference: data.reference }
  return { failure: 'server' }
}
