function d(l,c,m=""){const t=window.open("","_blank");if(!t)return;t.document.write(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8"/>
    <title>${l}</title>
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
      ${m}
    </style>
  </head>
  <body>${c}</body>
</html>`),t.document.close();const n=()=>{t.focus(),t.print()},o=Array.from(t.document.images).filter(e=>!e.complete);if(!o.length){setTimeout(n,150);return}let i=o.length,r=!1;const a=()=>{r||(r=!0,setTimeout(n,150))};o.forEach(e=>{const s=()=>{i-=1,i<=0&&a()};e.addEventListener("load",s,{once:!0}),e.addEventListener("error",s,{once:!0})}),setTimeout(a,4e3)}export{d as p};
