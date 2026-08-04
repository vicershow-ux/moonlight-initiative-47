export async function downloadContractPdf(contentHtml: string, contractNumber: string) {
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
  root.innerHTML = `<style>
    .pdf-doc p { margin: 0 0 12px; }
    .pdf-doc h3 { margin: 20px 0 8px; }
    .pdf-doc h2 { margin: 24px 0 10px; }
  </style><div class="pdf-doc">${contentHtml}</div>`

  container.appendChild(root)
  document.body.appendChild(container)

  const html2pdf = (await import("html2pdf.js")).default
  await html2pdf()
    .set({
      margin: [10, 10, 10, 10],
      filename: `Договор №${contractNumber}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    })
    .from(root)
    .save()

  document.body.removeChild(container)
}