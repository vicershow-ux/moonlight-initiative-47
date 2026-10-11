function p(m,s,c=""){const e=window.open("","_blank");if(!e)return;e.document.write(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8"/>
    <title>${m}</title>
    <base href="${window.location.origin}/"/>
    <style>
      @page { size: A4; margin: 0; }
      html, body { margin: 0; }
      body { font-family: Arial, sans-serif; padding: 15mm 15mm 15mm 20mm; line-height: 1.5; color: #161616; }
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      h2, h3 { color: #161616; }
      h2 { margin: 28px 0 12px; }
      h3 { margin: 24px 0 10px; page-break-after: avoid; }
      p { margin: 0 0 14px; }
      table { border-collapse: collapse; }
      ${c}
    </style>
  </head>
  <body>${s}</body>
</html>`),e.document.close();const n=()=>{e.focus(),e.print()},o=Array.from(e.document.images).filter(t=>!t.complete);if(!o.length){setTimeout(n,150);return}let i=o.length,r=!1;const a=()=>{r||(r=!0,setTimeout(n,150))};o.forEach(t=>{const l=()=>{i-=1,i<=0&&a()};t.addEventListener("load",l,{once:!0}),t.addEventListener("error",l,{once:!0})}),setTimeout(a,4e3)}export{p};
