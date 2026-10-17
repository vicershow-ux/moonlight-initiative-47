import{r as f}from"./pdfRender-3tiBZ0-9.js";import{a as p,d as l}from"./docBrandHeader-BUR-GT6c.js";async function y(a,s){await n(a,s,"save")}async function c(a,s){return await n(a,s,"base64")||""}async function n(a,s,e){const i=/^(Акт|Счёт) /.test(s),t=s.startsWith("Акт")?s:`Договор № ${s}`;return f(d=>{d.style.color="#161616",d.style.fontFamily="Arial, sans-serif",d.style.fontSize="13px",d.style.lineHeight="1.5",d.innerHTML=`<style>
    .pdf-doc p { margin: 0 0 12px; }
    .pdf-doc h3 { margin: 20px 0 8px; }
    .pdf-doc h2 { margin: 24px 0 10px; }
    ${p}
  </style>${l(s.startsWith("Акт")?t:"")}<div class="pdf-doc">${a}</div>`},{filename:i?`${s}.pdf`:`Договор №${s}.pdf`,mode:e})}export{c,y as d};
