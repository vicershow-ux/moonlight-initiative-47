import { Link } from "react-router-dom"
import Icon from "@/components/ui/icon"
import { cn } from "@/lib/utils"
import { DeleteButton } from "@/components/ui/delete-button"
import { getStatusBadgeClass } from "@/lib/objectStatusColors"
import { Estimate, MaterialEstimate, ObjectItem, ObjectStatus } from "@/lib/api"
import { formatMoney, formatDate } from "./constants"

interface EstimateRowProps {
  e: Estimate
  obj: ObjectItem | undefined
  objectStatuses: ObjectStatus[]
  printingId: number | null
  downloadingId: number | null
  handlePrint: (est: Estimate) => void
  handleDownloadPdf: (est: Estimate) => void
  handleDelete: (id: number) => void
}

export function DocumentEstimateRow({
  e,
  obj,
  objectStatuses,
  printingId,
  downloadingId,
  handlePrint,
  handleDownloadPdf,
  handleDelete,
}: EstimateRowProps) {
  return (
        <tr key={`est-${e.id}`} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
          <td className="py-3 px-4">
            <span className="text-[#D4AF37] font-medium text-xs">Смета на работу</span>
          </td>
          <td className="py-3 px-4">
            <p className="font-medium">Смета на ремонтные работы</p>
            <p className="text-xs text-white/30">№{e.id}</p>
          </td>
          <td className="py-3 px-4 text-white/60">{formatDate(e.created_at)}</td>
          <td className="py-3 px-4 text-white/60">
            {obj?.object_code || e.object_code || "—"}
          </td>
          <td className="py-3 px-4 text-white/60">{e.client_name || obj?.client_name || "—"}</td>
          <td className="py-3 px-4 font-medium">{formatMoney(e.total_amount)}</td>
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
            {e.has_pending ? (
              <span className="px-2 py-0.5 rounded-full text-xs bg-orange-500/20 text-orange-300">
                ожидает согласования
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-300">
                утверждена
              </span>
            )}
          </td>
          <td className="py-3 px-4">
            <div className="flex items-center gap-3">
              <Link
                to={`/cabinet/objects/${e.object_id}/estimates/${e.id}`}
                className="text-white/40 hover:text-white transition-colors"
                title="Просмотр"
              >
                <Icon name="Eye" size={15} />
              </Link>
              <Link
                to={`/cabinet/objects/${e.object_id}/estimates/${e.id}/edit`}
                className="text-white/40 hover:text-white transition-colors"
                title="Редактировать"
              >
                <Icon name="Pencil" size={15} />
              </Link>
              <button
                onClick={() => handlePrint(e)}
                className="text-white/40 hover:text-white transition-colors"
                title="Печать"
              >
                {printingId === e.id ? (
                  <Icon name="Loader2" size={15} className="animate-spin" />
                ) : (
                  <Icon name="Printer" size={15} />
                )}
              </button>
              <button
                onClick={() => handleDownloadPdf(e)}
                className="text-white/40 hover:text-white transition-colors"
                title="Скачать PDF"
              >
                {downloadingId === e.id ? (
                  <Icon name="Loader2" size={15} className="animate-spin" />
                ) : (
                  <Icon name="Download" size={15} />
                )}
              </button>
              <DeleteButton onConfirm={() => handleDelete(e.id)} />
            </div>
          </td>
        </tr>
  )
}

interface MatEstimateRowProps {
  m: MaterialEstimate
  obj: ObjectItem | undefined
  objectStatuses: ObjectStatus[]
  matBusyId: number | null
  openMatEstimate: (m: MaterialEstimate, mode: "print" | "pdf") => void
  handleDeleteMatEstimate: (id: number) => void
}

export function DocumentMatEstimateRow({
  m,
  obj,
  objectStatuses,
  matBusyId,
  openMatEstimate,
  handleDeleteMatEstimate,
}: MatEstimateRowProps) {
  return (
        <tr key={`matest-${m.id}`} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
          <td className="py-3 px-4">
            <span className="text-[#B49AE5] font-medium text-xs">Смета на материал</span>
          </td>
          <td className="py-3 px-4">
            <p className="font-medium">{m.title}</p>
            <p className="text-xs text-white/30">
              №{m.id}{m.room_names ? ` · ${m.room_names}` : ""}
            </p>
          </td>
          <td className="py-3 px-4 text-white/60">{formatDate(m.created_at)}</td>
          <td className="py-3 px-4 text-white/60">
            {obj?.object_code || m.object_code || "—"}
          </td>
          <td className="py-3 px-4 text-white/60">{m.client_name || obj?.client_name || "—"}</td>
          <td className="py-3 px-4 font-medium">{formatMoney(Number(m.total_amount))}</td>
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
            <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-300">
              сохранена
            </span>
          </td>
          <td className="py-3 px-4">
            <div className="flex items-center gap-3">
              <Link
                to="/cabinet/materials"
                className="text-white/40 hover:text-[#D4AF37] transition-colors"
                title="Открыть в материалах"
              >
                <Icon name="Eye" size={15} />
              </Link>
              <button
                onClick={() => openMatEstimate(m, "print")}
                className="text-white/40 hover:text-white transition-colors"
                title="Печать"
              >
                {matBusyId === m.id ? (
                  <Icon name="Loader2" size={15} className="animate-spin" />
                ) : (
                  <Icon name="Printer" size={15} />
                )}
              </button>
              <button
                onClick={() => openMatEstimate(m, "pdf")}
                className="text-white/40 hover:text-white transition-colors"
                title="Скачать PDF"
              >
                <Icon name="Download" size={15} />
              </button>
              <DeleteButton onConfirm={() => handleDeleteMatEstimate(m.id)} />
            </div>
          </td>
        </tr>
  )
}
