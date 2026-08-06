import{l as p,a as f,r as s,Y as w,j as t,I as a,L as c,S as g}from"./index-Bp9e4XfU.js";import{C as d}from"./CrmLayout-Dn8psj2-.js";import{d as j}from"./downloadContractPdf-mW5uvDip.js";function N(){const{actId:i}=p(),m=f(),[e,u]=s.useState(null),[h,o]=s.useState(!0),[r,l]=s.useState(!1);s.useEffect(()=>{i&&(o(!0),w.get(Number(i)).then(u).catch(()=>m("/cabinet/documents")).finally(()=>o(!1)))},[i]);const x=()=>{if(!e)return;const n=window.open("","_blank");n&&(n.document.write(`
      <html>
        <head>
          <title>Акт № ${e.act_number}</title>
          <style>
            @page { size: A4 portrait; margin: 10mm; }
            body { font-family: Arial, sans-serif; padding: 0 2mm; line-height: 1.5; color: #1a1a1a; font-size: 13px; }
            table { border-collapse: collapse; width: 100%; }
            td, th { overflow-wrap: break-word; }
            @media print {
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
              body { padding: 0 2mm; color: #1a1a1a !important; }
              table, tr, td, th { page-break-inside: avoid; }
              table:not(.works-table) td,
              table:not(.works-table) th { border: none !important; }
              .works-table thead th { background: #5C3A11 !important; color: #ffffff !important; font-weight: 700 !important; }
              .works-table tbody td,
              .works-table thead th { border: 1.2px solid #6B4508 !important; }
              .works-table tbody td { color: #1a1a1a !important; }
            }
          </style>
        </head>
        <body>${e.content_html}</body>
      </html>
    `),n.document.close(),n.focus(),n.print())},b=async()=>{if(e){l(!0);try{await j(e.content_html,`Акт ${e.act_number}`)}finally{l(!1)}}};return h?t.jsx(d,{title:"Акт",children:t.jsx("div",{className:"flex items-center justify-center py-24",children:t.jsx(a,{name:"Loader2",size:28,className:"animate-spin text-white/40"})})}):e?t.jsxs(d,{title:`Акт выполненных работ № ${e.act_number}`,children:[t.jsxs("div",{className:"flex items-center justify-between mb-4 flex-wrap gap-3",children:[t.jsxs(c,{to:"/cabinet/documents",className:"inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors",children:[t.jsx(a,{name:"ChevronLeft",size:16}),"К документам"]}),t.jsxs("div",{className:"flex items-center gap-2",children:[t.jsx("span",{className:g("px-2.5 py-1 rounded-full text-xs font-medium",e.status==="signed"?"bg-green-500/20 text-green-300":"bg-white/10 text-white/50"),children:e.status==="signed"?"подписан":"черновик"}),t.jsxs(c,{to:`/cabinet/objects/${e.object_id}/acts/${e.id}/edit`,className:"flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 transition-colors text-white text-sm px-3 py-2 rounded-lg",children:[t.jsx(a,{name:"Pencil",size:14}),"Редактировать"]}),t.jsx("button",{onClick:x,title:"Печать",className:"flex items-center justify-center w-9 h-9 bg-white/5 hover:bg-white/10 transition-colors rounded-lg",children:t.jsx(a,{name:"Printer",size:15})}),t.jsx("button",{onClick:b,disabled:r,title:"Скачать PDF",className:"flex items-center justify-center w-9 h-9 bg-white/5 hover:bg-white/10 transition-colors rounded-lg disabled:opacity-60",children:r?t.jsx(a,{name:"Loader2",size:15,className:"animate-spin"}):t.jsx(a,{name:"Download",size:15})})]})]}),t.jsx("div",{className:"bg-white text-[#161616] rounded-xl p-8 sm:p-12 max-w-4xl mx-auto shadow-lg",children:t.jsx("div",{dangerouslySetInnerHTML:{__html:e.content_html}})})]}):null}export{N as default};
