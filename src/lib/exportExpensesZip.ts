import type { Workbook, Worksheet } from "exceljs"
import { ExpenseExport, financeApi } from "@/lib/api"

const MONTHS = ["январь", "февраль", "март", "апрель", "май", "июнь", "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"]

export const monthTitle = (m: string) => {
  const [y, mm] = m.split("-").map(Number)
  return `${MONTHS[mm - 1]} ${y}`
}

const toDate = (d?: string | null) => {
  if (!d) return null
  const [y, m, day] = String(d).slice(0, 10).split("-").map(Number)
  return y && m && day ? new Date(Date.UTC(y, m - 1, day)) : null
}

const safe = (s: string, max = 60) =>
  (s || "")
    .replace(/[\\/:*?"<>|\r\n\t]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max)
    .trim()

const BROWN = "FF5C3A11"
const border = { style: "thin" as const, color: { argb: "FFB9A27A" } }
const cellBorder = { top: border, left: border, bottom: border, right: border }

function header(ws: Worksheet, row: number, titles: string[]) {
  const r = ws.getRow(row)
  titles.forEach((t, i) => {
    const c = r.getCell(i + 1)
    c.value = t
    c.font = { bold: true, color: { argb: "FFFFFFFF" } }
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BROWN } }
    c.alignment = { vertical: "middle", horizontal: "center", wrapText: true }
    c.border = cellBorder
  })
  r.height = 30
}

type Row = ExpenseExport["expenses"][number] & { docs: string[] }

function buildBook(ExcelJS: { Workbook: new () => Workbook }, data: ExpenseExport, rows: Row[]) {
  const wb = new ExcelJS.Workbook()
  wb.creator = "FixKey"
  wb.created = new Date()
  const title = `Расходы за ${monthTitle(data.month)}${data.company.name ? ` — ${data.company.name}` : ""}${data.company.inn ? `, ИНН ${data.company.inn}` : ""}`

  const ws = wb.addWorksheet("Реестр расходов", { views: [{ state: "frozen", ySplit: 3 }] })
  ws.columns = [
    { width: 6 }, { width: 12 }, { width: 22 }, { width: 14 }, { width: 30 }, { width: 14 },
    { width: 40 }, { width: 16 }, { width: 28 }, { width: 12 }, { width: 10 }, { width: 44 }, { width: 18 },
  ]
  ws.mergeCells("A1:M1")
  ws.getCell("A1").value = title
  ws.getCell("A1").font = { bold: true, size: 14, color: { argb: BROWN } }
  ws.getRow(1).height = 24
  header(ws, 3, ["№", "Дата", "Категория", "Сумма, ₽", "Получатель", "ИНН получателя", "Назначение / комментарий", "Объект", "Адрес объекта", "Источник", "Док-тов", "Файлы в папке «Документы»", "Внёс"])

  rows.forEach((e, i) => {
    const r = ws.getRow(4 + i)
    const vals = [
      i + 1,
      toDate(e.expense_date),
      data.categories[e.category] || e.category,
      e.amount,
      e.payee || "",
      e.payee_inn || "",
      e.description || "",
      e.object_code || "Общий расход",
      e.address || "",
      e.from_bank ? `Банк${e.document_number ? `, п/п № ${e.document_number}` : ""}` : "Вручную",
      e.docs.length,
      e.docs.join("\n"),
      e.author || "",
    ]
    vals.forEach((v, j) => {
      const c = r.getCell(j + 1)
      c.value = v as never
      c.border = cellBorder
      c.alignment = { vertical: "top", wrapText: [4, 6, 8, 11].includes(j) }
    })
    r.getCell(2).numFmt = "dd.mm.yyyy"
    r.getCell(4).numFmt = "#,##0.00"
    if (!e.docs.length) {
      r.getCell(11).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFCE4D6" } }
    }
  })

  const last = 3 + rows.length
  const tr = ws.getRow(last + 1)
  tr.getCell(3).value = "Итого"
  tr.getCell(4).value = rows.length ? { formula: `SUM(D4:D${last})`, result: rows.reduce((a, e) => a + e.amount, 0) } : 0
  tr.getCell(4).numFmt = "#,##0.00"
  tr.getCell(11).value = rows.length ? { formula: `SUM(K4:K${last})`, result: rows.reduce((a, e) => a + e.docs.length, 0) } : 0
  ;[3, 4, 11].forEach((c) => {
    tr.getCell(c).font = { bold: true }
    tr.getCell(c).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD3C2A2" } }
  })
  ws.autoFilter = { from: { row: 3, column: 1 }, to: { row: Math.max(last, 3), column: 13 } }

  const sum = wb.addWorksheet("Сводка")
  sum.columns = [{ width: 30 }, { width: 12 }, { width: 18 }, { width: 18 }]
  sum.mergeCells("A1:D1")
  sum.getCell("A1").value = title
  sum.getCell("A1").font = { bold: true, size: 14, color: { argb: BROWN } }

  const block = (start: number, caption: string, groups: Map<string, { n: number; total: number; noDocs: number }>) => {
    header(sum, start, [caption, "Кол-во", "Сумма, ₽", "Без документов"])
    let i = start + 1
    ;[...groups.entries()]
      .sort((a, b) => b[1].total - a[1].total)
      .forEach(([k, g]) => {
        const r = sum.getRow(i++)
        ;[k, g.n, g.total, g.noDocs].forEach((v, j) => {
          r.getCell(j + 1).value = v
          r.getCell(j + 1).border = cellBorder
        })
        r.getCell(3).numFmt = "#,##0.00"
      })
    const t = sum.getRow(i)
    t.getCell(1).value = "Итого"
    t.getCell(2).value = [...groups.values()].reduce((a, g) => a + g.n, 0)
    t.getCell(3).value = [...groups.values()].reduce((a, g) => a + g.total, 0)
    t.getCell(3).numFmt = "#,##0.00"
    t.getCell(4).value = [...groups.values()].reduce((a, g) => a + g.noDocs, 0)
    ;[1, 2, 3, 4].forEach((c) => (t.getCell(c).font = { bold: true }))
    return i + 2
  }
  const group = (key: (e: Row) => string) => {
    const m = new Map<string, { n: number; total: number; noDocs: number }>()
    rows.forEach((e) => {
      const g = m.get(key(e)) || { n: 0, total: 0, noDocs: 0 }
      g.n += 1
      g.total += e.amount
      if (!e.docs.length) g.noDocs += 1
      m.set(key(e), g)
    })
    return m
  }
  const next = block(3, "Категория", group((e) => data.categories[e.category] || e.category))
  block(next, "Объект", group((e) => (e.object_code ? `${e.object_code}${e.client_name ? ` · ${e.client_name}` : ""}` : "Общие расходы")))
  return wb
}

