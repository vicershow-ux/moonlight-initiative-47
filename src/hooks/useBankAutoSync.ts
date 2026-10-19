import { useEffect } from "react"
import { bankApi } from "@/lib/api"

const KEY = "fixkey_bank_sync_at"
const PERIOD = 10 * 60 * 1000

/** Фоновая сверка выписки Т-Банка, пока руководитель работает в кабинете */
export function useBankAutoSync(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return
    const tick = () => {
      if (document.hidden) return
      const last = Number(localStorage.getItem(KEY) || 0)
      if (Date.now() - last < PERIOD) return
      localStorage.setItem(KEY, String(Date.now()))
      bankApi
        .autosync()
        .then((r) => {
          if (r.marked) window.dispatchEvent(new Event("invoice-paid"))
        })
        .catch(() => null)
    }
    const first = setTimeout(tick, 4000)
    const timer = setInterval(tick, 60 * 1000)
    return () => {
      clearTimeout(first)
      clearInterval(timer)
    }
  }, [enabled])
}

export default useBankAutoSync
