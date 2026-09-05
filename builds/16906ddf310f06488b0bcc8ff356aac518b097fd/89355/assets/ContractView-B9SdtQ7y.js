import{d as b,g as j,r as a,y as w,j as e,I as n,i as r,a0 as y}from"./index-Bk7HS837.js";import{C as m}from"./CrmLayout-BLC-Zt6y.js";import{d as N}from"./downloadContractPdf-MyO18rcP.js";import{d as v,a as _}from"./docBrandHeader-BQ_EeXF9.js";function P(){const{id:x,contractId:i}=b(),u=j(),o=Number(x),[t,h]=a.useState(null),[f,c]=a.useState(!0),[l,d]=a.useState(!1);a.useEffect(()=>{i&&(c(!0),w.get(Number(i)).then(h).catch(()=>u("/cabinet/documents")).finally(()=>c(!1)))},[i]);const g=()=>{if(!t)return;const s=window.open("","_blank");s&&(s.document.write(`
      <html>
        <head>
          <title>Договор № ${t.contract_number}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 32px; line-height: 1.5; color: #161616; }
            h2, h3 { color: #161616; }
            h2 { margin: 28px 0 12px; }
            h3 { margin: 24px 0 10px; }
            p { margin: 0 0 14px; }
            table { border-collapse: collapse; }
            ${v}
          </style>
        </head>
        <body>${_(`Договор № ${t.contract_number}`)}${t.content_html}</body>
      </html>
    `),s.document.close(),s.focus(),s.print())},p=async()=>{if(t){d(!0);try{await N(t.content_html,t.contract_number)}finally{d(!1)}}};return f?e.jsx(m,{title:"Договор",children:e.jsx("div",{className:"flex items-center justify-center py-24",children:e.jsx(n,{name:"Loader2",size:28,className:"animate-spin text-white/40"})})}):t?e.jsxs(m,{title:`Договор подряда на ремонт квартиры № ${t.contract_number}`,children:[e.jsxs("div",{className:"flex items-center justify-between mb-4 flex-wrap gap-3",children:[e.jsxs(r,{to:"/cabinet/documents",className:"inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors",children:[e.jsx(n,{name:"ChevronLeft",size:16}),"К документам"]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:y("px-2.5 py-1 rounded-full text-xs font-medium",t.status==="signed"?"bg-green-500/20 text-green-300":"bg-white/10 text-white/50"),children:t.status==="signed"?"подписан":"черновик"}),e.jsxs(r,{to:`/cabinet/objects/${o}/contracts/${t.id}/edit`,className:"flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 transition-colors text-white text-sm px-3 py-2 rounded-lg",children:[e.jsx(n,{name:"Pencil",size:14}),"Редактировать"]}),e.jsxs(r,{to:`/cabinet/objects/${o}/acts/new?contract_id=${t.id}`,className:"flex items-center gap-1.5 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm px-3 py-2 rounded-lg",children:[e.jsx(n,{name:"Plus",size:14}),"Составить акт"]}),e.jsx("button",{onClick:g,title:"Печать",className:"flex items-center justify-center w-9 h-9 bg-white/5 hover:bg-white/10 transition-colors rounded-lg",children:e.jsx(n,{name:"Printer",size:15})}),e.jsx("button",{onClick:p,disabled:l,title:"Скачать PDF",className:"flex items-center justify-center w-9 h-9 bg-white/5 hover:bg-white/10 transition-colors rounded-lg disabled:opacity-60",children:l?e.jsx(n,{name:"Loader2",size:15,className:"animate-spin"}):e.jsx(n,{name:"Download",size:15})})]})]}),e.jsx("div",{className:"bg-white text-[#161616] rounded-xl p-8 sm:p-12 max-w-4xl mx-auto shadow-lg",children:e.jsx("div",{className:"contract-content leading-relaxed text-sm",dangerouslySetInnerHTML:{__html:t.content_html}})})]}):null}export{P as default};
