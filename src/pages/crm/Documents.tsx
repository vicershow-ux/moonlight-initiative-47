import { CrmLayout } from "@/components/crm/CrmLayout"
import Icon from "@/components/ui/icon"
import { materialsApi } from "@/lib/api"
import { SendDocEmailDialog } from "@/components/crm/SendDocEmailDialog"
import { materialsPdfBase64 } from "@/lib/printMaterials"
import { DocumentsToolbar } from "@/components/crm/documents/DocumentsToolbar"
import { DocumentInvoicesTab } from "@/components/crm/documents/DocumentInvoicesTab"
import { useDocumentsData } from "@/components/crm/documents/useDocumentsData"
import { DocumentsMobileList } from "@/components/crm/documents/DocumentsMobileList"
import { DocumentsTable } from "@/components/crm/documents/DocumentsTable"
import { DocumentsEmptyState } from "@/components/crm/documents/DocumentsEmptyState"

export default function Documents() {
  const docs = useDocumentsData()
  const { user, tab, setTab, search, setSearch, loading, hasAnyRows, matSendFor, setMatSendFor, loadMatDoc } = docs

  return (
    <CrmLayout title="Реестр документов" subtitle="Единый центр управления сметами, договорами подряда, доп. соглашениями, актами и счетами вашей компании">
      <div className="bg-[#1f1f1f] border border-white/10 rounded-xl overflow-hidden">
        <DocumentsToolbar
          tab={tab}
          setTab={setTab}
          search={search}
          setSearch={setSearch}
        />

        {tab === "invoices" ? (
          <DocumentInvoicesTab search={search} />
        ) : loading ? (
          <div className="flex justify-center py-16">
            <Icon name="Loader2" size={24} className="animate-spin text-white/40" />
          </div>
        ) : !hasAnyRows ? (
          <DocumentsEmptyState tab={tab} />
        ) : (
          <>
          <DocumentsMobileList docs={docs} />
          <DocumentsTable docs={docs} />
          </>
        )}
      </div>
      {matSendFor && (
        <SendDocEmailDialog
          open={!!matSendFor}
          onOpenChange={(v) => !v && setMatSendFor(null)}
          docName="смету на материалы"
          objectId={matSendFor.object_id}
          fileName={`Смета_материалы_${matSendFor.id}.pdf`}
          makePdf={async () => {
            const { obj, items } = await loadMatDoc(matSendFor.id)
            return materialsPdfBase64(obj, items, [], user?.company_name || "", matSendFor.title)
          }}
          send={(p) => materialsApi.sendEstimateEmail(matSendFor.id, p)}
        />
      )}
    </CrmLayout>
  )
}
