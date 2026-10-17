import { Invoice } from "@/lib/api"
import { moneyInWords } from "@/lib/numberToWordsRu"

const esc = (v: unknown) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")

const money = (n: number) =>
  new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0)

const dateRu = (d?: string | null) => {
  if (!d) return ""
  const dt = new Date(d)
  if (isNaN(dt.getTime())) return String(d)
  return dt.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" }).replace(/\s*г\.?$/, "") + " г."
}

const kopecks = (n: number) => String(Math.round((n || 0) * 100) % 100).padStart(2, "0")

export const VAT_RATE = 20

/** Суммы счёта с учётом режима НДС */
export function invoiceTotals(inv: Pick<Invoice, "items" | "vat_mode">) {
  const sum = (inv.items || []).reduce((s, it) => s + (Number(it.quantity) || 0) * (Number(it.price) || 0), 0)
  if (inv.vat_mode === "on_top") {
    const vat = Math.round(sum * VAT_RATE) / 100
    return { sum, vat, total: sum + vat }
  }
  if (inv.vat_mode === "included") {
    return { sum, vat: Math.round((sum * VAT_RATE * 100) / (100 + VAT_RATE)) / 100, total: sum }
  }
  return { sum, vat: 0, total: sum }
}

/** Основание платежа по умолчанию — из договора или акта */
export function defaultPurpose(inv: Pick<Invoice, "contract" | "act">): string {
  const parts: string[] = []
  if (inv.contract) parts.push(`по Договору № ${inv.contract.contract_number} от ${dateRu(inv.contract.contract_date)}`)
  if (inv.act) parts.push(`по Акту № ${inv.act.act_number} от ${dateRu(inv.act.act_date)}`)
  return parts.length ? `Оплата ${parts.join(", ")}` : ""
}

