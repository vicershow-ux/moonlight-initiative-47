import { renderPagedPdf } from "@/lib/pdfRender"
import { docBrandHeader, docBrandStyles } from "@/lib/docBrandHeader"

export async function downloadContractPdf(contentHtml: string, contractNumber: string) {
  await renderContractPdf(contentHtml, contractNumber, "save")
}

/** PDF договора в base64 — для отправки письмом */
export async function contractPdfBase64(contentHtml: string, contractNumber: string): Promise<string> {
  return (await renderContractPdf(contentHtml, contractNumber, "base64")) || ""
}

async function renderContractPdf(contentHtml: string, contractNumber: string, mode: "save" | "base64"): Promise<string | void> {
  const isNamed = /^(Акт|Счёт|ДС) /.test(contractNumber)
  const isAddendum = contractNumber.startsWith("ДС ")
  const title = contractNumber.startsWith("Акт") || isAddendum ? contractNumber : `Договор № ${contractNumber}`
  return renderPagedPdf(
    (root) => {
      root.style.color = "#161616"
      root.style.fontFamily = "Arial, sans-serif"
      root.style.fontSize = "13px"
      root.style.lineHeight = "1.5"
      root.innerHTML = `<style>
    .pdf-doc p { margin: 0 0 12px; }
    .pdf-doc h3 { margin: 20px 0 8px; }
    .pdf-doc h2 { margin: 24px 0 10px; }
    ${docBrandStyles}
  </style>${docBrandHeader(contractNumber.startsWith("Акт") || isAddendum ? title : "")}<div class="pdf-doc">${contentHtml}</div>`
    },
    { filename: isNamed ? `${contractNumber}.pdf` : `Договор №${contractNumber}.pdf`, mode },
  )
}
