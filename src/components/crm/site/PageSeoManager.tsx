import { useEffect, useMemo, useState } from "react"
import Icon from "@/components/ui/icon"
import { PageSeo, siteApi } from "@/lib/api"

const inputClass =
  "w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"
const labelClass = "text-xs text-white/50 mb-1.5 block"

const TITLE_LIMIT = 70
const DESC_LIMIT = 180

/** Подсказка о длине: слишком длинный текст поиск обрежет */
function LengthHint({ value, limit }: { value: string; limit: number }) {
  const len = value.length
  const tone = len === 0 ? "text-white/30" : len > limit ? "text-amber-400" : "text-green-400/70"
  return (
    <span className={`text-[11px] ${tone}`}>
      {len} / {limit}
      {len > limit ? " — поиск обрежет" : ""}
    </span>
  )
}

export function PageSeoManager() {
  const [items, setItems] = useState<PageSeo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [savingPath, setSavingPath] = useState<string | null>(null)
  const [savedPath, setSavedPath] = useState<string | null>(null)
  const [openPath, setOpenPath] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [drafts, setDrafts] = useState<Record<string, Partial<PageSeo>>>({})

  useEffect(() => {
    siteApi.pageSeo
      .list()
      .then((data) => setItems(data.items || []))
      .catch((e) => setError(e instanceof Error ? e.message : "Не удалось загрузить"))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter(
      (p) =>
        p.page_label.toLowerCase().includes(q) ||
        p.page_path.toLowerCase().includes(q) ||
        p.meta_title.toLowerCase().includes(q) ||
        p.meta_keywords.toLowerCase().includes(q),
    )
  }, [items, search])

  const valueOf = (page: PageSeo, field: keyof PageSeo) => {
    const draft = drafts[page.page_path]
    const raw = draft && field in draft ? draft[field] : page[field]
    return (raw ?? "") as string
  }

  const setField = (path: string, field: keyof PageSeo, value: string | boolean) => {
    setDrafts((d) => ({ ...d, [path]: { ...d[path], [field]: value } }))
    setSavedPath(null)
  }

  const isDirty = (path: string) => Boolean(drafts[path] && Object.keys(drafts[path]).length > 0)

  const save = async (page: PageSeo) => {
    const patch = drafts[page.page_path]
    if (!patch) return
    setSavingPath(page.page_path)
    setError("")
    try {
      const updated = await siteApi.pageSeo.update(page.page_path, patch)
      setItems((list) => list.map((p) => (p.page_path === page.page_path ? updated : p)))
      setDrafts((d) => {
        const next = { ...d }
        delete next[page.page_path]
        return next
      })
      setSavedPath(page.page_path)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось сохранить")
    } finally {
      setSavingPath(null)
    }
  }

  const toggleIndexed = async (page: PageSeo) => {
    setSavingPath(page.page_path)
    setError("")
    try {
      const updated = await siteApi.pageSeo.update(page.page_path, {
        is_indexed: !page.is_indexed,
      })
      setItems((list) => list.map((p) => (p.page_path === page.page_path ? updated : p)))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось сохранить")
    } finally {
      setSavingPath(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Icon name="Loader2" size={24} className="animate-spin text-white/40" />
      </div>
    )
  }

  const hidden = items.filter((p) => !p.is_indexed).length

  return (
    <div className="rounded-xl border border-white/10 bg-[#1f1f1f] p-4 md:p-5">
      <div className="mb-4">
        <h3 className="text-sm font-medium">Заголовки и описания по страницам</h3>
        <p className="mt-1 text-xs text-white/40">
          Каждая страница услуги выходит в поиске по своему запросу. Меняйте заголовок, описание
          и ключевые слова — на сайте они появятся после нажатия «Опубликовать».
        </p>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          <Icon name="CircleAlert" size={15} />
          {error}
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Icon
            name="Search"
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
          />
          <input
            className={`${inputClass} pl-9`}
            placeholder="Поиск по названию, адресу или ключевым словам"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span className="text-xs text-white/40">
          Страниц: {items.length}
          {hidden > 0 ? ` · скрыто от поиска: ${hidden}` : ""}
        </span>
      </div>

      <div className="space-y-2">
        {filtered.map((page) => {
          const open = openPath === page.page_path
          const dirty = isDirty(page.page_path)
          const title = valueOf(page, "meta_title")
          const desc = valueOf(page, "meta_description")

          return (
            <div
              key={page.page_path}
              className={`rounded-lg border bg-[#161616] transition-colors ${
                open ? "border-[#D4AF37]/40" : "border-white/10"
              }`}
            >
              <button
                onClick={() => setOpenPath(open ? null : page.page_path)}
                className="flex w-full items-center gap-3 px-3.5 py-3 text-left"
              >
                <Icon
                  name={open ? "ChevronDown" : "ChevronRight"}
                  size={16}
                  className="shrink-0 text-white/40"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium">{page.page_label}</span>
                    {!page.is_indexed && (
                      <span className="shrink-0 rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/50">
                        скрыта от поиска
                      </span>
                    )}
                    {dirty && (
                      <span className="shrink-0 rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] text-amber-400">
                        не сохранено
                      </span>
                    )}
                  </div>
                  <div className="truncate text-xs text-white/35">{page.page_path}</div>
                </div>
                {savedPath === page.page_path && !dirty && (
                  <Icon name="CircleCheck" size={15} className="shrink-0 text-green-400" />
                )}
              </button>

              {open && (
                <div className="space-y-4 border-t border-white/10 px-3.5 py-4">
                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label className={`${labelClass} mb-0`}>Заголовок в поиске</label>
                      <LengthHint value={title} limit={TITLE_LIMIT} />
                    </div>
                    <input
                      className={inputClass}
                      value={title}
                      onChange={(e) => setField(page.page_path, "meta_title", e.target.value)}
                      placeholder="Плиточные работы в Хабаровске — цены | FixKey"
                    />
                  </div>

                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label className={`${labelClass} mb-0`}>Описание в поиске</label>
                      <LengthHint value={desc} limit={DESC_LIMIT} />
                    </div>
                    <textarea
                      className={`${inputClass} min-h-[80px] resize-y`}
                      value={desc}
                      onChange={(e) => setField(page.page_path, "meta_description", e.target.value)}
                      placeholder="Коротко о услуге, цене и гарантии — этот текст видит человек в выдаче"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Ключевые слова через запятую</label>
                    <textarea
                      className={`${inputClass} min-h-[60px] resize-y`}
                      value={valueOf(page, "meta_keywords")}
                      onChange={(e) => setField(page.page_path, "meta_keywords", e.target.value)}
                      placeholder="укладка плитки хабаровск, плиточник цена, плитка в ванной под ключ"
                    />
                    <p className="mt-1 text-[11px] text-white/30">
                      Убирайте запросы, по которым не приходят клиенты, и добавляйте те, что
                      приносят заявки.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className={labelClass}>Заголовок на самой странице</label>
                      <input
                        className={inputClass}
                        value={valueOf(page, "h1_title")}
                        onChange={(e) => setField(page.page_path, "h1_title", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Название в списке</label>
                      <input
                        className={inputClass}
                        value={valueOf(page, "page_label")}
                        onChange={(e) => setField(page.page_path, "page_label", e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Вступительный текст на странице</label>
                    <textarea
                      className={`${inputClass} min-h-[70px] resize-y`}
                      value={valueOf(page, "intro_text")}
                      onChange={(e) => setField(page.page_path, "intro_text", e.target.value)}
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3">
                    <button
                      onClick={() => toggleIndexed(page)}
                      disabled={savingPath === page.page_path}
                      className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs text-white/60 transition-colors hover:bg-white/10 disabled:opacity-50"
                    >
                      <Icon name={page.is_indexed ? "EyeOff" : "Eye"} size={14} />
                      {page.is_indexed ? "Скрыть от поиска" : "Вернуть в поиск"}
                    </button>

                    <div className="flex items-center gap-3">
                      <a
                        href={page.page_path}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70"
                      >
                        <Icon name="ExternalLink" size={13} />
                        Открыть страницу
                      </a>
                      <button
                        onClick={() => save(page)}
                        disabled={!dirty || savingPath === page.page_path}
                        className="flex items-center gap-2 rounded-lg bg-[#D4AF37] px-4 py-2 text-xs font-medium text-[#161616] transition-colors hover:bg-[#B8860B] disabled:opacity-40"
                      >
                        {savingPath === page.page_path ? (
                          <Icon name="Loader2" size={13} className="animate-spin" />
                        ) : (
                          <Icon name="Check" size={13} />
                        )}
                        Сохранить
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="py-10 text-center text-sm text-white/40">Ничего не найдено</div>
        )}
      </div>
    </div>
  )
}

export default PageSeoManager
