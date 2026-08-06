const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/html2pdf-CtE5BASc.js","assets/index-B67-uGmA.js","assets/index-C7rVwvzy.css"])))=>i.map(i=>d[i]);
import{_ as C}from"./index-B67-uGmA.js";const g=(t,o=0)=>{const r=typeof t=="string"?parseFloat(t):Number(t);return Number.isFinite(r)?r:o},m=t=>new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0}).format(g(t))+" ₽",w=t=>new Date(t).toLocaleDateString("ru-RU",{day:"numeric",month:"long",year:"numeric"}),E=t=>new Date(t).toLocaleString("ru-RU",{day:"numeric",month:"numeric",year:"numeric",hour:"2-digit",minute:"2-digit"});function $(t,o,r){const u=t.items||[],s=new Map;u.forEach(x=>{const f=x.room_name||"Без помещения";s.has(f)||s.set(f,[]),s.get(f).push(x)});const e=g(t.subtotal_amount??t.total_amount),d=g(t.discount_amount??0),i=Array.from(s.entries()).map(([x,f])=>{const v=new Map;f.forEach(h=>{const l=h.category||"Прочие работы";v.has(l)||v.set(l,[]),v.get(l).push(h)});const _=f.reduce((h,l)=>h+g(l.amount),0),k=Array.from(v.entries()).map(([h,l])=>{const z=l.reduce((c,y)=>c+g(y.amount),0),A=l.map((c,y)=>`
            <tr>
              <td class="num">${y+1}</td>
              <td>${a(c.name)}</td>
              <td class="center">${a(c.unit)}</td>
              <td class="center">${g(c.quantity)}</td>
              <td class="center">${g(c.times,1)}</td>
              <td class="right">${m(c.price)}</td>
              <td class="right amount">${m(c.amount)}</td>
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
              <tr class="cat-row"><td colspan="7">${a(h)}</td></tr>
              ${A}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="6" class="right">Итого по категории</td>
                <td class="right amount">${m(z)}</td>
              </tr>
            </tfoot>
          </table>
        </div>`}).join("");return`
      <div class="room-block">
        <h3 class="room-title">${a(x)}</h3>
        ${k}
        <div class="room-total">
          <div>
            <div class="room-total-label">Итоговая сумма по помещению</div>
            <div class="room-total-name">${a(x)}</div>
          </div>
          <div class="room-total-amount">${m(_)}</div>
        </div>
      </div>`}).join(""),n=`
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
    color: #666;
    font-size: 13px;
  }
  .doc-subtitle h2 {
    font-size: 19px;
    margin: 0;
    letter-spacing: -0.3px;
  }
  .doc-subtitle p {
    margin: 4px 0 0;
    color: #666;
    font-size: 12px;
  }
  hr.thin {
    border: none;
    border-top: 1px solid #e5e5e5;
    margin: 20px 0;
  }
  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px 32px;
    background: #fafafa;
    border-radius: 10px;
    padding: 16px;
    margin-bottom: 24px;
    font-size: 13px;
  }
  .info-grid .label {
    color: #999;
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
    border: 1px solid #e5e5e5;
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
    background: #f3f3f3;
    color: #888;
    text-align: left;
    padding: 8px 10px;
    font-weight: 500;
    font-size: 10.5px;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }
  tbody td {
    padding: 8px 10px;
    border-top: 1px solid #f0f0f0;
  }
  .num { color: #aaa; width: 28px; }
  .center { text-align: center; }
  .right { text-align: right; }
  .amount { font-weight: 600; }
  .cat-row td {
    background: rgba(192, 138, 42, 0.1);
    color: #A9711F;
    font-weight: 600;
    font-size: 11px;
    border-top: none;
  }
  tfoot td {
    padding: 8px 10px;
    font-size: 12.5px;
    background: #fafafa;
    border-top: 1px solid #eee;
  }
  .room-total {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #F5EFE4;
    border-left: 4px solid #C08A2A;
    border-radius: 6px;
    padding: 12px 16px;
    margin-top: 10px;
  }
  .room-total-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #A9711F;
    font-weight: 700;
  }
  .room-total-name {
    font-size: 13px;
    color: #666;
    margin-top: 2px;
  }
  .room-total-amount {
    font-size: 18px;
    font-weight: 700;
    color: #A9711F;
  }
  .summary {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 24px;
  }
  .summary-box {
    width: 100%;
    max-width: 290px;
    background: #fafafa;
    border-radius: 10px;
    padding: 16px;
    font-size: 13px;
  }
  .summary-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 6px;
    color: #666;
  }
  .summary-row.discount { color: #A9711F; }
  .summary-total {
    display: flex;
    justify-content: space-between;
    font-size: 16px;
    font-weight: 700;
    padding-top: 8px;
    border-top: 1px solid #e5e5e5;
  }
  .notes {
    margin-bottom: 24px;
    font-size: 13px;
  }
  .notes .label {
    color: #999;
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
    color: #999;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
  }
  .parties .name { font-weight: 600; }
  .parties .contact { color: #888; font-size: 12px; margin-top: 2px; }
  .parties .signature { height: 40px; object-fit: contain; margin-top: 8px; }
  .signatures {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    margin-top: 32px;
    margin-bottom: 12px;
  }
  .signature-block .label {
    color: #999;
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
    color: #333;
  }
  .footer {
    text-align: right;
    font-size: 11px;
    color: #bbb;
    margin-top: 24px;
  }
  @page { size: A4 portrait; margin: 12mm 10mm; }
  @media print {
    html, body { width: 100%; margin: 0; padding: 0; background: #fff; }
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

  ${i}

  <div class="summary">
    <div class="summary-box">
      ${d>0?`
      <div class="summary-row">
        <span>Сумма до скидки:</span>
        <span>${m(e)}</span>
      </div>
      <div class="summary-row discount">
        <span>Скидка:</span>
        <span>-${m(d)}</span>
      </div>`:""}
      <div class="summary-total">
        <span>ИТОГО К ОПЛАТЕ:</span>
        <span>${m(t.total_amount)}</span>
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
      <div class="name">${a(t.company_name||r)}</div>
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
      <div class="signature-line">${a(t.company_name||r)}</div>
    </div>
    <div class="signature-block">
      <div class="label">Заказчик</div>
      <div class="signature-line">${a(o.client_name)}</div>
    </div>
  </div>

  <div class="footer">
    Сформировано ${E(new Date().toISOString())}
  </div>`,b=`Смета № ${t.id} — ${a(o.client_name)}`;return{styles:n,bodyContent:p,title:b}}function T(t,o,r){const{styles:u,bodyContent:s,title:e}=$(t,o,r),d=`<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8" />
<title>${e}</title>
<style>${u}</style>
</head>
<body>
<div class="est-root">${s}</div>
</body>
</html>`,i=window.open("","_blank","width=900,height=1000");i&&(i.document.open(),i.document.write(d),i.document.close(),i.onload=()=>{i.focus(),i.print()})}function F(t,o){return t.replace(/@page[^{]*\{[^}]*\}/g,"").replace(/@media\s+print\s*\{(?:[^{}]*\{[^}]*\})*[^{}]*\}/g,"").replace(/(^|\})\s*([^{}@]+)\s*\{/g,(u,s,e)=>{const d=e.split(",").map(i=>{const n=i.trim();return n?n==="*"?`${o} *`:/^(html|body)$/i.test(n)?o:`${o} ${n}`:""}).filter(Boolean).join(", ");return`${s} ${d} {`})}async function R(t,o,r){const{styles:u,bodyContent:s}=$(t,o,r),e=document.createElement("div");e.style.position="fixed",e.style.left="-10000px",e.style.top="0",e.style.width="760px",e.style.background="#ffffff",e.id="pdf-scope-estimate";const d=document.createElement("style");d.textContent=F(u,"#pdf-scope-estimate");const i=document.createElement("div");i.className="est-root",i.style.width="760px",i.style.maxWidth="760px",i.style.padding="0",i.style.margin="0",i.innerHTML=s,e.appendChild(d),e.appendChild(i),document.body.appendChild(e),await new Promise(n=>{const p=new Image;p.onload=()=>n(),p.onerror=()=>n(),p.src=`${window.location.origin}/favicon.png`,setTimeout(n,3e3)});try{const n=(await C(async()=>{const{default:p}=await import("./html2pdf-CtE5BASc.js").then(b=>b.h);return{default:p}},__vite__mapDeps([0,1,2]))).default;await n().set({margin:[8,8,8,8],filename:`Смета №${t.id}.pdf`,image:{type:"jpeg",quality:.98},html2canvas:{scale:2,useCORS:!0,backgroundColor:"#ffffff",width:760,windowWidth:760,scrollX:0,scrollY:0},jsPDF:{unit:"mm",format:"a4",orientation:"portrait"},pagebreak:{mode:["css","legacy"],avoid:[".cat-block",".room-block"]}}).from(i).save()}finally{e.parentNode&&document.body.removeChild(e)}}function a(t){const o=document.createElement("div");return o.textContent=t??"",o.innerHTML}export{R as d,T as p};
