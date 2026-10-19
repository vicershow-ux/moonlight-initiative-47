import{r as p}from"./pdfRender-CFELYoji.js";import{a as l,d as r}from"./docBrandHeader-BUR-GT6c.js";async function c(d,s){await n(d,s,"save")}async function x(d,s){return await n(d,s,"base64")||""}async function n(d,s,e){const t=/^(Акт|Счёт|ДС) /.test(s),i=s.startsWith("ДС "),f=s.startsWith("Акт")||i?s:`Договор № ${s}`;return p(a=>{a.style.color="#161616",a.style.fontFamily="Arial, sans-serif",a.style.fontSize="13px",a.style.lineHeight="1.5",a.innerHTML=`<style>
    .pdf-doc p { margin: 0 0 12px; }
    .pdf-doc h3 { margin: 20px 0 8px; }
    .pdf-doc h2 { margin: 24px 0 10px; }
    ${l}
  </style>${r(s.startsWith("Акт")||i?f:"")}<div class="pdf-doc">${d}</div>`},{filename:t?`${s}.pdf`:`Договор №${s}.pdf`,mode:e})}export{x as c,c as d};
