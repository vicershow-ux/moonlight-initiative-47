import { Invoice } from "@/lib/api"

const STATUS_LABEL: Record<Invoice["status"], string> = {
  issued: "Выставлен",
  sent: "Отправлен",
  paid: "Оплачен",
}

/** Дата для Excel без сдвига часового пояса (Excel хранит даты без зоны) */
const toDate = (d?: string | null) => {
  if (!d) return null
  const [y, m, day] = String(d).slice(0, 10).split("-").map(Number)
  return y && m && day ? new Date(Date.UTC(y, m - 1, day)) : null
}

const isOverdue = (inv: Invoice) => {
  if (inv.status === "paid" || !inv.due_date) return false
  return String(inv.due_date).slice(0, 10) < new Date().toLocaleDateString("sv-SE")
}

/** Выгрузка списка счетов в Excel: даты, суммы, заказчики, статусы оплаты и итоги */
export async function exportInvoicesXlsx(list: Invoice[], fileTitle = "Счета") {
  const ExcelJS = (await import("exceljs")).default
  const wb = new ExcelJS.Workbook()
  wb.creator = "FixKey"
  wb.created = new Date()
  const ws = wb.addWorksheet("Счета", { views: [{ state: "frozen", ySplit: 3 }] })

  ws.columns = [
    { key: "number", width: 12 },
    { key: "date", width: 13 },
    { key: "due", width: 14 },
    { key: "client", width: 32 },
    { key: "object", width: 16 },
    { key: "address", width: 36 },
    { key: "basis", width: 26 },
    { key: "amount", width: 16 },
    { key: "status", width: 14 },
    { key: "paid_at", width: 14 },
    { key: "overdue", width: 12 },
  ]

  ws.mergeCells("A1:K1")
  const title = ws.getCell("A1")
  title.value = `Реестр счетов на оплату — выгружено ${new Date().toLocaleDateString("ru-RU")}`
  title.font = { bold: true, size: 14, color: { argb: "FF5C3A11" } }
  ws.getRow(1).height = 24
  ws.getRow(2).height = 6

  const headers = [
    "№ счёта",
    "Дата счёта",
    "Оплатить до",
    "Заказчик",
    "Объект",
    "Адрес объекта",
    "Основание",
    "Сумма, ₽",
    "Статус",
    "Дата оплаты",
    "Просрочен",
  ]
  const head = ws.getRow(3)
  head.values = headers
  head.height = 22
  head.eachCell((c) => {
    c.font = { bold: true, color: { argb: "FFFFFFFF" } }
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF5C3A11" } }
    c.alignment = { vertical: "middle", horizontal: "center", wrapText: true }
    c.border = { bottom: { style: "thin", color: { argb: "FF3E2608" } } }
  })

  const statusFill: Record<string, string> = { paid: "FFD9F2DE", sent: "FFDCE8F7", issued: "FFF0F0F0" }

  list.forEach((inv, i) => {
    const basis =
      [inv.contract_number && `Договор № ${inv.contract_number}`, inv.act_number && `Акт № ${inv.act_number}`]
        .filter(Boolean)
        .join(", ") || "—"
    const overdue = isOverdue(inv)
    const row = ws.addRow({
      number: inv.invoice_number,
      date: toDate(inv.invoice_date),
      due: toDate(inv.due_date),
      client: inv.client_name || "—",
      object: inv.object_code || "—",
      address: inv.address || "—",
      basis,
      amount: Number(inv.total_amount) || 0,
      status: STATUS_LABEL[inv.status] || inv.status,
      paid_at: inv.status === "paid" ? toDate(inv.paid_at) : null,
      overdue: overdue ? "Да" : "",
    })
    row.getCell("date").numFmt = "dd.mm.yyyy"
    row.getCell("due").numFmt = "dd.mm.yyyy"
    row.getCell("paid_at").numFmt = "dd.mm.yyyy"
    row.getCell("amount").numFmt = '#,##0.00 "₽"'
    row.eachCell({ includeEmpty: true }, (c) => {
      c.alignment = { vertical: "middle", wrapText: true, ...(c.alignment || {}) }
      c.border = { bottom: { style: "hair", color: { argb: "FFBFA77E" } } }
      if (i % 2 === 1) c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFAF6EE" } }
    })
    const st = row.getCell("status")
    st.fill = { type: "pattern", pattern: "solid", fgColor: { argb: statusFill[inv.status] || "FFF0F0F0" } }
    st.alignment = { horizontal: "center", vertical: "middle" }
    if (overdue) {
      row.getCell("overdue").font = { bold: true, color: { argb: "FFC0392B" } }
      row.getCell("due").font = { color: { argb: "FFC0392B" } }
    }
  })

  const first = 4
  const last = 3 + list.length
  ws.addRow([])
  const sumRow = (label: string, formula: string, color: string) => {
    const r = ws.addRow({ status: label })
    ws.mergeCells(`A${r.number}:G${r.number}`)
    r.getCell("A").value = label
    r.getCell("A").alignment = { horizontal: "right" }
    r.getCell("A").font = { bold: true }
    r.getCell("amount").value = list.length ? { formula } : 0
    r.getCell("amount").numFmt = '#,##0.00 "₽"'
    r.getCell("amount").font = { bold: true, color: { argb: color } }
    r.getCell("status").value = null
  }
  sumRow("Выставлено всего:", `SUM(H${first}:H${last})`, "FF161616")
  sumRow("Оплачено:", `SUMIF(I${first}:I${last},"Оплачен",H${first}:H${last})`, "FF1E8449")
  sumRow("Ожидает оплаты:", `SUMIF(I${first}:I${last},"<>Оплачен",H${first}:H${last})`, "FFB8860B")

  ws.autoFilter = { from: { row: 3, column: 1 }, to: { row: Math.max(3, last), column: 11 } }
  ws.pageSetup = { orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0, paperSize: 9 }

  const buf = await wb.xlsx.writeBuffer()
  const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${fileTitle}_${new Date().toISOString().slice(0, 10)}.xlsx`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}
