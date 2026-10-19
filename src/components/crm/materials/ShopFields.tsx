import { useEffect, useId, useState } from "react"
import { materialsApi, MaterialItem } from "@/lib/api"
import { formatPhone } from "@/lib/phone"
import { inputCls } from "./constants"

const labelCls = "mb-1.5 block text-xs text-white/50"

export interface KnownShop {
  name: string
  address: string
  phone: string
}

/** Собирает магазины, которые уже встречались в справочнике и предложениях */
export function collectShops(materials: MaterialItem[]): KnownShop[] {
  const map = new Map<string, KnownShop>()
  const push = (name: string, address: string, phone: string) => {
    const n = (name || "").trim()
    const a = (address || "").trim()
    if (!n && !a) return
    const key = `${n.toLowerCase()}|${a.toLowerCase()}`
    const prev = map.get(key)
    if (!prev) map.set(key, { name: n, address: a, phone: (phone || "").trim() })
    else if (!prev.phone && phone) prev.phone = phone.trim()
  }
  materials.forEach((m) => {
    push(m.shop_name, m.shop_address, m.shop_phone)
    ;(m.offers || []).forEach((o) => push(o.shop_name, o.shop_address, o.shop_phone))
  })
  return Array.from(map.values())
}

/** Подгружает справочник, если список магазинов не передали снаружи */
export function useKnownShops(materials?: MaterialItem[]) {
  const [loaded, setLoaded] = useState<MaterialItem[]>([])
  useEffect(() => {
    if (materials) return
    materialsApi
      .list()
      .then((d) => setLoaded(d.materials || []))
      .catch(() => setLoaded([]))
  }, [materials])
  return collectShops(materials || loaded)
}

interface ShopFieldsProps {
  shops: KnownShop[]
  name: string
  address: string
  phone: string
  onChange: (field: "shop_name" | "shop_address" | "shop_phone", value: string) => void
  nameLabel?: string
}

export function ShopFields({ shops, name, address, phone, onChange, nameLabel = "Название магазина" }: ShopFieldsProps) {
  const id = useId()
  const names = Array.from(new Set(shops.map((s) => s.name).filter(Boolean))).sort()
  const sameName = shops.filter((s) => s.name.toLowerCase() === name.trim().toLowerCase())
  const addresses = Array.from(
    new Set((sameName.length ? sameName : shops).map((s) => s.address).filter(Boolean)),
  ).sort()

  const pickName = (value: string) => {
    onChange("shop_name", value)
    const matches = shops.filter((s) => s.name.toLowerCase() === value.trim().toLowerCase())
    if (matches.length === 1) {
      if (!address && matches[0].address) onChange("shop_address", matches[0].address)
      if (!phone && matches[0].phone) onChange("shop_phone", matches[0].phone)
    }
  }

  const pickAddress = (value: string) => {
    onChange("shop_address", value)
    const match = shops.find((s) => s.address.toLowerCase() === value.trim().toLowerCase())
    if (match) {
      if (!name && match.name) onChange("shop_name", match.name)
      if (!phone && match.phone) onChange("shop_phone", match.phone)
    }
  }

  return (
    <>
      <div>
        <label className={labelCls}>{nameLabel}</label>
        <input
          className={inputCls}
          list={`${id}-names`}
          placeholder={names.length ? "Выберите из списка или введите новый" : "Например: Леруа Мерлен"}
          value={name}
          onChange={(e) => pickName(e.target.value)}
        />
        <datalist id={`${id}-names`}>
          {names.map((n) => (
            <option key={n} value={n} />
          ))}
        </datalist>
      </div>
      <div>
        <label className={labelCls}>Адрес магазина</label>
        <input
          className={inputCls}
          list={`${id}-addr`}
          placeholder={addresses.length ? "Выберите из списка или введите новый" : "Город, улица, дом"}
          value={address}
          onChange={(e) => pickAddress(e.target.value)}
        />
        <datalist id={`${id}-addr`}>
          {addresses.map((a) => (
            <option key={a} value={a} />
          ))}
        </datalist>
      </div>
      <div>
        <label className={labelCls}>Телефон</label>
        <input
          className={inputCls}
          type="tel"
          inputMode="tel"
          placeholder="+7 (___) ___-__-__"
          value={phone}
          onChange={(e) => onChange("shop_phone", e.target.value ? formatPhone(e.target.value) : "")}
        />
      </div>
    </>
  )
}

export default ShopFields
