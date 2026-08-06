const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/html2pdf-COeU3VF1.js","assets/index-DOvz-LxC.js","assets/index-DYkVkAC1.css"])))=>i.map(i=>d[i]);
import{r as m,j as e,L as ie,I as y,_ as ce,b as me,Y as V}from"./index-DOvz-LxC.js";import{C as xe}from"./CrmLayout-CXne8OKH.js";import{T as pe,a as he,b as re,c as oe}from"./tabs-CLtfyHxN.js";import"./index-DYHc4Gdm.js";import"./index-CxTefzcu.js";const te=n=>new Intl.NumberFormat("ru-RU",{maximumFractionDigits:2}).format(n||0)+" ₽",g=n=>Number(n||0),O="w-full bg-[#1f1f1f] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50",ue="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm px-4 py-2.5 rounded-lg disabled:opacity-40",be=["Демонтажные работы","Подготовительные работы","Черновые работы","Чистовые работы","Плиточные работы","Устройство полов","Потолочные работы","Гипсокартонные работы","Малярные работы","Электромонтажные работы","Сантехнические работы","Столярные работы"],fe=[{value:"area",label:"Пол / потолок (площадь)"},{value:"wall_area",label:"Стены (площадь)"},{value:"perimeter",label:"Периметр"}];function ge({objectId:n,materials:l,rooms:o,existing:u,onAdd:c,onCancel:v}){const d=m.useMemo(()=>o.filter(s=>s.object_id===n),[o,n]),[x,b]=m.useState(""),[f,$]=m.useState(""),[_,w]=m.useState("area"),[F,z]=m.useState(""),[k,E]=m.useState("1"),[B,W]=m.useState("10"),[Y,I]=m.useState(!1),[M,q]=m.useState("merge"),[D,r]=m.useState("Черновые работы"),a=l.find(s=>String(s.id)===x),p=d.find(s=>String(s.id)===f),P=m.useMemo(()=>g(f==="manual"||!p?F:p[_]),[p,f,_,F])*Math.max(g(k)||1,1),T=g(a==null?void 0:a.consumption),R=T>0?P/T:0,Q=R*(1+g(B)/100),h=Math.ceil(Q*100)/100,L=Math.ceil(Q),ee=L*g(a==null?void 0:a.price),G=!!a&&T>0&&P>0,S=m.useMemo(()=>!a||!p?null:u.find(s=>s.material_id===a.id&&s.room_id===p.id&&(s.work_type||"")===D)||null,[u,a,p,D]),J=m.useMemo(()=>p?u.filter(s=>s.room_id===p.id):[],[u,p]),t=p?`${p.name}: ${P.toFixed(2)} ${(a==null?void 0:a.consumption_unit)||""}, запас ${g(B)}%`:`Расчёт: ${P.toFixed(2)} ${(a==null?void 0:a.consumption_unit)||""}, запас ${g(B)}%`,i=async()=>{if(a){I(!0);try{await c({material_id:a.id,qty:L,note:t,room_id:p?p.id:null,room_name:p?p.name:"",work_type:D,merge:M==="merge"}),b("")}finally{I(!1)}}};return l.length===0?e.jsxs("div",{className:"text-sm text-white/40",children:["Справочник пуст —"," ",e.jsx(ie,{to:"/cabinet/materials/new",className:"text-[#D4AF37] hover:underline",children:"добавьте материал"})]}):e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"grid gap-3 md:grid-cols-2",children:[e.jsxs("div",{children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Материал"}),e.jsxs("select",{className:O,value:x,onChange:s=>b(s.target.value),children:[e.jsx("option",{value:"",children:"Выберите материал из справочника"}),l.map(s=>e.jsxs("option",{value:s.id,children:[s.name," — ",te(g(s.price)),"/",s.unit,g(s.consumption)>0?` · 1 ${s.unit} = ${g(s.consumption)} ${s.consumption_unit}`:""]},s.id))]}),a&&T<=0&&e.jsx("div",{className:"mt-1.5 text-xs text-amber-400",children:"У этого материала не указан расход — расчёт невозможен"})]}),e.jsxs("div",{children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Помещение"}),e.jsxs("select",{className:O,value:f,onChange:s=>$(s.target.value),children:[e.jsx("option",{value:"",children:"Выберите помещение"}),d.map(s=>e.jsxs("option",{value:s.id,children:[s.name," — пол ",g(s.area)," м², стены ",g(s.wall_area)," м²"]},s.id)),e.jsx("option",{value:"manual",children:"Ввести площадь вручную"})]}),d.length===0&&e.jsx("div",{className:"mt-1.5 text-xs text-white/40",children:"У объекта нет помещений — введите площадь вручную"})]}),e.jsxs("div",{className:"md:col-span-2",children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Вид работ"}),e.jsx("select",{className:O,value:D,onChange:s=>r(s.target.value),children:be.map(s=>e.jsx("option",{value:s,children:s},s))})]})]}),e.jsxs("div",{className:"grid gap-3 md:grid-cols-4",children:[f==="manual"||!p?e.jsxs("div",{children:[e.jsxs("label",{className:"mb-1.5 block text-xs text-white/50",children:["Площадь / длина, ",(a==null?void 0:a.consumption_unit)||"м²"]}),e.jsx("input",{className:O,type:"number",min:"0",step:"0.01",placeholder:"0",value:F,onChange:s=>z(s.target.value)})]}):e.jsxs("div",{children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Что обрабатываем"}),e.jsx("select",{className:O,value:_,onChange:s=>w(s.target.value),children:fe.map(s=>e.jsx("option",{value:s.value,children:s.label},s.value))})]}),e.jsxs("div",{children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Слоёв"}),e.jsx("input",{className:O,type:"number",min:"1",step:"1",value:k,onChange:s=>E(s.target.value)})]}),e.jsxs("div",{children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Запас, %"}),e.jsx("input",{className:O,type:"number",min:"0",step:"1",value:B,onChange:s=>W(s.target.value)})]}),e.jsx("div",{className:"flex items-end",children:e.jsxs("button",{className:ue,onClick:i,disabled:!G||Y,children:[e.jsx(y,{name:Y?"Loader2":"Plus",size:16,className:Y?"animate-spin":""}),S&&M==="merge"?"Добавить к расчёту":"Сохранить в объект"]})})]}),J.length>0&&p&&e.jsxs("div",{className:"rounded-lg border border-white/10 bg-[#1f1f1f] p-4",children:[e.jsxs("div",{className:"mb-2 text-xs uppercase text-white/40",children:["Уже рассчитано по помещению «",p.name,"»"]}),e.jsx("div",{className:"space-y-1.5 text-sm text-white/60",children:J.map(s=>e.jsxs("div",{className:"flex flex-wrap justify-between gap-2",children:[e.jsxs("span",{children:[s.name,s.work_type&&e.jsx("span",{className:"ml-2 text-xs text-white/30",children:s.work_type})]}),e.jsxs("span",{children:[g(s.qty)," ",s.unit," · ",te(g(s.qty)*g(s.price))]})]},s.id))})]}),S&&e.jsxs("div",{className:"rounded-lg border border-amber-500/30 bg-amber-500/5 p-4",children:[e.jsxs("div",{className:"mb-3 flex items-start gap-2 text-sm text-amber-200",children:[e.jsx(y,{name:"TriangleAlert",size:15,className:"mt-0.5 shrink-0"}),e.jsxs("span",{children:["По помещению «",p==null?void 0:p.name,"» в разделе «",D,"» уже есть расчёт «",S.name,"» —"," ",g(S.qty)," ",S.unit,". Что сделать с новым расчётом?"]})]}),e.jsxs("div",{className:"flex flex-wrap gap-4 text-sm",children:[e.jsxs("label",{className:"flex cursor-pointer items-center gap-2",children:[e.jsx("input",{type:"radio",className:"accent-[#D4AF37]",checked:M==="merge",onChange:()=>q("merge")}),"Добавить к существующему (",g(S.qty)," + ",L," = ",g(S.qty)+L," ",S.unit,")"]}),e.jsxs("label",{className:"flex cursor-pointer items-center gap-2",children:[e.jsx("input",{type:"radio",className:"accent-[#D4AF37]",checked:M==="new",onChange:()=>q("new")}),"Добавить отдельной строкой"]})]})]}),G&&e.jsxs("div",{className:"rounded-lg border border-[#D4AF37]/30 bg-[#1f1f1f] p-4",children:[e.jsxs("div",{className:"mb-3 flex items-center gap-2 text-xs uppercase text-white/40",children:[e.jsx(y,{name:"Calculator",size:14,className:"text-[#D4AF37]"}),"Результат расчёта"]}),e.jsxs("div",{className:"grid gap-4 text-sm sm:grid-cols-4",children:[e.jsxs("div",{children:[e.jsx("div",{className:"text-xs text-white/40",children:"Площадь с учётом слоёв"}),e.jsxs("div",{children:[P.toFixed(2)," ",a==null?void 0:a.consumption_unit]})]}),e.jsxs("div",{children:[e.jsx("div",{className:"text-xs text-white/40",children:"Чистый расход"}),e.jsxs("div",{children:[R.toFixed(2)," ",a==null?void 0:a.unit]})]}),e.jsxs("div",{children:[e.jsxs("div",{className:"text-xs text-white/40",children:["С запасом ",g(B),"%"]}),e.jsxs("div",{children:[h.toFixed(2)," ",a==null?void 0:a.unit]})]}),e.jsxs("div",{children:[e.jsx("div",{className:"text-xs text-white/40",children:"К покупке"}),e.jsxs("div",{className:"text-[#D4AF37]",children:[L," ",a==null?void 0:a.unit," · ",te(ee)]})]})]}),e.jsxs("div",{className:"mt-3 border-t border-white/10 pt-3 text-xs text-white/40",children:["1 ",a==null?void 0:a.unit," покрывает ",T," ",a==null?void 0:a.consumption_unit,a!=null&&a.shop_name?` · магазин: ${a.shop_name}`:""]})]}),e.jsx("button",{className:"text-sm text-white/40 transition-colors hover:text-white",onClick:v,children:"Свернуть калькулятор"})]})}const K=(n,l=0)=>{const o=typeof n=="string"?parseFloat(n):Number(n);return Number.isFinite(o)?o:l},Z=n=>new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0}).format(K(n))+" ₽",je=n=>new Date(n).toLocaleString("ru-RU",{day:"numeric",month:"numeric",year:"numeric",hour:"2-digit",minute:"2-digit"});function N(n){const l=document.createElement("div");return l.textContent=n??"",l.innerHTML}function ve(n,l){const o=new Map;return n.forEach(u=>{const c=l.find(x=>x.id===u.material_id),v=u.shop_name||(c==null?void 0:c.shop_name)||"Магазин не указан";o.has(v)||o.set(v,{name:v,address:"",phone:"",items:[],sum:0});const d=o.get(v);!d.address&&(c!=null&&c.shop_address)&&(d.address=c.shop_address),!d.phone&&(c!=null&&c.shop_phone)&&(d.phone=c.shop_phone),d.items.push(u),d.sum+=K(u.qty)*K(u.price)}),Array.from(o.values()).sort((u,c)=>c.sum-u.sum)}function le(n,l,o,u){const c=ve(l,o),v=c.reduce((w,F)=>w+F.sum,0),d=Array.from(new Set(l.map(w=>w.room_name).filter(Boolean))),x=d.length?d.join(", "):"Без помещения",b=c.map(w=>{const F=w.items.map((k,E)=>`
            <tr>
              <td class="num">${E+1}</td>
              <td>${N(k.name)}</td>
              <td>${N(k.room_name||"—")}</td>
              <td>${N(k.work_type||"—")}</td>
              <td class="center">${K(k.qty)}</td>
              <td class="center">${N(k.unit)}</td>
              <td class="right">${Z(k.price)}</td>
              <td class="right amount">${Z(K(k.qty)*K(k.price))}</td>
            </tr>`).join(""),z=w.address?`Адрес: ${N(w.address)}`:"";return`
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
              <tr class="cat-row"><td colspan="8">${N(w.name)}${z?` — ${z}`:""}</td></tr>
              ${F}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="7" class="right">Итого по магазину</td>
                <td class="right amount">${Z(w.sum)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>`}).join(""),f=`
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

  ${b}

  <div class="summary">
    <div class="summary-box">
      <div class="summary-row">
        <span>Помещение:</span>
        <span>${N(x)}</span>
      </div>
      <div class="summary-total">
        <span>ИТОГО:</span>
        <span>${Z(v)}</span>
      </div>
    </div>
  </div>

  <hr class="thin" />

  <div class="parties">
    <div>
      <div class="label">Исполнитель</div>
      <div class="name">${N(u)}</div>
    </div>
    <div>
      <div class="label">Заказчик</div>
      <div class="name">${N(n.client_name)}</div>
    </div>
  </div>

  <div class="footer">
    Сформировано ${je(new Date().toISOString())}
  </div>`,_=`Материалы № ${n.object_code} — ${N(n.client_name)}`;return{styles:f,bodyContent:$,title:_}}function se(n,l,o,u,c=!1){const{styles:v,bodyContent:d,title:x}=le(n,l,o,u),b=`<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8" />
<title>${x}</title>
<style>${v}</style>
</head>
<body>
<div class="est-root">${d}</div>
</body>
</html>`,f=window.open("","_blank","width=900,height=1000");f&&(f.document.open(),f.document.write(b),f.document.close(),c&&(f.onload=()=>{f.focus(),f.print()}))}function we(n,l){return n.replace(/@page[^{]*\{[^}]*\}/g,"").replace(/@media\s+print\s*\{(?:[^{}]*\{[^}]*\})*[^{}]*\}/g,"").replace(/(^|\})\s*([^{}@]+)\s*\{/g,(u,c,v)=>{const d=v.split(",").map(x=>{const b=x.trim();return b?b==="*"?`${l}, ${l} *`:/^(html|body)$/i.test(b)||b===".est-root"?l:b.startsWith(".est-root ")?`${l} ${b.slice(10)}`:`${l} ${b}`:""}).filter(Boolean).join(", ");return`${c} ${d} {`})}async function ye(n,l,o,u){const{styles:c,bodyContent:v}=le(n,l,o,u),d=document.createElement("div");d.style.position="fixed",d.style.left="-10000px",d.style.top="0",d.style.width="760px",d.style.background="#ffffff";const x=document.createElement("div");x.id="pdf-scope-materials",x.className="est-root",x.style.width="760px",x.style.maxWidth="760px",x.style.padding="0",x.style.margin="0",x.style.background="#ffffff";const b=document.createElement("style");b.textContent=we(c,"#pdf-scope-materials"),x.appendChild(b);const f=document.createElement("div");f.innerHTML=v,x.appendChild(f),d.appendChild(x),document.body.appendChild(d),await new Promise($=>{const _=new Image;_.onload=()=>$(),_.onerror=()=>$(),_.src=`${window.location.origin}/favicon.png`,setTimeout($,3e3)});try{const $=(await ce(async()=>{const{default:_}=await import("./html2pdf-COeU3VF1.js").then(w=>w.h);return{default:_}},__vite__mapDeps([0,1,2]))).default;await $().set({margin:[12,12,12,12],filename:`Материалы ${n.object_code}.pdf`,image:{type:"jpeg",quality:.98},html2canvas:{scale:2,useCORS:!0,backgroundColor:"#ffffff",width:760,windowWidth:760,scrollX:0,scrollY:0},jsPDF:{unit:"mm",format:"a4",orientation:"portrait"},pagebreak:{mode:["css","legacy"],avoid:[".cat-block",".room-block"]}}).from(x).save()}finally{d.parentNode&&document.body.removeChild(d)}}const U=n=>new Intl.NumberFormat("ru-RU",{maximumFractionDigits:2}).format(n||0)+" ₽",j=n=>Number(n||0),A="w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50",Ne=["шт","м²","м","м.п.","м³","кг","т","л","уп","рул","меш","компл"],_e=["Демонтажные работы","Подготовительные работы","Черновые работы","Чистовые работы","Плиточные работы","Устройство полов","Потолочные работы","Гипсокартонные работы","Малярные работы","Электромонтажные работы","Сантехнические работы","Столярные работы"],ae="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm px-4 py-2.5 rounded-lg disabled:opacity-40";function Se(){const{user:n}=me(),l=(n==null?void 0:n.company_name)||"",[o,u]=m.useState([]),[c,v]=m.useState([]),[d,x]=m.useState([]),[b,f]=m.useState([]),[$,_]=m.useState(!0),[w,F]=m.useState(""),[z,k]=m.useState(""),[E,B]=m.useState(""),[W,Y]=m.useState(null),[I,M]=m.useState(!1),[q,D]=m.useState(null),[r,a]=m.useState({material_id:"",name:"",unit:"",qty:"",price:"",shop_name:"",room_id:"",work_type:"",note:""}),p=()=>{_(!0),V.list().then(t=>{u(t.materials||[]);const i=t.objects||[];v(i),Y(s=>{var C;return s&&i.some(H=>H.id===s)?s:((C=i[0])==null?void 0:C.id)??null}),x(t.object_materials||[]),f(t.rooms||[])}).catch(t=>F((t==null?void 0:t.message)||"Не удалось загрузить данные")).finally(()=>_(!1))};m.useEffect(p,[]);const X=async t=>{F("");try{await t(),p()}catch(i){F((i==null?void 0:i.message)||"Операция не выполнена")}},P=m.useMemo(()=>Array.from(new Set(o.map(t=>t.shop_name).filter(Boolean))).sort(),[o]),T=m.useMemo(()=>{const t=z.trim().toLowerCase();return o.filter(i=>(!E||i.shop_name===E)&&(!t||[i.name,i.category,i.shop_name,i.shop_address].filter(Boolean).some(s=>String(s).toLowerCase().includes(t))))},[o,z,E]),R=t=>d.filter(i=>i.object_id===t),Q=t=>R(t).reduce((i,s)=>i+j(s.qty)*j(s.price),0),h=c.find(t=>t.id===W)||null,L=t=>{const i=R(t),s=new Map;return i.forEach(C=>{const H=C.room_id?`room-${C.room_id}`:"other",de=C.room_name||(C.room_id?"Помещение":"Без помещения");s.has(H)||s.set(H,{key:H,title:de,items:[],sum:0});const ne=s.get(H);ne.items.push(C),ne.sum+=j(C.qty)*j(C.price)}),Array.from(s.values())},ee=t=>{D(t),a({material_id:t.material_id?String(t.material_id):"",name:t.name||"",unit:t.unit||"шт",qty:String(j(t.qty)),price:String(j(t.price)),shop_name:t.shop_name||"",room_id:t.room_id?String(t.room_id):"",work_type:t.work_type||"",note:t.note||""})},G=t=>{const i=o.find(s=>String(s.id)===t);a(s=>({...s,material_id:t,name:i?i.name:s.name,unit:i?i.unit:s.unit,price:i?String(j(i.price)):s.price,shop_name:i?i.shop_name:s.shop_name}))},S=(t=!1)=>X(async()=>{if(!q||!h)return;const i=b.find(C=>String(C.id)===r.room_id),s={...q,material_id:r.material_id?Number(r.material_id):null,name:r.name,unit:r.unit,qty:Number(r.qty||0),price:Number(r.price||0),shop_name:r.shop_name,room_id:i?i.id:null,room_name:i?i.name:"",work_type:r.work_type,note:r.note};await V.updateObjectMaterial(q.id,{material_id:s.material_id,name:s.name,unit:s.unit,qty:s.qty,price:s.price,shop_name:s.shop_name,room_id:s.room_id,room_name:s.room_name,work_type:s.work_type,note:s.note}),D(null),t&&se(h,[s],o,l,!0)}),J=async t=>{W&&(await V.addToObject({object_id:W,...t}),p())};return e.jsxs(xe,{title:"Материалы",subtitle:"Справочник материалов и закупки по объектам",children:[w&&e.jsx("div",{className:"mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300",children:w}),$?e.jsx("div",{className:"flex justify-center py-16",children:e.jsx(y,{name:"Loader2",size:24,className:"animate-spin text-white/40"})}):e.jsxs(pe,{defaultValue:"objects",children:[e.jsxs(he,{className:"mb-6 h-auto flex-wrap border border-white/10 bg-[#1f1f1f]",children:[e.jsx(re,{value:"objects",children:"Объекты"}),e.jsx(re,{value:"catalog",children:"Справочник"})]}),e.jsx(oe,{value:"objects",children:e.jsx("div",{className:"rounded-xl border border-white/10 bg-[#1f1f1f] p-5",children:c.length===0?e.jsxs("div",{className:"py-16 text-center text-sm text-white/30",children:["Объектов пока нет —"," ",e.jsx(ie,{to:"/cabinet/objects",className:"text-[#D4AF37] hover:underline",children:"создать объект"})]}):e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"mb-5 flex flex-wrap items-end gap-3",children:[e.jsxs("div",{className:"min-w-[280px] flex-1",children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Объект"}),e.jsxs("select",{className:A,value:W??"",onChange:t=>{Y(t.target.value?Number(t.target.value):null),M(!1)},children:[e.jsx("option",{value:"",children:"Выберите объект"}),c.map(t=>e.jsxs("option",{value:t.id,children:[t.object_code," — ",t.client_name,t.address?` · ${t.address}`:""]},t.id))]})]}),h&&e.jsx(e.Fragment,{children:e.jsxs("button",{className:ae,onClick:()=>M(!I),children:[e.jsx(y,{name:I?"X":"Calculator",size:16}),I?"Свернуть":"Рассчитать помещение"]})})]}),h?e.jsxs(e.Fragment,{children:[I&&e.jsx("div",{className:"mb-5 rounded-lg border border-[#D4AF37]/30 bg-[#161616] p-4",children:e.jsx(ge,{objectId:h.id,materials:o,rooms:b,existing:R(h.id),onAdd:J,onCancel:()=>M(!1)})}),e.jsxs("div",{className:"mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#161616] px-4 py-3 text-sm",children:[e.jsxs("div",{className:"text-white/60",children:[h.object_code," — ",h.client_name,e.jsxs("span",{className:"ml-2 text-white/30",children:[R(h.id).length," позиций"]})]}),e.jsxs("div",{className:"text-[#D4AF37]",children:["Итого: ",U(Q(h.id))]})]}),R(h.id).length===0?e.jsx("div",{className:"py-14 text-center text-sm text-white/30",children:"Для этого объекта расчётов ещё нет — нажмите «Рассчитать помещение»"}):e.jsx("div",{className:"space-y-4",children:L(h.id).map(t=>e.jsxs("div",{className:"rounded-lg border border-white/10 bg-[#161616]",children:[e.jsxs("div",{className:"flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3",children:[e.jsxs("div",{className:"flex items-center gap-2 text-sm",children:[e.jsx(y,{name:"DoorOpen",size:15,className:"text-[#D4AF37]"}),t.title]}),e.jsx("div",{className:"text-sm text-[#D4AF37]",children:U(t.sum)})]}),e.jsx("div",{className:"overflow-x-auto p-4",children:e.jsxs("table",{className:"w-full text-sm",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"border-b border-white/10 text-xs uppercase text-white/40",children:[e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Материал"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Вид работ"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Кол-во"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Цена"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Сумма"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Магазин"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Действия"})]})}),e.jsx("tbody",{children:t.items.map(i=>e.jsxs("tr",{className:"border-b border-white/5 last:border-0",children:[e.jsxs("td",{className:"py-2.5 pr-4",children:[i.name,i.note&&e.jsx("div",{className:"text-xs text-white/30",children:i.note})]}),e.jsx("td",{className:"py-2.5 pr-4 text-white/60",children:i.work_type||"—"}),e.jsxs("td",{className:"whitespace-nowrap py-2.5 pr-4",children:[j(i.qty)," ",i.unit]}),e.jsx("td",{className:"py-2.5 pr-4 text-white/60",children:U(j(i.price))}),e.jsx("td",{className:"whitespace-nowrap py-2.5 pr-4 text-[#D4AF37]",children:U(j(i.qty)*j(i.price))}),e.jsx("td",{className:"py-2.5 pr-4 text-white/60",children:i.shop_name||"—"}),e.jsx("td",{className:"py-2.5 pr-4",children:e.jsxs("div",{className:"flex items-center gap-2.5",children:[e.jsx("button",{className:"text-white/50 transition-colors hover:text-[#D4AF37]",title:"Просмотр",onClick:()=>se(h,[i],o,l),children:e.jsx(y,{name:"Eye",size:16})}),e.jsx("button",{className:"text-white/50 transition-colors hover:text-[#D4AF37]",title:"Редактировать",onClick:()=>ee(i),children:e.jsx(y,{name:"Pencil",size:16})}),e.jsx("button",{className:"text-white/50 transition-colors hover:text-[#D4AF37]",title:"Печать",onClick:()=>se(h,[i],o,l,!0),children:e.jsx(y,{name:"Printer",size:16})}),e.jsx("button",{className:"text-white/50 transition-colors hover:text-[#D4AF37]",title:"Скачать PDF",onClick:()=>ye(h,[i],o,l),children:e.jsx(y,{name:"FileDown",size:16})}),e.jsx("button",{className:"text-white/40 transition-colors hover:text-red-400",title:"Убрать с объекта",onClick:()=>X(()=>V.removeFromObject(i.id)),children:e.jsx(y,{name:"Trash2",size:16})})]})})]},i.id))})]})})]},t.key))})]}):e.jsx("div",{className:"py-16 text-center text-sm text-white/30",children:"Выберите объект, чтобы увидеть его расчёты и материалы"})]})})}),e.jsx(oe,{value:"catalog",children:e.jsxs("div",{className:"rounded-xl border border-white/10 bg-[#1f1f1f] p-5",children:[e.jsxs("div",{className:"mb-4 flex flex-wrap items-center gap-3",children:[e.jsxs("div",{className:"relative min-w-[220px] flex-1",children:[e.jsx(y,{name:"Search",size:16,className:"absolute left-3 top-1/2 -translate-y-1/2 text-white/30"}),e.jsx("input",{className:`${A} pl-9`,placeholder:"Поиск: материал, категория, магазин, адрес",value:z,onChange:t=>k(t.target.value)})]}),e.jsxs("select",{className:`${A} max-w-[200px]`,value:E,onChange:t=>B(t.target.value),children:[e.jsx("option",{value:"",children:"Все магазины"}),P.map(t=>e.jsx("option",{value:t,children:t},t))]}),e.jsxs(ie,{to:"/cabinet/materials/new",className:ae,children:[e.jsx(y,{name:"Plus",size:16}),"Добавить материал"]})]}),T.length===0?e.jsx("div",{className:"py-16 text-center text-sm text-white/30",children:o.length===0?"Справочник пуст — добавьте первый материал":"Ничего не найдено по заданным условиям"}):e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"w-full text-sm",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"border-b border-white/10 text-xs uppercase text-white/40",children:[e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Материал"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Категория"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Ед. изм."}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Цена"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Расход"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Магазин"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Адрес"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Контакты"}),e.jsx("th",{className:"py-2 pr-4 text-left font-medium",children:"Действия"})]})}),e.jsx("tbody",{children:T.map(t=>e.jsxs("tr",{className:"border-b border-white/5 last:border-0",children:[e.jsxs("td",{className:"py-3 pr-4",children:[t.name,t.note&&e.jsx("div",{className:"text-xs text-white/30",children:t.note})]}),e.jsx("td",{className:"py-3 pr-4 text-white/60",children:t.category||"—"}),e.jsx("td",{className:"py-3 pr-4 text-white/60",children:t.unit}),e.jsx("td",{className:"whitespace-nowrap py-3 pr-4 text-[#D4AF37]",children:U(j(t.price))}),e.jsx("td",{className:"whitespace-nowrap py-3 pr-4 text-white/60",children:j(t.consumption)>0?e.jsxs(e.Fragment,{children:["1 ",t.unit," = ",j(t.consumption)," ",t.consumption_unit,j(t.price)>0&&e.jsxs("div",{className:"text-xs text-white/30",children:[(j(t.price)/j(t.consumption)).toFixed(2)," ₽ за"," ",t.consumption_unit]})]}):"—"}),e.jsx("td",{className:"py-3 pr-4",children:t.shop_url?e.jsx("a",{href:t.shop_url,target:"_blank",rel:"noreferrer",className:"hover:text-[#D4AF37]",children:t.shop_name||"—"}):t.shop_name||"—"}),e.jsx("td",{className:"py-3 pr-4 text-white/60",children:t.shop_address||"—"}),e.jsx("td",{className:"py-3 pr-4 text-white/60",children:t.shop_phone?e.jsx("a",{href:`tel:${t.shop_phone}`,className:"hover:text-[#D4AF37]",children:t.shop_phone}):"—"}),e.jsx("td",{className:"py-3 pr-4",children:e.jsx("button",{className:"text-white/40 transition-colors hover:text-red-400",title:"Удалить",onClick:()=>X(()=>V.remove(t.id)),children:e.jsx(y,{name:"Trash2",size:16})})})]},t.id))})]})})]})})]}),q&&e.jsx("div",{className:"fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4",onClick:()=>D(null),children:e.jsxs("div",{className:"max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-white/10 bg-[#1f1f1f] p-6",onClick:t=>t.stopPropagation(),children:[e.jsx("div",{className:"mb-1 text-base",children:"Редактирование позиции"}),e.jsxs("div",{className:"mb-5 text-xs text-white/40",children:[h==null?void 0:h.object_code," — ",h==null?void 0:h.client_name]}),e.jsxs("div",{className:"grid gap-4 sm:grid-cols-2",children:[e.jsxs("div",{className:"sm:col-span-2",children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Материал из справочника"}),e.jsxs("select",{className:A,value:r.material_id,onChange:t=>G(t.target.value),children:[e.jsx("option",{value:"",children:"Произвольная позиция"}),o.map(t=>e.jsxs("option",{value:t.id,children:[t.name," — ",U(j(t.price)),"/",t.unit]},t.id))]})]}),e.jsxs("div",{className:"sm:col-span-2",children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Наименование"}),e.jsx("input",{className:A,value:r.name,onChange:t=>a({...r,name:t.target.value})})]}),e.jsxs("div",{children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Помещение"}),e.jsxs("select",{className:A,value:r.room_id,onChange:t=>a({...r,room_id:t.target.value}),children:[e.jsx("option",{value:"",children:"Без помещения"}),b.filter(t=>t.object_id===q.object_id).map(t=>e.jsx("option",{value:t.id,children:t.name},t.id))]})]}),e.jsxs("div",{children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Вид работ"}),e.jsxs("select",{className:A,value:r.work_type,onChange:t=>a({...r,work_type:t.target.value}),children:[e.jsx("option",{value:"",children:"Не указан"}),_e.map(t=>e.jsx("option",{value:t,children:t},t))]})]}),e.jsxs("div",{children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Количество"}),e.jsx("input",{className:A,type:"number",min:"0",step:"0.01",value:r.qty,onChange:t=>a({...r,qty:t.target.value})})]}),e.jsxs("div",{children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Единица измерения"}),e.jsx("select",{className:A,value:r.unit,onChange:t=>a({...r,unit:t.target.value}),children:Ne.map(t=>e.jsx("option",{value:t,children:t},t))})]}),e.jsxs("div",{children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Цена за единицу, ₽"}),e.jsx("input",{className:A,type:"number",min:"0",step:"0.01",value:r.price,onChange:t=>a({...r,price:t.target.value})})]}),e.jsxs("div",{children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Магазин"}),e.jsx("input",{className:A,value:r.shop_name,onChange:t=>a({...r,shop_name:t.target.value})})]}),e.jsxs("div",{className:"sm:col-span-2",children:[e.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Примечание"}),e.jsx("input",{className:A,value:r.note,onChange:t=>a({...r,note:t.target.value})})]}),e.jsxs("div",{className:"rounded-lg border border-[#D4AF37]/30 bg-[#161616] px-4 py-2.5 text-sm sm:col-span-2",children:["Сумма:"," ",e.jsx("span",{className:"text-[#D4AF37]",children:U(Number(r.qty||0)*Number(r.price||0))})]})]}),e.jsxs("div",{className:"mt-6 flex flex-wrap items-center gap-3",children:[e.jsxs("button",{className:ae,onClick:()=>S(!1),children:[e.jsx(y,{name:"Check",size:16}),"Сохранить"]}),e.jsxs("button",{className:"flex items-center gap-2 rounded-lg border border-[#D4AF37]/40 px-4 py-2.5 text-sm text-[#D4AF37] transition-colors hover:bg-[#D4AF37]/10",onClick:()=>S(!0),children:[e.jsx(y,{name:"Printer",size:16}),"Сохранить и печать"]}),e.jsx("button",{className:"rounded-lg border border-white/10 px-4 py-2.5 text-sm text-white/60 transition-colors hover:text-white",onClick:()=>D(null),children:"Отмена"})]})]})})]})}export{Se as default};
