const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/html2pdf-BsvjUnHI.js","assets/index-Cla4Lg7p.js","assets/index-DniG8cEW.css"])))=>i.map(i=>d[i]);
import{a2 as y}from"./index-Cla4Lg7p.js";const g=(t,a=0)=>{const r=typeof t=="string"?parseFloat(t):Number(t);return Number.isFinite(r)?r:a},u=t=>new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0}).format(g(t))+" ₽",k=t=>new Date(t).toLocaleString("ru-RU",{day:"numeric",month:"numeric",year:"numeric",hour:"2-digit",minute:"2-digit"});function n(t){const a=document.createElement("div");return a.textContent=t??"",a.innerHTML}function $(t,a){const r=new Map;return t.forEach(d=>{const e=a.find(i=>i.id===d.material_id),l=d.shop_name||(e==null?void 0:e.shop_name)||"Магазин не указан";r.has(l)||r.set(l,{name:l,address:"",phone:"",items:[],sum:0});const o=r.get(l);!o.address&&(e!=null&&e.shop_address)&&(o.address=e.shop_address),!o.phone&&(e!=null&&e.shop_phone)&&(o.phone=e.shop_phone),o.items.push(d),o.sum+=g(d.qty)*g(d.price)}),Array.from(r.values()).sort((d,e)=>e.sum-d.sum)}function v(t,a,r,d){const e=$(a,r),l=e.reduce((c,b)=>c+b.sum,0),o=Array.from(new Set(a.map(c=>c.room_name).filter(Boolean))),i=o.length?o.join(", "):"Без помещения",s=e.map(c=>{const b=c.items.map((m,w)=>`
            <tr>
              <td class="num">${w+1}</td>
              <td>${n(m.name)}</td>
              <td>${n(m.room_name||"—")}</td>
              <td>${n(m.work_type||"—")}</td>
              <td class="center">${g(m.qty)}</td>
              <td class="center">${n(m.unit)}</td>
              <td class="right">${u(m.price)}</td>
              <td class="right amount">${u(g(m.qty)*g(m.price))}</td>
            </tr>`).join(""),x=c.address?`Адрес: ${n(c.address)}`:"";return`
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
              <tr class="cat-row"><td colspan="8">${n(c.name)}${x?` — ${x}`:""}</td></tr>
              ${b}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="7" class="right">Итого по магазину</td>
                <td class="right amount">${u(c.sum)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>`}).join(""),p=`
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
    <div class="brand"><div class="brand-logo" style="background-image:url('${window.location.origin}/logo-224.png')"></div>Fix<span>Key</span></div>
    <div class="doc-title">
      <h1>Смета на материал</h1>
      <p>Объект № ${n(t.object_code)}</p>
    </div>
  </div>

  <div class="doc-subtitle">
    <h2>СМЕТА НА МАТЕРИАЛ</h2>
    <p>Расчёт материалов по помещениям и магазинам</p>
  </div>

  <hr class="thin" />

  <div class="info-grid">
    <div>
      <div class="label">ID объекта</div>
      <div class="value">${n(t.object_code)}</div>
    </div>
    <div>
      <div class="label">Заказчик</div>
      <div class="value">${n(t.client_name)}</div>
    </div>
    <div>
      <div class="label">Адрес объекта</div>
      <div class="value">${n(t.address||"—")}</div>
    </div>
    <div>
      <div class="label">Помещение</div>
      <div class="value">${n(i)}</div>
    </div>
  </div>

  ${s}

  <div class="summary">
    <div class="summary-box">
      <div class="summary-row">
        <span>Помещение:</span>
        <span>${n(i)}</span>
      </div>
      <div class="summary-total">
        <span>ИТОГО:</span>
        <span>${u(l)}</span>
      </div>
    </div>
  </div>

  <hr class="thin" />

  <div class="parties">
    <div>
      <div class="label">Исполнитель</div>
      <div class="name">${n(d)}</div>
    </div>
    <div>
      <div class="label">Заказчик</div>
      <div class="name">${n(t.client_name)}</div>
    </div>
  </div>

  <div class="footer">
    Сформировано ${k(new Date().toISOString())}
  </div>`,h=`Смета на материал № ${t.object_code} — ${n(t.client_name)}`;return{styles:p,bodyContent:f,title:h}}function C(t,a,r,d,e=!1){const{styles:l,bodyContent:o,title:i}=v(t,a,r,d),s=`<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8" />
<title>${i}</title>
<style>${l}</style>
</head>
<body>
<div class="est-root">${o}</div>
</body>
</html>`,p=window.open("","_blank","width=900,height=1000");p&&(p.document.open(),p.document.write(s),p.document.close(),e&&(p.onload=()=>{p.focus(),p.print()}))}function A(t,a){return t.replace(/@page[^{]*\{[^}]*\}/g,"").replace(/@media\s+print\s*\{(?:[^{}]*\{[^}]*\})*[^{}]*\}/g,"").replace(/(^|\})\s*([^{}@]+)\s*\{/g,(d,e,l)=>{const o=l.split(",").map(i=>{const s=i.trim();return s?s==="*"?`${a}, ${a} *`:/^(html|body)$/i.test(s)||s===".est-root"?a:s.startsWith(".est-root ")?`${a} ${s.slice(10)}`:`${a} ${s}`:""}).filter(Boolean).join(", ");return`${e} ${o} {`})}async function z(t,a,r,d){const{styles:e,bodyContent:l}=v(t,a,r,d),o=document.createElement("div");o.style.position="fixed",o.style.left="-10000px",o.style.top="0",o.style.width="760px",o.style.background="#ffffff";const i=document.createElement("div");i.id="pdf-scope-materials",i.className="est-root",i.style.width="760px",i.style.maxWidth="760px",i.style.padding="0",i.style.margin="0",i.style.background="#ffffff";const s=document.createElement("style");s.textContent=A(e,"#pdf-scope-materials"),i.appendChild(s);const p=document.createElement("div");p.innerHTML=l,i.appendChild(p),o.appendChild(i),document.body.appendChild(o),await new Promise(f=>{const h=new Image;h.onload=()=>f(),h.onerror=()=>f(),h.src=`${window.location.origin}/logo-224.png`,setTimeout(f,3e3)});try{const f=(await y(async()=>{const{default:h}=await import("./html2pdf-BsvjUnHI.js").then(c=>c.h);return{default:h}},__vite__mapDeps([0,1,2]))).default;await f().set({margin:[12,12,12,12],filename:`Смета на материал ${t.object_code}.pdf`,image:{type:"jpeg",quality:.98},html2canvas:{scale:2,useCORS:!0,backgroundColor:"#ffffff",width:760,windowWidth:760,scrollX:0,scrollY:0},jsPDF:{unit:"mm",format:"a4",orientation:"portrait"},pagebreak:{mode:["css","legacy"],avoid:[".cat-block",".room-block"]}}).from(i).save()}finally{o.parentNode&&document.body.removeChild(o)}}export{z as d,C as p};
