import { addendumDelta } from "@/components/crm/documents/DocumentContractRows"
import { DocumentMobileCard } from "@/components/crm/documents/DocumentMobileCard"
import { DeleteButton } from "@/components/ui/delete-button"
import { DocumentsData } from "./useDocumentsData"

export function DocumentsMobileList({ docs }: { docs: DocumentsData }) {
  const {
    showEstimates,
    filteredEstimates,
    objectsMap,
    objectStatuses,
    handlePrint,
    handleDownloadPdf,
    printingId,
    downloadingId,
    handleDelete,
    showMatEstimates,
    filteredMatEstimates,
    openMatEstimate,
    matBusyId,
    handleDeleteMatEstimate,
    showContracts,
    filteredContracts,
    handlePrintContract,
    handleDownloadContractPdf,
    downloadingContractId,
    handleDeleteContract,
    showAddenda,
    filteredAddenda,
    handleAddendum,
    addBusyId,
    handleDeleteAddendum,
    showActs,
    filteredActs,
    handlePrintAct,
    handleDownloadActPdf,
    handleDeleteAct,
  } = docs

  return (
    <div className="md:hidden flex flex-col gap-3">
      {showEstimates && filteredEstimates.map((e) => (
        <DocumentMobileCard
          key={`m-est-${e.id}`}
          kind="Смета на работу"
          kindClass="text-[#D4AF37]"
          title="Смета на ремонтные работы"
          subtitle={`№${e.estimate_number || e.id}`}
          createdAt={e.created_at}
          amount={Number(e.total_amount)}
          obj={objectsMap[e.object_id]}
          objectCode={e.object_code}
          clientName={e.client_name}
          objectStatuses={objectStatuses}
          statusBadge={
            e.has_pending ? (
              <span className="px-2 py-1 rounded-full text-[11px] bg-orange-500/20 text-orange-300">ожидает</span>
            ) : (
              <span className="px-2 py-1 rounded-full text-[11px] bg-green-500/20 text-green-300">утверждена</span>
            )
          }
          viewTo={`/cabinet/objects/${e.object_id}/estimates/${e.id}`}
          editTo={`/cabinet/objects/${e.object_id}/estimates/${e.id}/edit`}
          onPrint={() => handlePrint(e)}
          onDownload={() => handleDownloadPdf(e)}
          printing={printingId === e.id}
          downloading={downloadingId === e.id}
          deleteButton={<DeleteButton onConfirm={() => handleDelete(e.id)} />}
        />
      ))}

      {showMatEstimates && filteredMatEstimates.map((m) => (
        <DocumentMobileCard
          key={`m-mat-${m.id}`}
          kind={m.title === "Список закупок" ? "Список закупок" : "Смета на материал"}
          kindClass="text-[#B49AE5]"
          title={m.title}
          subtitle={`№${m.id}${m.room_names ? ` · ${m.room_names}` : ""}`}
          createdAt={m.created_at}
          amount={Number(m.total_amount)}
          obj={objectsMap[m.object_id]}
          objectCode={m.object_code}
          clientName={m.client_name}
          objectStatuses={objectStatuses}
          statusBadge={
            <span className="px-2 py-1 rounded-full text-[11px] bg-green-500/20 text-green-300">сохранена</span>
          }
          viewTo="/cabinet/materials"
          onPrint={() => openMatEstimate(m, "print")}
          onDownload={() => openMatEstimate(m, "pdf")}
          onSend={() => openMatEstimate(m, "email")}
          printing={matBusyId === m.id}
          deleteButton={<DeleteButton onConfirm={() => handleDeleteMatEstimate(m.id)} />}
        />
      ))}

      {showContracts && filteredContracts.map((c) => (
        <DocumentMobileCard
          key={`m-con-${c.id}`}
          kind="Договор"
          kindClass="text-blue-400"
          title="Договор подряда на ремонт"
          subtitle={`№ ${c.contract_number}`}
          createdAt={c.contract_date || c.created_at}
          amount={Number(c.total_amount)}
          obj={objectsMap[c.object_id]}
          objectCode={c.object_code}
          clientName={c.client_name}
          objectStatuses={objectStatuses}
          statusBadge={
            <span className={`px-2 py-1 rounded-full text-[11px] ${c.status === "signed" ? "bg-green-500/20 text-green-300" : "bg-white/10 text-white/50"}`}>
              {c.status === "signed" ? "подписан" : "черновик"}
            </span>
          }
          viewTo={`/cabinet/objects/${c.object_id}/contracts/${c.id}`}
          editTo={`/cabinet/objects/${c.object_id}/contracts/${c.id}/edit`}
          onPrint={() => handlePrintContract(c)}
          onDownload={() => handleDownloadContractPdf(c)}
          downloading={downloadingContractId === c.id}
          deleteButton={<DeleteButton onConfirm={() => handleDeleteContract(c.id)} />}
        />
      ))}

      {showAddenda && filteredAddenda.map((d) => {
        const delta = addendumDelta(d)
        const base = `/cabinet/objects/${d.object_id}/contracts/${d.contract_id}/addenda/${d.id}`
        return (
          <DocumentMobileCard
            key={`m-add-${d.id}`}
            kind="Доп. соглашение"
            kindClass="text-cyan-400"
            title={`Доп. соглашение № ${d.addendum_number}`}
            subtitle={`к договору № ${d.contract_number || "—"}${delta !== null ? ` · ${delta > 0 ? "+" : "−"}${Math.abs(delta).toLocaleString("ru-RU")} ₽` : ""}`}
            createdAt={d.addendum_date || d.created_at}
            amount={Number(d.total_amount)}
            obj={objectsMap[d.object_id]}
            objectCode={d.object_code}
            clientName={d.client_name}
            objectStatuses={objectStatuses}
            statusBadge={
              <span className={`px-2 py-1 rounded-full text-[11px] ${d.status === "signed" ? "bg-green-500/20 text-green-300" : "bg-white/10 text-white/50"}`}>
                {d.status === "signed" ? "подписано" : "черновик"}
              </span>
            }
            viewTo={base}
            editTo={d.status !== "signed" ? `${base}/edit` : undefined}
            onPrint={() => handleAddendum(d, "print")}
            onDownload={() => handleAddendum(d, "pdf")}
            printing={addBusyId === d.id}
            downloading={addBusyId === -d.id}
            deleteButton={<DeleteButton onConfirm={() => handleDeleteAddendum(d.id)} />}
          />
        )
      })}

      {showActs && filteredActs.map((a) => (
        <DocumentMobileCard
          key={`m-act-${a.id}`}
          kind="Акт"
          kindClass="text-purple-400"
          title="Акт выполненных работ"
          subtitle={`№ ${a.act_number}`}
          createdAt={a.act_date || a.created_at}
          amount={Number(a.total_amount)}
          obj={objectsMap[a.object_id]}
          objectCode={a.object_code}
          clientName={a.client_name}
          objectStatuses={objectStatuses}
          statusBadge={
            <span className={`px-2 py-1 rounded-full text-[11px] ${a.status === "signed" ? "bg-green-500/20 text-green-300" : "bg-white/10 text-white/50"}`}>
              {a.status === "signed" ? "подписан" : "черновик"}
            </span>
          }
          viewTo={`/cabinet/objects/${a.object_id}/acts/${a.id}`}
          editTo={`/cabinet/objects/${a.object_id}/acts/${a.id}/edit`}
          onPrint={() => handlePrintAct(a)}
          onDownload={() => handleDownloadActPdf(a)}
          downloading={downloadingContractId === a.id}
          deleteButton={<DeleteButton onConfirm={() => handleDeleteAct(a.id)} />}
        />
      ))}
    </div>
  )
}

export default DocumentsMobileList
