import { Estimate, ObjectItem, EstimateItem } from "@/lib/api"

const num = (v: unknown, fallback = 0): number => {
  const n = typeof v === "string" ? parseFloat(v) : Number(v)
  return Number.isFinite(n) ? n : fallback
}

const formatMoney = (n: unknown) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(num(n)) + " ₽"

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

  const subtotal = num(estimate.subtotal_amount ?? estimate.total_amount)
  const discountAmount = num(estimate.discount_amount ?? 0)

  const roomsHtml = Array.from(groups.entries())
    .map(([roomName, groupItems]) => {
      const catGroups = new Map<string, EstimateItem[]>()
      groupItems.forEach((it) => {
        const key = it.category || "Прочие работы"
        if (!catGroups.has(key)) catGroups.set(key, [])
        catGroups.get(key)!.push(it)
      })
      const roomTotal = groupItems.reduce((s, it) => s + num(it.amount), 0)

      const catsHtml = Array.from(catGroups.entries())
        .map(([catName, catItems]) => {
          const catTotal = catItems.reduce((s, it) => s + num(it.amount), 0)
          const itemRows = catItems
            .map(
              (it, idx) => `
            <tr>
              <td class="num">${idx + 1}</td>
              <td>${escapeHtml(it.name)}</td>
              <td class="center">${escapeHtml(it.unit)}</td>
              <td class="center">${num(it.quantity)}</td>
              <td class="center">${num(it.times, 1)}</td>
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

  const styles = `
  * { box-sizing: border-box; }
  .est-root {
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
    border-bottom: 3px solid #5C3A11;
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
  .brand .brand-logo {
    width: 72px;
    height: 44px;
    min-width: 72px;
    background-repeat: no-repeat;
    background-position: left center;
    background-size: contain;
    flex: 0 0 auto;
  }
  .brand span { color: #7A4E10; }
  .doc-title {
    text-align: right;
  }
  .doc-title h1 {
    font-size: 20px;
    margin: 0 0 4px;
  }
  .doc-title p {
    margin: 0;
    color: #1a1a1a;
    font-size: 13px;
  }
  .doc-subtitle h2 {
    font-size: 19px;
    margin: 0;
    letter-spacing: -0.3px;
  }
  .doc-subtitle p {
    margin: 4px 0 0;
    color: #1a1a1a;
    font-size: 12px;
  }
  hr.thin {
    border: none;
    border-top: 1px solid #A98A5C;
    margin: 20px 0;
  }
  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px 32px;
    background: #ffffff;
    border: 1.5px solid #7A4E10;
    border-radius: 10px;
    padding: 16px;
    margin-bottom: 24px;
    font-size: 13px;
  }
  .info-grid .label {
    color: #6B4508;
    font-size: 11.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.4px;
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
  .room-block { margin-bottom: 22px; page-break-inside: avoid; break-inside: avoid; }
  .cat-block {
    page-break-inside: avoid;
    break-inside: avoid;
    border: 1.5px solid #7A4E10;
    border-radius: 10px;
    overflow: hidden;
    margin-bottom: 12px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12.5px;
    table-layout: fixed;
  }
  thead th:nth-child(1) { width: 30px; }
  thead th:nth-child(2) { width: auto; }
  thead th:nth-child(3) { width: 44px; }
  thead th:nth-child(4) { width: 64px; white-space: nowrap; }
  thead th:nth-child(5) { width: 44px; }
  thead th:nth-child(6) { width: 82px; }
  thead th:nth-child(7) { width: 92px; }
  tbody td { overflow-wrap: break-word; word-break: break-word; }
  thead th {
    background: #5C3A11;
    color: #ffffff;
    text-align: left;
    padding: 8px 10px;
    font-weight: 700;
    font-size: 11.5px;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }
  tbody td {
    padding: 8px 10px;
    border-top: 1px solid #C9AE85;
  }
  .num { color: #1a1a1a; width: 28px; }
  .center { text-align: center; }
  .right { text-align: right; }
  .amount { font-weight: 600; }
  .cat-row td {
    background: #EADCC0;
    color: #4A2E06;
    font-weight: 700;
    font-size: 12px;
    border-top: none;
  }
  tfoot td {
    padding: 8px 10px;
    font-size: 13px;
    background: #ffffff;
    border-top: 1px solid #A98A5C;
  }
  .room-total {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #EADCC0;
    border: 1.5px solid #7A4E10;
    border-left: 5px solid #5C3A11;
    border-radius: 6px;
    padding: 12px 16px;
    margin-top: 10px;
  }
  .room-total-label {
    font-size: 11.5px;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    color: #4A2E06;
    font-weight: 700;
  }
  .room-total-name {
    font-size: 13px;
    color: #1a1a1a;
    margin-top: 2px;
  }
  .room-total-amount {
    font-size: 18px;
    font-weight: 700;
    color: #4A2E06;
  }
  .summary {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 24px;
  }
  .summary-box {
    width: 100%;
    max-width: 290px;
    background: #ffffff;
    border: 1.5px solid #7A4E10;
    border-radius: 10px;
    padding: 16px;
    font-size: 13px;
  }
  .summary-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 6px;
    color: #1a1a1a;
  }
  .summary-row.discount { color: #6B4508; }
  .summary-total {
    display: flex;
    justify-content: space-between;
    font-size: 16px;
    font-weight: 700;
    padding-top: 8px;
    border-top: 1px solid #A98A5C;
  }
  .notes {
    margin-bottom: 24px;
    font-size: 13px;
  }
  .notes .label {
    color: #1a1a1a;
    font-size: 11.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.4px;
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
    color: #6B4508;
    font-size: 11.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    margin-bottom: 4px;
  }
  .parties .name { font-weight: 600; }
  .parties .contact { color: #333; font-size: 12.5px; margin-top: 2px; }
  .parties .signature { height: 40px; object-fit: contain; margin-top: 8px; }
  .signatures {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    margin-top: 32px;
    margin-bottom: 12px;
  }
  .signature-block .label {
    color: #6B4508;
    font-size: 11.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    margin-bottom: 28px;
  }
  .signature-block .signature-line {
    border-top: 1.5px solid #5C3A11;
    padding-top: 6px;
    font-size: 13px;
    text-align: center;
    color: #1a1a1a;
  }
  .footer {
    text-align: right;
    font-size: 11.5px;
    color: #444;
    margin-top: 24px;
  }
  @page { size: A4 portrait; margin: 10mm; }
  @media print {
    html, body { width: 190mm; margin: 0; padding: 0; background: #fff; overflow: visible; }
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    .est-root {
      padding: 0;
      width: 186mm;
      max-width: 186mm;
      margin: 0 auto;
      overflow: visible;
    }
    .no-print { display: none; }
    .cat-block { break-inside: avoid; }
    .room-block { break-inside: avoid; }
    table { width: 100%; table-layout: fixed; }
    td, th { overflow-wrap: break-word; word-break: break-word; }
    thead th:nth-child(1) { width: 5%; }
    thead th:nth-child(2) { width: auto; }
    thead th:nth-child(3) { width: 7%; }
    thead th:nth-child(4) { width: 10%; }
    thead th:nth-child(5) { width: 7%; }
    thead th:nth-child(6) { width: 13%; }
    thead th:nth-child(7) { width: 15%; }
    thead th { background: #5C3A11 !important; color: #ffffff !important; }
    .cat-row td { background: #EADCC0 !important; color: #4A2E06 !important; }
    .room-total { background: #EADCC0 !important; border: 1.5px solid #7A4E10 !important; border-left: 5px solid #5C3A11 !important; }
    tfoot td { background: #ffffff !important; border-top: 1px solid #A98A5C !important; }
    .info-grid, .summary-box { background: #ffffff !important; border: 1.5px solid #7A4E10 !important; }
    .cat-block { border: 1.5px solid #7A4E10 !important; }
    .info-grid .label, .parties .label, .signature-block .label, .room-total-label { color: #6B4508 !important; }
    .cat-block, .info-grid, .room-total, .summary-box, .summary {
      max-width: 100%;
      box-sizing: border-box;
    }
  }
`

  const bodyContent = `
  <div class="header">
    <div class="brand"><div class="brand-logo" style="background-image:url('${window.location.origin}/favicon.png')"></div>Fix<span>Key</span></div>
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
  </div>`

  const title = `Смета № ${estimate.id} — ${escapeHtml(object.client_name)}`

  return { styles, bodyContent, title }
}

export function printEstimate(estimate: Estimate, object: ObjectItem, companyName: string) {
  const { styles, bodyContent, title } = buildEstimateDocument(estimate, object, companyName)
  const html = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8" />
<title>${title}</title>
<style>${styles}</style>
</head>
<body>
<div class="est-root">${bodyContent}</div>
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

function scopeStyles(css: string, scope: string) {
  const withoutAtRules = css.replace(/@page[^{]*\{[^}]*\}/g, "").replace(/@media\s+print\s*\{(?:[^{}]*\{[^}]*\})*[^{}]*\}/g, "")
  return withoutAtRules.replace(/(^|\})\s*([^{}@]+)\s*\{/g, (_m, brace, selectors) => {
    const scoped = selectors
      .split(",")
      .map((s: string) => {
        const sel = s.trim()
        if (!sel) return ""
        if (sel === "*") return `${scope}, ${scope} *`
        if (/^(html|body)$/i.test(sel)) return scope
        if (sel === ".est-root") return scope
        if (sel.startsWith(".est-root ")) return `${scope} ${sel.slice(".est-root ".length)}`
        return `${scope} ${sel}`
      })
      .filter(Boolean)
      .join(", ")
    return `${brace} ${scoped} {`
  })
}

export async function downloadEstimatePdf(estimate: Estimate, object: ObjectItem, companyName: string) {
  const { styles, bodyContent } = buildEstimateDocument(estimate, object, companyName)

  // Рендерим в СКРЫТЫЙ контейнер основного документа (не в iframe),
  // чтобы html2canvas гарантированно видел стили и вёрстка совпадала с печатью
  const container = document.createElement("div")
  container.style.position = "fixed"
  container.style.left = "-10000px"
  container.style.top = "0"
  container.style.width = "760px"
  container.style.background = "#ffffff"

  const root = document.createElement("div")
  root.id = "pdf-scope-estimate"
  root.className = "est-root"
  root.style.width = "760px"
  root.style.maxWidth = "760px"
  root.style.padding = "4px 6px"
  root.style.margin = "0"
  root.style.background = "#ffffff"

  const styleTag = document.createElement("style")
  styleTag.textContent = scopeStyles(styles, "#pdf-scope-estimate")

  root.appendChild(styleTag)
  const content = document.createElement("div")
  content.innerHTML = bodyContent
  root.appendChild(content)

  container.appendChild(root)
  document.body.appendChild(container)

  // Ждём загрузку логотипа (фон) перед снимком
  await new Promise<void>((resolve) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = () => resolve()
    img.src = `${window.location.origin}/favicon.png`
    setTimeout(resolve, 3000)
  })

  try {
    const html2pdf = (await import("html2pdf.js")).default
    await html2pdf()
      .set({
        margin: [10, 11, 10, 11],
        filename: `Смета №${estimate.id}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          width: 760,
          windowWidth: 760,
          scrollX: 0,
          scrollY: 0,
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["css", "legacy"], avoid: [".cat-block", ".room-block"] },
      })
      .from(root)
      .save()
  } finally {
    if (container.parentNode) document.body.removeChild(container)
  }
}

function escapeHtml(str: string) {
  const div = document.createElement("div")
  div.textContent = str ?? ""
  return div.innerHTML
}