import{k as f,a as b,r as i,m as g,j as e,I as n,L as c,O as p}from"./index-CRaUbE4Z.js";import{C as l}from"./CrmLayout-DbdpGkN3.js";function y(){const{id:o,contractId:a}=f(),d=b(),m=Number(o),[t,x]=i.useState(null),[u,r]=i.useState(!0);i.useEffect(()=>{a&&(r(!0),g.get(Number(a)).then(x).catch(()=>d("/cabinet/documents")).finally(()=>r(!1)))},[a]);const h=()=>{if(!t)return;const s=window.open("","_blank");s&&(s.document.write(`
      <html>
        <head>
          <title>Договор № ${t.contract_number}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 32px; line-height: 1.5; color: #161616; }
            h2, h3 { color: #161616; }
            table { border-collapse: collapse; }
          </style>
        </head>
        <body>${t.content_html}</body>
      </html>
    `),s.document.close(),s.focus(),s.print())};return u?e.jsx(l,{title:"Договор",children:e.jsx("div",{className:"flex items-center justify-center py-24",children:e.jsx(n,{name:"Loader2",size:28,className:"animate-spin text-white/40"})})}):t?e.jsxs(l,{title:`Договор подряда на ремонт квартиры № ${t.contract_number}`,children:[e.jsxs("div",{className:"flex items-center justify-between mb-4 flex-wrap gap-3",children:[e.jsxs(c,{to:"/cabinet/documents",className:"inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors",children:[e.jsx(n,{name:"ChevronLeft",size:16}),"К документам"]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:p("px-2.5 py-1 rounded-full text-xs font-medium",t.status==="signed"?"bg-green-500/20 text-green-300":"bg-white/10 text-white/50"),children:t.status==="signed"?"подписан":"черновик"}),e.jsxs(c,{to:`/cabinet/objects/${m}/contracts/${t.id}/edit`,className:"flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 transition-colors text-white text-sm px-3 py-2 rounded-lg",children:[e.jsx(n,{name:"Pencil",size:14}),"Редактировать"]}),e.jsx("button",{onClick:h,title:"Печать",className:"flex items-center justify-center w-9 h-9 bg-white/5 hover:bg-white/10 transition-colors rounded-lg",children:e.jsx(n,{name:"Printer",size:15})})]})]}),e.jsx("div",{className:"bg-white text-[#161616] rounded-xl p-8 sm:p-12 max-w-4xl mx-auto shadow-lg",children:e.jsx("div",{className:"contract-content leading-relaxed text-sm",dangerouslySetInnerHTML:{__html:t.content_html}})})]}):null}export{y as default};
