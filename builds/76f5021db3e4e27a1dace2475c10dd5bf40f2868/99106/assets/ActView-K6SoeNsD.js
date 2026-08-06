import{k as p,a as b,r as s,W as g,j as e,I as a,L as c,O as w}from"./index-CdcWLV1f.js";import{C as d}from"./CrmLayout-CaTkj0VL.js";import{d as j}from"./downloadContractPdf-D5jbuUst.js";function k(){const{actId:i}=p(),m=b(),[t,u]=s.useState(null),[x,r]=s.useState(!0),[o,l]=s.useState(!1);s.useEffect(()=>{i&&(r(!0),g.get(Number(i)).then(u).catch(()=>m("/cabinet/documents")).finally(()=>r(!1)))},[i]);const h=()=>{if(!t)return;const n=window.open("","_blank");n&&(n.document.write(`
      <html>
        <head>
          <title>Акт № ${t.act_number}</title>
          <style>
            @page { size: A4 portrait; margin: 10mm; }
            body { font-family: Arial, sans-serif; padding: 0 2mm; line-height: 1.5; color: #1a1a1a; font-size: 13px; }
            table { border-collapse: collapse; width: 100%; table-layout: fixed; }
            td, th { overflow-wrap: break-word; word-break: break-word; }
            @media print {
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
              body { padding: 0 2mm; }
              table, tr, td, th { page-break-inside: avoid; }
              thead th { background: #5C3A11 !important; color: #ffffff !important; font-weight: 700 !important; }
              td, th { border: 1px solid #7A4E10 !important; }
            }
          </style>
        </head>
        <body>${t.content_html}</body>
      </html>
    `),n.document.close(),n.focus(),n.print())},f=async()=>{if(t){l(!0);try{await j(t.content_html,`Акт ${t.act_number}`)}finally{l(!1)}}};return x?e.jsx(d,{title:"Акт",children:e.jsx("div",{className:"flex items-center justify-center py-24",children:e.jsx(a,{name:"Loader2",size:28,className:"animate-spin text-white/40"})})}):t?e.jsxs(d,{title:`Акт выполненных работ № ${t.act_number}`,children:[e.jsxs("div",{className:"flex items-center justify-between mb-4 flex-wrap gap-3",children:[e.jsxs(c,{to:"/cabinet/documents",className:"inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors",children:[e.jsx(a,{name:"ChevronLeft",size:16}),"К документам"]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:w("px-2.5 py-1 rounded-full text-xs font-medium",t.status==="signed"?"bg-green-500/20 text-green-300":"bg-white/10 text-white/50"),children:t.status==="signed"?"подписан":"черновик"}),e.jsxs(c,{to:`/cabinet/objects/${t.object_id}/acts/${t.id}/edit`,className:"flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 transition-colors text-white text-sm px-3 py-2 rounded-lg",children:[e.jsx(a,{name:"Pencil",size:14}),"Редактировать"]}),e.jsx("button",{onClick:h,title:"Печать",className:"flex items-center justify-center w-9 h-9 bg-white/5 hover:bg-white/10 transition-colors rounded-lg",children:e.jsx(a,{name:"Printer",size:15})}),e.jsx("button",{onClick:f,disabled:o,title:"Скачать PDF",className:"flex items-center justify-center w-9 h-9 bg-white/5 hover:bg-white/10 transition-colors rounded-lg disabled:opacity-60",children:o?e.jsx(a,{name:"Loader2",size:15,className:"animate-spin"}):e.jsx(a,{name:"Download",size:15})})]})]}),e.jsx("div",{className:"bg-white text-[#161616] rounded-xl p-8 sm:p-12 max-w-4xl mx-auto shadow-lg",children:e.jsx("div",{dangerouslySetInnerHTML:{__html:t.content_html}})})]}):null}export{k as default};
