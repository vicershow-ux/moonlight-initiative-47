const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/html2pdf-kVc0GeCN.js","assets/index-CYaKiWOU.js","assets/index-erbgwsuG.css"])))=>i.map(i=>d[i]);
import{r as l,j as e,L as se,I as k,_ as le,b as de,Y as K}from"./index-CYaKiWOU.js";import{C as ce}from"./CrmLayout-DRA34MI5.js";import{T as xe,a as me,b as ie,c as ne}from"./tabs-u_tBTbYe.js";import"./index-YeC_J6VV.js";import"./index-BDeUfLnH.js";const ee=i=>new Intl.NumberFormat("ru-RU",{maximumFractionDigits:2}).format(i||0)+" ₽",u=i=>Number(i||0),B="w-full bg-[#1f1f1f] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50",pe="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm px-4 py-2.5 rounded-lg disabled:opacity-40",he=["Демонтажные работы","Подготовительные работы","Черновые работы","Чистовые работы","Плиточные работы","Устройство полов","Потолочные работы","Гипсокартонные работы","Малярные работы","Электромонтажные работы","Сантехнические работы","Столярные работы"],ue=[{value:"area",label:"Пол / потолок (площадь)"},{value:"wall_area",label:"Стены (площадь)"},{value:"perimeter",label:"Периметр"}];function fe({objectId:i,materials:d,rooms:c,existing:h,onAdd:r,onCancel:b}){const o=l.useMemo(()=>c.filter(s=>s.object_id===i),[c,i]),[m,p]=l.useState(""),[A,f]=l.useState(""),[g,S]=l.useState("area"),[j,M]=l.useState(""),[V,I]=l.useState("1"),[q,L]=l.useState("10"),[P,T]=l.useState(!1),[D,C]=l.useState("merge"),[$,_]=l.useState("Черновые работы"),a=d.find(s=>String(s.id)===m),x=o.find(s=>String(s.id)===A),R=l.useMemo(()=>u(A==="manual"||!x?j:x[g]),[x,A,g,j])*Math.max(u(V)||1,1),z=u(a==null?void 0:a.consumption),E=z>0?R/z:0,Q=E*(1+u(q)/100),y=Math.ceil(Q*100)/100,O=Math.ceil(Q),Z=O*u(a==null?void 0:a.price),G=!!a&&z>0&&R>0,F=l.useMemo(()=>!a||!x?null:h.find(s=>s.material_id===a.id&&s.room_id===x.id&&(s.work_type||"")===$)||null,[h,a,x,$]),t=l.useMemo(()=>x?h.filter(s=>s.room_id===x.id):[],[h,x]),n=x?`${x.name}: ${R.toFixed(2)} ${(a==null?void 0:a.consumption_unit)||""}, запас ${u(q)}%`:`Расчёт: ${R.toFixed(2)} ${(a==null?void 0:a.consumption_unit)||""}, запас ${u(q)}%`,w=async()=>{if(a){T(!0);try{await r({material_id:a.id,qty:O,note:n,room_id:x?x.id:null,room_name:x?x.name:"",work_type:$,merge:D==="merge"}),p("")}finally{T(!1)}}};return d.length===0?e.jsxs("div",{className:"text-sm text-white/40",children:["Справочник пуст —"," ",e.jsx(se,{to:"/cabinet/materials/new",className:"text-[#D4AF37] hover:underline",children:"добавьте материал"})]}):e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"grid gap-3 md:grid-cols-2",children:[e.jsxs("div",{children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Материал"}),e.jsxs("select",{className:B,value:m,onChange:s=>p(s.target.value),children:[e.jsx("option",{value:"",children:"Выберите материал из справочника"}),d.map(s=>e.jsxs("option",{value:s.id,children:[s.name," — ",ee(u(s.price)),"/",s.unit,u(s.consumption)>0?` · 1 ${s.unit} = ${u(s.consumption)} ${s.consumption_unit}`:""]},s.id))]}),a&&z<=0&&e.jsx("div",{className:"mt-1.5 text-xs text-amber-400",children:"У этого материала не указан расход — расчёт невозможен"})]}),e.jsxs("div",{children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Помещение"}),e.jsxs("select",{className:B,value:A,onChange:s=>f(s.target.value),children:[e.jsx("option",{value:"",children:"Выберите помещение"}),o.map(s=>e.jsxs("option",{value:s.id,children:[s.name," — пол ",u(s.area)," м², стены ",u(s.wall_area)," м²"]},s.id)),e.jsx("option",{value:"manual",children:"Ввести площадь вручную"})]}),o.length===0&&e.jsx("div",{className:"mt-1.5 text-xs text-white/40",children:"У объекта нет помещений — введите площадь вручную"})]}),e.jsxs("div",{className:"md:col-span-2",children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Вид работ"}),e.jsx("select",{className:B,value:$,onChange:s=>_(s.target.value),children:he.map(s=>e.jsx("option",{value:s,children:s},s))})]})]}),e.jsxs("div",{className:"grid gap-3 md:grid-cols-4",children:[A==="manual"||!x?e.jsxs("div",{children:[e.jsxs("label",{className:"mb-1.5 block text-xs text-white/50",children:["Площадь / длина, ",(a==null?void 0:a.consumption_unit)||"м²"]}),e.jsx("input",{className:B,type:"number",min:"0",step:"0.01",placeholder:"0",value:j,onChange:s=>M(s.target.value)})]}):e.jsxs("div",{children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Что обрабатываем"}),e.jsx("select",{className:B,value:g,onChange:s=>S(s.target.value),children:ue.map(s=>e.jsx("option",{value:s.value,children:s.label},s.value))})]}),e.jsxs("div",{children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Слоёв"}),e.jsx("input",{className:B,type:"number",min:"1",step:"1",value:V,onChange:s=>I(s.target.value)})]}),e.jsxs("div",{children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Запас, %"}),e.jsx("input",{className:B,type:"number",min:"0",step:"1",value:q,onChange:s=>L(s.target.value)})]}),e.jsx("div",{className:"flex items-end",children:e.jsxs("button",{className:pe,onClick:w,disabled:!G||P,children:[e.jsx(k,{name:P?"Loader2":"Plus",size:16,className:P?"animate-spin":""}),F&&D==="merge"?"Добавить к расчёту":"Сохранить в объект"]})})]}),t.length>0&&x&&e.jsxs("div",{className:"rounded-lg border border-white/10 bg-[#1f1f1f] p-4",children:[e.jsxs("div",{className:"mb-2 text-xs uppercase text-white/40",children:["Уже рассчитано по помещению «",x.name,"»"]}),e.jsx("div",{className:"space-y-1.5 text-sm text-white/60",children:t.map(s=>e.jsxs("div",{className:"flex flex-wrap justify-between gap-2",children:[e.jsxs("span",{children:[s.name,s.work_type&&e.jsx("span",{className:"ml-2 text-xs text-white/30",children:s.work_type})]}),e.jsxs("span",{children:[u(s.qty)," ",s.unit," · ",ee(u(s.qty)*u(s.price))]})]},s.id))})]}),F&&e.jsxs("div",{className:"rounded-lg border border-amber-500/30 bg-amber-500/5 p-4",children:[e.jsxs("div",{className:"mb-3 flex items-start gap-2 text-sm text-amber-200",children:[e.jsx(k,{name:"TriangleAlert",size:15,className:"mt-0.5 shrink-0"}),e.jsxs("span",{children:["По помещению «",x==null?void 0:x.name,"» в разделе «",$,"» уже есть расчёт «",F.name,"» —"," ",u(F.qty)," ",F.unit,". Что сделать с новым расчётом?"]})]}),e.jsxs("div",{className:"flex flex-wrap gap-4 text-sm",children:[e.jsxs("label",{className:"flex cursor-pointer items-center gap-2",children:[e.jsx("input",{type:"radio",className:"accent-[#D4AF37]",checked:D==="merge",onChange:()=>C("merge")}),"Добавить к существующему (",u(F.qty)," + ",O," = ",u(F.qty)+O," ",F.unit,")"]}),e.jsxs("label",{className:"flex cursor-pointer items-center gap-2",children:[e.jsx("input",{type:"radio",className:"accent-[#D4AF37]",checked:D==="new",onChange:()=>C("new")}),"Добавить отдельной строкой"]})]})]}),G&&e.jsxs("div",{className:"rounded-lg border border-[#D4AF37]/30 bg-[#1f1f1f] p-4",children:[e.jsxs("div",{className:"mb-3 flex items-center gap-2 text-xs uppercase text-white/40",children:[e.jsx(k,{name:"Calculator",size:14,className:"text-[#D4AF37]"}),"Результат расчёта"]}),e.jsxs("div",{className:"grid gap-4 text-sm sm:grid-cols-4",children:[e.jsxs("div",{children:[e.jsx("div",{className:"text-xs text-white/40",children:"Площадь с учётом слоёв"}),e.jsxs("div",{children:[R.toFixed(2)," ",a==null?void 0:a.consumption_unit]})]}),e.jsxs("div",{children:[e.jsx("div",{className:"text-xs text-white/40",children:"Чистый расход"}),e.jsxs("div",{children:[E.toFixed(2)," ",a==null?void 0:a.unit]})]}),e.jsxs("div",{children:[e.jsxs("div",{className:"text-xs text-white/40",children:["С запасом ",u(q),"%"]}),e.jsxs("div",{children:[y.toFixed(2)," ",a==null?void 0:a.unit]})]}),e.jsxs("div",{children:[e.jsx("div",{className:"text-xs text-white/40",children:"К покупке"}),e.jsxs("div",{className:"text-[#D4AF37]",children:[O," ",a==null?void 0:a.unit," · ",ee(Z)]})]})]}),e.jsxs("div",{className:"mt-3 border-t border-white/10 pt-3 text-xs text-white/40",children:["1 ",a==null?void 0:a.unit," покрывает ",z," ",a==null?void 0:a.consumption_unit,a!=null&&a.shop_name?` · магазин: ${a.shop_name}`:""]})]}),e.jsx("button",{className:"text-sm text-white/40 transition-colors hover:text-white",onClick:b,children:"Свернуть калькулятор"})]})}const Y=(i,d=0)=>{const c=typeof i=="string"?parseFloat(i):Number(i);return Number.isFinite(c)?c:d},J=i=>new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0}).format(Y(i))+" ₽",be=i=>new Date(i).toLocaleString("ru-RU",{day:"numeric",month:"numeric",year:"numeric",hour:"2-digit",minute:"2-digit"});function N(i){const d=document.createElement("div");return d.textContent=i??"",d.innerHTML}function ge(i,d){const c=new Map;return i.forEach(h=>{const r=d.find(m=>m.id===h.material_id),b=h.shop_name||(r==null?void 0:r.shop_name)||"Магазин не указан";c.has(b)||c.set(b,{name:b,address:"",phone:"",items:[],sum:0});const o=c.get(b);!o.address&&(r!=null&&r.shop_address)&&(o.address=r.shop_address),!o.phone&&(r!=null&&r.shop_phone)&&(o.phone=r.shop_phone),o.items.push(h),o.sum+=Y(h.qty)*Y(h.price)}),Array.from(c.values()).sort((h,r)=>r.sum-h.sum)}function re(i,d,c,h){const r=ge(d,c),b=r.reduce((f,g)=>f+g.sum,0),o=r.map(f=>{const g=f.items.map((j,M)=>`
            <tr>
              <td class="num">${M+1}</td>
              <td>${N(j.name)}</td>
              <td>${N(j.room_name||"—")}</td>
              <td>${N(j.work_type||"—")}</td>
              <td class="center">${Y(j.qty)}</td>
              <td class="center">${N(j.unit)}</td>
              <td class="right">${J(j.price)}</td>
              <td class="right amount">${J(Y(j.qty)*Y(j.price))}</td>
            </tr>`).join(""),S=[f.address?`Адрес: ${N(f.address)}`:"",f.phone?`Тел: ${N(f.phone)}`:""].filter(Boolean).join(" · ");return`
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
              <tr class="cat-row"><td colspan="8">${N(f.name)}${S?` — ${S}`:""}</td></tr>
              ${g}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="7" class="right">Итого по магазину</td>
                <td class="right amount">${J(f.sum)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>`}).join(""),m=`
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
`,p=`
  <div class="header">
    <div class="brand"><div class="brand-logo" style="background-image:url('${window.location.origin}/favicon.png')"></div>Fix<span>Key</span></div>
    <div class="doc-title">
      <h1>Список материалов</h1>
      <p>Объект № ${N(i.object_code)}</p>
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
      <div class="value">${N(i.object_code)}</div>
    </div>
    <div>
      <div class="label">Заказчик</div>
      <div class="value">${N(i.client_name)}</div>
    </div>
    <div>
      <div class="label">Адрес объекта</div>
      <div class="value">${N(i.address||"—")}</div>
    </div>
    <div>
      <div class="label">Позиций в ведомости</div>
      <div class="value">${d.length}</div>
    </div>
  </div>

  ${o}

  <div class="summary">
    <div class="summary-box">
      <div class="summary-row">
        <span>Магазинов:</span>
        <span>${r.length}</span>
      </div>
      <div class="summary-total">
        <span>ИТОГО:</span>
        <span>${J(b)}</span>
      </div>
    </div>
  </div>

  <hr class="thin" />

  <div class="parties">
    <div>
      <div class="label">Исполнитель</div>
      <div class="name">${N(h)}</div>
    </div>
    <div>
      <div class="label">Заказчик</div>
      <div class="name">${N(i.client_name)}</div>
    </div>
  </div>

  <div class="footer">
    Сформировано ${be(new Date().toISOString())}
  </div>`,A=`Материалы № ${i.object_code} — ${N(i.client_name)}`;return{styles:m,bodyContent:p,title:A}}function je(i,d,c,h){const{styles:r,bodyContent:b,title:o}=re(i,d,c,h),m=`<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8" />
<title>${o}</title>
<style>${r}</style>
</head>
<body>
<div class="est-root">${b}</div>
</body>
</html>`,p=window.open("","_blank","width=900,height=1000");p&&(p.document.open(),p.document.write(m),p.document.close())}function ve(i,d){return i.replace(/@page[^{]*\{[^}]*\}/g,"").replace(/@media\s+print\s*\{(?:[^{}]*\{[^}]*\})*[^{}]*\}/g,"").replace(/(^|\})\s*([^{}@]+)\s*\{/g,(h,r,b)=>{const o=b.split(",").map(m=>{const p=m.trim();return p?p==="*"?`${d}, ${d} *`:/^(html|body)$/i.test(p)||p===".est-root"?d:p.startsWith(".est-root ")?`${d} ${p.slice(10)}`:`${d} ${p}`:""}).filter(Boolean).join(", ");return`${r} ${o} {`})}async function we(i,d,c,h){const{styles:r,bodyContent:b}=re(i,d,c,h),o=document.createElement("div");o.style.position="fixed",o.style.left="-10000px",o.style.top="0",o.style.width="760px",o.style.background="#ffffff";const m=document.createElement("div");m.id="pdf-scope-materials",m.className="est-root",m.style.width="760px",m.style.maxWidth="760px",m.style.padding="0",m.style.margin="0",m.style.background="#ffffff";const p=document.createElement("style");p.textContent=ve(r,"#pdf-scope-materials"),m.appendChild(p);const A=document.createElement("div");A.innerHTML=b,m.appendChild(A),o.appendChild(m),document.body.appendChild(o),await new Promise(f=>{const g=new Image;g.onload=()=>f(),g.onerror=()=>f(),g.src=`${window.location.origin}/favicon.png`,setTimeout(f,3e3)});try{const f=(await le(async()=>{const{default:g}=await import("./html2pdf-kVc0GeCN.js").then(S=>S.h);return{default:g}},__vite__mapDeps([0,1,2]))).default;await f().set({margin:[12,12,12,12],filename:`Материалы ${i.object_code}.pdf`,image:{type:"jpeg",quality:.98},html2canvas:{scale:2,useCORS:!0,backgroundColor:"#ffffff",width:760,windowWidth:760,scrollX:0,scrollY:0},jsPDF:{unit:"mm",format:"a4",orientation:"portrait"},pagebreak:{mode:["css","legacy"],avoid:[".cat-block",".room-block"]}}).from(m).save()}finally{o.parentNode&&document.body.removeChild(o)}}const W=i=>new Intl.NumberFormat("ru-RU",{maximumFractionDigits:2}).format(i||0)+" ₽",v=i=>Number(i||0),H="w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50",te="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm px-4 py-2.5 rounded-lg disabled:opacity-40";function Ce(){const{user:i}=de(),d=(i==null?void 0:i.company_name)||"",[c,h]=l.useState([]),[r,b]=l.useState([]),[o,m]=l.useState([]),[p,A]=l.useState([]),[f,g]=l.useState(!0),[S,j]=l.useState(""),[M,V]=l.useState(""),[I,q]=l.useState(""),[L,P]=l.useState(null),[T,D]=l.useState(!1),[C,$]=l.useState(null),[_,a]=l.useState({qty:"",price:"",note:""}),x=()=>{g(!0),K.list().then(t=>{h(t.materials||[]);const n=t.objects||[];b(n),P(w=>{var s;return w&&n.some(U=>U.id===w)?w:((s=n[0])==null?void 0:s.id)??null}),m(t.object_materials||[]),A(t.rooms||[])}).catch(t=>j((t==null?void 0:t.message)||"Не удалось загрузить данные")).finally(()=>g(!1))};l.useEffect(x,[]);const X=async t=>{j("");try{await t(),x()}catch(n){j((n==null?void 0:n.message)||"Операция не выполнена")}},R=l.useMemo(()=>Array.from(new Set(c.map(t=>t.shop_name).filter(Boolean))).sort(),[c]),z=l.useMemo(()=>{const t=M.trim().toLowerCase();return c.filter(n=>(!I||n.shop_name===I)&&(!t||[n.name,n.category,n.shop_name,n.shop_address].filter(Boolean).some(w=>String(w).toLowerCase().includes(t))))},[c,M,I]),E=t=>o.filter(n=>n.object_id===t),Q=t=>E(t).reduce((n,w)=>n+v(w.qty)*v(w.price),0),y=r.find(t=>t.id===L)||null,O=t=>{const n=E(t),w=new Map;return n.forEach(s=>{const U=s.room_id?`room-${s.room_id}`:"other",oe=s.room_name||(s.room_id?"Помещение":"Без помещения");w.has(U)||w.set(U,{key:U,title:oe,items:[],sum:0});const ae=w.get(U);ae.items.push(s),ae.sum+=v(s.qty)*v(s.price)}),Array.from(w.values())},Z=t=>{$(t),a({qty:String(v(t.qty)),price:String(v(t.price)),note:t.note||""})},G=()=>X(async()=>{C&&(await K.updateObjectMaterial(C.id,{qty:Number(_.qty||0),price:Number(_.price||0),note:_.note}),$(null))}),F=async t=>{L&&(await K.addToObject({object_id:L,...t}),x())};return e.jsxs(ce,{title:"Материалы",subtitle:"Справочник материалов и закупки по объектам",children:[S&&e.jsx("div",{className:"mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300",children:S}),f?e.jsx("div",{className:"flex justify-center py-16",children:e.jsx(k,{name:"Loader2",size:24,className:"animate-spin text-white/40"})}):e.jsxs(xe,{defaultValue:"objects",children:[e.jsxs(me,{className:"mb-6 h-auto flex-wrap border border-white/10 bg-[#1f1f1f]",children:[e.jsx(ie,{value:"objects",children:"Объекты"}),e.jsx(ie,{value:"catalog",children:"Справочник"})]}),e.jsx(ne,{value:"objects",children:e.jsx("div",{className:"rounded-xl border border-white/10 bg-[#1f1f1f] p-5",children:r.length===0?e.jsxs("div",{className:"py-16 text-center text-sm text-white/30",children:["Объектов пока нет —"," ",e.jsx(se,{to:"/cabinet/objects",className:"text-[#D4AF37] hover:underline",children:"создать объект"})]}):e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"mb-5 flex flex-wrap items-end gap-3",children:[e.jsxs("div",{className:"min-w-[280px] flex-1",children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Объект"}),e.jsxs("select",{className:H,value:L??"",onChange:t=>{P(t.target.value?Number(t.target.value):null),D(!1)},children:[e.jsx("option",{value:"",children:"Выберите объект"}),r.map(t=>e.jsxs("option",{value:t.id,children:[t.object_code," — ",t.client_name,t.address?` · ${t.address}`:""]},t.id))]})]}),y&&e.jsx(e.Fragment,{children:e.jsxs("button",{className:te,onClick:()=>D(!T),children:[e.jsx(k,{name:T?"X":"Calculator",size:16}),T?"Свернуть":"Рассчитать помещение"]})})]}),y?e.jsxs(e.Fragment,{children:[T&&e.jsx("div",{className:"mb-5 rounded-lg border border-[#D4AF37]/30 bg-[#161616] p-4",children:e.jsx(fe,{objectId:y.id,materials:c,rooms:p,existing:E(y.id),onAdd:F,onCancel:()=>D(!1)})}),e.jsxs("div",{className:"mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#161616] px-4 py-3 text-sm",children:[e.jsxs("div",{className:"text-white/60",children:[y.object_code," — ",y.client_name,e.jsxs("span",{className:"ml-2 text-white/30",children:[E(y.id).length," позиций"]})]}),e.jsxs("div",{className:"text-[#D4AF37]",children:["Итого: ",W(Q(y.id))]})]}),E(y.id).length===0?e.jsx("div",{className:"py-14 text-center text-sm text-white/30",children:"Для этого объекта расчётов ещё нет — нажмите «Рассчитать помещение»"}):e.jsx("div",{className:"space-y-4",children:O(y.id).map(t=>e.jsxs("div",{className:"rounded-lg border border-white/10 bg-[#161616]",children:[e.jsxs("div",{className:"flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3",children:[e.jsxs("div",{className:"flex items-center gap-2 text-sm",children:[e.jsx(k,{name:"DoorOpen",size:15,className:"text-[#D4AF37]"}),t.title]}),e.jsx("div",{className:"text-sm text-[#D4AF37]",children:W(t.sum)})]}),e.jsx("div",{className:"overflow-x-auto p-4",children:e.jsxs("table",{className:"w-full text-sm",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"border-b border-white/10 text-xs uppercase text-white/40",children:[e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Материал"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Вид работ"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Кол-во"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Цена"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Сумма"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Магазин"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Действия"})]})}),e.jsx("tbody",{children:t.items.map(n=>e.jsxs("tr",{className:"border-b border-white/5 last:border-0",children:[e.jsxs("td",{className:"py-2.5 pr-4",children:[n.name,n.note&&e.jsx("div",{className:"text-xs text-white/30",children:n.note})]}),e.jsx("td",{className:"py-2.5 pr-4 text-white/60",children:n.work_type||"—"}),e.jsxs("td",{className:"whitespace-nowrap py-2.5 pr-4",children:[v(n.qty)," ",n.unit]}),e.jsx("td",{className:"py-2.5 pr-4 text-white/60",children:W(v(n.price))}),e.jsx("td",{className:"whitespace-nowrap py-2.5 pr-4 text-[#D4AF37]",children:W(v(n.qty)*v(n.price))}),e.jsx("td",{className:"py-2.5 pr-4 text-white/60",children:n.shop_name||"—"}),e.jsx("td",{className:"py-2.5 pr-4",children:e.jsxs("div",{className:"flex items-center gap-2.5",children:[e.jsx("button",{className:"text-white/50 transition-colors hover:text-[#D4AF37]",title:"Просмотр",onClick:()=>je(y,[n],c,d),children:e.jsx(k,{name:"Eye",size:16})}),e.jsx("button",{className:"text-white/50 transition-colors hover:text-[#D4AF37]",title:"Редактировать",onClick:()=>Z(n),children:e.jsx(k,{name:"Pencil",size:16})}),e.jsx("button",{className:"text-white/50 transition-colors hover:text-[#D4AF37]",title:"Скачать PDF",onClick:()=>we(y,[n],c,d),children:e.jsx(k,{name:"FileDown",size:16})}),e.jsx("button",{className:"text-white/40 transition-colors hover:text-red-400",title:"Убрать с объекта",onClick:()=>X(()=>K.removeFromObject(n.id)),children:e.jsx(k,{name:"Trash2",size:16})})]})})]},n.id))})]})})]},t.key))})]}):e.jsx("div",{className:"py-16 text-center text-sm text-white/30",children:"Выберите объект, чтобы увидеть его расчёты и материалы"})]})})}),e.jsx(ne,{value:"catalog",children:e.jsxs("div",{className:"rounded-xl border border-white/10 bg-[#1f1f1f] p-5",children:[e.jsxs("div",{className:"mb-4 flex flex-wrap items-center gap-3",children:[e.jsxs("div",{className:"relative min-w-[220px] flex-1",children:[e.jsx(k,{name:"Search",size:16,className:"absolute left-3 top-1/2 -translate-y-1/2 text-white/30"}),e.jsx("input",{className:`${H} pl-9`,placeholder:"Поиск: материал, категория, магазин, адрес",value:M,onChange:t=>V(t.target.value)})]}),e.jsxs("select",{className:`${H} max-w-[200px]`,value:I,onChange:t=>q(t.target.value),children:[e.jsx("option",{value:"",children:"Все магазины"}),R.map(t=>e.jsx("option",{value:t,children:t},t))]}),e.jsxs(se,{to:"/cabinet/materials/new",className:te,children:[e.jsx(k,{name:"Plus",size:16}),"Добавить материал"]})]}),z.length===0?e.jsx("div",{className:"py-16 text-center text-sm text-white/30",children:c.length===0?"Справочник пуст — добавьте первый материал":"Ничего не найдено по заданным условиям"}):e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"w-full text-sm",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"border-b border-white/10 text-xs uppercase text-white/40",children:[e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Материал"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Категория"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Ед. изм."}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Цена"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Расход"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Магазин"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Адрес"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Контакты"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Действия"})]})}),e.jsx("tbody",{children:z.map(t=>e.jsxs("tr",{className:"border-b border-white/5 last:border-0",children:[e.jsxs("td",{className:"py-3 pr-4",children:[t.name,t.note&&e.jsx("div",{className:"text-xs text-white/30",children:t.note})]}),e.jsx("td",{className:"py-3 pr-4 text-white/60",children:t.category||"—"}),e.jsx("td",{className:"py-3 pr-4 text-white/60",children:t.unit}),e.jsx("td",{className:"whitespace-nowrap py-3 pr-4 text-[#D4AF37]",children:W(v(t.price))}),e.jsx("td",{className:"whitespace-nowrap py-3 pr-4 text-white/60",children:v(t.consumption)>0?e.jsxs(e.Fragment,{children:["1 ",t.unit," = ",v(t.consumption)," ",t.consumption_unit,v(t.price)>0&&e.jsxs("div",{className:"text-xs text-white/30",children:[(v(t.price)/v(t.consumption)).toFixed(2)," ₽ за"," ",t.consumption_unit]})]}):"—"}),e.jsx("td",{className:"py-3 pr-4",children:t.shop_url?e.jsx("a",{href:t.shop_url,target:"_blank",rel:"noreferrer",className:"hover:text-[#D4AF37]",children:t.shop_name||"—"}):t.shop_name||"—"}),e.jsx("td",{className:"py-3 pr-4 text-white/60",children:t.shop_address||"—"}),e.jsx("td",{className:"py-3 pr-4 text-white/60",children:t.shop_phone?e.jsx("a",{href:`tel:${t.shop_phone}`,className:"hover:text-[#D4AF37]",children:t.shop_phone}):"—"}),e.jsx("td",{className:"py-3 pr-4",children:e.jsx("button",{className:"text-white/40 transition-colors hover:text-red-400",title:"Удалить",onClick:()=>X(()=>K.remove(t.id)),children:e.jsx(k,{name:"Trash2",size:16})})})]},t.id))})]})})]})})]}),C&&e.jsx("div",{className:"fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4",onClick:()=>$(null),children:e.jsxs("div",{className:"w-full max-w-md rounded-xl border border-white/10 bg-[#1f1f1f] p-6",onClick:t=>t.stopPropagation(),children:[e.jsx("div",{className:"mb-1 text-base",children:C.name}),e.jsxs("div",{className:"mb-5 text-xs text-white/40",children:[C.room_name||"Без помещения",C.work_type?` · ${C.work_type}`:""]}),e.jsxs("div",{className:"grid gap-4",children:[e.jsxs("div",{children:[e.jsxs("label",{className:"mb-1.5 block text-xs text-white/50",children:["Количество, ",C.unit]}),e.jsx("input",{className:H,type:"number",min:"0",step:"0.01",value:_.qty,onChange:t=>a({..._,qty:t.target.value})})]}),e.jsxs("div",{children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Цена за единицу, ₽"}),e.jsx("input",{className:H,type:"number",min:"0",step:"0.01",value:_.price,onChange:t=>a({..._,price:t.target.value})})]}),e.jsxs("div",{children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Примечание"}),e.jsx("input",{className:H,value:_.note,onChange:t=>a({..._,note:t.target.value})})]}),e.jsxs("div",{className:"rounded-lg border border-[#D4AF37]/30 bg-[#161616] px-4 py-2.5 text-sm",children:["Сумма:"," ",e.jsx("span",{className:"text-[#D4AF37]",children:W(Number(_.qty||0)*Number(_.price||0))})]})]}),e.jsxs("div",{className:"mt-6 flex items-center gap-3",children:[e.jsxs("button",{className:te,onClick:G,children:[e.jsx(k,{name:"Check",size:16}),"Сохранить"]}),e.jsx("button",{className:"rounded-lg border border-white/10 px-4 py-2.5 text-sm text-white/60 transition-colors hover:text-white",onClick:()=>$(null),children:"Отмена"})]})]})})]})}export{Ce as default};
