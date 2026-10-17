import{r as R}from"./pdfRender-BKvtECRR.js";const f=(t,o=0)=>{const a=typeof t=="string"?parseFloat(t):Number(t);return Number.isFinite(a)?a:o},h=t=>new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0}).format(f(t))+" ₽",z=t=>new Date(t).toLocaleDateString("ru-RU",{day:"numeric",month:"long",year:"numeric"});function E(t){return(t||"").replace(/\s+/g,"").replace(/(\d{4})(?=\d)/g,"$1 ")}function d(t,o,a=""){return o?`<tr class="${a.includes("hl")?"hl":""}"><td class="rk">${t}</td><td class="rv${a.includes("acc")?" acc":""}">${r(o)}</td></tr>`:""}function A(t,o,a){const s=t.items||[],e=new Map;s.forEach(c=>{const y=c.room_name||"Без помещения";e.has(y)||e.set(y,[]),e.get(y).push(c)});const l=f(t.subtotal_amount??t.total_amount),n=f(t.discount_amount??0),i=Array.from(e.entries()).map(([c,y])=>{const $=new Map;y.forEach(v=>{const m=v.category||"Прочие работы";$.has(m)||$.set(m,[]),$.get(m).push(v)});const D=y.reduce((v,m)=>v+f(m.amount),0),S=Array.from($.entries()).map(([v,m])=>{const T=m.reduce((b,_)=>b+f(_.amount),0),P=m.map((b,_)=>`
            <tr>
              <td class="num">${_+1}</td>
              <td>${r(b.name)}</td>
              <td class="center">${r(b.unit)}</td>
              <td class="center">${f(b.quantity)}</td>
              <td class="center">${f(b.times,1)}</td>
              <td class="right">${h(b.price)}</td>
              <td class="right amount">${h(b.amount)}</td>
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
              <tr class="cat-row"><td colspan="7">${r(v)}</td></tr>
              ${P}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="6" class="right">Итого по категории</td>
                <td class="right amount">${h(T)}</td>
              </tr>
            </tfoot>
          </table>
        </div>`}).join("");return`
      <div class="room-block">
        <h3 class="room-title">${r(c)}</h3>
        ${S}
        <div class="room-total">
          <div>
            <div class="room-total-label">Итоговая сумма по помещению</div>
            <div class="room-total-name">${r(c)}</div>
          </div>
          <div class="room-total-amount">${h(D)}</div>
        </div>
      </div>`}).join(""),p=`
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
  .parties { align-items: start; gap: 16px; }
  .party-card { border: 1.2px solid #6B4508; border-radius: 10px; overflow: hidden; break-inside: avoid; page-break-inside: avoid; }
  .party-head { background: #B9A27A; color: #1F1405; padding: 7px 12px; font-weight: 700; font-size: 11.5px; letter-spacing: .4px; text-transform: uppercase; }
  table.party-table { width: 100%; border-collapse: collapse; table-layout: auto; margin-bottom: 6px; }
  .party-table td { padding: 4px 12px; border: none !important; vertical-align: top; }
  .party-table .party-name { padding-top: 8px; font-weight: 700; font-size: 13px; }
  .party-table .rk { width: 36%; color: #6b5a3e; font-size: 11px; }
  .party-table .rv { font-weight: 600; font-size: 12.5px; word-break: break-word; }
  .party-table .acc { font-family: "Courier New", monospace; font-size: 13px; letter-spacing: .3px; }
  .party-table tr.hl td { background: #F3EBDC; }
  .party-table .bank-sub { padding-top: 8px; border-top: 1px solid #D9C9A8 !important; font-size: 10.5px; font-weight: 700; letter-spacing: .4px; color: #6B4508; text-transform: uppercase; }
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
  .sign-col.with-stamp { padding-bottom: 80px; }
  .sign-col .who { font-size: 13px; color: #1a1a1a; }
  .sign-col .hint { font-size: 11px; color: #555; margin-top: 2px; }
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
`,g=t.estimate_number||String(t.id),w=!!(t.apply_signature&&t.company_signature_url),x=!!(t.apply_stamp&&t.company_stamp_url),k=`
  <div class="header">
    <div class="brand"><img class="brand-logo" src="${window.location.origin}/logo-print.png" alt="FixKey"/><b class="brand-word">Fix<span>Key</span></b></div>
    <div class="doc-title">
      <h1>Смета № ${r(g)}</h1>
      <p>от ${z(t.created_at)}</p>
    </div>
  </div>

  <div class="doc-subtitle">
    <h2>СМЕТА НА РАБОТЫ</h2>
    <p>Расчёт ремонтно-отделочных работ</p>
    ${t.contract_number?`<p>Приложение к договору № ${r(t.contract_number)}${t.contract_date?` от ${z(t.contract_date)}`:""}</p>`:""}
  </div>

  <hr class="thin" />

  <div class="info-grid">
    <div>
      <div class="label">ID объекта</div>
      <div class="value">${r(o.object_code)}</div>
    </div>
    <div>
      <div class="label">Заказчик</div>
      <div class="value">${r(o.client_name)}</div>
    </div>
    <div>
      <div class="label">Контактный телефон</div>
      <div class="value">${r(o.client_phone||"—")}</div>
    </div>
    <div>
      <div class="label">Характеристики объекта</div>
      <div class="value">${r(o.object_type)} · ${o.area} м²</div>
    </div>
  </div>

  ${i}

  <div class="summary">
    <div class="summary-box">
      ${n>0?`
      <div class="summary-row">
        <span>Сумма до скидки:</span>
        <span>${h(l)}</span>
      </div>
      <div class="summary-row discount">
        <span>Скидка:</span>
        <span>-${h(n)}</span>
      </div>`:""}
      <div class="summary-total">
        <span>ИТОГО К ОПЛАТЕ:</span>
        <span>${h(t.total_amount)}</span>
      </div>
    </div>
  </div>

  ${t.notes?`
  <div class="notes">
    <div class="label">Примечания</div>
    <div>${r(t.notes)}</div>
  </div>`:""}

  <hr class="thin" />

  <div class="parties">
    <div class="party-card">
      <div class="party-head">Исполнитель</div>
      <table class="party-table">
        <tr><td colspan="2" class="party-name">${r(/предприним/i.test(t.company_entity_type||"")&&t.company_contact_full_name?`ИП ${t.company_contact_full_name}`:t.company_name||a)}</td></tr>
        ${t.company_ogrn&&/предприним|юрид/i.test(t.company_entity_type||"")?d(/юрид/i.test(t.company_entity_type||"")?"ОГРН":"ОГРНИП",t.company_ogrn):""}
        ${d("ИНН",t.company_inn)}
        ${/юрид/i.test(t.company_entity_type||"")?d("КПП",t.company_kpp):""}
        ${d("Адрес",t.company_legal_address)}
        ${d("Телефон",t.company_phone)}
        ${d("E-mail",t.company_email)}
        ${d("Сайт",t.company_website)}
        ${t.company_account_number||t.company_bank_name?'<tr><td colspan="2" class="bank-sub">Банковские реквизиты</td></tr>':""}
        ${d("Расчётный счёт",E(t.company_account_number),"acc hl")}
        ${d("Банк",t.company_bank_name)}
        ${d("БИК",t.company_bik,"acc")}
        ${d("Корр. счёт",E(t.company_correspondent_account),"acc")}
      </table>
    </div>
    <div class="party-card">
      <div class="party-head">Заказчик</div>
      <table class="party-table">
        <tr><td colspan="2" class="party-name">${r(o.client_name)}</td></tr>
        ${d("Телефон",o.client_phone)}
        ${d("E-mail",o.email||t.email)}
        ${d("Адрес объекта",o.address||t.address)}
      </table>
    </div>
  </div>

  <div class="sign-row">
    <div class="sign-col${x?" with-stamp":""}">
      <div class="label">От имени Исполнителя</div>
      <div class="sign-box">
        ${w?`<img class="sig" src="${r(t.company_signature_url||"")}" crossorigin="anonymous" alt=""/>`:""}
        ${x?`<img class="stamp" src="${r(t.company_stamp_url||"")}" crossorigin="anonymous" alt=""/>`:""}
      </div>
      <div class="who">${r(t.company_contact_full_name||t.company_name||a)}</div>
      <div class="hint">(подпись)</div>
    </div>
    <div class="sign-col">
      <div class="label">От имени Заказчика</div>
      <div class="sign-box"></div>
      <div class="who">${r(o.client_name)}</div>
      <div class="hint">(подпись)</div>
    </div>
  </div>`,u=`Смета № ${r(g)} — ${r(o.client_name)}`;return{styles:p,bodyContent:k,title:u}}function M(t,o,a){const{styles:s,bodyContent:e,title:l}=A(t,o,a),n=`<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8" />
<title>${l}</title>
<style>${s}</style>
</head>
<body>
<div class="est-root">${e}</div>
</body>
</html>`,i=window.open("","_blank","width=900,height=1000");if(!i)return;i.document.open(),i.document.write(n),i.document.close();let p=!1;const g=()=>{p||(p=!0,i.focus(),i.print())},w=()=>{const x=Array.from(i.document.images).filter(u=>!u.complete);if(!x.length)return setTimeout(g,200);let k=x.length;x.forEach(u=>{const c=()=>{k-=1,k<=0&&setTimeout(g,200)};u.addEventListener("load",c,{once:!0}),u.addEventListener("error",c,{once:!0})}),setTimeout(g,5e3)};i.document.readyState==="complete"?w():i.onload=w}function C(t,o){let a=t;for(;;){const s=o.exec(a);if(!s)return a;const e=a.indexOf("{",s.index);if(e===-1)return a;let l=0,n=-1;for(let i=e;i<a.length;i++)if(a[i]==="{")l++;else if(a[i]==="}"&&(l--,l===0)){n=i;break}if(n===-1)return a;a=a.slice(0,s.index)+a.slice(n+1),o.lastIndex=0}}function B(t,o){return C(C(t,/@page\b/g),/@media\s+print\b/g).replace(/(^|\})\s*([^{}@]+)\s*\{/g,(s,e,l)=>{const n=l.split(",").map(i=>{const p=i.trim();return p?p==="*"?`${o}, ${o} *`:/^(html|body)$/i.test(p)||p===".est-root"?o:p.startsWith(".est-root ")?`${o} ${p.slice(10)}`:`${o} ${p}`:""}).filter(Boolean).join(", ");return`${e} ${n} {`})}const F=`
  .est-root { padding: 0; }
  .room-block, .cat-block { page-break-inside: auto !important; break-inside: auto !important; }
  .cat-block { border: 1.2px solid #6B4508; border-radius: 10px; overflow: hidden; margin-bottom: 14px; }
  .cat-block thead th { border: 1.2px solid #6B4508; }
  .cat-block tbody td, .cat-block tfoot td { border: 1.2px solid #6B4508 !important; }
  .cat-block tr > *:first-child { border-left: none !important; }
  .cat-block tr > *:last-child { border-right: none !important; }
  .cat-block thead tr > * { border-top: none !important; }
  .cat-block tfoot tr:last-child > * { border-bottom: none !important; }
  .room-title { margin-top: 6px; }
  .room-total { border-radius: 10px; }
  thead th:nth-child(3) { width: 54px; }
  tbody td:nth-child(3) { white-space: nowrap; word-break: normal; }
  thead th:nth-child(1) { color: #ffffff; }
  .summary-box > .summary-total:first-child { border-top: none; padding-top: 0; }
`;function L(t,o,a,s="est-preview"){const{styles:e,bodyContent:l}=A(t,o,a);return`<style>${B(e+F,`#${s}`)}</style><div id="${s}" class="est-root">${l}</div>`}async function N(t,o,a){await j(t,o,a,"save")}async function U(t,o,a){return await j(t,o,a,"base64")||""}async function j(t,o,a,s){const{styles:e,bodyContent:l}=A(t,o,a);return R(n=>{n.id="pdf-scope-estimate",n.className="est-root",n.innerHTML=`<style>${B(e+F,"#pdf-scope-estimate")}</style>${l}`},{filename:`Смета №${t.estimate_number||t.id}.pdf`,mode:s})}function r(t){const o=document.createElement("div");return o.textContent=t??"",o.innerHTML}export{U as a,N as d,L as e,M as p};
