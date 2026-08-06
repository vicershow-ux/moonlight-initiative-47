import { CrmLayout } from "@/components/crm/CrmLayout"
import Icon from "@/components/ui/icon"

export default function Materials() {
  return (
    <CrmLayout title="Материалы" subtitle="Справочник материалов и цен">
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-20 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <Icon name="Package" size={28} className="text-muted-foreground" />
        </div>
        <h3 className="mb-1 text-lg font-semibold text-foreground">Раздел в разработке</h3>
        <p className="max-w-md text-sm text-muted-foreground">
          Здесь будет справочник материалов. Опишите, что нужно на этой странице, и я всё настрою.
        </p>
      </div>
    </CrmLayout>
  )
}
