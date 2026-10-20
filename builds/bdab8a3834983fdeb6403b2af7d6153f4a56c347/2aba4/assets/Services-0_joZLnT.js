import{r as st}from"./RentalContract-C8QAJ-EO.js";import{r as i,b3 as nt,j as e,D as lt,l as dt,m as ct,n as pt,b4 as G,I as _,z as O,L as mt}from"./index-RyZb4_co.js";import{C as ht}from"./Company-DvkCQNbz.js";import{D as xt}from"./Customers-Bz9SlKh-.js";const P=(t,a=0)=>{const r=typeof t=="string"?parseFloat(t):Number(t);return Number.isFinite(r)?r:a},M=t=>new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0}).format(P(t))+" ₽",K=t=>new Date(t).toLocaleDateString("ru-RU",{day:"numeric",month:"long",year:"numeric"});function W(t){return(t||"").replace(/\s+/g,"").replace(/(\d{4})(?=\d)/g,"$1 ")}function f(t,a,r=""){return a?`<tr class="${r.includes("hl")?"hl":""}"><td class="rk">${t}</td><td class="rv${r.includes("acc")?" acc":""}">${p(a)}</td></tr>`:""}function H(t,a,r){const m=(t.items||[]).filter(u=>!u.status||u.status==="approved"),s=new Map;m.forEach(u=>{const v=u.room_name||"Без помещения";s.has(v)||s.set(v,[]),s.get(v).push(u)});const h=P(t.subtotal_amount??t.total_amount),n=P(t.discount_amount??0),d=Array.from(s.entries()).map(([u,v])=>{const N=new Map;v.forEach(x=>{const g=x.category||"Прочие работы";N.has(g)||N.set(g,[]),N.get(g).push(x)});const E=v.reduce((x,g)=>x+P(g.amount),0),D=Array.from(N.entries()).map(([x,g])=>{const S=g.reduce((l,I)=>l+P(I.amount),0),R=g.map((l,I)=>`
            <tr>
              <td class="num">${I+1}</td>
              <td>${p(l.name)}</td>
              <td class="center">${p(l.unit)}</td>
              <td class="center">${P(l.quantity)}</td>
              <td class="center">${P(l.times,1)}</td>
              <td class="right">${M(l.price)}</td>
              <td class="right amount">${M(l.amount)}</td>
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
              <tr class="cat-row"><td colspan="7">${p(x)}</td></tr>
              ${R}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="6" class="right">Итого по категории</td>
                <td class="right amount">${M(S)}</td>
              </tr>
            </tfoot>
          </table>
        </div>`}).join("");return`
      <div class="room-block">
        <h3 class="room-title">${p(u)}</h3>
        ${D}
        <div class="room-total">
          <div>
            <div class="room-total-label">Итоговая сумма по помещению</div>
            <div class="room-total-name">${p(u)}</div>
          </div>
          <div class="room-total-amount">${M(E)}</div>
        </div>
      </div>`}).join(""),c=`
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
`,y=t.estimate_number||String(t.id),$=!!(t.apply_signature&&t.company_signature_url),b=!!(t.apply_stamp&&t.company_stamp_url),A=`
  <div class="header">
    <div class="brand"><img class="brand-logo" src="${window.location.origin}/logo-print.png" alt="FixKey"/><b class="brand-word">Fix<span>Key</span></b></div>
    <div class="doc-title">
      <h1>Смета № ${p(y)}</h1>
      <p>от ${K(t.created_at)}</p>
    </div>
  </div>

  <div class="doc-subtitle">
    <h2>СМЕТА НА РАБОТЫ</h2>
    <p>Расчёт ремонтно-отделочных работ</p>
    ${t.contract_number?`<p>Приложение к договору № ${p(t.contract_number)}${t.contract_date?` от ${K(t.contract_date)}`:""}</p>`:""}
  </div>

  <hr class="thin" />

  <div class="info-grid">
    <div>
      <div class="label">ID объекта</div>
      <div class="value">${p(a.object_code)}</div>
    </div>
    <div>
      <div class="label">Заказчик</div>
      <div class="value">${p(a.client_name)}</div>
    </div>
    <div>
      <div class="label">Контактный телефон</div>
      <div class="value">${p(a.client_phone||"—")}</div>
    </div>
    <div>
      <div class="label">Характеристики объекта</div>
      <div class="value">${p(a.object_type)} · ${a.area} м²</div>
    </div>
  </div>

  ${d}

  <div class="summary">
    <div class="summary-box">
      ${n>0?`
      <div class="summary-row">
        <span>Сумма до скидки:</span>
        <span>${M(h)}</span>
      </div>
      <div class="summary-row discount">
        <span>Скидка:</span>
        <span>-${M(n)}</span>
      </div>`:""}
      <div class="summary-total">
        <span>ИТОГО К ОПЛАТЕ:</span>
        <span>${M(t.total_amount)}</span>
      </div>
    </div>
  </div>

  ${t.notes?`
  <div class="notes">
    <div class="label">Примечания</div>
    <div>${p(t.notes)}</div>
  </div>`:""}

  <hr class="thin" />

  <div class="parties">
    <div class="party-card">
      <div class="party-head">Исполнитель</div>
      <table class="party-table">
        <tr><td colspan="2" class="party-name">${p(/предприним/i.test(t.company_entity_type||"")&&t.company_contact_full_name?`ИП ${t.company_contact_full_name}`:t.company_name||r)}</td></tr>
        ${t.company_ogrn&&/предприним|юрид/i.test(t.company_entity_type||"")?f(/юрид/i.test(t.company_entity_type||"")?"ОГРН":"ОГРНИП",t.company_ogrn):""}
        ${f("ИНН",t.company_inn)}
        ${/юрид/i.test(t.company_entity_type||"")?f("КПП",t.company_kpp):""}
        ${f("Адрес",t.company_legal_address)}
        ${f("Телефон",t.company_phone)}
        ${f("E-mail",t.company_email)}
        ${f("Сайт",t.company_website)}
        ${t.company_account_number||t.company_bank_name?'<tr><td colspan="2" class="bank-sub">Банковские реквизиты</td></tr>':""}
        ${f("Расчётный счёт",W(t.company_account_number),"acc hl")}
        ${f("Банк",t.company_bank_name)}
        ${f("БИК",t.company_bik,"acc")}
        ${f("Корр. счёт",W(t.company_correspondent_account),"acc")}
      </table>
    </div>
    <div class="party-card">
      <div class="party-head">Заказчик</div>
      <table class="party-table">
        <tr><td colspan="2" class="party-name">${p(a.client_name)}</td></tr>
        ${f("Телефон",a.client_phone)}
        ${f("E-mail",a.email||t.email)}
        ${f("Адрес объекта",a.address||t.address)}
      </table>
    </div>
  </div>

  <div class="sign-row">
    <div class="sign-col${b?" with-stamp":""}">
      <div class="label">От имени Исполнителя</div>
      <div class="sign-box">
        ${$?`<img class="sig" src="${p(t.company_signature_url||"")}" crossorigin="anonymous" alt=""/>`:""}
        ${b?`<img class="stamp" src="${p(t.company_stamp_url||"")}" crossorigin="anonymous" alt=""/>`:""}
      </div>
      <div class="who">${p(t.company_contact_full_name||t.company_name||r)}</div>
      <div class="hint">(подпись)</div>
    </div>
    <div class="sign-col">
      <div class="label">От имени Заказчика</div>
      <div class="sign-box"></div>
      <div class="who">${p(a.client_name)}</div>
      <div class="hint">(подпись)</div>
    </div>
  </div>`,w=`Смета № ${p(y)} — ${p(a.client_name)}`;return{styles:c,bodyContent:A,title:w}}function jt(t,a,r){const{styles:m,bodyContent:s,title:h}=H(t,a,r),n=`<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8" />
<title>${h}</title>
<style>${m}</style>
</head>
<body>
<div class="est-root">${s}</div>
</body>
</html>`,d=window.open("","_blank","width=900,height=1000");if(!d)return;d.document.open(),d.document.write(n),d.document.close();let c=!1;const y=()=>{c||(c=!0,d.focus(),d.print())},$=()=>{const b=Array.from(d.document.images).filter(w=>!w.complete);if(!b.length)return setTimeout(y,200);let A=b.length;b.forEach(w=>{const u=()=>{A-=1,A<=0&&setTimeout(y,200)};w.addEventListener("load",u,{once:!0}),w.addEventListener("error",u,{once:!0})}),setTimeout(y,5e3)};d.document.readyState==="complete"?$():d.onload=$}function V(t,a){let r=t;for(;;){const m=a.exec(r);if(!m)return r;const s=r.indexOf("{",m.index);if(s===-1)return r;let h=0,n=-1;for(let d=s;d<r.length;d++)if(r[d]==="{")h++;else if(r[d]==="}"&&(h--,h===0)){n=d;break}if(n===-1)return r;r=r.slice(0,m.index)+r.slice(n+1),a.lastIndex=0}}function Y(t,a){return V(V(t,/@page\b/g),/@media\s+print\b/g).replace(/(^|\})\s*([^{}@]+)\s*\{/g,(m,s,h)=>{const n=h.split(",").map(d=>{const c=d.trim();return c?c==="*"?`${a}, ${a} *`:/^(html|body)$/i.test(c)||c===".est-root"?a:c.startsWith(".est-root ")?`${a} ${c.slice(10)}`:`${a} ${c}`:""}).filter(Boolean).join(", ");return`${s} ${n} {`})}const Z=`
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
`;function kt(t,a,r,m="est-preview"){const{styles:s,bodyContent:h}=H(t,a,r);return`<style>${Y(s+Z,`#${m}`)}</style><div id="${m}" class="est-root">${h}</div>`}async function $t(t,a,r){await J(t,a,r,"save")}async function Nt(t,a,r){return await J(t,a,r,"base64")||""}async function J(t,a,r,m){const{styles:s,bodyContent:h}=H(t,a,r);return st(n=>{n.id="pdf-scope-estimate",n.className="est-root",n.innerHTML=`<style>${Y(s+Z,"#pdf-scope-estimate")}</style>${h}`},{filename:`Смета №${t.estimate_number||t.id}.pdf`,mode:m})}function p(t){const a=document.createElement("div");return a.textContent=t??"",a.innerHTML}const ut=[{value:"м.п.",label:"м/п (метр погонный)"},{value:"м²",label:"кв.м (квадратный метр)"},{value:"м³",label:"куб.м (кубический метр)"},{value:"шт",label:"шт. (штука)"},{value:"компл",label:"компл. (комплект)"},{value:"точка",label:"точка"}];function bt({service:t,open:a,onOpenChange:r,onSaved:m}){const[s,h]=i.useState(""),[n,d]=i.useState(""),[c,y]=i.useState(""),[$,b]=i.useState(""),[A,w]=i.useState(""),[u,v]=i.useState(""),[N,E]=i.useState(!1),[D,x]=i.useState(""),{categories:g,subcategories:S}=nt(s);i.useEffect(()=>{t&&(h(t.category||""),d(t.subcategory||""),y(t.name||""),b(t.unit||""),w(t.price!=null?String(t.price):""),v(t.description||""),x(""))},[t]);const R=async()=>{if(t){if(x(""),c.trim().length<2){x("Введите название работы");return}if(!s.trim()){x("Укажите категорию работ");return}if(!$){x("Выберите единицу измерения");return}E(!0);try{await O.update(t.id,{name:c.trim(),category:s.trim(),subcategory:n.trim(),unit:$,price:Number(A)||0,description:u.trim()}),m(),r(!1)}catch(l){x(l instanceof Error?l.message:"Ошибка сохранения")}finally{E(!1)}}};return e.jsx(lt,{open:a,onOpenChange:r,children:e.jsxs(dt,{className:"sm:max-w-2xl bg-[#1f1f1f] border-white/10 text-white",children:[e.jsx(ct,{children:e.jsx(pt,{className:"text-lg font-medium",children:"Редактирование услуги"})}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2",children:[e.jsxs("div",{className:"flex flex-col gap-1.5",children:[e.jsxs("label",{className:"text-xs text-white/50",children:["Категория работ ",e.jsx("span",{className:"text-red-400",children:"*"})]}),e.jsx(G,{value:s,onChange:h,suggestions:g,placeholder:"Выберите или введите новую"})]}),e.jsxs("div",{className:"flex flex-col gap-1.5",children:[e.jsx("label",{className:"text-xs text-white/50",children:"Подкатегория"}),e.jsx(G,{value:n,onChange:d,suggestions:S,placeholder:"Выберите или введите новую"})]}),e.jsxs("div",{className:"flex flex-col gap-1.5 sm:col-span-2",children:[e.jsxs("label",{className:"text-xs text-white/50",children:["Название работы ",e.jsx("span",{className:"text-red-400",children:"*"})]}),e.jsx("input",{value:c,onChange:l=>y(l.target.value),placeholder:"Например: Демонтаж плинтуса",className:"bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"})]}),e.jsxs("div",{className:"flex flex-col gap-1.5",children:[e.jsxs("label",{className:"text-xs text-white/50",children:["Единица измерения ",e.jsx("span",{className:"text-red-400",children:"*"})]}),e.jsxs("select",{value:$,onChange:l=>b(l.target.value),className:"bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none",children:[e.jsx("option",{value:"",children:"Выберите единицу"}),ut.map(l=>e.jsx("option",{value:l.value,children:l.label},l.value))]})]}),e.jsxs("div",{className:"flex flex-col gap-1.5",children:[e.jsx("label",{className:"text-xs text-white/50",children:"Цена за единицу (₽)"}),e.jsx("input",{value:A,onChange:l=>w(l.target.value),placeholder:"0.00",type:"number",className:"bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"})]}),e.jsxs("div",{className:"flex flex-col gap-1.5 sm:col-span-2",children:[e.jsx("label",{className:"text-xs text-white/50",children:"Описание (необязательно)"}),e.jsx("textarea",{value:u,onChange:l=>v(l.target.value),placeholder:"Дополнительная информация об услуге...",rows:3,className:"bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none resize-none focus:border-[#D4AF37]/50"})]})]}),D&&e.jsxs("p",{className:"text-sm text-red-400 flex items-center gap-1.5 mt-3",children:[e.jsx(_,{name:"CircleAlert",size:15}),D]}),e.jsxs("div",{className:"flex items-center justify-end gap-3 mt-4 pt-4 border-t border-white/10",children:[e.jsx("button",{onClick:()=>r(!1),className:"px-4 py-2.5 rounded-lg text-sm bg-white/5 hover:bg-white/10 transition-colors",children:"Отмена"}),e.jsxs("button",{onClick:R,disabled:N,className:"flex items-center gap-2 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm px-5 py-2.5 rounded-lg disabled:opacity-60",children:[N?e.jsx(_,{name:"Loader2",size:16,className:"animate-spin"}):null,"Сохранить изменения"]})]})]})})}const T=20;function ft(){const[t,a]=i.useState([]),[r,m]=i.useState(!0),[s,h]=i.useState(""),[n,d]=i.useState(""),[c,y]=i.useState(""),[$,b]=i.useState(1),[A,w]=i.useState(null),[u,v]=i.useState(!1),[N,E]=i.useState(!1),[D,x]=i.useState(""),g=i.useRef(null),S=()=>{m(!0),O.list().then(o=>a(o.services)).finally(()=>m(!1))};i.useEffect(()=>{S()},[]);const R=async o=>{await O.remove(o),S()},l=o=>new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0}).format(o)+" ₽",I=i.useMemo(()=>Array.from(new Set(t.map(o=>o.category).filter(Boolean))),[t]),q=i.useMemo(()=>Array.from(new Set(t.filter(o=>!n||o.category===n).map(o=>o.subcategory).filter(Boolean))),[t,n]),L=i.useMemo(()=>t.filter(o=>!(s.trim()&&!o.name.toLowerCase().includes(s.trim().toLowerCase())||n&&o.category!==n||c&&o.subcategory!==c)),[t,s,n,c]),C=Math.max(1,Math.ceil(L.length/T)),j=Math.min($,C),Q=i.useMemo(()=>L.slice((j-1)*T,j*T),[L,j]);i.useEffect(()=>{b(1)},[s,n,c]);const X=o=>{w(o),v(!0)},tt=i.useMemo(()=>{const o=[],z=k=>o.push(k);if(C<=7)for(let k=1;k<=C;k++)z(k);else{z(1);const k=Math.max(2,j-1),B=Math.min(C-1,j+1);k>2&&o.push("…");for(let F=k;F<=B;F++)z(F);B<C-1&&o.push("…"),z(C)}return o},[C,j]),et=()=>{var o;x(""),(o=g.current)==null||o.click()},ot=async o=>{var k;const z=(k=o.target.files)==null?void 0:k[0];if(o.target.value="",!!z){E(!0),x("");try{const B=await new Promise((at,rt)=>{const U=new FileReader;U.onload=()=>{const it=U.result;at(it.split(",")[1]||"")},U.onerror=rt,U.readAsDataURL(z)}),F=await O.importExcel(B);x(`Импортировано: ${F.imported}${F.skipped?`, пропущено: ${F.skipped}`:""}`),S()}catch(B){x(B instanceof Error?B.message:"Ошибка импорта файла")}finally{E(!1)}}};return e.jsxs(ht,{title:"Справочник услуг",subtitle:"Общая база работ и ваши собственные услуги",children:[e.jsxs("div",{className:"flex justify-end gap-2 mb-6",children:[e.jsx("input",{ref:g,type:"file",accept:".xlsx",className:"hidden",onChange:ot}),e.jsxs("button",{onClick:et,disabled:N,className:"flex items-center gap-2 bg-white/5 hover:bg-white/10 transition-colors text-white text-sm px-4 py-2.5 rounded-lg disabled:opacity-60",children:[N?e.jsx(_,{name:"Loader2",size:16,className:"animate-spin"}):e.jsx(_,{name:"FileUp",size:16}),"Импорт из Excel"]}),e.jsxs(mt,{to:"/cabinet/services/new",className:"flex items-center gap-2 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm px-4 py-2.5 rounded-lg",children:[e.jsx(_,{name:"Plus",size:16}),"Добавить услугу"]})]}),D&&e.jsx("div",{className:"mb-4 text-sm text-white/70 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5",children:D}),e.jsx("div",{className:"bg-[#1f1f1f] border border-white/10 rounded-xl p-5 mb-5",children:e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-3 gap-3",children:[e.jsxs("div",{className:"relative",children:[e.jsx(_,{name:"Search",size:15,className:"absolute left-3 top-1/2 -translate-y-1/2 text-white/30"}),e.jsx("input",{value:s,onChange:o=>h(o.target.value),placeholder:"Название услуги...",className:"w-full bg-[#161616] border border-white/10 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"})]}),e.jsxs("select",{value:n,onChange:o=>{d(o.target.value),y("")},className:"bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none",children:[e.jsx("option",{value:"",children:"Все категории"}),I.map(o=>e.jsx("option",{value:o,children:o},o))]}),e.jsxs("select",{value:c,onChange:o=>y(o.target.value),disabled:q.length===0,className:"bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none disabled:opacity-40",children:[e.jsx("option",{value:"",children:"Все подкатегории"}),q.map(o=>e.jsx("option",{value:o,children:o},o))]})]})}),e.jsx("div",{className:"bg-[#1f1f1f] border border-white/10 rounded-xl p-5",children:r?e.jsx("div",{className:"flex justify-center py-16",children:e.jsx(_,{name:"Loader2",size:24,className:"animate-spin text-white/40"})}):L.length===0?e.jsx("div",{className:"text-center py-16 text-white/30 text-sm",children:t.length===0?"Справочник услуг пуст — добавьте первую услугу":"Ничего не найдено по заданным фильтрам"}):e.jsxs("div",{className:"overflow-x-auto",children:[e.jsxs("table",{className:"w-full text-sm",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"text-white/40 text-xs uppercase border-b border-white/10",children:[e.jsx("th",{className:"text-left font-medium py-2 pr-4",children:"Название работы"}),e.jsx("th",{className:"text-left font-medium py-2 pr-4",children:"Категория"}),e.jsx("th",{className:"text-left font-medium py-2 pr-4",children:"Подкатегория"}),e.jsx("th",{className:"text-left font-medium py-2 pr-4",children:"Ед. изм."}),e.jsx("th",{className:"text-left font-medium py-2 pr-4",children:"Цена"}),e.jsx("th",{className:"text-left font-medium py-2 pr-4",children:"Действия"})]})}),e.jsx("tbody",{children:Q.map(o=>e.jsxs("tr",{className:"border-b border-white/5 last:border-0",children:[e.jsx("td",{className:"py-3 pr-4 font-medium",children:o.name}),e.jsx("td",{className:"py-3 pr-4 text-white/60",children:o.category||"—"}),e.jsx("td",{className:"py-3 pr-4 text-white/60",children:o.subcategory||"—"}),e.jsx("td",{className:"py-3 pr-4 text-white/60",children:o.unit}),e.jsx("td",{className:"py-3 pr-4 text-white/60",children:l(o.price)}),e.jsx("td",{className:"py-3 pr-4",children:e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("button",{onClick:()=>X(o),title:"Редактировать",className:"text-white/40 hover:text-[#D4AF37] transition-colors",children:e.jsx(_,{name:"Pencil",size:16})}),e.jsx(xt,{onConfirm:()=>R(o.id)})]})})]},o.id))})]}),e.jsxs("div",{className:"flex flex-col sm:flex-row items-center justify-between gap-4 mt-5 pt-4 border-t border-white/10",children:[e.jsxs("p",{className:"text-xs text-white/40",children:["Показано ",(j-1)*T+1,"–",Math.min(j*T,L.length)," из ",L.length," услуг"]}),e.jsxs("div",{className:"flex items-center gap-1.5",children:[e.jsx("button",{onClick:()=>b(o=>Math.max(1,o-1)),disabled:j===1,className:"w-8 h-8 flex items-center justify-center rounded-md bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-30 disabled:hover:bg-white/5",children:e.jsx(_,{name:"ChevronLeft",size:16})}),tt.map((o,z)=>o==="…"?e.jsx("span",{className:"w-8 h-8 flex items-center justify-center text-white/30 text-sm",children:"…"},`e${z}`):e.jsx("button",{onClick:()=>b(o),className:`min-w-8 h-8 px-2 flex items-center justify-center rounded-md text-sm transition-colors ${o===j?"bg-[#D4AF37] text-[#161616] font-medium":"bg-white/5 hover:bg-white/10 text-white/70"}`,children:o},o)),e.jsx("button",{onClick:()=>b(o=>Math.min(C,o+1)),disabled:j===C,className:"w-8 h-8 flex items-center justify-center rounded-md bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-30 disabled:hover:bg-white/5",children:e.jsx(_,{name:"ChevronRight",size:16})})]})]})]})}),e.jsx(bt,{service:A,open:u,onOpenChange:v,onSaved:S})]})}const _t=Object.freeze(Object.defineProperty({__proto__:null,default:ft},Symbol.toStringTag,{value:"Module"}));export{_t as S,Nt as a,$t as d,kt as e,jt as p};
