import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { QRCodeSVG } from "qrcode.react"
import { CrmLayout } from "@/components/crm/CrmLayout"
import Icon from "@/components/ui/icon"
import { useAuth } from "@/contexts/AuthContext"
import { profileApi, twoFactorApi } from "@/lib/api"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function Profile() {
  const { user, logout, updateProfile, setTotpEnabled } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState(user?.full_name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [savingInfo, setSavingInfo] = useState(false)
  const [infoSaved, setInfoSaved] = useState(false)
  const [infoError, setInfoError] = useState("")

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordSaved, setPasswordSaved] = useState(false)
  const [passwordError, setPasswordError] = useState("")

  const [setupOpen, setSetupOpen] = useState(false)
  const [otpUri, setOtpUri] = useState("")
  const [secret, setSecret] = useState("")
  const [setupCode, setSetupCode] = useState("")
  const [setupLoading, setSetupLoading] = useState(false)
  const [setupError, setSetupError] = useState("")

  const [disablePassword, setDisablePassword] = useState("")
  const [disableLoading, setDisableLoading] = useState(false)
  const [disableError, setDisableError] = useState("")
  const [disableOpen, setDisableOpen] = useState(false)

  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  const inputClass =
    "w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50 disabled:opacity-50"
  const labelClass = "text-xs text-white/50 mb-1.5 block"

  const handleSaveInfo = async () => {
    setInfoError("")
    setInfoSaved(false)
    setSavingInfo(true)
    try {
      const updated = await profileApi.update({ full_name: fullName, email })
      updateProfile(updated)
      setInfoSaved(true)
    } catch (err) {
      setInfoError(err instanceof Error ? err.message : "Не удалось сохранить")
    } finally {
      setSavingInfo(false)
    }
  }

  const handleSavePassword = async () => {
    setPasswordError("")
    setPasswordSaved(false)
    if (newPassword.length < 6) {
      setPasswordError("Новый пароль должен быть не короче 6 символов")
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Пароли не совпадают")
      return
    }
    setSavingPassword(true)
    try {
      await profileApi.update({ current_password: currentPassword, new_password: newPassword })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setPasswordSaved(true)
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Не удалось сохранить")
    } finally {
      setSavingPassword(false)
    }
  }

  const handleStartSetup = async () => {
    setSetupError("")
    setSetupLoading(true)
    try {
      const data = await twoFactorApi.setup()
      setOtpUri(data.otp_uri)
      setSecret(data.secret)
      setSetupOpen(true)
    } catch (err) {
      setSetupError(err instanceof Error ? err.message : "Не удалось начать настройку")
    } finally {
      setSetupLoading(false)
    }
  }

  const handleConfirmSetup = async () => {
    setSetupError("")
    if (setupCode.trim().length !== 6) {
      setSetupError("Введите 6-значный код")
      return
    }
    setSetupLoading(true)
    try {
      await twoFactorApi.confirm(setupCode.trim())
      setTotpEnabled(true)
      setSetupOpen(false)
      setSetupCode("")
      setOtpUri("")
      setSecret("")
    } catch (err) {
      setSetupError(err instanceof Error ? err.message : "Неверный код")
    } finally {
      setSetupLoading(false)
    }
  }

  const handleDisable = async () => {
    setDisableError("")
    setDisableLoading(true)
    try {
      await twoFactorApi.disable(disablePassword)
      setTotpEnabled(false)
      setDisablePassword("")
      setDisableOpen(false)
    } catch (err) {
      setDisableError(err instanceof Error ? err.message : "Не удалось отключить")
    } finally {
      setDisableLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    setDeleteError("")
    setDeleteLoading(true)
    try {
      await profileApi.remove()
      logout()
      navigate("/")
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Не удалось удалить аккаунт")
      setDeleteLoading(false)
    }
  }

  return (
    <CrmLayout title="Настройки" subtitle="Управление профилем и настройками аккаунта">
      <div className="max-w-3xl space-y-6">
        <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-6">
          <div className="mb-5">
            <h2 className="text-base font-semibold">Личная информация</h2>
            <p className="text-sm text-white/40 mt-0.5">Обновите имя и адрес электронной почты</p>
          </div>

          <div className="space-y-4 max-w-md">
            <div>
              <label className={labelClass}>Имя</label>
              <input
                className={inputClass}
                value={fullName}
                onChange={(e) => { setFullName(e.target.value); setInfoSaved(false) }}
              />
            </div>
            <div>
              <label className={labelClass}>Электронная почта</label>
              <input
                type="email"
                className={inputClass}
                value={email}
                onChange={(e) => { setEmail(e.target.value); setInfoSaved(false) }}
              />
            </div>

            {infoError && (
              <p className="text-sm text-red-400 flex items-center gap-1.5">
                <Icon name="CircleAlert" size={14} />
                {infoError}
              </p>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={handleSaveInfo}
                disabled={savingInfo}
                className="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm font-medium px-5 py-2.5 rounded-lg disabled:opacity-60"
              >
                {savingInfo ? <Icon name="Loader2" size={14} className="animate-spin" /> : null}
                Сохранить
              </button>
              {infoSaved && <span className="text-xs text-green-400 flex items-center gap-1"><Icon name="CheckCircle2" size={14} />Сохранено</span>}
            </div>
          </div>
        </div>

        <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-6">
          <div className="mb-5">
            <h2 className="text-base font-semibold">Пароль</h2>
            <p className="text-sm text-white/40 mt-0.5">Убедитесь, что ваш аккаунт защищён длинным случайным паролем</p>
          </div>

          <div className="space-y-4 max-w-md">
            <div>
              <label className={labelClass}>Текущий пароль</label>
              <input
                type="password"
                className={inputClass}
                value={currentPassword}
                onChange={(e) => { setCurrentPassword(e.target.value); setPasswordSaved(false) }}
              />
            </div>
            <div>
              <label className={labelClass}>Новый пароль</label>
              <input
                type="password"
                className={inputClass}
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setPasswordSaved(false) }}
              />
            </div>
            <div>
              <label className={labelClass}>Подтвердите пароль</label>
              <input
                type="password"
                className={inputClass}
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setPasswordSaved(false) }}
              />
            </div>

            {passwordError && (
              <p className="text-sm text-red-400 flex items-center gap-1.5">
                <Icon name="CircleAlert" size={14} />
                {passwordError}
              </p>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={handleSavePassword}
                disabled={savingPassword}
                className="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm font-medium px-5 py-2.5 rounded-lg disabled:opacity-60"
              >
                {savingPassword ? <Icon name="Loader2" size={14} className="animate-spin" /> : null}
                Сохранить
              </button>
              {passwordSaved && <span className="text-xs text-green-400 flex items-center gap-1"><Icon name="CheckCircle2" size={14} />Пароль изменён</span>}
            </div>
          </div>
        </div>

        <div className="bg-[#1f1f1f] border border-white/10 rounded-xl p-6">
          <div className="mb-4">
            <h2 className="text-base font-semibold">Двухфакторная аутентификация</h2>
            <p className="text-sm text-[#D4AF37]/80 mt-0.5">Управление настройками двухфакторной аутентификации</p>
          </div>

          <span
            className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full mb-3 ${
              user?.totp_enabled ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"
            }`}
          >
            {user?.totp_enabled ? "Включена" : "Отключена"}
          </span>

          <p className="text-sm text-white/40 mb-4 max-w-lg">
            При включении двухфакторной аутентификации во время входа вам будет запрошен безопасный
            PIN-код. Его можно получить из TOTP-приложения на вашем телефоне.
          </p>

          {!user?.totp_enabled ? (
            <button
              onClick={handleStartSetup}
              disabled={setupLoading}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 transition-colors text-sm px-4 py-2.5 rounded-lg disabled:opacity-60"
            >
              {setupLoading ? <Icon name="Loader2" size={14} className="animate-spin" /> : <Icon name="ShieldCheck" size={14} />}
              Включить 2FA
            </button>
          ) : (
            <AlertDialog open={disableOpen} onOpenChange={setDisableOpen}>
              <AlertDialogTrigger asChild>
                <button className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors text-sm px-4 py-2.5 rounded-lg">
                  <Icon name="ShieldOff" size={14} />
                  Отключить 2FA
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-[#1f1f1f] border-white/10 text-white">
                <AlertDialogHeader>
                  <AlertDialogTitle>Отключить двухфакторную аутентификацию</AlertDialogTitle>
                  <AlertDialogDescription className="text-white/50">
                    Введите пароль от аккаунта, чтобы подтвердить отключение 2FA.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <input
                  type="password"
                  className={inputClass}
                  placeholder="Пароль"
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                />
                {disableError && (
                  <p className="text-sm text-red-400 flex items-center gap-1.5">
                    <Icon name="CircleAlert" size={14} />
                    {disableError}
                  </p>
                )}
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-transparent border-white/10 text-white hover:bg-white/5 hover:text-white">
                    Отмена
                  </AlertDialogCancel>
                  <button
                    onClick={(e) => { e.preventDefault(); handleDisable() }}
                    disabled={disableLoading}
                    className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 transition-colors text-white text-sm px-4 py-2 rounded-md disabled:opacity-60"
                  >
                    {disableLoading ? <Icon name="Loader2" size={14} className="animate-spin" /> : null}
                    Отключить
                  </button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {setupOpen && (
            <div className="mt-5 border-t border-white/10 pt-5 max-w-sm">
              <p className="text-sm text-white/70 mb-3">
                Отсканируйте QR-код в приложении-аутентификаторе (Google Authenticator, Authy и т.п.)
              </p>
              <div className="bg-white p-4 rounded-lg w-fit mb-3">
                <QRCodeSVG value={otpUri} size={180} />
              </div>
              <p className="text-[11px] text-white/30 mb-4 break-all">Ключ: {secret}</p>

              <label className={labelClass}>Код из приложения</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                className={`${inputClass} tracking-[0.3em] text-center mb-3`}
                value={setupCode}
                onChange={(e) => setSetupCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
              />

              {setupError && (
                <p className="text-sm text-red-400 flex items-center gap-1.5 mb-3">
                  <Icon name="CircleAlert" size={14} />
                  {setupError}
                </p>
              )}

              <div className="flex items-center gap-3">
                <button
                  onClick={handleConfirmSetup}
                  disabled={setupLoading}
                  className="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm font-medium px-5 py-2.5 rounded-lg disabled:opacity-60"
                >
                  {setupLoading ? <Icon name="Loader2" size={14} className="animate-spin" /> : null}
                  Подтвердить
                </button>
                <button
                  onClick={() => { setSetupOpen(false); setSetupCode(""); setSetupError("") }}
                  className="text-sm text-white/50 hover:text-white transition-colors"
                >
                  Отмена
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-[#1f1f1f] border border-red-500/20 rounded-xl p-6">
          <div className="mb-4">
            <h2 className="text-base font-semibold">Удаление аккаунта</h2>
            <p className="text-sm text-white/40 mt-0.5">Удалить аккаунт и все связанные с ним данные</p>
          </div>

          {deleteError && (
            <p className="text-sm text-red-400 flex items-center gap-1.5 mb-3">
              <Icon name="CircleAlert" size={14} />
              {deleteError}
            </p>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="flex items-center gap-2 bg-red-500 hover:bg-red-600 transition-colors text-white text-sm font-medium px-4 py-2.5 rounded-lg">
                <Icon name="Trash2" size={14} />
                Удалить аккаунт
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-[#1f1f1f] border-white/10 text-white">
              <AlertDialogHeader>
                <AlertDialogTitle>Вы абсолютно уверены?</AlertDialogTitle>
                <AlertDialogDescription className="text-white/50">
                  Это действие нельзя отменить. Аккаунт и все связанные с ним данные будут удалены безвозвратно.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-transparent border-white/10 text-white hover:bg-white/5 hover:text-white">
                  Отмена
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  {deleteLoading ? <Icon name="Loader2" size={14} className="animate-spin mr-1" /> : null}
                  Удалить
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </CrmLayout>
  )
}
