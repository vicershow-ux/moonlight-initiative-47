import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { CrmLayout } from "@/components/crm/CrmLayout"
import Icon from "@/components/ui/icon"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { siteApi, SiteSettings } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { BrandTab } from "@/components/crm/site/BrandTab"
import { HeroAboutTab } from "@/components/crm/site/HeroAboutTab"
import { PhilosophyTab } from "@/components/crm/site/PhilosophyTab"
import { ProjectsTab } from "@/components/crm/site/ProjectsTab"
import { ExpertiseTab } from "@/components/crm/site/ExpertiseTab"
import { FaqTab } from "@/components/crm/site/FaqTab"
import { ContactsTab } from "@/components/crm/site/ContactsTab"
import { AnalyticsTab } from "@/components/crm/site/AnalyticsTab"
import { SeoTab } from "@/components/crm/site/SeoTab"
import { LegalTab } from "@/components/crm/site/LegalTab"

const emptyForm: SiteSettings = {
  brand_name: "", logo_url: "", favicon_url: "", meta_title: "", meta_description: "",
  meta_keywords: "", og_image: "", seo_region: "",
  phone: "", email: "", telegram_url: "", vk_url: "", max_url: "",
  hero_eyebrow: "", hero_title_line1: "", hero_title_line2: "", hero_bg_image: "", hero_fg_image: "",
  about_eyebrow: "", about_title_line1: "", about_title_highlight: "", about_description: "", about_image: "",
  projects_eyebrow: "", projects_title: "",
  services_eyebrow: "", services_title_highlight: "", services_title_rest: "", services_description: "",
  faq_eyebrow: "", faq_title: "",
  cta_eyebrow: "", cta_title_line1: "", cta_title_highlight: "", cta_description: "",
  footer_description: "", copyright_text: "",
  analytics_head: "",
  legal_company_name: "", legal_updated_at: "",
  privacy_intro: "", privacy_body: "",
  terms_intro: "", terms_body: "",
  cookies_intro: "", cookies_body: "",
  lead_notify_email: "",
}

type PendingFiles = Partial<Record<
  "logo_file" | "favicon_file" | "hero_bg_image_file" | "hero_fg_image_file" | "about_image_file",
  string
>>

export default function Site() {
  const { user } = useAuth()
  const { toast } = useToast()
  const canManage = user?.role === "owner" || user?.position === "super_admin"

  const [form, setForm] = useState<SiteSettings>(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [pendingFiles, setPendingFiles] = useState<PendingFiles>({})

  useEffect(() => {
    if (!canManage) {
      setLoading(false)
      return
    }
    siteApi
      .getSettings()
      .then((data) => setForm({ ...emptyForm, ...data }))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const update = (field: keyof SiteSettings, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  const onFileSelected = (field: keyof PendingFiles, dataUrl: string) => {
    setPendingFiles((prev) => ({ ...prev, [field]: dataUrl }))
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = { ...form, ...pendingFiles }
      const updated = await siteApi.updateSettings(payload)
      setForm({ ...emptyForm, ...updated })
      setPendingFiles({})
      setSaved(true)
      toast({ title: "Сохранено" })
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Не удалось сохранить",
        description: err instanceof Error ? err.message : "Попробуйте загрузить фото меньшего размера",
      })
    } finally {
      setSaving(false)
    }
  }

  if (!canManage) {
    return <Navigate to="/cabinet/company" replace />
  }

  if (loading) {
    return (
      <CrmLayout title="Сайт" subtitle="Редактирование лендинга: тексты, фото, бренд и контакты">
        <div className="flex items-center justify-center py-24">
          <Icon name="Loader2" size={28} className="animate-spin text-white/40" />
        </div>
      </CrmLayout>
    )
  }

  return (
    <CrmLayout title="Сайт" subtitle="Редактирование лендинга: тексты, фото, бренд и контакты">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-white/40">
          Изменения на вкладках «Бренд», «Главная и о нас», «Контакты» применяются после нажатия «Сохранить». Списки (объекты, услуги, вопросы) сохраняются отдельно по каждой карточке.
        </p>
        <div className="flex items-center gap-3 shrink-0">
          {saved && <span className="text-xs text-green-400 flex items-center gap-1"><Icon name="CheckCircle2" size={14} />Сохранено</span>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm font-medium px-5 py-2.5 rounded-lg disabled:opacity-60"
          >
            {saving ? <Icon name="Loader2" size={14} className="animate-spin" /> : <Icon name="Check" size={14} />}
            Сохранить
          </button>
        </div>
      </div>

      <Tabs defaultValue="brand">
        <TabsList className="bg-[#1f1f1f] border border-white/10 mb-6 flex-wrap h-auto">
          <TabsTrigger value="brand">Бренд</TabsTrigger>
          <TabsTrigger value="hero">Главная и о нас</TabsTrigger>
          <TabsTrigger value="philosophy">Преимущества</TabsTrigger>
          <TabsTrigger value="projects">Проекты</TabsTrigger>
          <TabsTrigger value="expertise">Услуги</TabsTrigger>
          <TabsTrigger value="faq">Вопросы</TabsTrigger>
          <TabsTrigger value="contacts">Контакты</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="legal">Документы</TabsTrigger>
          <TabsTrigger value="analytics">Аналитика</TabsTrigger>
        </TabsList>

        <TabsContent value="brand">
          <BrandTab form={form} update={update} onFileSelected={onFileSelected} />
        </TabsContent>
        <TabsContent value="hero">
          <HeroAboutTab form={form} update={update} onFileSelected={onFileSelected} />
        </TabsContent>
        <TabsContent value="philosophy">
          <PhilosophyTab />
        </TabsContent>
        <TabsContent value="projects">
          <ProjectsTab form={form} update={update} />
        </TabsContent>
        <TabsContent value="expertise">
          <ExpertiseTab form={form} update={update} />
        </TabsContent>
        <TabsContent value="faq">
          <FaqTab form={form} update={update} />
        </TabsContent>
        <TabsContent value="contacts">
          <ContactsTab form={form} update={update} />
        </TabsContent>
        <TabsContent value="seo">
          <SeoTab form={form} update={update} />
        </TabsContent>
        <TabsContent value="legal">
          <LegalTab form={form} update={update} />
        </TabsContent>
        <TabsContent value="analytics">
          <AnalyticsTab form={form} update={update} />
        </TabsContent>
      </Tabs>
    </CrmLayout>
  )
}