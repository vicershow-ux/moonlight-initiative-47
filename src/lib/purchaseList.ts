import { MaterialItem, MaterialOffer, ObjectMaterial } from "@/lib/api"

const num = (v: unknown, fallback = 0): number => {
  const n = typeof v === "string" ? parseFloat(v) : Number(v)
  return Number.isFinite(n) ? n : fallback
}

export interface PurchaseLine {
  name: string
  unit: string
  qty: number
  price: number
  sum: number
  shopName: string
  shopAddress: string
  shopPhone: string
  shopUrl: string
  /** сколько есть в выбранном магазине, если наличие указано */
  stock: number | null
  /** хватает ли остатка на нужное количество */
  enough: boolean
  /** сколько не хватает в выбранном магазине */
  missing: number
  /** магазинов с ценой на этот материал */
  offersCount: number
  /** сколько сэкономили против самого дорогого предложения */
  saved: number
  roomName: string
}

export interface PurchaseShop {
  name: string
  address: string
  phone: string
  lines: PurchaseLine[]
  sum: number
  /** есть ли в этом магазине позиции с нехваткой */
  hasShortage: boolean
}

export interface PurchasePlan {
  shops: PurchaseShop[]
  total: number
  saved: number
  shortageCount: number
  unknownShopCount: number
}

const NO_SHOP = "Магазин не выбран"

/**
 * Подбирает по каждому материалу магазин с лучшей ценой.
 * Магазины, где товара точно не хватает, отодвигаются в конец:
 * лучше взять чуть дороже, но забрать весь объём сразу.
 */
function pickOffer(offers: MaterialOffer[], qty: number): MaterialOffer | null {
  const priced = offers.filter((o) => num(o.price) > 0)
  if (priced.length === 0) return null

  const scored = priced.map((o) => {
    const known = !!o.stock_known
    const stock = num(o.stock)
    const enough = !known || stock >= qty
    const partial = known && stock > 0 && stock < qty
    return { offer: o, enough, partial, price: num(o.price) }
  })

  const enough = scored.filter((s) => s.enough)
  if (enough.length > 0) {
    return enough.reduce((a, b) => (b.price < a.price ? b : a)).offer
  }
  const partial = scored.filter((s) => s.partial)
  if (partial.length > 0) {
    return partial.reduce((a, b) => (b.price < a.price ? b : a)).offer
  }
  return scored.reduce((a, b) => (b.price < a.price ? b : a)).offer
}

export function buildPurchasePlan(
  items: ObjectMaterial[],
  catalog: MaterialItem[]
): PurchasePlan {
  const shops = new Map<string, PurchaseShop>()
  let saved = 0
  let shortageCount = 0
  let unknownShopCount = 0

  items.forEach((item) => {
    const ref = catalog.find((c) => c.id === item.material_id)
    const offers = ref?.offers || []
    const qty = num(item.qty)
    const best = pickOffer(offers, qty)

    const price = best ? num(best.price) : num(item.price)
    const shopName = best?.shop_name || item.shop_name || ref?.shop_name || NO_SHOP

    const known = best ? !!best.stock_known : false
    const stock = known ? num(best!.stock) : null
    const enough = stock === null ? true : stock >= qty
    const missing = enough || stock === null ? 0 : Math.max(0, qty - stock)

    if (!enough) shortageCount += 1
    if (shopName === NO_SHOP) unknownShopCount += 1

    const priced = offers.filter((o) => num(o.price) > 0).map((o) => num(o.price))
    const lineSaved =
      priced.length > 1 && price > 0 ? (Math.max(...priced) - price) * qty : 0
    saved += lineSaved

    const line: PurchaseLine = {
      name: item.name,
      unit: item.unit,
      qty,
      price,
      sum: qty * price,
      shopName,
      shopAddress: best?.shop_address || ref?.shop_address || "",
      shopPhone: best?.shop_phone || ref?.shop_phone || "",
      shopUrl: best?.shop_url || ref?.shop_url || "",
      stock,
      enough,
      missing,
      offersCount: priced.length,
      saved: lineSaved,
      roomName: item.room_name || "",
    }

    if (!shops.has(shopName)) {
      shops.set(shopName, {
        name: shopName,
        address: line.shopAddress,
        phone: line.shopPhone,
        lines: [],
        sum: 0,
        hasShortage: false,
      })
    }
    const shop = shops.get(shopName)!
    if (!shop.address && line.shopAddress) shop.address = line.shopAddress
    if (!shop.phone && line.shopPhone) shop.phone = line.shopPhone
    shop.lines.push(line)
    shop.sum += line.sum
    if (!enough) shop.hasShortage = true
  })

  const list = Array.from(shops.values())
    .map((s) => ({
      ...s,
      lines: [...s.lines].sort((a, b) => b.sum - a.sum),
    }))
    .sort((a, b) => {
      if (a.name === NO_SHOP) return 1
      if (b.name === NO_SHOP) return -1
      return b.sum - a.sum
    })

  return {
    shops: list,
    total: list.reduce((s, g) => s + g.sum, 0),
    saved,
    shortageCount,
    unknownShopCount,
  }
}
