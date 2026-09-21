const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/html2pdf-DKoKh7fY.js","assets/index-DnHzr_e0.js","assets/index-DFE3NpF0.css"])))=>i.map(i=>d[i]);
import{_ as D}from"./index-DnHzr_e0.js";const b=(t,o=0)=>{const a=typeof t=="string"?parseFloat(t):Number(t);return Number.isFinite(a)?a:o},g=t=>new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0}).format(b(t))+" ₽",y=t=>new Date(t).toLocaleDateString("ru-RU",{day:"numeric",month:"long",year:"numeric"}),S=t=>new Date(t).toLocaleString("ru-RU",{day:"numeric",month:"numeric",year:"numeric",hour:"2-digit",minute:"2-digit"}),$=t=>String(t??"").replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\r?\n/g," ");function _(t,o,a){const l=t.items||[],d=new Map;l.forEach(h=>{const u=h.room_name||"Без помещения";d.has(u)||d.set(u,[]),d.get(u).push(h)});const r=b(t.subtotal_amount??t.total_amount),i=b(t.discount_amount??0),n=Array.from(d.entries()).map(([h,u])=>{const v=new Map;u.forEach(x=>{const c=x.category||"Прочие работы";v.has(c)||v.set(c,[]),v.get(c).push(x)});const A=u.reduce((x,c)=>x+b(c.amount),0),z=Array.from(v.entries()).map(([x,c])=>{const C=c.reduce((p,w)=>p+b(w.amount),0),E=c.map((p,w)=>`
            <tr>
              <td class="num">${w+1}</td>
              <td>${e(p.name)}</td>
              <td class="center">${e(p.unit)}</td>
              <td class="center">${b(p.quantity)}</td>
              <td class="center">${b(p.times,1)}</td>
              <td class="right">${g(p.price)}</td>
              <td class="right amount">${g(p.amount)}</td>
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
              <tr class="cat-row"><td colspan="7">${e(x)}</td></tr>
              ${E}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="6" class="right">Итого по категории</td>
                <td class="right amount">${g(C)}</td>
              </tr>
            </tfoot>
          </table>
        </div>`}).join("");return`
      <div class="room-block">
        <h3 class="room-title">${e(h)}</h3>
        ${z}
        <div class="room-total">
          <div>
            <div class="room-total-label">Итоговая сумма по помещению</div>
            <div class="room-total-name">${e(h)}</div>
          </div>
          <div class="room-total-amount">${g(A)}</div>
        </div>
      </div>`}).join(""),s=`
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
  thead th:nth-child(1) { width: 34px; }
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
  .num { color: #1a1a1a; width: 34px; white-space: nowrap; word-break: normal; }
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
  /* Колонтитулы: на каждом листе сверху номер сметы и заказчик,
     снизу — "Страница N из M", чтобы распечатанные листы не путались */
  @page {
    size: A4 portrait;
    margin: 16mm 10mm 14mm;
    @top-left {
      content: "${$(`Смета № ${t.id} от ${y(t.created_at)}`)}";
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 8.5pt;
      color: #6B4508;
    }
    @top-right {
      content: "${$(o.client_name||a)}";
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 8.5pt;
      color: #6B4508;
    }
    @bottom-center {
      content: "Страница " counter(page) " из " counter(pages);
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 8.5pt;
      color: #555555;
    }
  }
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

    /* Таблице разрешаем переноситься между страницами: иначе длинная
       категория целиком уезжает на следующий лист и оставляет
       полстраницы пустоты. Рвём только между строками. */
    .cat-block {
      break-inside: auto;
      overflow: visible;
      /* Рамка и скругление рисуются на каждом куске отдельно,
         поэтому продолжение на новой странице выглядит так же,
         как начало таблицы на первой. */
      -webkit-box-decoration-break: clone;
      box-decoration-break: clone;
    }
    .room-block { break-inside: auto; }
    /* Скругляем углы самой шапки — она повторяется на каждой странице */
    thead th:first-child { border-top-left-radius: 9px; }
    thead th:last-child { border-top-right-radius: 9px; }
    table { break-inside: auto; }
    tr, .cat-row, tfoot tr { break-inside: avoid; }

    /* Шапка таблицы повторяется на каждой новой странице,
       чтобы был виден перечень колонок: Ед., Кол-во, Цена и т.д. */
    thead { display: table-header-group; }
    tfoot { display: table-row-group; }

    /* Не отрываем заголовок помещения и название категории от их строк */
    .room-title { break-after: avoid; }
    .cat-row { break-after: avoid; }
    .room-total { break-before: avoid; }

    /* Одинокая строка внизу или вверху листа смотрится неряшливо */
    tbody { orphans: 3; widows: 3; }

    table { width: 100%; table-layout: fixed; }
    td, th { overflow-wrap: break-word; word-break: break-word; }
    thead th:nth-child(1) { width: 6%; }
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
`,m=`
  <div class="header">
    <div class="brand"><img class="brand-logo" src="${window.location.origin}/logo-print.png" alt="FixKey"/>Fix<span>Key</span></div>
    <div class="doc-title">
      <h1>Смета № ${t.id}</h1>
      <p>от ${y(t.created_at)}</p>
    </div>
  </div>

  <div class="doc-subtitle">
    <h2>СМЕТА НА РАБОТЫ</h2>
    <p>Расчёт ремонтно-отделочных работ</p>
    ${t.contract_number?`<p>Приложение к договору № ${e(t.contract_number)}${t.contract_date?` от ${y(t.contract_date)}`:""}</p>`:""}
  </div>

  <hr class="thin" />

  <div class="info-grid">
    <div>
      <div class="label">ID объекта</div>
      <div class="value">${e(o.object_code)}</div>
    </div>
    <div>
      <div class="label">Заказчик</div>
      <div class="value">${e(o.client_name)}</div>
    </div>
    <div>
      <div class="label">Контактный телефон</div>
      <div class="value">${e(o.client_phone||"—")}</div>
    </div>
    <div>
      <div class="label">Характеристики объекта</div>
      <div class="value">${e(o.object_type)} · ${o.area} м²</div>
    </div>
  </div>

  ${n}

  <div class="summary">
    <div class="summary-box">
      ${i>0?`
      <div class="summary-row">
        <span>Сумма до скидки:</span>
        <span>${g(r)}</span>
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
    <div>${e(t.notes)}</div>
  </div>`:""}

  <hr class="thin" />

  <div class="parties">
    <div>
      <div class="label">Исполнитель</div>
      <div class="name">${e(t.company_name||a)}</div>
      ${t.company_phone?`<div class="contact">Тел: ${e(t.company_phone)}</div>`:""}
      ${t.company_email?`<div class="contact">Email: ${e(t.company_email)}</div>`:""}
      ${t.company_website?`<div class="contact">${e(t.company_website)}</div>`:""}
      ${t.company_inn?`<div class="contact">ИНН: ${e(t.company_inn)}</div>`:""}
      ${t.company_legal_address?`<div class="contact">${e(t.company_legal_address)}</div>`:""}
      ${t.company_signature_url?`<img class="signature" src="${t.company_signature_url}" alt="Подпись" />`:""}
    </div>
    <div>
      <div class="label">Заказчик</div>
      <div class="name">${e(o.client_name)}</div>
      ${o.client_phone?`<div class="contact">Тел: ${e(o.client_phone)}</div>`:""}
    </div>
  </div>

  <div class="signatures">
    <div class="signature-block">
      <div class="label">Исполнитель</div>
      <div class="signature-line">${e(t.company_name||a)}</div>
    </div>
    <div class="signature-block">
      <div class="label">Заказчик</div>
      <div class="signature-line">${e(o.client_name)}</div>
    </div>
  </div>

  <div class="footer">
    Сформировано ${S(new Date().toISOString())}
  </div>`,f=`Смета № ${t.id} — ${e(o.client_name)}`;return{styles:s,bodyContent:m,title:f}}function B(t,o,a){const{styles:l,bodyContent:d,title:r}=_(t,o,a),i=`<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8" />
<title>${r}</title>
<style>${l}</style>
</head>
<body>
<div class="est-root">${d}</div>
</body>
</html>`,n=window.open("","_blank","width=900,height=1000");n&&(n.document.open(),n.document.write(i),n.document.close(),n.onload=()=>{n.focus(),n.print()})}function k(t,o){let a=t;for(;;){const l=o.exec(a);if(!l)return a;const d=a.indexOf("{",l.index);if(d===-1)return a;let r=0,i=-1;for(let n=d;n<a.length;n++)if(a[n]==="{")r++;else if(a[n]==="}"&&(r--,r===0)){i=n;break}if(i===-1)return a;a=a.slice(0,l.index)+a.slice(i+1),o.lastIndex=0}}function j(t,o){return k(k(t,/@page\b/g),/@media\s+print\b/g).replace(/(^|\})\s*([^{}@]+)\s*\{/g,(l,d,r)=>{const i=r.split(",").map(n=>{const s=n.trim();return s?s==="*"?`${o}, ${o} *`:/^(html|body)$/i.test(s)||s===".est-root"?o:s.startsWith(".est-root ")?`${o} ${s.slice(10)}`:`${o} ${s}`:""}).filter(Boolean).join(", ");return`${d} ${i} {`})}async function F(t,o,a){const{styles:l,bodyContent:d}=_(t,o,a),r=document.createElement("div");r.style.position="fixed",r.style.left="-10000px",r.style.top="0",r.style.width="760px",r.style.background="#ffffff";const i=document.createElement("div");i.id="pdf-scope-estimate",i.className="est-root",i.style.width="760px",i.style.maxWidth="760px",i.style.padding="0",i.style.margin="0",i.style.background="#ffffff";const n=document.createElement("style");n.textContent=j(l,"#pdf-scope-estimate"),i.appendChild(n);const s=document.createElement("div");s.innerHTML=d,i.appendChild(s),r.appendChild(i),document.body.appendChild(r),await new Promise(m=>{const f=new Image;f.onload=()=>m(),f.onerror=()=>m(),f.src=`${window.location.origin}/logo-print.png`,setTimeout(m,3e3)});try{const m=(await D(async()=>{const{default:f}=await import("./html2pdf-DKoKh7fY.js").then(h=>h.h);return{default:f}},__vite__mapDeps([0,1,2]))).default;await m().set({margin:[12,12,12,12],filename:`Смета №${t.id}.pdf`,image:{type:"jpeg",quality:.98},html2canvas:{scale:2,useCORS:!0,backgroundColor:"#ffffff",width:760,windowWidth:760,scrollX:0,scrollY:0},jsPDF:{unit:"mm",format:"a4",orientation:"portrait"},pagebreak:{mode:["css","legacy"],avoid:[".cat-block",".room-block"]}}).from(i).save()}finally{r.parentNode&&document.body.removeChild(r)}}function e(t){const o=document.createElement("div");return o.textContent=t??"",o.innerHTML}export{F as d,B as p};
