import{a as d,d as s}from"./docBrandHeader-BUR-GT6c.js";import{p as l}from"./printHtml-D2YmeWOD.js";import{R as i}from"./pdfRender-DXRzDWdJ.js";function p(e){return b((e||"").replace(/#F5EBD9/gi,"#D3C2A2").replace(/background:#EADCC0/gi,"background:#B9A27A").replace(/color:#3A2404/gi,"color:#1F1405"))}function b(e){if(typeof DOMParser>"u"||!e.includes("works-table"))return e;const o=new DOMParser().parseFromString(`<div id="r">${e}</div>`,"text/html"),t=o.getElementById("r");return t?(t.querySelectorAll("table.works-table").forEach(r=>{var n;if((n=r.parentElement)!=null&&n.classList.contains("pdf-rt"))return;const a=o.createElement("div");a.className="pdf-rt",r.before(a),a.appendChild(r)}),`<style>${i}</style>${t.innerHTML}`):e}const c=`
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
  ${i}
  ${d}
`;function m(e){l(`Акт № ${e.act_number}`,`${s("")}${p(e.content_html)}`,c)}export{p as d,m as p};
