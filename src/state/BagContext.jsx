import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const KEY = 'ghalia.bag'
const BagContext = createContext(null)

function load() {
  try {
    const items = JSON.parse(localStorage.getItem(KEY))
    return Array.isArray(items) ? items : []
  } catch {
    return []
  }
}

export function BagProvider({ children }) {
  const [items, setItems] = useState(load)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items))
    } catch { /* bag lasts this visit */ }
  }, [items])

  const add = useCallback((item) => {
    setItems((list) => {
      const same = list.find((i) => i.collection === item.collection && i.format === item.format && i.filling === item.filling && i.note === item.note)
      if (same) return list.map((i) => (i === same ? { ...i, quantity: i.quantity + item.quantity } : i))
      return [...list, { ...item, id: crypto.randomUUID() }]
    })
  }, [])

  const setQuantity = useCallback((id, quantity) => {
    setItems((list) => list.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i)))
  }, [])

  const remove = useCallback((id) => setItems((list) => list.filter((i) => i.id !== id)), [])
  const clear = useCallback(() => setItems([]), [])

  const count = items.reduce((sum, i) => sum + i.quantity, 0)
  const value = useMemo(() => ({ items, count, add, setQuantity, remove, clear, open, setOpen }), [items, count, add, setQuantity, remove, clear, open])
  return <BagContext.Provider value={value}>{children}</BagContext.Provider>
}

export const useBag = () => useContext(BagContext)
