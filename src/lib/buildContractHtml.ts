import { ObjectItem, Estimate, CompanyData, ContractOptions } from "@/lib/api"
import { moneyInWords, monthsWordsRu } from "@/lib/numberToWordsRu"

export interface ContractContext {
  object: ObjectItem
  company: CompanyData | null
  estimate: Estimate | null
  options: Required<ContractOptions>
  contractNumber: string
  contractDate: string
}

const esc = (v: unknown) => (v == null ? "" : String(v))

const formatDate = (d: string) => {
  if (!d) return ""
  const date = new Date(d)
  if (isNaN(date.getTime())) return d
  return date.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })
}

const g = (opts: Required<ContractOptions>, kind: "customer" | "contractor") => {
  const gender = kind === "customer" ? opts.customer_gender : opts.contractor_gender
  return gender === "f" ? "ая" : "ий"
}

const STAGED_DETAIL = `
<p>1.4.1. Этап 1 — Подготовительные и черновые работы: демонтаж (проёмы, частичный разбор), возведение перегородок, грунтовка поверхностей, штукатурка стен, стяжка пола, частичное выполнение инженерных и электромонтажных работ.</p>
<p>1.4.2. Этап 2 — Санузел и ванная: гидроизоляция (пол и стены), укладка плитки (пол и стены), монтаж сантехнических коммуникаций, установка сантехнического оборудования, электромонтажные работы в санузле, монтаж вентиляции.</p>
<p>1.4.3. Этап 3 — Подготовка и инженерия: шпатлёвка стен, армирование, выравнивание, шлифовка стен, повторная грунтовка, подготовка стен под обои/покраску, завершение электромонтажных и сантехнических работ, подготовка полов под финишное покрытие.</p>
<p>1.4.4. Этап 4 — Финишные работы: укладка напольных покрытий, затирка швов плитки, поклейка обоев / покраска, монтаж натяжных потолков, установка дверей, чистовой сантехники, розеток, выключателей, светильников, плинтусов и декоративных элементов.</p>
`.trim()

function customerIntro(ctx: ContractContext): string {
  const { options: o, object } = ctx
  const customerName = o.customer_name || object.client_name || ""
  if (o.customer_type === "individual") {
    return `${esc(customerName)}, действующ${g(o, "customer")} как физическое лицо (далее — «Заказчик»), с одной стороны, и`
  }
  if (o.customer_type === "entrepreneur") {
    const suffix = o.customer_gender === "f" ? "ная" : "ный"
    return `Индивидуальный предприниматель ${esc(customerName)}, зарегистрирован${suffix} в реестре индивидуальных предпринимателей под № ${esc(o.customer_ogrnip) || "____________"} (далее — «Заказчик»), с одной стороны, и`
  }
  const org = o.customer_org_name || customerName
  return `${esc(org)}, именуемое в дальнейшем «Заказчик», от имени которого действует ${esc(o.customer_director_position) || "генеральный директор"} ${esc(o.customer_director_name) || esc(customerName)} на основании ${esc(o.customer_basis) || "Устава"}, с одной стороны, и`
}

function contractorIntro(ctx: ContractContext): string {
  const { options: o } = ctx
  const name = ctx.company?.name || ctx.company?.contact_full_name || o.contractor_name || ""
  const gg = g(o, "contractor")

  if (o.contractor_type === "individual") {
    return `${esc(name)}, действующ${gg} как физическое лицо (далее — «Подрядчик»), с другой стороны,`
  }
  if (o.contractor_type === "self_employed") {
    return `${esc(name)}, действующ${gg} как физическое лицо с применением налогового режима «налог на профессиональный доход» (далее — «Подрядчик»), с другой стороны,`
  }
  if (o.contractor_type === "foreign_citizen") {
    const citizen = o.contractor_gender === "f" ? "гражданка" : "гражданин"
    return `${esc(name)}, ${citizen} ${esc(o.contractor_country) || "____________"}, основанием пребывания на территории Российской Федерации является ${esc(o.contractor_residence_basis) || "____________"}, наличие разрешения на работу подтверждается ${esc(o.contractor_work_permit) || "____________"}, действующ${gg} как физическое лицо (далее — «Подрядчик»), с другой стороны,`
  }
  if (o.contractor_type === "entrepreneur") {
    const suffix = o.contractor_gender === "f" ? "ная" : "ный"
    return `Индивидуальный предприниматель ${esc(name)}, зарегистрирован${suffix} в реестре индивидуальных предпринимателей под № ${esc(o.contractor_ogrnip) || "____________"} (далее — «Подрядчик»), с другой стороны,`
  }
  const org = o.contractor_org_name || name
  return `${esc(org)}, именуемое в дальнейшем «Подрядчик», от имени которого действует ${esc(o.contractor_director_position) || "Директор"} ${esc(o.contractor_director_name) || esc(name)} на основании ${esc(o.contractor_basis) || "Устава"}, с другой стороны,`
}

