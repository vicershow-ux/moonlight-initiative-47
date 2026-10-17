import { useSyncExternalStore } from "react"

export interface CartWork {
  name: string
  category: string
  unit: string
  price: number
  quantity: number
}

const KEY = "fixkey_work_cart"
const listeners = new Set<() => void>()

const read = (): CartWork[] => {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "[]")
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}

let state: CartWork[] = typeof window === "undefined" ? [] : read()

const write = (next: CartWork[]) => {
  state = next
  localStorage.setItem(KEY, JSON.stringify(next))
  listeners.forEach((l) => l())
}

const same = (a: { name: string; category: string }, b: { name: string; category: string }) =>
  a.name === b.name && a.category === b.category

export const workCart = {
  set(work: Omit<CartWork, "quantity">, quantity: number) {
    const q = Math.max(0, Math.round(quantity * 100) / 100)
    const exists = state.some((w) => same(w, work))
    if (q <= 0) return write(state.filter((w) => !same(w, work)))
    write(exists ? state.map((w) => (same(w, work) ? { ...w, quantity: q } : w)) : [...state, { ...work, quantity: q }])
  },
  remove(work: { name: string; category: string }) {
    write(state.filter((w) => !same(w, work)))
  },
  clear() {
    write([])
  },
}

const subscribe = (l: () => void) => {
  listeners.add(l)
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      state = read()
      l()
    }
  }
  window.addEventListener("storage", onStorage)
  return () => {
    listeners.delete(l)
    window.removeEventListener("storage", onStorage)
  }
}

export function useWorkCart() {
  const items = useSyncExternalStore(subscribe, () => state, () => state)
  const total = items.reduce((s, w) => s + w.price * w.quantity, 0)
  const qtyOf = (w: { name: string; category: string }) => items.find((x) => same(x, w))?.quantity || 0
  return { items, total, count: items.length, qtyOf }
}

export default useWorkCart
