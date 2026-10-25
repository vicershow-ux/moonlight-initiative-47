import{r as nt}from"./RentalContract-CLM_UeDp.js";import{r as s,b7 as lt,j as t,D as dt,l as ct,m as pt,n as mt,b8 as W,I as $,K as O,L as xt}from"./index-ly_T-3-x.js";import{C as ht}from"./Company-D1y99-Ss.js";import{D as V}from"./Customers-DJZ6A65l.js";import{M as ut,C as bt}from"./CompanyAssets-B-kSpCg8.js";const P=(e,o=0)=>{const r=typeof e=="string"?parseFloat(e):Number(e);return Number.isFinite(r)?r:o},M=e=>new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0}).format(P(e))+" ₽",Y=e=>new Date(e).toLocaleDateString("ru-RU",{day:"numeric",month:"long",year:"numeric"});function Z(e){return(e||"").replace(/\s+/g,"").replace(/(\d{4})(?=\d)/g,"$1 ")}function f(e,o,r=""){return o?`<tr class="${r.includes("hl")?"hl":""}"><td class="rk">${e}</td><td class="rv${r.includes("acc")?" acc":""}">${p(o)}</td></tr>`:""}function H(e,o,r){const m=(e.items||[]).filter(u=>!u.status||u.status==="approved"),i=new Map;m.forEach(u=>{const v=u.room_name||"Без помещения";i.has(v)||i.set(v,[]),i.get(v).push(u)});const x=P(e.subtotal_amount??e.total_amount),n=P(e.discount_amount??0),d=Array.from(i.entries()).map(([u,v])=>{const _=new Map;v.forEach(h=>{const g=h.category||"Прочие работы";_.has(g)||_.set(g,[]),_.get(g).push(h)});const E=v.reduce((h,g)=>h+P(g.amount),0),D=Array.from(_.entries()).map(([h,g])=>{const S=g.reduce((l,I)=>l+P(I.amount),0),L=g.map((l,I)=>`
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
              <tr class="cat-row"><td colspan="7">${p(h)}</td></tr>
              ${L}
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
`,y=e.estimate_number||String(e.id),N=!!(e.apply_signature&&e.company_signature_url),b=!!(e.apply_stamp&&e.company_stamp_url),A=`
  <div class="header">
    <div class="brand"><img class="brand-logo" src="${window.location.origin}/logo-print.png" alt="FixKey"/><b class="brand-word">Fix<span>Key</span></b></div>
    <div class="doc-title">
      <h1>Смета № ${p(y)}</h1>
      <p>от ${Y(e.created_at)}</p>
    </div>
  </div>

  <div class="doc-subtitle">
    <h2>СМЕТА НА РАБОТЫ</h2>
    <p>Расчёт ремонтно-отделочных работ</p>
    ${e.contract_number?`<p>Приложение к договору № ${p(e.contract_number)}${e.contract_date?` от ${Y(e.contract_date)}`:""}</p>`:""}
  </div>

  <hr class="thin" />

  <div class="info-grid">
    <div>
      <div class="label">ID объекта</div>
      <div class="value">${p(o.object_code)}</div>
    </div>
    <div>
      <div class="label">Заказчик</div>
      <div class="value">${p(o.client_name)}</div>
    </div>
    <div>
      <div class="label">Контактный телефон</div>
      <div class="value">${p(o.client_phone||"—")}</div>
    </div>
    <div>
      <div class="label">Характеристики объекта</div>
      <div class="value">${p(o.object_type)} · ${o.area} м²</div>
    </div>
  </div>

  ${d}

  <div class="summary">
    <div class="summary-box">
      ${n>0?`
      <div class="summary-row">
        <span>Сумма до скидки:</span>
        <span>${M(x)}</span>
      </div>
      <div class="summary-row discount">
        <span>Скидка:</span>
        <span>-${M(n)}</span>
      </div>`:""}
      <div class="summary-total">
        <span>ИТОГО К ОПЛАТЕ:</span>
        <span>${M(e.total_amount)}</span>
      </div>
    </div>
  </div>

  ${e.notes?`
  <div class="notes">
    <div class="label">Примечания</div>
    <div>${p(e.notes)}</div>
  </div>`:""}

  <hr class="thin" />

  <div class="parties">
    <div class="party-card">
      <div class="party-head">Исполнитель</div>
      <table class="party-table">
        <tr><td colspan="2" class="party-name">${p(/предприним/i.test(e.company_entity_type||"")&&e.company_contact_full_name?`ИП ${e.company_contact_full_name}`:e.company_name||r)}</td></tr>
        ${e.company_ogrn&&/предприним|юрид/i.test(e.company_entity_type||"")?f(/юрид/i.test(e.company_entity_type||"")?"ОГРН":"ОГРНИП",e.company_ogrn):""}
        ${f("ИНН",e.company_inn)}
        ${/юрид/i.test(e.company_entity_type||"")?f("КПП",e.company_kpp):""}
        ${f("Адрес",e.company_legal_address)}
        ${f("Телефон",e.company_phone)}
        ${f("E-mail",e.company_email)}
        ${f("Сайт",e.company_website)}
        ${e.company_account_number||e.company_bank_name?'<tr><td colspan="2" class="bank-sub">Банковские реквизиты</td></tr>':""}
        ${f("Расчётный счёт",Z(e.company_account_number),"acc hl")}
        ${f("Банк",e.company_bank_name)}
        ${f("БИК",e.company_bik,"acc")}
        ${f("Корр. счёт",Z(e.company_correspondent_account),"acc")}
      </table>
    </div>
    <div class="party-card">
      <div class="party-head">Заказчик</div>
      <table class="party-table">
        <tr><td colspan="2" class="party-name">${p(o.client_name)}</td></tr>
        ${f("Телефон",o.client_phone)}
        ${f("E-mail",o.email||e.email)}
        ${f("Адрес объекта",o.address||e.address)}
      </table>
    </div>
  </div>

  <div class="sign-row">
    <div class="sign-col${b?" with-stamp":""}">
      <div class="label">От имени Исполнителя</div>
      <div class="sign-box">
        ${N?`<img class="sig" src="${p(e.company_signature_url||"")}" crossorigin="anonymous" alt=""/>`:""}
        ${b?`<img class="stamp" src="${p(e.company_stamp_url||"")}" crossorigin="anonymous" alt=""/>`:""}
      </div>
      <div class="who">${p(e.company_contact_full_name||e.company_name||r)}</div>
      <div class="hint">(подпись)</div>
    </div>
    <div class="sign-col">
      <div class="label">От имени Заказчика</div>
      <div class="sign-box"></div>
      <div class="who">${p(o.client_name)}</div>
      <div class="hint">(подпись)</div>
    </div>
  </div>`,w=`Смета № ${p(y)} — ${p(o.client_name)}`;return{styles:c,bodyContent:A,title:w}}function Nt(e,o,r){const{styles:m,bodyContent:i,title:x}=H(e,o,r),n=`<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8" />
<title>${x}</title>
<style>${m}</style>
</head>
<body>
<div class="est-root">${i}</div>
</body>
</html>`,d=window.open("","_blank","width=900,height=1000");if(!d)return;d.document.open(),d.document.write(n),d.document.close();let c=!1;const y=()=>{c||(c=!0,d.focus(),d.print())},N=()=>{const b=Array.from(d.document.images).filter(w=>!w.complete);if(!b.length)return setTimeout(y,200);let A=b.length;b.forEach(w=>{const u=()=>{A-=1,A<=0&&setTimeout(y,200)};w.addEventListener("load",u,{once:!0}),w.addEventListener("error",u,{once:!0})}),setTimeout(y,5e3)};d.document.readyState==="complete"?N():d.onload=N}function J(e,o){let r=e;for(;;){const m=o.exec(r);if(!m)return r;const i=r.indexOf("{",m.index);if(i===-1)return r;let x=0,n=-1;for(let d=i;d<r.length;d++)if(r[d]==="{")x++;else if(r[d]==="}"&&(x--,x===0)){n=d;break}if(n===-1)return r;r=r.slice(0,m.index)+r.slice(n+1),o.lastIndex=0}}function Q(e,o){return J(J(e,/@page\b/g),/@media\s+print\b/g).replace(/(^|\})\s*([^{}@]+)\s*\{/g,(m,i,x)=>{const n=x.split(",").map(d=>{const c=d.trim();return c?c==="*"?`${o}, ${o} *`:/^(html|body)$/i.test(c)||c===".est-root"?o:c.startsWith(".est-root ")?`${o} ${c.slice(10)}`:`${o} ${c}`:""}).filter(Boolean).join(", ");return`${i} ${n} {`})}const X=`
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
`;function _t(e,o,r,m="est-preview"){const{styles:i,bodyContent:x}=H(e,o,r);return`<style>${Q(i+X,`#${m}`)}</style><div id="${m}" class="est-root">${x}</div>`}async function At(e,o,r){await tt(e,o,r,"save")}async function Ct(e,o,r){return await tt(e,o,r,"base64")||""}async function tt(e,o,r,m){const{styles:i,bodyContent:x}=H(e,o,r);return nt(n=>{n.id="pdf-scope-estimate",n.className="est-root",n.innerHTML=`<style>${Q(i+X,"#pdf-scope-estimate")}</style>${x}`},{filename:`Смета №${e.estimate_number||e.id}.pdf`,mode:m})}function p(e){const o=document.createElement("div");return o.textContent=e??"",o.innerHTML}const ft=[{value:"м.п.",label:"м/п (метр погонный)"},{value:"м²",label:"кв.м (квадратный метр)"},{value:"м³",label:"куб.м (кубический метр)"},{value:"шт",label:"шт. (штука)"},{value:"компл",label:"компл. (комплект)"},{value:"точка",label:"точка"}];function gt({service:e,open:o,onOpenChange:r,onSaved:m}){const[i,x]=s.useState(""),[n,d]=s.useState(""),[c,y]=s.useState(""),[N,b]=s.useState(""),[A,w]=s.useState(""),[u,v]=s.useState(""),[_,E]=s.useState(!1),[D,h]=s.useState(""),{categories:g,subcategories:S}=lt(i);s.useEffect(()=>{e&&(x(e.category||""),d(e.subcategory||""),y(e.name||""),b(e.unit||""),w(e.price!=null?String(e.price):""),v(e.description||""),h(""))},[e]);const L=async()=>{if(e){if(h(""),c.trim().length<2){h("Введите название работы");return}if(!i.trim()){h("Укажите категорию работ");return}if(!N){h("Выберите единицу измерения");return}E(!0);try{await O.update(e.id,{name:c.trim(),category:i.trim(),subcategory:n.trim(),unit:N,price:Number(A)||0,description:u.trim()}),m(),r(!1)}catch(l){h(l instanceof Error?l.message:"Ошибка сохранения")}finally{E(!1)}}};return t.jsx(dt,{open:o,onOpenChange:r,children:t.jsxs(ct,{className:"sm:max-w-2xl bg-[#1f1f1f] border-white/10 text-white",children:[t.jsx(pt,{children:t.jsx(mt,{className:"text-lg font-medium",children:"Редактирование услуги"})}),t.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2",children:[t.jsxs("div",{className:"flex flex-col gap-1.5",children:[t.jsxs("label",{className:"text-xs text-white/50",children:["Категория работ ",t.jsx("span",{className:"text-red-400",children:"*"})]}),t.jsx(W,{value:i,onChange:x,suggestions:g,placeholder:"Выберите или введите новую"})]}),t.jsxs("div",{className:"flex flex-col gap-1.5",children:[t.jsx("label",{className:"text-xs text-white/50",children:"Подкатегория"}),t.jsx(W,{value:n,onChange:d,suggestions:S,placeholder:"Выберите или введите новую"})]}),t.jsxs("div",{className:"flex flex-col gap-1.5 sm:col-span-2",children:[t.jsxs("label",{className:"text-xs text-white/50",children:["Название работы ",t.jsx("span",{className:"text-red-400",children:"*"})]}),t.jsx("input",{value:c,onChange:l=>y(l.target.value),placeholder:"Например: Демонтаж плинтуса",className:"bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"})]}),t.jsxs("div",{className:"flex flex-col gap-1.5",children:[t.jsxs("label",{className:"text-xs text-white/50",children:["Единица измерения ",t.jsx("span",{className:"text-red-400",children:"*"})]}),t.jsxs("select",{value:N,onChange:l=>b(l.target.value),className:"bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none",children:[t.jsx("option",{value:"",children:"Выберите единицу"}),ft.map(l=>t.jsx("option",{value:l.value,children:l.label},l.value))]})]}),t.jsxs("div",{className:"flex flex-col gap-1.5",children:[t.jsx("label",{className:"text-xs text-white/50",children:"Цена за единицу (₽)"}),t.jsx("input",{value:A,onChange:l=>w(l.target.value),placeholder:"0.00",type:"number",className:"bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"})]}),t.jsxs("div",{className:"flex flex-col gap-1.5 sm:col-span-2",children:[t.jsx("label",{className:"text-xs text-white/50",children:"Описание (необязательно)"}),t.jsx("textarea",{value:u,onChange:l=>v(l.target.value),placeholder:"Дополнительная информация об услуге...",rows:3,className:"bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none resize-none focus:border-[#D4AF37]/50"})]})]}),D&&t.jsxs("p",{className:"text-sm text-red-400 flex items-center gap-1.5 mt-3",children:[t.jsx($,{name:"CircleAlert",size:15}),D]}),t.jsxs("div",{className:"flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-3 mt-4 pt-4 border-t border-white/10",children:[t.jsx("button",{onClick:()=>r(!1),className:"w-full sm:w-auto min-h-[44px] sm:min-h-0 flex sm:block items-center justify-center px-4 py-2.5 rounded-lg text-sm bg-white/5 hover:bg-white/10 transition-colors",children:"Отмена"}),t.jsxs("button",{onClick:L,disabled:_,className:"w-full sm:w-auto min-h-[44px] sm:min-h-0 justify-center sm:justify-start flex items-center gap-2 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm px-5 py-2.5 rounded-lg disabled:opacity-60",children:[_?t.jsx($,{name:"Loader2",size:16,className:"animate-spin"}):null,"Сохранить изменения"]})]})]})})}const T=20;function yt(){const[e,o]=s.useState([]),[r,m]=s.useState(!0),[i,x]=s.useState(""),[n,d]=s.useState(""),[c,y]=s.useState(""),[N,b]=s.useState(1),[A,w]=s.useState(null),[u,v]=s.useState(!1),[_,E]=s.useState(!1),[D,h]=s.useState(""),g=s.useRef(null),S=()=>{m(!0),O.list().then(a=>o(a.services)).finally(()=>m(!1))};s.useEffect(()=>{S()},[]);const L=async a=>{await O.remove(a),S()},l=a=>new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0}).format(a)+" ₽",I=s.useMemo(()=>Array.from(new Set(e.map(a=>a.category).filter(Boolean))),[e]),K=s.useMemo(()=>Array.from(new Set(e.filter(a=>!n||a.category===n).map(a=>a.subcategory).filter(Boolean))),[e,n]),R=s.useMemo(()=>e.filter(a=>!(i.trim()&&!a.name.toLowerCase().includes(i.trim().toLowerCase())||n&&a.category!==n||c&&a.subcategory!==c)),[e,i,n,c]),C=Math.max(1,Math.ceil(R.length/T)),j=Math.min(N,C),q=s.useMemo(()=>R.slice((j-1)*T,j*T),[R,j]);s.useEffect(()=>{b(1)},[i,n,c]);const G=a=>{w(a),v(!0)},et=s.useMemo(()=>{const a=[],z=k=>a.push(k);if(C<=7)for(let k=1;k<=C;k++)z(k);else{z(1);const k=Math.max(2,j-1),F=Math.min(C-1,j+1);k>2&&a.push("…");for(let B=k;B<=F;B++)z(B);F<C-1&&a.push("…"),z(C)}return a},[C,j]),at=()=>{var a;h(""),(a=g.current)==null||a.click()},ot=async a=>{var k;const z=(k=a.target.files)==null?void 0:k[0];if(a.target.value="",!!z){E(!0),h("");try{const F=await new Promise((rt,st)=>{const U=new FileReader;U.onload=()=>{const it=U.result;rt(it.split(",")[1]||"")},U.onerror=st,U.readAsDataURL(z)}),B=await O.importExcel(F);h(`Импортировано: ${B.imported}${B.skipped?`, пропущено: ${B.skipped}`:""}`),S()}catch(F){h(F instanceof Error?F.message:"Ошибка импорта файла")}finally{E(!1)}}};return t.jsxs(ht,{title:"Справочник услуг",subtitle:"Общая база работ и ваши собственные услуги",children:[t.jsxs("div",{className:"grid grid-cols-2 gap-2 sm:flex sm:justify-end mb-6",children:[t.jsx("input",{ref:g,type:"file",accept:".xlsx",className:"hidden",onChange:ot}),t.jsxs("button",{onClick:at,disabled:_,className:"flex items-center justify-center sm:justify-start gap-2 min-h-[44px] sm:min-h-0 bg-white/5 hover:bg-white/10 transition-colors text-white text-sm px-3 sm:px-4 py-2.5 rounded-lg disabled:opacity-60",children:[_?t.jsx($,{name:"Loader2",size:16,className:"animate-spin"}):t.jsx($,{name:"FileUp",size:16}),"Импорт из Excel"]}),t.jsxs(xt,{to:"/cabinet/services/new",className:"flex items-center justify-center sm:justify-start gap-2 min-h-[44px] sm:min-h-0 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm px-3 sm:px-4 py-2.5 rounded-lg",children:[t.jsx($,{name:"Plus",size:16}),"Добавить услугу"]})]}),D&&t.jsx("div",{className:"mb-4 text-sm text-white/70 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5",children:D}),t.jsx("div",{className:"bg-[#1f1f1f] border border-white/10 rounded-xl p-3 sm:p-5 mb-5",children:t.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-3 gap-3",children:[t.jsxs("div",{className:"relative",children:[t.jsx($,{name:"Search",size:15,className:"absolute left-3 top-1/2 -translate-y-1/2 text-white/30"}),t.jsx("input",{value:i,onChange:a=>x(a.target.value),placeholder:"Название услуги...",className:"w-full bg-[#161616] border border-white/10 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"})]}),t.jsxs("select",{value:n,onChange:a=>{d(a.target.value),y("")},className:"bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none",children:[t.jsx("option",{value:"",children:"Все категории"}),I.map(a=>t.jsx("option",{value:a,children:a},a))]}),t.jsxs("select",{value:c,onChange:a=>y(a.target.value),disabled:K.length===0,className:"bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none disabled:opacity-40",children:[t.jsx("option",{value:"",children:"Все подкатегории"}),K.map(a=>t.jsx("option",{value:a,children:a},a))]})]})}),t.jsx("div",{className:"md:bg-[#1f1f1f] md:border md:border-white/10 md:rounded-xl md:p-5",children:r?t.jsx("div",{className:"flex justify-center py-16",children:t.jsx($,{name:"Loader2",size:24,className:"animate-spin text-white/40"})}):R.length===0?t.jsx("div",{className:"text-center py-16 text-white/30 text-sm",children:e.length===0?"Справочник услуг пуст — добавьте первую услугу":"Ничего не найдено по заданным фильтрам"}):t.jsxs(t.Fragment,{children:[t.jsx("div",{className:"md:hidden flex flex-col gap-3",children:q.map(a=>t.jsx(ut,{title:t.jsx("span",{className:"whitespace-normal break-words",children:a.name}),subtitle:[a.category,a.subcategory].filter(Boolean).join(" · ")||void 0,badge:t.jsx("span",{className:"text-sm font-medium text-[#D4AF37]",children:l(a.price)}),rows:[{label:"Ед. изм.",value:a.unit}],actions:t.jsxs(t.Fragment,{children:[t.jsx(bt,{icon:t.jsx($,{name:"Pencil",size:16}),label:"Изменить",onClick:()=>G(a)}),t.jsx("div",{className:"w-10 h-10 flex items-center justify-center rounded-lg bg-white/5 shrink-0",children:t.jsx(V,{onConfirm:()=>L(a.id)})})]})},a.id))}),t.jsx("div",{className:"hidden md:block overflow-x-auto",children:t.jsxs("table",{className:"w-full text-sm",children:[t.jsx("thead",{children:t.jsxs("tr",{className:"text-white/40 text-xs uppercase border-b border-white/10",children:[t.jsx("th",{className:"text-left font-medium py-2 pr-4",children:"Название работы"}),t.jsx("th",{className:"text-left font-medium py-2 pr-4",children:"Категория"}),t.jsx("th",{className:"text-left font-medium py-2 pr-4",children:"Подкатегория"}),t.jsx("th",{className:"text-left font-medium py-2 pr-4",children:"Ед. изм."}),t.jsx("th",{className:"text-left font-medium py-2 pr-4",children:"Цена"}),t.jsx("th",{className:"text-left font-medium py-2 pr-4",children:"Действия"})]})}),t.jsx("tbody",{children:q.map(a=>t.jsxs("tr",{className:"border-b border-white/5 last:border-0",children:[t.jsx("td",{className:"py-3 pr-4 font-medium",children:a.name}),t.jsx("td",{className:"py-3 pr-4 text-white/60",children:a.category||"—"}),t.jsx("td",{className:"py-3 pr-4 text-white/60",children:a.subcategory||"—"}),t.jsx("td",{className:"py-3 pr-4 text-white/60",children:a.unit}),t.jsx("td",{className:"py-3 pr-4 text-white/60",children:l(a.price)}),t.jsx("td",{className:"py-3 pr-4",children:t.jsxs("div",{className:"flex items-center gap-3",children:[t.jsx("button",{onClick:()=>G(a),title:"Редактировать",className:"text-white/40 hover:text-[#D4AF37] transition-colors",children:t.jsx($,{name:"Pencil",size:16})}),t.jsx(V,{onConfirm:()=>L(a.id)})]})})]},a.id))})]})}),t.jsxs("div",{className:"flex flex-col sm:flex-row items-center justify-between gap-4 mt-5 pt-4 border-t border-white/10",children:[t.jsxs("p",{className:"text-xs text-white/40",children:["Показано ",(j-1)*T+1,"–",Math.min(j*T,R.length)," из ",R.length," услуг"]}),t.jsxs("div",{className:"flex flex-wrap justify-center items-center gap-1.5",children:[t.jsx("button",{onClick:()=>b(a=>Math.max(1,a-1)),disabled:j===1,className:"w-8 h-8 flex items-center justify-center rounded-md bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-30 disabled:hover:bg-white/5",children:t.jsx($,{name:"ChevronLeft",size:16})}),et.map((a,z)=>a==="…"?t.jsx("span",{className:"w-8 h-8 flex items-center justify-center text-white/30 text-sm",children:"…"},`e${z}`):t.jsx("button",{onClick:()=>b(a),className:`min-w-8 h-8 px-2 flex items-center justify-center rounded-md text-sm transition-colors ${a===j?"bg-[#D4AF37] text-[#161616] font-medium":"bg-white/5 hover:bg-white/10 text-white/70"}`,children:a},a)),t.jsx("button",{onClick:()=>b(a=>Math.min(C,a+1)),disabled:j===C,className:"w-8 h-8 flex items-center justify-center rounded-md bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-30 disabled:hover:bg-white/5",children:t.jsx($,{name:"ChevronRight",size:16})})]})]})]})}),t.jsx(gt,{service:A,open:u,onOpenChange:v,onSaved:S})]})}const zt=Object.freeze(Object.defineProperty({__proto__:null,default:yt},Symbol.toStringTag,{value:"Module"}));export{zt as S,Ct as a,At as d,_t as e,Nt as p};
