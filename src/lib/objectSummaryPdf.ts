import { renderPagedPdf } from "@/lib/pdfRender"
import { docBrandHeader, docBrandStyles } from "@/lib/docBrandHeader"
import { ObjectSummary } from "@/lib/executorsApi"

const esc = (v: unknown) =>
  String(v ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] as string)
const money = (n: number) => new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(n) + " ₽"
const qty = (n: number) => new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(n)
const date = (d: string) => (d ? new Date(d).toLocaleDateString("ru-RU") : "")

const TH = "background:#5C3A11;color:#fff;padding:6px 8px;font-size:11.5px;text-align:left;border:1px solid #6B4508"
const TD = "padding:6px 8px;font-size:12px;border:1px solid #D9C9A8"
const R = "text-align:right;white-space:nowrap"

function table(head: string[], rows: string[][], foot?: string[]) {
  if (!rows.length) return `<p style="color:#777;font-size:12px;margin:4px 0 14px">Нет данных</p>`
  const th = head.map((h, i) => `<th style="${TH};${i ? R : ""}">${h}</th>`).join("")
  const tr = rows
    .map((r, k) => `<tr style="background:${k % 2 ? "#F6F0E4" : "#fff"}">${r.map((c, i) => `<td style="${TD};${i ? R : ""}">${c}</td>`).join("")}</tr>`)
    .join("")
  const tf = foot
    ? `<tr style="background:#E8DCC4;font-weight:700">${foot.map((c, i) => `<td style="${TD};${i ? R : ""}">${c}</td>`).join("")}</tr>`
    : ""
  return `<table style="width:100%;border-collapse:collapse;margin:4px 0 16px">${th ? `<thead><tr>${th}</tr></thead>` : ""}<tbody>${tr}${tf}</tbody></table>`
}

export function buildObjectSummaryHtml(s: ObjectSummary): string {
  const t = s.totals
  const h3 = (x: string) => `<h3 style="font-size:14px;margin:18px 0 6px;color:#4A2E06">${x}</h3>`
  const kpi = (label: string, value: string, color = "#161616") =>
    `<td style="width:25%;padding:8px 10px;border:1px solid #D9C9A8;vertical-align:top"><div style="font-size:10.5px;color:#6b5a3e">${label}</div><div style="font-size:15px;font-weight:700;color:${color}">${value}</div></td>`

  return `
<h2 style="text-align:center;font-size:18px;margin:0 0 4px">Сводка расходов по объекту ${esc(s.object.object_code)}</h2>
<p style="text-align:center;color:#555;font-size:12px;margin:0 0 14px">${esc(s.object.address)}${s.object.client_name ? ` · заказчик ${esc(s.object.client_name)}` : ""} · на ${new Date().toLocaleDateString("ru-RU")}</p>

<table style="width:100%;border-collapse:collapse;margin-bottom:8px"><tr>
${kpi("Сумма договоров", money(s.income.contracted))}
${kpi("Получено от заказчика", money(s.income.received), "#15803d")}
${kpi("Расходы всего", money(t.costs), "#b91c1c")}
${kpi("Прибыль (по факту)", money(t.profit), t.profit >= 0 ? "#15803d" : "#b91c1c")}
</tr></table>

${h3(`Оплаты исполнителям — ${money(t.executors_paid)}`)}
${table(
  ["Исполнитель / договор", "По договору", "Оплачено", "Долг"],
  s.executors.map((e) => [
    `${esc(e.name)}<br/><span style="color:#777;font-size:11px">№ ${esc(e.contract_number)} от ${date(e.contract_date)}${e.work_subject ? ` · ${esc(e.work_subject)}` : ""}</span>`,
    money(e.total),
    money(e.paid),
    money(Math.max(0, e.total - e.paid)),
  ]),
  s.executors.length ? ["Итого", money(t.executors_total), money(t.executors_paid), money(t.executors_debt)] : undefined
)}

${h3(`Закупки по чекам — ${money(t.receipts)}`)}
${table(
  ["Магазин", "Чеков", "Сумма"],
  s.receipts.map((r) => [esc(r.shop), String(r.count), money(r.amount)]),
  s.receipts.length ? ["Итого", String(s.receipts.reduce((a, r) => a + r.count, 0)), money(t.receipts)] : undefined
)}

${h3(`Материалы по объекту — ${money(t.materials)}`)}
${table(
  ["Материал", "Кол-во", "Цена", "Сумма"],
  s.materials.map((m) => [esc(m.name), `${qty(m.qty)} ${esc(m.unit)}`, money(m.price), money(m.sum)]),
  s.materials.length ? ["Итого", "", "", money(t.materials)] : undefined
)}

${s.other.length ? h3(`Прочие расходы — ${money(t.other)}`) + table(["Статья", "Записей", "Сумма"], s.other.map((o) => [esc(o.label), String(o.count), money(o.amount)]), ["Итого", "", money(t.other)]) : ""}

${h3("Итог")}
${table(
  ["", "Сумма"],
  [
    ["Получено от заказчика", money(s.income.received)],
    ["Оплаты исполнителям", `− ${money(t.executors_paid)}`],
    ["Закупки по чекам", `− ${money(t.receipts)}`],
    ["Материалы", `− ${money(t.materials)}`],
    ...(t.other ? [["Прочие расходы", `− ${money(t.other)}`]] : []),
  ],
  ["Прибыль по факту", money(t.profit)]
)}
<p style="font-size:11.5px;color:#555;margin:0">Плановая прибыль с учётом долга исполнителям (${money(t.executors_debt)}): <b>${money(t.planned_profit)}</b>.${s.income.outstanding ? ` Ожидается оплат от заказчика по выставленным счетам: ${money(s.income.outstanding)}.` : ""}</p>
`.trim()
}

export async function downloadObjectSummaryPdf(s: ObjectSummary) {
  await renderPagedPdf(
    (root) => {
      root.style.color = "#161616"
      root.style.fontFamily = "Arial, sans-serif"
      root.style.fontSize = "13px"
      root.style.lineHeight = "1.45"
      root.innerHTML = `<style>${docBrandStyles}</style>${docBrandHeader("Сводка расходов")}${buildObjectSummaryHtml(s)}`
    },
    { filename: `Сводка ${s.object.object_code}.pdf`, mode: "save" }
  )
}
