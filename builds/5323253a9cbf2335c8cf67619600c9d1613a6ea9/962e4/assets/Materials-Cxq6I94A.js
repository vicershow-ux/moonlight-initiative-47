const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/html2pdf-CWcG3g70.js","assets/index-DH1fzlIY.js","assets/index-erbgwsuG.css"])))=>i.map(i=>d[i]);
import{r as c,j as e,L as ae,I as w,_ as de,b as ce,Y as X}from"./index-DH1fzlIY.js";import{C as xe}from"./CrmLayout-qrZFk_Bq.js";import{T as me,a as pe,b as ne,c as re}from"./tabs-Ccdw49fo.js";import"./index-DWWcghWQ.js";import"./index-CWcgaDQE.js";const ee=n=>new Intl.NumberFormat("ru-RU",{maximumFractionDigits:2}).format(n||0)+" ₽",u=n=>Number(n||0),L="w-full bg-[#1f1f1f] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50",he="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm px-4 py-2.5 rounded-lg disabled:opacity-40",ue=["Демонтажные работы","Подготовительные работы","Черновые работы","Чистовые работы","Плиточные работы","Устройство полов","Потолочные работы","Гипсокартонные работы","Малярные работы","Электромонтажные работы","Сантехнические работы","Столярные работы"],fe=[{value:"area",label:"Пол / потолок (площадь)"},{value:"wall_area",label:"Стены (площадь)"},{value:"perimeter",label:"Периметр"}];function be({objectId:n,materials:r,rooms:l,existing:p,onAdd:d,onCancel:g}){const o=c.useMemo(()=>l.filter(s=>s.object_id===n),[l,n]),[x,f]=c.useState(""),[h,$]=c.useState(""),[k,j]=c.useState("area"),[F,z]=c.useState(""),[_,E]=c.useState("1"),[R,P]=c.useState("10"),[U,O]=c.useState(!1),[q,C]=c.useState("merge"),[S,A]=c.useState("Черновые работы"),a=r.find(s=>String(s.id)===x),m=o.find(s=>String(s.id)===h),B=c.useMemo(()=>u(h==="manual"||!m?F:m[k]),[m,h,k,F])*Math.max(u(_)||1,1),M=u(a==null?void 0:a.consumption),T=M>0?B/M:0,G=T*(1+u(R)/100),b=Math.ceil(G*100)/100,I=Math.ceil(G),Z=I*u(a==null?void 0:a.price),V=!!a&&M>0&&B>0,D=c.useMemo(()=>!a||!m?null:p.find(s=>s.material_id===a.id&&s.room_id===m.id&&(s.work_type||"")===S)||null,[p,a,m,S]),t=c.useMemo(()=>m?p.filter(s=>s.room_id===m.id):[],[p,m]),i=m?`${m.name}: ${B.toFixed(2)} ${(a==null?void 0:a.consumption_unit)||""}, запас ${u(R)}%`:`Расчёт: ${B.toFixed(2)} ${(a==null?void 0:a.consumption_unit)||""}, запас ${u(R)}%`,y=async()=>{if(a){O(!0);try{await d({material_id:a.id,qty:I,note:i,room_id:m?m.id:null,room_name:m?m.name:"",work_type:S,merge:q==="merge"}),f("")}finally{O(!1)}}};return r.length===0?e.jsxs("div",{className:"text-sm text-white/40",children:["Справочник пуст —"," ",e.jsx(ae,{to:"/cabinet/materials/new",className:"text-[#D4AF37] hover:underline",children:"добавьте материал"})]}):e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"grid gap-3 md:grid-cols-2",children:[e.jsxs("div",{children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Материал"}),e.jsxs("select",{className:L,value:x,onChange:s=>f(s.target.value),children:[e.jsx("option",{value:"",children:"Выберите материал из справочника"}),r.map(s=>e.jsxs("option",{value:s.id,children:[s.name," — ",ee(u(s.price)),"/",s.unit,u(s.consumption)>0?` · 1 ${s.unit} = ${u(s.consumption)} ${s.consumption_unit}`:""]},s.id))]}),a&&M<=0&&e.jsx("div",{className:"mt-1.5 text-xs text-amber-400",children:"У этого материала не указан расход — расчёт невозможен"})]}),e.jsxs("div",{children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Помещение"}),e.jsxs("select",{className:L,value:h,onChange:s=>$(s.target.value),children:[e.jsx("option",{value:"",children:"Выберите помещение"}),o.map(s=>e.jsxs("option",{value:s.id,children:[s.name," — пол ",u(s.area)," м², стены ",u(s.wall_area)," м²"]},s.id)),e.jsx("option",{value:"manual",children:"Ввести площадь вручную"})]}),o.length===0&&e.jsx("div",{className:"mt-1.5 text-xs text-white/40",children:"У объекта нет помещений — введите площадь вручную"})]}),e.jsxs("div",{className:"md:col-span-2",children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Вид работ"}),e.jsx("select",{className:L,value:S,onChange:s=>A(s.target.value),children:ue.map(s=>e.jsx("option",{value:s,children:s},s))})]})]}),e.jsxs("div",{className:"grid gap-3 md:grid-cols-4",children:[h==="manual"||!m?e.jsxs("div",{children:[e.jsxs("label",{className:"mb-1.5 block text-xs text-white/50",children:["Площадь / длина, ",(a==null?void 0:a.consumption_unit)||"м²"]}),e.jsx("input",{className:L,type:"number",min:"0",step:"0.01",placeholder:"0",value:F,onChange:s=>z(s.target.value)})]}):e.jsxs("div",{children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Что обрабатываем"}),e.jsx("select",{className:L,value:k,onChange:s=>j(s.target.value),children:fe.map(s=>e.jsx("option",{value:s.value,children:s.label},s.value))})]}),e.jsxs("div",{children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Слоёв"}),e.jsx("input",{className:L,type:"number",min:"1",step:"1",value:_,onChange:s=>E(s.target.value)})]}),e.jsxs("div",{children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Запас, %"}),e.jsx("input",{className:L,type:"number",min:"0",step:"1",value:R,onChange:s=>P(s.target.value)})]}),e.jsx("div",{className:"flex items-end",children:e.jsxs("button",{className:he,onClick:y,disabled:!V||U,children:[e.jsx(w,{name:U?"Loader2":"Plus",size:16,className:U?"animate-spin":""}),D&&q==="merge"?"Добавить к расчёту":"Сохранить в объект"]})})]}),t.length>0&&m&&e.jsxs("div",{className:"rounded-lg border border-white/10 bg-[#1f1f1f] p-4",children:[e.jsxs("div",{className:"mb-2 text-xs uppercase text-white/40",children:["Уже рассчитано по помещению «",m.name,"»"]}),e.jsx("div",{className:"space-y-1.5 text-sm text-white/60",children:t.map(s=>e.jsxs("div",{className:"flex flex-wrap justify-between gap-2",children:[e.jsxs("span",{children:[s.name,s.work_type&&e.jsx("span",{className:"ml-2 text-xs text-white/30",children:s.work_type})]}),e.jsxs("span",{children:[u(s.qty)," ",s.unit," · ",ee(u(s.qty)*u(s.price))]})]},s.id))})]}),D&&e.jsxs("div",{className:"rounded-lg border border-amber-500/30 bg-amber-500/5 p-4",children:[e.jsxs("div",{className:"mb-3 flex items-start gap-2 text-sm text-amber-200",children:[e.jsx(w,{name:"TriangleAlert",size:15,className:"mt-0.5 shrink-0"}),e.jsxs("span",{children:["По помещению «",m==null?void 0:m.name,"» в разделе «",S,"» уже есть расчёт «",D.name,"» —"," ",u(D.qty)," ",D.unit,". Что сделать с новым расчётом?"]})]}),e.jsxs("div",{className:"flex flex-wrap gap-4 text-sm",children:[e.jsxs("label",{className:"flex cursor-pointer items-center gap-2",children:[e.jsx("input",{type:"radio",className:"accent-[#D4AF37]",checked:q==="merge",onChange:()=>C("merge")}),"Добавить к существующему (",u(D.qty)," + ",I," = ",u(D.qty)+I," ",D.unit,")"]}),e.jsxs("label",{className:"flex cursor-pointer items-center gap-2",children:[e.jsx("input",{type:"radio",className:"accent-[#D4AF37]",checked:q==="new",onChange:()=>C("new")}),"Добавить отдельной строкой"]})]})]}),V&&e.jsxs("div",{className:"rounded-lg border border-[#D4AF37]/30 bg-[#1f1f1f] p-4",children:[e.jsxs("div",{className:"mb-3 flex items-center gap-2 text-xs uppercase text-white/40",children:[e.jsx(w,{name:"Calculator",size:14,className:"text-[#D4AF37]"}),"Результат расчёта"]}),e.jsxs("div",{className:"grid gap-4 text-sm sm:grid-cols-4",children:[e.jsxs("div",{children:[e.jsx("div",{className:"text-xs text-white/40",children:"Площадь с учётом слоёв"}),e.jsxs("div",{children:[B.toFixed(2)," ",a==null?void 0:a.consumption_unit]})]}),e.jsxs("div",{children:[e.jsx("div",{className:"text-xs text-white/40",children:"Чистый расход"}),e.jsxs("div",{children:[T.toFixed(2)," ",a==null?void 0:a.unit]})]}),e.jsxs("div",{children:[e.jsxs("div",{className:"text-xs text-white/40",children:["С запасом ",u(R),"%"]}),e.jsxs("div",{children:[b.toFixed(2)," ",a==null?void 0:a.unit]})]}),e.jsxs("div",{children:[e.jsx("div",{className:"text-xs text-white/40",children:"К покупке"}),e.jsxs("div",{className:"text-[#D4AF37]",children:[I," ",a==null?void 0:a.unit," · ",ee(Z)]})]})]}),e.jsxs("div",{className:"mt-3 border-t border-white/10 pt-3 text-xs text-white/40",children:["1 ",a==null?void 0:a.unit," покрывает ",M," ",a==null?void 0:a.consumption_unit,a!=null&&a.shop_name?` · магазин: ${a.shop_name}`:""]})]}),e.jsx("button",{className:"text-sm text-white/40 transition-colors hover:text-white",onClick:g,children:"Свернуть калькулятор"})]})}const K=(n,r=0)=>{const l=typeof n=="string"?parseFloat(n):Number(n);return Number.isFinite(l)?l:r},J=n=>new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0}).format(K(n))+" ₽",ge=n=>new Date(n).toLocaleString("ru-RU",{day:"numeric",month:"numeric",year:"numeric",hour:"2-digit",minute:"2-digit"});function N(n){const r=document.createElement("div");return r.textContent=n??"",r.innerHTML}function je(n,r){const l=new Map;return n.forEach(p=>{const d=r.find(x=>x.id===p.material_id),g=p.shop_name||(d==null?void 0:d.shop_name)||"Магазин не указан";l.has(g)||l.set(g,{name:g,address:"",phone:"",items:[],sum:0});const o=l.get(g);!o.address&&(d!=null&&d.shop_address)&&(o.address=d.shop_address),!o.phone&&(d!=null&&d.shop_phone)&&(o.phone=d.shop_phone),o.items.push(p),o.sum+=K(p.qty)*K(p.price)}),Array.from(l.values()).sort((p,d)=>d.sum-p.sum)}function oe(n,r,l,p){const d=je(r,l),g=d.reduce((j,F)=>j+F.sum,0),o=Array.from(new Set(r.map(j=>j.room_name).filter(Boolean))),x=o.length?o.join(", "):"Без помещения",f=d.map(j=>{const F=j.items.map((_,E)=>`
            <tr>
              <td class="num">${E+1}</td>
              <td>${N(_.name)}</td>
              <td>${N(_.room_name||"—")}</td>
              <td>${N(_.work_type||"—")}</td>
              <td class="center">${K(_.qty)}</td>
              <td class="center">${N(_.unit)}</td>
              <td class="right">${J(_.price)}</td>
              <td class="right amount">${J(K(_.qty)*K(_.price))}</td>
            </tr>`).join(""),z=j.address?`Адрес: ${N(j.address)}`:"";return`
      <div class="room-block">
        <div class="cat-block">
          <table>
            <thead>
              <tr>
                <th class="num">№</th>
                <th>Наименование материала</th>
                <th>Помещение</th>
                <th>Вид работ</th>
                <th class="center">Кол-во</th>
                <th class="center">Ед.</th>
                <th class="right">Цена</th>
                <th class="right">Сумма</th>
              </tr>
            </thead>
            <tbody>
              <tr class="cat-row"><td colspan="8">${N(j.name)}${z?` — ${z}`:""}</td></tr>
              ${F}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="7" class="right">Итого по магазину</td>
                <td class="right amount">${J(j.sum)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>`}).join(""),h=`
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
    width: 72px;
    height: 44px;
    min-width: 72px;
    background-repeat: no-repeat;
    background-position: left center;
    background-size: contain;
    flex: 0 0 auto;
  }
  .brand span { color: #7A4E10; }
  .doc-title { text-align: right; }
  .doc-title h1 { font-size: 20px; margin: 0 0 4px; }
  .doc-title p { margin: 0; color: #1a1a1a; font-size: 13px; }
  .doc-subtitle h2 { font-size: 19px; margin: 0; letter-spacing: -0.3px; }
  .doc-subtitle p { margin: 4px 0 0; color: #1a1a1a; font-size: 12px; }
  hr.thin { border: none; border-top: 1.5px solid #7A4E10; margin: 20px 0; }
  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px 32px;
    background: #ffffff;
    border: 1.5px solid #7A4E10;
    border-radius: 10px;
    padding: 16px;
    margin-bottom: 24px;
    font-size: 13px;
  }
  .info-grid .label {
    color: #6B4508;
    font-size: 11.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    margin-bottom: 2px;
  }
  .info-grid .value { font-weight: 500; }
  .room-block { margin-bottom: 22px; page-break-inside: avoid; break-inside: avoid; }
  .cat-block {
    page-break-inside: avoid;
    break-inside: avoid;
    border: 1.5px solid #7A4E10;
    border-radius: 10px;
    overflow: hidden;
    margin-bottom: 12px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12.5px;
    table-layout: fixed;
    color: #1a1a1a;
  }
  thead th:nth-child(1) { width: 28px; }
  thead th:nth-child(2) { width: auto; }
  thead th:nth-child(3) { width: 90px; }
  thead th:nth-child(4) { width: 110px; }
  thead th:nth-child(5) { width: 56px; }
  thead th:nth-child(6) { width: 44px; }
  thead th:nth-child(7) { width: 78px; }
  thead th:nth-child(8) { width: 88px; }
  tbody td { overflow-wrap: break-word; word-break: break-word; }
  thead th {
    background: #5C3A11;
    color: #ffffff;
    text-align: left;
    padding: 8px 10px;
    font-weight: 700;
    font-size: 11.5px;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }
  tbody td {
    padding: 8px 10px;
    border-top: 1.2px solid #8A6A3A;
    color: #1a1a1a;
    font-size: 12.5px;
  }
  .num { color: #1a1a1a; }
  .center { text-align: center; }
  .right { text-align: right; }
  .amount { font-weight: 600; }
  .cat-row td {
    background: #EADCC0;
    color: #4A2E06;
    font-weight: 700;
    font-size: 12px;
    border-top: none;
  }
  tfoot td {
    padding: 8px 10px;
    font-size: 13px;
    background: #ffffff;
    border-top: 1.5px solid #5C3A11;
    font-weight: 600;
  }
  .summary { display: flex; justify-content: flex-end; margin-bottom: 24px; }
  .summary-box {
    width: 100%;
    max-width: 290px;
    background: #ffffff;
    border: 1.5px solid #7A4E10;
    border-radius: 10px;
    padding: 16px;
    font-size: 13px;
  }
  .summary-row { display: flex; justify-content: space-between; margin-bottom: 6px; color: #1a1a1a; }
  .summary-total {
    display: flex;
    justify-content: space-between;
    font-size: 16px;
    font-weight: 700;
    padding-top: 8px;
    border-top: 1.5px solid #5C3A11;
  }
  .parties {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    font-size: 13px;
    margin-bottom: 12px;
  }
  .parties .label {
    color: #6B4508;
    font-size: 11.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    margin-bottom: 4px;
  }
  .parties .name { font-weight: 600; }
  .parties .contact { color: #333; font-size: 12.5px; margin-top: 2px; }
  .footer { text-align: right; font-size: 11.5px; color: #444; margin-top: 24px; }
  @page { size: A4 portrait; margin: 10mm; }
  @media print {
    html, body { width: auto; margin: 0; padding: 0; background: #fff; overflow: visible; }
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    .est-root { padding: 0 2mm; width: 100%; max-width: 100%; margin: 0; overflow: visible; }
    .no-print { display: none; }
    .cat-block, .room-block { break-inside: avoid; }
    table { width: 100%; table-layout: fixed; }
    td, th { overflow-wrap: break-word; word-break: break-word; }
    thead th { background: #5C3A11 !important; color: #ffffff !important; }
    .cat-row td { background: #EADCC0 !important; color: #4A2E06 !important; }
    tfoot td { background: #ffffff !important; border-top: 1px solid #A98A5C !important; }
    .info-grid, .summary-box { background: #ffffff !important; border: 1.5px solid #7A4E10 !important; }
    .cat-block { border: 1.5px solid #7A4E10 !important; }
    .info-grid .label, .parties .label { color: #6B4508 !important; }
    tbody td { border-top: 1.2px solid #8A6A3A !important; color: #1a1a1a !important; }
    tbody tr:first-child td { border-top: none !important; }
    hr.thin { border-top: 1.5px solid #7A4E10 !important; }
  }
`,$=`
  <div class="header">
    <div class="brand"><div class="brand-logo" style="background-image:url('${window.location.origin}/favicon.png')"></div>Fix<span>Key</span></div>
    <div class="doc-title">
      <h1>Список материалов</h1>
      <p>Объект № ${N(n.object_code)}</p>
    </div>
  </div>

  <div class="doc-subtitle">
    <h2>ВЕДОМОСТЬ МАТЕРИАЛОВ</h2>
    <p>Расчёт материалов по помещениям и магазинам</p>
  </div>

  <hr class="thin" />

  <div class="info-grid">
    <div>
      <div class="label">ID объекта</div>
      <div class="value">${N(n.object_code)}</div>
    </div>
    <div>
      <div class="label">Заказчик</div>
      <div class="value">${N(n.client_name)}</div>
    </div>
    <div>
      <div class="label">Адрес объекта</div>
      <div class="value">${N(n.address||"—")}</div>
    </div>
    <div>
      <div class="label">Помещение</div>
      <div class="value">${N(x)}</div>
    </div>
  </div>

  ${f}

  <div class="summary">
    <div class="summary-box">
      <div class="summary-row">
        <span>Помещение:</span>
        <span>${N(x)}</span>
      </div>
      <div class="summary-total">
        <span>ИТОГО:</span>
        <span>${J(g)}</span>
      </div>
    </div>
  </div>

  <hr class="thin" />

  <div class="parties">
    <div>
      <div class="label">Исполнитель</div>
      <div class="name">${N(p)}</div>
    </div>
    <div>
      <div class="label">Заказчик</div>
      <div class="name">${N(n.client_name)}</div>
    </div>
  </div>

  <div class="footer">
    Сформировано ${ge(new Date().toISOString())}
  </div>`,k=`Материалы № ${n.object_code} — ${N(n.client_name)}`;return{styles:h,bodyContent:$,title:k}}function te(n,r,l,p,d=!1){const{styles:g,bodyContent:o,title:x}=oe(n,r,l,p),f=`<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8" />
<title>${x}</title>
<style>${g}</style>
</head>
<body>
<div class="est-root">${o}</div>
</body>
</html>`,h=window.open("","_blank","width=900,height=1000");h&&(h.document.open(),h.document.write(f),h.document.close(),d&&(h.onload=()=>{h.focus(),h.print()}))}function ve(n,r){return n.replace(/@page[^{]*\{[^}]*\}/g,"").replace(/@media\s+print\s*\{(?:[^{}]*\{[^}]*\})*[^{}]*\}/g,"").replace(/(^|\})\s*([^{}@]+)\s*\{/g,(p,d,g)=>{const o=g.split(",").map(x=>{const f=x.trim();return f?f==="*"?`${r}, ${r} *`:/^(html|body)$/i.test(f)||f===".est-root"?r:f.startsWith(".est-root ")?`${r} ${f.slice(10)}`:`${r} ${f}`:""}).filter(Boolean).join(", ");return`${d} ${o} {`})}async function we(n,r,l,p){const{styles:d,bodyContent:g}=oe(n,r,l,p),o=document.createElement("div");o.style.position="fixed",o.style.left="-10000px",o.style.top="0",o.style.width="760px",o.style.background="#ffffff";const x=document.createElement("div");x.id="pdf-scope-materials",x.className="est-root",x.style.width="760px",x.style.maxWidth="760px",x.style.padding="0",x.style.margin="0",x.style.background="#ffffff";const f=document.createElement("style");f.textContent=ve(d,"#pdf-scope-materials"),x.appendChild(f);const h=document.createElement("div");h.innerHTML=g,x.appendChild(h),o.appendChild(x),document.body.appendChild(o),await new Promise($=>{const k=new Image;k.onload=()=>$(),k.onerror=()=>$(),k.src=`${window.location.origin}/favicon.png`,setTimeout($,3e3)});try{const $=(await de(async()=>{const{default:k}=await import("./html2pdf-CWcG3g70.js").then(j=>j.h);return{default:k}},__vite__mapDeps([0,1,2]))).default;await $().set({margin:[12,12,12,12],filename:`Материалы ${n.object_code}.pdf`,image:{type:"jpeg",quality:.98},html2canvas:{scale:2,useCORS:!0,backgroundColor:"#ffffff",width:760,windowWidth:760,scrollX:0,scrollY:0},jsPDF:{unit:"mm",format:"a4",orientation:"portrait"},pagebreak:{mode:["css","legacy"],avoid:[".cat-block",".room-block"]}}).from(x).save()}finally{o.parentNode&&document.body.removeChild(o)}}const H=n=>new Intl.NumberFormat("ru-RU",{maximumFractionDigits:2}).format(n||0)+" ₽",v=n=>Number(n||0),Y="w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50",se="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm px-4 py-2.5 rounded-lg disabled:opacity-40";function Ce(){const{user:n}=ce(),r=(n==null?void 0:n.company_name)||"",[l,p]=c.useState([]),[d,g]=c.useState([]),[o,x]=c.useState([]),[f,h]=c.useState([]),[$,k]=c.useState(!0),[j,F]=c.useState(""),[z,_]=c.useState(""),[E,R]=c.useState(""),[P,U]=c.useState(null),[O,q]=c.useState(!1),[C,S]=c.useState(null),[A,a]=c.useState({qty:"",price:"",note:""}),m=()=>{k(!0),X.list().then(t=>{p(t.materials||[]);const i=t.objects||[];g(i),U(y=>{var s;return y&&i.some(W=>W.id===y)?y:((s=i[0])==null?void 0:s.id)??null}),x(t.object_materials||[]),h(t.rooms||[])}).catch(t=>F((t==null?void 0:t.message)||"Не удалось загрузить данные")).finally(()=>k(!1))};c.useEffect(m,[]);const Q=async t=>{F("");try{await t(),m()}catch(i){F((i==null?void 0:i.message)||"Операция не выполнена")}},B=c.useMemo(()=>Array.from(new Set(l.map(t=>t.shop_name).filter(Boolean))).sort(),[l]),M=c.useMemo(()=>{const t=z.trim().toLowerCase();return l.filter(i=>(!E||i.shop_name===E)&&(!t||[i.name,i.category,i.shop_name,i.shop_address].filter(Boolean).some(y=>String(y).toLowerCase().includes(t))))},[l,z,E]),T=t=>o.filter(i=>i.object_id===t),G=t=>T(t).reduce((i,y)=>i+v(y.qty)*v(y.price),0),b=d.find(t=>t.id===P)||null,I=t=>{const i=T(t),y=new Map;return i.forEach(s=>{const W=s.room_id?`room-${s.room_id}`:"other",le=s.room_name||(s.room_id?"Помещение":"Без помещения");y.has(W)||y.set(W,{key:W,title:le,items:[],sum:0});const ie=y.get(W);ie.items.push(s),ie.sum+=v(s.qty)*v(s.price)}),Array.from(y.values())},Z=t=>{S(t),a({qty:String(v(t.qty)),price:String(v(t.price)),note:t.note||""})},V=(t=!1)=>Q(async()=>{if(!C||!b)return;const i={...C,qty:Number(A.qty||0),price:Number(A.price||0),note:A.note};await X.updateObjectMaterial(C.id,{qty:i.qty,price:i.price,note:i.note}),S(null),t&&te(b,[i],l,r,!0)}),D=async t=>{P&&(await X.addToObject({object_id:P,...t}),m())};return e.jsxs(xe,{title:"Материалы",subtitle:"Справочник материалов и закупки по объектам",children:[j&&e.jsx("div",{className:"mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300",children:j}),$?e.jsx("div",{className:"flex justify-center py-16",children:e.jsx(w,{name:"Loader2",size:24,className:"animate-spin text-white/40"})}):e.jsxs(me,{defaultValue:"objects",children:[e.jsxs(pe,{className:"mb-6 h-auto flex-wrap border border-white/10 bg-[#1f1f1f]",children:[e.jsx(ne,{value:"objects",children:"Объекты"}),e.jsx(ne,{value:"catalog",children:"Справочник"})]}),e.jsx(re,{value:"objects",children:e.jsx("div",{className:"rounded-xl border border-white/10 bg-[#1f1f1f] p-5",children:d.length===0?e.jsxs("div",{className:"py-16 text-center text-sm text-white/30",children:["Объектов пока нет —"," ",e.jsx(ae,{to:"/cabinet/objects",className:"text-[#D4AF37] hover:underline",children:"создать объект"})]}):e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"mb-5 flex flex-wrap items-end gap-3",children:[e.jsxs("div",{className:"min-w-[280px] flex-1",children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Объект"}),e.jsxs("select",{className:Y,value:P??"",onChange:t=>{U(t.target.value?Number(t.target.value):null),q(!1)},children:[e.jsx("option",{value:"",children:"Выберите объект"}),d.map(t=>e.jsxs("option",{value:t.id,children:[t.object_code," — ",t.client_name,t.address?` · ${t.address}`:""]},t.id))]})]}),b&&e.jsx(e.Fragment,{children:e.jsxs("button",{className:se,onClick:()=>q(!O),children:[e.jsx(w,{name:O?"X":"Calculator",size:16}),O?"Свернуть":"Рассчитать помещение"]})})]}),b?e.jsxs(e.Fragment,{children:[O&&e.jsx("div",{className:"mb-5 rounded-lg border border-[#D4AF37]/30 bg-[#161616] p-4",children:e.jsx(be,{objectId:b.id,materials:l,rooms:f,existing:T(b.id),onAdd:D,onCancel:()=>q(!1)})}),e.jsxs("div",{className:"mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#161616] px-4 py-3 text-sm",children:[e.jsxs("div",{className:"text-white/60",children:[b.object_code," — ",b.client_name,e.jsxs("span",{className:"ml-2 text-white/30",children:[T(b.id).length," позиций"]})]}),e.jsxs("div",{className:"text-[#D4AF37]",children:["Итого: ",H(G(b.id))]})]}),T(b.id).length===0?e.jsx("div",{className:"py-14 text-center text-sm text-white/30",children:"Для этого объекта расчётов ещё нет — нажмите «Рассчитать помещение»"}):e.jsx("div",{className:"space-y-4",children:I(b.id).map(t=>e.jsxs("div",{className:"rounded-lg border border-white/10 bg-[#161616]",children:[e.jsxs("div",{className:"flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3",children:[e.jsxs("div",{className:"flex items-center gap-2 text-sm",children:[e.jsx(w,{name:"DoorOpen",size:15,className:"text-[#D4AF37]"}),t.title]}),e.jsx("div",{className:"text-sm text-[#D4AF37]",children:H(t.sum)})]}),e.jsx("div",{className:"overflow-x-auto p-4",children:e.jsxs("table",{className:"w-full text-sm",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"border-b border-white/10 text-xs uppercase text-white/40",children:[e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Материал"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Вид работ"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Кол-во"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Цена"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Сумма"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Магазин"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Действия"})]})}),e.jsx("tbody",{children:t.items.map(i=>e.jsxs("tr",{className:"border-b border-white/5 last:border-0",children:[e.jsxs("td",{className:"py-2.5 pr-4",children:[i.name,i.note&&e.jsx("div",{className:"text-xs text-white/30",children:i.note})]}),e.jsx("td",{className:"py-2.5 pr-4 text-white/60",children:i.work_type||"—"}),e.jsxs("td",{className:"whitespace-nowrap py-2.5 pr-4",children:[v(i.qty)," ",i.unit]}),e.jsx("td",{className:"py-2.5 pr-4 text-white/60",children:H(v(i.price))}),e.jsx("td",{className:"whitespace-nowrap py-2.5 pr-4 text-[#D4AF37]",children:H(v(i.qty)*v(i.price))}),e.jsx("td",{className:"py-2.5 pr-4 text-white/60",children:i.shop_name||"—"}),e.jsx("td",{className:"py-2.5 pr-4",children:e.jsxs("div",{className:"flex items-center gap-2.5",children:[e.jsx("button",{className:"text-white/50 transition-colors hover:text-[#D4AF37]",title:"Просмотр",onClick:()=>te(b,[i],l,r),children:e.jsx(w,{name:"Eye",size:16})}),e.jsx("button",{className:"text-white/50 transition-colors hover:text-[#D4AF37]",title:"Редактировать",onClick:()=>Z(i),children:e.jsx(w,{name:"Pencil",size:16})}),e.jsx("button",{className:"text-white/50 transition-colors hover:text-[#D4AF37]",title:"Печать",onClick:()=>te(b,[i],l,r,!0),children:e.jsx(w,{name:"Printer",size:16})}),e.jsx("button",{className:"text-white/50 transition-colors hover:text-[#D4AF37]",title:"Скачать PDF",onClick:()=>we(b,[i],l,r),children:e.jsx(w,{name:"FileDown",size:16})}),e.jsx("button",{className:"text-white/40 transition-colors hover:text-red-400",title:"Убрать с объекта",onClick:()=>Q(()=>X.removeFromObject(i.id)),children:e.jsx(w,{name:"Trash2",size:16})})]})})]},i.id))})]})})]},t.key))})]}):e.jsx("div",{className:"py-16 text-center text-sm text-white/30",children:"Выберите объект, чтобы увидеть его расчёты и материалы"})]})})}),e.jsx(re,{value:"catalog",children:e.jsxs("div",{className:"rounded-xl border border-white/10 bg-[#1f1f1f] p-5",children:[e.jsxs("div",{className:"mb-4 flex flex-wrap items-center gap-3",children:[e.jsxs("div",{className:"relative min-w-[220px] flex-1",children:[e.jsx(w,{name:"Search",size:16,className:"absolute left-3 top-1/2 -translate-y-1/2 text-white/30"}),e.jsx("input",{className:`${Y} pl-9`,placeholder:"Поиск: материал, категория, магазин, адрес",value:z,onChange:t=>_(t.target.value)})]}),e.jsxs("select",{className:`${Y} max-w-[200px]`,value:E,onChange:t=>R(t.target.value),children:[e.jsx("option",{value:"",children:"Все магазины"}),B.map(t=>e.jsx("option",{value:t,children:t},t))]}),e.jsxs(ae,{to:"/cabinet/materials/new",className:se,children:[e.jsx(w,{name:"Plus",size:16}),"Добавить материал"]})]}),M.length===0?e.jsx("div",{className:"py-16 text-center text-sm text-white/30",children:l.length===0?"Справочник пуст — добавьте первый материал":"Ничего не найдено по заданным условиям"}):e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"w-full text-sm",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"border-b border-white/10 text-xs uppercase text-white/40",children:[e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Материал"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Категория"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Ед. изм."}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Цена"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Расход"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Магазин"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Адрес"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Контакты"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Действия"})]})}),e.jsx("tbody",{children:M.map(t=>e.jsxs("tr",{className:"border-b border-white/5 last:border-0",children:[e.jsxs("td",{className:"py-3 pr-4",children:[t.name,t.note&&e.jsx("div",{className:"text-xs text-white/30",children:t.note})]}),e.jsx("td",{className:"py-3 pr-4 text-white/60",children:t.category||"—"}),e.jsx("td",{className:"py-3 pr-4 text-white/60",children:t.unit}),e.jsx("td",{className:"whitespace-nowrap py-3 pr-4 text-[#D4AF37]",children:H(v(t.price))}),e.jsx("td",{className:"whitespace-nowrap py-3 pr-4 text-white/60",children:v(t.consumption)>0?e.jsxs(e.Fragment,{children:["1 ",t.unit," = ",v(t.consumption)," ",t.consumption_unit,v(t.price)>0&&e.jsxs("div",{className:"text-xs text-white/30",children:[(v(t.price)/v(t.consumption)).toFixed(2)," ₽ за"," ",t.consumption_unit]})]}):"—"}),e.jsx("td",{className:"py-3 pr-4",children:t.shop_url?e.jsx("a",{href:t.shop_url,target:"_blank",rel:"noreferrer",className:"hover:text-[#D4AF37]",children:t.shop_name||"—"}):t.shop_name||"—"}),e.jsx("td",{className:"py-3 pr-4 text-white/60",children:t.shop_address||"—"}),e.jsx("td",{className:"py-3 pr-4 text-white/60",children:t.shop_phone?e.jsx("a",{href:`tel:${t.shop_phone}`,className:"hover:text-[#D4AF37]",children:t.shop_phone}):"—"}),e.jsx("td",{className:"py-3 pr-4",children:e.jsx("button",{className:"text-white/40 transition-colors hover:text-red-400",title:"Удалить",onClick:()=>Q(()=>X.remove(t.id)),children:e.jsx(w,{name:"Trash2",size:16})})})]},t.id))})]})})]})})]}),C&&e.jsx("div",{className:"fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4",onClick:()=>S(null),children:e.jsxs("div",{className:"w-full max-w-md rounded-xl border border-white/10 bg-[#1f1f1f] p-6",onClick:t=>t.stopPropagation(),children:[e.jsx("div",{className:"mb-1 text-base",children:C.name}),e.jsxs("div",{className:"mb-5 text-xs text-white/40",children:[C.room_name||"Без помещения",C.work_type?` · ${C.work_type}`:""]}),e.jsxs("div",{className:"grid gap-4",children:[e.jsxs("div",{children:[e.jsxs("label",{className:"mb-1.5 block text-xs text-white/50",children:["Количество, ",C.unit]}),e.jsx("input",{className:Y,type:"number",min:"0",step:"0.01",value:A.qty,onChange:t=>a({...A,qty:t.target.value})})]}),e.jsxs("div",{children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Цена за единицу, ₽"}),e.jsx("input",{className:Y,type:"number",min:"0",step:"0.01",value:A.price,onChange:t=>a({...A,price:t.target.value})})]}),e.jsxs("div",{children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Примечание"}),e.jsx("input",{className:Y,value:A.note,onChange:t=>a({...A,note:t.target.value})})]}),e.jsxs("div",{className:"rounded-lg border border-[#D4AF37]/30 bg-[#161616] px-4 py-2.5 text-sm",children:["Сумма:"," ",e.jsx("span",{className:"text-[#D4AF37]",children:H(Number(A.qty||0)*Number(A.price||0))})]})]}),e.jsxs("div",{className:"mt-6 flex flex-wrap items-center gap-3",children:[e.jsxs("button",{className:se,onClick:()=>V(!1),children:[e.jsx(w,{name:"Check",size:16}),"Сохранить"]}),e.jsxs("button",{className:"flex items-center gap-2 rounded-lg border border-[#D4AF37]/40 px-4 py-2.5 text-sm text-[#D4AF37] transition-colors hover:bg-[#D4AF37]/10",onClick:()=>V(!0),children:[e.jsx(w,{name:"Printer",size:16}),"Сохранить и печать"]}),e.jsx("button",{className:"rounded-lg border border-white/10 px-4 py-2.5 text-sm text-white/60 transition-colors hover:text-white",onClick:()=>S(null),children:"Отмена"})]})]})})]})}export{Ce as default};
