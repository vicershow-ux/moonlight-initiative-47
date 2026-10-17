import{a as o,d as a}from"./docBrandHeader-BUR-GT6c.js";import{p as r}from"./printHtml-D2YmeWOD.js";function e(t){return(t||"").replace(/#F5EBD9/gi,"#D3C2A2").replace(/background:#EADCC0/gi,"background:#B9A27A").replace(/color:#3A2404/gi,"color:#1F1405")}const d=`
  body { font-size: 13px; }
  table { width: 100%; }
  td, th { overflow-wrap: break-word; }
  table:not(.works-table) td, table:not(.works-table) th { border: none !important; }
  .works-table thead { display: table-header-group; }
  .works-table thead th { background: #5C3A11 !important; color: #ffffff !important; font-weight: 700 !important; border: 1.2px solid #6B4508 !important; }
  .works-table tbody td { border: 1.2px solid #6B4508 !important; color: #1a1a1a !important; }
  .works-table { page-break-inside: auto; break-inside: auto; }
  .act-doc > div { page-break-inside: avoid; break-inside: avoid; }
  ${o}
`;function l(t){r(`Акт № ${t.act_number}`,`${a("")}${e(t.content_html)}`,d)}export{e as d,l as p};
