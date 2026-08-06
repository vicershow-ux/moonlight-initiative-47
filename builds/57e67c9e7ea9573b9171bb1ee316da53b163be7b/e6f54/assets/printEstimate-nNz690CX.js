const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/html2pdf-C0mDNTGI.js","assets/index-CZcWQIey.js","assets/index-C7rVwvzy.css"])))=>i.map(i=>d[i]);
import{_ as A}from"./index-CZcWQIey.js";const f=(t,o=0)=>{const d=typeof t=="string"?parseFloat(t):Number(t);return Number.isFinite(d)?d:o},g=t=>new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0}).format(f(t))+" ₽",w=t=>new Date(t).toLocaleDateString("ru-RU",{day:"numeric",month:"long",year:"numeric"}),C=t=>new Date(t).toLocaleString("ru-RU",{day:"numeric",month:"numeric",year:"numeric",hour:"2-digit",minute:"2-digit"});function $(t,o,d){const h=t.items||[],s=new Map;h.forEach(u=>{const x=u.room_name||"Без помещения";s.has(x)||s.set(x,[]),s.get(x).push(u)});const n=f(t.subtotal_amount??t.total_amount),i=f(t.discount_amount??0),e=Array.from(s.entries()).map(([u,x])=>{const v=new Map;x.forEach(b=>{const l=b.category||"Прочие работы";v.has(l)||v.set(l,[]),v.get(l).push(b)});const _=x.reduce((b,l)=>b+f(l.amount),0),k=Array.from(v.entries()).map(([b,l])=>{const z=l.reduce((c,y)=>c+f(y.amount),0),E=l.map((c,y)=>`
            <tr>
              <td class="num">${y+1}</td>
              <td>${a(c.name)}</td>
              <td class="center">${a(c.unit)}</td>
              <td class="center">${f(c.quantity)}</td>
              <td class="center">${f(c.times,1)}</td>
              <td class="right">${g(c.price)}</td>
              <td class="right amount">${g(c.amount)}</td>
            </tr>`).join("");return`
        <div class="cat-block">
          <table>
            <thead>
              <tr>
                <th class="num">№</th>
                <th>Наименование работы</th>
                <th class="center">Ед.</th>
                <th class="center">Кол-во</th>
                <th class="center">Раз</th>
                <th class="right">Цена</th>
                <th class="right">Сумма</th>
              </tr>
            </thead>
            <tbody>
              <tr class="cat-row"><td colspan="7">${a(b)}</td></tr>
              ${E}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="6" class="right">Итого по категории</td>
                <td class="right amount">${g(z)}</td>
              </tr>
            </tfoot>
          </table>
        </div>`}).join("");return`
      <div class="room-block">
        <h3 class="room-title">${a(u)}</h3>
        ${k}
        <div class="room-total">
          <div>
            <div class="room-total-label">Итоговая сумма по помещению</div>
            <div class="room-total-name">${a(u)}</div>
          </div>
          <div class="room-total-amount">${g(_)}</div>
        </div>
      </div>`}).join(""),r=`
  * { box-sizing: border-box; }
  .est-root {
    font-family: 'Segoe UI', Arial, sans-serif;
    color: #1a1a1a;
    padding: 40px 48px;
    max-width: 850px;
    margin: 0 auto;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 3px solid #C08A2A;
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
  .brand span { color: #C08A2A; }
  .doc-title {
    text-align: right;
  }
  .doc-title h1 {
    font-size: 20px;
    margin: 0 0 4px;
  }
  .doc-title p {
    margin: 0;
    color: #444;
    font-size: 13px;
  }
  .doc-subtitle h2 {
    font-size: 19px;
    margin: 0;
    letter-spacing: -0.3px;
  }
  .doc-subtitle p {
    margin: 4px 0 0;
    color: #444;
    font-size: 12px;
  }
  hr.thin {
    border: none;
    border-top: 1px solid #bbb;
    margin: 20px 0;
  }
  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px 32px;
    background: #f0f0f0;
    border-radius: 10px;
    padding: 16px;
    margin-bottom: 24px;
    font-size: 13px;
  }
  .info-grid .label {
    color: #555;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 2px;
  }
  .info-grid .value {
    font-weight: 500;
  }
  .room-title {
    font-size: 15px;
    font-weight: 700;
    margin: 0 0 8px;
  }
  .room-block { margin-bottom: 22px; page-break-inside: avoid; break-inside: avoid; }
  .cat-block {
    page-break-inside: avoid;
    break-inside: avoid;
    border: 1px solid #bbb;
    border-radius: 10px;
    overflow: hidden;
    margin-bottom: 12px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12.5px;
    table-layout: fixed;
  }
  thead th:nth-child(1) { width: 30px; }
  thead th:nth-child(2) { width: auto; }
  thead th:nth-child(3) { width: 44px; }
  thead th:nth-child(4) { width: 64px; white-space: nowrap; }
  thead th:nth-child(5) { width: 44px; }
  thead th:nth-child(6) { width: 82px; }
  thead th:nth-child(7) { width: 92px; }
  tbody td { overflow-wrap: break-word; word-break: break-word; }
  thead th {
    background: #e4e4e4;
    color: #555;
    text-align: left;
    padding: 8px 10px;
    font-weight: 500;
    font-size: 10.5px;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }
  tbody td {
    padding: 8px 10px;
    border-top: 1px solid #ccc;
  }
  .num { color: #555; width: 28px; }
  .center { text-align: center; }
  .right { text-align: right; }
  .amount { font-weight: 600; }
  .cat-row td {
    background: #EFE0C4;
    color: #7A4E10;
    font-weight: 600;
    font-size: 11px;
    border-top: none;
  }
  tfoot td {
    padding: 8px 10px;
    font-size: 12.5px;
    background: #f0f0f0;
    border-top: 1px solid #bbb;
  }
  .room-total {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #EFE2C8;
    border-left: 4px solid #C08A2A;
    border-radius: 6px;
    padding: 12px 16px;
    margin-top: 10px;
  }
  .room-total-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #7A4E10;
    font-weight: 700;
  }
  .room-total-name {
    font-size: 13px;
    color: #444;
    margin-top: 2px;
  }
  .room-total-amount {
    font-size: 18px;
    font-weight: 700;
    color: #7A4E10;
  }
  .summary {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 24px;
  }
  .summary-box {
    width: 100%;
    max-width: 290px;
    background: #f0f0f0;
    border-radius: 10px;
    padding: 16px;
    font-size: 13px;
  }
  .summary-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 6px;
    color: #444;
  }
  .summary-row.discount { color: #7A4E10; }
  .summary-total {
    display: flex;
    justify-content: space-between;
    font-size: 16px;
    font-weight: 700;
    padding-top: 8px;
    border-top: 1px solid #bbb;
  }
  .notes {
    margin-bottom: 24px;
    font-size: 13px;
  }
  .notes .label {
    color: #555;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
  }
  .parties {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    font-size: 13px;
    margin-bottom: 12px;
  }
  .parties .label {
    color: #555;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
  }
  .parties .name { font-weight: 600; }
  .parties .contact { color: #555; font-size: 12px; margin-top: 2px; }
  .parties .signature { height: 40px; object-fit: contain; margin-top: 8px; }
  .signatures {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    margin-top: 32px;
    margin-bottom: 12px;
  }
  .signature-block .label {
    color: #555;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 28px;
  }
  .signature-block .signature-line {
    border-top: 1px solid #999;
    padding-top: 6px;
    font-size: 13px;
    text-align: center;
    color: #1a1a1a;
  }
  .footer {
    text-align: right;
    font-size: 11px;
    color: #666;
    margin-top: 24px;
  }
  @page { size: A4 portrait; margin: 12mm 10mm; }
  @media print {
    html, body { width: 100%; margin: 0; padding: 0; background: #fff; }
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    .est-root {
      padding: 0;
      max-width: 100%;
      width: 100%;
      margin: 0;
    }
    .no-print { display: none; }
    .cat-block { break-inside: avoid; }
    .room-block { break-inside: avoid; }
    table { width: 100%; table-layout: fixed; }
    td, th { overflow-wrap: break-word; word-break: break-word; }
    thead th { background: #e4e4e4 !important; color: #333 !important; }
    .cat-row td { background: #EFE0C4 !important; color: #7A4E10 !important; }
    .room-total { background: #EFE2C8 !important; border-left: 4px solid #A9711F !important; }
    tfoot td { background: #f0f0f0 !important; }
    .info-grid, .summary { background: #f0f0f0 !important; }
  }
`,p=`
  <div class="header">
    <div class="brand"><div class="brand-logo" style="background-image:url('${window.location.origin}/favicon.png')"></div>Fix<span>Key</span></div>
    <div class="doc-title">
      <h1>Смета № ${t.id}</h1>
      <p>от ${w(t.created_at)}</p>
    </div>
  </div>

  <div class="doc-subtitle">
    <h2>СМЕТА НА РАБОТЫ</h2>
    <p>Расчёт ремонтно-отделочных работ</p>
    ${t.contract_number?`<p>Приложение к договору № ${a(t.contract_number)}${t.contract_date?` от ${w(t.contract_date)}`:""}</p>`:""}
  </div>

  <hr class="thin" />

  <div class="info-grid">
    <div>
      <div class="label">ID объекта</div>
      <div class="value">${a(o.object_code)}</div>
    </div>
    <div>
      <div class="label">Заказчик</div>
      <div class="value">${a(o.client_name)}</div>
    </div>
    <div>
      <div class="label">Контактный телефон</div>
      <div class="value">${a(o.client_phone||"—")}</div>
    </div>
    <div>
      <div class="label">Характеристики объекта</div>
      <div class="value">${a(o.object_type)} · ${o.area} м²</div>
    </div>
  </div>

  ${e}

  <div class="summary">
    <div class="summary-box">
      ${i>0?`
      <div class="summary-row">
        <span>Сумма до скидки:</span>
        <span>${g(n)}</span>
      </div>
      <div class="summary-row discount">
        <span>Скидка:</span>
        <span>-${g(i)}</span>
      </div>`:""}
      <div class="summary-total">
        <span>ИТОГО К ОПЛАТЕ:</span>
        <span>${g(t.total_amount)}</span>
      </div>
    </div>
  </div>

  ${t.notes?`
  <div class="notes">
    <div class="label">Примечания</div>
    <div>${a(t.notes)}</div>
  </div>`:""}

  <hr class="thin" />

  <div class="parties">
    <div>
      <div class="label">Исполнитель</div>
      <div class="name">${a(t.company_name||d)}</div>
      ${t.company_phone?`<div class="contact">Тел: ${a(t.company_phone)}</div>`:""}
      ${t.company_email?`<div class="contact">Email: ${a(t.company_email)}</div>`:""}
      ${t.company_website?`<div class="contact">${a(t.company_website)}</div>`:""}
      ${t.company_inn?`<div class="contact">ИНН: ${a(t.company_inn)}</div>`:""}
      ${t.company_legal_address?`<div class="contact">${a(t.company_legal_address)}</div>`:""}
      ${t.company_signature_url?`<img class="signature" src="${t.company_signature_url}" alt="Подпись" />`:""}
    </div>
    <div>
      <div class="label">Заказчик</div>
      <div class="name">${a(o.client_name)}</div>
      ${o.client_phone?`<div class="contact">Тел: ${a(o.client_phone)}</div>`:""}
    </div>
  </div>

  <div class="signatures">
    <div class="signature-block">
      <div class="label">Исполнитель</div>
      <div class="signature-line">${a(t.company_name||d)}</div>
    </div>
    <div class="signature-block">
      <div class="label">Заказчик</div>
      <div class="signature-line">${a(o.client_name)}</div>
    </div>
  </div>

  <div class="footer">
    Сформировано ${C(new Date().toISOString())}
  </div>`,m=`Смета № ${t.id} — ${a(o.client_name)}`;return{styles:r,bodyContent:p,title:m}}function T(t,o,d){const{styles:h,bodyContent:s,title:n}=$(t,o,d),i=`<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8" />
<title>${n}</title>
<style>${h}</style>
</head>
<body>
<div class="est-root">${s}</div>
</body>
</html>`,e=window.open("","_blank","width=900,height=1000");e&&(e.document.open(),e.document.write(i),e.document.close(),e.onload=()=>{e.focus(),e.print()})}function D(t,o){return t.replace(/@page[^{]*\{[^}]*\}/g,"").replace(/@media\s+print\s*\{(?:[^{}]*\{[^}]*\})*[^{}]*\}/g,"").replace(/(^|\})\s*([^{}@]+)\s*\{/g,(h,s,n)=>{const i=n.split(",").map(e=>{const r=e.trim();return r?r==="*"?`${o}, ${o} *`:/^(html|body)$/i.test(r)||r===".est-root"?o:r.startsWith(".est-root ")?`${o} ${r.slice(10)}`:`${o} ${r}`:""}).filter(Boolean).join(", ");return`${s} ${i} {`})}async function j(t,o,d){const{styles:h,bodyContent:s}=$(t,o,d),n=document.createElement("div");n.style.position="fixed",n.style.left="-10000px",n.style.top="0",n.style.width="760px",n.style.background="#ffffff";const i=document.createElement("div");i.id="pdf-scope-estimate",i.className="est-root",i.style.width="760px",i.style.maxWidth="760px",i.style.padding="0",i.style.margin="0",i.style.background="#ffffff";const e=document.createElement("style");e.textContent=D(h,"#pdf-scope-estimate"),i.appendChild(e);const r=document.createElement("div");r.innerHTML=s,i.appendChild(r),n.appendChild(i),document.body.appendChild(n),await new Promise(p=>{const m=new Image;m.onload=()=>p(),m.onerror=()=>p(),m.src=`${window.location.origin}/favicon.png`,setTimeout(p,3e3)});try{const p=(await A(async()=>{const{default:m}=await import("./html2pdf-C0mDNTGI.js").then(u=>u.h);return{default:m}},__vite__mapDeps([0,1,2]))).default;await p().set({margin:[8,8,8,8],filename:`Смета №${t.id}.pdf`,image:{type:"jpeg",quality:.98},html2canvas:{scale:2,useCORS:!0,backgroundColor:"#ffffff",width:760,windowWidth:760,scrollX:0,scrollY:0},jsPDF:{unit:"mm",format:"a4",orientation:"portrait"},pagebreak:{mode:["css","legacy"],avoid:[".cat-block",".room-block"]}}).from(i).save()}finally{n.parentNode&&document.body.removeChild(n)}}function a(t){const o=document.createElement("div");return o.textContent=t??"",o.innerHTML}export{j as d,T as p};
