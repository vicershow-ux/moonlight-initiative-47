import{p as f}from"./pdfRender-Duq1Qtmf.js";const l=96/25.4,g=175*l,h=Math.floor(266*l)-12;function y(m,n,p="",d={}){const e=window.open("","_blank");if(!e)return;e.document.write(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8"/>
    <title>${m}</title>
    <base href="${window.location.origin}/"/>
    <style>
      @page {
        size: A4;
        margin: 15mm 15mm 16mm 20mm;
        @top-left { content: ""; }
        @top-center { content: ""; }
        @top-right { content: ""; }
        @bottom-left { content: ""; }
        @bottom-center { content: ""; }
        @bottom-right { content: counter(page) " / " counter(pages); font-family: Arial, sans-serif; font-size: 9pt; color: #777; }
      }
      html, body { margin: 0; }
      body { font-family: Arial, sans-serif; padding: 0; line-height: 1.5; color: #161616; orphans: 3; widows: 3; }
      p, li, tr, img { page-break-inside: avoid; break-inside: avoid; }
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      h2, h3 { color: #161616; }
      h2 { margin: 28px 0 12px; }
      h2, h3 { page-break-after: avoid; break-after: avoid; }
      h3 { margin: 24px 0 10px; }
      p { margin: 0 0 14px; }
      table { border-collapse: collapse; }
      ${p}
    </style>
  </head>
  <body>${d.paginate?`<div id="print-root" style="width:${g}px">${n}</div>`:n}</body>
</html>`),e.document.close();const i=()=>{const t=e.document.getElementById("print-root");t&&!t.dataset.paged&&(t.dataset.paged="1",f(t,h)),e.focus(),e.print()},o=Array.from(e.document.images).filter(t=>!t.complete);if(!o.length){setTimeout(i,150);return}let r=o.length,a=!1;const s=()=>{a||(a=!0,setTimeout(i,150))};o.forEach(t=>{const c=()=>{r-=1,r<=0&&s()};t.addEventListener("load",c,{once:!0}),t.addEventListener("error",c,{once:!0})}),setTimeout(s,4e3)}export{y as p};
