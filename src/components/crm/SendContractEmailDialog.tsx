import { Contract, contractsApi } from "@/lib/api"
import { contractPdfBase64 } from "@/lib/downloadContractPdf"
import { SendDocEmailDialog } from "@/components/crm/SendDocEmailDialog"

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  contract: Contract
  title: string
}

/** Отправка готового договора заказчику на почту — PDF во вложении */
export function SendContractEmailDialog({ open, onOpenChange, contract, title }: Props) {
  return (
    <SendDocEmailDialog
      open={open}
      onOpenChange={onOpenChange}
      docName="договор"
      objectId={contract.object_id}
      fileName={`Договор_${contract.contract_number}.pdf`}
      makePdf={() => contractPdfBase64(contract.content_html, contract.contract_number)}
      send={(p) => contractsApi.sendEmail(contract.id, { ...p, title })}
    />
  )
}

export default SendContractEmailDialog
