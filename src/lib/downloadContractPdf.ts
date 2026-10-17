import { docBrandHeader, docBrandStyles } from "@/lib/docBrandHeader"

export async function downloadContractPdf(contentHtml: string, contractNumber: string) {
  await renderContractPdf(contentHtml, contractNumber, "save")
}

/** PDF договора в base64 — для отправки письмом */
export async function contractPdfBase64(contentHtml: string, contractNumber: string): Promise<string> {
  return (await renderContractPdf(contentHtml, contractNumber, "base64")) || ""
}

async function renderContractPdf(contentHtml: string, contractNumber: string, mode: "save" | "base64"): Promise<string | void> {
  const container = document.createElement("div")
  container.style.position = "fixed"
  container.style.left = "-10000px"
  container.style.top = "0"
  container.style.width = "794px"

  const root = document.createElement("div")
  root.style.background = "#ffffff"
  root.style.color = "#161616"
  root.style.padding = "40px"
  root.style.fontFamily = "Arial, sans-serif"
  root.style.fontSize = "13px"
  root.style.lineHeight = "1.5"
  const title = contractNumber.startsWith("Акт")
    ? contractNumber
    : `Договор № ${contractNumber}`

  root.innerHTML = `<style>
    .pdf-doc p { margin: 0 0 12px; }
    .pdf-doc h3 { margin: 20px 0 8px; }
    .pdf-doc h2 { margin: 24px 0 10px; }
    ${docBrandStyles}
  </style>${docBrandHeader(contractNumber.startsWith("Акт") ? title : "")}<div class="pdf-doc">${contentHtml}</div>`

  container.appendChild(root)
  document.body.appendChild(container)

  await new Promise<void>((resolve) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = () => resolve()
    img.src = `${window.location.origin}/logo-print.png`
    setTimeout(resolve, 3000)
  })
  // Подпись и печать с CDN — ждём, чтобы попали в PDF
  await Promise.all(
    Array.from(root.querySelectorAll("img")).map(
      (im) =>
        new Promise<void>((resolve) => {
          if (im.complete) return resolve()
          im.addEventListener("load", () => resolve(), { once: true })
          im.addEventListener("error", () => resolve(), { once: true })
          setTimeout(resolve, 4000)
        }),
    ),
  )

  const html2pdf = (await import("html2pdf.js")).default
  const worker = html2pdf()
    .set({
      margin: [10, 10, 10, 10],
      filename: `Договор №${contractNumber}.pdf`,
      // Для письма — облегчённый файл: сервер принимает вложения примерно до 3 МБ
      image: { type: "jpeg", quality: mode === "save" ? 0.98 : 0.8 },
      html2canvas: { scale: mode === "save" ? 2 : 1.5, useCORS: true, backgroundColor: "#ffffff" },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait", compress: true },
      pagebreak: { mode: ["css", "legacy"], avoid: ["p", "tr", "h3", "li"] },
    } as never)
    .from(root)
  try {
    if (mode === "save") {
      await worker.save()
      return
    }
    const uri: string = await (worker as unknown as { outputPdf: (t: string) => Promise<string> }).outputPdf("datauristring")
    return uri
  } finally {
    if (container.parentNode) document.body.removeChild(container)
  }
}