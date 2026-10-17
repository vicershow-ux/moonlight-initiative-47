import{r as b,j as e,I as C,l as le,x as R,k as _e}from"./index-BpGGkqoe.js";import{C as ke}from"./CrmLayout-whXLSSY-.js";import{T as Ce,a as Ae,b as me,c as pe}from"./tabs-1pWaNZkN.js";import{p as ie,d as $e}from"./printMaterials-DX34k3NG.js";import{c as Fe,g as oe,a as ge,C as Se}from"./materialConsumption-DZe_YWxQ.js";import{D as ce}from"./delete-button-C0UZiQhh.js";import"./index-Dtr2TCCM.js";import"./index-C4f4qHNX.js";import"./pdfRender-BykAwojE.js";import"./alert-dialog-BgbYGOMS.js";const K=(i,d=0)=>{const o=typeof i=="string"?parseFloat(i):Number(i);return Number.isFinite(o)?o:d},te="Магазин не выбран";function De(i,d){const o=i.filter(n=>K(n.price)>0);if(o.length===0)return null;const r=o.map(n=>{const l=!!n.stock_known,c=K(n.stock),a=!l||c>=d,$=l&&c>0&&c<d;return{offer:n,enough:a,partial:$,price:K(n.price)}}),x=r.filter(n=>n.enough);if(x.length>0)return x.reduce((n,l)=>l.price<n.price?l:n).offer;const u=r.filter(n=>n.partial);return u.length>0?u.reduce((n,l)=>l.price<n.price?l:n).offer:r.reduce((n,l)=>l.price<n.price?l:n).offer}function fe(i,d){const o=new Map;let r=0,x=0,u=0;i.forEach(l=>{const c=d.find(S=>S.id===l.material_id),a=(c==null?void 0:c.offers)||[],$=K(l.qty),t=De(a,$),g=K(t?t.price:l.price),f=(t==null?void 0:t.shop_name)||l.shop_name||(c==null?void 0:c.shop_name)||te,p=(t?!!t.stock_known:!1)?K(t.stock):null,A=p===null?!0:p>=$,z=A||p===null?0:Math.max(0,$-p);A||(x+=1),f===te&&(u+=1);const M=a.filter(S=>K(S.price)>0).map(S=>K(S.price)),B=M.length>1&&g>0?(Math.max(...M)-g)*$:0;r+=B;const _={name:l.name,unit:l.unit,qty:$,price:g,sum:$*g,shopName:f,shopAddress:(t==null?void 0:t.shop_address)||(c==null?void 0:c.shop_address)||"",shopPhone:(t==null?void 0:t.shop_phone)||(c==null?void 0:c.shop_phone)||"",shopUrl:(t==null?void 0:t.shop_url)||(c==null?void 0:c.shop_url)||"",stock:p,enough:A,missing:z,offersCount:M.length,saved:B,roomName:l.room_name||""};o.has(f)||o.set(f,{name:f,address:_.shopAddress,phone:_.shopPhone,lines:[],sum:0,hasShortage:!1});const w=o.get(f);!w.address&&_.shopAddress&&(w.address=_.shopAddress),!w.phone&&_.shopPhone&&(w.phone=_.shopPhone),w.lines.push(_),w.sum+=_.sum,A||(w.hasShortage=!0)});const n=Array.from(o.values()).map(l=>({...l,lines:[...l.lines].sort((c,a)=>a.sum-c.sum)})).sort((l,c)=>l.name===te?1:c.name===te?-1:c.sum-l.sum);return{shops:n,total:n.reduce((l,c)=>l+c.sum,0),saved:r,shortageCount:x,unknownShopCount:u}}const he=i=>String(i??"").replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\r?\n/g," "),ze=(i,d=0)=>{const o=typeof i=="string"?parseFloat(i):Number(i);return Number.isFinite(o)?o:d},J=i=>new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0}).format(ze(i))+" ₽";function E(i){const d=document.createElement("div");return d.textContent=i??"",d.innerHTML}function Me(i,d,o,r){const x=fe(d,o),u=x.shops.map(g=>{const f=g.lines.map((p,A)=>{const z=p.stock===null?'<span class="muted">не указано</span>':p.enough?`<span class="ok">есть ${p.stock} ${E(p.unit)}</span>`:`<span class="warn">есть ${p.stock}, не хватает ${p.missing}</span>`;return`
            <tr>
              <td class="num">${A+1}</td>
              <td>
                ${E(p.name)}
                ${p.roomName?`<div class="sub">${E(p.roomName)}</div>`:""}
              </td>
              <td class="center">${p.qty}</td>
              <td class="center">${E(p.unit)}</td>
              <td class="center">${z}</td>
              <td class="right">${J(p.price)}</td>
              <td class="right amount">${J(p.sum)}</td>
              <td class="center check"></td>
            </tr>`}).join(""),y=[g.address?`Адрес: ${E(g.address)}`:"",g.phone?`Тел.: ${E(g.phone)}`:""].filter(Boolean).join(" · ");return`
      <div class="room-block">
        <div class="cat-block">
          <table>
            <thead>
              <tr>
                <th class="num">№</th>
                <th>Наименование материала</th>
                <th class="center">Нужно</th>
                <th class="center">Ед.</th>
                <th class="center">Наличие</th>
                <th class="right">Цена</th>
                <th class="right">Сумма</th>
                <th class="center">Взял</th>
              </tr>
            </thead>
            <tbody>
              <tr class="cat-row">
                <td colspan="8">${E(g.name)}${y?` — ${y}`:""}</td>
              </tr>
              ${f}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="6" class="right">Итого по магазину</td>
                <td class="right amount">${J(g.sum)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>`}).join(""),n=[];x.shortageCount>0&&n.push(`Позиций с нехваткой на складе магазина: ${x.shortageCount} — уточните наличие перед выездом`),x.unknownShopCount>0&&n.push(`Позиций без выбранного магазина: ${x.unknownShopCount}`),x.saved>0&&n.push(`Экономия за счёт выбора магазина: ${J(x.saved)}`);const l=n.length?`<div class="notes">${n.map(g=>`<div>• ${g}</div>`).join("")}</div>`:"",c=`
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Segoe UI', Arial, sans-serif;
    color: #1a1a1a;
    background: #ffffff;
    padding: 24px;
  }
  .est-root { max-width: 900px; margin: 0 auto; background: #ffffff; }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 3px solid #5C3A11;
    padding-bottom: 16px;
    margin-bottom: 24px;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 22px;
    font-weight: 700;
    letter-spacing: -0.5px;
  }
  .brand .brand-logo {
    width: 96px;
    height: 52px;
    min-width: 96px;
    object-fit: contain;
    object-position: left center;
    flex: 0 0 auto;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .brand span { color: #7A4E10; }
  .doc-title { text-align: right; }
  .doc-title h1 { font-size: 20px; margin: 0 0 4px; }
  .doc-title p { margin: 0; font-size: 13px; }
  .doc-subtitle h2 { font-size: 19px; margin: 0; letter-spacing: -0.3px; }
  .doc-subtitle p { margin: 4px 0 0; font-size: 12px; }
  hr.thin { border: none; border-top: 1.5px solid #7A4E10; margin: 20px 0; }
  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px 32px;
    border: 1.5px solid #7A4E10;
    border-radius: 10px;
    padding: 16px;
    margin-bottom: 20px;
    font-size: 13px;
  }
  .info-grid .label {
    color: #6B4508;
    font-size: 11.5px;
    font-weight: 700;
    text-transform: uppercase;
    margin-bottom: 3px;
  }
  .info-grid .value { font-size: 13.5px; font-weight: 600; }
  .notes {
    border: 1.5px solid #7A4E10;
    border-radius: 10px;
    padding: 12px 16px;
    margin-bottom: 20px;
    font-size: 12.5px;
    line-height: 1.7;
  }
  .room-block { margin-bottom: 18px; page-break-inside: avoid; }
  table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
  th {
    background: #F3ECE0;
    color: #3d2a08;
    text-align: left;
    padding: 9px 8px;
    font-size: 11px;
    text-transform: uppercase;
    font-weight: 700;
    border-bottom: 1.5px solid #7A4E10;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  td { padding: 8px; border-bottom: 1px solid #E5DCCB; vertical-align: top; }
  .cat-row td {
    background: #FAF6EF;
    font-weight: 700;
    font-size: 12.5px;
    color: #3d2a08;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .num { width: 34px; color: #6B4508; }
  .center { text-align: center; }
  .right { text-align: right; }
  .amount { font-weight: 700; }
  .sub { font-size: 11px; color: #6B4508; margin-top: 2px; }
  .muted { color: #8a7a5f; }
  .ok { color: #1d6b3a; font-weight: 600; }
  .warn { color: #9c2b2b; font-weight: 700; }
  .check {
    width: 44px;
  }
  .check::after {
    content: "";
    display: inline-block;
    width: 15px;
    height: 15px;
    border: 1.5px solid #7A4E10;
    border-radius: 3px;
  }
  tfoot td {
    border-top: 1.5px solid #7A4E10;
    border-bottom: none;
    padding-top: 9px;
    font-weight: 700;
    font-size: 12.5px;
  }
  .summary { display: flex; justify-content: flex-end; margin-top: 18px; }
  .summary-box {
    min-width: 320px;
    border: 1.5px solid #7A4E10;
    border-radius: 10px;
    padding: 14px 18px;
  }
  .summary-row {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    padding: 3px 0;
  }
  .summary-total {
    display: flex;
    justify-content: space-between;
    font-size: 16px;
    font-weight: 800;
    border-top: 1.5px solid #7A4E10;
    margin-top: 8px;
    padding-top: 8px;
  }
  .parties {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 32px;
    font-size: 12.5px;
  }
  .parties .label {
    color: #6B4508;
    font-size: 11px;
    text-transform: uppercase;
    font-weight: 700;
    margin-bottom: 4px;
  }
  .parties .name { font-weight: 600; }
  .footer {
    margin-top: 22px;
    text-align: center;
    color: #6B4508;
    font-size: 11px;
  }
  /* Колонтитулы: сверху объект и заказчик, снизу номер страницы */
  @page {
    size: A4;
    margin: 16mm 12mm 14mm;
    @top-left {
      content: "${he(`Список закупок · объект ${i.object_code||""}`.trim())}";
      font-family: Arial, sans-serif;
      font-size: 8.5pt;
      color: #6B4508;
    }
    @top-right {
      content: "${he(i.client_name||r)}";
      font-family: Arial, sans-serif;
      font-size: 8.5pt;
      color: #6B4508;
    }
    @bottom-center {
      content: "Страница " counter(page) " из " counter(pages);
      font-family: Arial, sans-serif;
      font-size: 8.5pt;
      color: #555555;
    }
  }
  @media print {
    body { padding: 0; }

    /* Список переносим по строкам, а не блоком целиком, иначе внизу
       листа остаётся пустота. Шапка повторяется на каждой странице. */
    .room-block { break-inside: auto; }
    table { break-inside: auto; }
    tr { break-inside: avoid; }
    thead { display: table-header-group; }
    tbody { orphans: 3; widows: 3; }
  }
`,a=x.shops.length,$=`
  <div class="header">
    <div class="brand"><img class="brand-logo" src="${window.location.origin}/logo-print.png" alt="FixKey"/><b class="brand-word">Fix<span>Key</span></b></div>
    <div class="doc-title">
      <h1>Список на закупку</h1>
      <p>Объект № ${E(i.object_code)}</p>
    </div>
  </div>

  <div class="doc-subtitle">
    <h2>СПИСОК НА ЗАКУПКУ</h2>
    <p>Что купить, сколько и в каком магазине</p>
  </div>

  <hr class="thin" />

  <div class="info-grid">
    <div>
      <div class="label">ID объекта</div>
      <div class="value">${E(i.object_code)}</div>
    </div>
    <div>
      <div class="label">Заказчик</div>
      <div class="value">${E(i.client_name)}</div>
    </div>
    <div>
      <div class="label">Адрес объекта</div>
      <div class="value">${E(i.address||"—")}</div>
    </div>
    <div>
      <div class="label">Магазинов в списке</div>
      <div class="value">${a}</div>
    </div>
  </div>

  ${l}

  ${u}

  <div class="summary">
    <div class="summary-box">
      ${x.shops.map(g=>`
      <div class="summary-row">
        <span>${E(g.name)}</span>
        <span>${J(g.sum)}</span>
      </div>`).join("")}
      <div class="summary-total">
        <span>ИТОГО:</span>
        <span>${J(x.total)}</span>
      </div>
    </div>
  </div>

  <hr class="thin" />

  <div class="parties">
    <div>
      <div class="label">Закупку производит</div>
      <div class="name">${E(r)}</div>
    </div>
    <div>
      <div class="label">Объект</div>
      <div class="name">${E(i.client_name)}</div>
    </div>
  </div>`,t=`Список на закупку № ${i.object_code} — ${E(i.client_name)}`;return{styles:c,bodyContent:$,title:t}}function ue(i,d,o,r,x=!1){const{styles:u,bodyContent:n,title:l}=Me(i,d,o,r),c=`<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8" />
<title>${l}</title>
<style>${u}</style>
</head>
<body>
<div class="est-root">${n}</div>
</body>
</html>`,a=window.open("","_blank","width=900,height=1000");a&&(a.document.open(),a.document.write(c),a.document.close(),x&&(a.onload=()=>{a.focus(),a.print()}))}const P=i=>new Intl.NumberFormat("ru-RU",{maximumFractionDigits:2}).format(i||0)+" ₽",v=i=>Number(i||0),F="w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50",Ee=["шт","м²","м","м.п.","м³","кг","т","л","уп","рул","меш","компл"],de="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm px-4 py-2.5 rounded-lg disabled:opacity-40";function Pe({object:i,items:d,catalog:o,companyName:r,onClose:x}){const u=b.useMemo(()=>fe(d,o),[d,o]);return b.useEffect(()=>{const n=l=>{l.key==="Escape"&&x()};return window.addEventListener("keydown",n),()=>window.removeEventListener("keydown",n)},[x]),e.jsx("div",{className:"fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm",onClick:x,children:e.jsxs("div",{className:"my-8 w-full max-w-4xl rounded-xl border border-white/10 bg-[#1f1f1f] p-6",onClick:n=>n.stopPropagation(),children:[e.jsxs("div",{className:"mb-5 flex items-start justify-between gap-4",children:[e.jsxs("div",{children:[e.jsx("div",{className:"text-base font-medium",children:"Список на закупку"}),e.jsxs("div",{className:"mt-0.5 text-xs text-white/40",children:["Объект № ",i.object_code," · ",i.client_name]})]}),e.jsx("button",{className:"rounded-lg p-1.5 text-white/40 transition-colors hover:text-white",onClick:x,children:e.jsx(C,{name:"X",size:18})})]}),e.jsxs("div",{className:"mb-5 flex flex-wrap gap-3",children:[e.jsxs("div",{className:"min-w-[130px] flex-1 rounded-lg border border-white/10 bg-[#161616] px-4 py-3",children:[e.jsx("div",{className:"text-xs text-white/40",children:"Итого закупка"}),e.jsx("div",{className:"mt-1 text-lg text-[#D4AF37]",children:P(u.total)})]}),e.jsxs("div",{className:"min-w-[130px] flex-1 rounded-lg border border-white/10 bg-[#161616] px-4 py-3",children:[e.jsx("div",{className:"text-xs text-white/40",children:"Магазинов"}),e.jsx("div",{className:"mt-1 text-lg",children:u.shops.length})]}),u.saved>0&&e.jsxs("div",{className:"min-w-[130px] flex-1 rounded-lg border border-emerald-500/30 bg-[#161616] px-4 py-3",children:[e.jsx("div",{className:"text-xs text-white/40",children:"Экономия на выборе"}),e.jsx("div",{className:"mt-1 text-lg text-emerald-400",children:P(u.saved)})]}),u.shortageCount>0&&e.jsxs("div",{className:"min-w-[130px] flex-1 rounded-lg border border-red-500/30 bg-[#161616] px-4 py-3",children:[e.jsx("div",{className:"text-xs text-white/40",children:"Не хватает"}),e.jsxs("div",{className:"mt-1 text-lg text-red-400",children:[u.shortageCount," поз."]})]})]}),u.shops.length===0?e.jsx("div",{className:"rounded-lg border border-dashed border-white/10 py-12 text-center text-sm text-white/30",children:"На объекте пока нет материалов"}):e.jsx("div",{className:"space-y-4",children:u.shops.map(n=>e.jsxs("div",{className:"rounded-lg border border-white/10 bg-[#161616]",children:[e.jsxs("div",{className:"flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3",children:[e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center gap-2 text-sm",children:[n.name,n.hasShortage&&e.jsx("span",{className:"rounded bg-red-500/15 px-1.5 py-0.5 text-[10px] uppercase text-red-400",children:"не всё есть"})]}),(n.address||n.phone)&&e.jsxs("div",{className:"mt-0.5 text-xs text-white/30",children:[n.address,n.address&&n.phone?" · ":"",n.phone&&e.jsx("a",{href:`tel:${n.phone}`,className:"hover:text-[#D4AF37]",children:n.phone})]})]}),e.jsx("div",{className:"whitespace-nowrap text-sm text-[#D4AF37]",children:P(n.sum)})]}),e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"w-full text-sm",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"border-b border-white/5 text-xs uppercase text-white/40",children:[e.jsx("th",{className:"py-2 pl-4 pr-3 text-left font-medium",children:"Материал"}),e.jsx("th",{className:"py-2 pr-3 text-right font-medium",children:"Нужно"}),e.jsx("th",{className:"py-2 pr-3 text-left font-medium",children:"Наличие"}),e.jsx("th",{className:"py-2 pr-3 text-right font-medium",children:"Цена"}),e.jsx("th",{className:"py-2 pr-4 text-right font-medium",children:"Сумма"})]})}),e.jsx("tbody",{children:n.lines.map((l,c)=>e.jsxs("tr",{className:"border-b border-white/5 last:border-0",children:[e.jsxs("td",{className:"py-2.5 pl-4 pr-3",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{children:l.name}),l.shopUrl&&e.jsx("a",{href:l.shopUrl,target:"_blank",rel:"noreferrer",title:"Открыть страницу товара в магазине",className:"shrink-0 text-white/40 transition-colors hover:text-[#D4AF37]",children:e.jsx(C,{name:"ExternalLink",size:14})})]}),l.roomName&&e.jsx("div",{className:"text-xs text-white/30",children:l.roomName})]}),e.jsxs("td",{className:"whitespace-nowrap py-2.5 pr-3 text-right text-white/60",children:[l.qty," ",l.unit]}),e.jsx("td",{className:"whitespace-nowrap py-2.5 pr-3 text-xs",children:l.stock===null?e.jsx("span",{className:"text-white/30",children:"не указано"}):l.enough?e.jsxs("span",{className:"text-emerald-400",children:["есть ",l.stock," ",l.unit]}):e.jsxs("span",{className:"text-red-400",children:["есть ",l.stock,", не хватает ",l.missing]})}),e.jsx("td",{className:"whitespace-nowrap py-2.5 pr-3 text-right text-white/60",children:P(v(l.price))}),e.jsx("td",{className:"whitespace-nowrap py-2.5 pr-4 text-right text-[#D4AF37]",children:P(l.sum)})]},c))})]})})]},n.name))}),e.jsxs("div",{className:"mt-6 flex flex-wrap items-center gap-3",children:[e.jsxs("button",{className:"flex items-center gap-2 rounded-lg bg-[#D4AF37] px-5 py-2.5 text-sm text-[#161616] transition-colors hover:bg-[#B8860B] disabled:opacity-40",disabled:u.shops.length===0,onClick:()=>ue(i,d,o,r,!0),children:[e.jsx(C,{name:"Printer",size:16}),"Распечатать список"]}),e.jsxs("button",{className:"flex items-center gap-2 rounded-lg border border-white/10 px-5 py-2.5 text-sm text-white/60 transition-colors hover:text-white disabled:opacity-40",disabled:u.shops.length===0,onClick:()=>ue(i,d,o,r,!1),children:[e.jsx(C,{name:"Eye",size:16}),"Открыть для просмотра"]})]})]})})}const re=i=>new Intl.NumberFormat("ru-RU",{maximumFractionDigits:2}).format(i||0)+" ₽",D=i=>Number(i||0),W="w-full bg-[#1f1f1f] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50",Be="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm px-4 py-2.5 rounded-lg disabled:opacity-40",qe=[{value:"area",label:"Пол / потолок (площадь)"},{value:"wall_area",label:"Стены (площадь)"},{value:"perimeter",label:"Периметр"}];function Le({objectId:i,materials:d,rooms:o,existing:r,onAdd:x,onCancel:u}){const n=b.useMemo(()=>o.filter(m=>m.object_id===i),[o,i]),[l,c]=b.useState(""),[a,$]=b.useState(""),[t,g]=b.useState("area"),[f,y]=b.useState(""),[p,A]=b.useState("1"),[z,M]=b.useState("10"),[B,_]=b.useState(!1),[w,S]=b.useState("merge"),s=d.find(m=>String(m.id)===l),k=n.find(m=>String(m.id)===a),X=b.useMemo(()=>D(a==="manual"||!k?f:k[t]),[k,a,t,f])*Math.max(D(p)||1,1),Q=D(s==null?void 0:s.consumption),q=Fe(X,Q,oe(s)),G=q*(1+D(z)/100),O=Math.ceil(G*100)/100,U=Math.ceil(G),ne=U*D(s==null?void 0:s.price),ee=!!s&&Q>0&&X>0,L=b.useMemo(()=>!s||!k?null:r.find(m=>m.material_id===s.id&&m.room_id===k.id)||null,[r,s,k]),se=b.useMemo(()=>k?r.filter(m=>m.room_id===k.id):[],[r,k]),H=k?`${k.name}: ${X.toFixed(2)} ${(s==null?void 0:s.consumption_unit)||""}, запас ${D(z)}%`:`Расчёт: ${X.toFixed(2)} ${(s==null?void 0:s.consumption_unit)||""}, запас ${D(z)}%`,ae=async()=>{if(s){_(!0);try{await x({material_id:s.id,qty:U,note:H,room_id:k?k.id:null,room_name:k?k.name:"",work_type:"",merge:w==="merge"}),c("")}finally{_(!1)}}};return d.length===0?e.jsxs("div",{className:"text-sm text-white/40",children:["Справочник пуст —"," ",e.jsx(le,{to:"/cabinet/materials/new",className:"text-[#D4AF37] hover:underline",children:"добавьте материал"})]}):e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"grid gap-3 md:grid-cols-2",children:[e.jsxs("div",{children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Материал"}),e.jsxs("select",{className:W,value:l,onChange:m=>c(m.target.value),children:[e.jsx("option",{value:"",children:"Выберите материал из справочника"}),d.map(m=>e.jsxs("option",{value:m.id,children:[m.name," — ",re(D(m.price)),"/",m.unit,D(m.consumption)>0?` · ${ge(m)}`:""]},m.id))]}),s&&Q<=0&&e.jsx("div",{className:"mt-1.5 text-xs text-amber-400",children:"У этого материала не указан расход — расчёт невозможен"})]}),e.jsxs("div",{children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Помещение"}),e.jsxs("select",{className:W,value:a,onChange:m=>$(m.target.value),children:[e.jsx("option",{value:"",children:"Выберите помещение"}),n.map(m=>e.jsxs("option",{value:m.id,children:[m.name," — пол ",D(m.area)," м², стены ",D(m.wall_area)," м²"]},m.id)),e.jsx("option",{value:"manual",children:"Ввести площадь вручную"})]}),n.length===0&&e.jsx("div",{className:"mt-1.5 text-xs text-white/40",children:"У объекта нет помещений — введите площадь вручную"})]})]}),e.jsxs("div",{className:"grid gap-3 md:grid-cols-4",children:[a==="manual"||!k?e.jsxs("div",{children:[e.jsxs("label",{className:"mb-1.5 block text-xs text-white/50",children:["Площадь / длина, ",(s==null?void 0:s.consumption_unit)||"м²"]}),e.jsx("input",{className:W,type:"number",min:"0",step:"0.01",placeholder:"0",value:f,onChange:m=>y(m.target.value)})]}):e.jsxs("div",{children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Что обрабатываем"}),e.jsx("select",{className:W,value:t,onChange:m=>g(m.target.value),children:qe.map(m=>e.jsx("option",{value:m.value,children:m.label},m.value))})]}),e.jsxs("div",{children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Слоёв"}),e.jsx("input",{className:W,type:"number",min:"1",step:"1",value:p,onChange:m=>A(m.target.value)})]}),e.jsxs("div",{children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Запас, %"}),e.jsx("input",{className:W,type:"number",min:"0",step:"1",value:z,onChange:m=>M(m.target.value)})]}),e.jsx("div",{className:"flex items-end",children:e.jsxs("button",{className:Be,onClick:ae,disabled:!ee||B,children:[e.jsx(C,{name:B?"Loader2":"Plus",size:16,className:B?"animate-spin":""}),L&&w==="merge"?"Добавить к расчёту":"Сохранить в объект"]})})]}),se.length>0&&k&&e.jsxs("div",{className:"rounded-lg border border-white/10 bg-[#1f1f1f] p-4",children:[e.jsxs("div",{className:"mb-2 text-xs uppercase text-white/40",children:["Уже рассчитано по помещению «",k.name,"»"]}),e.jsx("div",{className:"space-y-1.5 text-sm text-white/60",children:se.map(m=>e.jsxs("div",{className:"flex flex-wrap justify-between gap-2",children:[e.jsx("span",{children:m.name}),e.jsxs("span",{children:[D(m.qty)," ",m.unit," · ",re(D(m.qty)*D(m.price))]})]},m.id))})]}),L&&e.jsxs("div",{className:"rounded-lg border border-amber-500/30 bg-amber-500/5 p-4",children:[e.jsxs("div",{className:"mb-3 flex items-start gap-2 text-sm text-amber-200",children:[e.jsx(C,{name:"TriangleAlert",size:15,className:"mt-0.5 shrink-0"}),e.jsxs("span",{children:["По помещению «",k==null?void 0:k.name,"» уже есть расчёт «",L.name,"» — ",D(L.qty)," ",L.unit,". Что сделать с новым расчётом?"]})]}),e.jsxs("div",{className:"flex flex-wrap gap-4 text-sm",children:[e.jsxs("label",{className:"flex cursor-pointer items-center gap-2",children:[e.jsx("input",{type:"radio",className:"accent-[#D4AF37]",checked:w==="merge",onChange:()=>S("merge")}),"Добавить к существующему (",D(L.qty)," + ",U," = ",D(L.qty)+U," ",L.unit,")"]}),e.jsxs("label",{className:"flex cursor-pointer items-center gap-2",children:[e.jsx("input",{type:"radio",className:"accent-[#D4AF37]",checked:w==="new",onChange:()=>S("new")}),"Добавить отдельной строкой"]})]})]}),ee&&e.jsxs("div",{className:"rounded-lg border border-[#D4AF37]/30 bg-[#1f1f1f] p-4",children:[e.jsxs("div",{className:"mb-3 flex items-center gap-2 text-xs uppercase text-white/40",children:[e.jsx(C,{name:"Calculator",size:14,className:"text-[#D4AF37]"}),"Результат расчёта"]}),e.jsxs("div",{className:"grid gap-4 text-sm sm:grid-cols-4",children:[e.jsxs("div",{children:[e.jsx("div",{className:"text-xs text-white/40",children:"Площадь с учётом слоёв"}),e.jsxs("div",{children:[X.toFixed(2)," ",s==null?void 0:s.consumption_unit]})]}),e.jsxs("div",{children:[e.jsx("div",{className:"text-xs text-white/40",children:"Чистый расход"}),e.jsxs("div",{children:[q.toFixed(2)," ",s==null?void 0:s.unit]})]}),e.jsxs("div",{children:[e.jsxs("div",{className:"text-xs text-white/40",children:["С запасом ",D(z),"%"]}),e.jsxs("div",{children:[O.toFixed(2)," ",s==null?void 0:s.unit]})]}),e.jsxs("div",{children:[e.jsx("div",{className:"text-xs text-white/40",children:"К покупке"}),e.jsxs("div",{className:"text-[#D4AF37]",children:[U," ",s==null?void 0:s.unit," · ",re(ne)]})]})]}),e.jsxs("div",{className:"mt-3 border-t border-white/10 pt-3 text-xs text-white/40",children:["1 ",s==null?void 0:s.unit," покрывает ",Q," ",s==null?void 0:s.consumption_unit,s!=null&&s.shop_name?` · магазин: ${s.shop_name}`:""]})]}),e.jsx("button",{className:"text-sm text-white/40 transition-colors hover:text-white",onClick:u,children:"Свернуть калькулятор"})]})}function Ie(i,d){const o=d.find(n=>n.id===i.material_id);if(!o)return"";const r=o.offers||[],x=(i.shop_name||"").trim().toLowerCase();if(x){const n=r.find(l=>(l.shop_name||"").trim().toLowerCase()===x&&l.shop_url);if(n)return n.shop_url}const u=r.find(n=>n.shop_url);return(u==null?void 0:u.shop_url)||o.shop_url||""}function Te({objects:i,materials:d,rooms:o,companyName:r,selectedObject:x,setSelectedObject:u,activeObject:n,showCalc:l,setShowCalc:c,savingEstimate:a,saveEstimate:$,materialsOf:t,sumOf:g,groupedByRoom:f,addFromCalc:y,openEdit:p,run:A}){const[z,M]=b.useState(!1),B=_=>Ie(_,d);return e.jsxs("div",{className:"rounded-xl border border-white/10 bg-[#1f1f1f] p-5",children:[i.length===0?e.jsxs("div",{className:"py-16 text-center text-sm text-white/30",children:["Объектов пока нет —"," ",e.jsx(le,{to:"/cabinet/objects",className:"text-[#D4AF37] hover:underline",children:"создать объект"})]}):e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"mb-5 flex flex-wrap items-end gap-3",children:[e.jsxs("div",{className:"min-w-[280px] flex-1",children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Объект"}),e.jsxs("select",{className:F,value:x??"",onChange:_=>{u(_.target.value?Number(_.target.value):null),c(!1)},children:[e.jsx("option",{value:"",children:"Выберите объект"}),i.map(_=>e.jsxs("option",{value:_.id,children:[_.object_code," — ",_.client_name,_.address?` · ${_.address}`:""]},_.id))]})]}),n&&e.jsxs(e.Fragment,{children:[e.jsxs("button",{className:de,onClick:()=>c(!l),children:[e.jsx(C,{name:l?"X":"Calculator",size:16}),l?"Свернуть":"Рассчитать помещение"]}),e.jsxs("button",{className:"flex items-center gap-2 rounded-lg border border-[#D4AF37]/40 px-4 py-2.5 text-sm text-[#D4AF37] transition-colors hover:bg-[#D4AF37]/10 disabled:opacity-40",disabled:t(n.id).length===0||a,onClick:$,children:[e.jsx(C,{name:a?"Loader2":"FileText",size:16,className:a?"animate-spin":""}),"Сохранить смету на материал"]}),e.jsxs("button",{className:"flex items-center gap-2 rounded-lg border border-[#D4AF37]/40 px-4 py-2.5 text-sm text-[#D4AF37] transition-colors hover:bg-[#D4AF37]/10 disabled:opacity-40",disabled:t(n.id).length===0,onClick:()=>M(!0),children:[e.jsx(C,{name:"ShoppingCart",size:16}),"Список на закупку"]})]})]}),n?e.jsxs(e.Fragment,{children:[l&&e.jsx("div",{className:"mb-5 rounded-lg border border-[#D4AF37]/30 bg-[#161616] p-4",children:e.jsx(Le,{objectId:n.id,materials:d,rooms:o,existing:t(n.id),onAdd:y,onCancel:()=>c(!1)})}),e.jsxs("div",{className:"mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#161616] px-4 py-3 text-sm",children:[e.jsxs("div",{className:"text-white/60",children:[n.object_code," — ",n.client_name,e.jsxs("span",{className:"ml-2 text-white/30",children:[t(n.id).length," позиций"]})]}),e.jsxs("div",{className:"text-[#D4AF37]",children:["Итого: ",P(g(n.id))]})]}),t(n.id).length===0?e.jsx("div",{className:"py-14 text-center text-sm text-white/30",children:"Для этого объекта расчётов ещё нет — нажмите «Рассчитать помещение»"}):e.jsx("div",{className:"space-y-4",children:f(n.id).map(_=>e.jsxs("div",{className:"rounded-lg border border-white/10 bg-[#161616]",children:[e.jsxs("div",{className:"flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3",children:[e.jsxs("div",{className:"flex items-center gap-2 text-sm",children:[e.jsx(C,{name:"DoorOpen",size:15,className:"text-[#D4AF37]"}),_.title]}),e.jsx("div",{className:"text-sm text-[#D4AF37]",children:P(_.sum)})]}),e.jsx("div",{className:"overflow-x-auto p-4",children:e.jsxs("table",{className:"w-full text-sm",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"border-b border-white/10 text-xs uppercase text-white/40",children:[e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Материал"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Ссылка"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Кол-во"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Цена"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Сумма"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Магазин"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Действия"})]})}),e.jsx("tbody",{children:_.items.map(w=>e.jsxs("tr",{className:"border-b border-white/5 last:border-0",children:[e.jsxs("td",{className:"py-2.5 pr-4",children:[w.name,w.note&&e.jsx("div",{className:"text-xs text-white/30",children:w.note})]}),e.jsx("td",{className:"py-2.5 pr-4",children:(()=>{const S=B(w);return S?e.jsxs("a",{href:S,target:"_blank",rel:"noreferrer",title:"Открыть страницу товара в магазине",className:"inline-flex items-center gap-1.5 text-white/60 transition-colors hover:text-[#D4AF37]",children:[e.jsx(C,{name:"ExternalLink",size:14}),e.jsx("span",{className:"text-xs",children:"Открыть"})]}):e.jsx("span",{className:"text-white/30",children:"—"})})()}),e.jsxs("td",{className:"whitespace-nowrap py-2.5 pr-4",children:[v(w.qty)," ",w.unit]}),e.jsx("td",{className:"py-2.5 pr-4 text-white/60",children:P(v(w.price))}),e.jsx("td",{className:"whitespace-nowrap py-2.5 pr-4 text-[#D4AF37]",children:P(v(w.qty)*v(w.price))}),e.jsx("td",{className:"py-2.5 pr-4 text-white/60",children:w.shop_name||"—"}),e.jsx("td",{className:"py-2.5 pr-4",children:e.jsxs("div",{className:"flex items-center gap-2.5",children:[e.jsx("button",{className:"text-white/50 transition-colors hover:text-[#D4AF37]",title:"Просмотр",onClick:()=>ie(n,[w],d,r),children:e.jsx(C,{name:"Eye",size:16})}),e.jsx("button",{className:"text-white/50 transition-colors hover:text-[#D4AF37]",title:"Редактировать",onClick:()=>p(w),children:e.jsx(C,{name:"Pencil",size:16})}),e.jsx("button",{className:"text-white/50 transition-colors hover:text-[#D4AF37]",title:"Печать",onClick:()=>ie(n,[w],d,r,!0),children:e.jsx(C,{name:"Printer",size:16})}),e.jsx("button",{className:"text-white/50 transition-colors hover:text-[#D4AF37]",title:"Скачать PDF",onClick:()=>$e(n,[w],d,r),children:e.jsx(C,{name:"FileDown",size:16})}),e.jsx(ce,{onConfirm:()=>A(()=>R.removeFromObject(w.id))})]})})]},w.id))})]})})]},_.key))})]}):e.jsx("div",{className:"py-16 text-center text-sm text-white/30",children:"Выберите объект, чтобы увидеть его расчёты и материалы"})]}),z&&n&&e.jsx(Pe,{object:n,items:t(n.id),catalog:d,companyName:r,onClose:()=>M(!1)})]})}const V="mb-1.5 block text-xs text-white/50",be={shop_name:"",shop_address:"",shop_phone:"",shop_url:"",price:"",stock:"",stock_known:!1,note:""};function Ue({materialId:i,unit:d,offers:o,onChanged:r}){const[x,u]=b.useState(null),[n,l]=b.useState(!1),[c,a]=b.useState(be),[$,t]=b.useState(!1),[g,f]=b.useState(""),y=(s,k)=>a(Z=>({...Z,[s]:k})),p=o.map(s=>v(s.price)).filter(s=>s>0),A=p.length?Math.min(...p):0,z=()=>{a(be),u(null),l(!0),f("")},M=s=>{a({shop_name:s.shop_name||"",shop_address:s.shop_address||"",shop_phone:s.shop_phone||"",shop_url:s.shop_url||"",price:v(s.price)?String(v(s.price)):"",stock:s.stock_known?String(v(s.stock)):"",stock_known:!!s.stock_known,note:s.note||""}),l(!1),u(s.id),f("")},B=()=>{l(!1),u(null),f("")},_=async()=>{f(""),t(!0);try{const s={...c,price:Number(c.price||0),stock:Number(c.stock||0)};x?await R.updateOffer(x,s):await R.createOffer({...s,material_id:i}),B(),r()}catch(s){f((s==null?void 0:s.message)||"Не удалось сохранить магазин")}finally{t(!1)}},w=async s=>{f("");try{await R.removeOffer(s),r()}catch(k){f((k==null?void 0:k.message)||"Не удалось удалить магазин")}},S=e.jsxs("div",{className:"rounded-lg border border-[#D4AF37]/30 bg-[#161616] p-4",children:[e.jsxs("div",{className:"grid grid-cols-1 gap-4 sm:grid-cols-2",children:[e.jsxs("div",{children:[e.jsx("label",{className:V,children:"Название магазина"}),e.jsx("input",{className:F,placeholder:"Например: Леруа Мерлен",value:c.shop_name,onChange:s=>y("shop_name",s.target.value)})]}),e.jsxs("div",{children:[e.jsxs("label",{className:V,children:["Цена за 1 ",d,", ₽"]}),e.jsx("input",{className:F,type:"number",min:"0",step:"0.01",placeholder:"0",value:c.price,onChange:s=>y("price",s.target.value)})]}),e.jsxs("div",{children:[e.jsx("label",{className:V,children:"Адрес"}),e.jsx("input",{className:F,placeholder:"Город, улица, дом",value:c.shop_address,onChange:s=>y("shop_address",s.target.value)})]}),e.jsxs("div",{children:[e.jsx("label",{className:V,children:"Телефон"}),e.jsx("input",{className:F,type:"tel",placeholder:"+7",value:c.shop_phone,onChange:s=>y("shop_phone",s.target.value)})]}),e.jsxs("div",{className:"sm:col-span-2",children:[e.jsx("label",{className:V,children:"Ссылка на товар"}),e.jsx("input",{className:F,placeholder:"https://",value:c.shop_url,onChange:s=>y("shop_url",s.target.value)})]}),e.jsx("div",{className:"sm:col-span-2",children:e.jsxs("label",{className:"flex cursor-pointer items-center gap-2 text-sm text-white/70",children:[e.jsx("input",{type:"checkbox",className:"h-4 w-4 accent-[#D4AF37]",checked:c.stock_known,onChange:s=>y("stock_known",s.target.checked)}),"Знаю, сколько есть в наличии"]})}),c.stock_known&&e.jsxs("div",{children:[e.jsxs("label",{className:V,children:["Сколько есть, ",d]}),e.jsx("input",{className:F,type:"number",min:"0",step:"0.01",placeholder:"0",value:c.stock,onChange:s=>y("stock",s.target.value)})]}),e.jsxs("div",{className:c.stock_known?"":"sm:col-span-2",children:[e.jsx("label",{className:V,children:"Примечание"}),e.jsx("input",{className:F,placeholder:"Необязательно",value:c.note,onChange:s=>y("note",s.target.value)})]})]}),e.jsxs("div",{className:"mt-4 flex flex-wrap items-center gap-2",children:[e.jsxs("button",{className:"flex items-center gap-2 rounded-lg bg-[#D4AF37] px-4 py-2 text-sm text-[#161616] transition-colors hover:bg-[#B8860B] disabled:opacity-40",onClick:_,disabled:$||c.shop_name.trim().length<2,children:[e.jsx(C,{name:$?"Loader2":"Check",size:15,className:$?"animate-spin":""}),x?"Сохранить магазин":"Добавить магазин"]}),e.jsx("button",{className:"rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 transition-colors hover:text-white",onClick:B,children:"Отмена"})]})]});return e.jsxs("div",{children:[e.jsxs("div",{className:"mb-3 flex flex-wrap items-center justify-between gap-3",children:[e.jsxs("div",{children:[e.jsx("div",{className:"text-xs uppercase text-white/40",children:"Магазины и цены"}),e.jsx("div",{className:"mt-1 text-xs text-white/30",children:"Добавьте все магазины — увидите, где дешевле и где есть в наличии"})]}),!n&&x===null&&e.jsxs("button",{className:"flex items-center gap-1.5 rounded-lg border border-[#D4AF37]/40 px-3 py-1.5 text-sm text-[#D4AF37] transition-colors hover:bg-[#D4AF37]/10",onClick:z,children:[e.jsx(C,{name:"Plus",size:15}),"Добавить магазин"]})]}),g&&e.jsx("div",{className:"mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300",children:g}),o.length===0&&!n&&e.jsx("div",{className:"rounded-lg border border-dashed border-white/10 py-8 text-center text-sm text-white/30",children:"Магазины не добавлены"}),e.jsx("div",{className:"space-y-2",children:o.map(s=>x===s.id?e.jsx("div",{children:S},s.id):e.jsxs("div",{className:"flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-white/10 bg-[#161616] px-4 py-3",children:[e.jsxs("div",{className:"min-w-[150px] flex-1",children:[e.jsxs("div",{className:"flex items-center gap-2 text-sm",children:[s.shop_url?e.jsx("a",{href:s.shop_url,target:"_blank",rel:"noreferrer",className:"hover:text-[#D4AF37]",children:s.shop_name||"Без названия"}):e.jsx("span",{children:s.shop_name||"Без названия"}),v(s.price)>0&&v(s.price)===A&&o.length>1&&e.jsx("span",{className:"rounded bg-[#D4AF37]/15 px-1.5 py-0.5 text-[10px] uppercase text-[#D4AF37]",children:"дешевле"})]}),s.shop_address&&e.jsx("div",{className:"mt-0.5 text-xs text-white/30",children:s.shop_address}),s.note&&e.jsx("div",{className:"mt-0.5 text-xs text-white/30",children:s.note})]}),e.jsx("div",{className:"whitespace-nowrap text-sm text-[#D4AF37]",children:v(s.price)>0?`${P(v(s.price))} / ${d}`:"цена не указана"}),e.jsx("div",{className:"min-w-[110px] whitespace-nowrap text-xs",children:s.stock_known?v(s.stock)>0?e.jsxs("span",{className:"text-emerald-400",children:["в наличии ",v(s.stock)," ",d]}):e.jsx("span",{className:"text-red-400",children:"нет в наличии"}):e.jsx("span",{className:"text-white/30",children:"наличие не указано"})}),s.shop_phone&&e.jsx("a",{href:`tel:${s.shop_phone}`,className:"whitespace-nowrap text-xs text-white/50 hover:text-[#D4AF37]",children:s.shop_phone}),e.jsxs("div",{className:"flex items-center gap-1",children:[e.jsx("button",{className:"rounded-lg p-2 text-white/40 transition-colors hover:bg-white/5 hover:text-[#D4AF37]",title:"Изменить магазин",onClick:()=>M(s),children:e.jsx(C,{name:"Pencil",size:14})}),e.jsx(ce,{onConfirm:()=>w(s.id)})]})]},s.id))}),n&&e.jsx("div",{className:"mt-2",children:S})]})}const Re=["шт","м²","м","м.п.","м³","кг","т","л","уп","рул","меш","компл"],He=[{value:"м²",label:"м² (квадратный метр)"},{value:"м³",label:"м³ (кубический метр)"},{value:"м.п.",label:"м/п (метр погонный)"},{value:"м",label:"м (метр)"},{value:"шт",label:"шт (штука)"},{value:"точка",label:"точка"},{value:"компл",label:"комплект"}],Y="mb-1.5 block text-xs text-white/50";function Ke({material:i,onClose:d,onSaved:o}){const[r,x]=b.useState({name:i.name||"",category:i.category||"",unit:i.unit||"шт",price:i.price?String(i.price):"",note:i.note||"",consumption:i.consumption?String(i.consumption):"",consumption_unit:i.consumption_unit||"м²",consumption_mode:oe(i)}),[u,n]=b.useState(!1),[l,c]=b.useState(""),a=(t,g)=>x(f=>({...f,[t]:g}));b.useEffect(()=>{const t=g=>{g.key==="Escape"&&d()};return window.addEventListener("keydown",t),()=>window.removeEventListener("keydown",t)},[d]);const $=async()=>{c(""),n(!0);try{await R.update(i.id,{...r,price:Number(r.price||0),consumption:Number(r.consumption||0)}),o(),d()}catch(t){c((t==null?void 0:t.message)||"Не удалось сохранить материал"),n(!1)}};return e.jsx("div",{className:"fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm",onClick:d,children:e.jsxs("div",{className:"my-8 w-full max-w-3xl rounded-xl border border-white/10 bg-[#1f1f1f] p-6",onClick:t=>t.stopPropagation(),children:[e.jsxs("div",{className:"mb-5 flex items-start justify-between gap-4",children:[e.jsxs("div",{children:[e.jsx("div",{className:"text-base font-medium",children:"Редактирование материала"}),e.jsx("div",{className:"mt-0.5 text-xs text-white/40",children:"Изменения попадут в справочник для всех новых расчётов"})]}),e.jsx("button",{className:"rounded-lg p-1.5 text-white/40 transition-colors hover:text-white",onClick:d,children:e.jsx(C,{name:"X",size:18})})]}),l&&e.jsx("div",{className:"mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300",children:l}),e.jsx("div",{className:"mb-4 text-xs uppercase text-white/40",children:"Материал"}),e.jsxs("div",{className:"grid grid-cols-1 gap-4 sm:grid-cols-2",children:[e.jsxs("div",{className:"sm:col-span-2",children:[e.jsx("label",{className:Y,children:"Название материала"}),e.jsx("input",{className:F,placeholder:"Например: Гипсокартон Knauf 12.5 мм",value:r.name,onChange:t=>a("name",t.target.value)})]}),e.jsxs("div",{children:[e.jsx("label",{className:Y,children:"Категория"}),e.jsx("input",{className:F,placeholder:"Например: Черновые материалы",value:r.category,onChange:t=>a("category",t.target.value)})]}),e.jsxs("div",{children:[e.jsx("label",{className:Y,children:"Единица измерения"}),e.jsx("select",{className:F,value:r.unit,onChange:t=>a("unit",t.target.value),children:Re.map(t=>e.jsx("option",{value:t,children:t},t))})]}),e.jsxs("div",{children:[e.jsx("label",{className:Y,children:"Цена за единицу, ₽"}),e.jsx("input",{className:F,type:"number",min:"0",step:"0.01",placeholder:"0",value:r.price,onChange:t=>a("price",t.target.value)}),e.jsx("div",{className:"mt-1 text-xs text-white/30",children:"Подставится лучшая цена из магазинов ниже"})]})]}),e.jsx("div",{className:"mb-4 mt-6 text-xs uppercase text-white/40",children:"Расход материала"}),e.jsxs("div",{className:"grid grid-cols-1 gap-4 sm:grid-cols-2",children:[e.jsxs("div",{className:"sm:col-span-2",children:[e.jsx("label",{className:Y,children:"Как считать расход"}),e.jsx("div",{className:"grid gap-2 sm:grid-cols-2",children:Se.map(t=>e.jsxs("button",{type:"button",onClick:()=>a("consumption_mode",t.value),className:`rounded-lg border px-4 py-3 text-left text-sm transition-colors ${r.consumption_mode===t.value?"border-[#D4AF37] bg-[#D4AF37]/10 text-white":"border-white/10 bg-[#161616] text-white/60 hover:border-white/25"}`,children:[e.jsx("div",{className:"font-medium",children:t.label}),e.jsx("div",{className:"mt-0.5 text-xs text-white/40",children:t.hint})]},t.value))})]}),e.jsxs("div",{children:[e.jsx("label",{className:Y,children:r.consumption_mode==="per_unit"?`Сколько ${r.unit} нужно на 1 ${r.consumption_unit}`:`Сколько ${r.consumption_unit} покрывает 1 ${r.unit}`}),e.jsx("input",{className:F,type:"number",min:"0",step:"0.001",placeholder:r.consumption_mode==="per_unit"?"Например: 3 или 0.3":"Например: 4",value:r.consumption,onChange:t=>a("consumption",t.target.value)})]}),e.jsxs("div",{children:[e.jsx("label",{className:Y,children:"Единица расхода"}),e.jsx("select",{className:F,value:r.consumption_unit,onChange:t=>a("consumption_unit",t.target.value),children:He.map(t=>e.jsx("option",{value:t.value,children:t.label},t.value))})]}),Number(r.consumption)>0&&e.jsxs("div",{className:"rounded-lg border border-[#D4AF37]/30 bg-[#161616] px-4 py-3 text-sm text-white/70 sm:col-span-2",children:[e.jsx(C,{name:"Info",size:14,className:"mr-2 inline text-[#D4AF37]"}),r.consumption_mode==="per_unit"?`На 1 ${r.consumption_unit} нужно ${Number(r.consumption)} ${r.unit}`:`1 ${r.unit} покрывает ${Number(r.consumption)} ${r.consumption_unit}`,Number(r.price)>0&&e.jsxs("span",{className:"text-white/40",children:[" ","· стоимость"," ",(r.consumption_mode==="per_unit"?Number(r.price)*Number(r.consumption):Number(r.price)/Number(r.consumption)).toFixed(2)," ","₽ за 1 ",r.consumption_unit]})]})]}),e.jsx("div",{className:"mt-6",children:e.jsx(Ue,{materialId:i.id,unit:r.unit,offers:i.offers||[],onChanged:o})}),e.jsx("div",{className:"mb-4 mt-6 text-xs uppercase text-white/40",children:"Примечание к материалу"}),e.jsx("input",{className:F,placeholder:"Необязательно",value:r.note,onChange:t=>a("note",t.target.value)}),e.jsxs("div",{className:"mt-6 flex flex-wrap items-center gap-3",children:[e.jsxs("button",{className:"flex items-center gap-2 rounded-lg bg-[#D4AF37] px-5 py-2.5 text-sm text-[#161616] transition-colors hover:bg-[#B8860B] disabled:opacity-40",onClick:$,disabled:r.name.trim().length<2||u,children:[e.jsx(C,{name:u?"Loader2":"Check",size:16,className:u?"animate-spin":""}),"Сохранить изменения"]}),e.jsx("button",{className:"rounded-lg border border-white/10 px-5 py-2.5 text-sm text-white/60 transition-colors hover:text-white",onClick:d,children:"Отмена"})]})]})})}function Xe({materials:i,filtered:d,shops:o,search:r,setSearch:x,shopFilter:u,setShopFilter:n,run:l}){const[c,a]=b.useState(null),$=i.find(t=>t.id===c)||null;return e.jsxs("div",{className:"rounded-xl border border-white/10 bg-[#1f1f1f] p-5",children:[e.jsxs("div",{className:"mb-4 flex flex-wrap items-center gap-3",children:[e.jsxs("div",{className:"relative min-w-[220px] flex-1",children:[e.jsx(C,{name:"Search",size:16,className:"absolute left-3 top-1/2 -translate-y-1/2 text-white/30"}),e.jsx("input",{className:`${F} pl-9`,placeholder:"Поиск: материал, категория, магазин, адрес",value:r,onChange:t=>x(t.target.value)})]}),e.jsxs("select",{className:`${F} max-w-[200px]`,value:u,onChange:t=>n(t.target.value),children:[e.jsx("option",{value:"",children:"Все магазины"}),o.map(t=>e.jsx("option",{value:t,children:t},t))]}),e.jsxs(le,{to:"/cabinet/materials/new",className:de,children:[e.jsx(C,{name:"Plus",size:16}),"Добавить материал"]})]}),d.length===0?e.jsx("div",{className:"py-16 text-center text-sm text-white/30",children:i.length===0?"Справочник пуст — добавьте первый материал":"Ничего не найдено по заданным условиям"}):e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"w-full text-sm",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"border-b border-white/10 text-xs uppercase text-white/40",children:[e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Материал"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Категория"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Ед. изм."}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Цена"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Расход"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Где дешевле"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Магазины"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Наличие"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Действия"})]})}),e.jsx("tbody",{children:d.map(t=>e.jsxs("tr",{className:"border-b border-white/5 last:border-0",children:[e.jsxs("td",{className:"py-3 pr-4",children:[t.name,t.note&&e.jsx("div",{className:"text-xs text-white/30",children:t.note})]}),e.jsx("td",{className:"py-3 pr-4 text-white/60",children:t.category||"—"}),e.jsx("td",{className:"py-3 pr-4 text-white/60",children:t.unit}),e.jsx("td",{className:"whitespace-nowrap py-3 pr-4 text-[#D4AF37]",children:P(v(t.price))}),e.jsx("td",{className:"whitespace-nowrap py-3 pr-4 text-white/60",children:v(t.consumption)>0?e.jsxs(e.Fragment,{children:[ge(t),v(t.price)>0&&e.jsxs("div",{className:"text-xs text-white/30",children:[(oe(t)==="per_unit"?v(t.price)*v(t.consumption):v(t.price)/v(t.consumption)).toFixed(2)," ","₽ за ",t.consumption_unit]})]}):"—"}),e.jsx("td",{className:"py-3 pr-4",children:(()=>{const f=(t.offers||[]).filter(p=>v(p.price)>0);if(f.length===0)return e.jsx("span",{className:"text-white/30",children:"—"});const y=f.reduce((p,A)=>v(A.price)<v(p.price)?A:p);return e.jsxs(e.Fragment,{children:[y.shop_url?e.jsx("a",{href:y.shop_url,target:"_blank",rel:"noreferrer",className:"hover:text-[#D4AF37]",children:y.shop_name||"—"}):y.shop_name||"—",y.shop_address&&e.jsx("div",{className:"text-xs text-white/30",children:y.shop_address})]})})()}),e.jsx("td",{className:"whitespace-nowrap py-3 pr-4 text-white/60",children:(()=>{const g=t.offers||[];if(g.length===0)return e.jsx("span",{className:"text-white/30",children:"не добавлены"});const f=g.filter(A=>v(A.price)>0).map(A=>v(A.price));if(f.length<2)return`${g.length} шт`;const y=Math.min(...f),p=Math.max(...f);return e.jsxs(e.Fragment,{children:[g.length," шт",p>y&&e.jsxs("div",{className:"text-xs text-white/30",children:["от ",P(y)," до ",P(p)]})]})})()}),e.jsx("td",{className:"whitespace-nowrap py-3 pr-4 text-xs",children:(()=>{const g=(t.offers||[]).filter(p=>p.stock_known);if(g.length===0)return e.jsx("span",{className:"text-white/30",children:"не указано"});const f=g.filter(p=>v(p.stock)>0);if(f.length===0)return e.jsx("span",{className:"text-red-400",children:"нет в наличии"});const y=f.reduce((p,A)=>p+v(A.stock),0);return e.jsxs("span",{className:"text-emerald-400",children:[y," ",t.unit,e.jsxs("div",{className:"text-white/30",children:["в ",f.length," из ",g.length]})]})})()}),e.jsx("td",{className:"py-3 pr-4",children:e.jsxs("div",{className:"flex items-center gap-1",children:[e.jsx("button",{className:"rounded-lg p-2 text-white/40 transition-colors hover:bg-white/5 hover:text-[#D4AF37]",title:"Редактировать материал",onClick:()=>a(t.id),children:e.jsx(C,{name:"Pencil",size:15})}),e.jsx(ce,{onConfirm:()=>l(()=>R.remove(t.id))})]})})]},t.id))})]})}),$&&e.jsx(Ke,{material:$,onClose:()=>a(null),onSaved:()=>l(async()=>{})},$.id)]})}function Qe({editRow:i,setEditRow:d,editForm:o,setEditForm:r,activeObject:x,materials:u,rooms:n,pickMaterial:l,saveEdit:c}){return e.jsx("div",{className:"fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4",onClick:()=>d(null),children:e.jsxs("div",{className:"max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-white/10 bg-[#1f1f1f] p-6",onClick:a=>a.stopPropagation(),children:[e.jsx("div",{className:"mb-1 text-base",children:"Редактирование позиции"}),e.jsxs("div",{className:"mb-5 text-xs text-white/40",children:[x==null?void 0:x.object_code," — ",x==null?void 0:x.client_name]}),e.jsxs("div",{className:"grid gap-4 sm:grid-cols-2",children:[e.jsxs("div",{className:"sm:col-span-2",children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Материал из справочника"}),e.jsxs("select",{className:F,value:o.material_id,onChange:a=>l(a.target.value),children:[e.jsx("option",{value:"",children:"Произвольная позиция"}),u.map(a=>e.jsxs("option",{value:a.id,children:[a.name," — ",P(v(a.price)),"/",a.unit]},a.id))]})]}),e.jsxs("div",{className:"sm:col-span-2",children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Наименование"}),e.jsx("input",{className:F,value:o.name,onChange:a=>r({...o,name:a.target.value})})]}),e.jsxs("div",{children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Помещение"}),e.jsxs("select",{className:F,value:o.room_id,onChange:a=>r({...o,room_id:a.target.value}),children:[e.jsx("option",{value:"",children:"Без помещения"}),n.filter(a=>a.object_id===i.object_id).map(a=>e.jsx("option",{value:a.id,children:a.name},a.id))]})]}),e.jsxs("div",{children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Количество"}),e.jsx("input",{className:F,type:"number",min:"0",step:"0.01",value:o.qty,onChange:a=>r({...o,qty:a.target.value})})]}),e.jsxs("div",{children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Единица измерения"}),e.jsx("select",{className:F,value:o.unit,onChange:a=>r({...o,unit:a.target.value}),children:Ee.map(a=>e.jsx("option",{value:a,children:a},a))})]}),e.jsxs("div",{children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Цена за единицу, ₽"}),e.jsx("input",{className:F,type:"number",min:"0",step:"0.01",value:o.price,onChange:a=>r({...o,price:a.target.value})})]}),e.jsxs("div",{children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Магазин"}),e.jsx("input",{className:F,value:o.shop_name,onChange:a=>r({...o,shop_name:a.target.value})})]}),e.jsxs("div",{className:"sm:col-span-2",children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Примечание"}),e.jsx("input",{className:F,value:o.note,onChange:a=>r({...o,note:a.target.value})})]}),e.jsxs("div",{className:"rounded-lg border border-[#D4AF37]/30 bg-[#161616] px-4 py-2.5 text-sm sm:col-span-2",children:["Сумма:"," ",e.jsx("span",{className:"text-[#D4AF37]",children:P(Number(o.qty||0)*Number(o.price||0))})]})]}),e.jsxs("div",{className:"mt-6 flex flex-wrap items-center gap-3",children:[e.jsxs("button",{className:de,onClick:()=>c(!1),children:[e.jsx(C,{name:"Check",size:16}),"Сохранить"]}),e.jsxs("button",{className:"flex items-center gap-2 rounded-lg border border-[#D4AF37]/40 px-4 py-2.5 text-sm text-[#D4AF37] transition-colors hover:bg-[#D4AF37]/10",onClick:()=>c(!0),children:[e.jsx(C,{name:"Printer",size:16}),"Сохранить и печать"]}),e.jsx("button",{className:"rounded-lg border border-white/10 px-4 py-2.5 text-sm text-white/60 transition-colors hover:text-white",onClick:()=>d(null),children:"Отмена"})]})]})})}function ns(){const{user:i}=_e(),d=(i==null?void 0:i.company_name)||"",[o,r]=b.useState([]),[x,u]=b.useState([]),[n,l]=b.useState([]),[c,a]=b.useState([]),[$,t]=b.useState(!0),[g,f]=b.useState(""),[y,p]=b.useState(""),[A,z]=b.useState(""),[M,B]=b.useState(null),[_,w]=b.useState(!1),[S,s]=b.useState(null),[k,Z]=b.useState(!1),[X,Q]=b.useState(""),[q,G]=b.useState({material_id:"",name:"",unit:"",qty:"",price:"",shop_name:"",room_id:"",work_type:"",note:""}),O=()=>{t(!0),R.list().then(h=>{r(h.materials||[]);const j=h.objects||[];u(j),B(N=>{var I;return N&&j.some(T=>T.id===N)?N:((I=j[0])==null?void 0:I.id)??null}),l(h.object_materials||[]),a(h.rooms||[])}).catch(h=>f((h==null?void 0:h.message)||"Не удалось загрузить данные")).finally(()=>t(!1))};b.useEffect(O,[]);const U=async h=>{f("");try{await h(),O()}catch(j){f((j==null?void 0:j.message)||"Операция не выполнена")}},ne=b.useMemo(()=>{const h=o.flatMap(j=>[j.shop_name,...(j.offers||[]).map(N=>N.shop_name)]);return Array.from(new Set(h.filter(Boolean))).sort()},[o]),ee=b.useMemo(()=>{const h=y.trim().toLowerCase();return o.filter(j=>{const N=(j.offers||[]).map(T=>T.shop_name);return A&&j.shop_name!==A&&!N.includes(A)?!1:h?[j.name,j.category,j.shop_name,j.shop_address,...N,...(j.offers||[]).map(T=>T.shop_address)].filter(Boolean).some(T=>String(T).toLowerCase().includes(h)):!0})},[o,y,A]),L=h=>n.filter(j=>j.object_id===h),se=h=>L(h).reduce((j,N)=>j+v(N.qty)*v(N.price),0),H=x.find(h=>h.id===M)||null,ae=h=>{const j=L(h),N=new Map;return j.forEach(I=>{const T=I.room_id?`room-${I.room_id}`:"other",ye=I.room_name||(I.room_id?"Помещение":"Без помещения");N.has(T)||N.set(T,{key:T,title:ye,items:[],sum:0});const xe=N.get(T);xe.items.push(I),xe.sum+=v(I.qty)*v(I.price)}),Array.from(N.values())},m=()=>U(async()=>{if(H){Z(!0);try{await R.createEstimate({object_id:H.id,title:"Смета на материал",items:L(H.id)}),Q("Смета на материал сохранена — она появилась в разделе «Документы»"),setTimeout(()=>Q(""),5e3)}finally{Z(!1)}}}),je=h=>{s(h),G({material_id:h.material_id?String(h.material_id):"",name:h.name||"",unit:h.unit||"шт",qty:String(v(h.qty)),price:String(v(h.price)),shop_name:h.shop_name||"",room_id:h.room_id?String(h.room_id):"",work_type:h.work_type||"",note:h.note||""})},ve=h=>{const j=o.find(N=>String(N.id)===h);G(N=>({...N,material_id:h,name:j?j.name:N.name,unit:j?j.unit:N.unit,price:j?String(v(j.price)):N.price,shop_name:j?j.shop_name:N.shop_name}))},Ne=(h=!1)=>U(async()=>{if(!S||!H)return;const j=c.find(I=>String(I.id)===q.room_id),N={...S,material_id:q.material_id?Number(q.material_id):null,name:q.name,unit:q.unit,qty:Number(q.qty||0),price:Number(q.price||0),shop_name:q.shop_name,room_id:j?j.id:null,room_name:j?j.name:"",work_type:q.work_type,note:q.note};await R.updateObjectMaterial(S.id,{material_id:N.material_id,name:N.name,unit:N.unit,qty:N.qty,price:N.price,shop_name:N.shop_name,room_id:N.room_id,room_name:N.room_name,work_type:N.work_type,note:N.note}),s(null),h&&ie(H,[N],o,d,!0)}),we=async h=>{M&&(await R.addToObject({object_id:M,...h}),O())};return e.jsxs(ke,{title:"Материалы",subtitle:"Справочник материалов и закупки по объектам",children:[g&&e.jsx("div",{className:"mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300",children:g}),X&&e.jsxs("div",{className:"mb-4 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300",children:[e.jsx(C,{name:"CircleCheck",size:16}),X]}),$?e.jsx("div",{className:"flex justify-center py-16",children:e.jsx(C,{name:"Loader2",size:24,className:"animate-spin text-white/40"})}):e.jsxs(Ce,{defaultValue:"objects",children:[e.jsxs(Ae,{className:"mb-6 h-auto flex-wrap border border-white/10 bg-[#1f1f1f]",children:[e.jsx(me,{value:"objects",children:"Объекты"}),e.jsx(me,{value:"catalog",children:"Справочник"})]}),e.jsx(pe,{value:"objects",children:e.jsx(Te,{objects:x,materials:o,rooms:c,companyName:d,selectedObject:M,setSelectedObject:B,activeObject:H,showCalc:_,setShowCalc:w,savingEstimate:k,saveEstimate:m,materialsOf:L,sumOf:se,groupedByRoom:ae,addFromCalc:we,openEdit:je,run:U})}),e.jsx(pe,{value:"catalog",children:e.jsx(Xe,{materials:o,filtered:ee,shops:ne,search:y,setSearch:p,shopFilter:A,setShopFilter:z,run:U})})]}),S&&e.jsx(Qe,{editRow:S,setEditRow:s,editForm:q,setEditForm:G,activeObject:H,materials:o,rooms:c,pickMaterial:ve,saveEdit:Ne})]})}export{ns as default};
