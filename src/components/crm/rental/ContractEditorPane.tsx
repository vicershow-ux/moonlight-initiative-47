import { RefObject } from "react"
import Icon from "@/components/ui/icon"
import { ghostBtn, goldBtn } from "./rentalsUi"

interface Props {
  editorRef: RefObject<HTMLDivElement>
  html: string
  saving: boolean
  downloading: boolean
  hasExisting: boolean
  onEdit: () => void
  onSave: () => void
  onPrint: () => void
  onDownload: () => void
}

export function ContractEditorPane({
  editorRef,
  html,
  saving,
  downloading,
  hasExisting,
  onEdit,
  onSave,
  onPrint,
  onDownload,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button className={goldBtn} onClick={onSave} disabled={saving}>
          {saving ? (
            <Icon name="Loader2" size={16} className="animate-spin" />
          ) : (
            <Icon name="Check" size={16} />
          )}
          {hasExisting ? "Сохранить изменения" : "Сохранить договор"}
        </button>
        <button className={ghostBtn} onClick={onPrint}>
          <Icon name="Printer" size={16} />
          Печать
        </button>
        <button className={ghostBtn} onClick={onDownload} disabled={downloading}>
          <Icon
            name={downloading ? "Loader2" : "Download"}
            size={16}
            className={downloading ? "animate-spin" : ""}
          />
          Скачать PDF
        </button>
      </div>

      <div className="rounded-xl border border-white/10 bg-white p-5 md:p-8">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={onEdit}
          className="contract-doc min-h-[500px] text-[#161616] outline-none"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>

      <div className="text-xs text-white/40">
        Текст договора можно править прямо здесь — щёлкните в нужное место и печатайте
      </div>
    </div>
  )
}

export default ContractEditorPane
