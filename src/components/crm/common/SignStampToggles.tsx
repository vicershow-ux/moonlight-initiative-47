interface SignStampTogglesProps {
  signatureUrl?: string
  stampUrl?: string
  applySignature: boolean
  applyStamp: boolean
  onChange: (key: "apply_signature" | "apply_stamp", value: boolean) => void
  className?: string
}

/** Галочки «наложить подпись / печать компании» — для договора, акта и сметы */
export function SignStampToggles({ signatureUrl, stampUrl, applySignature, applyStamp, onChange, className = "" }: SignStampTogglesProps) {
  if (!signatureUrl && !stampUrl) {
    return (
      <p className={`text-xs text-white/40 ${className}`}>
        Подпись и печать можно загрузить в разделе «Компания» — тогда их можно будет наложить на документ.
      </p>
    )
  }
  const item = (key: "apply_signature" | "apply_stamp", label: string, url: string | undefined, checked: boolean) => (
    <label className={`flex items-center gap-2 ${url ? "cursor-pointer" : "opacity-40"}`}>
      <input
        type="checkbox"
        className="accent-[#D4AF37]"
        disabled={!url}
        checked={Boolean(checked && url)}
        onChange={(e) => onChange(key, e.target.checked)}
      />
      {label}
      {!url && " (загрузите в «Компании»)"}
    </label>
  )
  return (
    <div className={`flex flex-wrap items-center gap-4 rounded-lg border border-white/10 bg-[#161616] px-3 py-2.5 text-sm ${className}`}>
      <span className="text-white/50">Наложить на документ:</span>
      {item("apply_signature", "подпись", signatureUrl, applySignature)}
      {item("apply_stamp", "печать", stampUrl, applyStamp)}
    </div>
  )
}

export default SignStampToggles
