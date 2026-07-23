import { Estimate, ObjectItem } from "@/lib/api"

const formatMoney = (n: number) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(n) + " ₽"

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })

export function printEstimate(estimate: Estimate, object: ObjectItem, companyName: string) {
  const items = estimate.items || []

  const rows = items
    .map(
      (it, idx) => `
        <tr>
          <td class="num">${idx + 1}</td>
          <td>${escapeHtml(it.name)}</td>
          <td class="center">${it.unit}</td>
          <td class="center">${it.quantity}</td>
          <td class="right">${formatMoney(it.price)}</td>
          <td class="right">${formatMoney(it.amount)}</td>
        </tr>`
    )
    .join("")

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
    border-bottom: 3px solid #ef4444;
    padding-bottom: 16px;
    margin-bottom: 24px;
  }
  .brand {
    font-size: 22px;
    font-weight: 700;
    letter-spacing: -0.5px;
  }
  .brand span { color: #ef4444; }
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
  tfoot td {
    padding: 14px 12px;
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
        <td colspan="5" class="right">Итого:</td>
        <td class="right">${formatMoney(estimate.total_amount)}</td>
      </tr>
    </tfoot>
  </table>

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
