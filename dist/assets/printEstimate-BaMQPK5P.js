const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/html2pdf-DeifUNEZ.js","assets/index-Dl5s2JgI.js","assets/index-L2L8Rqo-.css"])))=>i.map(i=>d[i]);
import{_ as j}from"./index-Dl5s2JgI.js";const x=(t,o=0)=>{const n=typeof t=="string"?parseFloat(t):Number(t);return Number.isFinite(n)?n:o},b=t=>new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0}).format(x(t))+" ₽",k=t=>new Date(t).toLocaleDateString("ru-RU",{day:"numeric",month:"long",year:"numeric"});function z(t,o,n){const p=t.items||[],l=new Map;p.forEach(h=>{const y=h.room_name||"Без помещения";l.has(y)||l.set(y,[]),l.get(y).push(h)});const c=x(t.subtotal_amount??t.total_amount),e=x(t.discount_amount??0),i=Array.from(l.entries()).map(([h,y])=>{const _=new Map;y.forEach(w=>{const g=w.category||"Прочие работы";_.has(g)||_.set(g,[]),_.get(g).push(w)});const C=y.reduce((w,g)=>w+x(g.amount),0),B=Array.from(_.entries()).map(([w,g])=>{const T=g.reduce((u,$)=>u+x($.amount),0),P=g.map((u,$)=>`
            <tr>
              <td class="num">${$+1}</td>
              <td>${a(u.name)}</td>
              <td class="center">${a(u.unit)}</td>
              <td class="center">${x(u.quantity)}</td>
              <td class="center">${x(u.times,1)}</td>
              <td class="right">${b(u.price)}</td>
              <td class="right amount">${b(u.amount)}</td>
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
              <tr class="cat-row"><td colspan="7">${a(w)}</td></tr>
              ${P}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="6" class="right">Итого по категории</td>
                <td class="right amount">${b(T)}</td>
              </tr>
            </tfoot>
          </table>
        </div>`}).join("");return`
      <div class="room-block">
        <h3 class="room-title">${a(h)}</h3>
        ${B}
        <div class="room-total">
          <div>
            <div class="room-total-label">Итоговая сумма по помещению</div>
            <div class="room-total-name">${a(h)}</div>
          </div>
          <div class="room-total-amount">${b(C)}</div>
        </div>
      </div>`}).join(""),d=`
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
    background: #B9A27A;
    color: #1F1405;
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
    background: #B9A27A;
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
    margin: 14mm 12mm 14mm 16mm;
    @top-left { content: ""; }
    @top-center { content: ""; }
    @top-right { content: ""; }
    @bottom-left { content: ""; }
    @bottom-center { content: ""; }
    @bottom-right {
      content: "Стр. " counter(page) " из " counter(pages);
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 8.5pt;
      color: #555555;
    }
  }
  .sign-row { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 36px; page-break-inside: avoid; break-inside: avoid; }
  .sign-col .label { color: #4A2E06; font-size: 11.5px; font-weight: 700; letter-spacing: 0.4px; margin-bottom: 6px; text-transform: uppercase; }
  .sign-box { position: relative; height: 84px; border-bottom: 1.5px solid #5C3A11; margin-bottom: 4px; }
  .sign-box .sig { position: absolute; left: 10px; bottom: 4px; height: 62px; max-width: 200px; object-fit: contain; }
  .sign-box .stamp { position: absolute; right: 0; top: 88px; height: 118px; width: 118px; object-fit: contain; opacity: 0.9; }
  .sign-col .who { font-size: 13px; color: #1a1a1a; }
  .sign-col .hint { font-size: 11px; color: #555; margin-top: 2px; }
  .sign-col.with-stamp { padding-bottom: 80px; }
  .parties, .info-grid, .summary, .notes, .room-total { page-break-inside: avoid; break-inside: avoid; }
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
    .cat-row td { background: #B9A27A !important; color: #1F1405 !important; }
    .room-total { background: #B9A27A !important; border: 1.5px solid #7A4E10 !important; border-left: 5px solid #5C3A11 !important; }
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
`,m=t.estimate_number||String(t.id),s=!!(t.apply_signature&&t.company_signature_url),r=!!(t.apply_stamp&&t.company_stamp_url),v=`
  <div class="header">
    <div class="brand"><img class="brand-logo" src="${window.location.origin}/logo-print.png" alt="FixKey"/><b class="brand-word">Fix<span>Key</span></b></div>
    <div class="doc-title">
      <h1>Смета № ${a(m)}</h1>
      <p>от ${k(t.created_at)}</p>
    </div>
  </div>

  <div class="doc-subtitle">
    <h2>СМЕТА НА РАБОТЫ</h2>
    <p>Расчёт ремонтно-отделочных работ</p>
    ${t.contract_number?`<p>Приложение к договору № ${a(t.contract_number)}${t.contract_date?` от ${k(t.contract_date)}`:""}</p>`:""}
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
      ${e>0?`
      <div class="summary-row">
        <span>Сумма до скидки:</span>
        <span>${b(c)}</span>
      </div>
      <div class="summary-row discount">
        <span>Скидка:</span>
        <span>-${b(e)}</span>
      </div>`:""}
      <div class="summary-total">
        <span>ИТОГО К ОПЛАТЕ:</span>
        <span>${b(t.total_amount)}</span>
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
      <div class="name">${a(/предприним/i.test(t.company_entity_type||"")&&t.company_contact_full_name?`ИП ${t.company_contact_full_name}`:t.company_name||n)}</div>
      ${t.company_ogrn&&/предприним|юрид/i.test(t.company_entity_type||"")?`<div class="contact">${/юрид/i.test(t.company_entity_type||"")?"ОГРН":"ОГРНИП"}: ${a(t.company_ogrn)}</div>`:""}
      ${t.company_inn?`<div class="contact">ИНН: ${a(t.company_inn)}</div>`:""}
      ${t.company_kpp&&/юрид/i.test(t.company_entity_type||"")?`<div class="contact">КПП: ${a(t.company_kpp)}</div>`:""}
      ${t.company_legal_address?`<div class="contact">Адрес: ${a(t.company_legal_address)}</div>`:""}
      ${t.company_phone?`<div class="contact">Тел.: ${a(t.company_phone)}</div>`:""}
      ${t.company_email?`<div class="contact">Email: ${a(t.company_email)}</div>`:""}
      ${t.company_website?`<div class="contact">Сайт: ${a(t.company_website)}</div>`:""}
      ${t.company_bank_name?`<div class="contact">Банк: ${a(t.company_bank_name)}</div>`:""}
      ${t.company_bik?`<div class="contact">БИК: ${a(t.company_bik)}</div>`:""}
      ${t.company_account_number?`<div class="contact">Р/с: ${a(t.company_account_number)}</div>`:""}
      ${t.company_correspondent_account?`<div class="contact">К/с: ${a(t.company_correspondent_account)}</div>`:""}
    </div>
    <div>
      <div class="label">Заказчик</div>
      <div class="name">${a(o.client_name)}</div>
      ${o.client_phone?`<div class="contact">Тел.: ${a(o.client_phone)}</div>`:""}
      ${o.email||t.email?`<div class="contact">Email: ${a(o.email||t.email||"")}</div>`:""}
      ${o.address||t.address?`<div class="contact">Адрес объекта: ${a(o.address||t.address||"")}</div>`:""}
    </div>
  </div>

  <div class="sign-row">
    <div class="sign-col${r?" with-stamp":""}">
      <div class="label">От имени Исполнителя</div>
      <div class="sign-box">
        ${s?`<img class="sig" src="${a(t.company_signature_url||"")}" crossorigin="anonymous" alt=""/>`:""}
        ${r?`<img class="stamp" src="${a(t.company_stamp_url||"")}" crossorigin="anonymous" alt=""/>`:""}
      </div>
      <div class="who">${a(t.company_contact_full_name||t.company_name||n)}</div>
      <div class="hint">(подпись)</div>
    </div>
    <div class="sign-col">
      <div class="label">От имени Заказчика</div>
      <div class="sign-box"></div>
      <div class="who">${a(o.client_name)}</div>
      <div class="hint">(подпись)</div>
    </div>
  </div>`,f=`Смета № ${a(m)} — ${a(o.client_name)}`;return{styles:d,bodyContent:v,title:f}}function D(t,o,n){const{styles:p,bodyContent:l,title:c}=z(t,o,n),e=`<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8" />
<title>${c}</title>
<style>${p}</style>
</head>
<body>
<div class="est-root">${l}</div>
</body>
</html>`,i=window.open("","_blank","width=900,height=1000");if(!i)return;i.document.open(),i.document.write(e),i.document.close();let d=!1;const m=()=>{d||(d=!0,i.focus(),i.print())},s=()=>{const r=Array.from(i.document.images).filter(f=>!f.complete);if(!r.length)return setTimeout(m,200);let v=r.length;r.forEach(f=>{const h=()=>{v-=1,v<=0&&setTimeout(m,200)};f.addEventListener("load",h,{once:!0}),f.addEventListener("error",h,{once:!0})}),setTimeout(m,5e3)};i.document.readyState==="complete"?s():i.onload=s}function A(t,o){let n=t;for(;;){const p=o.exec(n);if(!p)return n;const l=n.indexOf("{",p.index);if(l===-1)return n;let c=0,e=-1;for(let i=l;i<n.length;i++)if(n[i]==="{")c++;else if(n[i]==="}"&&(c--,c===0)){e=i;break}if(e===-1)return n;n=n.slice(0,p.index)+n.slice(e+1),o.lastIndex=0}}function F(t,o){return A(A(t,/@page\b/g),/@media\s+print\b/g).replace(/(^|\})\s*([^{}@]+)\s*\{/g,(p,l,c)=>{const e=c.split(",").map(i=>{const d=i.trim();return d?d==="*"?`${o}, ${o} *`:/^(html|body)$/i.test(d)||d===".est-root"?o:d.startsWith(".est-root ")?`${o} ${d.slice(10)}`:`${o} ${d}`:""}).filter(Boolean).join(", ");return`${l} ${e} {`})}async function L(t,o,n){await E(t,o,n,"save")}async function R(t,o,n){return await E(t,o,n,"base64")||""}async function E(t,o,n,p){const{styles:l,bodyContent:c}=z(t,o,n),e=document.createElement("div");e.style.position="fixed",e.style.left="-10000px",e.style.top="0",e.style.width="760px",e.style.background="#ffffff";const i=document.createElement("div");i.id="pdf-scope-estimate",i.className="est-root",i.style.width="760px",i.style.maxWidth="760px",i.style.padding="0",i.style.margin="0",i.style.background="#ffffff";const d=document.createElement("style");d.textContent=F(l,"#pdf-scope-estimate"),i.appendChild(d);const m=document.createElement("div");m.innerHTML=c,i.appendChild(m),e.appendChild(i),document.body.appendChild(e),await new Promise(s=>{const r=new Image;r.onload=()=>s(),r.onerror=()=>s(),r.src=`${window.location.origin}/logo-print.png`,setTimeout(s,3e3)}),await Promise.all(Array.from(i.querySelectorAll("img")).map(s=>new Promise(r=>{if(s.complete)return r();s.addEventListener("load",()=>r(),{once:!0}),s.addEventListener("error",()=>r(),{once:!0}),setTimeout(r,4e3)})));try{const s=(await j(async()=>{const{default:v}=await import("./html2pdf-DeifUNEZ.js").then(f=>f.h);return{default:v}},__vite__mapDeps([0,1,2]))).default,r=s().set({margin:[12,12,12,12],filename:`Смета №${t.estimate_number||t.id}.pdf`,image:{type:"jpeg",quality:.98},html2canvas:{scale:2,useCORS:!0,backgroundColor:"#ffffff",width:760,windowWidth:760,scrollX:0,scrollY:0},jsPDF:{unit:"mm",format:"a4",orientation:"portrait"},pagebreak:{mode:["css","legacy"],avoid:["tr",".room-total",".sign-row",".summary",".parties"]}}).from(i);if(p==="save"){await r.save();return}return await r.outputPdf("datauristring")}finally{e.parentNode&&document.body.removeChild(e)}}function a(t){const o=document.createElement("div");return o.textContent=t??"",o.innerHTML}export{L as d,R as e,D as p};
