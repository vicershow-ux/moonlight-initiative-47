import { Estimate, ObjectItem } from "@/lib/api"

const formatMoney = (n: number) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(n) + " ₽"

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })

export function printEstimate(estimate: Estimate, object: ObjectItem, companyName: string) {
  const items = estimate.items || []

  const groups = new Map<string, typeof items>()
  items.forEach((it) => {
    const key = it.room_name || "Без помещения"
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(it)
  })

  let counter = 0
  const rows = Array.from(groups.entries())
    .map(([roomName, groupItems]) => {
      const roomHeader = groups.size > 1 || roomName !== "Без помещения"
        ? `<tr class="room-row"><td colspan="6">${escapeHtml(roomName)}</td></tr>`
        : ""
      const itemRows = groupItems
        .map((it) => {
          counter += 1
          return `
        <tr>
          <td class="num">${counter}</td>
          <td>${escapeHtml(it.name)}</td>
          <td class="center">${it.unit}</td>
          <td class="center">${it.quantity}</td>
          <td class="right">${formatMoney(it.price)}</td>
          <td class="right">${formatMoney(it.amount)}</td>
        </tr>`
        })
        .join("")
      return roomHeader + itemRows
    })
    .join("")

  const subtotal = estimate.subtotal_amount ?? estimate.total_amount
  const discountAmount = estimate.discount_amount ?? 0

  const html = `
<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8" />
<title>Смета № ${estimate.id} — ${escapeHtml(object.client_name)}</title>
<style>
  * { box-sizing: border-box; }
  body {
    font-family: 'Segoe UI', Arial, sans-serif;
    color: #1a1a1a;
    padding: 40px 48px;
    max-width: 800px;
    margin: 0 auto;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 3px solid #22c55e;
    padding-bottom: 16px;
    margin-bottom: 24px;
  }
  .brand {
    font-size: 22px;
    font-weight: 700;
    letter-spacing: -0.5px;
  }
  .brand span { color: #22c55e; }
  .doc-title {
    text-align: right;
  }
  .doc-title h1 {
    font-size: 20px;
    margin: 0 0 4px;
  }
  .doc-title p {
    margin: 0;
    color: #666;
    font-size: 13px;
  }
  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px 32px;
    margin-bottom: 28px;
    font-size: 13px;
  }
  .info-grid .label {
    color: #888;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 2px;
  }
  .info-grid .value {
    font-weight: 500;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
    margin-bottom: 24px;
  }
  thead th {
    background: #1a1a1a;
    color: #fff;
    text-align: left;
    padding: 10px 12px;
    font-weight: 500;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }
  tbody td {
    padding: 10px 12px;
    border-bottom: 1px solid #eee;
  }
  .num { color: #999; width: 30px; }
  .center { text-align: center; }
  .right { text-align: right; }
  .room-row td {
    background: #f3f4f6;
    font-weight: 700;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    border-bottom: none;
  }
  tfoot td {
    padding: 8px 12px;
    font-size: 13px;
    border-top: none;
  }
  tfoot tr.total-row td {
    padding-top: 12px;
    font-size: 15px;
    font-weight: 700;
    border-top: 2px solid #1a1a1a;
  }
  .footer {
    margin-top: 48px;
    padding-top: 16px;
    border-top: 1px solid #eee;
    font-size: 11px;
    color: #999;
    display: flex;
    justify-content: space-between;
  }
  @media print {
    body { padding: 20px; }
    .no-print { display: none; }
  }
</style>
</head>
<body>
  <div class="header">
    <div class="brand">Fix<span>Key</span></div>
    <div class="doc-title">
      <h1>Смета № ${estimate.id}</h1>
      <p>от ${formatDate(estimate.created_at)}</p>
    </div>
  </div>

  <div class="info-grid">
    <div>
      <div class="label">Исполнитель</div>
      <div class="value">${escapeHtml(companyName)}</div>
    </div>
    <div>
      <div class="label">Объект</div>
      <div class="value">${escapeHtml(object.object_code)}</div>
    </div>
    <div>
      <div class="label">Заказчик</div>
      <div class="value">${escapeHtml(object.client_name)}</div>
    </div>
    <div>
      <div class="label">Телефон</div>
      <div class="value">${escapeHtml(object.client_phone || "—")}</div>
    </div>
    <div>
      <div class="label">Тип объекта</div>
      <div class="value">${escapeHtml(object.object_type)}</div>
    </div>
    <div>
      <div class="label">Площадь</div>
      <div class="value">${object.area} м²</div>
    </div>
    ${estimate.contract_number ? `
    <div>
      <div class="label">Договор №</div>
      <div class="value">${escapeHtml(estimate.contract_number)}</div>
    </div>` : ""}
    ${estimate.contract_date ? `
    <div>
      <div class="label">Дата договора</div>
      <div class="value">${formatDate(estimate.contract_date)}</div>
    </div>` : ""}
  </div>

  <table>
    <thead>
      <tr>
        <th>№</th>
        <th>Наименование работ / услуг</th>
        <th class="center">Ед.</th>
        <th class="center">Кол-во</th>
        <th class="right">Цена</th>
        <th class="right">Сумма</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
    <tfoot>
      <tr>
        <td colspan="5" class="right">Сумма:</td>
        <td class="right">${formatMoney(subtotal)}</td>
      </tr>
      ${discountAmount > 0 ? `
      <tr>
        <td colspan="5" class="right">Скидка:</td>
        <td class="right">-${formatMoney(discountAmount)}</td>
      </tr>` : ""}
      <tr class="total-row">
        <td colspan="5" class="right">Итого:</td>
        <td class="right">${formatMoney(estimate.total_amount)}</td>
      </tr>
    </tfoot>
  </table>

  ${estimate.notes ? `
  <div class="info-grid" style="margin-bottom: 24px;">
    <div style="grid-column: span 2;">
      <div class="label">Примечания</div>
      <div class="value" style="font-weight: 400;">${escapeHtml(estimate.notes)}</div>
    </div>
  </div>` : ""}

  <div class="footer">
    <span>Документ сформирован автоматически в FixKey</span>
    <span>${formatDate(new Date().toISOString())}</span>
  </div>
</body>
</html>`

  const printWindow = window.open("", "_blank", "width=900,height=1000")
  if (!printWindow) return
  printWindow.document.open()
  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.onload = () => {
    printWindow.focus()
    printWindow.print()
  }
}

function escapeHtml(str: string) {
  const div = document.createElement("div")
  div.textContent = str ?? ""
  return div.innerHTML
}