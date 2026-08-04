const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/html2pdf-C2iX0nMO.js","assets/index-CRHFJjfS.js","assets/index-Egz31E8f.css"])))=>i.map(i=>d[i]);
import{_ as C}from"./index-CRHFJjfS.js";const g=(t,a=0)=>{const e=typeof t=="string"?parseFloat(t):Number(t);return Number.isFinite(e)?e:a},m=t=>new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0}).format(g(t))+" ₽",$=t=>new Date(t).toLocaleDateString("ru-RU",{day:"numeric",month:"long",year:"numeric"}),E=t=>new Date(t).toLocaleString("ru-RU",{day:"numeric",month:"numeric",year:"numeric",hour:"2-digit",minute:"2-digit"});function w(t,a,e){const x=t.items||[],s=new Map;x.forEach(v=>{const u=v.room_name||"Без помещения";s.has(u)||s.set(u,[]),s.get(u).push(v)});const i=g(t.subtotal_amount??t.total_amount),l=g(t.discount_amount??0),n=Array.from(s.entries()).map(([v,u])=>{const b=new Map;u.forEach(f=>{const r=f.category||"Прочие работы";b.has(r)||b.set(r,[]),b.get(r).push(f)});const _=u.reduce((f,r)=>f+g(r.amount),0),k=Array.from(b.entries()).map(([f,r])=>{const z=r.reduce((d,y)=>d+g(y.amount),0),A=r.map((d,y)=>`
            <tr>
              <td class="num">${y+1}</td>
              <td>${o(d.name)}</td>
              <td class="center">${o(d.unit)}</td>
              <td class="center">${g(d.quantity)}</td>
              <td class="center">${g(d.times,1)}</td>
              <td class="right">${m(d.price)}</td>
              <td class="right amount">${m(d.amount)}</td>
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
              <tr class="cat-row"><td colspan="7">${o(f)}</td></tr>
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
        <h3 class="room-title">${o(v)}</h3>
        ${k}
        <div class="room-total">
          <div>
            <div class="room-total-label">Итоговая сумма по помещению</div>
            <div class="room-total-name">${o(v)}</div>
          </div>
          <div class="room-total-amount">${m(_)}</div>
        </div>
      </div>`}).join(""),h=`
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
  }
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
  @media print {
    .est-root { padding: 20px; }
    .no-print { display: none; }
    .cat-block { break-inside: avoid; }
    .room-block { break-inside: avoid; }
  }
`,c=`
  <div class="header">
    <div class="brand"><div class="brand-logo" style="background-image:url('${window.location.origin}/favicon.png')"></div>Fix<span>Key</span></div>
    <div class="doc-title">
      <h1>Смета № ${t.id}</h1>
      <p>от ${$(t.created_at)}</p>
    </div>
  </div>

  <div class="doc-subtitle">
    <h2>СМЕТА НА РАБОТЫ</h2>
    <p>Расчёт ремонтно-отделочных работ</p>
    ${t.contract_number?`<p>Приложение к договору № ${o(t.contract_number)}${t.contract_date?` от ${$(t.contract_date)}`:""}</p>`:""}
  </div>

  <hr class="thin" />

  <div class="info-grid">
    <div>
      <div class="label">ID объекта</div>
      <div class="value">${o(a.object_code)}</div>
    </div>
    <div>
      <div class="label">Заказчик</div>
      <div class="value">${o(a.client_name)}</div>
    </div>
    <div>
      <div class="label">Контактный телефон</div>
      <div class="value">${o(a.client_phone||"—")}</div>
    </div>
    <div>
      <div class="label">Характеристики объекта</div>
      <div class="value">${o(a.object_type)} · ${a.area} м²</div>
    </div>
  </div>

  ${n}

  <div class="summary">
    <div class="summary-box">
      ${l>0?`
      <div class="summary-row">
        <span>Сумма до скидки:</span>
        <span>${m(i)}</span>
      </div>
      <div class="summary-row discount">
        <span>Скидка:</span>
        <span>-${m(l)}</span>
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
    <div>${o(t.notes)}</div>
  </div>`:""}

  <hr class="thin" />

  <div class="parties">
    <div>
      <div class="label">Исполнитель</div>
      <div class="name">${o(t.company_name||e)}</div>
      ${t.company_phone?`<div class="contact">Тел: ${o(t.company_phone)}</div>`:""}
      ${t.company_email?`<div class="contact">Email: ${o(t.company_email)}</div>`:""}
      ${t.company_website?`<div class="contact">${o(t.company_website)}</div>`:""}
      ${t.company_inn?`<div class="contact">ИНН: ${o(t.company_inn)}</div>`:""}
      ${t.company_legal_address?`<div class="contact">${o(t.company_legal_address)}</div>`:""}
      ${t.company_signature_url?`<img class="signature" src="${t.company_signature_url}" alt="Подпись" />`:""}
    </div>
    <div>
      <div class="label">Заказчик</div>
      <div class="name">${o(a.client_name)}</div>
      ${a.client_phone?`<div class="contact">Тел: ${o(a.client_phone)}</div>`:""}
    </div>
  </div>

  <div class="signatures">
    <div class="signature-block">
      <div class="label">Исполнитель</div>
      <div class="signature-line">${o(t.company_name||e)}</div>
    </div>
    <div class="signature-block">
      <div class="label">Заказчик</div>
      <div class="signature-line">${o(a.client_name)}</div>
    </div>
  </div>

  <div class="footer">
    Сформировано ${E(new Date().toISOString())}
  </div>`,p=`Смета № ${t.id} — ${o(a.client_name)}`;return{styles:h,bodyContent:c,title:p}}function D(t,a,e){const{styles:x,bodyContent:s,title:i}=w(t,a,e),l=`<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8" />
<title>${i}</title>
<style>${x}</style>
</head>
<body>
<div class="est-root">${s}</div>
</body>
</html>`,n=window.open("","_blank","width=900,height=1000");n&&(n.document.open(),n.document.write(l),n.document.close(),n.onload=()=>{n.focus(),n.print()})}async function T(t,a,e){const{styles:x,bodyContent:s}=w(t,a,e),i=document.createElement("div");i.style.position="fixed",i.style.left="-10000px",i.style.top="0",i.style.width="850px",i.style.background="#ffffff";const l=document.createElement("style");l.textContent=x;const n=document.createElement("div");n.className="est-root",n.style.width="850px",n.style.margin="0",n.innerHTML=s,i.appendChild(l),i.appendChild(n),document.body.appendChild(i),await new Promise(c=>{const p=new Image;p.onload=()=>c(),p.onerror=()=>c(),p.src=`${window.location.origin}/favicon.png`,setTimeout(c,3e3)});const h=(await C(async()=>{const{default:c}=await import("./html2pdf-C2iX0nMO.js").then(p=>p.h);return{default:c}},__vite__mapDeps([0,1,2]))).default;await h().set({margin:[10,10,10,10],filename:`Смета №${t.id}.pdf`,image:{type:"jpeg",quality:.98},html2canvas:{scale:2,useCORS:!0,backgroundColor:"#ffffff"},jsPDF:{unit:"mm",format:"a4",orientation:"portrait"}}).from(n).save(),document.body.removeChild(i)}function o(t){const a=document.createElement("div");return a.textContent=t??"",a.innerHTML}export{T as d,D as p};
