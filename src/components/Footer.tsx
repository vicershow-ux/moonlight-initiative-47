import { useSiteContent } from "@/hooks/useSiteContent"

export function Footer() {
  const { content } = useSiteContent()
  const s = content?.settings
  const brandName = s?.brand_name || "FixKey"
  const logoUrl = s?.logo_url
  const footerDescription =
    s?.footer_description ||
    "Ремонт квартир и домов под ключ с гарантией результата. Прозрачная смета и контроль на каждом этапе."
  const email = s?.email || "hello@fixkey.ru"
  const phone = s?.phone || "+7 (495) 123-45-67"
  const phoneHref = `tel:${phone.replace(/[^\d+]/g, "")}`
  const telegramUrl = s?.telegram_url || "#"
  const maxUrl = s?.max_url || ""
  const copyrightText = s?.copyright_text || "© 2025 FixKey. Все права защищены."

  return (
    <footer className="py-16 md:py-24 border-t border-border">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="md:col-span-2">
            <a href="/" className="inline-flex items-center gap-2.5 mb-6">
              {logoUrl && (
                <img
                  src={logoUrl === "/favicon.png" ? "/logo-112.png" : logoUrl}
                  srcSet={
                    logoUrl === "/favicon.png"
                      ? "/logo-112.png 1x, /logo-168.png 1.5x, /logo-224.png 2x"
                      : undefined
                  }
                  alt={brandName}
                  width={56}
                  height={56}
                  className="h-14 w-auto object-contain"
                />
              )}
              <span className="text-xl font-semibold tracking-tight">
                {brandName.toLowerCase().endsWith("key") ? (
                  <>
                    <span className="text-foreground">{brandName.slice(0, -3)}</span>
                    <span className="text-[#D4AF37]">{brandName.slice(-3)}</span>
                  </>
                ) : (
                  brandName
                )}
              </span>
            </a>
            <p className="text-muted-foreground leading-relaxed max-w-sm">
              {footerDescription}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-sm font-medium mb-4">Компания</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <a href="/#projects" className="hover:text-[#D4AF37] transition-colors">
                  Объекты
                </a>
              </li>
              <li>
                <a href="/#about" className="hover:text-[#D4AF37] transition-colors">
                  О нас
                </a>
              </li>
              <li>
                <a href="/#services" className="hover:text-[#D4AF37] transition-colors">
                  Услуги
                </a>
              </li>
              <li>
                <a href="/#contact" className="hover:text-[#D4AF37] transition-colors">
                  Контакты
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-medium mb-4">Связь</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <a href={`mailto:${email}`} className="hover:text-[#D4AF37] transition-colors">
                  {email}
                </a>
              </li>
              <li>
                <a href={phoneHref} className="hover:text-[#D4AF37] transition-colors">
                  {phone}
                </a>
              </li>
              <li>
                <a href={telegramUrl} className="hover:text-[#D4AF37] transition-colors">
                  Телеграм
                </a>
              </li>
              {maxUrl && (
                <li>
                  <a
                    href={maxUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#D4AF37] transition-colors"
                  >
                    MAX
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row md:items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>{copyrightText}</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <a href="/privacy" className="hover:text-[#D4AF37] transition-colors">
              Политика конфиденциальности
            </a>
            <a href="/terms" className="hover:text-[#D4AF37] transition-colors">
              Условия использования
            </a>
            <a href="/cookies" className="hover:text-[#D4AF37] transition-colors">
              Файлы cookie
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}