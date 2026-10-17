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

  const field = (label: string, value?: string | null) =>
    value ? `<tr><td class="k">${label}</td><td class="v">${esc(value)}</td></tr>` : ""

  const sellerRows = [
    field("Наименование", sellerName),
    field("ИНН", c.inn),
    isLegal ? field("КПП", c.kpp) : "",
    isIp || isLegal ? field(isLegal ? "ОГРН" : "ОГРНИП", c.ogrn) : "",
    field("Адрес", c.legal_address),
    field("Телефон", c.phone),
    field("E-mail", c.email),
    field("Сайт", c.website),
  ].join("")

  const opts = inv.contract?.options || {}
  const buyerName =
    opts.customer_type === "legal" && opts.customer_org_name
      ? opts.customer_org_name
      : opts.customer_type === "entrepreneur"
        ? `ИП ${opts.customer_name || cust.name}`
        : opts.customer_name || cust.name
  const buyerRows = [
    field(opts.customer_type === "legal" ? "Организация" : "ФИО", buyerName),
    opts.customer_type === "entrepreneur" ? field("ОГРНИП", opts.customer_ogrnip) : "",
    opts.customer_type === "legal" ? field("ОГРН", opts.customer_ogrn) : "",
    field("Адрес объекта", cust.address),
    field("Телефон", cust.phone),
    field("E-mail", cust.email),
  ].join("")

  const purpose = inv.purpose || defaultPurpose(inv)
  const sig =
    inv.apply_signature && c.signature_url
      ? `<img src="${esc(c.signature_url)}" crossorigin="anonymous" alt="" class="inv-sig"/>`
      : ""
  const stamp =
    inv.apply_stamp && c.stamp_url ? `<img src="${esc(c.stamp_url)}" crossorigin="anonymous" alt="" class="inv-stamp"/>` : ""

  const acc = (v?: string | null) => esc((v || "").replace(/\s+/g, "").replace(/(\d{4})(?=\d)/g, "$1 "))

  return `<div class="invoice-doc">
<style>
.invoice-doc { font-family: Arial, sans-serif; color: #161616; font-size: 12.5px; line-height: 1.45; }
.invoice-doc table { border-collapse: collapse; width: 100%; }
.invoice-doc .sec-title { font-size: 11px; font-weight: 700; letter-spacing: .6px; text-transform: uppercase; color: #6B4508; margin: 0 0 6px; }
.invoice-doc .bank { border: 1.2px solid #6B4508; border-radius: 10px; overflow: hidden; }
.invoice-doc .bank-head { background: #5C3A11; color: #fff; padding: 8px 14px; font-weight: 700; font-size: 12px; letter-spacing: .4px; text-transform: uppercase; }
.invoice-doc .bank td { padding: 7px 14px; border-top: 1px solid #D9C9A8; vertical-align: top; }
.invoice-doc .bank tr:first-child td { border-top: none; }
.invoice-doc .bank .k { width: 38%; color: #5a4a30; font-size: 11.5px; }
.invoice-doc .bank .v { font-weight: 600; }
.invoice-doc .bank .acc { font-family: "Courier New", monospace; font-size: 13.5px; font-weight: 700; letter-spacing: .3px; }
.invoice-doc .bank tr.main td { background: #F3EBDC; }
.invoice-doc .title { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; margin: 22px 0 14px; padding-bottom: 8px; border-bottom: 2.5px solid #5C3A11; }
.invoice-doc .title h1 { font-size: 20px; margin: 0; }
.invoice-doc .title .due { font-size: 12px; color: #5a4a30; text-align: right; white-space: nowrap; }
.invoice-doc .title .due b { color: #161616; }
.invoice-doc .parties { display: table; width: 100%; table-layout: fixed; border-spacing: 0; }
.invoice-doc .party { display: table-cell; width: 50%; vertical-align: top; }
.invoice-doc .party + .party { padding-left: 14px; }
.invoice-doc .card { border: 1.2px solid #6B4508; border-radius: 10px; overflow: hidden; height: 100%; }
.invoice-doc .card-head { background: #B9A27A; color: #1F1405; padding: 7px 12px; font-weight: 700; font-size: 11.5px; letter-spacing: .4px; text-transform: uppercase; }
.invoice-doc .card td { padding: 4px 12px; vertical-align: top; font-size: 12px; }
.invoice-doc .card tr:first-child td { padding-top: 8px; }
.invoice-doc .card tr:last-child td { padding-bottom: 9px; }
.invoice-doc .card .k { width: 34%; color: #6b5a3e; font-size: 11px; }
.invoice-doc .card .v { font-weight: 600; word-break: break-word; }
.invoice-doc .basis { margin: 12px 0 0; padding: 9px 14px; background: #F3EBDC; border-left: 4px solid #5C3A11; border-radius: 8px; font-size: 12.5px; }
.invoice-doc .items { margin-top: 14px; }
.invoice-doc .items { border-collapse: collapse; }
.invoice-doc .items th { background: #5C3A11; color: #fff; border: 1.2px solid #6B4508; padding: 7px 6px; font-size: 11.5px; }
.invoice-doc .items td { border: 1.2px solid #6B4508; padding: 6px; }
.invoice-doc .items tr { page-break-inside: avoid; break-inside: avoid; }
.invoice-doc .c { text-align: center; }
.invoice-doc .r { text-align: right; white-space: nowrap; }
.invoice-doc .totals { width: auto; margin: 10px 0 0 auto; border: 1.2px solid #6B4508; border-radius: 10px; border-collapse: separate; border-spacing: 0; overflow: hidden; }
.invoice-doc .totals td { padding: 5px 14px; font-weight: 600; }
.invoice-doc .totals .val { text-align: right; min-width: 120px; }
.invoice-doc .totals tr.grand td { background: #5C3A11; color: #fff; font-size: 15px; font-weight: 700; padding: 8px 14px; }
.invoice-doc .words { margin: 12px 0 4px; }
.invoice-doc .note { font-size: 11.5px; color: #333; margin: 10px 0 0; padding-bottom: 10px; border-bottom: 2px solid #5C3A11; }
.invoice-doc .signs { margin-top: 26px; page-break-inside: avoid; break-inside: avoid; }
.invoice-doc .sign-cell { position: relative; }
.invoice-doc .sign-line { position: relative; height: 70px; border-bottom: 1px solid #161616; margin: 0 0 3px; }
.invoice-doc .inv-sig { position: absolute; left: 10px; bottom: 3px; height: 58px; max-width: 190px; object-fit: contain; }
.invoice-doc .inv-stamp { position: absolute; right: 0; bottom: 0; width: 112px; height: 112px; object-fit: contain; opacity: .9; }
.invoice-doc .sign-line.with-stamp { height: 118px; }
.invoice-doc .hint { font-size: 10.5px; color: #555; }
</style>

<div class="sec-title">Реквизиты для оплаты</div>
<div class="bank">
<div class="bank-head">Получатель платежа</div>
<table>
<tr><td class="k">Получатель</td><td class="v">${esc(sellerName)}</td></tr>
<tr><td class="k">ИНН${isLegal ? " / КПП" : ""}</td><td class="v">${esc(c.inn)}${isLegal && c.kpp ? ` / ${esc(c.kpp)}` : ""}</td></tr>
<tr class="main"><td class="k">Расчётный счёт (р/с)</td><td class="v acc">${acc(c.account_number)}</td></tr>
<tr><td class="k">Банк получателя</td><td class="v">${esc(c.bank_name)}</td></tr>
<tr><td class="k">БИК банка</td><td class="v acc">${esc(c.bik)}</td></tr>
<tr><td class="k">Корреспондентский счёт (к/с)</td><td class="v acc">${acc(c.correspondent_account)}</td></tr>
</table>
</div>

<div class="title">
  <h1>Счёт на оплату № ${esc(inv.invoice_number)} от ${dateRu(inv.invoice_date)}</h1>
  ${inv.due_date ? `<div class="due">Оплатить до<br/><b>${dateRu(inv.due_date)}</b></div>` : ""}
</div>

<div class="parties">
  <div class="party"><div class="card"><div class="card-head">Поставщик (Исполнитель)</div><table>${sellerRows}</table></div></div>
  <div class="party"><div class="card"><div class="card-head">Покупатель (Заказчик)</div><table>${buyerRows}</table></div></div>
</div>
${purpose ? `<div class="basis"><b>Основание:</b> ${esc(purpose)}</div>` : ""}

<table class="items">
<thead><tr>
  <th style="width:5%">№</th><th>Товары (работы, услуги)</th><th style="width:9%">Кол-во</th>
  <th style="width:8%">Ед.</th><th style="width:15%">Цена, ₽</th><th style="width:16%">Сумма, ₽</th>
</tr></thead>
<tbody>${rows}</tbody>
</table>

<table class="totals">
<tr><td class="lbl">Итого:</td><td class="val">${money(sum)}</td></tr>
${vatLine}
<tr class="grand"><td class="lbl">Всего к оплате:</td><td class="val">${money(total)} ₽</td></tr>
</table>

<div class="words">Всего наименований ${(inv.items || []).length}, на сумму ${money(total)} руб.<br/>
<b>${esc(capitalize(moneyInWords(Math.floor(total))))} ${kopecks(total)} ${kopWord(Number(kopecks(total)))}</b></div>
<div class="note">
В назначении платежа укажите: «Оплата по счёту № ${esc(inv.invoice_number)} от ${dateRu(inv.invoice_date)}».
${inv.notes ? `<br/>${esc(inv.notes).replace(/\n/g, "<br/>")}` : ""}
</div>

<table class="signs"><tr>
<td class="sign-cell" style="width:60%;padding-right:24px">
  <div style="font-weight:700;margin-bottom:4px">${esc(signer.role)}</div>
  <div class="sign-line${stamp ? " with-stamp" : ""}">${sig}${stamp}</div>
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
