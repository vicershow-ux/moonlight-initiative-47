import { Link } from "react-router-dom"
import Icon from "@/components/ui/icon"
import { cn } from "@/lib/utils"
import { DeleteButton } from "@/components/ui/delete-button"
import { getStatusBadgeClass } from "@/lib/objectStatusColors"
import { Act, Contract, ObjectItem, ObjectStatus } from "@/lib/api"
import { formatMoney, formatDate } from "./constants"

interface ContractRowProps {
  c: Contract
  obj: ObjectItem | undefined
  objectStatuses: ObjectStatus[]
  downloadingContractId: number | null
  handlePrintContract: (contract: Contract) => void
  handleDownloadContractPdf: (contract: Contract) => void
  handleDeleteContract: (id: number) => void
}

export function DocumentContractRow({
  c,
  obj,
  objectStatuses,
  downloadingContractId,
  handlePrintContract,
  handleDownloadContractPdf,
  handleDeleteContract,
}: ContractRowProps) {
  return (
        <tr key={`contract-${c.id}`} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
          <td className="py-3 px-4">
            <span className="text-blue-400 font-medium text-xs">Договор</span>
          </td>
          <td className="py-3 px-4">
            <p className="font-medium">Договор подряда на ремонт квартиры</p>
            <p className="text-xs text-white/30">№ {c.contract_number}</p>
          </td>
          <td className="py-3 px-4 text-white/60">{formatDate(c.contract_date || c.created_at)}</td>
          <td className="py-3 px-4 text-white/60">
            {obj?.object_code || c.object_code || "—"}
          </td>
          <td className="py-3 px-4 text-white/60">{c.client_name || obj?.client_name || "—"}</td>
          <td className="py-3 px-4 font-medium">{formatMoney(c.total_amount)}</td>
          <td className="py-3 px-4">
            {obj?.status ? (
              <span className={cn(
                "px-2 py-0.5 rounded-full text-xs",
                getStatusBadgeClass(objectStatuses.find((s) => s.name === obj.status)?.color)
              )}>
                {obj.status}
              </span>
            ) : "—"}
          </td>
          <td className="py-3 px-4">
            <span className={cn(
              "px-2 py-0.5 rounded-full text-xs",
              c.status === "signed" ? "bg-green-500/20 text-green-300" : "bg-white/10 text-white/50"
            )}>
              {c.status === "signed" ? "подписан" : "черновик"}
            </span>
          </td>
          <td className="py-3 px-4">
            <div className="flex items-center gap-3">
              <Link
                to={`/cabinet/objects/${c.object_id}/contracts/${c.id}`}
                className="text-white/40 hover:text-[#D4AF37] transition-colors"
                title="Просмотр"
              >
                <Icon name="Eye" size={15} />
              </Link>
              <Link
                to={`/cabinet/objects/${c.object_id}/contracts/${c.id}/edit`}
                className="text-white/40 hover:text-white transition-colors"
                title="Редактировать"
              >
                <Icon name="Pencil" size={15} />
              </Link>
              <button
                onClick={() => handlePrintContract(c)}
                className="text-white/40 hover:text-white transition-colors"
                title="Печать"
              >
                <Icon name="Printer" size={15} />
              </button>
              <button
                onClick={() => handleDownloadContractPdf(c)}
                className="text-white/40 hover:text-white transition-colors"
                title="Скачать PDF"
              >
                {downloadingContractId === c.id ? (
                  <Icon name="Loader2" size={15} className="animate-spin" />
                ) : (
                  <Icon name="Download" size={15} />
                )}
              </button>
              <DeleteButton onConfirm={() => handleDeleteContract(c.id)} />
            </div>
          </td>
        </tr>
  )
}

interface ActRowProps {
  a: Act
  obj: ObjectItem | undefined
  objectStatuses: ObjectStatus[]
  downloadingContractId: number | null
  handlePrintAct: (act: Act) => void
  handleDownloadActPdf: (act: Act) => void
  handleDeleteAct: (id: number) => void
}

export function DocumentActRow({
  a,
  obj,
  objectStatuses,
  downloadingContractId,
  handlePrintAct,
  handleDownloadActPdf,
  handleDeleteAct,
}: ActRowProps) {
  return (
        <tr key={`act-${a.id}`} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
          <td className="py-3 px-4">
            <span className="text-purple-400 font-medium text-xs">Акт</span>
          </td>
          <td className="py-3 px-4">
            <p className="font-medium">Акт выполненных работ</p>
            <p className="text-xs text-white/30">№ {a.act_number}</p>
          </td>
          <td className="py-3 px-4 text-white/60">{formatDate(a.act_date || a.created_at)}</td>
          <td className="py-3 px-4 text-white/60">{obj?.object_code || a.object_code || "—"}</td>
          <td className="py-3 px-4 text-white/60">{a.client_name || obj?.client_name || "—"}</td>
          <td className="py-3 px-4 font-medium">{formatMoney(a.total_amount)}</td>
          <td className="py-3 px-4">
            {obj?.status ? (
              <span className={cn(
                "px-2 py-0.5 rounded-full text-xs",
                getStatusBadgeClass(objectStatuses.find((s) => s.name === obj.status)?.color)
              )}>
                {obj.status}
              </span>
            ) : "—"}
          </td>
          <td className="py-3 px-4">
            <span className={cn(
              "px-2 py-0.5 rounded-full text-xs",
              a.status === "signed" ? "bg-green-500/20 text-green-300" : "bg-white/10 text-white/50"
            )}>
              {a.status === "signed" ? "подписан" : "черновик"}
            </span>
          </td>
          <td className="py-3 px-4">
            <div className="flex items-center gap-3">
              <Link
                to={`/cabinet/objects/${a.object_id}/acts/${a.id}`}
                className="text-white/40 hover:text-[#D4AF37] transition-colors"
                title="Просмотр"
              >
                <Icon name="Eye" size={15} />
              </Link>
              <Link
                to={`/cabinet/objects/${a.object_id}/acts/${a.id}/edit`}
                className="text-white/40 hover:text-white transition-colors"
                title="Редактировать"
              >
                <Icon name="Pencil" size={15} />
              </Link>
              <button
                onClick={() => handlePrintAct(a)}
                className="text-white/40 hover:text-white transition-colors"
                title="Печать"
              >
                <Icon name="Printer" size={15} />
              </button>
              <button
                onClick={() => handleDownloadActPdf(a)}
                className="text-white/40 hover:text-white transition-colors"
                title="Скачать PDF"
              >
                {downloadingContractId === -a.id ? (
                  <Icon name="Loader2" size={15} className="animate-spin" />
                ) : (
                  <Icon name="Download" size={15} />
                )}
              </button>
              <DeleteButton onConfirm={() => handleDeleteAct(a.id)} />
            </div>
          </td>
        </tr>
  )
}
