import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react"
import { materialLibraryApi, MaterialInput } from "@/lib/api"
import type { FinishMaterial } from "@/lib/planner/types"

interface Ctx {
  items: FinishMaterial[]
  loaded: boolean
  create: (data: MaterialInput & { image: string; content_type: string }) => Promise<FinishMaterial>
  update: (item: FinishMaterial) => Promise<void>
  remove: (id: number) => Promise<void>
}

const MaterialLibraryCtx = createContext<Ctx | null>(null)

/** Библиотека своих материалов компании — грузится один раз на планировщик */
export function MaterialLibraryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<FinishMaterial[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    materialLibraryApi
      .list()
      .then((r) => setItems(r.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoaded(true))
  }, [])

  const create = useCallback(async (data: MaterialInput & { image: string; content_type: string }) => {
    const r = await materialLibraryApi.create(data)
    setItems((l) => [...l, r.item])
    return r.item
  }, [])
  const update = useCallback(async (item: FinishMaterial) => {
    const r = await materialLibraryApi.update(item)
    setItems((l) => l.map((x) => (x.id === item.id ? r.item : x)))
  }, [])
  const remove = useCallback(async (id: number) => {
    await materialLibraryApi.remove(id)
    setItems((l) => l.filter((x) => x.id !== id))
  }, [])

  return <MaterialLibraryCtx.Provider value={{ items, loaded, create, update, remove }}>{children}</MaterialLibraryCtx.Provider>
}

export function useMaterialLibrary(): Ctx {
  const c = useContext(MaterialLibraryCtx)
  if (!c) return { items: [], loaded: false, create: async () => Promise.reject(new Error("Библиотека недоступна")), update: async () => {}, remove: async () => {} }
  return c
}

export default MaterialLibraryProvider
