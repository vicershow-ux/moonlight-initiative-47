import { CompanyData, Rental, RentalCounterparty } from "@/lib/api"
import { moneyInWords } from "@/lib/numberToWordsRu"
import { PERIOD_LABEL, num, periodsCount, rentalTotal } from "@/lib/rental"

export interface RentalContractOptions {
  city?: string
  contract_number?: string
  contract_date?: string
  purpose?: string
  delivery?: "self_pickup" | "by_lessor"
  penalty_pct?: string
  claim_days?: string
  copies_total?: string
  extra_terms?: string
}

export interface RentalContractContext {
  rental: Rental
  counterparty: RentalCounterparty | null
  company: CompanyData | null
  options: RentalContractOptions
}

const esc = (v: unknown) => (v == null ? "" : String(v))

const row = (label: string, value: unknown) => {
  const val = esc(value).trim()
  return val ? `<p>${label}: ${val}</p>` : ""
}

const fmtDate = (d: string | null | undefined) => {
  if (!d) return "____________"
  const date = new Date(d)
  if (isNaN(date.getTime())) return esc(d)
  return date.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })
}

const fmt = (n: number) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(Math.round(n || 0))

function partyBlock(cp: RentalCounterparty | null): string {
  if (!cp) return "<p>____________</p>"

  if (cp.party_kind === "legal") {
    return [
      row("", cp.org_name || cp.display_name),
      row("ИНН", cp.inn),
      row("КПП", cp.kpp),
      row("ОГРН", cp.ogrn),
      row("Юр. адрес", cp.legal_address),
      row("Банк", cp.bank_name),
      row("БИК", cp.bik),
      row("Р/с", cp.account_number),
      row("К/с", cp.correspondent_account),
      row("Тел.", cp.phone),
      row("Email", cp.email),
    ].join("")
  }

  if (cp.party_kind === "entrepreneur") {
    return [
      row("", `ИП ${cp.org_name || cp.full_name || cp.display_name}`),
      row("ИНН", cp.inn),
      row("ОГРНИП", cp.ogrn),
      row("Адрес", cp.legal_address || cp.registration_address),
      row("Банк", cp.bank_name),
      row("БИК", cp.bik),
      row("Р/с", cp.account_number),
      row("Тел.", cp.phone),
      row("Email", cp.email),
    ].join("")
  }

  const passport = [cp.passport_series, cp.passport_number].filter(Boolean).join(" ")
  return [
    row("", cp.full_name || cp.display_name),
    row("Паспорт", passport),
    row("Выдан", cp.passport_issued_by),
    cp.passport_issued_date ? row("Дата выдачи", fmtDate(cp.passport_issued_date)) : "",
    row("Код подразделения", cp.passport_department_code),
    cp.birth_date ? row("Дата рождения", fmtDate(cp.birth_date)) : "",
    row("Адрес регистрации", cp.registration_address),
    row("Тел.", cp.phone),
    row("Email", cp.email),
  ].join("")
}

function partyIntro(cp: RentalCounterparty | null): string {
  if (!cp) return "____________ (далее — «Арендатор»)"

  if (cp.party_kind === "legal") {
    const org = cp.org_name || cp.display_name
    const post = cp.director_position || "генеральный директор"
    const dir = cp.director_name || ""
    const basis = cp.acts_basis || "Устава"
    return `${esc(org)}, именуемое в дальнейшем «Арендатор», от имени которого действует ${esc(post)} ${esc(dir)} на основании ${esc(basis)}`
  }

  if (cp.party_kind === "entrepreneur") {
    const name = cp.full_name || cp.org_name || cp.display_name
    return `Индивидуальный предприниматель ${esc(name)}, ОГРНИП ${esc(cp.ogrn) || "____________"}, именуемый в дальнейшем «Арендатор»`
  }

  const name = cp.full_name || cp.display_name
  const passport = [cp.passport_series, cp.passport_number].filter(Boolean).join(" ")
  return `${esc(name)}, паспорт ${esc(passport) || "____________"}, выдан ${esc(cp.passport_issued_by) || "____________"}, зарегистрированный по адресу: ${esc(cp.registration_address) || "____________"}, именуемый в дальнейшем «Арендатор»`
}

