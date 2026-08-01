import { SiteSettings } from "@/lib/api"
import Icon from "@/components/ui/icon"

interface AnalyticsTabProps {
  form: SiteSettings
  update: (field: keyof SiteSettings, value: string) => void
}

export function AnalyticsTab({ form, update }: AnalyticsTabProps) {
  const labelClass = "text-xs text-white/50 mb-1.5 block"

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex gap-3 bg-[#161616] border border-white/10 rounded-lg p-4">
        <Icon name="Info" size={18} className="text-[#D4AF37] shrink-0 mt-0.5" />
        <div className="text-sm text-white/60 space-y-1">
          <p>Вставьте сюда код счётчиков аналитики — Яндекс.Метрика, Google Analytics, Пиксель ВКонтакте и любые другие.</p>
          <p>Код будет подключаться <span className="text-white/80">только на публичном лендинге</span> и не затрагивает кабинет.</p>
          <p>Можно вставить несколько счётчиков подряд, включая теги <code className="text-[#D4AF37]">{"<script>"}</code> и <code className="text-[#D4AF37]">{"<noscript>"}</code>.</p>
        </div>
      </div>

      <div>
        <label className={labelClass}>Код аналитики (Яндекс.Метрика, Google Analytics и т.д.)</label>
        <textarea
          rows={16}
          spellCheck={false}
          className="w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-xs font-mono text-white/90 outline-none focus:border-[#D4AF37]/50 resize-y"
          value={form.analytics_head || ""}
          onChange={(e) => update("analytics_head", e.target.value)}
          placeholder={`<!-- Yandex.Metrika counter -->\n<script type="text/javascript">\n  ...\n</script>\n<!-- /Yandex.Metrika counter -->`}
        />
      </div>

      <p className="text-xs text-white/40">
        После вставки кода нажмите «Сохранить». Счётчик начнёт собирать статистику при следующем открытии лендинга.
      </p>
    </div>
  )
}
