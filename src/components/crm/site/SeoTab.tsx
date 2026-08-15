import Icon from "@/components/ui/icon"
import { SiteSettings } from "@/lib/api"

interface SeoTabProps {
  form: SiteSettings
  update: (field: keyof SiteSettings, value: string) => void
}

const KEYWORD_IDEAS = [
  "ремонт квартир",
  "ремонт квартир под ключ",
  "ремонт квартиры цена",
  "отделка квартир",
  "капитальный ремонт квартиры",
  "дизайнерский ремонт",
  "ремонт новостройки",
  "ремонт ванной комнаты",
  "ремонт кухни",
  "черновая отделка",
  "чистовая отделка",
  "строительная бригада",
  "смета на ремонт",
  "ремонт домов",
]

export function SeoTab({ form, update }: SeoTabProps) {
  const inputClass =
    "w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"
  const labelClass = "text-xs text-white/50 mb-1.5 block"

  const keywords = (form.meta_keywords || "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean)

  const addKeyword = (word: string) => {
    if (keywords.some((k) => k.toLowerCase() === word.toLowerCase())) return
    update("meta_keywords", [...keywords, word].join(", "))
  }

  const removeKeyword = (word: string) => {
    update("meta_keywords", keywords.filter((k) => k !== word).join(", "))
  }

  const titleLen = (form.meta_title || "").length
  const descLen = (form.meta_description || "").length

  const counterClass = (len: number, min: number, max: number) =>
    len === 0
      ? "text-white/30"
      : len < min || len > max
        ? "text-amber-400"
        : "text-green-400"

  const available = KEYWORD_IDEAS.filter(
    (idea) => !keywords.some((k) => k.toLowerCase() === idea.toLowerCase()),
  )

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-[#161616] border border-white/10 rounded-lg p-4 flex gap-3">
        <Icon name="Info" size={16} className="text-[#D4AF37] shrink-0 mt-0.5" />
        <p className="text-xs text-white/50 leading-relaxed">
          Здесь настраивается, как сайт выглядит в Яндексе и Google и по каким запросам его находят.
          Заголовок и описание — то, что человек видит в результатах поиска. Ключевые слова помогают
          поисковикам понять тематику сайта.
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className={`${labelClass} mb-0`}>Заголовок в поиске (title)</label>
          <span className={`text-[11px] ${counterClass(titleLen, 30, 60)}`}>
            {titleLen} / 60
          </span>
        </div>
        <input
          className={inputClass}
          value={form.meta_title}
          onChange={(e) => update("meta_title", e.target.value)}
          placeholder="FixKey — ремонт квартир под ключ в Обнинске"
        />
        <p className="text-[11px] text-white/30 mt-1.5">
          Оптимально 50–60 символов. Включите главную услугу и город.
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className={`${labelClass} mb-0`}>Описание в поиске (description)</label>
          <span className={`text-[11px] ${counterClass(descLen, 100, 160)}`}>
            {descLen} / 160
          </span>
        </div>
        <textarea
          rows={3}
          className={`${inputClass} resize-none`}
          value={form.meta_description}
          onChange={(e) => update("meta_description", e.target.value)}
          placeholder="Ремонт квартир и домов под ключ с гарантией. Прозрачная смета, контроль на каждом этапе."
        />
        <p className="text-[11px] text-white/30 mt-1.5">
          Оптимально 120–160 символов. Это текст-приглашение под ссылкой в поиске.
        </p>
      </div>

      <div className="border-t border-white/10 pt-6">
        <label className={labelClass}>Ключевые слова</label>

        {keywords.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {keywords.map((k) => (
              <span
                key={k}
                className="inline-flex items-center gap-1.5 bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] text-xs px-2.5 py-1.5 rounded-lg"
              >
                {k}
                <button
                  onClick={() => removeKeyword(k)}
                  className="hover:text-white transition-colors"
                  aria-label={`Убрать ${k}`}
                >
                  <Icon name="X" size={12} />
                </button>
              </span>
            ))}
          </div>
        )}

        <textarea
          rows={3}
          className={`${inputClass} resize-none`}
          value={form.meta_keywords}
          onChange={(e) => update("meta_keywords", e.target.value)}
          placeholder="ремонт квартир, отделка под ключ, ремонт в Обнинске"
        />
        <p className="text-[11px] text-white/30 mt-1.5">
          Перечислите через запятую фразы, по которым вас будут искать. Рекомендуется 5–15 фраз.
        </p>

        {available.length > 0 && (
          <div className="mt-4">
            <p className="text-[11px] text-white/40 mb-2">Популярные запросы — нажмите, чтобы добавить:</p>
            <div className="flex flex-wrap gap-2">
              {available.map((idea) => (
                <button
                  key={idea}
                  onClick={() => addKeyword(idea)}
                  className="inline-flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white text-xs px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  <Icon name="Plus" size={12} />
                  {idea}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-white/10 pt-6">
        <label className={labelClass}>Город или регион работы</label>
        <input
          className={inputClass}
          value={form.seo_region}
          onChange={(e) => update("seo_region", e.target.value)}
          placeholder="Обнинск, Калужская область"
        />
        <p className="text-[11px] text-white/30 mt-1.5">
          Помогает показывать сайт людям, которые ищут ремонт именно в вашем городе.
        </p>
      </div>

      <div>
        <label className={labelClass}>Картинка для соцсетей</label>
        <input
          className={inputClass}
          value={form.og_image}
          onChange={(e) => update("og_image", e.target.value)}
          placeholder="https://..."
        />
        <p className="text-[11px] text-white/30 mt-1.5">
          Ссылка на изображение, которое покажется при отправке сайта в мессенджере или соцсети.
          Если пусто — используется логотип.
        </p>
      </div>

      <div className="border-t border-white/10 pt-6">
        <p className="text-xs text-white/40 mb-3">Как это будет выглядеть в поиске:</p>
        <div className="bg-white rounded-lg p-4">
          <p className="text-[#1a0dab] text-base leading-snug mb-1">
            {form.meta_title || "FixKey — Ремонт квартир под ключ"}
          </p>
          <p className="text-[#006621] text-xs mb-1">fixkey.ru</p>
          <p className="text-[#545454] text-xs leading-relaxed">
            {form.meta_description ||
              "Добавьте описание, чтобы увидеть, как сайт выглядит в результатах поиска."}
          </p>
        </div>
      </div>
    </div>
  )
}