export function buildRentalContractHtml(ctx: RentalContractContext): string {
  const { rental, counterparty, company, options: o } = ctx

  const isOut = rental.direction === "out"
  const lessorName = company?.name || company?.contact_full_name || "____________"
  const periodLabel = PERIOD_LABEL[rental.rate_period] || "сутки"
  const periods = periodsCount(rental)
  const total = rentalTotal(rental)
  const rate = num(rental.rate)
  const qty = num(rental.qty)
  const deposit = num(rental.deposit)

  const lessorIntro = isOut
    ? `${esc(lessorName)}, именуемое в дальнейшем «Арендодатель», с одной стороны, и ${partyIntro(counterparty)}, с другой стороны,`
    : `${partyIntro(counterparty).replace(/«Арендатор»/g, "«Арендодатель»")}, с одной стороны, и ${esc(lessorName)}, именуемое в дальнейшем «Арендатор», с другой стороны,`

  const penaltyPct = o.penalty_pct || "0,5"
  const claimDays = o.claim_days || "10"
  const copiesTotal = o.copies_total || "двух"

  const deliveryText =
    o.delivery === "by_lessor"
      ? "Передача и возврат Имущества осуществляются силами и за счёт Арендодателя по адресу, согласованному Сторонами."
      : "Получение и возврат Имущества осуществляются Арендатором самостоятельно по адресу Арендодателя."

  const depositHtml = deposit
    ? `<p>3.4. В обеспечение исполнения обязательств Арендатор вносит обеспечительный платёж (залог) в размере ${fmt(deposit)} рублей (${moneyInWords(deposit)}). Залог возвращается Арендатору в течение 3 (трёх) рабочих дней с момента возврата Имущества в исправном состоянии, за вычетом сумм задолженности и стоимости устранения повреждений при их наличии.</p>`
    : ""

  const conditionHtml = rental.condition_note
    ? `<p>2.3. Состояние Имущества на момент передачи: ${esc(rental.condition_note)}.</p>`
    : ""

  const extraHtml = o.extra_terms
    ? `<h3>10. Дополнительные условия</h3><p>${esc(o.extra_terms).replace(/\n/g, "</p><p>")}</p>`
    : ""

  const periodEnd = rental.date_to
    ? `по ${fmtDate(rental.date_to)} включительно`
    : "до момента возврата Имущества Арендодателю"

  return `
<div class="contract-doc">
<h2 style="text-align:center">Договор аренды оборудования № ${esc(o.contract_number) || esc(rental.rental_number)}</h2>
<p style="text-align:right">г. ${esc(o.city) || "________"}, ${fmtDate(o.contract_date)}</p>

<p>${lessorIntro} вместе именуемые «Стороны», заключили настоящий договор (далее — «Договор») о нижеследующем:</p>

<h3>1. Предмет договора</h3>
<p>1.1. Арендодатель обязуется предоставить Арендатору во временное владение и пользование за плату следующее имущество (далее — «Имущество»):</p>
<p>1.1.1. ${esc(rental.item_name)} — ${qty} ${esc(rental.unit)}.</p>
<p>1.2. Имущество передаётся для использования по прямому назначению${o.purpose ? `: ${esc(o.purpose)}` : ""}.</p>
<p>1.3. Имущество принадлежит Арендодателю на праве собственности, не заложено, не арестовано и не является предметом требований третьих лиц.</p>

<h3>2. Передача имущества</h3>
<p>2.1. Имущество передаётся Арендатору ${fmtDate(rental.date_from)} и подлежит возврату ${periodEnd}.</p>
<p>2.2. ${deliveryText}</p>
${conditionHtml}
<p>2.4. Передача и возврат Имущества оформляются актом приёма-передачи, подписываемым обеими Сторонами. Подписание Сторонами настоящего Договора подтверждает факт передачи Имущества в исправном состоянии.</p>

<h3>3. Арендная плата и порядок расчётов</h3>
<p>3.1. Арендная плата составляет ${fmt(rate)} рублей (${moneyInWords(rate)}) за ${periodLabel} за единицу Имущества.</p>
<p>3.2. Расчётный период аренды составляет ${periods} ${rental.rate_period === "day" ? "сут." : rental.rate_period === "week" ? "нед." : "мес."}, общая сумма арендной платы — ${fmt(total)} рублей (${moneyInWords(total)}).</p>
<p>3.3. Оплата производится наличными денежными средствами либо безналичным переводом на расчётный счёт Арендодателя. Неполный расчётный период оплачивается как полный.</p>
${depositHtml}

<h3>4. Права и обязанности сторон</h3>
<p>4.1. Арендатор обязан использовать Имущество исключительно по прямому назначению и в соответствии с правилами его эксплуатации и техники безопасности.</p>
<p>4.2. Арендатор обязан поддерживать Имущество в исправном состоянии, нести расходы на его содержание и обеспечивать сохранность в течение всего срока аренды.</p>
<p>4.3. Арендатор не вправе передавать Имущество третьим лицам, сдавать в субаренду, передавать в залог или иным образом им распоряжаться без письменного согласия Арендодателя.</p>
<p>4.4. Арендатор обязан вернуть Имущество в том состоянии, в котором он его получил, с учётом нормального износа.</p>
<p>4.5. Арендодатель обязан передать Имущество в состоянии, пригодном для использования по назначению, вместе со всеми принадлежностями и документами, если таковые необходимы.</p>
<p>4.6. Арендодатель вправе проверять состояние и условия эксплуатации Имущества, предварительно уведомив Арендатора.</p>

<h3>5. Ответственность сторон</h3>
<p>5.1. В случае повреждения Имущества по вине Арендатора он обязан возместить Арендодателю стоимость восстановительного ремонта, а при невозможности ремонта — полную стоимость Имущества.</p>
<p>5.2. В случае утраты или хищения Имущества Арендатор возмещает Арендодателю его полную стоимость в течение 5 (пяти) рабочих дней с момента предъявления требования.</p>
<p>5.3. За просрочку возврата Имущества Арендатор уплачивает неустойку в размере ${penaltyPct} % от суммы арендной платы за каждый день просрочки, а также арендную плату за фактическое время пользования.</p>
<p>5.4. За просрочку внесения арендной платы Арендатор уплачивает пени в размере ${penaltyPct} % от суммы задолженности за каждый день просрочки.</p>
<p>5.5. Риск случайной гибели или повреждения Имущества с момента его передачи и до момента возврата несёт Арендатор.</p>

<h3>6. Срок действия и расторжение</h3>
<p>6.1. Договор вступает в силу с момента подписания и действует до полного исполнения Сторонами своих обязательств.</p>
<p>6.2. Арендодатель вправе досрочно расторгнуть Договор в одностороннем порядке при использовании Имущества не по назначению, существенном ухудшении его состояния либо просрочке оплаты более 10 (десяти) календарных дней.</p>
<p>6.3. При досрочном расторжении Имущество подлежит возврату в течение 1 (одного) рабочего дня с момента получения соответствующего уведомления.</p>

<h3>7. Форс-мажор</h3>
<p>7.1. Стороны освобождаются от ответственности за неисполнение обязательств, если оно явилось следствием обстоятельств непреодолимой силы, возникших после заключения Договора.</p>

<h3>8. Разрешение споров</h3>
<p>8.1. Споры решаются путём переговоров с обязательным направлением письменной претензии. Срок рассмотрения претензии — ${claimDays} календарных дней.</p>
<p>8.2. При недостижении согласия спор передаётся на рассмотрение суда в соответствии с законодательством Российской Федерации.</p>

<h3>9. Заключительные положения</h3>
<p>9.1. Все изменения и дополнения к Договору действительны при оформлении в письменном виде и подписании обеими Сторонами.</p>
<p>9.2. Договор составлен в ${copiesTotal} экземплярах, имеющих равную юридическую силу, по одному для каждой из Сторон.</p>

${extraHtml}

<h3>${extraHtml ? "11" : "10"}. Реквизиты и подписи сторон</h3>
<table style="width:100%;margin-top:16px">
<tr>
<td style="width:50%;vertical-align:top;padding-right:16px">
<p><strong>АРЕНДОДАТЕЛЬ</strong></p>
${isOut
  ? [
      row("", lessorName),
      row("ИНН", company?.inn),
      row("Юр. адрес", company?.legal_address),
      row("Банк", company?.bank_name),
      row("БИК", company?.bik),
      row("Р/с", company?.account_number),
      row("К/с", company?.correspondent_account),
      row("Тел.", company?.phone),
      row("Email", company?.email),
    ].join("")
  : partyBlock(counterparty)}
</td>
<td style="width:50%;vertical-align:top;padding-left:16px">
<p><strong>АРЕНДАТОР</strong></p>
${isOut
  ? partyBlock(counterparty)
  : [
      row("", lessorName),
      row("ИНН", company?.inn),
      row("Юр. адрес", company?.legal_address),
      row("Тел.", company?.phone),
      row("Email", company?.email),
    ].join("")}
</td>
</tr>
<tr>
<td style="width:50%;vertical-align:bottom;padding:36px 16px 0 0">
<p style="margin-bottom:28px"><strong>ОТ ИМЕНИ АРЕНДОДАТЕЛЯ</strong></p>
<p style="border-top:1px solid #999;padding-top:4px;max-width:240px;margin:0">${isOut ? esc(company?.contact_full_name || lessorName) : esc(counterparty?.full_name || counterparty?.display_name || "")}</p>
<p style="font-size:11px;color:#666;margin:2px 0 0">(подпись, М.П.)</p>
</td>
<td style="width:50%;vertical-align:bottom;padding:36px 0 0 16px">
<p style="margin-bottom:28px"><strong>ОТ ИМЕНИ АРЕНДАТОРА</strong></p>
<p style="border-top:1px solid #999;padding-top:4px;max-width:240px;margin:0">${isOut ? esc(counterparty?.full_name || counterparty?.display_name || "") : esc(company?.contact_full_name || lessorName)}</p>
<p style="font-size:11px;color:#666;margin:2px 0 0">(подпись)</p>
</td>
</tr>
</table>
</div>
`.trim()
}
