import { DocumentPurchaseRow } from "@/components/crm/documents/DocumentPurchaseRows"
import { DocumentEstimateRow, DocumentMatEstimateRow } from "@/components/crm/documents/DocumentEstimateRows"
import { DocumentContractRow, DocumentActRow, DocumentAddendumRow } from "@/components/crm/documents/DocumentContractRows"
import { DocumentsData } from "./useDocumentsData"

export function DocumentsTable({ docs }: { docs: DocumentsData }) {
  const {
    showEstimates,
    filteredEstimates,
    objectsMap,
    objectStatuses,
    printingId,
    downloadingId,
    handlePrint,
    handleDownloadPdf,
    handleDelete,
    showMatEstimates,
    showPurchaseLists,
    filteredPurchaseLists,
    openPurchaseList,
    filteredMatEstimates,
    matBusyId,
    openMatEstimate,
    handleDeleteMatEstimate,
    showContracts,
    filteredContracts,
    downloadingContractId,
    handlePrintContract,
    handleDownloadContractPdf,
    handleDeleteContract,
    showAddenda,
    filteredAddenda,
    addBusyId,
    handleAddendum,
    handleDeleteAddendum,
    showActs,
    filteredActs,
    handlePrintAct,
    handleDownloadActPdf,
    handleDeleteAct,
  } = docs

  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-white/40 text-[11px] uppercase border-b border-white/10">
            <th className="text-left font-medium py-3 px-4">Тип</th>
            <th className="text-left font-medium py-3 px-4">Документ</th>
            <th className="text-left font-medium py-3 px-4">Дата</th>
            <th className="text-left font-medium py-3 px-4">Объект</th>
            <th className="text-left font-medium py-3 px-4">Заказчик</th>
            <th className="text-left font-medium py-3 px-4">Сумма</th>
            <th className="text-left font-medium py-3 px-4">Статус объекта</th>
            <th className="text-left font-medium py-3 px-4">Статус</th>
            <th className="text-left font-medium py-3 px-4">Действия</th>
          </tr>
        </thead>
        <tbody>
          {showEstimates && filteredEstimates.map((e) => (
            <DocumentEstimateRow
              key={`est-${e.id}`}
              e={e}
              obj={objectsMap[e.object_id]}
              objectStatuses={objectStatuses}
              printingId={printingId}
              downloadingId={downloadingId}
              handlePrint={handlePrint}
              handleDownloadPdf={handleDownloadPdf}
              handleDelete={handleDelete}
            />
          ))}

          {showPurchaseLists && filteredPurchaseLists.map((m) => (
            <DocumentPurchaseRow
              key={`purch-${m.id}`}
              m={m}
              obj={objectsMap[m.object_id]}
              objectStatuses={objectStatuses}
              busyId={matBusyId}
              onOpen={openPurchaseList}
              onDelete={handleDeleteMatEstimate}
            />
          ))}

          {showMatEstimates && filteredMatEstimates.map((m) => (
            <DocumentMatEstimateRow
              key={`matest-${m.id}`}
              m={m}
              obj={objectsMap[m.object_id]}
              objectStatuses={objectStatuses}
              matBusyId={matBusyId}
              openMatEstimate={openMatEstimate}
              handleDeleteMatEstimate={handleDeleteMatEstimate}
            />
          ))}

          {showContracts && filteredContracts.map((c) => (
            <DocumentContractRow
              key={`contract-${c.id}`}
              c={c}
              obj={objectsMap[c.object_id]}
              objectStatuses={objectStatuses}
              downloadingContractId={downloadingContractId}
              handlePrintContract={handlePrintContract}
              handleDownloadContractPdf={handleDownloadContractPdf}
              handleDeleteContract={handleDeleteContract}
            />
          ))}

          {showAddenda && filteredAddenda.map((d) => (
            <DocumentAddendumRow
              key={`addendum-${d.id}`}
              d={d}
              obj={objectsMap[d.object_id]}
              objectStatuses={objectStatuses}
              busyId={addBusyId}
              handlePrint={(x) => handleAddendum(x, "print")}
              handleDownload={(x) => handleAddendum(x, "pdf")}
              handleDelete={handleDeleteAddendum}
            />
          ))}

          {showActs && filteredActs.map((a) => (
            <DocumentActRow
              key={`act-${a.id}`}
              a={a}
              obj={objectsMap[a.object_id]}
              objectStatuses={objectStatuses}
              downloadingContractId={downloadingContractId}
              handlePrintAct={handlePrintAct}
              handleDownloadActPdf={handleDownloadActPdf}
              handleDeleteAct={handleDeleteAct}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default DocumentsTable
