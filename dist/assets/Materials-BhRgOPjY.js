import{r as b,j as e,I as A,i as ce,v as U,h as Ne}from"./index-rP7_InGR.js";import{C as we}from"./CrmLayout-DOT3FLfQ.js";import{T as ye,a as _e,b as he,c as pe}from"./tabs-Bz2jbfDt.js";import{p as oe,d as ke}from"./printMaterials-BOyYKizV.js";import{D as de}from"./delete-button-DO_bS7pB.js";import"./index-BoYcLRVa.js";import"./index-nYDM9Bzs.js";import"./alert-dialog-YdMJjOXx.js";const W=(i,x=0)=>{const l=typeof i=="string"?parseFloat(i):Number(i);return Number.isFinite(l)?l:x},te="Магазин не выбран";function Ce(i,x){const l=i.filter(t=>W(t.price)>0);if(l.length===0)return null;const c=l.map(t=>{const r=!!t.stock_known,o=W(t.stock),a=!r||o>=x,S=r&&o>0&&o<x;return{offer:t,enough:a,partial:S,price:W(t.price)}}),h=c.filter(t=>t.enough);if(h.length>0)return h.reduce((t,r)=>r.price<t.price?r:t).offer;const f=c.filter(t=>t.partial);return f.length>0?f.reduce((t,r)=>r.price<t.price?r:t).offer:c.reduce((t,r)=>r.price<t.price?r:t).offer}function ge(i,x){const l=new Map;let c=0,h=0,f=0;i.forEach(r=>{const o=x.find(z=>z.id===r.material_id),a=(o==null?void 0:o.offers)||[],S=W(r.qty),s=Ce(a,S),g=W(s?s.price:r.price),j=(s==null?void 0:s.shop_name)||r.shop_name||(o==null?void 0:o.shop_name)||te,p=(s?!!s.stock_known:!1)?W(s.stock):null,k=p===null?!0:p>=S,T=k||p===null?0:Math.max(0,S-p);k||(h+=1),j===te&&(f+=1);const q=a.filter(z=>W(z.price)>0).map(z=>W(z.price)),C=q.length>1&&g>0?(Math.max(...q)-g)*S:0;c+=C;const _={name:r.name,unit:r.unit,qty:S,price:g,sum:S*g,shopName:j,shopAddress:(s==null?void 0:s.shop_address)||(o==null?void 0:o.shop_address)||"",shopPhone:(s==null?void 0:s.shop_phone)||(o==null?void 0:o.shop_phone)||"",shopUrl:(s==null?void 0:s.shop_url)||(o==null?void 0:o.shop_url)||"",stock:p,enough:k,missing:T,offersCount:q.length,saved:C,roomName:r.room_name||""};l.has(j)||l.set(j,{name:j,address:_.shopAddress,phone:_.shopPhone,lines:[],sum:0,hasShortage:!1});const E=l.get(j);!E.address&&_.shopAddress&&(E.address=_.shopAddress),!E.phone&&_.shopPhone&&(E.phone=_.shopPhone),E.lines.push(_),E.sum+=_.sum,k||(E.hasShortage=!0)});const t=Array.from(l.values()).map(r=>({...r,lines:[...r.lines].sort((o,a)=>a.sum-o.sum)})).sort((r,o)=>r.name===te?1:o.name===te?-1:o.sum-r.sum);return{shops:t,total:t.reduce((r,o)=>r+o.sum,0),saved:c,shortageCount:h,unknownShopCount:f}}const Ae=(i,x=0)=>{const l=typeof i=="string"?parseFloat(i):Number(i);return Number.isFinite(l)?l:x},Z=i=>new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0}).format(Ae(i))+" ₽",Se=i=>new Date(i).toLocaleString("ru-RU",{day:"numeric",month:"numeric",year:"numeric",hour:"2-digit",minute:"2-digit"});function B(i){const x=document.createElement("div");return x.textContent=i??"",x.innerHTML}function $e(i,x,l,c){const h=ge(x,l),f=h.shops.map(g=>{const j=g.lines.map((p,k)=>{const T=p.stock===null?'<span class="muted">не указано</span>':p.enough?`<span class="ok">есть ${p.stock} ${B(p.unit)}</span>`:`<span class="warn">есть ${p.stock}, не хватает ${p.missing}</span>`;return`
            <tr>
              <td class="num">${k+1}</td>
              <td>
                ${B(p.name)}
                ${p.roomName?`<div class="sub">${B(p.roomName)}</div>`:""}
              </td>
              <td class="center">${p.qty}</td>
              <td class="center">${B(p.unit)}</td>
              <td class="center">${T}</td>
              <td class="right">${Z(p.price)}</td>
              <td class="right amount">${Z(p.sum)}</td>
              <td class="center check"></td>
            </tr>`}).join(""),y=[g.address?`Адрес: ${B(g.address)}`:"",g.phone?`Тел.: ${B(g.phone)}`:""].filter(Boolean).join(" · ");return`
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
                <td colspan="8">${B(g.name)}${y?` — ${y}`:""}</td>
              </tr>
              ${j}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="6" class="right">Итого по магазину</td>
                <td class="right amount">${Z(g.sum)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>`}).join(""),t=[];h.shortageCount>0&&t.push(`Позиций с нехваткой на складе магазина: ${h.shortageCount} — уточните наличие перед выездом`),h.unknownShopCount>0&&t.push(`Позиций без выбранного магазина: ${h.unknownShopCount}`),h.saved>0&&t.push(`Экономия за счёт выбора магазина: ${Z(h.saved)}`);const r=t.length?`<div class="notes">${t.map(g=>`<div>• ${g}</div>`).join("")}</div>`:"",o=`
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
  @page { size: A4; margin: 12mm; }
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
`,a=h.shops.length,S=`
  <div class="header">
    <div class="brand"><img class="brand-logo" src="${window.location.origin}/logo-print.png" alt="FixKey"/>Fix<span>Key</span></div>
    <div class="doc-title">
      <h1>Список на закупку</h1>
      <p>Объект № ${B(i.object_code)}</p>
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
      <div class="value">${B(i.object_code)}</div>
    </div>
    <div>
      <div class="label">Заказчик</div>
      <div class="value">${B(i.client_name)}</div>
    </div>
    <div>
      <div class="label">Адрес объекта</div>
      <div class="value">${B(i.address||"—")}</div>
    </div>
    <div>
      <div class="label">Магазинов в списке</div>
      <div class="value">${a}</div>
    </div>
  </div>

  ${r}

  ${f}

  <div class="summary">
    <div class="summary-box">
      ${h.shops.map(g=>`
      <div class="summary-row">
        <span>${B(g.name)}</span>
        <span>${Z(g.sum)}</span>
      </div>`).join("")}
      <div class="summary-total">
        <span>ИТОГО:</span>
        <span>${Z(h.total)}</span>
      </div>
    </div>
  </div>

  <hr class="thin" />

  <div class="parties">
    <div>
      <div class="label">Закупку производит</div>
      <div class="name">${B(c)}</div>
    </div>
    <div>
      <div class="label">Объект</div>
      <div class="name">${B(i.client_name)}</div>
    </div>
  </div>

  <div class="footer">
    Сформировано ${Se(new Date().toISOString())}
  </div>`,s=`Список на закупку № ${i.object_code} — ${B(i.client_name)}`;return{styles:o,bodyContent:S,title:s}}function ue(i,x,l,c,h=!1){const{styles:f,bodyContent:t,title:r}=$e(i,x,l,c),o=`<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8" />
<title>${r}</title>
<style>${f}</style>
</head>
<body>
<div class="est-root">${t}</div>
</body>
</html>`,a=window.open("","_blank","width=900,height=1000");a&&(a.document.open(),a.document.write(o),a.document.close(),h&&(a.onload=()=>{a.focus(),a.print()}))}const I=i=>new Intl.NumberFormat("ru-RU",{maximumFractionDigits:2}).format(i||0)+" ₽",w=i=>Number(i||0),$="w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50",Fe=["шт","м²","м","м.п.","м³","кг","т","л","уп","рул","меш","компл"],De=["Демонтажные работы","Подготовительные работы","Черновые работы","Чистовые работы","Плиточные работы","Устройство полов","Потолочные работы","Гипсокартонные работы","Малярные работы","Электромонтажные работы","Сантехнические работы","Столярные работы"],xe="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm px-4 py-2.5 rounded-lg disabled:opacity-40";function ze({object:i,items:x,catalog:l,companyName:c,onClose:h}){const f=b.useMemo(()=>ge(x,l),[x,l]);return b.useEffect(()=>{const t=r=>{r.key==="Escape"&&h()};return window.addEventListener("keydown",t),()=>window.removeEventListener("keydown",t)},[h]),e.jsx("div",{className:"fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm",onClick:h,children:e.jsxs("div",{className:"my-8 w-full max-w-4xl rounded-xl border border-white/10 bg-[#1f1f1f] p-6",onClick:t=>t.stopPropagation(),children:[e.jsxs("div",{className:"mb-5 flex items-start justify-between gap-4",children:[e.jsxs("div",{children:[e.jsx("div",{className:"text-base font-medium",children:"Список на закупку"}),e.jsxs("div",{className:"mt-0.5 text-xs text-white/40",children:["Объект № ",i.object_code," · ",i.client_name]})]}),e.jsx("button",{className:"rounded-lg p-1.5 text-white/40 transition-colors hover:text-white",onClick:h,children:e.jsx(A,{name:"X",size:18})})]}),e.jsxs("div",{className:"mb-5 flex flex-wrap gap-3",children:[e.jsxs("div",{className:"min-w-[130px] flex-1 rounded-lg border border-white/10 bg-[#161616] px-4 py-3",children:[e.jsx("div",{className:"text-xs text-white/40",children:"Итого закупка"}),e.jsx("div",{className:"mt-1 text-lg text-[#D4AF37]",children:I(f.total)})]}),e.jsxs("div",{className:"min-w-[130px] flex-1 rounded-lg border border-white/10 bg-[#161616] px-4 py-3",children:[e.jsx("div",{className:"text-xs text-white/40",children:"Магазинов"}),e.jsx("div",{className:"mt-1 text-lg",children:f.shops.length})]}),f.saved>0&&e.jsxs("div",{className:"min-w-[130px] flex-1 rounded-lg border border-emerald-500/30 bg-[#161616] px-4 py-3",children:[e.jsx("div",{className:"text-xs text-white/40",children:"Экономия на выборе"}),e.jsx("div",{className:"mt-1 text-lg text-emerald-400",children:I(f.saved)})]}),f.shortageCount>0&&e.jsxs("div",{className:"min-w-[130px] flex-1 rounded-lg border border-red-500/30 bg-[#161616] px-4 py-3",children:[e.jsx("div",{className:"text-xs text-white/40",children:"Не хватает"}),e.jsxs("div",{className:"mt-1 text-lg text-red-400",children:[f.shortageCount," поз."]})]})]}),f.shops.length===0?e.jsx("div",{className:"rounded-lg border border-dashed border-white/10 py-12 text-center text-sm text-white/30",children:"На объекте пока нет материалов"}):e.jsx("div",{className:"space-y-4",children:f.shops.map(t=>e.jsxs("div",{className:"rounded-lg border border-white/10 bg-[#161616]",children:[e.jsxs("div",{className:"flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3",children:[e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center gap-2 text-sm",children:[t.name,t.hasShortage&&e.jsx("span",{className:"rounded bg-red-500/15 px-1.5 py-0.5 text-[10px] uppercase text-red-400",children:"не всё есть"})]}),(t.address||t.phone)&&e.jsxs("div",{className:"mt-0.5 text-xs text-white/30",children:[t.address,t.address&&t.phone?" · ":"",t.phone&&e.jsx("a",{href:`tel:${t.phone}`,className:"hover:text-[#D4AF37]",children:t.phone})]})]}),e.jsx("div",{className:"whitespace-nowrap text-sm text-[#D4AF37]",children:I(t.sum)})]}),e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"w-full text-sm",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"border-b border-white/5 text-xs uppercase text-white/40",children:[e.jsx("th",{className:"py-2 pl-4 pr-3 text-left font-medium",children:"Материал"}),e.jsx("th",{className:"py-2 pr-3 text-right font-medium",children:"Нужно"}),e.jsx("th",{className:"py-2 pr-3 text-left font-medium",children:"Наличие"}),e.jsx("th",{className:"py-2 pr-3 text-right font-medium",children:"Цена"}),e.jsx("th",{className:"py-2 pr-4 text-right font-medium",children:"Сумма"})]})}),e.jsx("tbody",{children:t.lines.map((r,o)=>e.jsxs("tr",{className:"border-b border-white/5 last:border-0",children:[e.jsxs("td",{className:"py-2.5 pl-4 pr-3",children:[r.name,r.roomName&&e.jsx("div",{className:"text-xs text-white/30",children:r.roomName})]}),e.jsxs("td",{className:"whitespace-nowrap py-2.5 pr-3 text-right text-white/60",children:[r.qty," ",r.unit]}),e.jsx("td",{className:"whitespace-nowrap py-2.5 pr-3 text-xs",children:r.stock===null?e.jsx("span",{className:"text-white/30",children:"не указано"}):r.enough?e.jsxs("span",{className:"text-emerald-400",children:["есть ",r.stock," ",r.unit]}):e.jsxs("span",{className:"text-red-400",children:["есть ",r.stock,", не хватает ",r.missing]})}),e.jsx("td",{className:"whitespace-nowrap py-2.5 pr-3 text-right text-white/60",children:I(w(r.price))}),e.jsx("td",{className:"whitespace-nowrap py-2.5 pr-4 text-right text-[#D4AF37]",children:I(r.sum)})]},o))})]})})]},t.name))}),e.jsxs("div",{className:"mt-6 flex flex-wrap items-center gap-3",children:[e.jsxs("button",{className:"flex items-center gap-2 rounded-lg bg-[#D4AF37] px-5 py-2.5 text-sm text-[#161616] transition-colors hover:bg-[#B8860B] disabled:opacity-40",disabled:f.shops.length===0,onClick:()=>ue(i,x,l,c,!0),children:[e.jsx(A,{name:"Printer",size:16}),"Распечатать список"]}),e.jsxs("button",{className:"flex items-center gap-2 rounded-lg border border-white/10 px-5 py-2.5 text-sm text-white/60 transition-colors hover:text-white disabled:opacity-40",disabled:f.shops.length===0,onClick:()=>ue(i,x,l,c,!1),children:[e.jsx(A,{name:"Eye",size:16}),"Открыть для просмотра"]})]})]})})}const le=i=>new Intl.NumberFormat("ru-RU",{maximumFractionDigits:2}).format(i||0)+" ₽",D=i=>Number(i||0),Q="w-full bg-[#1f1f1f] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50",Me="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm px-4 py-2.5 rounded-lg disabled:opacity-40",Ee=["Демонтажные работы","Подготовительные работы","Черновые работы","Чистовые работы","Плиточные работы","Устройство полов","Потолочные работы","Гипсокартонные работы","Малярные работы","Электромонтажные работы","Сантехнические работы","Столярные работы"],Pe=[{value:"area",label:"Пол / потолок (площадь)"},{value:"wall_area",label:"Стены (площадь)"},{value:"perimeter",label:"Периметр"}];function Te({objectId:i,materials:x,rooms:l,existing:c,onAdd:h,onCancel:f}){const t=b.useMemo(()=>l.filter(d=>d.object_id===i),[l,i]),[r,o]=b.useState(""),[a,S]=b.useState(""),[s,g]=b.useState("area"),[j,y]=b.useState(""),[p,k]=b.useState("1"),[T,q]=b.useState("10"),[C,_]=b.useState(!1),[E,z]=b.useState("merge"),[n,K]=b.useState("Черновые работы"),m=x.find(d=>String(d.id)===r),F=t.find(d=>String(d.id)===a),M=b.useMemo(()=>D(a==="manual"||!F?j:F[s]),[F,a,s,j])*Math.max(D(p)||1,1),H=D(m==null?void 0:m.consumption),G=H>0?M/H:0,X=G*(1+D(T)/100),ne=Math.ceil(X*100)/100,Y=Math.ceil(X),J=Y*D(m==null?void 0:m.price),ee=!!m&&H>0&&M>0,P=b.useMemo(()=>!m||!F?null:c.find(d=>d.material_id===m.id&&d.room_id===F.id&&(d.work_type||"")===n)||null,[c,m,F,n]),se=b.useMemo(()=>F?c.filter(d=>d.room_id===F.id):[],[c,F]),ie=F?`${F.name}: ${M.toFixed(2)} ${(m==null?void 0:m.consumption_unit)||""}, запас ${D(T)}%`:`Расчёт: ${M.toFixed(2)} ${(m==null?void 0:m.consumption_unit)||""}, запас ${D(T)}%`,re=async()=>{if(m){_(!0);try{await h({material_id:m.id,qty:Y,note:ie,room_id:F?F.id:null,room_name:F?F.name:"",work_type:n,merge:E==="merge"}),o("")}finally{_(!1)}}};return x.length===0?e.jsxs("div",{className:"text-sm text-white/40",children:["Справочник пуст —"," ",e.jsx(ce,{to:"/cabinet/materials/new",className:"text-[#D4AF37] hover:underline",children:"добавьте материал"})]}):e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"grid gap-3 md:grid-cols-2",children:[e.jsxs("div",{children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Материал"}),e.jsxs("select",{className:Q,value:r,onChange:d=>o(d.target.value),children:[e.jsx("option",{value:"",children:"Выберите материал из справочника"}),x.map(d=>e.jsxs("option",{value:d.id,children:[d.name," — ",le(D(d.price)),"/",d.unit,D(d.consumption)>0?` · 1 ${d.unit} = ${D(d.consumption)} ${d.consumption_unit}`:""]},d.id))]}),m&&H<=0&&e.jsx("div",{className:"mt-1.5 text-xs text-amber-400",children:"У этого материала не указан расход — расчёт невозможен"})]}),e.jsxs("div",{children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Помещение"}),e.jsxs("select",{className:Q,value:a,onChange:d=>S(d.target.value),children:[e.jsx("option",{value:"",children:"Выберите помещение"}),t.map(d=>e.jsxs("option",{value:d.id,children:[d.name," — пол ",D(d.area)," м², стены ",D(d.wall_area)," м²"]},d.id)),e.jsx("option",{value:"manual",children:"Ввести площадь вручную"})]}),t.length===0&&e.jsx("div",{className:"mt-1.5 text-xs text-white/40",children:"У объекта нет помещений — введите площадь вручную"})]}),e.jsxs("div",{className:"md:col-span-2",children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Вид работ"}),e.jsx("select",{className:Q,value:n,onChange:d=>K(d.target.value),children:Ee.map(d=>e.jsx("option",{value:d,children:d},d))})]})]}),e.jsxs("div",{className:"grid gap-3 md:grid-cols-4",children:[a==="manual"||!F?e.jsxs("div",{children:[e.jsxs("label",{className:"mb-1.5 block text-xs text-white/50",children:["Площадь / длина, ",(m==null?void 0:m.consumption_unit)||"м²"]}),e.jsx("input",{className:Q,type:"number",min:"0",step:"0.01",placeholder:"0",value:j,onChange:d=>y(d.target.value)})]}):e.jsxs("div",{children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Что обрабатываем"}),e.jsx("select",{className:Q,value:s,onChange:d=>g(d.target.value),children:Pe.map(d=>e.jsx("option",{value:d.value,children:d.label},d.value))})]}),e.jsxs("div",{children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Слоёв"}),e.jsx("input",{className:Q,type:"number",min:"1",step:"1",value:p,onChange:d=>k(d.target.value)})]}),e.jsxs("div",{children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Запас, %"}),e.jsx("input",{className:Q,type:"number",min:"0",step:"1",value:T,onChange:d=>q(d.target.value)})]}),e.jsx("div",{className:"flex items-end",children:e.jsxs("button",{className:Me,onClick:re,disabled:!ee||C,children:[e.jsx(A,{name:C?"Loader2":"Plus",size:16,className:C?"animate-spin":""}),P&&E==="merge"?"Добавить к расчёту":"Сохранить в объект"]})})]}),se.length>0&&F&&e.jsxs("div",{className:"rounded-lg border border-white/10 bg-[#1f1f1f] p-4",children:[e.jsxs("div",{className:"mb-2 text-xs uppercase text-white/40",children:["Уже рассчитано по помещению «",F.name,"»"]}),e.jsx("div",{className:"space-y-1.5 text-sm text-white/60",children:se.map(d=>e.jsxs("div",{className:"flex flex-wrap justify-between gap-2",children:[e.jsxs("span",{children:[d.name,d.work_type&&e.jsx("span",{className:"ml-2 text-xs text-white/30",children:d.work_type})]}),e.jsxs("span",{children:[D(d.qty)," ",d.unit," · ",le(D(d.qty)*D(d.price))]})]},d.id))})]}),P&&e.jsxs("div",{className:"rounded-lg border border-amber-500/30 bg-amber-500/5 p-4",children:[e.jsxs("div",{className:"mb-3 flex items-start gap-2 text-sm text-amber-200",children:[e.jsx(A,{name:"TriangleAlert",size:15,className:"mt-0.5 shrink-0"}),e.jsxs("span",{children:["По помещению «",F==null?void 0:F.name,"» в разделе «",n,"» уже есть расчёт «",P.name,"» —"," ",D(P.qty)," ",P.unit,". Что сделать с новым расчётом?"]})]}),e.jsxs("div",{className:"flex flex-wrap gap-4 text-sm",children:[e.jsxs("label",{className:"flex cursor-pointer items-center gap-2",children:[e.jsx("input",{type:"radio",className:"accent-[#D4AF37]",checked:E==="merge",onChange:()=>z("merge")}),"Добавить к существующему (",D(P.qty)," + ",Y," = ",D(P.qty)+Y," ",P.unit,")"]}),e.jsxs("label",{className:"flex cursor-pointer items-center gap-2",children:[e.jsx("input",{type:"radio",className:"accent-[#D4AF37]",checked:E==="new",onChange:()=>z("new")}),"Добавить отдельной строкой"]})]})]}),ee&&e.jsxs("div",{className:"rounded-lg border border-[#D4AF37]/30 bg-[#1f1f1f] p-4",children:[e.jsxs("div",{className:"mb-3 flex items-center gap-2 text-xs uppercase text-white/40",children:[e.jsx(A,{name:"Calculator",size:14,className:"text-[#D4AF37]"}),"Результат расчёта"]}),e.jsxs("div",{className:"grid gap-4 text-sm sm:grid-cols-4",children:[e.jsxs("div",{children:[e.jsx("div",{className:"text-xs text-white/40",children:"Площадь с учётом слоёв"}),e.jsxs("div",{children:[M.toFixed(2)," ",m==null?void 0:m.consumption_unit]})]}),e.jsxs("div",{children:[e.jsx("div",{className:"text-xs text-white/40",children:"Чистый расход"}),e.jsxs("div",{children:[G.toFixed(2)," ",m==null?void 0:m.unit]})]}),e.jsxs("div",{children:[e.jsxs("div",{className:"text-xs text-white/40",children:["С запасом ",D(T),"%"]}),e.jsxs("div",{children:[ne.toFixed(2)," ",m==null?void 0:m.unit]})]}),e.jsxs("div",{children:[e.jsx("div",{className:"text-xs text-white/40",children:"К покупке"}),e.jsxs("div",{className:"text-[#D4AF37]",children:[Y," ",m==null?void 0:m.unit," · ",le(J)]})]})]}),e.jsxs("div",{className:"mt-3 border-t border-white/10 pt-3 text-xs text-white/40",children:["1 ",m==null?void 0:m.unit," покрывает ",H," ",m==null?void 0:m.consumption_unit,m!=null&&m.shop_name?` · магазин: ${m.shop_name}`:""]})]}),e.jsx("button",{className:"text-sm text-white/40 transition-colors hover:text-white",onClick:f,children:"Свернуть калькулятор"})]})}function qe({objects:i,materials:x,rooms:l,companyName:c,selectedObject:h,setSelectedObject:f,activeObject:t,showCalc:r,setShowCalc:o,savingEstimate:a,saveEstimate:S,materialsOf:s,sumOf:g,groupedByRoom:j,addFromCalc:y,openEdit:p,run:k}){const[T,q]=b.useState(!1);return e.jsxs("div",{className:"rounded-xl border border-white/10 bg-[#1f1f1f] p-5",children:[i.length===0?e.jsxs("div",{className:"py-16 text-center text-sm text-white/30",children:["Объектов пока нет —"," ",e.jsx(ce,{to:"/cabinet/objects",className:"text-[#D4AF37] hover:underline",children:"создать объект"})]}):e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"mb-5 flex flex-wrap items-end gap-3",children:[e.jsxs("div",{className:"min-w-[280px] flex-1",children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Объект"}),e.jsxs("select",{className:$,value:h??"",onChange:C=>{f(C.target.value?Number(C.target.value):null),o(!1)},children:[e.jsx("option",{value:"",children:"Выберите объект"}),i.map(C=>e.jsxs("option",{value:C.id,children:[C.object_code," — ",C.client_name,C.address?` · ${C.address}`:""]},C.id))]})]}),t&&e.jsxs(e.Fragment,{children:[e.jsxs("button",{className:xe,onClick:()=>o(!r),children:[e.jsx(A,{name:r?"X":"Calculator",size:16}),r?"Свернуть":"Рассчитать помещение"]}),e.jsxs("button",{className:"flex items-center gap-2 rounded-lg border border-[#D4AF37]/40 px-4 py-2.5 text-sm text-[#D4AF37] transition-colors hover:bg-[#D4AF37]/10 disabled:opacity-40",disabled:s(t.id).length===0||a,onClick:S,children:[e.jsx(A,{name:a?"Loader2":"FileText",size:16,className:a?"animate-spin":""}),"Сохранить смету на материал"]}),e.jsxs("button",{className:"flex items-center gap-2 rounded-lg border border-[#D4AF37]/40 px-4 py-2.5 text-sm text-[#D4AF37] transition-colors hover:bg-[#D4AF37]/10 disabled:opacity-40",disabled:s(t.id).length===0,onClick:()=>q(!0),children:[e.jsx(A,{name:"ShoppingCart",size:16}),"Список на закупку"]})]})]}),t?e.jsxs(e.Fragment,{children:[r&&e.jsx("div",{className:"mb-5 rounded-lg border border-[#D4AF37]/30 bg-[#161616] p-4",children:e.jsx(Te,{objectId:t.id,materials:x,rooms:l,existing:s(t.id),onAdd:y,onCancel:()=>o(!1)})}),e.jsxs("div",{className:"mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#161616] px-4 py-3 text-sm",children:[e.jsxs("div",{className:"text-white/60",children:[t.object_code," — ",t.client_name,e.jsxs("span",{className:"ml-2 text-white/30",children:[s(t.id).length," позиций"]})]}),e.jsxs("div",{className:"text-[#D4AF37]",children:["Итого: ",I(g(t.id))]})]}),s(t.id).length===0?e.jsx("div",{className:"py-14 text-center text-sm text-white/30",children:"Для этого объекта расчётов ещё нет — нажмите «Рассчитать помещение»"}):e.jsx("div",{className:"space-y-4",children:j(t.id).map(C=>e.jsxs("div",{className:"rounded-lg border border-white/10 bg-[#161616]",children:[e.jsxs("div",{className:"flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3",children:[e.jsxs("div",{className:"flex items-center gap-2 text-sm",children:[e.jsx(A,{name:"DoorOpen",size:15,className:"text-[#D4AF37]"}),C.title]}),e.jsx("div",{className:"text-sm text-[#D4AF37]",children:I(C.sum)})]}),e.jsx("div",{className:"overflow-x-auto p-4",children:e.jsxs("table",{className:"w-full text-sm",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"border-b border-white/10 text-xs uppercase text-white/40",children:[e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Материал"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Вид работ"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Кол-во"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Цена"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Сумма"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Магазин"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Действия"})]})}),e.jsx("tbody",{children:C.items.map(_=>e.jsxs("tr",{className:"border-b border-white/5 last:border-0",children:[e.jsxs("td",{className:"py-2.5 pr-4",children:[_.name,_.note&&e.jsx("div",{className:"text-xs text-white/30",children:_.note})]}),e.jsx("td",{className:"py-2.5 pr-4 text-white/60",children:_.work_type||"—"}),e.jsxs("td",{className:"whitespace-nowrap py-2.5 pr-4",children:[w(_.qty)," ",_.unit]}),e.jsx("td",{className:"py-2.5 pr-4 text-white/60",children:I(w(_.price))}),e.jsx("td",{className:"whitespace-nowrap py-2.5 pr-4 text-[#D4AF37]",children:I(w(_.qty)*w(_.price))}),e.jsx("td",{className:"py-2.5 pr-4 text-white/60",children:_.shop_name||"—"}),e.jsx("td",{className:"py-2.5 pr-4",children:e.jsxs("div",{className:"flex items-center gap-2.5",children:[e.jsx("button",{className:"text-white/50 transition-colors hover:text-[#D4AF37]",title:"Просмотр",onClick:()=>oe(t,[_],x,c),children:e.jsx(A,{name:"Eye",size:16})}),e.jsx("button",{className:"text-white/50 transition-colors hover:text-[#D4AF37]",title:"Редактировать",onClick:()=>p(_),children:e.jsx(A,{name:"Pencil",size:16})}),e.jsx("button",{className:"text-white/50 transition-colors hover:text-[#D4AF37]",title:"Печать",onClick:()=>oe(t,[_],x,c,!0),children:e.jsx(A,{name:"Printer",size:16})}),e.jsx("button",{className:"text-white/50 transition-colors hover:text-[#D4AF37]",title:"Скачать PDF",onClick:()=>ke(t,[_],x,c),children:e.jsx(A,{name:"FileDown",size:16})}),e.jsx(de,{onConfirm:()=>k(()=>U.removeFromObject(_.id))})]})})]},_.id))})]})})]},C.key))})]}):e.jsx("div",{className:"py-16 text-center text-sm text-white/30",children:"Выберите объект, чтобы увидеть его расчёты и материалы"})]}),T&&t&&e.jsx(ze,{object:t,items:s(t.id),catalog:x,companyName:c,onClose:()=>q(!1)})]})}const V="mb-1.5 block text-xs text-white/50",be={shop_name:"",shop_address:"",shop_phone:"",shop_url:"",price:"",stock:"",stock_known:!1,note:""};function Be({materialId:i,unit:x,offers:l,onChanged:c}){const[h,f]=b.useState(null),[t,r]=b.useState(!1),[o,a]=b.useState(be),[S,s]=b.useState(!1),[g,j]=b.useState(""),y=(n,K)=>a(m=>({...m,[n]:K})),p=l.map(n=>w(n.price)).filter(n=>n>0),k=p.length?Math.min(...p):0,T=()=>{a(be),f(null),r(!0),j("")},q=n=>{a({shop_name:n.shop_name||"",shop_address:n.shop_address||"",shop_phone:n.shop_phone||"",shop_url:n.shop_url||"",price:w(n.price)?String(w(n.price)):"",stock:n.stock_known?String(w(n.stock)):"",stock_known:!!n.stock_known,note:n.note||""}),r(!1),f(n.id),j("")},C=()=>{r(!1),f(null),j("")},_=async()=>{j(""),s(!0);try{const n={...o,price:Number(o.price||0),stock:Number(o.stock||0)};h?await U.updateOffer(h,n):await U.createOffer({...n,material_id:i}),C(),c()}catch(n){j((n==null?void 0:n.message)||"Не удалось сохранить магазин")}finally{s(!1)}},E=async n=>{j("");try{await U.removeOffer(n),c()}catch(K){j((K==null?void 0:K.message)||"Не удалось удалить магазин")}},z=e.jsxs("div",{className:"rounded-lg border border-[#D4AF37]/30 bg-[#161616] p-4",children:[e.jsxs("div",{className:"grid grid-cols-1 gap-4 sm:grid-cols-2",children:[e.jsxs("div",{children:[e.jsx("label",{className:V,children:"Название магазина"}),e.jsx("input",{className:$,placeholder:"Например: Леруа Мерлен",value:o.shop_name,onChange:n=>y("shop_name",n.target.value)})]}),e.jsxs("div",{children:[e.jsxs("label",{className:V,children:["Цена за 1 ",x,", ₽"]}),e.jsx("input",{className:$,type:"number",min:"0",step:"0.01",placeholder:"0",value:o.price,onChange:n=>y("price",n.target.value)})]}),e.jsxs("div",{children:[e.jsx("label",{className:V,children:"Адрес"}),e.jsx("input",{className:$,placeholder:"Город, улица, дом",value:o.shop_address,onChange:n=>y("shop_address",n.target.value)})]}),e.jsxs("div",{children:[e.jsx("label",{className:V,children:"Телефон"}),e.jsx("input",{className:$,type:"tel",placeholder:"+7",value:o.shop_phone,onChange:n=>y("shop_phone",n.target.value)})]}),e.jsxs("div",{className:"sm:col-span-2",children:[e.jsx("label",{className:V,children:"Ссылка на товар"}),e.jsx("input",{className:$,placeholder:"https://",value:o.shop_url,onChange:n=>y("shop_url",n.target.value)})]}),e.jsx("div",{className:"sm:col-span-2",children:e.jsxs("label",{className:"flex cursor-pointer items-center gap-2 text-sm text-white/70",children:[e.jsx("input",{type:"checkbox",className:"h-4 w-4 accent-[#D4AF37]",checked:o.stock_known,onChange:n=>y("stock_known",n.target.checked)}),"Знаю, сколько есть в наличии"]})}),o.stock_known&&e.jsxs("div",{children:[e.jsxs("label",{className:V,children:["Сколько есть, ",x]}),e.jsx("input",{className:$,type:"number",min:"0",step:"0.01",placeholder:"0",value:o.stock,onChange:n=>y("stock",n.target.value)})]}),e.jsxs("div",{className:o.stock_known?"":"sm:col-span-2",children:[e.jsx("label",{className:V,children:"Примечание"}),e.jsx("input",{className:$,placeholder:"Необязательно",value:o.note,onChange:n=>y("note",n.target.value)})]})]}),e.jsxs("div",{className:"mt-4 flex flex-wrap items-center gap-2",children:[e.jsxs("button",{className:"flex items-center gap-2 rounded-lg bg-[#D4AF37] px-4 py-2 text-sm text-[#161616] transition-colors hover:bg-[#B8860B] disabled:opacity-40",onClick:_,disabled:S||o.shop_name.trim().length<2,children:[e.jsx(A,{name:S?"Loader2":"Check",size:15,className:S?"animate-spin":""}),h?"Сохранить магазин":"Добавить магазин"]}),e.jsx("button",{className:"rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 transition-colors hover:text-white",onClick:C,children:"Отмена"})]})]});return e.jsxs("div",{children:[e.jsxs("div",{className:"mb-3 flex flex-wrap items-center justify-between gap-3",children:[e.jsxs("div",{children:[e.jsx("div",{className:"text-xs uppercase text-white/40",children:"Магазины и цены"}),e.jsx("div",{className:"mt-1 text-xs text-white/30",children:"Добавьте все магазины — увидите, где дешевле и где есть в наличии"})]}),!t&&h===null&&e.jsxs("button",{className:"flex items-center gap-1.5 rounded-lg border border-[#D4AF37]/40 px-3 py-1.5 text-sm text-[#D4AF37] transition-colors hover:bg-[#D4AF37]/10",onClick:T,children:[e.jsx(A,{name:"Plus",size:15}),"Добавить магазин"]})]}),g&&e.jsx("div",{className:"mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300",children:g}),l.length===0&&!t&&e.jsx("div",{className:"rounded-lg border border-dashed border-white/10 py-8 text-center text-sm text-white/30",children:"Магазины не добавлены"}),e.jsx("div",{className:"space-y-2",children:l.map(n=>h===n.id?e.jsx("div",{children:z},n.id):e.jsxs("div",{className:"flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-white/10 bg-[#161616] px-4 py-3",children:[e.jsxs("div",{className:"min-w-[150px] flex-1",children:[e.jsxs("div",{className:"flex items-center gap-2 text-sm",children:[n.shop_url?e.jsx("a",{href:n.shop_url,target:"_blank",rel:"noreferrer",className:"hover:text-[#D4AF37]",children:n.shop_name||"Без названия"}):e.jsx("span",{children:n.shop_name||"Без названия"}),w(n.price)>0&&w(n.price)===k&&l.length>1&&e.jsx("span",{className:"rounded bg-[#D4AF37]/15 px-1.5 py-0.5 text-[10px] uppercase text-[#D4AF37]",children:"дешевле"})]}),n.shop_address&&e.jsx("div",{className:"mt-0.5 text-xs text-white/30",children:n.shop_address}),n.note&&e.jsx("div",{className:"mt-0.5 text-xs text-white/30",children:n.note})]}),e.jsx("div",{className:"whitespace-nowrap text-sm text-[#D4AF37]",children:w(n.price)>0?`${I(w(n.price))} / ${x}`:"цена не указана"}),e.jsx("div",{className:"min-w-[110px] whitespace-nowrap text-xs",children:n.stock_known?w(n.stock)>0?e.jsxs("span",{className:"text-emerald-400",children:["в наличии ",w(n.stock)," ",x]}):e.jsx("span",{className:"text-red-400",children:"нет в наличии"}):e.jsx("span",{className:"text-white/30",children:"наличие не указано"})}),n.shop_phone&&e.jsx("a",{href:`tel:${n.shop_phone}`,className:"whitespace-nowrap text-xs text-white/50 hover:text-[#D4AF37]",children:n.shop_phone}),e.jsxs("div",{className:"flex items-center gap-1",children:[e.jsx("button",{className:"rounded-lg p-2 text-white/40 transition-colors hover:bg-white/5 hover:text-[#D4AF37]",title:"Изменить магазин",onClick:()=>q(n),children:e.jsx(A,{name:"Pencil",size:14})}),e.jsx(de,{onConfirm:()=>E(n.id)})]})]},n.id))}),t&&e.jsx("div",{className:"mt-2",children:z})]})}const Ie=["шт","м²","м","м.п.","м³","кг","т","л","уп","рул","меш","компл"],Le=[{value:"м²",label:"м² (квадратный метр)"},{value:"м³",label:"м³ (кубический метр)"},{value:"м.п.",label:"м/п (метр погонный)"},{value:"м",label:"м (метр)"},{value:"шт",label:"шт (штука)"},{value:"точка",label:"точка"},{value:"компл",label:"комплект"}],O="mb-1.5 block text-xs text-white/50";function Re({material:i,onClose:x,onSaved:l}){const[c,h]=b.useState({name:i.name||"",category:i.category||"",unit:i.unit||"шт",price:i.price?String(i.price):"",note:i.note||"",consumption:i.consumption?String(i.consumption):"",consumption_unit:i.consumption_unit||"м²"}),[f,t]=b.useState(!1),[r,o]=b.useState(""),a=(s,g)=>h(j=>({...j,[s]:g}));b.useEffect(()=>{const s=g=>{g.key==="Escape"&&x()};return window.addEventListener("keydown",s),()=>window.removeEventListener("keydown",s)},[x]);const S=async()=>{o(""),t(!0);try{await U.update(i.id,{...c,price:Number(c.price||0),consumption:Number(c.consumption||0)}),l(),x()}catch(s){o((s==null?void 0:s.message)||"Не удалось сохранить материал"),t(!1)}};return e.jsx("div",{className:"fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm",onClick:x,children:e.jsxs("div",{className:"my-8 w-full max-w-3xl rounded-xl border border-white/10 bg-[#1f1f1f] p-6",onClick:s=>s.stopPropagation(),children:[e.jsxs("div",{className:"mb-5 flex items-start justify-between gap-4",children:[e.jsxs("div",{children:[e.jsx("div",{className:"text-base font-medium",children:"Редактирование материала"}),e.jsx("div",{className:"mt-0.5 text-xs text-white/40",children:"Изменения попадут в справочник для всех новых расчётов"})]}),e.jsx("button",{className:"rounded-lg p-1.5 text-white/40 transition-colors hover:text-white",onClick:x,children:e.jsx(A,{name:"X",size:18})})]}),r&&e.jsx("div",{className:"mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300",children:r}),e.jsx("div",{className:"mb-4 text-xs uppercase text-white/40",children:"Материал"}),e.jsxs("div",{className:"grid grid-cols-1 gap-4 sm:grid-cols-2",children:[e.jsxs("div",{className:"sm:col-span-2",children:[e.jsx("label",{className:O,children:"Название материала"}),e.jsx("input",{className:$,placeholder:"Например: Гипсокартон Knauf 12.5 мм",value:c.name,onChange:s=>a("name",s.target.value)})]}),e.jsxs("div",{children:[e.jsx("label",{className:O,children:"Категория"}),e.jsx("input",{className:$,placeholder:"Например: Черновые материалы",value:c.category,onChange:s=>a("category",s.target.value)})]}),e.jsxs("div",{children:[e.jsx("label",{className:O,children:"Единица измерения"}),e.jsx("select",{className:$,value:c.unit,onChange:s=>a("unit",s.target.value),children:Ie.map(s=>e.jsx("option",{value:s,children:s},s))})]}),e.jsxs("div",{children:[e.jsx("label",{className:O,children:"Цена за единицу, ₽"}),e.jsx("input",{className:$,type:"number",min:"0",step:"0.01",placeholder:"0",value:c.price,onChange:s=>a("price",s.target.value)}),e.jsx("div",{className:"mt-1 text-xs text-white/30",children:"Подставится лучшая цена из магазинов ниже"})]})]}),e.jsx("div",{className:"mb-4 mt-6 text-xs uppercase text-white/40",children:"Расход материала"}),e.jsxs("div",{className:"grid grid-cols-1 gap-4 sm:grid-cols-2",children:[e.jsxs("div",{children:[e.jsxs("label",{className:O,children:["Расход: сколько покрывает 1 ",c.unit]}),e.jsx("input",{className:$,type:"number",min:"0",step:"0.001",placeholder:"Например: 4",value:c.consumption,onChange:s=>a("consumption",s.target.value)})]}),e.jsxs("div",{children:[e.jsx("label",{className:O,children:"Единица расхода"}),e.jsx("select",{className:$,value:c.consumption_unit,onChange:s=>a("consumption_unit",s.target.value),children:Le.map(s=>e.jsx("option",{value:s.value,children:s.label},s.value))})]}),Number(c.consumption)>0&&e.jsxs("div",{className:"rounded-lg border border-[#D4AF37]/30 bg-[#161616] px-4 py-3 text-sm text-white/70 sm:col-span-2",children:[e.jsx(A,{name:"Info",size:14,className:"mr-2 inline text-[#D4AF37]"}),"1 ",c.unit," ","покрывает ",Number(c.consumption)," ",c.consumption_unit,Number(c.price)>0&&e.jsxs("span",{className:"text-white/40",children:[" ","· стоимость ",(Number(c.price)/Number(c.consumption)).toFixed(2)," ₽ за 1"," ",c.consumption_unit]})]})]}),e.jsx("div",{className:"mt-6",children:e.jsx(Be,{materialId:i.id,unit:c.unit,offers:i.offers||[],onChanged:l})}),e.jsx("div",{className:"mb-4 mt-6 text-xs uppercase text-white/40",children:"Примечание к материалу"}),e.jsx("input",{className:$,placeholder:"Необязательно",value:c.note,onChange:s=>a("note",s.target.value)}),e.jsxs("div",{className:"mt-6 flex flex-wrap items-center gap-3",children:[e.jsxs("button",{className:"flex items-center gap-2 rounded-lg bg-[#D4AF37] px-5 py-2.5 text-sm text-[#161616] transition-colors hover:bg-[#B8860B] disabled:opacity-40",onClick:S,disabled:c.name.trim().length<2||f,children:[e.jsx(A,{name:f?"Loader2":"Check",size:16,className:f?"animate-spin":""}),"Сохранить изменения"]}),e.jsx("button",{className:"rounded-lg border border-white/10 px-5 py-2.5 text-sm text-white/60 transition-colors hover:text-white",onClick:x,children:"Отмена"})]})]})})}function Ue({materials:i,filtered:x,shops:l,search:c,setSearch:h,shopFilter:f,setShopFilter:t,run:r}){const[o,a]=b.useState(null),S=i.find(s=>s.id===o)||null;return e.jsxs("div",{className:"rounded-xl border border-white/10 bg-[#1f1f1f] p-5",children:[e.jsxs("div",{className:"mb-4 flex flex-wrap items-center gap-3",children:[e.jsxs("div",{className:"relative min-w-[220px] flex-1",children:[e.jsx(A,{name:"Search",size:16,className:"absolute left-3 top-1/2 -translate-y-1/2 text-white/30"}),e.jsx("input",{className:`${$} pl-9`,placeholder:"Поиск: материал, категория, магазин, адрес",value:c,onChange:s=>h(s.target.value)})]}),e.jsxs("select",{className:`${$} max-w-[200px]`,value:f,onChange:s=>t(s.target.value),children:[e.jsx("option",{value:"",children:"Все магазины"}),l.map(s=>e.jsx("option",{value:s,children:s},s))]}),e.jsxs(ce,{to:"/cabinet/materials/new",className:xe,children:[e.jsx(A,{name:"Plus",size:16}),"Добавить материал"]})]}),x.length===0?e.jsx("div",{className:"py-16 text-center text-sm text-white/30",children:i.length===0?"Справочник пуст — добавьте первый материал":"Ничего не найдено по заданным условиям"}):e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"w-full text-sm",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"border-b border-white/10 text-xs uppercase text-white/40",children:[e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Материал"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Категория"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Ед. изм."}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Цена"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Расход"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Где дешевле"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Магазины"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Наличие"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Действия"})]})}),e.jsx("tbody",{children:x.map(s=>e.jsxs("tr",{className:"border-b border-white/5 last:border-0",children:[e.jsxs("td",{className:"py-3 pr-4",children:[s.name,s.note&&e.jsx("div",{className:"text-xs text-white/30",children:s.note})]}),e.jsx("td",{className:"py-3 pr-4 text-white/60",children:s.category||"—"}),e.jsx("td",{className:"py-3 pr-4 text-white/60",children:s.unit}),e.jsx("td",{className:"whitespace-nowrap py-3 pr-4 text-[#D4AF37]",children:I(w(s.price))}),e.jsx("td",{className:"whitespace-nowrap py-3 pr-4 text-white/60",children:w(s.consumption)>0?e.jsxs(e.Fragment,{children:["1 ",s.unit," = ",w(s.consumption)," ",s.consumption_unit,w(s.price)>0&&e.jsxs("div",{className:"text-xs text-white/30",children:[(w(s.price)/w(s.consumption)).toFixed(2)," ₽ за"," ",s.consumption_unit]})]}):"—"}),e.jsx("td",{className:"py-3 pr-4",children:(()=>{const j=(s.offers||[]).filter(p=>w(p.price)>0);if(j.length===0)return e.jsx("span",{className:"text-white/30",children:"—"});const y=j.reduce((p,k)=>w(k.price)<w(p.price)?k:p);return e.jsxs(e.Fragment,{children:[y.shop_url?e.jsx("a",{href:y.shop_url,target:"_blank",rel:"noreferrer",className:"hover:text-[#D4AF37]",children:y.shop_name||"—"}):y.shop_name||"—",y.shop_address&&e.jsx("div",{className:"text-xs text-white/30",children:y.shop_address})]})})()}),e.jsx("td",{className:"whitespace-nowrap py-3 pr-4 text-white/60",children:(()=>{const g=s.offers||[];if(g.length===0)return e.jsx("span",{className:"text-white/30",children:"не добавлены"});const j=g.filter(k=>w(k.price)>0).map(k=>w(k.price));if(j.length<2)return`${g.length} шт`;const y=Math.min(...j),p=Math.max(...j);return e.jsxs(e.Fragment,{children:[g.length," шт",p>y&&e.jsxs("div",{className:"text-xs text-white/30",children:["от ",I(y)," до ",I(p)]})]})})()}),e.jsx("td",{className:"whitespace-nowrap py-3 pr-4 text-xs",children:(()=>{const g=(s.offers||[]).filter(p=>p.stock_known);if(g.length===0)return e.jsx("span",{className:"text-white/30",children:"не указано"});const j=g.filter(p=>w(p.stock)>0);if(j.length===0)return e.jsx("span",{className:"text-red-400",children:"нет в наличии"});const y=j.reduce((p,k)=>p+w(k.stock),0);return e.jsxs("span",{className:"text-emerald-400",children:[y," ",s.unit,e.jsxs("div",{className:"text-white/30",children:["в ",j.length," из ",g.length]})]})})()}),e.jsx("td",{className:"py-3 pr-4",children:e.jsxs("div",{className:"flex items-center gap-1",children:[e.jsx("button",{className:"rounded-lg p-2 text-white/40 transition-colors hover:bg-white/5 hover:text-[#D4AF37]",title:"Редактировать материал",onClick:()=>a(s.id),children:e.jsx(A,{name:"Pencil",size:15})}),e.jsx(de,{onConfirm:()=>r(()=>U.remove(s.id))})]})})]},s.id))})]})}),S&&e.jsx(Re,{material:S,onClose:()=>a(null),onSaved:()=>r(async()=>{})},S.id)]})}function Ke({editRow:i,setEditRow:x,editForm:l,setEditForm:c,activeObject:h,materials:f,rooms:t,pickMaterial:r,saveEdit:o}){return e.jsx("div",{className:"fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4",onClick:()=>x(null),children:e.jsxs("div",{className:"max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-white/10 bg-[#1f1f1f] p-6",onClick:a=>a.stopPropagation(),children:[e.jsx("div",{className:"mb-1 text-base",children:"Редактирование позиции"}),e.jsxs("div",{className:"mb-5 text-xs text-white/40",children:[h==null?void 0:h.object_code," — ",h==null?void 0:h.client_name]}),e.jsxs("div",{className:"grid gap-4 sm:grid-cols-2",children:[e.jsxs("div",{className:"sm:col-span-2",children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Материал из справочника"}),e.jsxs("select",{className:$,value:l.material_id,onChange:a=>r(a.target.value),children:[e.jsx("option",{value:"",children:"Произвольная позиция"}),f.map(a=>e.jsxs("option",{value:a.id,children:[a.name," — ",I(w(a.price)),"/",a.unit]},a.id))]})]}),e.jsxs("div",{className:"sm:col-span-2",children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Наименование"}),e.jsx("input",{className:$,value:l.name,onChange:a=>c({...l,name:a.target.value})})]}),e.jsxs("div",{children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Помещение"}),e.jsxs("select",{className:$,value:l.room_id,onChange:a=>c({...l,room_id:a.target.value}),children:[e.jsx("option",{value:"",children:"Без помещения"}),t.filter(a=>a.object_id===i.object_id).map(a=>e.jsx("option",{value:a.id,children:a.name},a.id))]})]}),e.jsxs("div",{children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Вид работ"}),e.jsxs("select",{className:$,value:l.work_type,onChange:a=>c({...l,work_type:a.target.value}),children:[e.jsx("option",{value:"",children:"Не указан"}),De.map(a=>e.jsx("option",{value:a,children:a},a))]})]}),e.jsxs("div",{children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Количество"}),e.jsx("input",{className:$,type:"number",min:"0",step:"0.01",value:l.qty,onChange:a=>c({...l,qty:a.target.value})})]}),e.jsxs("div",{children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Единица измерения"}),e.jsx("select",{className:$,value:l.unit,onChange:a=>c({...l,unit:a.target.value}),children:Fe.map(a=>e.jsx("option",{value:a,children:a},a))})]}),e.jsxs("div",{children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Цена за единицу, ₽"}),e.jsx("input",{className:$,type:"number",min:"0",step:"0.01",value:l.price,onChange:a=>c({...l,price:a.target.value})})]}),e.jsxs("div",{children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Магазин"}),e.jsx("input",{className:$,value:l.shop_name,onChange:a=>c({...l,shop_name:a.target.value})})]}),e.jsxs("div",{className:"sm:col-span-2",children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Примечание"}),e.jsx("input",{className:$,value:l.note,onChange:a=>c({...l,note:a.target.value})})]}),e.jsxs("div",{className:"rounded-lg border border-[#D4AF37]/30 bg-[#161616] px-4 py-2.5 text-sm sm:col-span-2",children:["Сумма:"," ",e.jsx("span",{className:"text-[#D4AF37]",children:I(Number(l.qty||0)*Number(l.price||0))})]})]}),e.jsxs("div",{className:"mt-6 flex flex-wrap items-center gap-3",children:[e.jsxs("button",{className:xe,onClick:()=>o(!1),children:[e.jsx(A,{name:"Check",size:16}),"Сохранить"]}),e.jsxs("button",{className:"flex items-center gap-2 rounded-lg border border-[#D4AF37]/40 px-4 py-2.5 text-sm text-[#D4AF37] transition-colors hover:bg-[#D4AF37]/10",onClick:()=>o(!0),children:[e.jsx(A,{name:"Printer",size:16}),"Сохранить и печать"]}),e.jsx("button",{className:"rounded-lg border border-white/10 px-4 py-2.5 text-sm text-white/60 transition-colors hover:text-white",onClick:()=>x(null),children:"Отмена"})]})]})})}function Ze(){const{user:i}=Ne(),x=(i==null?void 0:i.company_name)||"",[l,c]=b.useState([]),[h,f]=b.useState([]),[t,r]=b.useState([]),[o,a]=b.useState([]),[S,s]=b.useState(!0),[g,j]=b.useState(""),[y,p]=b.useState(""),[k,T]=b.useState(""),[q,C]=b.useState(null),[_,E]=b.useState(!1),[z,n]=b.useState(null),[K,m]=b.useState(!1),[F,ae]=b.useState(""),[M,H]=b.useState({material_id:"",name:"",unit:"",qty:"",price:"",shop_name:"",room_id:"",work_type:"",note:""}),G=()=>{s(!0),U.list().then(u=>{c(u.materials||[]);const v=u.objects||[];f(v),C(N=>{var L;return N&&v.some(R=>R.id===N)?N:((L=v[0])==null?void 0:L.id)??null}),r(u.object_materials||[]),a(u.rooms||[])}).catch(u=>j((u==null?void 0:u.message)||"Не удалось загрузить данные")).finally(()=>s(!1))};b.useEffect(G,[]);const X=async u=>{j("");try{await u(),G()}catch(v){j((v==null?void 0:v.message)||"Операция не выполнена")}},ne=b.useMemo(()=>{const u=l.flatMap(v=>[v.shop_name,...(v.offers||[]).map(N=>N.shop_name)]);return Array.from(new Set(u.filter(Boolean))).sort()},[l]),Y=b.useMemo(()=>{const u=y.trim().toLowerCase();return l.filter(v=>{const N=(v.offers||[]).map(R=>R.shop_name);return k&&v.shop_name!==k&&!N.includes(k)?!1:u?[v.name,v.category,v.shop_name,v.shop_address,...N,...(v.offers||[]).map(R=>R.shop_address)].filter(Boolean).some(R=>String(R).toLowerCase().includes(u)):!0})},[l,y,k]),J=u=>t.filter(v=>v.object_id===u),ee=u=>J(u).reduce((v,N)=>v+w(N.qty)*w(N.price),0),P=h.find(u=>u.id===q)||null,se=u=>{const v=J(u),N=new Map;return v.forEach(L=>{const R=L.room_id?`room-${L.room_id}`:"other",ve=L.room_name||(L.room_id?"Помещение":"Без помещения");N.has(R)||N.set(R,{key:R,title:ve,items:[],sum:0});const me=N.get(R);me.items.push(L),me.sum+=w(L.qty)*w(L.price)}),Array.from(N.values())},ie=()=>X(async()=>{if(P){m(!0);try{await U.createEstimate({object_id:P.id,title:"Смета на материал",items:J(P.id)}),ae("Смета на материал сохранена — она появилась в разделе «Документы»"),setTimeout(()=>ae(""),5e3)}finally{m(!1)}}}),re=u=>{n(u),H({material_id:u.material_id?String(u.material_id):"",name:u.name||"",unit:u.unit||"шт",qty:String(w(u.qty)),price:String(w(u.price)),shop_name:u.shop_name||"",room_id:u.room_id?String(u.room_id):"",work_type:u.work_type||"",note:u.note||""})},d=u=>{const v=l.find(N=>String(N.id)===u);H(N=>({...N,material_id:u,name:v?v.name:N.name,unit:v?v.unit:N.unit,price:v?String(w(v.price)):N.price,shop_name:v?v.shop_name:N.shop_name}))},je=(u=!1)=>X(async()=>{if(!z||!P)return;const v=o.find(L=>String(L.id)===M.room_id),N={...z,material_id:M.material_id?Number(M.material_id):null,name:M.name,unit:M.unit,qty:Number(M.qty||0),price:Number(M.price||0),shop_name:M.shop_name,room_id:v?v.id:null,room_name:v?v.name:"",work_type:M.work_type,note:M.note};await U.updateObjectMaterial(z.id,{material_id:N.material_id,name:N.name,unit:N.unit,qty:N.qty,price:N.price,shop_name:N.shop_name,room_id:N.room_id,room_name:N.room_name,work_type:N.work_type,note:N.note}),n(null),u&&oe(P,[N],l,x,!0)}),fe=async u=>{q&&(await U.addToObject({object_id:q,...u}),G())};return e.jsxs(we,{title:"Материалы",subtitle:"Справочник материалов и закупки по объектам",children:[g&&e.jsx("div",{className:"mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300",children:g}),F&&e.jsxs("div",{className:"mb-4 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300",children:[e.jsx(A,{name:"CircleCheck",size:16}),F]}),S?e.jsx("div",{className:"flex justify-center py-16",children:e.jsx(A,{name:"Loader2",size:24,className:"animate-spin text-white/40"})}):e.jsxs(ye,{defaultValue:"objects",children:[e.jsxs(_e,{className:"mb-6 h-auto flex-wrap border border-white/10 bg-[#1f1f1f]",children:[e.jsx(he,{value:"objects",children:"Объекты"}),e.jsx(he,{value:"catalog",children:"Справочник"})]}),e.jsx(pe,{value:"objects",children:e.jsx(qe,{objects:h,materials:l,rooms:o,companyName:x,selectedObject:q,setSelectedObject:C,activeObject:P,showCalc:_,setShowCalc:E,savingEstimate:K,saveEstimate:ie,materialsOf:J,sumOf:ee,groupedByRoom:se,addFromCalc:fe,openEdit:re,run:X})}),e.jsx(pe,{value:"catalog",children:e.jsx(Ue,{materials:l,filtered:Y,shops:ne,search:y,setSearch:p,shopFilter:k,setShopFilter:T,run:X})})]}),z&&e.jsx(Ke,{editRow:z,setEditRow:n,editForm:M,setEditForm:H,activeObject:P,materials:l,rooms:o,pickMaterial:d,saveEdit:je})]})}export{Ze as default};