/** Печатная форма счёта на оплату: банковский блок, стороны, позиции, итог прописью, подписи */
export function buildInvoiceHtml(inv: Invoice): string {
  const c = inv.company || {}
  const cust = inv.customer || { name: inv.client_name || "", phone: "", email: "", address: "", object_code: "" }
  const entity = (c.entity_type || "").toLowerCase()
  const isLegal = /юрид|ооо|общество/.test(entity)
  const isIp = /предприним/.test(entity)
  const sellerName = isIp
    ? `Индивидуальный предприниматель ${c.contact_full_name || c.name || ""}`
    : c.name || c.contact_full_name || ""
  const signer = isLegal
    ? { role: c.director_position || "Руководитель", name: c.director_name || c.contact_full_name || "" }
    : { role: isIp ? "Предприниматель" : "Исполнитель", name: c.contact_full_name || c.name || "" }

  const { sum, vat, total } = invoiceTotals(inv)
  const vatLine =
    inv.vat_mode === "on_top"
      ? `<tr><td class="lbl">НДС ${VAT_RATE}%:</td><td class="val">${money(vat)}</td></tr>`
      : inv.vat_mode === "included"
        ? `<tr><td class="lbl">В том числе НДС ${VAT_RATE}%:</td><td class="val">${money(vat)}</td></tr>`
        : `<tr><td class="lbl">Без налога (НДС)</td><td class="val">—</td></tr>`

  const rows = (inv.items || [])
    .map(
      (it, i) => `<tr>
<td class="c">${i + 1}</td>
<td>${esc(it.name)}</td>
<td class="c">${esc(it.quantity)}</td>
<td class="c">${esc(it.unit)}</td>
<td class="r">${money(Number(it.price))}</td>
<td class="r">${money((Number(it.quantity) || 0) * (Number(it.price) || 0))}</td>
</tr>`,
    )
    .join("")

  const sellerLine = [
    esc(sellerName),
    c.inn ? `ИНН ${esc(c.inn)}` : "",
    isLegal && c.kpp ? `КПП ${esc(c.kpp)}` : "",
    (isIp || isLegal) && c.ogrn ? `${isLegal ? "ОГРН" : "ОГРНИП"} ${esc(c.ogrn)}` : "",
    c.legal_address ? esc(c.legal_address) : "",
    c.phone ? `тел.: ${esc(c.phone)}` : "",
    c.email ? `e-mail: ${esc(c.email)}` : "",
    c.website ? `сайт: ${esc(c.website)}` : "",
  ]
    .filter(Boolean)
    .join(", ")

  const opts = inv.contract?.options || {}
  const buyerName =
    opts.customer_type === "legal" && opts.customer_org_name
      ? opts.customer_org_name
      : opts.customer_type === "entrepreneur"
        ? `ИП ${opts.customer_name || cust.name}`
        : opts.customer_name || cust.name
  const buyerLine = [
    esc(buyerName),
    opts.customer_type === "entrepreneur" && opts.customer_ogrnip ? `ОГРНИП ${esc(opts.customer_ogrnip)}` : "",
    opts.customer_type === "legal" && opts.customer_ogrn ? `ОГРН ${esc(opts.customer_ogrn)}` : "",
    cust.address ? `адрес объекта: ${esc(cust.address)}` : "",
    cust.phone ? `тел.: ${esc(cust.phone)}` : "",
    cust.email ? `e-mail: ${esc(cust.email)}` : "",
  ]
    .filter(Boolean)
    .join(", ")

  const purpose = inv.purpose || defaultPurpose(inv)
  const sig =
    inv.apply_signature && c.signature_url
      ? `<img src="${esc(c.signature_url)}" crossorigin="anonymous" alt="" class="inv-sig"/>`
      : ""
  const stamp =
    inv.apply_stamp && c.stamp_url ? `<img src="${esc(c.stamp_url)}" crossorigin="anonymous" alt="" class="inv-stamp"/>` : ""

  return `<div class="invoice-doc">
<style>
.invoice-doc { font-family: Arial, sans-serif; color: #111; font-size: 12.5px; line-height: 1.4; }
.invoice-doc table { border-collapse: collapse; width: 100%; }
.invoice-doc .bank td { border: 1px solid #333; padding: 4px 6px; vertical-align: top; }
.invoice-doc .bank .small { font-size: 10.5px; color: #444; }
.invoice-doc h1 { font-size: 19px; margin: 22px 0 6px; padding-bottom: 6px; border-bottom: 2px solid #111; }
.invoice-doc .party { margin: 8px 0; }
.invoice-doc .party b { display: inline-block; min-width: 110px; }
.invoice-doc .items th { background: #5C3A11; color: #fff; border: 1px solid #333; padding: 6px; font-size: 11.5px; }
.invoice-doc .items td { border: 1px solid #333; padding: 5px 6px; }
.invoice-doc .items tr { page-break-inside: avoid; break-inside: avoid; }
.invoice-doc .c { text-align: center; }
.invoice-doc .r { text-align: right; white-space: nowrap; }
.invoice-doc .totals { width: auto; margin: 8px 0 0 auto; }
.invoice-doc .totals td { padding: 2px 0 2px 16px; font-weight: 700; }
.invoice-doc .totals .val { text-align: right; min-width: 110px; }
.invoice-doc .words { margin: 12px 0 4px; }
.invoice-doc .words b { font-weight: 700; }
.invoice-doc .note { font-size: 11.5px; color: #333; margin: 10px 0 0; padding-bottom: 10px; border-bottom: 2px solid #111; }
.invoice-doc .signs { margin-top: 28px; page-break-inside: avoid; break-inside: avoid; }
.invoice-doc .sign-cell { position: relative; padding-bottom: 70px; }
.invoice-doc .sign-line { position: relative; height: 70px; border-bottom: 1px solid #111; margin: 0 0 3px; }
.invoice-doc .inv-sig { position: absolute; left: 10px; bottom: 3px; height: 58px; max-width: 190px; object-fit: contain; }
.invoice-doc .inv-stamp { position: absolute; right: 0; top: 74px; width: 118px; height: 118px; object-fit: contain; opacity: .9; }
.invoice-doc .hint { font-size: 10.5px; color: #555; }
</style>

<table class="bank">
<tr>
  <td colspan="2" rowspan="2" style="width:60%">${esc(c.bank_name)}<br/><span class="small">Банк получателя</span></td>
  <td style="width:10%">БИК</td><td>${esc(c.bik)}</td>
</tr>
<tr><td>Сч. №</td><td>${esc(c.correspondent_account)}</td></tr>
<tr>
  <td>ИНН ${esc(c.inn)}</td><td>${isLegal ? `КПП ${esc(c.kpp)}` : ""}</td>
  <td rowspan="2">Сч. №</td><td rowspan="2">${esc(c.account_number)}</td>
</tr>
<tr><td colspan="2">${esc(sellerName)}<br/><span class="small">Получатель</span></td></tr>
</table>

<h1>Счёт на оплату № ${esc(inv.invoice_number)} от ${dateRu(inv.invoice_date)}</h1>

<div class="party"><b>Поставщик<br/>(Исполнитель):</b> ${sellerLine}</div>
<div class="party"><b>Покупатель<br/>(Заказчик):</b> ${buyerLine}</div>
${purpose ? `<div class="party"><b>Основание:</b> ${esc(purpose)}</div>` : ""}

<table class="items" style="margin-top:10px">
<thead><tr>
  <th style="width:5%">№</th><th>Товары (работы, услуги)</th><th style="width:9%">Кол-во</th>
  <th style="width:8%">Ед.</th><th style="width:15%">Цена</th><th style="width:16%">Сумма</th>
</tr></thead>
<tbody>${rows}</tbody>
</table>

<table class="totals">
<tr><td class="lbl">Итого:</td><td class="val">${money(sum)}</td></tr>
${vatLine}
<tr><td class="lbl">Всего к оплате:</td><td class="val">${money(total)}</td></tr>
</table>

<div class="words">Всего наименований ${(inv.items || []).length}, на сумму ${money(total)} руб.<br/>
<b>${esc(capitalize(moneyInWords(Math.floor(total))))} ${kopecks(total)} ${kopWord(Number(kopecks(total)))}</b></div>
<div class="note">
${inv.due_date ? `Оплатить не позднее ${dateRu(inv.due_date)} ` : ""}В назначении платежа укажите номер счёта.
${inv.notes ? `<br/>${esc(inv.notes).replace(/\n/g, "<br/>")}` : ""}
</div>

<table class="signs"><tr>
<td class="sign-cell" style="width:60%;padding-right:24px">
  <div style="font-weight:700;margin-bottom:4px">${esc(signer.role)}</div>
  <div class="sign-line">${sig}${stamp}</div>
  <div>${esc(signer.name)}</div>
  <div class="hint">(подпись)</div>
</td>
<td style="width:40%"></td>
</tr></table>
</div>`
}

function kopWord(n: number) {
  const a = n % 100
  const b = n % 10
  if (a >= 11 && a <= 14) return "копеек"
  if (b === 1) return "копейка"
  if (b >= 2 && b <= 4) return "копейки"
  return "копеек"
}

function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s
}
