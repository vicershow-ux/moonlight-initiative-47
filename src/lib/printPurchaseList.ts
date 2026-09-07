import { MaterialItem, MaterialObject, ObjectMaterial } from "@/lib/api"
import { buildPurchasePlan } from "@/lib/purchaseList"

const num = (v: unknown, fallback = 0): number => {
  const n = typeof v === "string" ? parseFloat(v) : Number(v)
  return Number.isFinite(n) ? n : fallback
}

const formatMoney = (n: unknown) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(num(n)) + " ₽"

const formatDateTime = (d: string) =>
  new Date(d).toLocaleString("ru-RU", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

function escapeHtml(str: string) {
  const div = document.createElement("div")
  div.textContent = str ?? ""
  return div.innerHTML
}

export function buildPurchaseDocument(
  object: MaterialObject,
  items: ObjectMaterial[],
  catalog: MaterialItem[],
  companyName: string
) {
  const plan = buildPurchasePlan(items, catalog)

  const shopsHtml = plan.shops
    .map((shop) => {
      const rows = shop.lines
        .map((line, idx) => {
          const stockCell =
            line.stock === null
              ? '<span class="muted">не указано</span>'
              : line.enough
                ? `<span class="ok">есть ${line.stock} ${escapeHtml(line.unit)}</span>`
                : `<span class="warn">есть ${line.stock}, не хватает ${line.missing}</span>`
          return `
            <tr>
              <td class="num">${idx + 1}</td>
              <td>
                ${escapeHtml(line.name)}
                ${line.roomName ? `<div class="sub">${escapeHtml(line.roomName)}</div>` : ""}
              </td>
              <td class="center">${line.qty}</td>
              <td class="center">${escapeHtml(line.unit)}</td>
              <td class="center">${stockCell}</td>
              <td class="right">${formatMoney(line.price)}</td>
              <td class="right amount">${formatMoney(line.sum)}</td>
              <td class="center check"></td>
            </tr>`
        })
        .join("")

      const contacts = [
        shop.address ? `Адрес: ${escapeHtml(shop.address)}` : "",
        shop.phone ? `Тел.: ${escapeHtml(shop.phone)}` : "",
      ]
        .filter(Boolean)
        .join(" · ")

      return `
      <div class="room-block">
        <div class="cat-block">
          <table>
            <thead>
              <tr>
                <th class="num">№</th>
                <th>Наименование материала</th>
                <th class="center">Нужно</th>
                <th class="center">Ед.</th>
                <th class="center">Наличие</th>
                <th class="right">Цена</th>
                <th class="right">Сумма</th>
                <th class="center">Взял</th>
              </tr>
            </thead>
            <tbody>
              <tr class="cat-row">
                <td colspan="8">${escapeHtml(shop.name)}${contacts ? ` — ${contacts}` : ""}</td>
              </tr>
              ${rows}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="6" class="right">Итого по магазину</td>
                <td class="right amount">${formatMoney(shop.sum)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>`
    })
    .join("")

  const notes: string[] = []
  if (plan.shortageCount > 0) {
    notes.push(
      `Позиций с нехваткой на складе магазина: ${plan.shortageCount} — уточните наличие перед выездом`
    )
  }
  if (plan.unknownShopCount > 0) {
    notes.push(`Позиций без выбранного магазина: ${plan.unknownShopCount}`)
  }
  if (plan.saved > 0) {
    notes.push(`Экономия за счёт выбора магазина: ${formatMoney(plan.saved)}`)
  }

  const notesHtml = notes.length
    ? `<div class="notes">${notes.map((n) => `<div>• ${n}</div>`).join("")}</div>`
    : ""

  const styles = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Segoe UI', Arial, sans-serif;
    color: #1a1a1a;
    background: #ffffff;
    padding: 24px;
  }
  .est-root { max-width: 900px; margin: 0 auto; background: #ffffff; }
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
    width: 96px;
    height: 52px;
    min-width: 96px;
    object-fit: contain;
    object-position: left center;
    flex: 0 0 auto;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .brand span { color: #7A4E10; }
  .doc-title { text-align: right; }
  .doc-title h1 { font-size: 20px; margin: 0 0 4px; }
  .doc-title p { margin: 0; font-size: 13px; }
  .doc-subtitle h2 { font-size: 19px; margin: 0; letter-spacing: -0.3px; }
  .doc-subtitle p { margin: 4px 0 0; font-size: 12px; }
  hr.thin { border: none; border-top: 1.5px solid #7A4E10; margin: 20px 0; }
  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px 32px;
    border: 1.5px solid #7A4E10;
    border-radius: 10px;
    padding: 16px;
    margin-bottom: 20px;
    font-size: 13px;
  }
  .info-grid .label {
    color: #6B4508;
    font-size: 11.5px;
    font-weight: 700;
    text-transform: uppercase;
    margin-bottom: 3px;
  }
  .info-grid .value { font-size: 13.5px; font-weight: 600; }
  .notes {
    border: 1.5px solid #7A4E10;
    border-radius: 10px;
    padding: 12px 16px;
    margin-bottom: 20px;
    font-size: 12.5px;
    line-height: 1.7;
  }
  .room-block { margin-bottom: 18px; page-break-inside: avoid; }
  table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
  th {
    background: #F3ECE0;
    color: #3d2a08;
    text-align: left;
    padding: 9px 8px;
    font-size: 11px;
    text-transform: uppercase;
    font-weight: 700;
    border-bottom: 1.5px solid #7A4E10;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  td { padding: 8px; border-bottom: 1px solid #E5DCCB; vertical-align: top; }
  .cat-row td {
    background: #FAF6EF;
    font-weight: 700;
    font-size: 12.5px;
    color: #3d2a08;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .num { width: 34px; color: #6B4508; }
  .center { text-align: center; }
  .right { text-align: right; }
  .amount { font-weight: 700; }
  .sub { font-size: 11px; color: #6B4508; margin-top: 2px; }
  .muted { color: #8a7a5f; }
  .ok { color: #1d6b3a; font-weight: 600; }
  .warn { color: #9c2b2b; font-weight: 700; }
  .check {
    width: 44px;
  }
  .check::after {
    content: "";
    display: inline-block;
    width: 15px;
    height: 15px;
    border: 1.5px solid #7A4E10;
    border-radius: 3px;
  }
  tfoot td {
    border-top: 1.5px solid #7A4E10;
    border-bottom: none;
    padding-top: 9px;
    font-weight: 700;
    font-size: 12.5px;
  }
  .summary { display: flex; justify-content: flex-end; margin-top: 18px; }
  .summary-box {
    min-width: 320px;
    border: 1.5px solid #7A4E10;
    border-radius: 10px;
    padding: 14px 18px;
  }
  .summary-row {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    padding: 3px 0;
  }
  .summary-total {
    display: flex;
    justify-content: space-between;
    font-size: 16px;
    font-weight: 800;
    border-top: 1.5px solid #7A4E10;
    margin-top: 8px;
    padding-top: 8px;
  }
  .parties {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 32px;
    font-size: 12.5px;
  }
  .parties .label {
    color: #6B4508;
    font-size: 11px;
    text-transform: uppercase;
    font-weight: 700;
    margin-bottom: 4px;
  }
  .parties .name { font-weight: 600; }
  .footer {
    margin-top: 22px;
    text-align: center;
    color: #6B4508;
    font-size: 11px;
  }
  @page { size: A4; margin: 12mm; }
  @media print {
    body { padding: 0; }
    .room-block { page-break-inside: avoid; }
  }
`

  const shopsCount = plan.shops.length

  const bodyContent = `
  <div class="header">
    <div class="brand"><img class="brand-logo" src="${window.location.origin}/logo-print.png" alt="FixKey"/>Fix<span>Key</span></div>
    <div class="doc-title">
      <h1>Список на закупку</h1>
      <p>Объект № ${escapeHtml(object.object_code)}</p>
    </div>
  </div>

  <div class="doc-subtitle">
    <h2>СПИСОК НА ЗАКУПКУ</h2>
    <p>Что купить, сколько и в каком магазине</p>
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
      <div class="label">Адрес объекта</div>
      <div class="value">${escapeHtml(object.address || "—")}</div>
    </div>
    <div>
      <div class="label">Магазинов в списке</div>
      <div class="value">${shopsCount}</div>
    </div>
  </div>

  ${notesHtml}

  ${shopsHtml}

  <div class="summary">
    <div class="summary-box">
      ${plan.shops
        .map(
          (s) => `
      <div class="summary-row">
        <span>${escapeHtml(s.name)}</span>
        <span>${formatMoney(s.sum)}</span>
      </div>`
        )
        .join("")}
      <div class="summary-total">
        <span>ИТОГО:</span>
        <span>${formatMoney(plan.total)}</span>
      </div>
    </div>
  </div>

  <hr class="thin" />

  <div class="parties">
    <div>
      <div class="label">Закупку производит</div>
      <div class="name">${escapeHtml(companyName)}</div>
    </div>
    <div>
      <div class="label">Объект</div>
      <div class="name">${escapeHtml(object.client_name)}</div>
    </div>
  </div>

  <div class="footer">
    Сформировано ${formatDateTime(new Date().toISOString())}
  </div>`

  const title = `Список на закупку № ${object.object_code} — ${escapeHtml(object.client_name)}`

  return { styles, bodyContent, title }
}

export function printPurchaseList(
  object: MaterialObject,
  items: ObjectMaterial[],
  catalog: MaterialItem[],
  companyName: string,
  autoPrint = false
) {
  const { styles, bodyContent, title } = buildPurchaseDocument(
    object,
    items,
    catalog,
    companyName
  )
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

  const win = window.open("", "_blank", "width=900,height=1000")
  if (!win) return
  win.document.open()
  win.document.write(html)
  win.document.close()

  if (autoPrint) {
    win.onload = () => {
      win.focus()
      win.print()
    }
  }
}
