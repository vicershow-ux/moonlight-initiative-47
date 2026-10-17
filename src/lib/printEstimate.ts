import { Estimate, ObjectItem, EstimateItem } from "@/lib/api"
import { renderPagedPdf } from "@/lib/pdfRender"

const num = (v: unknown, fallback = 0): number => {
  const n = typeof v === "string" ? parseFloat(v) : Number(v)
  return Number.isFinite(n) ? n : fallback
}

const formatMoney = (n: unknown) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(num(n)) + " ₽"

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })

function group4(v?: string | null) {
  return (v || "").replace(/\s+/g, "").replace(/(\d{4})(?=\d)/g, "$1 ")
}

function reqRow(label: string, value?: string | null, cls = "") {
  if (!value) return ""
  return `<tr class="${cls.includes("hl") ? "hl" : ""}"><td class="rk">${label}</td><td class="rv${cls.includes("acc") ? " acc" : ""}">${escapeHtml(value)}</td></tr>`
}

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
    border-top: 1.5px solid #7A4E10;
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
    color: #1a1a1a;
  }
  thead th:nth-child(1) { width: 34px; }
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
    border-top: 1.2px solid #8A6A3A;
    color: #1a1a1a;
    font-size: 12.5px;
  }
  .num { color: #1a1a1a; width: 34px; white-space: nowrap; word-break: normal; }
  .center { text-align: center; }
  .right { text-align: right; }
  .amount { font-weight: 600; }
  .cat-row td {
    background: #B9A27A;
    color: #1F1405;
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
  .room-total {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #B9A27A;
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
    border-top: 1.5px solid #5C3A11;
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
  .parties { align-items: start; gap: 16px; }
  .party-card { border: 1.2px solid #6B4508; border-radius: 10px; overflow: hidden; break-inside: avoid; page-break-inside: avoid; }
  .party-head { background: #B9A27A; color: #1F1405; padding: 7px 12px; font-weight: 700; font-size: 11.5px; letter-spacing: .4px; text-transform: uppercase; }
  table.party-table { width: 100%; border-collapse: collapse; table-layout: auto; margin-bottom: 6px; }
  .party-table td { padding: 4px 12px; border: none !important; vertical-align: top; }
  .party-table .party-name { padding-top: 8px; font-weight: 700; font-size: 13px; }
  .party-table .rk { width: 36%; color: #6b5a3e; font-size: 11px; }
  .party-table .rv { font-weight: 600; font-size: 12.5px; word-break: break-word; }
  .party-table .acc { font-family: "Courier New", monospace; font-size: 13px; letter-spacing: .3px; }
  .party-table tr.hl td { background: #F3EBDC; }
  .party-table .bank-sub { padding-top: 8px; border-top: 1px solid #D9C9A8 !important; font-size: 10.5px; font-weight: 700; letter-spacing: .4px; color: #6B4508; text-transform: uppercase; }
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
  /* Колонтитулы: на каждом листе сверху номер сметы и заказчик,
     снизу — "Страница N из M", чтобы распечатанные листы не путались */
  @page {
    size: A4 portrait;
    margin: 14mm 12mm 14mm 16mm;
    @top-left { content: ""; }
    @top-center { content: ""; }
    @top-right { content: ""; }
    @bottom-left { content: ""; }
    @bottom-center { content: ""; }
    @bottom-right {
      content: "Стр. " counter(page) " из " counter(pages);
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 8.5pt;
      color: #555555;
    }
  }
  .sign-row { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 36px; page-break-inside: avoid; break-inside: avoid; }
  .sign-col .label { color: #4A2E06; font-size: 11.5px; font-weight: 700; letter-spacing: 0.4px; margin-bottom: 6px; text-transform: uppercase; }
  .sign-box { position: relative; height: 84px; border-bottom: 1.5px solid #5C3A11; margin-bottom: 4px; }
  .sign-box .sig { position: absolute; left: 10px; bottom: 4px; height: 62px; max-width: 200px; object-fit: contain; }
  .sign-box .stamp { position: absolute; right: 0; bottom: 0; height: 112px; width: 112px; object-fit: contain; opacity: 0.9; }
  .sign-col.with-stamp .sign-box { height: 118px; }
  .sign-col .who { font-size: 13px; color: #1a1a1a; }
  .sign-col .hint { font-size: 11px; color: #555; margin-top: 2px; }
  .parties, .info-grid, .summary, .notes, .room-total { page-break-inside: avoid; break-inside: avoid; }
  @media print {
    html, body { width: auto; margin: 0; padding: 0; background: #fff; overflow: visible; }
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    .est-root {
      padding: 0 2mm;
      width: 100%;
      max-width: 100%;
      margin: 0;
      overflow: visible;
    }
    .no-print { display: none; }

    /* Таблице разрешаем переноситься между страницами: иначе длинная
       категория целиком уезжает на следующий лист и оставляет
       полстраницы пустоты. Рвём только между строками. */
    .cat-block {
      break-inside: auto;
      overflow: visible;
      /* Рамка и скругление рисуются на каждом куске отдельно,
         поэтому продолжение на новой странице выглядит так же,
         как начало таблицы на первой. */
      -webkit-box-decoration-break: clone;
      box-decoration-break: clone;
    }
    .room-block { break-inside: auto; }
    /* Скругляем углы самой шапки — она повторяется на каждой странице */
    thead th:first-child { border-top-left-radius: 9px; }
    thead th:last-child { border-top-right-radius: 9px; }
    table { break-inside: auto; }
    tr, .cat-row, tfoot tr { break-inside: avoid; }

    /* Шапка таблицы повторяется на каждой новой странице,
       чтобы был виден перечень колонок: Ед., Кол-во, Цена и т.д. */
    thead { display: table-header-group; }
    tfoot { display: table-row-group; }

    /* Не отрываем заголовок помещения и название категории от их строк */
    .room-title { break-after: avoid; }
    .cat-row { break-after: avoid; }
    .room-total { break-before: avoid; }

    /* Одинокая строка внизу или вверху листа смотрится неряшливо */
    tbody { orphans: 3; widows: 3; }

    table { width: 100%; table-layout: fixed; }
    td, th { overflow-wrap: break-word; word-break: break-word; }
    thead th:nth-child(1) { width: 6%; }
    thead th:nth-child(2) { width: auto; }
    thead th:nth-child(3) { width: 7%; }
    thead th:nth-child(4) { width: 10%; }
    thead th:nth-child(5) { width: 7%; }
    thead th:nth-child(6) { width: 13%; }
    thead th:nth-child(7) { width: 15%; }
    thead th { background: #5C3A11 !important; color: #ffffff !important; }
    .cat-row td { background: #B9A27A !important; color: #1F1405 !important; }
    .room-total { background: #B9A27A !important; border: 1.5px solid #7A4E10 !important; border-left: 5px solid #5C3A11 !important; }
    tfoot td { background: #ffffff !important; border-top: 1px solid #A98A5C !important; }
    .info-grid, .summary-box { background: #ffffff !important; border: 1.5px solid #7A4E10 !important; }
    .cat-block { border: 1.5px solid #7A4E10 !important; }
    .info-grid .label, .parties .label, .signature-block .label, .room-total-label { color: #6B4508 !important; }
    .cat-block, .info-grid, .room-total, .summary-box, .summary {
      max-width: 100%;
      box-sizing: border-box;
    }
    .cat-block { overflow: hidden; }
    tbody td { border-top: 1.2px solid #8A6A3A !important; color: #1a1a1a !important; }
    tbody tr:first-child td { border-top: none !important; }
    tfoot td { border-top: 1.5px solid #5C3A11 !important; }
    .summary-total { border-top: 1.5px solid #5C3A11 !important; }
    .signature-block .signature-line { border-top: 1.5px solid #5C3A11 !important; }
    hr.thin { border-top: 1.5px solid #7A4E10 !important; }
    .cat-block table { width: 100%; max-width: 100%; box-sizing: border-box; }
    .cat-block thead th:last-child,
    .cat-block tbody td:last-child,
    .cat-block tfoot td:last-child { padding-right: 12px; }
  }
`

  const estNo = estimate.estimate_number || String(estimate.id)
  const withSig = Boolean(estimate.apply_signature && estimate.company_signature_url)
  const withStamp = Boolean(estimate.apply_stamp && estimate.company_stamp_url)

  const bodyContent = `
  <div class="header">
    <div class="brand"><img class="brand-logo" src="${window.location.origin}/logo-print.png" alt="FixKey"/><b class="brand-word">Fix<span>Key</span></b></div>
    <div class="doc-title">
      <h1>Смета № ${escapeHtml(estNo)}</h1>
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
    <div class="party-card">
      <div class="party-head">Исполнитель</div>
      <table class="party-table">
        <tr><td colspan="2" class="party-name">${escapeHtml(/предприним/i.test(estimate.company_entity_type || "") && estimate.company_contact_full_name ? `ИП ${estimate.company_contact_full_name}` : estimate.company_name || companyName)}</td></tr>
        ${estimate.company_ogrn && /предприним|юрид/i.test(estimate.company_entity_type || "") ? reqRow(/юрид/i.test(estimate.company_entity_type || "") ? "ОГРН" : "ОГРНИП", estimate.company_ogrn) : ""}
        ${reqRow("ИНН", estimate.company_inn)}
        ${/юрид/i.test(estimate.company_entity_type || "") ? reqRow("КПП", estimate.company_kpp) : ""}
        ${reqRow("Адрес", estimate.company_legal_address)}
        ${reqRow("Телефон", estimate.company_phone)}
        ${reqRow("E-mail", estimate.company_email)}
        ${reqRow("Сайт", estimate.company_website)}
        ${estimate.company_account_number || estimate.company_bank_name ? `<tr><td colspan="2" class="bank-sub">Банковские реквизиты</td></tr>` : ""}
        ${reqRow("Расчётный счёт", group4(estimate.company_account_number), "acc hl")}
        ${reqRow("Банк", estimate.company_bank_name)}
        ${reqRow("БИК", estimate.company_bik, "acc")}
        ${reqRow("Корр. счёт", group4(estimate.company_correspondent_account), "acc")}
      </table>
    </div>
    <div class="party-card">
      <div class="party-head">Заказчик</div>
      <table class="party-table">
        <tr><td colspan="2" class="party-name">${escapeHtml(object.client_name)}</td></tr>
        ${reqRow("Телефон", object.client_phone)}
        ${reqRow("E-mail", object.email || estimate.email)}
        ${reqRow("Адрес объекта", object.address || estimate.address)}
      </table>
    </div>
  </div>

  <div class="sign-row">
    <div class="sign-col${withStamp ? " with-stamp" : ""}">
      <div class="label">От имени Исполнителя</div>
      <div class="sign-box">
        ${withSig ? `<img class="sig" src="${escapeHtml(estimate.company_signature_url || "")}" crossorigin="anonymous" alt=""/>` : ""}
        ${withStamp ? `<img class="stamp" src="${escapeHtml(estimate.company_stamp_url || "")}" crossorigin="anonymous" alt=""/>` : ""}
      </div>
      <div class="who">${escapeHtml(estimate.company_contact_full_name || estimate.company_name || companyName)}</div>
      <div class="hint">(подпись)</div>
    </div>
    <div class="sign-col">
      <div class="label">От имени Заказчика</div>
      <div class="sign-box"></div>
      <div class="who">${escapeHtml(object.client_name)}</div>
      <div class="hint">(подпись)</div>
    </div>
  </div>`

  const title = `Смета № ${escapeHtml(estNo)} — ${escapeHtml(object.client_name)}`

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
  let printed = false
  const go = () => {
    if (printed) return
    printed = true
    printWindow.focus()
    printWindow.print()
  }
  const waitImages = () => {
    const pending = Array.from(printWindow.document.images).filter((im) => !im.complete)
    if (!pending.length) return setTimeout(go, 200)
    let left = pending.length
    pending.forEach((im) => {
      const one = () => {
        left -= 1
        if (left <= 0) setTimeout(go, 200)
      }
      im.addEventListener("load", one, { once: true })
      im.addEventListener("error", one, { once: true })
    })
    setTimeout(go, 5000)
  }
  if (printWindow.document.readyState === "complete") waitImages()
  else printWindow.onload = waitImages
}

function stripAtRule(css: string, startRe: RegExp) {
  let out = css
  for (;;) {
    const m = startRe.exec(out)
    if (!m) return out
    const open = out.indexOf("{", m.index)
    if (open === -1) return out
    let depth = 0
    let end = -1
    for (let i = open; i < out.length; i++) {
      if (out[i] === "{") depth++
      else if (out[i] === "}") {
        depth--
        if (depth === 0) {
          end = i
          break
        }
      }
    }
    if (end === -1) return out
    out = out.slice(0, m.index) + out.slice(end + 1)
    startRe.lastIndex = 0
  }
}

function scopeStyles(css: string, scope: string) {
  // @page и @media print содержат вложенные блоки (@top-left и т.п.),
  // поэтому вырезаем их со счётом скобок, а не простой заменой
  const withoutAtRules = stripAtRule(stripAtRule(css, /@page\b/g), /@media\s+print\b/g)
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


/** Правки для PDF: таблицы свободно переходят на следующую страницу (как в актах),
    рвутся только между строками, без пустых листов и «обрезанных» рамок */
const PDF_OVERRIDES = `
  .est-root { padding: 0; }
  .room-block, .cat-block { page-break-inside: auto !important; break-inside: auto !important; }
  .cat-block { border: 1.2px solid #6B4508; border-radius: 10px; overflow: hidden; margin-bottom: 14px; }
  .cat-block thead th { border: 1.2px solid #6B4508; }
  .cat-block tbody td, .cat-block tfoot td { border: 1.2px solid #6B4508 !important; }
  .cat-block tr > *:first-child { border-left: none !important; }
  .cat-block tr > *:last-child { border-right: none !important; }
  .cat-block thead tr > * { border-top: none !important; }
  .cat-block tfoot tr:last-child > * { border-bottom: none !important; }
  .room-title { margin-top: 6px; }
  .room-total { border-radius: 10px; }
  thead th:nth-child(3) { width: 54px; }
  tbody td:nth-child(3) { white-space: nowrap; word-break: normal; }
  thead th:nth-child(1) { color: #ffffff; }
  .summary-box > .summary-total:first-child { border-top: none; padding-top: 0; }
`

export function estimatePreviewHtml(estimate: Estimate, object: ObjectItem, companyName: string, scopeId = "est-preview") {
  const { styles, bodyContent } = buildEstimateDocument(estimate, object, companyName)
  return `<style>${scopeStyles(styles + PDF_OVERRIDES, `#${scopeId}`)}</style><div id="${scopeId}" class="est-root">${bodyContent}</div>`
}

export async function downloadEstimatePdf(estimate: Estimate, object: ObjectItem, companyName: string) {
  await renderEstimatePdf(estimate, object, companyName, "save")
}

/** PDF сметы в base64 — для отправки письмом */
export async function estimatePdfBase64(estimate: Estimate, object: ObjectItem, companyName: string): Promise<string> {
  return (await renderEstimatePdf(estimate, object, companyName, "base64")) || ""
}

async function renderEstimatePdf(estimate: Estimate, object: ObjectItem, companyName: string, mode: "save" | "base64"): Promise<string | void> {
  const { styles, bodyContent } = buildEstimateDocument(estimate, object, companyName)
  return renderPagedPdf(
    (root) => {
      root.id = "pdf-scope-estimate"
      root.className = "est-root"
      root.innerHTML = `<style>${scopeStyles(styles + PDF_OVERRIDES, "#pdf-scope-estimate")}</style>${bodyContent}`
    },
    { filename: `Смета №${estimate.estimate_number || estimate.id}.pdf`, mode },
  )
}

function escapeHtml(str: string) {
  const div = document.createElement("div")
  div.textContent = str ?? ""
  return div.innerHTML
}