function partyIntro(ctx: ContractContext): string {
  return `<p>${customerIntro(ctx)} ${contractorIntro(ctx)} вместе именуемые «Стороны», а индивидуально — «Сторона», заключили настоящий договор подряда на ремонт квартиры (далее — «Договор») о нижеследующем:</p>`
}

export function buildContractHtml(ctx: ContractContext): string {
  const { options: o, object, estimate } = ctx
  const total = estimate?.total_amount ?? 0
  const address = o.object_address || object.address || ""

  const designHtml =
    o.design_project === "with_project"
      ? `<p>Работы выполняются в соответствии с дизайн-проектом, разработанным ${esc(o.design_author) || "____________"} и согласованным Сторонами, который является неотъемлемой частью настоящего Договора (Приложение №2).</p>`
      : ""

  const customStages = esc(o.custom_stages_text).trim()
  const workOrderHtml =
    o.work_order === "staged"
      ? `<p>1.4. Работы выполняются поэтапно в соответствии со следующим графиком:</p>\n${STAGED_DETAIL}`
      : o.work_order === "single"
      ? "<p>1.4. Работы выполняются единым комплексом без разбивки на отдельные этапы. Промежуточные сроки и объёмы определяются Сметой (Приложение №1).</p>"
      : `<p>1.4. Состав и порядок этапов работ:</p><p>${customStages || "____________"}</p>`

  const subHtml =
    o.subcontractors === "allowed"
      ? "<p>1.5. Подрядчик вправе привлекать субподрядчиков для выполнения отдельных видов Работ, оставаясь ответственным перед Заказчиком за результат их деятельности.</p>"
      : "<p>1.5. Подрядчик выполняет Работы лично, без привлечения субподрядчиков.</p>"

  const workStart = {
    advance_and_handover:
      "с момента выполнения Заказчиком двух условий: внесения аванса, предусмотренного п. 3.2.1 настоящего Договора, и передачи Подрядчику ключей от Объекта с подписанием Сторонами Акта приёма-передачи Объекта в ремонт",
    advance_only: "с момента внесения Заказчиком аванса, предусмотренного п. 3.2.1 настоящего Договора",
    signing: "с момента подписания настоящего Договора обеими Сторонами",
  }[o.work_start]

  const durationNum = Number(o.duration_months) || 6
  const fixedAmount = o.fixed_amount ? Number(o.fixed_amount) || 0 : total
  const scheduleBase = o.cost_type === "fixed" ? fixedAmount : total

  const formattedFixed = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(Math.round(fixedAmount))
  const costHtml =
    o.cost_type === "fixed"
      ? `<p>3.1. Общая стоимость Работ по настоящему Договору составляет ${formattedFixed} рублей (${moneyInWords(fixedAmount)}) и является твёрдой и окончательной.</p>`
      : "<p>3.1. Стоимость Работ определяется в соответствии со Сметой (Приложение №1) и может уточняться по соглашению Сторон при изменении объёмов Работ.</p>"

  const paymentOrder = {
    advance_staged: "<p>3.2. Оплата производится Заказчиком поэтапно, в соответствии с Актами сдачи-приёмки выполненных Работ.</p>",
    full_prepayment: "<p>3.2. Оплата производится Заказчиком в размере 100% стоимости Работ до начала их выполнения.</p>",
    on_completion: "<p>3.2. Оплата производится Заказчиком по факту выполнения и приёмки Работ в полном объёме.</p>",
  }[o.payment_order]

  const scheduleMap: Record<string, [string, number, string][]> = {
    advance_4_stages: [
      ["Аванс", 25, "до начала выполнения Работ"],
      ["Этап 1", 25, "по завершении чернового этапа"],
      ["Этап 2", 25, "по завершении инженерного этапа"],
      ["Этап 3", 25, "по завершении финишных работ и подписания Акта сдачи-приёмки"],
    ],
    advance_3_stages: [
      ["Аванс", 30, "до начала выполнения Работ"],
      ["Этап 1", 40, "по завершении чернового и инженерного этапов"],
      ["Этап 2", 30, "по завершении финишных работ и подписания Акта сдачи-приёмки"],
    ],
    advance_2_stages: [
      ["Аванс", 50, "до начала выполнения Работ"],
      ["Этап 1", 50, "по завершении Работ и подписания Акта сдачи-приёмки"],
    ],
  }
  const fmt = (n: number) => new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(Math.round(n))
  let scheduleHtml = ""
  if (o.payment_order === "advance_staged") {
    if (o.payment_schedule === "custom_schedule") {
      const stages = o.custom_stages || []
      scheduleHtml = stages.length
        ? stages
            .map((s, i) => {
              const amountNum = Number(s.amount) || 0
              return `<p>3.2.${i + 1}. ${s.label} — ${fmt(amountNum)} рублей (${moneyInWords(amountNum)}). Оплачивается Заказчиком ${s.when}.</p>`
            })
            .join("")
        : "<p>3.2.1. График платежей определяется индивидуальным соглашением Сторон (Приложение №4).</p>"
    } else {
      const schedule = scheduleMap[o.payment_schedule] || scheduleMap.advance_4_stages
      scheduleHtml = schedule
        .map(([label, , when], i) => {
          const manual = o.schedule_amounts?.[i]
          const pctFromMap = scheduleMap[o.payment_schedule]?.[i]?.[1] ?? 0
          const amountNum = manual ? Number(manual) || 0 : (scheduleBase * pctFromMap) / 100
          return `<p>3.2.${i + 1}. ${label} — ${fmt(amountNum)} рублей (${moneyInWords(amountNum)}). Оплачивается Заказчиком ${when}.</p>`
        })
        .join("")
    }
  }

  const paymentDays = o.payment_days || "5"
  const daysKindLabel = (k?: string) => (k === "calendar" ? "календарных дней" : "рабочих дней")
  const paymentDaysKind = daysKindLabel(o.payment_days_kind)
  const acceptanceDays = o.acceptance_days || "3"
  const acceptanceDaysKind = daysKindLabel(o.acceptance_days_kind)
  const paymentMethod = {
    cash_or_bank: "наличные денежные средства или безналичный перевод на расчётный счёт Подрядчика",
    bank_only: "безналичный перевод на расчётный счёт Подрядчика",
    cash_only: "наличные денежные средства",
  }[o.payment_method]

  const hiddenDefectsHtml =
    o.hidden_defects === "include"
      ? "<p>3.5. Стоимость Договора не учитывает скрытые дефекты Объекта, которые невозможно было обнаружить при первоначальном осмотре. При выявлении в процессе ремонта необходимости проведения дополнительных скрытых работ Подрядчик обязан приостановить работы и уведомить об этом Заказчика. Объём и стоимость таких работ оформляются Дополнительным соглашением.</p>"
      : ""

  const companyName = ctx.company?.name || ctx.company?.contact_full_name || o.contractor_name || ""

  return `
<div class="contract-doc">
<h2 style="text-align:center">Договор подряда на ремонт квартиры № ${esc(ctx.contractNumber)}</h2>
<p style="text-align:right">г. ${esc(o.city) || "________"}, ${formatDate(ctx.contractDate)}</p>

${partyIntro(ctx)}

<h3>1. Предмет договора</h3>
<p>1.1. Подрядчик обязуется по заданию Заказчика выполнить ремонтно-отделочные работы (далее — «Работы») в квартире по адресу: ${esc(address)} (далее — «Объект»), а Заказчик обязуется принять результат Работ и оплатить его.</p>
<p>1.2. Перечень, объёмы и стоимость Работ, а также график их выполнения определяются в Смете${estimate ? ` №${estimate.id}` : ""} (Приложение №1 — Смета/Техническое задание).</p>
${designHtml}
<p>1.3. Качество работ должно соответствовать действующим строительным нормам и правилам (СНиП), сводам правил (СП), государственным стандартам (ГОСТ) и техническим регламентам. При отсутствии конкретных требований качество определяется общепринятой практикой выполнения строительных и отделочных работ.</p>
${workOrderHtml}
${subHtml}

<h3>2. Сроки выполнения работ</h3>
<p>2.1. Общий срок выполнения Работ составляет ${monthsWordsRu(durationNum)}. Течение срока начинается ${workStart}.</p>
<p>2.2. В случае нарушения Заказчиком обязательств, препятствующих выполнению Работ (задержка предоставления материалов, непредоставление доступа на Объект, несвоевременное согласование скрытых работ, задержка оплаты этапов), Подрядчик вправе приостановить выполнение Работ.</p>
<p>2.3. При приостановке Работ по указанным причинам сроки соразмерно отодвигаются на всё время просрочки со стороны Заказчика. Подрядчик не несёт ответственности за нарушение общих сроков Договора в данном случае.</p>

<h3>3. Стоимость работ и порядок оплаты</h3>
${costHtml}
${paymentOrder}
${o.payment_order === "advance_staged" ? `<p><strong>3.2. График платежей:</strong></p>\n${scheduleHtml}` : ""}
<p>3.3. Оплата по каждому этапу производится в течение ${paymentDays} ${paymentDaysKind} с момента подписания Заказчиком соответствующего Акта сдачи-приёмки Работ.</p>
<p>3.4. Способ оплаты: ${paymentMethod}, указанный в разделе с реквизитами настоящего Договора.</p>
${hiddenDefectsHtml}

<h3>4. Права и обязанности сторон</h3>
<p>4.1. Подрядчик обязуется выполнить Работы качественно, в срок и передать результат Заказчику по Акту сдачи-приёмки.</p>
<p>4.2. Заказчик обязуется обеспечить доступ на Объект, своевременно принимать этапы Работ и производить оплату.</p>

<h3>5. Ответственность сторон</h3>
<p>5.1. За нарушение сроков по вине Подрядчика Заказчик вправе потребовать неустойку 0,1% от стоимости не выполненного в срок этапа за каждый день просрочки.</p>
<p>5.2. За нарушение сроков оплаты по вине Заказчика Подрядчик вправе потребовать неустойку 0,1% от неоплаченной суммы за каждый день просрочки.</p>

<h3>6. Гарантии</h3>
<p>6.1. Подрядчик предоставляет гарантию на выполненные Работы сроком 12 месяцев с момента подписания Акта сдачи-приёмки.</p>
<p>6.2. Гарантия не распространяется на дефекты, возникшие вследствие нормального износа, нарушения правил эксплуатации или вмешательства третьих лиц.</p>

<h3>7. Порядок приёмки работ</h3>
<p>7.1. По завершении этапа/всех Работ Подрядчик уведомляет Заказчика о готовности к сдаче. Заказчик в течение ${acceptanceDays} ${acceptanceDaysKind} принимает Работы либо предоставляет мотивированный отказ.</p>
<p>7.2. Приёмка оформляется двусторонним Актом сдачи-приёмки выполненных Работ.</p>

<h3>8. Форс-мажор и разрешение споров</h3>
<p>8.1. Стороны не несут ответственности за неисполнение обязательств вследствие обстоятельств непреодолимой силы.</p>
<p>8.2. Споры разрешаются путём переговоров, а при недостижении согласия — в судебном порядке по месту нахождения Объекта.</p>

<h3>9. Заключительные положения</h3>
<p>9.1. Договор вступает в силу с момента подписания обеими Сторонами и действует до полного исполнения обязательств.</p>
<p>9.2. Изменения и дополнения действительны при совершении в письменной форме.</p>
<p>9.3. Договор составлен в двух экземплярах, имеющих одинаковую юридическую силу.</p>

<h3>Реквизиты и подписи сторон</h3>
<table style="width:100%;margin-top:16px">
<tr>
<td style="width:50%;vertical-align:top;padding-right:16px">
<p><strong>ПОДРЯДЧИК</strong></p>
<p>${esc(companyName)}</p>
<p>ИНН: ${esc(ctx.company?.inn)}</p>
<p>Юр. адрес: ${esc(ctx.company?.legal_address)}</p>
<p>Банк: ${esc(ctx.company?.bank_name)}</p>
<p>БИК: ${esc(ctx.company?.bik)}</p>
<p>Р/с: ${esc(ctx.company?.account_number)}</p>
<p>К/с: ${esc(ctx.company?.correspondent_account)}</p>
<p style="margin-top:24px">Подпись: _______________</p>
</td>
<td style="width:50%;vertical-align:top;padding-left:16px">
<p><strong>ЗАКАЗЧИК</strong></p>
<p>${esc(o.customer_name || object.client_name)}</p>
<p>Объект: ${esc(address)}</p>
<p>Телефон: ${esc(object.client_phone)}</p>
<p>Email: ${esc(object.email)}</p>
<p style="margin-top:24px">Подпись: _______________</p>
</td>
</tr>
</table>
</div>
`.trim()
}