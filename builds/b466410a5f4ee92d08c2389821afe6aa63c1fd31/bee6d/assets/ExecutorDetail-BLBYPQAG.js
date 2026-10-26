import{r as ot,E as xt,c as ht,d as ft}from"./ExecutorPortal-DwCLXqIB.js";import{r as x,aG as U,x as st,j as t,D as ut,l as bt,m as gt,n as wt,I as g,bA as M,bh as G,k as O,t as it,w as W,o as nt,A as vt,z as R,L as B,ae as yt,aH as jt,ac as T,ad as J,aY as _t,aI as $t}from"./index-B3Pe9cPZ.js";import{C as q,d as V,b as kt}from"./Company-BbFUkJZ8.js";import{D as Nt,i as At,j as zt}from"./Customers-BsB8r3hk.js";const D=(e,s=0)=>{const o=typeof e=="string"?parseFloat(e):Number(e);return Number.isFinite(o)?o:s},S=e=>new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0}).format(D(e))+" ₽",Q=e=>new Date(e).toLocaleDateString("ru-RU",{day:"numeric",month:"long",year:"numeric"});function X(e){return(e||"").replace(/\s+/g,"").replace(/(\d{4})(?=\d)/g,"$1 ")}function C(e,s,o=""){return s?`<tr class="${o.includes("hl")?"hl":""}"><td class="rk">${e}</td><td class="rv${o.includes("acc")?" acc":""}">${_(s)}</td></tr>`:""}function Y(e,s,o){const i=(e.items||[]).filter(h=>!h.status||h.status==="approved"),a=new Map;i.forEach(h=>{const y=h.room_name||"Без помещения";a.has(y)||a.set(y,[]),a.get(y).push(h)});const c=D(e.subtotal_amount??e.total_amount),l=D(e.discount_amount??0),d=Array.from(a.entries()).map(([h,y])=>{const b=new Map;y.forEach(w=>{const n=w.category||"Прочие работы";b.has(n)||b.set(n,[]),b.get(n).push(w)});const z=y.reduce((w,n)=>w+D(n.amount),0),r=Array.from(b.entries()).map(([w,n])=>{const N=n.reduce((k,P)=>k+D(P.amount),0),E=n.map((k,P)=>`
            <tr>
              <td class="num">${P+1}</td>
              <td>${_(k.name)}</td>
              <td class="center">${_(k.unit)}</td>
              <td class="center">${D(k.quantity)}</td>
              <td class="center">${D(k.times,1)}</td>
              <td class="right">${S(k.price)}</td>
              <td class="right amount">${S(k.amount)}</td>
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
              <tr class="cat-row"><td colspan="7">${_(w)}</td></tr>
              ${E}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="6" class="right">Итого по категории</td>
                <td class="right amount">${S(N)}</td>
              </tr>
            </tfoot>
          </table>
        </div>`}).join("");return`
      <div class="room-block">
        <h3 class="room-title">${_(h)}</h3>
        ${r}
        <div class="room-total">
          <div>
            <div class="room-total-label">Итоговая сумма по помещению</div>
            <div class="room-total-name">${_(h)}</div>
          </div>
          <div class="room-total-amount">${S(z)}</div>
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
`,$=e.estimate_number||String(e.id),u=!!(e.apply_signature&&e.company_signature_url),j=!!(e.apply_stamp&&e.company_stamp_url),v=`
  <div class="header">
    <div class="brand"><img class="brand-logo" src="${window.location.origin}/logo-print.png" alt="FixKey"/><b class="brand-word">Fix<span>Key</span></b></div>
    <div class="doc-title">
      <h1>Смета № ${_($)}</h1>
      <p>от ${Q(e.created_at)}</p>
    </div>
  </div>

  <div class="doc-subtitle">
    <h2>СМЕТА НА РАБОТЫ</h2>
    <p>Расчёт ремонтно-отделочных работ</p>
    ${e.contract_number?`<p>Приложение к договору № ${_(e.contract_number)}${e.contract_date?` от ${Q(e.contract_date)}`:""}</p>`:""}
  </div>

  <hr class="thin" />

  <div class="info-grid">
    <div>
      <div class="label">ID объекта</div>
      <div class="value">${_(s.object_code)}</div>
    </div>
    <div>
      <div class="label">Заказчик</div>
      <div class="value">${_(s.client_name)}</div>
    </div>
    <div>
      <div class="label">Контактный телефон</div>
      <div class="value">${_(s.client_phone||"—")}</div>
    </div>
    <div>
      <div class="label">Характеристики объекта</div>
      <div class="value">${_(s.object_type)} · ${s.area} м²</div>
    </div>
  </div>

  ${d}

  <div class="summary">
    <div class="summary-box">
      ${l>0?`
      <div class="summary-row">
        <span>Сумма до скидки:</span>
        <span>${S(c)}</span>
      </div>
      <div class="summary-row discount">
        <span>Скидка:</span>
        <span>-${S(l)}</span>
      </div>`:""}
      <div class="summary-total">
        <span>ИТОГО К ОПЛАТЕ:</span>
        <span>${S(e.total_amount)}</span>
      </div>
    </div>
  </div>

  ${e.notes?`
  <div class="notes">
    <div class="label">Примечания</div>
    <div>${_(e.notes)}</div>
  </div>`:""}

  <hr class="thin" />

  <div class="parties">
    <div class="party-card">
      <div class="party-head">Исполнитель</div>
      <table class="party-table">
        <tr><td colspan="2" class="party-name">${_(/предприним/i.test(e.company_entity_type||"")&&e.company_contact_full_name?`ИП ${e.company_contact_full_name}`:e.company_name||o)}</td></tr>
        ${e.company_ogrn&&/предприним|юрид/i.test(e.company_entity_type||"")?C(/юрид/i.test(e.company_entity_type||"")?"ОГРН":"ОГРНИП",e.company_ogrn):""}
        ${C("ИНН",e.company_inn)}
        ${/юрид/i.test(e.company_entity_type||"")?C("КПП",e.company_kpp):""}
        ${C("Адрес",e.company_legal_address)}
        ${C("Телефон",e.company_phone)}
        ${C("E-mail",e.company_email)}
        ${C("Сайт",e.company_website)}
        ${e.company_account_number||e.company_bank_name?'<tr><td colspan="2" class="bank-sub">Банковские реквизиты</td></tr>':""}
        ${C("Расчётный счёт",X(e.company_account_number),"acc hl")}
        ${C("Банк",e.company_bank_name)}
        ${C("БИК",e.company_bik,"acc")}
        ${C("Корр. счёт",X(e.company_correspondent_account),"acc")}
      </table>
    </div>
    <div class="party-card">
      <div class="party-head">Заказчик</div>
      <table class="party-table">
        <tr><td colspan="2" class="party-name">${_(s.client_name)}</td></tr>
        ${C("Телефон",s.client_phone)}
        ${C("E-mail",s.email||e.email)}
        ${C("Адрес объекта",s.address||e.address)}
      </table>
    </div>
  </div>

  <div class="sign-row">
    <div class="sign-col${j?" with-stamp":""}">
      <div class="label">От имени Исполнителя</div>
      <div class="sign-box">
        ${u?`<img class="sig" src="${_(e.company_signature_url||"")}" crossorigin="anonymous" alt=""/>`:""}
        ${j?`<img class="stamp" src="${_(e.company_stamp_url||"")}" crossorigin="anonymous" alt=""/>`:""}
      </div>
      <div class="who">${_(e.company_contact_full_name||e.company_name||o)}</div>
      <div class="hint">(подпись)</div>
    </div>
    <div class="sign-col">
      <div class="label">От имени Заказчика</div>
      <div class="sign-box"></div>
      <div class="who">${_(s.client_name)}</div>
      <div class="hint">(подпись)</div>
    </div>
  </div>`,f=`Смета № ${_($)} — ${_(s.client_name)}`;return{styles:p,bodyContent:v,title:f}}function Ut(e,s,o){const{styles:i,bodyContent:a,title:c}=Y(e,s,o),l=`<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8" />
<title>${c}</title>
<style>${i}</style>
</head>
<body>
<div class="est-root">${a}</div>
</body>
</html>`,d=window.open("","_blank","width=900,height=1000");if(!d)return;d.document.open(),d.document.write(l),d.document.close();let p=!1;const $=()=>{p||(p=!0,d.focus(),d.print())},u=()=>{const j=Array.from(d.document.images).filter(f=>!f.complete);if(!j.length)return setTimeout($,200);let v=j.length;j.forEach(f=>{const h=()=>{v-=1,v<=0&&setTimeout($,200)};f.addEventListener("load",h,{once:!0}),f.addEventListener("error",h,{once:!0})}),setTimeout($,5e3)};d.document.readyState==="complete"?u():d.onload=u}function Z(e,s){let o=e;for(;;){const i=s.exec(o);if(!i)return o;const a=o.indexOf("{",i.index);if(a===-1)return o;let c=0,l=-1;for(let d=a;d<o.length;d++)if(o[d]==="{")c++;else if(o[d]==="}"&&(c--,c===0)){l=d;break}if(l===-1)return o;o=o.slice(0,i.index)+o.slice(l+1),s.lastIndex=0}}function rt(e,s){return Z(Z(e,/@page\b/g),/@media\s+print\b/g).replace(/(^|\})\s*([^{}@]+)\s*\{/g,(i,a,c)=>{const l=c.split(",").map(d=>{const p=d.trim();return p?p==="*"?`${s}, ${s} *`:/^(html|body)$/i.test(p)||p===".est-root"?s:p.startsWith(".est-root ")?`${s} ${p.slice(10)}`:`${s} ${p}`:""}).filter(Boolean).join(", ");return`${a} ${l} {`})}const lt=`
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
`;function qt(e,s,o,i="est-preview"){const{styles:a,bodyContent:c}=Y(e,s,o);return`<style>${rt(a+lt,`#${i}`)}</style><div id="${i}" class="est-root">${c}</div>`}async function Kt(e,s,o){await dt(e,s,o,"save")}async function Vt(e,s,o){return await dt(e,s,o,"base64")||""}async function dt(e,s,o,i){const{styles:a,bodyContent:c}=Y(e,s,o);return ot(l=>{l.id="pdf-scope-estimate",l.className="est-root",l.innerHTML=`<style>${rt(a+lt,"#pdf-scope-estimate")}</style>${c}`},{filename:`Смета №${e.estimate_number||e.id}.pdf`,mode:i})}function _(e){const s=document.createElement("div");return s.textContent=e??"",s.innerHTML}const tt=e=>String(e??"").replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\r?\n/g," "),F=(e,s=0)=>{const o=typeof e=="string"?parseFloat(e):Number(e);return Number.isFinite(o)?o:s},H=e=>new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0}).format(F(e))+" ₽";function A(e){const s=document.createElement("div");return s.textContent=e??"",s.innerHTML}function Ct(e,s){const o=new Map;return e.forEach(i=>{const a=s.find(d=>d.id===i.material_id),c=i.shop_name||(a==null?void 0:a.shop_name)||"Магазин не указан";o.has(c)||o.set(c,{name:c,address:"",phone:"",items:[],sum:0});const l=o.get(c);!l.address&&(a!=null&&a.shop_address)&&(l.address=a.shop_address),!l.phone&&(a!=null&&a.shop_phone)&&(l.phone=a.shop_phone),l.items.push(i),l.sum+=F(i.qty)*F(i.price)}),Array.from(o.values()).sort((i,a)=>a.sum-i.sum)}function ct(e,s,o,i,a="Смета на материал"){const c=Ct(s,o),l=c.reduce((f,h)=>f+h.sum,0),d=Array.from(new Set(s.map(f=>f.room_name).filter(Boolean))),p=d.length?d.join(", "):"Без помещения",$=c.map(f=>{const h=f.items.map((b,z)=>`
            <tr>
              <td class="num">${z+1}</td>
              <td>${A(b.name)}</td>
              <td>${A(b.room_name||"—")}</td>
              <td class="center">${F(b.qty)}</td>
              <td class="center">${A(b.unit)}</td>
              <td class="right">${H(b.price)}</td>
              <td class="right amount">${H(F(b.qty)*F(b.price))}</td>
            </tr>`).join(""),y=f.address?`Адрес: ${A(f.address)}`:"";return`
      <div class="room-block">
        <div class="cat-block">
          <table>
            <thead>
              <tr>
                <th class="num">№</th>
                <th>Наименование материала</th>
                <th>Помещение</th>
                <th class="center">Кол-во</th>
                <th class="center">Ед.</th>
                <th class="right">Цена</th>
                <th class="right">Сумма</th>
              </tr>
            </thead>
            <tbody>
              <tr class="cat-row"><td colspan="7">${A(f.name)}${y?` — ${y}`:""}</td></tr>
              ${h}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="6" class="right">Итого по магазину</td>
                <td class="right amount">${H(f.sum)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>`}).join(""),u=`
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
  thead th:nth-child(1) { width: 34px; }
  thead th:nth-child(2) { width: auto; }
  thead th:nth-child(3) { width: 110px; }
  thead th:nth-child(4) { width: 62px; }
  thead th:nth-child(5) { width: 48px; }
  thead th:nth-child(6) { width: 84px; }
  thead th:nth-child(7) { width: 94px; }
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
  .num { color: #1a1a1a; white-space: nowrap; word-break: normal; }
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
  /* Колонтитулы: сверху объект и заказчик, снизу номер страницы */
  @page {
    size: A4 portrait;
    margin: 16mm 10mm 14mm;
    @top-left {
      content: "${tt(`Материалы · объект ${e.object_code||""}`.trim())}";
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 8.5pt;
      color: #6B4508;
    }
    @top-right {
      content: "${tt(e.client_name||i)}";
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
    .est-root { padding: 0 2mm; width: 100%; max-width: 100%; margin: 0; overflow: visible; }
    .no-print { display: none; }

    /* Длинные списки переносим по строкам, а не блоком целиком:
       иначе на листе остаётся пустота. Шапка повторяется на каждой
       странице, чтобы был виден перечень колонок. */
    .cat-block, .room-block { break-inside: auto; }
    .cat-block { overflow: visible; -webkit-box-decoration-break: clone; box-decoration-break: clone; }
    table { break-inside: auto; }
    tr, .cat-row, tfoot tr { break-inside: avoid; }
    thead { display: table-header-group; }
    tfoot { display: table-row-group; }
    thead th:first-child { border-top-left-radius: 9px; }
    thead th:last-child { border-top-right-radius: 9px; }
    .room-title, .cat-row { break-after: avoid; }
    .room-total { break-before: avoid; }
    tbody { orphans: 3; widows: 3; }

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
`,j=`
  <div class="header">
    <div class="brand"><img class="brand-logo" src="${window.location.origin}/logo-print.png" alt="FixKey"/><b class="brand-word">Fix<span>Key</span></b></div>
    <div class="doc-title">
      <h1>${A(a)}</h1>
      <p>Объект № ${A(e.object_code)}</p>
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
      <div class="value">${A(e.object_code)}</div>
    </div>
    <div>
      <div class="label">Заказчик</div>
      <div class="value">${A(e.client_name)}</div>
    </div>
    <div>
      <div class="label">Адрес объекта</div>
      <div class="value">${A(e.address||"—")}</div>
    </div>
    <div>
      <div class="label">Помещение</div>
      <div class="value">${A(p)}</div>
    </div>
  </div>

  ${$}

  <div class="summary">
    <div class="summary-box">
      <div class="summary-row">
        <span>Помещение:</span>
        <span>${A(p)}</span>
      </div>
      <div class="summary-total">
        <span>ИТОГО:</span>
        <span>${H(l)}</span>
      </div>
    </div>
  </div>

  <hr class="thin" />

  <div class="parties">
    <div>
      <div class="label">Исполнитель</div>
      <div class="name">${A(i)}</div>
    </div>
    <div>
      <div class="label">Заказчик</div>
      <div class="name">${A(e.client_name)}</div>
    </div>
  </div>`,v=`${A(a)} № ${e.object_code} — ${A(e.client_name)}`;return{styles:u,bodyContent:j,title:v}}function Wt(e,s,o,i,a=!1,c){const{styles:l,bodyContent:d,title:p}=ct(e,s,o,i,c),$=`<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8" />
<title>${p}</title>
<style>${l}</style>
</head>
<body>
<div class="est-root">${d}</div>
</body>
</html>`,u=window.open("","_blank","width=900,height=1000");u&&(u.document.open(),u.document.write($),u.document.close(),a&&(u.onload=()=>{u.focus(),u.print()}))}function et(e,s){let o=e;for(;;){const i=s.exec(o);if(!i)return o;const a=o.indexOf("{",i.index);if(a===-1)return o;let c=0,l=-1;for(let d=a;d<o.length;d++)if(o[d]==="{")c++;else if(o[d]==="}"&&(c--,c===0)){l=d;break}if(l===-1)return o;o=o.slice(0,i.index)+o.slice(l+1),s.lastIndex=0}}function Et(e,s){return et(et(e,/@page\b/g),/@media\s+print\b/g).replace(/(^|\})\s*([^{}@]+)\s*\{/g,(i,a,c)=>{const l=c.split(",").map(d=>{const p=d.trim();return p?p==="*"?`${s}, ${s} *`:/^(html|body)$/i.test(p)||p===".est-root"?s:p.startsWith(".est-root ")?`${s} ${p.slice(10)}`:`${s} ${p}`:""}).filter(Boolean).join(", ");return`${a} ${l} {`})}const St=`
  .room-block, .cat-block { page-break-inside: auto !important; break-inside: auto !important; }
  .cat-block { border: 1.2px solid #6B4508; border-radius: 10px; overflow: hidden; margin-bottom: 14px; }
  .cat-block thead th { border: 1.2px solid #6B4508; }
  .cat-block tbody td, .cat-block tfoot td { border: 1.2px solid #6B4508 !important; }
  .cat-block tr > *:first-child { border-left: none !important; }
  .cat-block tr > *:last-child { border-right: none !important; }
  .cat-block thead tr > * { border-top: none !important; }
  .cat-block tfoot tr:last-child > * { border-bottom: none !important; }
  .cat-row td { background: #B9A27A; color: #1F1405; }
  tbody td:nth-child(5) { white-space: nowrap; word-break: normal; }
  thead th { white-space: nowrap; }
  thead th:nth-child(1) { color: #ffffff; }
  thead th:nth-child(3) { width: 100px; }
  thead th:nth-child(4) { width: 70px; }
`;function Dt(e,s,o,i,a){const{styles:c,bodyContent:l}=ct(e,s,o,i,a);return`<style>${Et(c+St,"#pdf-scope-materials")}</style>${l}`}async function Yt(e,s,o,i,a){await pt(e,s,o,i,"save",a)}async function Gt(e,s,o,i,a){return await pt(e,s,o,i,"base64",a)||""}async function pt(e,s,o,i,a,c="Смета на материал"){return ot(l=>{l.id="pdf-scope-materials",l.className="est-root",l.innerHTML=Dt(e,s,o,i,c)},{filename:`${c} ${e.object_code}.pdf`,mode:a})}const I="w-full bg-[#161616] border border-white/10 rounded-lg px-3 min-h-[44px] text-base sm:text-sm outline-none focus:border-[#D4AF37]/50",at=e=>{const s=new Date;return s.setDate(s.getDate()+e),s.toISOString().slice(0,10)};function Bt({open:e,onOpenChange:s,task:o,objectId:i,executorId:a,onSaved:c}){const[l,d]=x.useState([]),[p,$]=x.useState([]),[u,j]=x.useState(""),[v,f]=x.useState(""),[h,y]=x.useState(""),[b,z]=x.useState(""),[r,w]=x.useState(""),[n,N]=x.useState(!1),[E,k]=x.useState("");x.useEffect(()=>{var m;e&&(k(""),y((o==null?void 0:o.title)||""),z((o==null?void 0:o.description)||""),w(((m=o==null?void 0:o.due_date)==null?void 0:m.slice(0,10))||at(3)),j((o==null?void 0:o.executor_id)??a??""),f((o==null?void 0:o.object_id)??i??""),!o&&!a&&U.list().then(L=>{const K=(L.executors||[]).filter(mt=>!mt.is_archived);d(K),K.length===1&&j(K[0].id)}).catch(()=>d([])),!o&&!i&&st.list().then(L=>$(L.objects||[])).catch(()=>$([])))},[e,o,i,a]);const P=async()=>{if(k(""),!o&&!u)return k("Выберите исполнителя");if(!o&&!v)return k("Выберите объект");if(h.trim().length<3)return k("Напишите, что нужно сделать");N(!0);try{o?await M.update(o.id,{title:h,description:b,due_date:r}):await M.create({executor_id:Number(u),object_id:Number(v),title:h,description:b,due_date:r}),c(),s(!1)}catch(m){k((m==null?void 0:m.message)||"Не удалось сохранить")}finally{N(!1)}};return t.jsx(ut,{open:e,onOpenChange:s,children:t.jsxs(bt,{className:"bg-[#1f1f1f] border-white/10 text-white sm:max-w-lg",children:[t.jsx(gt,{children:t.jsx(wt,{children:o?"Задание":"Новое задание исполнителю"})}),!o&&!a&&t.jsxs("label",{className:"flex flex-col gap-1",children:[t.jsx("span",{className:"text-xs text-white/50",children:"Исполнитель"}),t.jsxs("select",{value:u,onChange:m=>j(Number(m.target.value)||""),className:I,children:[t.jsx("option",{value:"",children:"— выберите —"}),l.map(m=>t.jsxs("option",{value:m.id,children:[m.display_name,m.specialty?` · ${m.specialty}`:""]},m.id))]}),l.length===0&&t.jsx("span",{className:"text-[11px] text-white/40",children:"Сначала добавьте исполнителя в разделе «Исполнители»"})]}),!o&&!i&&t.jsxs("label",{className:"flex flex-col gap-1",children:[t.jsx("span",{className:"text-xs text-white/50",children:"Объект"}),t.jsxs("select",{value:v,onChange:m=>f(Number(m.target.value)||""),className:I,children:[t.jsx("option",{value:"",children:"— выберите —"}),p.map(m=>t.jsxs("option",{value:m.id,children:[m.object_code," ",m.address?`— ${m.address}`:""]},m.id))]})]}),t.jsxs("label",{className:"flex flex-col gap-1",children:[t.jsx("span",{className:"text-xs text-white/50",children:"Что сделать"}),t.jsx("input",{value:h,onChange:m=>y(m.target.value),placeholder:"Например: развести электрику на кухне",className:I})]}),t.jsxs("label",{className:"flex flex-col gap-1",children:[t.jsx("span",{className:"text-xs text-white/50",children:"Подробности (необязательно)"}),t.jsx("textarea",{value:b,onChange:m=>z(m.target.value),rows:3,placeholder:"Объём, требования, где взять материал…",className:"w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-base sm:text-sm outline-none focus:border-[#D4AF37]/50"})]}),t.jsxs("div",{className:"flex flex-col gap-1",children:[t.jsx("span",{className:"text-xs text-white/50",children:"Срок"}),t.jsxs("div",{className:"flex flex-wrap gap-2",children:[t.jsx("input",{type:"date",value:r,onChange:m=>w(m.target.value),className:`${I} w-auto flex-1 min-w-[150px]`}),[["Завтра",1],["3 дня",3],["Неделя",7]].map(([m,L])=>t.jsx("button",{type:"button",onClick:()=>w(at(Number(L))),className:"min-h-[44px] px-3 rounded-lg bg-white/5 text-sm text-white/60 hover:text-white",children:m},m))]})]}),E&&t.jsxs("p",{className:"text-sm text-red-400 flex items-center gap-1.5",children:[t.jsx(g,{name:"CircleAlert",size:15}),E]}),t.jsxs("div",{className:"flex flex-col-reverse sm:flex-row gap-2 pt-2 border-t border-white/10",children:[t.jsx("button",{onClick:()=>s(!1),className:"min-h-[44px] px-4 text-sm text-white/50 hover:text-white",children:"Отмена"}),t.jsxs("button",{onClick:P,disabled:n,className:"flex-1 sm:flex-none flex items-center justify-center gap-2 min-h-[44px] px-5 rounded-lg bg-[#D4AF37] hover:bg-[#B8860B] text-[#161616] text-sm font-medium disabled:opacity-60",children:[n&&t.jsx(g,{name:"Loader2",size:15,className:"animate-spin"}),o?"Сохранить":"Поставить задание"]})]})]})})}const Ft={open:{label:"в работе",cls:"bg-blue-500/20 text-blue-300"},done:{label:"выполнено — проверьте",cls:"bg-amber-500/20 text-amber-300"},accepted:{label:"принято",cls:"bg-green-500/20 text-green-300"}};function Pt({objectId:e,executorId:s}){const[o,i]=x.useState([]),[a,c]=x.useState(!0),[l,d]=x.useState({open:!1,task:null}),[p,$]=x.useState(!1),[u,j]=x.useState(null),v=()=>M.list({object_id:e,executor_id:s}).then(r=>i(r.tasks||[])).catch(()=>i([])).finally(()=>c(!1));x.useEffect(()=>{v()},[e,s]);const f=async(r,w)=>{await M.setStatus(r,w).catch(()=>null),v()},h=o.filter(r=>r.status!=="accepted"),y=o.filter(r=>r.status==="accepted"),b=p?o:h,z=h.filter(r=>r.status==="open"&&G(r.due_date,r.status).cls==="text-red-400").length;return t.jsxs("div",{className:"bg-[#1f1f1f] border border-white/10 rounded-xl p-3 sm:p-5",children:[t.jsxs("div",{className:"flex items-center justify-between gap-2 mb-3",children:[t.jsxs("p",{className:"font-medium flex items-center gap-2 flex-wrap",children:[t.jsx(g,{name:"ListTodo",size:16,className:"text-orange-300"}),"Задания исполнителям",z>0&&t.jsxs("span",{className:"px-2 py-0.5 rounded-full text-[11px] bg-red-500/20 text-red-300",children:["просрочено: ",z]})]}),t.jsxs("button",{onClick:()=>d({open:!0,task:null}),className:"flex items-center gap-1.5 min-h-[36px] px-3 rounded-lg bg-[#D4AF37] hover:bg-[#B8860B] text-[#161616] text-xs font-medium shrink-0",children:[t.jsx(g,{name:"Plus",size:14}),"Задание"]})]}),a?t.jsx("div",{className:"flex justify-center py-4",children:t.jsx(g,{name:"Loader2",size:18,className:"animate-spin text-white/40"})}):b.length===0?t.jsx("p",{className:"text-xs text-white/40",children:o.length?"Все задания приняты":"Заданий пока нет. Поставьте задачу со сроком — исполнитель увидит её в своём кабинете."}):t.jsx("ul",{className:"flex flex-col gap-2",children:b.map(r=>{var N,E;const w=Ft[r.status],n=G(r.due_date,r.status);return t.jsxs("li",{className:"rounded-lg border border-white/10 bg-[#161616] p-3",children:[t.jsxs("div",{className:"flex items-start gap-2",children:[t.jsx("span",{className:O("mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0",r.status==="open"?"border-white/20":"border-emerald-500 bg-emerald-500/20 text-emerald-300"),children:r.status!=="open"&&t.jsx(g,{name:"Check",size:13})}),t.jsxs("div",{className:"min-w-0 flex-1",children:[t.jsx("button",{onClick:()=>d({open:!0,task:r}),className:"text-left text-sm font-medium break-words hover:text-[#D4AF37]",children:r.title}),t.jsxs("p",{className:"text-[11px] mt-0.5 flex flex-wrap gap-x-2",children:[t.jsx("span",{className:n.cls,children:n.text}),t.jsx("span",{className:"text-white/40",children:e?r.executor_name:`${r.object_code}${r.address?` · ${r.address}`:""}`})]}),r.description&&t.jsx("p",{className:"text-xs text-white/50 mt-1 whitespace-pre-wrap break-words",children:r.description}),r.status!=="open"&&(r.executor_comment||((N=r.photos)==null?void 0:N.length)>0)&&t.jsxs("div",{className:"mt-2 rounded-md bg-white/[0.03] p-2",children:[r.executor_comment&&t.jsxs("p",{className:"text-xs text-white/70",children:["Исполнитель: ",r.executor_comment]}),((E=r.photos)==null?void 0:E.length)>0&&t.jsx("div",{className:"mt-1.5 flex gap-1.5 overflow-x-auto",children:r.photos.map(k=>t.jsx("button",{onClick:()=>j(k),className:"w-14 h-14 shrink-0 rounded overflow-hidden border border-white/10",children:t.jsx("img",{src:k,alt:"Фото",className:"w-full h-full object-cover",loading:"lazy"})},k))})]})]}),t.jsx("span",{className:O("px-2 py-0.5 rounded-full text-[10px] shrink-0",w.cls),children:w.label})]}),t.jsxs("div",{className:"flex items-center justify-end gap-2 mt-2",children:[r.status==="done"&&t.jsxs(t.Fragment,{children:[t.jsxs("button",{onClick:()=>f(r.id,"open"),className:"flex items-center gap-1 min-h-[36px] px-3 rounded-lg bg-red-500/15 text-red-300 text-xs hover:bg-red-500/25",children:[t.jsx(g,{name:"RotateCcw",size:13}),"На доработку"]}),t.jsxs("button",{onClick:()=>f(r.id,"accepted"),className:"flex items-center gap-1 min-h-[36px] px-3 rounded-lg bg-green-500/20 text-green-300 text-xs hover:bg-green-500/30",children:[t.jsx(g,{name:"Check",size:13}),"Принять"]})]}),t.jsx(Nt,{onConfirm:async()=>{await M.remove(r.id).catch(()=>null),v()}})]})]},r.id)})}),y.length>0&&t.jsx("button",{onClick:()=>$(r=>!r),className:"mt-2 text-xs text-white/50 hover:text-white",children:p?"Скрыть принятые":`Показать принятые (${y.length})`}),t.jsx(Bt,{open:l.open,onOpenChange:r=>d(w=>({...w,open:r})),task:l.task,objectId:e,executorId:s,onSaved:v}),u&&t.jsx("div",{className:"fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-3",onClick:()=>j(null),children:t.jsx("img",{src:u,alt:"Фото",className:"max-w-full max-h-full object-contain"})})]})}function Lt(){var z;const{actId:e}=it(),s=W(),{user:o}=nt(),i=(o==null?void 0:o.role)==="client",[a,c]=x.useState(null),[l,d]=x.useState(!0),[p,$]=x.useState(!1),[u,j]=x.useState(!1),[v,f]=x.useState(!1);x.useEffect(()=>{if(!(a!=null&&a.contract_id)||i)return f(!1);vt.get(a.contract_id).then(r=>{var w;return f(((w=r.options)==null?void 0:w.our_role)==="customer")}).catch(()=>f(!1))},[a==null?void 0:a.contract_id,i]);const h=()=>{e&&R.get(Number(e)).then(c)};x.useEffect(()=>{e&&(d(!0),R.get(Number(e)).then(c).catch(()=>s(i?"/cabinet/objects":"/cabinet/documents")).finally(()=>d(!1)))},[e]);const y=()=>{a&&kt(a)},b=async()=>{if(a){$(!0);try{await ft(V(a.content_html),`Акт ${a.act_number}`)}finally{$(!1)}}};return l?t.jsx(q,{title:"Акт",children:t.jsx("div",{className:"flex items-center justify-center py-24",children:t.jsx(g,{name:"Loader2",size:28,className:"animate-spin text-white/40"})})}):a?t.jsxs(q,{title:`Акт выполненных работ № ${a.act_number}`,children:[t.jsxs("div",{className:"flex items-center justify-between mb-4 flex-wrap gap-3",children:[t.jsxs(B,{to:i?`/cabinet/objects/${a.object_id}`:"/cabinet/documents",className:"inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors",children:[t.jsx(g,{name:"ChevronLeft",size:16}),i?"К объекту":"К документам"]}),t.jsxs("div",{className:"grid grid-cols-2 gap-2 w-full sm:flex sm:items-center sm:w-auto",children:[t.jsx("span",{className:O("col-span-2 justify-self-start px-2.5 py-1 rounded-full text-xs font-medium",a.status==="signed"?"bg-green-500/20 text-green-300":"bg-white/10 text-white/50"),children:a.status==="signed"?"подписан":"черновик"}),!i&&t.jsxs(t.Fragment,{children:[!a.signed_at&&!a.executor_signed_at&&t.jsxs(B,{to:`/cabinet/objects/${a.object_id}/acts/${a.id}/edit`,className:"flex items-center justify-center min-h-[44px] sm:min-h-0 gap-1.5 bg-blue-500 hover:bg-blue-600 transition-colors text-white text-sm px-3 py-2 rounded-lg",children:[t.jsx(g,{name:"Pencil",size:14}),"Редактировать"]}),!v&&t.jsxs(B,{to:`/cabinet/objects/${a.object_id}/invoices/new?act_id=${a.id}`,className:"flex items-center justify-center min-h-[44px] sm:min-h-0 gap-1.5 bg-white/10 hover:bg-white/15 transition-colors text-white text-sm px-3 py-2 rounded-lg",children:[t.jsx(g,{name:"Receipt",size:14}),"Выставить счёт"]}),t.jsxs("button",{onClick:()=>j(!0),className:"flex items-center justify-center min-h-[44px] sm:min-h-0 gap-1.5 bg-white/10 hover:bg-white/15 transition-colors text-white text-sm px-3 py-2 rounded-lg",children:[t.jsx(g,{name:"Mail",size:14}),"Отправить на почту"]})]}),t.jsxs("button",{onClick:y,title:"Печать",className:"flex items-center justify-center gap-1.5 text-sm w-full h-11 sm:w-9 sm:h-9 bg-white/5 hover:bg-white/10 transition-colors rounded-lg",children:[t.jsx(g,{name:"Printer",size:15}),t.jsx("span",{className:"sm:hidden",children:"Печать"})]}),t.jsxs("button",{onClick:b,disabled:p,title:"Скачать PDF",className:"flex items-center justify-center gap-1.5 text-sm w-full h-11 sm:w-9 sm:h-9 bg-white/5 hover:bg-white/10 transition-colors rounded-lg disabled:opacity-60",children:[p?t.jsx(g,{name:"Loader2",size:15,className:"animate-spin"}):t.jsx(g,{name:"Download",size:15}),t.jsx("span",{className:"sm:hidden",children:"PDF"})]})]})]}),i?t.jsx(At,{signedAt:a.signed_at,isSigned:a.status==="signed",docLabel:"Акт",docTitle:`акт № ${a.act_number}`,amountLabel:"Сумма по акту",amount:Number(a.total_amount),onSign:()=>R.sign(a.id),onDone:h}):v?t.jsx(xt,{signedAt:a.executor_signed_at,kind:"act"}):a.signed_at&&t.jsxs("div",{className:"bg-emerald-500/10 border border-emerald-500/30 rounded-xl mb-4 p-3 sm:p-4 flex items-center gap-3 max-w-4xl mx-auto text-sm",children:[t.jsx(g,{name:"BadgeCheck",size:20,className:"text-emerald-400"}),"Заказчик подписал акт онлайн"," ",new Date(a.signed_at).toLocaleString("ru-RU",{day:"numeric",month:"long",hour:"2-digit",minute:"2-digit"})]}),t.jsx("div",{className:"overflow-x-auto md:overflow-visible max-w-4xl mx-auto",children:t.jsx("div",{className:"bg-white text-[#161616] rounded-xl p-4 sm:p-12 max-w-4xl mx-auto shadow-lg break-words",children:t.jsx("div",{dangerouslySetInnerHTML:{__html:V(a.content_html)}})})}),t.jsx(yt,{open:u,onOpenChange:j,docName:"акт",objectId:a.object_id,fileName:`Акт_${a.act_number}.pdf`,makePdf:()=>ht(V(a.content_html),`Акт ${a.act_number}`),send:r=>R.sendEmail(a.id,r),extraFiles:(((z=a.options)==null?void 0:z.attachments)||[]).map(r=>r.name)})]}):null}const Jt=Object.freeze(Object.defineProperty({__proto__:null,default:Lt},Symbol.toStringTag,{value:"Module"}));function Tt({executorId:e}){const s=W(),[o,i]=x.useState([]);return x.useEffect(()=>{st.list().then(a=>i(a.objects||[])).catch(()=>i([]))},[]),o.length?t.jsxs("select",{value:"",onChange:a=>a.target.value&&s(`/cabinet/objects/${a.target.value}/contracts/new?role=customer&executor_id=${e}`),className:"bg-[#D4AF37] text-[#161616] font-medium rounded-lg px-3 min-h-[40px] text-sm outline-none cursor-pointer",children:[t.jsx("option",{value:"",children:"+ Договор на объект…"}),o.map(a=>t.jsxs("option",{value:a.id,className:"bg-[#1f1f1f] text-white",children:[a.object_code," ",a.address?`— ${a.address}`:""]},a.id))]}):null}function Mt(){var w;const{id:e}=it(),s=W(),{user:o}=nt(),i=(o==null?void 0:o.role)==="owner"||(o==null?void 0:o.role)==="admin",[a,c]=x.useState(null),[l,d]=x.useState([]),[p,$]=x.useState(!0),[u,j]=x.useState(!1),[v,f]=x.useState(null),h=()=>{e&&Promise.all([U.get(Number(e)),U.reports({executor_id:Number(e)}).catch(()=>({reports:[]}))]).then(([n,N])=>{c(n.executor),d(N.reports||[])}).catch(()=>s("/cabinet/executors")).finally(()=>$(!1))};if(x.useEffect(h,[e]),p||!a)return t.jsx(q,{title:"Исполнитель",children:t.jsx("div",{className:"flex justify-center py-24",children:t.jsx(g,{name:"Loader2",size:26,className:"animate-spin text-white/40"})})});const y=a.contracts||[],b=y.reduce((n,N)=>n+N.total_amount,0),z=y.reduce((n,N)=>n+N.paid,0),r=[["ИНН",a.inn],[a.kind==="legal"?"ОГРН":"ОГРНИП",a.ogrnip],["Паспорт",a.passport],["Телефон",a.phone],["E-mail",a.email],["Адрес",a.address],["Банк",a.bank_name],["БИК",a.bik],["Р/с",a.account],["К/с",a.corr_account]].filter(([,n])=>n);return t.jsxs(q,{title:a.display_name,subtitle:[jt[a.kind],a.specialty].filter(Boolean).join(" · "),children:[t.jsxs("div",{className:"flex flex-wrap items-center gap-2 mb-4",children:[t.jsxs(B,{to:"/cabinet/executors",className:"inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white min-h-[40px]",children:[t.jsx(g,{name:"ChevronLeft",size:16}),"Все исполнители"]}),t.jsx("div",{className:"flex-1"}),t.jsxs("button",{onClick:()=>j(!0),className:"flex items-center gap-2 min-h-[40px] px-3 rounded-lg bg-white/5 hover:bg-white/10 text-sm",children:[t.jsx(g,{name:"Pencil",size:14}),"Реквизиты"]}),i&&!a.is_archived&&t.jsxs("button",{onClick:async()=>{window.confirm("Перенести исполнителя в архив? Договоры и оплаты сохранятся.")&&(await U.archive(a.id),s("/cabinet/executors"))},className:"flex items-center gap-2 min-h-[40px] px-3 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-white/60",children:[t.jsx(g,{name:"Archive",size:14}),"В архив"]})]}),t.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4",children:[t.jsxs("div",{className:"flex flex-col gap-4 min-w-0",children:[t.jsx("div",{className:"grid grid-cols-3 gap-2",children:[["По договорам",T(b),"text-white"],["Оплачено",T(z),"text-emerald-400"],["Долг",T(Math.max(0,b-z)),"text-[#D4AF37]"]].map(([n,N,E])=>t.jsxs("div",{className:"bg-[#1f1f1f] border border-white/10 rounded-xl p-3",children:[t.jsx("p",{className:"text-[11px] text-white/40",children:n}),t.jsx("p",{className:O("text-base sm:text-lg font-semibold",E),children:N})]},n))}),t.jsxs("div",{className:"bg-[#1f1f1f] border border-white/10 rounded-xl p-3 sm:p-5",children:[t.jsxs("div",{className:"flex flex-wrap items-center justify-between gap-2 mb-3",children:[t.jsx("p",{className:"font-medium",children:"Договоры"}),t.jsx(Tt,{executorId:a.id})]}),y.length===0?t.jsx("p",{className:"text-xs text-white/40",children:"Договоров пока нет. Выберите объект ниже, чтобы составить договор."}):t.jsx("ul",{className:"flex flex-col gap-2",children:y.map(n=>t.jsxs("li",{className:"rounded-lg border border-white/10 bg-[#161616]",children:[t.jsxs("div",{className:"flex flex-col sm:flex-row sm:items-center gap-2 p-3",children:[t.jsxs("div",{className:"min-w-0 flex-1",children:[t.jsxs("p",{className:"text-sm font-medium",children:["Договор № ",n.contract_number," · ",n.object_code]}),t.jsxs("p",{className:"text-xs text-white/40",children:[J(n.contract_date),n.work_subject?` · ${n.work_subject}`:""," · ",n.status==="signed"?"подписан":"черновик"]}),t.jsxs("p",{className:"text-[11px] mt-1 flex flex-wrap gap-x-3",children:[t.jsx("span",{className:n.executor_signed_at?"text-emerald-400":"text-amber-300",children:n.executor_signed_at?"исполнитель подписал договор":"договор ждёт подписи исполнителя"}),!!n.acts_count&&t.jsxs("span",{className:n.acts_signed===n.acts_count?"text-emerald-400":"text-amber-300",children:["актов подписано: ",n.acts_signed,"/",n.acts_count]})]})]}),t.jsxs("div",{className:"text-sm text-right",children:[t.jsx("span",{className:"font-medium",children:T(n.total_amount)}),t.jsxs("span",{className:"block text-xs text-emerald-400",children:["оплачено ",T(n.paid)]})]}),t.jsxs("div",{className:"grid grid-cols-3 sm:flex gap-2",children:[t.jsx(B,{to:`/cabinet/objects/${n.object_id}/contracts/${n.id}`,className:"flex items-center justify-center w-full sm:w-9 h-10 sm:h-9 rounded-lg bg-white/5 text-white/50 hover:text-white",title:"Открыть договор",children:t.jsx(g,{name:"Eye",size:15})}),t.jsx(B,{to:`/cabinet/objects/${n.object_id}/acts/new?contract_id=${n.id}`,className:"flex items-center justify-center w-full sm:w-9 h-10 sm:h-9 rounded-lg bg-white/5 text-white/50 hover:text-white",title:"Составить акт",children:t.jsx(g,{name:"FileCheck",size:15})}),t.jsx("button",{onClick:()=>f(v===n.id?null:n.id),className:O("flex items-center justify-center w-full sm:w-9 h-10 sm:h-9 rounded-lg bg-white/5 hover:text-white",v===n.id?"text-[#D4AF37]":"text-white/50"),title:"Оплаты",children:t.jsx(g,{name:"Banknote",size:15})})]})]}),v===n.id&&t.jsx("div",{className:"border-t border-white/10 p-2",children:t.jsx(zt,{contractId:n.id,total:n.total_amount,onChanged:h})})]},n.id))})]}),t.jsx(Pt,{executorId:a.id}),t.jsxs("div",{className:"bg-[#1f1f1f] border border-white/10 rounded-xl p-3 sm:p-5",children:[t.jsx("p",{className:"font-medium mb-3",children:"Отчёты о работе"}),t.jsx(_t,{reports:l,show:"object",canReview:!0,onChanged:h})]})]}),t.jsxs("div",{className:"flex flex-col gap-4",children:[t.jsxs("div",{className:"bg-[#1f1f1f] border border-white/10 rounded-xl p-3 sm:p-5",children:[t.jsx("p",{className:"font-medium mb-3",children:"Реквизиты"}),r.length===0?t.jsx("p",{className:"text-xs text-white/40",children:"Не заполнены"}):t.jsx("dl",{className:"flex flex-col gap-2 text-sm",children:r.map(([n,N])=>t.jsxs("div",{children:[t.jsx("dt",{className:"text-[11px] text-white/40",children:n}),t.jsx("dd",{className:"break-words",children:N})]},n))})]}),t.jsxs("div",{className:"bg-[#1f1f1f] border border-white/10 rounded-xl p-3 sm:p-5",children:[t.jsx("p",{className:"font-medium mb-2",children:"Кабинет исполнителя"}),a.access_enabled?t.jsxs("p",{className:"text-sm text-white/60",children:["Вход открыт: ",t.jsx("span",{className:"text-white",children:a.login_email}),t.jsxs("span",{className:"block text-xs text-white/40 mt-1",children:["Входит через «Войти» на сайте",a.last_login_at?` · был ${J(a.last_login_at)}`:" · ещё не входил"]})]}):t.jsx("p",{className:"text-xs text-white/40",children:"Закрыт. Откройте в «Реквизитах», чтобы исполнитель присылал отчёты с фото."})]}),(((w=a.objects)==null?void 0:w.length)||0)>0&&t.jsxs("div",{className:"bg-[#1f1f1f] border border-white/10 rounded-xl p-3 sm:p-5",children:[t.jsx("p",{className:"font-medium mb-2",children:"Объекты"}),t.jsx("ul",{className:"flex flex-col gap-1",children:a.objects.map(n=>t.jsx("li",{children:t.jsxs(B,{to:`/cabinet/objects/${n.id}`,className:"text-sm text-white/70 hover:text-[#D4AF37]",children:[n.object_code," ",t.jsx("span",{className:"text-white/40",children:n.address})]})},n.id))})]})]})]}),t.jsx($t,{open:u,onOpenChange:j,executor:a,onSaved:h})]})}const Qt=Object.freeze(Object.defineProperty({__proto__:null,default:Mt},Symbol.toStringTag,{value:"Module"}));export{Jt as A,Pt as E,Kt as a,Ut as b,Vt as c,Yt as d,qt as e,Qt as f,Gt as m,Wt as p,Et as s};
