import { MaterialItem, MaterialObject, ObjectMaterial } from "@/lib/api"

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

interface ShopGroup {
  name: string
  address: string
  phone: string
  items: ObjectMaterial[]
  sum: number
}

export function groupByShop(items: ObjectMaterial[], catalog: MaterialItem[]): ShopGroup[] {
  const map = new Map<string, ShopGroup>()
  items.forEach((item) => {
    const ref = catalog.find((c) => c.id === item.material_id)
    const name = item.shop_name || ref?.shop_name || "Магазин не указан"
    if (!map.has(name)) {
      map.set(name, { name, address: "", phone: "", items: [], sum: 0 })
    }
    const group = map.get(name)!
    if (!group.address && ref?.shop_address) group.address = ref.shop_address
    if (!group.phone && ref?.shop_phone) group.phone = ref.shop_phone
    group.items.push(item)
    group.sum += num(item.qty) * num(item.price)
  })
  return Array.from(map.values()).sort((a, b) => b.sum - a.sum)
}

function buildMaterialsDocument(
  object: MaterialObject,
  items: ObjectMaterial[],
  catalog: MaterialItem[],
  companyName: string
) {
  const groups = groupByShop(items, catalog)
  const total = groups.reduce((s, g) => s + g.sum, 0)

  const roomNames = Array.from(
    new Set(items.map((it) => it.room_name).filter(Boolean))
  ) as string[]
  const roomTitle = roomNames.length ? roomNames.join(", ") : "Без помещения"

  const shopsHtml = groups
    .map((group) => {
      const rows = group.items
        .map(
          (it, idx) => `
            <tr>
              <td class="num">${idx + 1}</td>
              <td>${escapeHtml(it.name)}</td>
              <td>${escapeHtml(it.room_name || "—")}</td>
              <td>${escapeHtml(it.work_type || "—")}</td>
              <td class="center">${num(it.qty)}</td>
              <td class="center">${escapeHtml(it.unit)}</td>
              <td class="right">${formatMoney(it.price)}</td>
              <td class="right amount">${formatMoney(num(it.qty) * num(it.price))}</td>
            </tr>`
        )
        .join("")

      const contacts = group.address ? `Адрес: ${escapeHtml(group.address)}` : ""

      return `
      <div class="room-block">
        <div class="cat-block">
          <table>
            <thead>
              <tr>
                <th class="num">№</th>
                <th>Наименование материала</th>
                <th>Помещение</th>
                <th>Вид работ</th>
                <th class="center">Кол-во</th>
                <th class="center">Ед.</th>
                <th class="right">Цена</th>
                <th class="right">Сумма</th>
              </tr>
            </thead>
            <tbody>
              <tr class="cat-row"><td colspan="8">${escapeHtml(group.name)}${contacts ? ` — ${contacts}` : ""}</td></tr>
              ${rows}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="7" class="right">Итого по магазину</td>
                <td class="right amount">${formatMoney(group.sum)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>`
    })
    .join("")

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
    width: 72px;
    height: 44px;
    min-width: 72px;
    background-repeat: no-repeat;
    background-position: left center;
    background-size: contain;
    flex: 0 0 auto;
  }
  .brand span { color: #7A4E10; }
  .doc-title { text-align: right; }
  .doc-title h1 { font-size: 20px; margin: 0 0 4px; }
  .doc-title p { margin: 0; color: #1a1a1a; font-size: 13px; }
  .doc-subtitle h2 { font-size: 19px; margin: 0; letter-spacing: -0.3px; }
  .doc-subtitle p { margin: 4px 0 0; color: #1a1a1a; font-size: 12px; }
  hr.thin { border: none; border-top: 1.5px solid #7A4E10; margin: 20px 0; }
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
  .info-grid .value { font-weight: 500; }
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
    color: #1a1a1a;
  }
  thead th:nth-child(1) { width: 28px; }
  thead th:nth-child(2) { width: auto; }
  thead th:nth-child(3) { width: 90px; }
  thead th:nth-child(4) { width: 110px; }
  thead th:nth-child(5) { width: 56px; }
  thead th:nth-child(6) { width: 44px; }
  thead th:nth-child(7) { width: 78px; }
  thead th:nth-child(8) { width: 88px; }
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
    border-top: 1.2px solid #8A6A3A;
    color: #1a1a1a;
    font-size: 12.5px;
  }
  .num { color: #1a1a1a; }
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
    border-top: 1.5px solid #5C3A11;
    font-weight: 600;
  }
  .summary { display: flex; justify-content: flex-end; margin-bottom: 24px; }
  .summary-box {
    width: 100%;
    max-width: 290px;
    background: #ffffff;
    border: 1.5px solid #7A4E10;
    border-radius: 10px;
    padding: 16px;
    font-size: 13px;
  }
  .summary-row { display: flex; justify-content: space-between; margin-bottom: 6px; color: #1a1a1a; }
  .summary-total {
    display: flex;
    justify-content: space-between;
    font-size: 16px;
    font-weight: 700;
    padding-top: 8px;
    border-top: 1.5px solid #5C3A11;
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
  .footer { text-align: right; font-size: 11.5px; color: #444; margin-top: 24px; }
  @page { size: A4 portrait; margin: 10mm; }
  @media print {
    html, body { width: auto; margin: 0; padding: 0; background: #fff; overflow: visible; }
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    .est-root { padding: 0 2mm; width: 100%; max-width: 100%; margin: 0; overflow: visible; }
    .no-print { display: none; }
    .cat-block, .room-block { break-inside: avoid; }
    table { width: 100%; table-layout: fixed; }
    td, th { overflow-wrap: break-word; word-break: break-word; }
    thead th { background: #5C3A11 !important; color: #ffffff !important; }
    .cat-row td { background: #EADCC0 !important; color: #4A2E06 !important; }
    tfoot td { background: #ffffff !important; border-top: 1px solid #A98A5C !important; }
    .info-grid, .summary-box { background: #ffffff !important; border: 1.5px solid #7A4E10 !important; }
    .cat-block { border: 1.5px solid #7A4E10 !important; }
    .info-grid .label, .parties .label { color: #6B4508 !important; }
    tbody td { border-top: 1.2px solid #8A6A3A !important; color: #1a1a1a !important; }
    tbody tr:first-child td { border-top: none !important; }
    hr.thin { border-top: 1.5px solid #7A4E10 !important; }
  }
`

  const bodyContent = `
  <div class="header">
    <div class="brand"><div class="brand-logo" style="background-image:url('${window.location.origin}/favicon.png')"></div>Fix<span>Key</span></div>
    <div class="doc-title">
      <h1>Смета на материал</h1>
      <p>Объект № ${escapeHtml(object.object_code)}</p>
    </div>
  </div>

  <div class="doc-subtitle">
    <h2>СМЕТА НА МАТЕРИАЛ</h2>
    <p>Расчёт материалов по помещениям и магазинам</p>
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
      <div class="label">Помещение</div>
      <div class="value">${escapeHtml(roomTitle)}</div>
    </div>
  </div>

  ${shopsHtml}

  <div class="summary">
    <div class="summary-box">
      <div class="summary-row">
        <span>Помещение:</span>
        <span>${escapeHtml(roomTitle)}</span>
      </div>
      <div class="summary-total">
        <span>ИТОГО:</span>
        <span>${formatMoney(total)}</span>
      </div>
    </div>
  </div>

  <hr class="thin" />

  <div class="parties">
    <div>
      <div class="label">Исполнитель</div>
      <div class="name">${escapeHtml(companyName)}</div>
    </div>
    <div>
      <div class="label">Заказчик</div>
      <div class="name">${escapeHtml(object.client_name)}</div>
    </div>
  </div>

  <div class="footer">
    Сформировано ${formatDateTime(new Date().toISOString())}
  </div>`

  const title = `Смета на материал № ${object.object_code} — ${escapeHtml(object.client_name)}`

  return { styles, bodyContent, title }
}

export function printMaterials(
  object: MaterialObject,
  items: ObjectMaterial[],
  catalog: MaterialItem[],
  companyName: string,
  autoPrint = false
) {
  const { styles, bodyContent, title } = buildMaterialsDocument(object, items, catalog, companyName)
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

function scopeStyles(css: string, scope: string) {
  const withoutAtRules = css
    .replace(/@page[^{]*\{[^}]*\}/g, "")
    .replace(/@media\s+print\s*\{(?:[^{}]*\{[^}]*\})*[^{}]*\}/g, "")
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

export async function downloadMaterialsPdf(
  object: MaterialObject,
  items: ObjectMaterial[],
  catalog: MaterialItem[],
  companyName: string
) {
  const { styles, bodyContent } = buildMaterialsDocument(object, items, catalog, companyName)

  const container = document.createElement("div")
  container.style.position = "fixed"
  container.style.left = "-10000px"
  container.style.top = "0"
  container.style.width = "760px"
  container.style.background = "#ffffff"

  const root = document.createElement("div")
  root.id = "pdf-scope-materials"
  root.className = "est-root"
  root.style.width = "760px"
  root.style.maxWidth = "760px"
  root.style.padding = "0"
  root.style.margin = "0"
  root.style.background = "#ffffff"

  const styleTag = document.createElement("style")
  styleTag.textContent = scopeStyles(styles, "#pdf-scope-materials")

  root.appendChild(styleTag)
  const content = document.createElement("div")
  content.innerHTML = bodyContent
  root.appendChild(content)

  container.appendChild(root)
  document.body.appendChild(container)

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
        margin: [12, 12, 12, 12],
        filename: `Смета на материал ${object.object_code}.pdf`,
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
