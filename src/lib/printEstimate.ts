import { Estimate, ObjectItem, EstimateItem } from "@/lib/api"

const formatMoney = (n: number) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(n) + " ₽"

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })

const formatDateTime = (d: string) =>
  new Date(d).toLocaleString("ru-RU", { day: "numeric", month: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })

function buildEstimateDocument(estimate: Estimate, object: ObjectItem, companyName: string) {
  const items = estimate.items || []

  const groups = new Map<string, EstimateItem[]>()
  items.forEach((it) => {
    const key = it.room_name || "Без помещения"
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(it)
  })

  const subtotal = estimate.subtotal_amount ?? estimate.total_amount
  const discountAmount = estimate.discount_amount ?? 0

  const roomsHtml = Array.from(groups.entries())
    .map(([roomName, groupItems]) => {
      const catGroups = new Map<string, EstimateItem[]>()
      groupItems.forEach((it) => {
        const key = it.category || "Прочие работы"
        if (!catGroups.has(key)) catGroups.set(key, [])
        catGroups.get(key)!.push(it)
      })
      const roomTotal = groupItems.reduce((s, it) => s + it.amount, 0)

      const catsHtml = Array.from(catGroups.entries())
        .map(([catName, catItems]) => {
          const catTotal = catItems.reduce((s, it) => s + it.amount, 0)
          const itemRows = catItems
            .map(
              (it, idx) => `
            <tr>
              <td class="num">${idx + 1}</td>
              <td>${escapeHtml(it.name)}</td>
              <td class="center">${escapeHtml(it.unit)}</td>
              <td class="center">${it.quantity}</td>
              <td class="center">${it.times ?? 1}</td>
              <td class="right">${formatMoney(it.price)}</td>
              <td class="right amount">${formatMoney(it.amount)}</td>
            </tr>`
            )
            .join("")

          return `
        <div class="cat-block">
          <table>
            <thead>
              <tr>
                <th class="num">№</th>
                <th>Наименование работы</th>
                <th class="center">Ед.</th>
                <th class="center">Кол-во</th>
                <th class="center">Раз</th>
                <th class="right">Цена</th>
                <th class="right">Сумма</th>
              </tr>
            </thead>
            <tbody>
              <tr class="cat-row"><td colspan="7">${escapeHtml(catName)}</td></tr>
              ${itemRows}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="6" class="right">Итого по категории</td>
                <td class="right amount">${formatMoney(catTotal)}</td>
              </tr>
            </tfoot>
          </table>
        </div>`
        })
        .join("")

      return `
      <div class="room-block">
        <h3 class="room-title">${escapeHtml(roomName)}</h3>
        ${catsHtml}
        <div class="room-total">
          <div>
            <div class="room-total-label">Итоговая сумма по помещению</div>
            <div class="room-total-name">${escapeHtml(roomName)}</div>
          </div>
          <div class="room-total-amount">${formatMoney(roomTotal)}</div>
        </div>
      </div>`
    })
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
    max-width: 850px;
    margin: 0 auto;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 3px solid #C08A2A;
    padding-bottom: 16px;
    margin-bottom: 24px;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 22px;
    font-weight: 700;
    letter-spacing: -0.5px;
  }
  .brand img { width: 34px; height: 34px; }
  .brand span { color: #C08A2A; }
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
  .doc-subtitle h2 {
    font-size: 19px;
    margin: 0;
    letter-spacing: -0.3px;
  }
  .doc-subtitle p {
    margin: 4px 0 0;
    color: #666;
    font-size: 12px;
  }
  hr.thin {
    border: none;
    border-top: 1px solid #e5e5e5;
    margin: 20px 0;
  }
  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px 32px;
    background: #fafafa;
    border-radius: 10px;
    padding: 16px;
    margin-bottom: 24px;
    font-size: 13px;
  }
  .info-grid .label {
    color: #999;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 2px;
  }
  .info-grid .value {
    font-weight: 500;
  }
  .room-title {
    font-size: 15px;
    font-weight: 700;
    margin: 0 0 8px;
  }
  .room-block { margin-bottom: 22px; }
  .cat-block {
    border: 1px solid #e5e5e5;
    border-radius: 10px;
    overflow: hidden;
    margin-bottom: 12px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12.5px;
  }
  thead th {
    background: #f3f3f3;
    color: #888;
    text-align: left;
    padding: 8px 10px;
    font-weight: 500;
    font-size: 10.5px;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }
  tbody td {
    padding: 8px 10px;
    border-top: 1px solid #f0f0f0;
  }
  .num { color: #aaa; width: 28px; }
  .center { text-align: center; }
  .right { text-align: right; }
  .amount { font-weight: 600; }
  .cat-row td {
    background: rgba(192, 138, 42, 0.1);
    color: #A9711F;
    font-weight: 600;
    font-size: 11px;
    border-top: none;
  }
  tfoot td {
    padding: 8px 10px;
    font-size: 12.5px;
    background: #fafafa;
    border-top: 1px solid #eee;
  }
  .room-total {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #F5EFE4;
    border-left: 4px solid #C08A2A;
    border-radius: 6px;
    padding: 12px 16px;
    margin-top: 10px;
  }
  .room-total-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #A9711F;
    font-weight: 700;
  }
  .room-total-name {
    font-size: 13px;
    color: #666;
    margin-top: 2px;
  }
  .room-total-amount {
    font-size: 18px;
    font-weight: 700;
    color: #A9711F;
  }
  .summary {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 24px;
  }
  .summary-box {
    width: 100%;
    max-width: 290px;
    background: #fafafa;
    border-radius: 10px;
    padding: 16px;
    font-size: 13px;
  }
  .summary-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 6px;
    color: #666;
  }
  .summary-row.discount { color: #A9711F; }
  .summary-total {
    display: flex;
    justify-content: space-between;
    font-size: 16px;
    font-weight: 700;
    padding-top: 8px;
    border-top: 1px solid #e5e5e5;
  }
  .notes {
    margin-bottom: 24px;
    font-size: 13px;
  }
  .notes .label {
    color: #999;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
  }
  .parties {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    font-size: 13px;
    margin-bottom: 12px;
  }
  .parties .label {
    color: #999;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
  }
  .parties .name { font-weight: 600; }
  .parties .contact { color: #888; font-size: 12px; margin-top: 2px; }
  .parties .signature { height: 40px; object-fit: contain; margin-top: 8px; }
  .signatures {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    margin-top: 32px;
    margin-bottom: 12px;
  }
  .signature-block .label {
    color: #999;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 28px;
  }
  .signature-block .signature-line {
    border-top: 1px solid #999;
    padding-top: 6px;
    font-size: 13px;
    text-align: center;
    color: #333;
  }
  .footer {
    text-align: right;
    font-size: 11px;
    color: #bbb;
    margin-top: 24px;
  }
  @media print {
    body { padding: 20px; }
    .no-print { display: none; }
    .cat-block { break-inside: avoid; }
    .room-block { break-inside: avoid; }
  }
</style>
</head>
<body>
  <div class="header">
    <div class="brand"><img src="${window.location.origin}/fixkey-logo.svg" alt="FixKey" />Fix<span>Key</span></div>
    <div class="doc-title">
      <h1>Смета № ${estimate.id}</h1>
      <p>от ${formatDate(estimate.created_at)}</p>
    </div>
  </div>

  <div class="doc-subtitle">
    <h2>СМЕТА НА РАБОТЫ</h2>
    <p>Расчёт ремонтно-отделочных работ</p>
    ${estimate.contract_number ? `<p>Приложение к договору № ${escapeHtml(estimate.contract_number)}${estimate.contract_date ? ` от ${formatDate(estimate.contract_date)}` : ""}</p>` : ""}
  </div>

  <hr class="thin" />

  <div class="info-grid">
    <div>
      <div class="label">ID объекта</div>
      <div class="value">${escapeHtml(object.object_code)}</div>
    </div>
    <div>
      <div class="label">Заказчик</div>
      <div class="value">${escapeHtml(object.client_name)}</div>
    </div>
    <div>
      <div class="label">Контактный телефон</div>
      <div class="value">${escapeHtml(object.client_phone || "—")}</div>
    </div>
    <div>
      <div class="label">Характеристики объекта</div>
      <div class="value">${escapeHtml(object.object_type)} · ${object.area} м²</div>
    </div>
  </div>

  ${roomsHtml}

  <div class="summary">
    <div class="summary-box">
      ${discountAmount > 0 ? `
      <div class="summary-row">
        <span>Сумма до скидки:</span>
        <span>${formatMoney(subtotal)}</span>
      </div>
      <div class="summary-row discount">
        <span>Скидка:</span>
        <span>-${formatMoney(discountAmount)}</span>
      </div>` : ""}
      <div class="summary-total">
        <span>ИТОГО К ОПЛАТЕ:</span>
        <span>${formatMoney(estimate.total_amount)}</span>
      </div>
    </div>
  </div>

  ${estimate.notes ? `
  <div class="notes">
    <div class="label">Примечания</div>
    <div>${escapeHtml(estimate.notes)}</div>
  </div>` : ""}

  <hr class="thin" />

  <div class="parties">
    <div>
      <div class="label">Исполнитель</div>
      <div class="name">${escapeHtml(estimate.company_name || companyName)}</div>
      ${estimate.company_phone ? `<div class="contact">Тел: ${escapeHtml(estimate.company_phone)}</div>` : ""}
      ${estimate.company_email ? `<div class="contact">Email: ${escapeHtml(estimate.company_email)}</div>` : ""}
      ${estimate.company_website ? `<div class="contact">${escapeHtml(estimate.company_website)}</div>` : ""}
      ${estimate.company_inn ? `<div class="contact">ИНН: ${escapeHtml(estimate.company_inn)}</div>` : ""}
      ${estimate.company_legal_address ? `<div class="contact">${escapeHtml(estimate.company_legal_address)}</div>` : ""}
      ${estimate.company_signature_url ? `<img class="signature" src="${estimate.company_signature_url}" alt="Подпись" />` : ""}
    </div>
    <div>
      <div class="label">Заказчик</div>
      <div class="name">${escapeHtml(object.client_name)}</div>
      ${object.client_phone ? `<div class="contact">Тел: ${escapeHtml(object.client_phone)}</div>` : ""}
    </div>
  </div>

  <div class="signatures">
    <div class="signature-block">
      <div class="label">Исполнитель</div>
      <div class="signature-line">${escapeHtml(estimate.company_name || companyName)}</div>
    </div>
    <div class="signature-block">
      <div class="label">Заказчик</div>
      <div class="signature-line">${escapeHtml(object.client_name)}</div>
    </div>
  </div>

  <div class="footer">
    Сформировано ${formatDateTime(new Date().toISOString())}
  </div>
</body>
</html>`

  return html
}

export function printEstimate(estimate: Estimate, object: ObjectItem, companyName: string) {
  const html = buildEstimateDocument(estimate, object, companyName)

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

export async function downloadEstimatePdf(estimate: Estimate, object: ObjectItem, companyName: string) {
  const html = buildEstimateDocument(estimate, object, companyName)

  const container = document.createElement("div")
  container.style.position = "fixed"
  container.style.left = "-10000px"
  container.style.top = "0"
  document.body.appendChild(container)

  const iframe = document.createElement("iframe")
  iframe.style.width = "850px"
  iframe.style.border = "none"
  container.appendChild(iframe)

  await new Promise<void>((resolve) => {
    iframe.onload = () => resolve()
    iframe.srcdoc = html
  })

  const target = iframe.contentDocument?.body
  if (!target) {
    document.body.removeChild(container)
    return
  }

  const html2pdf = (await import("html2pdf.js")).default
  await html2pdf()
    .set({
      margin: 0,
      filename: `Смета №${estimate.id}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    })
    .from(target)
    .save()

  document.body.removeChild(container)
}

function escapeHtml(str: string) {
  const div = document.createElement("div")
  div.textContent = str ?? ""
  return div.innerHTML
}