const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/html2pdf-D9G4OvOy.js","assets/index-BrT3uUTB.js","assets/index-DniG8cEW.css"])))=>i.map(i=>d[i]);
import{a2 as E}from"./index-BrT3uUTB.js";const g=(t,o=0)=>{const d=typeof t=="string"?parseFloat(t):Number(t);return Number.isFinite(d)?d:o},f=t=>new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0}).format(g(t))+" ₽",y=t=>new Date(t).toLocaleDateString("ru-RU",{day:"numeric",month:"long",year:"numeric"}),z=t=>new Date(t).toLocaleString("ru-RU",{day:"numeric",month:"numeric",year:"numeric",hour:"2-digit",minute:"2-digit"});function $(t,o,d){const u=t.items||[],s=new Map;u.forEach(h=>{const b=h.room_name||"Без помещения";s.has(b)||s.set(b,[]),s.get(b).push(h)});const n=g(t.subtotal_amount??t.total_amount),i=g(t.discount_amount??0),e=Array.from(s.entries()).map(([h,b])=>{const v=new Map;b.forEach(x=>{const l=x.category||"Прочие работы";v.has(l)||v.set(l,[]),v.get(l).push(x)});const k=b.reduce((x,l)=>x+g(l.amount),0),_=Array.from(v.entries()).map(([x,l])=>{const A=l.reduce((c,w)=>c+g(w.amount),0),C=l.map((c,w)=>`
            <tr>
              <td class="num">${w+1}</td>
              <td>${a(c.name)}</td>
              <td class="center">${a(c.unit)}</td>
              <td class="center">${g(c.quantity)}</td>
              <td class="center">${g(c.times,1)}</td>
              <td class="right">${f(c.price)}</td>
              <td class="right amount">${f(c.amount)}</td>
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
              <tr class="cat-row"><td colspan="7">${a(x)}</td></tr>
              ${C}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="6" class="right">Итого по категории</td>
                <td class="right amount">${f(A)}</td>
              </tr>
            </tfoot>
          </table>
        </div>`}).join("");return`
      <div class="room-block">
        <h3 class="room-title">${a(h)}</h3>
        ${_}
        <div class="room-total">
          <div>
            <div class="room-total-label">Итоговая сумма по помещению</div>
            <div class="room-total-name">${a(h)}</div>
          </div>
          <div class="room-total-amount">${f(k)}</div>
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
  .doc-title {
    text-align: right;
  }
  .doc-title h1 {
    font-size: 20px;
    margin: 0 0 4px;
  }
  .doc-title p {
    margin: 0;
    color: #1a1a1a;
    font-size: 13px;
  }
  .doc-subtitle h2 {
    font-size: 19px;
    margin: 0;
    letter-spacing: -0.3px;
  }
  .doc-subtitle p {
    margin: 4px 0 0;
    color: #1a1a1a;
    font-size: 12px;
  }
  hr.thin {
    border: none;
    border-top: 1.5px solid #7A4E10;
    margin: 20px 0;
  }
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
  thead th:nth-child(1) { width: 30px; }
  thead th:nth-child(2) { width: auto; }
  thead th:nth-child(3) { width: 44px; }
  thead th:nth-child(4) { width: 64px; white-space: nowrap; }
  thead th:nth-child(5) { width: 44px; }
  thead th:nth-child(6) { width: 82px; }
  thead th:nth-child(7) { width: 92px; }
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
  .num { color: #1a1a1a; width: 28px; }
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
  .room-total {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #EADCC0;
    border: 1.5px solid #7A4E10;
    border-left: 5px solid #5C3A11;
    border-radius: 6px;
    padding: 12px 16px;
    margin-top: 10px;
  }
  .room-total-label {
    font-size: 11.5px;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    color: #4A2E06;
    font-weight: 700;
  }
  .room-total-name {
    font-size: 13px;
    color: #1a1a1a;
    margin-top: 2px;
  }
  .room-total-amount {
    font-size: 18px;
    font-weight: 700;
    color: #4A2E06;
  }
  .summary {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 24px;
  }
  .summary-box {
    width: 100%;
    max-width: 290px;
    background: #ffffff;
    border: 1.5px solid #7A4E10;
    border-radius: 10px;
    padding: 16px;
    font-size: 13px;
  }
  .summary-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 6px;
    color: #1a1a1a;
  }
  .summary-row.discount { color: #6B4508; }
  .summary-total {
    display: flex;
    justify-content: space-between;
    font-size: 16px;
    font-weight: 700;
    padding-top: 8px;
    border-top: 1.5px solid #5C3A11;
  }
  .notes {
    margin-bottom: 24px;
    font-size: 13px;
  }
  .notes .label {
    color: #1a1a1a;
    font-size: 11.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.4px;
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
    color: #6B4508;
    font-size: 11.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    margin-bottom: 4px;
  }
  .parties .name { font-weight: 600; }
  .parties .contact { color: #333; font-size: 12.5px; margin-top: 2px; }
  .parties .signature { height: 40px; object-fit: contain; margin-top: 8px; }
  .signatures {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    margin-top: 32px;
    margin-bottom: 12px;
  }
  .signature-block .label {
    color: #6B4508;
    font-size: 11.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    margin-bottom: 28px;
  }
  .signature-block .signature-line {
    border-top: 1.5px solid #5C3A11;
    padding-top: 6px;
    font-size: 13px;
    text-align: center;
    color: #1a1a1a;
  }
  .footer {
    text-align: right;
    font-size: 11.5px;
    color: #444;
    margin-top: 24px;
  }
  @page { size: A4 portrait; margin: 10mm; }
  @media print {
    html, body { width: auto; margin: 0; padding: 0; background: #fff; overflow: visible; }
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    .est-root {
      padding: 0 2mm;
      width: 100%;
      max-width: 100%;
      margin: 0;
      overflow: visible;
    }
    .no-print { display: none; }
    .cat-block { break-inside: avoid; }
    .room-block { break-inside: avoid; }
    table { width: 100%; table-layout: fixed; }
    td, th { overflow-wrap: break-word; word-break: break-word; }
    thead th:nth-child(1) { width: 5%; }
    thead th:nth-child(2) { width: auto; }
    thead th:nth-child(3) { width: 7%; }
    thead th:nth-child(4) { width: 10%; }
    thead th:nth-child(5) { width: 7%; }
    thead th:nth-child(6) { width: 13%; }
    thead th:nth-child(7) { width: 15%; }
    thead th { background: #5C3A11 !important; color: #ffffff !important; }
    .cat-row td { background: #EADCC0 !important; color: #4A2E06 !important; }
    .room-total { background: #EADCC0 !important; border: 1.5px solid #7A4E10 !important; border-left: 5px solid #5C3A11 !important; }
    tfoot td { background: #ffffff !important; border-top: 1px solid #A98A5C !important; }
    .info-grid, .summary-box { background: #ffffff !important; border: 1.5px solid #7A4E10 !important; }
    .cat-block { border: 1.5px solid #7A4E10 !important; }
    .info-grid .label, .parties .label, .signature-block .label, .room-total-label { color: #6B4508 !important; }
    .cat-block, .info-grid, .room-total, .summary-box, .summary {
      max-width: 100%;
      box-sizing: border-box;
    }
    .cat-block { overflow: hidden; }
    tbody td { border-top: 1.2px solid #8A6A3A !important; color: #1a1a1a !important; }
    tbody tr:first-child td { border-top: none !important; }
    tfoot td { border-top: 1.5px solid #5C3A11 !important; }
    .summary-total { border-top: 1.5px solid #5C3A11 !important; }
    .signature-block .signature-line { border-top: 1.5px solid #5C3A11 !important; }
    hr.thin { border-top: 1.5px solid #7A4E10 !important; }
    .cat-block table { width: 100%; max-width: 100%; box-sizing: border-box; }
    .cat-block thead th:last-child,
    .cat-block tbody td:last-child,
    .cat-block tfoot td:last-child { padding-right: 12px; }
  }
`,p=`
  <div class="header">
    <div class="brand"><div class="brand-logo" style="background-image:url('${window.location.origin}/logo-224.png')"></div>Fix<span>Key</span></div>
    <div class="doc-title">
      <h1>Смета № ${t.id}</h1>
      <p>от ${y(t.created_at)}</p>
    </div>
  </div>

  <div class="doc-subtitle">
    <h2>СМЕТА НА РАБОТЫ</h2>
    <p>Расчёт ремонтно-отделочных работ</p>
    ${t.contract_number?`<p>Приложение к договору № ${a(t.contract_number)}${t.contract_date?` от ${y(t.contract_date)}`:""}</p>`:""}
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
        <span>${f(n)}</span>
      </div>
      <div class="summary-row discount">
        <span>Скидка:</span>
        <span>-${f(i)}</span>
      </div>`:""}
      <div class="summary-total">
        <span>ИТОГО К ОПЛАТЕ:</span>
        <span>${f(t.total_amount)}</span>
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
    Сформировано ${z(new Date().toISOString())}
  </div>`,m=`Смета № ${t.id} — ${a(o.client_name)}`;return{styles:r,bodyContent:p,title:m}}function j(t,o,d){const{styles:u,bodyContent:s,title:n}=$(t,o,d),i=`<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8" />
<title>${n}</title>
<style>${u}</style>
</head>
<body>
<div class="est-root">${s}</div>
</body>
</html>`,e=window.open("","_blank","width=900,height=1000");e&&(e.document.open(),e.document.write(i),e.document.close(),e.onload=()=>{e.focus(),e.print()})}function D(t,o){return t.replace(/@page[^{]*\{[^}]*\}/g,"").replace(/@media\s+print\s*\{(?:[^{}]*\{[^}]*\})*[^{}]*\}/g,"").replace(/(^|\})\s*([^{}@]+)\s*\{/g,(u,s,n)=>{const i=n.split(",").map(e=>{const r=e.trim();return r?r==="*"?`${o}, ${o} *`:/^(html|body)$/i.test(r)||r===".est-root"?o:r.startsWith(".est-root ")?`${o} ${r.slice(10)}`:`${o} ${r}`:""}).filter(Boolean).join(", ");return`${s} ${i} {`})}async function R(t,o,d){const{styles:u,bodyContent:s}=$(t,o,d),n=document.createElement("div");n.style.position="fixed",n.style.left="-10000px",n.style.top="0",n.style.width="760px",n.style.background="#ffffff";const i=document.createElement("div");i.id="pdf-scope-estimate",i.className="est-root",i.style.width="760px",i.style.maxWidth="760px",i.style.padding="0",i.style.margin="0",i.style.background="#ffffff";const e=document.createElement("style");e.textContent=D(u,"#pdf-scope-estimate"),i.appendChild(e);const r=document.createElement("div");r.innerHTML=s,i.appendChild(r),n.appendChild(i),document.body.appendChild(n),await new Promise(p=>{const m=new Image;m.onload=()=>p(),m.onerror=()=>p(),m.src=`${window.location.origin}/logo-224.png`,setTimeout(p,3e3)});try{const p=(await E(async()=>{const{default:m}=await import("./html2pdf-D9G4OvOy.js").then(h=>h.h);return{default:m}},__vite__mapDeps([0,1,2]))).default;await p().set({margin:[12,12,12,12],filename:`Смета №${t.id}.pdf`,image:{type:"jpeg",quality:.98},html2canvas:{scale:2,useCORS:!0,backgroundColor:"#ffffff",width:760,windowWidth:760,scrollX:0,scrollY:0},jsPDF:{unit:"mm",format:"a4",orientation:"portrait"},pagebreak:{mode:["css","legacy"],avoid:[".cat-block",".room-block"]}}).from(i).save()}finally{n.parentNode&&document.body.removeChild(n)}}function a(t){const o=document.createElement("div");return o.textContent=t??"",o.innerHTML}export{R as d,j as p};
