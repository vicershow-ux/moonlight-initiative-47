import { CrmLayout } from "@/components/crm/CrmLayout"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import Icon from "@/components/ui/icon"

type Column = { key: string; label: string }

const STOCK_COLUMNS: Column[] = [
  { key: "name", label: "Название" },
  { key: "address", label: "Адрес" },
  { key: "responsible", label: "Ответственный" },
  { key: "positions", label: "Позиций" },
  { key: "actions", label: "Действия" },
]

const LEDGER_COLUMNS: Column[] = [
  { key: "date", label: "Дата" },
  { key: "material", label: "Материал" },
  { key: "operation", label: "Операция" },
  { key: "qty", label: "Кол-во" },
  { key: "unit", label: "Ед. изм." },
  { key: "price", label: "Цена" },
  { key: "sum", label: "Сумма" },
  { key: "actions", label: "Действия" },
]

const OBJECTS_COLUMNS: Column[] = [
  { key: "object", label: "Объект" },
  { key: "address", label: "Адрес" },
  { key: "material", label: "Материал" },
  { key: "qty", label: "Кол-во" },
  { key: "date", label: "Дата выдачи" },
  { key: "sum", label: "Сумма" },
  { key: "actions", label: "Действия" },
]

function EmptyTable({
  columns,
  emptyText,
  addLabel,
}: {
  columns: Column[]
  emptyText: string
  addLabel: string
}) {
  return (
    <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-5">
      <div className="flex justify-end mb-4">
        <button
          type="button"
          disabled
          className="flex items-center gap-2 bg-[#D4AF37] text-[#161616] text-sm px-4 py-2.5 rounded-lg opacity-40 cursor-not-allowed"
        >
          <Icon name="Plus" size={16} />
          {addLabel}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-white/40 text-xs uppercase border-b border-white/10">
              {columns.map((c) => (
                <th key={c.key} className="text-left font-medium py-2 pr-4 whitespace-nowrap">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
        </table>
      </div>

      <div className="text-center py-16 text-white/30 text-sm">{emptyText}</div>
    </div>
  )
}

export default function Warehouse() {
  return (
    <CrmLayout title="Склад учет" subtitle="Склады, движение материалов и выдача на объекты">
      <Tabs defaultValue="stock">
        <TabsList className="bg-[#1f1f1f] border border-white/10 mb-6 flex-wrap h-auto">
          <TabsTrigger value="stock">Склад</TabsTrigger>
          <TabsTrigger value="ledger">Учет</TabsTrigger>
          <TabsTrigger value="objects">Объекты</TabsTrigger>
        </TabsList>

        <TabsContent value="stock">
          <EmptyTable
            columns={STOCK_COLUMNS}
            addLabel="Добавить склад"
            emptyText="Складов пока нет — структура готова, наполнение подключим следующим шагом"
          />
        </TabsContent>

        <TabsContent value="ledger">
          <EmptyTable
            columns={LEDGER_COLUMNS}
            addLabel="Добавить операцию"
            emptyText="Операций пока нет — структура готова, наполнение подключим следующим шагом"
          />
        </TabsContent>

        <TabsContent value="objects">
          <EmptyTable
            columns={OBJECTS_COLUMNS}
            addLabel="Выдать на объект"
            emptyText="Выдач на объекты пока нет — структура готова, наполнение подключим следующим шагом"
          />
        </TabsContent>
      </Tabs>
    </CrmLayout>
  )
}
