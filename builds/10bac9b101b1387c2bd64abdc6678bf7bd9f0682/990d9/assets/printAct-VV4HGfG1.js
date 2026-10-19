import{d as i,a as c}from"./docBrandHeader-BUR-GT6c.js";import{p as d}from"./printHtml-CKhqLfJy.js";import{R as s}from"./pdfRender-CFELYoji.js";function p(e){return b((e||"").replace(/<div class="pg-break"[^>]*><\/div>/g,"").replace(/(<p style="font-weight:700;font-size:15px;margin:)0 0 12px(;color:#4A2E06)(">Приложение к Акту)/g,(o,t,r,a)=>`${t}18px 0 12px${r};page-break-after:avoid;break-after:avoid${a}`).replace(/#F5EBD9/gi,"#D3C2A2").replace(/background:#EADCC0/gi,"background:#B9A27A").replace(/color:#3A2404/gi,"color:#1F1405"))}function b(e){if(typeof DOMParser>"u"||!e.includes("works-table"))return e;const o=new DOMParser().parseFromString(`<div id="r">${e}</div>`,"text/html"),t=o.getElementById("r");return t?(t.querySelectorAll("table.works-table").forEach(r=>{var n;if((n=r.parentElement)!=null&&n.classList.contains("pdf-rt"))return;const a=o.createElement("div");a.className="pdf-rt",r.before(a),a.appendChild(r)}),`<style>${s}</style>${t.innerHTML}`):e}const l=`
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
  ${s}
  ${c}
`;function k(e){d(`Доп. соглашение № ${e.addendum_number}`,`${i("")}${p(e.content_html)}`,l,{paginate:!0})}function g(e){d(`Акт № ${e.act_number}`,`${i("")}${p(e.content_html)}`,l,{paginate:!0})}export{k as a,p as d,g as p};
