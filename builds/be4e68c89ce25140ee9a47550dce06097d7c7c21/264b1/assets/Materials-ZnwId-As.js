const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/html2pdf-n5QMcedK.js","assets/index-DCx1tDIr.js","assets/index-erbgwsuG.css"])))=>i.map(i=>d[i]);
import{r as c,j as e,L as ae,I as N,_ as de,b as ce,Y as V}from"./index-DCx1tDIr.js";import{C as xe}from"./CrmLayout-CGx7B3um.js";import{T as me,a as pe,b as ne,c as re}from"./tabs-Bla2cjx0.js";import"./index-B_YHLBoo.js";import"./index-BNjOFjcW.js";const ee=n=>new Intl.NumberFormat("ru-RU",{maximumFractionDigits:2}).format(n||0)+" ₽",u=n=>Number(n||0),B="w-full bg-[#1f1f1f] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50",he="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm px-4 py-2.5 rounded-lg disabled:opacity-40",ue=["Демонтажные работы","Подготовительные работы","Черновые работы","Чистовые работы","Плиточные работы","Устройство полов","Потолочные работы","Гипсокартонные работы","Малярные работы","Электромонтажные работы","Сантехнические работы","Столярные работы"],fe=[{value:"area",label:"Пол / потолок (площадь)"},{value:"wall_area",label:"Стены (площадь)"},{value:"perimeter",label:"Периметр"}];function be({objectId:n,materials:r,rooms:l,existing:p,onAdd:o,onCancel:j}){const d=c.useMemo(()=>l.filter(s=>s.object_id===n),[l,n]),[m,f]=c.useState(""),[h,b]=c.useState(""),[v,D]=c.useState("area"),[w,q]=c.useState(""),[X,I]=c.useState("1"),[M,L]=c.useState("10"),[P,T]=c.useState(!1),[S,C]=c.useState("merge"),[$,A]=c.useState("Черновые работы"),a=r.find(s=>String(s.id)===m),x=d.find(s=>String(s.id)===h),R=c.useMemo(()=>u(h==="manual"||!x?w:x[v]),[x,h,v,w])*Math.max(u(X)||1,1),z=u(a==null?void 0:a.consumption),E=z>0?R/z:0,G=E*(1+u(M)/100),g=Math.ceil(G*100)/100,O=Math.ceil(G),Z=O*u(a==null?void 0:a.price),K=!!a&&z>0&&R>0,F=c.useMemo(()=>!a||!x?null:p.find(s=>s.material_id===a.id&&s.room_id===x.id&&(s.work_type||"")===$)||null,[p,a,x,$]),t=c.useMemo(()=>x?p.filter(s=>s.room_id===x.id):[],[p,x]),i=x?`${x.name}: ${R.toFixed(2)} ${(a==null?void 0:a.consumption_unit)||""}, запас ${u(M)}%`:`Расчёт: ${R.toFixed(2)} ${(a==null?void 0:a.consumption_unit)||""}, запас ${u(M)}%`,k=async()=>{if(a){T(!0);try{await o({material_id:a.id,qty:O,note:i,room_id:x?x.id:null,room_name:x?x.name:"",work_type:$,merge:S==="merge"}),f("")}finally{T(!1)}}};return r.length===0?e.jsxs("div",{className:"text-sm text-white/40",children:["Справочник пуст —"," ",e.jsx(ae,{to:"/cabinet/materials/new",className:"text-[#D4AF37] hover:underline",children:"добавьте материал"})]}):e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"grid gap-3 md:grid-cols-2",children:[e.jsxs("div",{children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Материал"}),e.jsxs("select",{className:B,value:m,onChange:s=>f(s.target.value),children:[e.jsx("option",{value:"",children:"Выберите материал из справочника"}),r.map(s=>e.jsxs("option",{value:s.id,children:[s.name," — ",ee(u(s.price)),"/",s.unit,u(s.consumption)>0?` · 1 ${s.unit} = ${u(s.consumption)} ${s.consumption_unit}`:""]},s.id))]}),a&&z<=0&&e.jsx("div",{className:"mt-1.5 text-xs text-amber-400",children:"У этого материала не указан расход — расчёт невозможен"})]}),e.jsxs("div",{children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Помещение"}),e.jsxs("select",{className:B,value:h,onChange:s=>b(s.target.value),children:[e.jsx("option",{value:"",children:"Выберите помещение"}),d.map(s=>e.jsxs("option",{value:s.id,children:[s.name," — пол ",u(s.area)," м², стены ",u(s.wall_area)," м²"]},s.id)),e.jsx("option",{value:"manual",children:"Ввести площадь вручную"})]}),d.length===0&&e.jsx("div",{className:"mt-1.5 text-xs text-white/40",children:"У объекта нет помещений — введите площадь вручную"})]}),e.jsxs("div",{className:"md:col-span-2",children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Вид работ"}),e.jsx("select",{className:B,value:$,onChange:s=>A(s.target.value),children:ue.map(s=>e.jsx("option",{value:s,children:s},s))})]})]}),e.jsxs("div",{className:"grid gap-3 md:grid-cols-4",children:[h==="manual"||!x?e.jsxs("div",{children:[e.jsxs("label",{className:"mb-1.5 block text-xs text-white/50",children:["Площадь / длина, ",(a==null?void 0:a.consumption_unit)||"м²"]}),e.jsx("input",{className:B,type:"number",min:"0",step:"0.01",placeholder:"0",value:w,onChange:s=>q(s.target.value)})]}):e.jsxs("div",{children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Что обрабатываем"}),e.jsx("select",{className:B,value:v,onChange:s=>D(s.target.value),children:fe.map(s=>e.jsx("option",{value:s.value,children:s.label},s.value))})]}),e.jsxs("div",{children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Слоёв"}),e.jsx("input",{className:B,type:"number",min:"1",step:"1",value:X,onChange:s=>I(s.target.value)})]}),e.jsxs("div",{children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Запас, %"}),e.jsx("input",{className:B,type:"number",min:"0",step:"1",value:M,onChange:s=>L(s.target.value)})]}),e.jsx("div",{className:"flex items-end",children:e.jsxs("button",{className:he,onClick:k,disabled:!K||P,children:[e.jsx(N,{name:P?"Loader2":"Plus",size:16,className:P?"animate-spin":""}),F&&S==="merge"?"Добавить к расчёту":"Сохранить в объект"]})})]}),t.length>0&&x&&e.jsxs("div",{className:"rounded-lg border border-white/10 bg-[#1f1f1f] p-4",children:[e.jsxs("div",{className:"mb-2 text-xs uppercase text-white/40",children:["Уже рассчитано по помещению «",x.name,"»"]}),e.jsx("div",{className:"space-y-1.5 text-sm text-white/60",children:t.map(s=>e.jsxs("div",{className:"flex flex-wrap justify-between gap-2",children:[e.jsxs("span",{children:[s.name,s.work_type&&e.jsx("span",{className:"ml-2 text-xs text-white/30",children:s.work_type})]}),e.jsxs("span",{children:[u(s.qty)," ",s.unit," · ",ee(u(s.qty)*u(s.price))]})]},s.id))})]}),F&&e.jsxs("div",{className:"rounded-lg border border-amber-500/30 bg-amber-500/5 p-4",children:[e.jsxs("div",{className:"mb-3 flex items-start gap-2 text-sm text-amber-200",children:[e.jsx(N,{name:"TriangleAlert",size:15,className:"mt-0.5 shrink-0"}),e.jsxs("span",{children:["По помещению «",x==null?void 0:x.name,"» в разделе «",$,"» уже есть расчёт «",F.name,"» —"," ",u(F.qty)," ",F.unit,". Что сделать с новым расчётом?"]})]}),e.jsxs("div",{className:"flex flex-wrap gap-4 text-sm",children:[e.jsxs("label",{className:"flex cursor-pointer items-center gap-2",children:[e.jsx("input",{type:"radio",className:"accent-[#D4AF37]",checked:S==="merge",onChange:()=>C("merge")}),"Добавить к существующему (",u(F.qty)," + ",O," = ",u(F.qty)+O," ",F.unit,")"]}),e.jsxs("label",{className:"flex cursor-pointer items-center gap-2",children:[e.jsx("input",{type:"radio",className:"accent-[#D4AF37]",checked:S==="new",onChange:()=>C("new")}),"Добавить отдельной строкой"]})]})]}),K&&e.jsxs("div",{className:"rounded-lg border border-[#D4AF37]/30 bg-[#1f1f1f] p-4",children:[e.jsxs("div",{className:"mb-3 flex items-center gap-2 text-xs uppercase text-white/40",children:[e.jsx(N,{name:"Calculator",size:14,className:"text-[#D4AF37]"}),"Результат расчёта"]}),e.jsxs("div",{className:"grid gap-4 text-sm sm:grid-cols-4",children:[e.jsxs("div",{children:[e.jsx("div",{className:"text-xs text-white/40",children:"Площадь с учётом слоёв"}),e.jsxs("div",{children:[R.toFixed(2)," ",a==null?void 0:a.consumption_unit]})]}),e.jsxs("div",{children:[e.jsx("div",{className:"text-xs text-white/40",children:"Чистый расход"}),e.jsxs("div",{children:[E.toFixed(2)," ",a==null?void 0:a.unit]})]}),e.jsxs("div",{children:[e.jsxs("div",{className:"text-xs text-white/40",children:["С запасом ",u(M),"%"]}),e.jsxs("div",{children:[g.toFixed(2)," ",a==null?void 0:a.unit]})]}),e.jsxs("div",{children:[e.jsx("div",{className:"text-xs text-white/40",children:"К покупке"}),e.jsxs("div",{className:"text-[#D4AF37]",children:[O," ",a==null?void 0:a.unit," · ",ee(Z)]})]})]}),e.jsxs("div",{className:"mt-3 border-t border-white/10 pt-3 text-xs text-white/40",children:["1 ",a==null?void 0:a.unit," покрывает ",z," ",a==null?void 0:a.consumption_unit,a!=null&&a.shop_name?` · магазин: ${a.shop_name}`:""]})]}),e.jsx("button",{className:"text-sm text-white/40 transition-colors hover:text-white",onClick:j,children:"Свернуть калькулятор"})]})}const Y=(n,r=0)=>{const l=typeof n=="string"?parseFloat(n):Number(n);return Number.isFinite(l)?l:r},J=n=>new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0}).format(Y(n))+" ₽",ge=n=>new Date(n).toLocaleString("ru-RU",{day:"numeric",month:"numeric",year:"numeric",hour:"2-digit",minute:"2-digit"});function _(n){const r=document.createElement("div");return r.textContent=n??"",r.innerHTML}function je(n,r){const l=new Map;return n.forEach(p=>{const o=r.find(m=>m.id===p.material_id),j=p.shop_name||(o==null?void 0:o.shop_name)||"Магазин не указан";l.has(j)||l.set(j,{name:j,address:"",phone:"",items:[],sum:0});const d=l.get(j);!d.address&&(o!=null&&o.shop_address)&&(d.address=o.shop_address),!d.phone&&(o!=null&&o.shop_phone)&&(d.phone=o.shop_phone),d.items.push(p),d.sum+=Y(p.qty)*Y(p.price)}),Array.from(l.values()).sort((p,o)=>o.sum-p.sum)}function oe(n,r,l,p){const o=je(r,l),j=o.reduce((b,v)=>b+v.sum,0),d=o.map(b=>{const v=b.items.map((w,q)=>`
            <tr>
              <td class="num">${q+1}</td>
              <td>${_(w.name)}</td>
              <td>${_(w.room_name||"—")}</td>
              <td>${_(w.work_type||"—")}</td>
              <td class="center">${Y(w.qty)}</td>
              <td class="center">${_(w.unit)}</td>
              <td class="right">${J(w.price)}</td>
              <td class="right amount">${J(Y(w.qty)*Y(w.price))}</td>
            </tr>`).join(""),D=[b.address?`Адрес: ${_(b.address)}`:"",b.phone?`Тел: ${_(b.phone)}`:""].filter(Boolean).join(" · ");return`
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
              <tr class="cat-row"><td colspan="8">${_(b.name)}${D?` — ${D}`:""}</td></tr>
              ${v}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="7" class="right">Итого по магазину</td>
                <td class="right amount">${J(b.sum)}</td>
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
`,f=`
  <div class="header">
    <div class="brand"><div class="brand-logo" style="background-image:url('${window.location.origin}/favicon.png')"></div>Fix<span>Key</span></div>
    <div class="doc-title">
      <h1>Список материалов</h1>
      <p>Объект № ${_(n.object_code)}</p>
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
      <div class="value">${_(n.object_code)}</div>
    </div>
    <div>
      <div class="label">Заказчик</div>
      <div class="value">${_(n.client_name)}</div>
    </div>
    <div>
      <div class="label">Адрес объекта</div>
      <div class="value">${_(n.address||"—")}</div>
    </div>
    <div>
      <div class="label">Позиций в ведомости</div>
      <div class="value">${r.length}</div>
    </div>
  </div>

  ${d}

  <div class="summary">
    <div class="summary-box">
      <div class="summary-row">
        <span>Магазинов:</span>
        <span>${o.length}</span>
      </div>
      <div class="summary-total">
        <span>ИТОГО:</span>
        <span>${J(j)}</span>
      </div>
    </div>
  </div>

  <hr class="thin" />

  <div class="parties">
    <div>
      <div class="label">Исполнитель</div>
      <div class="name">${_(p)}</div>
    </div>
    <div>
      <div class="label">Заказчик</div>
      <div class="name">${_(n.client_name)}</div>
    </div>
  </div>

  <div class="footer">
    Сформировано ${ge(new Date().toISOString())}
  </div>`,h=`Материалы № ${n.object_code} — ${_(n.client_name)}`;return{styles:m,bodyContent:f,title:h}}function te(n,r,l,p,o=!1){const{styles:j,bodyContent:d,title:m}=oe(n,r,l,p),f=`<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8" />
<title>${m}</title>
<style>${j}</style>
</head>
<body>
<div class="est-root">${d}</div>
</body>
</html>`,h=window.open("","_blank","width=900,height=1000");h&&(h.document.open(),h.document.write(f),h.document.close(),o&&(h.onload=()=>{h.focus(),h.print()}))}function ve(n,r){return n.replace(/@page[^{]*\{[^}]*\}/g,"").replace(/@media\s+print\s*\{(?:[^{}]*\{[^}]*\})*[^{}]*\}/g,"").replace(/(^|\})\s*([^{}@]+)\s*\{/g,(p,o,j)=>{const d=j.split(",").map(m=>{const f=m.trim();return f?f==="*"?`${r}, ${r} *`:/^(html|body)$/i.test(f)||f===".est-root"?r:f.startsWith(".est-root ")?`${r} ${f.slice(10)}`:`${r} ${f}`:""}).filter(Boolean).join(", ");return`${o} ${d} {`})}async function we(n,r,l,p){const{styles:o,bodyContent:j}=oe(n,r,l,p),d=document.createElement("div");d.style.position="fixed",d.style.left="-10000px",d.style.top="0",d.style.width="760px",d.style.background="#ffffff";const m=document.createElement("div");m.id="pdf-scope-materials",m.className="est-root",m.style.width="760px",m.style.maxWidth="760px",m.style.padding="0",m.style.margin="0",m.style.background="#ffffff";const f=document.createElement("style");f.textContent=ve(o,"#pdf-scope-materials"),m.appendChild(f);const h=document.createElement("div");h.innerHTML=j,m.appendChild(h),d.appendChild(m),document.body.appendChild(d),await new Promise(b=>{const v=new Image;v.onload=()=>b(),v.onerror=()=>b(),v.src=`${window.location.origin}/favicon.png`,setTimeout(b,3e3)});try{const b=(await de(async()=>{const{default:v}=await import("./html2pdf-n5QMcedK.js").then(D=>D.h);return{default:v}},__vite__mapDeps([0,1,2]))).default;await b().set({margin:[12,12,12,12],filename:`Материалы ${n.object_code}.pdf`,image:{type:"jpeg",quality:.98},html2canvas:{scale:2,useCORS:!0,backgroundColor:"#ffffff",width:760,windowWidth:760,scrollX:0,scrollY:0},jsPDF:{unit:"mm",format:"a4",orientation:"portrait"},pagebreak:{mode:["css","legacy"],avoid:[".cat-block",".room-block"]}}).from(m).save()}finally{d.parentNode&&document.body.removeChild(d)}}const W=n=>new Intl.NumberFormat("ru-RU",{maximumFractionDigits:2}).format(n||0)+" ₽",y=n=>Number(n||0),H="w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50",se="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm px-4 py-2.5 rounded-lg disabled:opacity-40";function Ce(){const{user:n}=ce(),r=(n==null?void 0:n.company_name)||"",[l,p]=c.useState([]),[o,j]=c.useState([]),[d,m]=c.useState([]),[f,h]=c.useState([]),[b,v]=c.useState(!0),[D,w]=c.useState(""),[q,X]=c.useState(""),[I,M]=c.useState(""),[L,P]=c.useState(null),[T,S]=c.useState(!1),[C,$]=c.useState(null),[A,a]=c.useState({qty:"",price:"",note:""}),x=()=>{v(!0),V.list().then(t=>{p(t.materials||[]);const i=t.objects||[];j(i),P(k=>{var s;return k&&i.some(U=>U.id===k)?k:((s=i[0])==null?void 0:s.id)??null}),m(t.object_materials||[]),h(t.rooms||[])}).catch(t=>w((t==null?void 0:t.message)||"Не удалось загрузить данные")).finally(()=>v(!1))};c.useEffect(x,[]);const Q=async t=>{w("");try{await t(),x()}catch(i){w((i==null?void 0:i.message)||"Операция не выполнена")}},R=c.useMemo(()=>Array.from(new Set(l.map(t=>t.shop_name).filter(Boolean))).sort(),[l]),z=c.useMemo(()=>{const t=q.trim().toLowerCase();return l.filter(i=>(!I||i.shop_name===I)&&(!t||[i.name,i.category,i.shop_name,i.shop_address].filter(Boolean).some(k=>String(k).toLowerCase().includes(t))))},[l,q,I]),E=t=>d.filter(i=>i.object_id===t),G=t=>E(t).reduce((i,k)=>i+y(k.qty)*y(k.price),0),g=o.find(t=>t.id===L)||null,O=t=>{const i=E(t),k=new Map;return i.forEach(s=>{const U=s.room_id?`room-${s.room_id}`:"other",le=s.room_name||(s.room_id?"Помещение":"Без помещения");k.has(U)||k.set(U,{key:U,title:le,items:[],sum:0});const ie=k.get(U);ie.items.push(s),ie.sum+=y(s.qty)*y(s.price)}),Array.from(k.values())},Z=t=>{$(t),a({qty:String(y(t.qty)),price:String(y(t.price)),note:t.note||""})},K=(t=!1)=>Q(async()=>{if(!C||!g)return;const i={...C,qty:Number(A.qty||0),price:Number(A.price||0),note:A.note};await V.updateObjectMaterial(C.id,{qty:i.qty,price:i.price,note:i.note}),$(null),t&&te(g,[i],l,r,!0)}),F=async t=>{L&&(await V.addToObject({object_id:L,...t}),x())};return e.jsxs(xe,{title:"Материалы",subtitle:"Справочник материалов и закупки по объектам",children:[D&&e.jsx("div",{className:"mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300",children:D}),b?e.jsx("div",{className:"flex justify-center py-16",children:e.jsx(N,{name:"Loader2",size:24,className:"animate-spin text-white/40"})}):e.jsxs(me,{defaultValue:"objects",children:[e.jsxs(pe,{className:"mb-6 h-auto flex-wrap border border-white/10 bg-[#1f1f1f]",children:[e.jsx(ne,{value:"objects",children:"Объекты"}),e.jsx(ne,{value:"catalog",children:"Справочник"})]}),e.jsx(re,{value:"objects",children:e.jsx("div",{className:"rounded-xl border border-white/10 bg-[#1f1f1f] p-5",children:o.length===0?e.jsxs("div",{className:"py-16 text-center text-sm text-white/30",children:["Объектов пока нет —"," ",e.jsx(ae,{to:"/cabinet/objects",className:"text-[#D4AF37] hover:underline",children:"создать объект"})]}):e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"mb-5 flex flex-wrap items-end gap-3",children:[e.jsxs("div",{className:"min-w-[280px] flex-1",children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Объект"}),e.jsxs("select",{className:H,value:L??"",onChange:t=>{P(t.target.value?Number(t.target.value):null),S(!1)},children:[e.jsx("option",{value:"",children:"Выберите объект"}),o.map(t=>e.jsxs("option",{value:t.id,children:[t.object_code," — ",t.client_name,t.address?` · ${t.address}`:""]},t.id))]})]}),g&&e.jsx(e.Fragment,{children:e.jsxs("button",{className:se,onClick:()=>S(!T),children:[e.jsx(N,{name:T?"X":"Calculator",size:16}),T?"Свернуть":"Рассчитать помещение"]})})]}),g?e.jsxs(e.Fragment,{children:[T&&e.jsx("div",{className:"mb-5 rounded-lg border border-[#D4AF37]/30 bg-[#161616] p-4",children:e.jsx(be,{objectId:g.id,materials:l,rooms:f,existing:E(g.id),onAdd:F,onCancel:()=>S(!1)})}),e.jsxs("div",{className:"mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#161616] px-4 py-3 text-sm",children:[e.jsxs("div",{className:"text-white/60",children:[g.object_code," — ",g.client_name,e.jsxs("span",{className:"ml-2 text-white/30",children:[E(g.id).length," позиций"]})]}),e.jsxs("div",{className:"text-[#D4AF37]",children:["Итого: ",W(G(g.id))]})]}),E(g.id).length===0?e.jsx("div",{className:"py-14 text-center text-sm text-white/30",children:"Для этого объекта расчётов ещё нет — нажмите «Рассчитать помещение»"}):e.jsx("div",{className:"space-y-4",children:O(g.id).map(t=>e.jsxs("div",{className:"rounded-lg border border-white/10 bg-[#161616]",children:[e.jsxs("div",{className:"flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3",children:[e.jsxs("div",{className:"flex items-center gap-2 text-sm",children:[e.jsx(N,{name:"DoorOpen",size:15,className:"text-[#D4AF37]"}),t.title]}),e.jsx("div",{className:"text-sm text-[#D4AF37]",children:W(t.sum)})]}),e.jsx("div",{className:"overflow-x-auto p-4",children:e.jsxs("table",{className:"w-full text-sm",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"border-b border-white/10 text-xs uppercase text-white/40",children:[e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Материал"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Вид работ"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Кол-во"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Цена"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Сумма"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Магазин"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Действия"})]})}),e.jsx("tbody",{children:t.items.map(i=>e.jsxs("tr",{className:"border-b border-white/5 last:border-0",children:[e.jsxs("td",{className:"py-2.5 pr-4",children:[i.name,i.note&&e.jsx("div",{className:"text-xs text-white/30",children:i.note})]}),e.jsx("td",{className:"py-2.5 pr-4 text-white/60",children:i.work_type||"—"}),e.jsxs("td",{className:"whitespace-nowrap py-2.5 pr-4",children:[y(i.qty)," ",i.unit]}),e.jsx("td",{className:"py-2.5 pr-4 text-white/60",children:W(y(i.price))}),e.jsx("td",{className:"whitespace-nowrap py-2.5 pr-4 text-[#D4AF37]",children:W(y(i.qty)*y(i.price))}),e.jsx("td",{className:"py-2.5 pr-4 text-white/60",children:i.shop_name||"—"}),e.jsx("td",{className:"py-2.5 pr-4",children:e.jsxs("div",{className:"flex items-center gap-2.5",children:[e.jsx("button",{className:"text-white/50 transition-colors hover:text-[#D4AF37]",title:"Просмотр",onClick:()=>te(g,[i],l,r),children:e.jsx(N,{name:"Eye",size:16})}),e.jsx("button",{className:"text-white/50 transition-colors hover:text-[#D4AF37]",title:"Редактировать",onClick:()=>Z(i),children:e.jsx(N,{name:"Pencil",size:16})}),e.jsx("button",{className:"text-white/50 transition-colors hover:text-[#D4AF37]",title:"Печать",onClick:()=>te(g,[i],l,r,!0),children:e.jsx(N,{name:"Printer",size:16})}),e.jsx("button",{className:"text-white/50 transition-colors hover:text-[#D4AF37]",title:"Скачать PDF",onClick:()=>we(g,[i],l,r),children:e.jsx(N,{name:"FileDown",size:16})}),e.jsx("button",{className:"text-white/40 transition-colors hover:text-red-400",title:"Убрать с объекта",onClick:()=>Q(()=>V.removeFromObject(i.id)),children:e.jsx(N,{name:"Trash2",size:16})})]})})]},i.id))})]})})]},t.key))})]}):e.jsx("div",{className:"py-16 text-center text-sm text-white/30",children:"Выберите объект, чтобы увидеть его расчёты и материалы"})]})})}),e.jsx(re,{value:"catalog",children:e.jsxs("div",{className:"rounded-xl border border-white/10 bg-[#1f1f1f] p-5",children:[e.jsxs("div",{className:"mb-4 flex flex-wrap items-center gap-3",children:[e.jsxs("div",{className:"relative min-w-[220px] flex-1",children:[e.jsx(N,{name:"Search",size:16,className:"absolute left-3 top-1/2 -translate-y-1/2 text-white/30"}),e.jsx("input",{className:`${H} pl-9`,placeholder:"Поиск: материал, категория, магазин, адрес",value:q,onChange:t=>X(t.target.value)})]}),e.jsxs("select",{className:`${H} max-w-[200px]`,value:I,onChange:t=>M(t.target.value),children:[e.jsx("option",{value:"",children:"Все магазины"}),R.map(t=>e.jsx("option",{value:t,children:t},t))]}),e.jsxs(ae,{to:"/cabinet/materials/new",className:se,children:[e.jsx(N,{name:"Plus",size:16}),"Добавить материал"]})]}),z.length===0?e.jsx("div",{className:"py-16 text-center text-sm text-white/30",children:l.length===0?"Справочник пуст — добавьте первый материал":"Ничего не найдено по заданным условиям"}):e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"w-full text-sm",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"border-b border-white/10 text-xs uppercase text-white/40",children:[e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Материал"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Категория"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Ед. изм."}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Цена"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Расход"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Магазин"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Адрес"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Контакты"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Действия"})]})}),e.jsx("tbody",{children:z.map(t=>e.jsxs("tr",{className:"border-b border-white/5 last:border-0",children:[e.jsxs("td",{className:"py-3 pr-4",children:[t.name,t.note&&e.jsx("div",{className:"text-xs text-white/30",children:t.note})]}),e.jsx("td",{className:"py-3 pr-4 text-white/60",children:t.category||"—"}),e.jsx("td",{className:"py-3 pr-4 text-white/60",children:t.unit}),e.jsx("td",{className:"whitespace-nowrap py-3 pr-4 text-[#D4AF37]",children:W(y(t.price))}),e.jsx("td",{className:"whitespace-nowrap py-3 pr-4 text-white/60",children:y(t.consumption)>0?e.jsxs(e.Fragment,{children:["1 ",t.unit," = ",y(t.consumption)," ",t.consumption_unit,y(t.price)>0&&e.jsxs("div",{className:"text-xs text-white/30",children:[(y(t.price)/y(t.consumption)).toFixed(2)," ₽ за"," ",t.consumption_unit]})]}):"—"}),e.jsx("td",{className:"py-3 pr-4",children:t.shop_url?e.jsx("a",{href:t.shop_url,target:"_blank",rel:"noreferrer",className:"hover:text-[#D4AF37]",children:t.shop_name||"—"}):t.shop_name||"—"}),e.jsx("td",{className:"py-3 pr-4 text-white/60",children:t.shop_address||"—"}),e.jsx("td",{className:"py-3 pr-4 text-white/60",children:t.shop_phone?e.jsx("a",{href:`tel:${t.shop_phone}`,className:"hover:text-[#D4AF37]",children:t.shop_phone}):"—"}),e.jsx("td",{className:"py-3 pr-4",children:e.jsx("button",{className:"text-white/40 transition-colors hover:text-red-400",title:"Удалить",onClick:()=>Q(()=>V.remove(t.id)),children:e.jsx(N,{name:"Trash2",size:16})})})]},t.id))})]})})]})})]}),C&&e.jsx("div",{className:"fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4",onClick:()=>$(null),children:e.jsxs("div",{className:"w-full max-w-md rounded-xl border border-white/10 bg-[#1f1f1f] p-6",onClick:t=>t.stopPropagation(),children:[e.jsx("div",{className:"mb-1 text-base",children:C.name}),e.jsxs("div",{className:"mb-5 text-xs text-white/40",children:[C.room_name||"Без помещения",C.work_type?` · ${C.work_type}`:""]}),e.jsxs("div",{className:"grid gap-4",children:[e.jsxs("div",{children:[e.jsxs("label",{className:"mb-1.5 block text-xs text-white/50",children:["Количество, ",C.unit]}),e.jsx("input",{className:H,type:"number",min:"0",step:"0.01",value:A.qty,onChange:t=>a({...A,qty:t.target.value})})]}),e.jsxs("div",{children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Цена за единицу, ₽"}),e.jsx("input",{className:H,type:"number",min:"0",step:"0.01",value:A.price,onChange:t=>a({...A,price:t.target.value})})]}),e.jsxs("div",{children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Примечание"}),e.jsx("input",{className:H,value:A.note,onChange:t=>a({...A,note:t.target.value})})]}),e.jsxs("div",{className:"rounded-lg border border-[#D4AF37]/30 bg-[#161616] px-4 py-2.5 text-sm",children:["Сумма:"," ",e.jsx("span",{className:"text-[#D4AF37]",children:W(Number(A.qty||0)*Number(A.price||0))})]})]}),e.jsxs("div",{className:"mt-6 flex flex-wrap items-center gap-3",children:[e.jsxs("button",{className:se,onClick:()=>K(!1),children:[e.jsx(N,{name:"Check",size:16}),"Сохранить"]}),e.jsxs("button",{className:"flex items-center gap-2 rounded-lg border border-[#D4AF37]/40 px-4 py-2.5 text-sm text-[#D4AF37] transition-colors hover:bg-[#D4AF37]/10",onClick:()=>K(!0),children:[e.jsx(N,{name:"Printer",size:16}),"Сохранить и печать"]}),e.jsx("button",{className:"rounded-lg border border-white/10 px-4 py-2.5 text-sm text-white/60 transition-colors hover:text-white",onClick:()=>$(null),children:"Отмена"})]})]})})]})}export{Ce as default};
