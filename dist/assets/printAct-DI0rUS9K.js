import{a as d,d as s}from"./docBrandHeader-BUR-GT6c.js";import{p}from"./printHtml-Bq5VOwNa.js";import{R as n}from"./pdfRender-hzArJI7L.js";function l(e){return c((e||"").replace(/<div class="pg-break"[^>]*><\/div>/g,"").replace(/(<p style="font-weight:700;font-size:15px;margin:)0 0 12px(;color:#4A2E06)(">Приложение к Акту)/g,(o,r,t,a)=>`${r}18px 0 12px${t};page-break-after:avoid;break-after:avoid${a}`).replace(/#F5EBD9/gi,"#D3C2A2").replace(/background:#EADCC0/gi,"background:#B9A27A").replace(/color:#3A2404/gi,"color:#1F1405"))}function c(e){if(typeof DOMParser>"u"||!e.includes("works-table"))return e;const o=new DOMParser().parseFromString(`<div id="r">${e}</div>`,"text/html"),r=o.getElementById("r");return r?(r.querySelectorAll("table.works-table").forEach(t=>{var i;if((i=t.parentElement)!=null&&i.classList.contains("pdf-rt"))return;const a=o.createElement("div");a.className="pdf-rt",t.before(a),a.appendChild(t)}),`<style>${n}</style>${r.innerHTML}`):e}const b=`
  body { font-size: 13px; }
  table { width: 100%; }
  td, th { overflow-wrap: break-word; }
  table:not(.works-table) td, table:not(.works-table) th { border: none !important; }
  .works-table thead { display: table-header-group; }
  .works-table thead th { background: #5C3A11 !important; color: #ffffff !important; font-weight: 700 !important; border: 1.2px solid #6B4508 !important; }
  .works-table tbody td { border: 1.2px solid #6B4508 !important; color: #1a1a1a !important; }
  .works-table { page-break-inside: auto; break-inside: auto; }
  .act-doc > div:not(.pdf-rt) { page-break-inside: avoid; break-inside: avoid; }
  .pdf-rt { page-break-inside: auto; break-inside: auto; }
  .works-table tr { page-break-inside: avoid; break-inside: avoid; }
  ${n}
  ${d}
`;function u(e){p(`Акт № ${e.act_number}`,`${s("")}${l(e.content_html)}`,b,{paginate:!0})}export{l as d,u as p};
