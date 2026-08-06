import * as XLSX from "xlsx"
import { MaterialItem, MaterialObject, ObjectMaterial } from "@/lib/api"

const num = (n: unknown) => Number(n || 0)

interface ShopGroup {
  name: string
  address: string
  phone: string
  items: ObjectMaterial[]
  sum: number
}

export function buildShopGroups(
  items: ObjectMaterial[],
  catalog: MaterialItem[]
): ShopGroup[] {
  const map = new Map<string, ShopGroup>()

  items.forEach((item) => {
    const ref = catalog.find((c) => c.id === item.material_id)
    const name = item.shop_name || ref?.shop_name || "Магазин не указан"
    if (!map.has(name)) {
      map.set(name, {
        name,
        address: ref?.shop_address || "",
        phone: ref?.shop_phone || "",
        items: [],
        sum: 0,
      })
    }
    const group = map.get(name)!
    if (!group.address && ref?.shop_address) group.address = ref.shop_address
    if (!group.phone && ref?.shop_phone) group.phone = ref.shop_phone
    group.items.push(item)
    group.sum += num(item.qty) * num(item.price)
  })

  return Array.from(map.values()).sort((a, b) => b.sum - a.sum)
}

export function exportMaterialsToExcel(
  object: MaterialObject,
  items: ObjectMaterial[],
  catalog: MaterialItem[]
) {
  const groups = buildShopGroups(items, catalog)
  const rows: (string | number)[][] = []

  rows.push([`Список закупки материалов`])
  rows.push([`Объект: ${object.object_code} — ${object.client_name}`])
  if (object.address) rows.push([`Адрес объекта: ${object.address}`])
  rows.push([`Дата: ${new Date().toLocaleDateString("ru-RU")}`])
  rows.push([])

  let total = 0

  groups.forEach((group) => {
    rows.push([`МАГАЗИН: ${group.name}`])
    if (group.address) rows.push([`Адрес: ${group.address}`])
    if (group.phone) rows.push([`Телефон: ${group.phone}`])
    rows.push([
      "Материал",
      "Помещение",
      "Вид работ",
      "Кол-во",
      "Ед. изм.",
      "Цена, ₽",
      "Сумма, ₽",
    ])

    group.items.forEach((item) => {
      rows.push([
        item.name,
        item.room_name || "—",
        item.work_type || "—",
        num(item.qty),
        item.unit,
        num(item.price),
        num(item.qty) * num(item.price),
      ])
    })

    rows.push(["", "", "", "", "", "Итого по магазину:", group.sum])
    rows.push([])
    total += group.sum
  })

  rows.push(["", "", "", "", "", "ИТОГО ПО ОБЪЕКТУ:", total])

  const sheet = XLSX.utils.aoa_to_sheet(rows)
  sheet["!cols"] = [
    { wch: 42 },
    { wch: 20 },
    { wch: 24 },
    { wch: 10 },
    { wch: 10 },
    { wch: 14 },
    { wch: 16 },
  ]

  const book = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(book, sheet, "Закупка")

  const safeCode = String(object.object_code || "object").replace(/[\\/:*?"<>|]/g, "-")
  XLSX.writeFile(book, `Материалы_${safeCode}.xlsx`)
}
