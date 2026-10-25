import { ReactNode } from "react"
import { CompanyData, ContractOptions } from "@/lib/api"

interface HireRequisitesPreviewProps {
  options: Required<ContractOptions>
  company: CompanyData | null
}

const line = (label: string, value?: string | null) =>
  value ? (
    <p className="text-sm text-white/70">
      {label}: {value}
    </p>
  ) : null

function SignBox({ title, signer, overlay, padStamp }: { title: string; signer: string; overlay?: ReactNode; padStamp: boolean }) {
  return (
    <div className="mt-auto pt-10">
      <p className="text-xs uppercase tracking-wide text-white/50 mb-2">{title}</p>
      <div className="relative h-24 border-b border-white/30">{overlay}</div>
      <p className="mt-1 font-semibold text-white text-sm">{signer || "—"}</p>
      <p className="text-xs text-white/40">(подпись)</p>
      {padStamp && <div className="h-16" />}
    </div>
  )
}

/** Реквизиты и подписи, когда мы — Заказчик: справа наша компания с подписью и печатью, слева нанятый исполнитель */
export function HireRequisitesPreview({ options: o, company: c }: HireRequisitesPreviewProps) {
  const cType = o.contractor_type
  const contractorTitle =
    cType === "legal" ? o.contractor_org_name || o.contractor_name : cType === "entrepreneur" ? `ИП ${o.contractor_name}` : o.contractor_name
  const contractorSigner =
    cType === "legal" ? `${o.contractor_director_position || "Директор"} ${o.contractor_director_name}`.trim() : o.contractor_name
  const isPerson = cType === "individual" || cType === "self_employed" || cType === "foreign_citizen"

  const customerTitle =
    o.customer_type === "legal"
      ? o.customer_org_name || c?.name
      : o.customer_type === "entrepreneur"
        ? `ИП ${o.customer_name || c?.contact_full_name || ""}`
        : o.customer_name || c?.contact_full_name || c?.name
  const customerSigner =
    o.customer_type === "legal"
      ? `${o.customer_director_position || "Директор"} ${o.customer_director_name || c?.director_name || ""}`.trim()
      : o.customer_name || c?.contact_full_name || ""
  const customerOgrn = o.customer_type === "legal" ? o.customer_ogrn : o.customer_type === "entrepreneur" ? o.customer_ogrnip : ""
  const withStamp = Boolean(o.apply_stamp && c?.stamp_url)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-white/10 pt-4 items-stretch">
      <div className="md:border-r md:border-white/10 md:pr-6 flex flex-col">
        <p className="text-xs uppercase tracking-wide text-white/50 mb-2">Подрядчик (Исполнитель)</p>
        <p className="font-semibold text-white">{contractorTitle?.trim() || "—"}</p>
        {line(cType === "legal" ? "ОГРН" : "ОГРНИП", cType === "legal" || cType === "entrepreneur" ? o.contractor_ogrnip : "")}
        {line("ИНН", o.contractor_inn)}
        {isPerson && line("Паспорт", o.contractor_passport)}
        {line("Адрес", o.contractor_address)}
        {line("Тел.", o.contractor_phone)}
        {line("Email", o.contractor_email)}
        {line("Банк", o.contractor_bank_name)}
        {line("БИК", o.contractor_bik)}
        {line("Р/с", o.contractor_account)}
        {line("К/с", o.contractor_corr_account)}
        <SignBox title="От имени Подрядчика" signer={contractorSigner} padStamp={withStamp} />
      </div>
      <div className="flex flex-col">
        <p className="text-xs uppercase tracking-wide text-white/50 mb-2">Заказчик (ваша компания)</p>
        <p className="font-semibold text-white">{customerTitle || "—"}</p>
        {line(o.customer_type === "legal" ? "ОГРН" : "ОГРНИП", customerOgrn || (o.customer_type !== "individual" ? c?.ogrn : ""))}
        {line("ИНН", c?.inn)}
        {o.customer_type === "legal" && line("КПП", c?.kpp)}
        {line("Адрес", c?.legal_address)}
        {line("Тел.", c?.phone)}
        {line("Email", c?.email)}
        {line("Банк", c?.bank_name)}
        {line("БИК", c?.bik)}
        {line("Р/с", c?.account_number)}
        {line("К/с", c?.correspondent_account)}
        {line("Адрес объекта", o.object_address)}
        <SignBox
          title="От имени Заказчика"
          signer={customerSigner}
          padStamp={withStamp}
          overlay={
            <>
              {o.apply_signature && c?.signature_url && (
                <img src={c.signature_url} alt="Подпись" className="absolute bottom-1 left-2 h-16 max-w-[200px] rounded bg-white/90 object-contain" />
              )}
              {withStamp && (
                <img src={c?.stamp_url} alt="Печать" className="absolute right-0 top-[100px] z-10 h-28 w-28 object-contain opacity-90" />
              )}
            </>
          }
        />
      </div>
    </div>
  )
}

export default HireRequisitesPreview