/** Архив для бухгалтера: Excel-реестр расходов за месяц и папка с чеками и накладными */
export async function exportExpensesZip(month: string, onProgress?: (text: string) => void) {
  onProgress?.("Собираю расходы…")
  const data = await financeApi.exportMonth(month)
  if (!data.expenses.length) throw new Error(`За ${monthTitle(month)} расходов нет`)

  const { zipSync, strToU8 } = await import("fflate")
  const ExcelJS = (await import("exceljs")).default
  const files: Record<string, Uint8Array | [Uint8Array, { level: 0 }]> = {}
  const failed: string[] = []
  const rows: Row[] = []
  const totalDocs = data.expenses.reduce((a, e) => a + (e.attachments || []).length, 0)
  let done = 0

  for (const [i, e] of data.expenses.entries()) {
    const docs: string[] = []
    const prefix = `${String(i + 1).padStart(3, "0")}_${e.expense_date.slice(0, 10)}_${safe(data.categories[e.category] || e.category, 25)}_${Math.round(e.amount)}р`
    for (const [j, f] of (e.attachments || []).entries()) {
      done += 1
      onProgress?.(`Скачиваю документы: ${done} из ${totalDocs}`)
      const ext = (f.url.split(".").pop() || "jpg").toLowerCase()
      const name = `${prefix}${e.payee ? `_${safe(e.payee, 30)}` : ""}${(e.attachments || []).length > 1 ? `_${j + 1}` : ""}.${ext}`
      try {
        const res = await fetch(f.url)
        if (!res.ok) throw new Error(String(res.status))
        files[`Документы/${name}`] = [new Uint8Array(await res.arrayBuffer()), { level: 0 }]
        docs.push(name)
      } catch {
        failed.push(`${name} — ${f.url}`)
      }
    }
    rows.push({ ...e, docs })
  }

  onProgress?.("Формирую таблицу Excel…")
  const wb = buildBook(ExcelJS, data, rows)
  const xlsx = new Uint8Array(await wb.xlsx.writeBuffer())
  const base = `Расходы_${data.month}`
  files[`${base}.xlsx`] = xlsx
  const noDocs = rows.filter((r) => !r.docs.length)
  const readme = [
    `Расходы за ${monthTitle(data.month)}${data.company.name ? ` — ${data.company.name}` : ""}`,
    "",
    `Записей: ${rows.length}, на сумму ${rows.reduce((a, e) => a + e.amount, 0).toLocaleString("ru-RU", { minimumFractionDigits: 2 })} ₽`,
    `Документов в папке: ${Object.keys(files).filter((k) => k.startsWith("Документы/")).length}`,
    `Расходов без документов: ${noDocs.length}`,
    "",
    "Имя файла: порядковый номер в таблице _ дата _ категория _ сумма _ получатель.",
    ...(failed.length ? ["", "Не удалось скачать (откройте по ссылке):", ...failed] : []),
  ].join("\r\n")
  files["Прочитай.txt"] = strToU8("\ufeff" + readme)

  onProgress?.("Упаковываю архив…")
  const zip = zipSync(files, { level: 6 })
  const blob = new Blob([zip], { type: "application/zip" })
  const a = document.createElement("a")
  a.href = URL.createObjectURL(blob)
  a.download = `${base}.zip`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(a.href), 4000)
  return { count: rows.length, docs: Object.keys(files).length - 2, noDocs: noDocs.length, failed: failed.length }
}
