import{r as Ae}from"./RentalContract-CpSaYFjp.js";import{r as l,j as e,k as M,I as v,at as le,as as F,aS as X,x as be,D as Ce,l as ze,m as Se,n as Ee,bw as ee,bx as we,o as de,s as fe,by as Re,t as De,ax as he,w as Fe,aT as Me,L as ne,b7 as He,aU as Ie,J as ie}from"./index-CmqFuu8b.js";import{C as ce,M as Ue,a as je,S as Ke}from"./Company-BqgKYCw2.js";import{A as qe,b as Ve,c as We,d as Ye,e as Ge,f as Je,g as Xe,h as Qe,s as Ze}from"./ActView-Baols22x.js";function te({onConfirm:t,title:n="Удалить безвозвратно?",description:s="Это действие нельзя отменить. Запись будет удалена навсегда.",className:p,size:a=15,label:g,disabled:i,iconName:o="Trash2"}){const[u,h]=l.useState(!1),[A,y]=l.useState(!1),r=async()=>{y(!0);try{await t(),h(!1)}finally{y(!1)}};return e.jsxs(e.Fragment,{children:[e.jsxs("button",{type:"button",disabled:i,onClick:N=>{N.stopPropagation(),h(!0)},title:g||"Удалить",className:M("text-white/40 hover:text-red-400 transition-colors disabled:opacity-40",g&&"flex items-center gap-2",p),children:[e.jsx(v,{name:o,size:a,fallback:"Trash2"}),g]}),e.jsx(qe,{open:u,onOpenChange:h,children:e.jsxs(Ve,{className:"bg-[#1f1f1f] border-white/10 text-white",children:[e.jsxs(We,{children:[e.jsxs(Ye,{className:"flex items-center gap-2",children:[e.jsx(v,{name:"TriangleAlert",size:18,className:"text-red-400"}),n]}),e.jsx(Ge,{className:"text-white/50",children:s})]}),e.jsxs(Je,{children:[e.jsx(Xe,{disabled:A,className:"bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white",children:"Нет, отменить"}),e.jsx(Qe,{disabled:A,onClick:N=>{N.preventDefault(),r()},className:"bg-red-500 text-white hover:bg-red-600",children:A?e.jsx(v,{name:"Loader2",size:16,className:"animate-spin"}):"Да, удалить"})]})]})})]})}const J=(t,n=0)=>{const s=typeof t=="string"?parseFloat(t):Number(t);return Number.isFinite(s)?s:n},G=t=>new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0}).format(J(t))+" ₽",ve=t=>new Date(t).toLocaleDateString("ru-RU",{day:"numeric",month:"long",year:"numeric"});function ye(t){return(t||"").replace(/\s+/g,"").replace(/(\d{4})(?=\d)/g,"$1 ")}function T(t,n,s=""){return n?`<tr class="${s.includes("hl")?"hl":""}"><td class="rk">${t}</td><td class="rv${s.includes("acc")?" acc":""}">${E(n)}</td></tr>`:""}function ge(t,n,s){const p=(t.items||[]).filter(b=>!b.status||b.status==="approved"),a=new Map;p.forEach(b=>{const w=b.room_name||"Без помещения";a.has(w)||a.set(w,[]),a.get(w).push(b)});const g=J(t.subtotal_amount??t.total_amount),i=J(t.discount_amount??0),o=Array.from(a.entries()).map(([b,w])=>{const x=new Map;w.forEach(C=>{const d=C.category||"Прочие работы";x.has(d)||x.set(d,[]),x.get(d).push(C)});const $=w.reduce((C,d)=>C+J(d.amount),0),c=Array.from(x.entries()).map(([C,d])=>{const z=d.reduce((_,B)=>_+J(B.amount),0),f=d.map((_,B)=>`
            <tr>
              <td class="num">${B+1}</td>
              <td>${E(_.name)}</td>
              <td class="center">${E(_.unit)}</td>
              <td class="center">${J(_.quantity)}</td>
              <td class="center">${J(_.times,1)}</td>
              <td class="right">${G(_.price)}</td>
              <td class="right amount">${G(_.amount)}</td>
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
              <tr class="cat-row"><td colspan="7">${E(C)}</td></tr>
              ${f}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="6" class="right">Итого по категории</td>
                <td class="right amount">${G(z)}</td>
              </tr>
            </tfoot>
          </table>
        </div>`}).join("");return`
      <div class="room-block">
        <h3 class="room-title">${E(b)}</h3>
        ${c}
        <div class="room-total">
          <div>
            <div class="room-total-label">Итоговая сумма по помещению</div>
            <div class="room-total-name">${E(b)}</div>
          </div>
          <div class="room-total-amount">${G($)}</div>
        </div>
      </div>`}).join(""),u=`
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
`,h=t.estimate_number||String(t.id),A=!!(t.apply_signature&&t.company_signature_url),y=!!(t.apply_stamp&&t.company_stamp_url),r=`
  <div class="header">
    <div class="brand"><img class="brand-logo" src="${window.location.origin}/logo-print.png" alt="FixKey"/><b class="brand-word">Fix<span>Key</span></b></div>
    <div class="doc-title">
      <h1>Смета № ${E(h)}</h1>
      <p>от ${ve(t.created_at)}</p>
    </div>
  </div>

  <div class="doc-subtitle">
    <h2>СМЕТА НА РАБОТЫ</h2>
    <p>Расчёт ремонтно-отделочных работ</p>
    ${t.contract_number?`<p>Приложение к договору № ${E(t.contract_number)}${t.contract_date?` от ${ve(t.contract_date)}`:""}</p>`:""}
  </div>

  <hr class="thin" />

  <div class="info-grid">
    <div>
      <div class="label">ID объекта</div>
      <div class="value">${E(n.object_code)}</div>
    </div>
    <div>
      <div class="label">Заказчик</div>
      <div class="value">${E(n.client_name)}</div>
    </div>
    <div>
      <div class="label">Контактный телефон</div>
      <div class="value">${E(n.client_phone||"—")}</div>
    </div>
    <div>
      <div class="label">Характеристики объекта</div>
      <div class="value">${E(n.object_type)} · ${n.area} м²</div>
    </div>
  </div>

  ${o}

  <div class="summary">
    <div class="summary-box">
      ${i>0?`
      <div class="summary-row">
        <span>Сумма до скидки:</span>
        <span>${G(g)}</span>
      </div>
      <div class="summary-row discount">
        <span>Скидка:</span>
        <span>-${G(i)}</span>
      </div>`:""}
      <div class="summary-total">
        <span>ИТОГО К ОПЛАТЕ:</span>
        <span>${G(t.total_amount)}</span>
      </div>
    </div>
  </div>

  ${t.notes?`
  <div class="notes">
    <div class="label">Примечания</div>
    <div>${E(t.notes)}</div>
  </div>`:""}

  <hr class="thin" />

  <div class="parties">
    <div class="party-card">
      <div class="party-head">Исполнитель</div>
      <table class="party-table">
        <tr><td colspan="2" class="party-name">${E(/предприним/i.test(t.company_entity_type||"")&&t.company_contact_full_name?`ИП ${t.company_contact_full_name}`:t.company_name||s)}</td></tr>
        ${t.company_ogrn&&/предприним|юрид/i.test(t.company_entity_type||"")?T(/юрид/i.test(t.company_entity_type||"")?"ОГРН":"ОГРНИП",t.company_ogrn):""}
        ${T("ИНН",t.company_inn)}
        ${/юрид/i.test(t.company_entity_type||"")?T("КПП",t.company_kpp):""}
        ${T("Адрес",t.company_legal_address)}
        ${T("Телефон",t.company_phone)}
        ${T("E-mail",t.company_email)}
        ${T("Сайт",t.company_website)}
        ${t.company_account_number||t.company_bank_name?'<tr><td colspan="2" class="bank-sub">Банковские реквизиты</td></tr>':""}
        ${T("Расчётный счёт",ye(t.company_account_number),"acc hl")}
        ${T("Банк",t.company_bank_name)}
        ${T("БИК",t.company_bik,"acc")}
        ${T("Корр. счёт",ye(t.company_correspondent_account),"acc")}
      </table>
    </div>
    <div class="party-card">
      <div class="party-head">Заказчик</div>
      <table class="party-table">
        <tr><td colspan="2" class="party-name">${E(n.client_name)}</td></tr>
        ${T("Телефон",n.client_phone)}
        ${T("E-mail",n.email||t.email)}
        ${T("Адрес объекта",n.address||t.address)}
      </table>
    </div>
  </div>

  <div class="sign-row">
    <div class="sign-col${y?" with-stamp":""}">
      <div class="label">От имени Исполнителя</div>
      <div class="sign-box">
        ${A?`<img class="sig" src="${E(t.company_signature_url||"")}" crossorigin="anonymous" alt=""/>`:""}
        ${y?`<img class="stamp" src="${E(t.company_stamp_url||"")}" crossorigin="anonymous" alt=""/>`:""}
      </div>
      <div class="who">${E(t.company_contact_full_name||t.company_name||s)}</div>
      <div class="hint">(подпись)</div>
    </div>
    <div class="sign-col">
      <div class="label">От имени Заказчика</div>
      <div class="sign-box"></div>
      <div class="who">${E(n.client_name)}</div>
      <div class="hint">(подпись)</div>
    </div>
  </div>`,N=`Смета № ${E(h)} — ${E(n.client_name)}`;return{styles:u,bodyContent:r,title:N}}function wt(t,n,s){const{styles:p,bodyContent:a,title:g}=ge(t,n,s),i=`<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8" />
<title>${g}</title>
<style>${p}</style>
</head>
<body>
<div class="est-root">${a}</div>
</body>
</html>`,o=window.open("","_blank","width=900,height=1000");if(!o)return;o.document.open(),o.document.write(i),o.document.close();let u=!1;const h=()=>{u||(u=!0,o.focus(),o.print())},A=()=>{const y=Array.from(o.document.images).filter(N=>!N.complete);if(!y.length)return setTimeout(h,200);let r=y.length;y.forEach(N=>{const b=()=>{r-=1,r<=0&&setTimeout(h,200)};N.addEventListener("load",b,{once:!0}),N.addEventListener("error",b,{once:!0})}),setTimeout(h,5e3)};o.document.readyState==="complete"?A():o.onload=A}function Ne(t,n){let s=t;for(;;){const p=n.exec(s);if(!p)return s;const a=s.indexOf("{",p.index);if(a===-1)return s;let g=0,i=-1;for(let o=a;o<s.length;o++)if(s[o]==="{")g++;else if(s[o]==="}"&&(g--,g===0)){i=o;break}if(i===-1)return s;s=s.slice(0,p.index)+s.slice(i+1),n.lastIndex=0}}function Pe(t,n){return Ne(Ne(t,/@page\b/g),/@media\s+print\b/g).replace(/(^|\})\s*([^{}@]+)\s*\{/g,(p,a,g)=>{const i=g.split(",").map(o=>{const u=o.trim();return u?u==="*"?`${n}, ${n} *`:/^(html|body)$/i.test(u)||u===".est-root"?n:u.startsWith(".est-root ")?`${n} ${u.slice(10)}`:`${n} ${u}`:""}).filter(Boolean).join(", ");return`${a} ${i} {`})}const Be=`
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
`;function jt(t,n,s,p="est-preview"){const{styles:a,bodyContent:g}=ge(t,n,s);return`<style>${Pe(a+Be,`#${p}`)}</style><div id="${p}" class="est-root">${g}</div>`}async function vt(t,n,s){await Le(t,n,s,"save")}async function yt(t,n,s){return await Le(t,n,s,"base64")||""}async function Le(t,n,s,p){const{styles:a,bodyContent:g}=ge(t,n,s);return Ae(i=>{i.id="pdf-scope-estimate",i.className="est-root",i.innerHTML=`<style>${Pe(a+Be,"#pdf-scope-estimate")}</style>${g}`},{filename:`Смета №${t.estimate_number||t.id}.pdf`,mode:p})}function E(t){const n=document.createElement("div");return n.textContent=t??"",n.innerHTML}function et({receipt:t,onClose:n}){return l.useEffect(()=>{const s=a=>a.key==="Escape"&&n();window.addEventListener("keydown",s);const p=document.body.style.overflow;return document.body.style.overflow="hidden",()=>{window.removeEventListener("keydown",s),document.body.style.overflow=p}},[n]),e.jsxs("div",{className:"fixed inset-0 z-[60] flex flex-col bg-black/95",onClick:n,children:[e.jsxs("div",{className:"flex items-center gap-3 px-3 py-2 pt-[calc(env(safe-area-inset-top)+8px)] text-white",onClick:s=>s.stopPropagation(),children:[e.jsxs("div",{className:"min-w-0 flex-1",children:[e.jsx("p",{className:"text-sm font-medium truncate",children:t.shop_name||"Чек"}),e.jsxs("p",{className:"text-xs text-white/50 truncate",children:[le(t.created_at),Number(t.amount)>0?` · ${F(Number(t.amount))}`:"",t.uploader_name?` · ${t.uploader_name}`:""]})]}),e.jsx("a",{href:t.file_url,target:"_blank",rel:"noreferrer",className:"w-11 h-11 flex items-center justify-center rounded-lg bg-white/10","aria-label":"Открыть оригинал",children:e.jsx(v,{name:"Download",size:18})}),e.jsx("button",{onClick:n,className:"w-11 h-11 flex items-center justify-center rounded-lg bg-white/10","aria-label":"Закрыть",children:e.jsx(v,{name:"X",size:20})})]}),e.jsx("div",{className:"flex-1 min-h-0 flex items-center justify-center p-2 overflow-auto",children:t.file_type==="photo"?e.jsx("img",{src:t.file_url,alt:"Чек",className:"max-w-full max-h-full object-contain",onClick:s=>s.stopPropagation()}):e.jsxs("a",{href:t.file_url,target:"_blank",rel:"noreferrer",onClick:s=>s.stopPropagation(),className:"flex items-center gap-2 rounded-lg bg-white/10 px-4 py-3 text-white",children:[e.jsx(v,{name:"FileText",size:18}),"Открыть файл чека"]})})]})}const oe="w-full bg-[#161616] border border-white/10 rounded-lg px-3 min-h-[44px] text-base sm:text-sm outline-none focus:border-[#D4AF37]/50",_e=t=>{const n=new Date;return n.setDate(n.getDate()+t),n.toISOString().slice(0,10)};function tt({open:t,onOpenChange:n,task:s,objectId:p,executorId:a,onSaved:g}){const[i,o]=l.useState([]),[u,h]=l.useState([]),[A,y]=l.useState(""),[r,N]=l.useState(""),[b,w]=l.useState(""),[x,$]=l.useState(""),[c,C]=l.useState(""),[d,z]=l.useState(!1),[f,_]=l.useState("");l.useEffect(()=>{var k;t&&(_(""),w((s==null?void 0:s.title)||""),$((s==null?void 0:s.description)||""),C(((k=s==null?void 0:s.due_date)==null?void 0:k.slice(0,10))||_e(3)),y((s==null?void 0:s.executor_id)??a??""),N((s==null?void 0:s.object_id)??p??""),!s&&!a&&X.list().then(D=>{const H=(D.executors||[]).filter(I=>!I.is_archived);o(H),H.length===1&&y(H[0].id)}).catch(()=>o([])),!s&&!p&&be.list().then(D=>h(D.objects||[])).catch(()=>h([])))},[t,s,p,a]);const B=async()=>{if(_(""),!s&&!A)return _("Выберите исполнителя");if(!s&&!r)return _("Выберите объект");if(b.trim().length<3)return _("Напишите, что нужно сделать");z(!0);try{s?await ee.update(s.id,{title:b,description:x,due_date:c}):await ee.create({executor_id:Number(A),object_id:Number(r),title:b,description:x,due_date:c}),g(),n(!1)}catch(k){_((k==null?void 0:k.message)||"Не удалось сохранить")}finally{z(!1)}};return e.jsx(Ce,{open:t,onOpenChange:n,children:e.jsxs(ze,{className:"bg-[#1f1f1f] border-white/10 text-white sm:max-w-lg",children:[e.jsx(Se,{children:e.jsx(Ee,{children:s?"Задание":"Новое задание исполнителю"})}),!s&&!a&&e.jsxs("label",{className:"flex flex-col gap-1",children:[e.jsx("span",{className:"text-xs text-white/50",children:"Исполнитель"}),e.jsxs("select",{value:A,onChange:k=>y(Number(k.target.value)||""),className:oe,children:[e.jsx("option",{value:"",children:"— выберите —"}),i.map(k=>e.jsxs("option",{value:k.id,children:[k.display_name,k.specialty?` · ${k.specialty}`:""]},k.id))]}),i.length===0&&e.jsx("span",{className:"text-[11px] text-white/40",children:"Сначала добавьте исполнителя в разделе «Исполнители»"})]}),!s&&!p&&e.jsxs("label",{className:"flex flex-col gap-1",children:[e.jsx("span",{className:"text-xs text-white/50",children:"Объект"}),e.jsxs("select",{value:r,onChange:k=>N(Number(k.target.value)||""),className:oe,children:[e.jsx("option",{value:"",children:"— выберите —"}),u.map(k=>e.jsxs("option",{value:k.id,children:[k.object_code," ",k.address?`— ${k.address}`:""]},k.id))]})]}),e.jsxs("label",{className:"flex flex-col gap-1",children:[e.jsx("span",{className:"text-xs text-white/50",children:"Что сделать"}),e.jsx("input",{value:b,onChange:k=>w(k.target.value),placeholder:"Например: развести электрику на кухне",className:oe})]}),e.jsxs("label",{className:"flex flex-col gap-1",children:[e.jsx("span",{className:"text-xs text-white/50",children:"Подробности (необязательно)"}),e.jsx("textarea",{value:x,onChange:k=>$(k.target.value),rows:3,placeholder:"Объём, требования, где взять материал…",className:"w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-base sm:text-sm outline-none focus:border-[#D4AF37]/50"})]}),e.jsxs("div",{className:"flex flex-col gap-1",children:[e.jsx("span",{className:"text-xs text-white/50",children:"Срок"}),e.jsxs("div",{className:"flex flex-wrap gap-2",children:[e.jsx("input",{type:"date",value:c,onChange:k=>C(k.target.value),className:`${oe} w-auto flex-1 min-w-[150px]`}),[["Завтра",1],["3 дня",3],["Неделя",7]].map(([k,D])=>e.jsx("button",{type:"button",onClick:()=>C(_e(Number(D))),className:"min-h-[44px] px-3 rounded-lg bg-white/5 text-sm text-white/60 hover:text-white",children:k},k))]})]}),f&&e.jsxs("p",{className:"text-sm text-red-400 flex items-center gap-1.5",children:[e.jsx(v,{name:"CircleAlert",size:15}),f]}),e.jsxs("div",{className:"flex flex-col-reverse sm:flex-row gap-2 pt-2 border-t border-white/10",children:[e.jsx("button",{onClick:()=>n(!1),className:"min-h-[44px] px-4 text-sm text-white/50 hover:text-white",children:"Отмена"}),e.jsxs("button",{onClick:B,disabled:d,className:"flex-1 sm:flex-none flex items-center justify-center gap-2 min-h-[44px] px-5 rounded-lg bg-[#D4AF37] hover:bg-[#B8860B] text-[#161616] text-sm font-medium disabled:opacity-60",children:[d&&e.jsx(v,{name:"Loader2",size:15,className:"animate-spin"}),s?"Сохранить":"Поставить задание"]})]})]})})}const st={open:{label:"в работе",cls:"bg-blue-500/20 text-blue-300"},done:{label:"выполнено — проверьте",cls:"bg-amber-500/20 text-amber-300"},accepted:{label:"принято",cls:"bg-green-500/20 text-green-300"}};function at({objectId:t,executorId:n}){const[s,p]=l.useState([]),[a,g]=l.useState(!0),[i,o]=l.useState({open:!1,task:null}),[u,h]=l.useState(!1),[A,y]=l.useState(null),r=()=>ee.list({object_id:t,executor_id:n}).then(c=>p(c.tasks||[])).catch(()=>p([])).finally(()=>g(!1));l.useEffect(()=>{r()},[t,n]);const N=async(c,C)=>{await ee.setStatus(c,C).catch(()=>null),r()},b=s.filter(c=>c.status!=="accepted"),w=s.filter(c=>c.status==="accepted"),x=u?s:b,$=b.filter(c=>c.status==="open"&&we(c.due_date,c.status).cls==="text-red-400").length;return e.jsxs("div",{className:"bg-[#1f1f1f] border border-white/10 rounded-xl p-3 sm:p-5",children:[e.jsxs("div",{className:"flex items-center justify-between gap-2 mb-3",children:[e.jsxs("p",{className:"font-medium flex items-center gap-2 flex-wrap",children:[e.jsx(v,{name:"ListTodo",size:16,className:"text-orange-300"}),"Задания исполнителям",$>0&&e.jsxs("span",{className:"px-2 py-0.5 rounded-full text-[11px] bg-red-500/20 text-red-300",children:["просрочено: ",$]})]}),e.jsxs("button",{onClick:()=>o({open:!0,task:null}),className:"flex items-center gap-1.5 min-h-[36px] px-3 rounded-lg bg-[#D4AF37] hover:bg-[#B8860B] text-[#161616] text-xs font-medium shrink-0",children:[e.jsx(v,{name:"Plus",size:14}),"Задание"]})]}),a?e.jsx("div",{className:"flex justify-center py-4",children:e.jsx(v,{name:"Loader2",size:18,className:"animate-spin text-white/40"})}):x.length===0?e.jsx("p",{className:"text-xs text-white/40",children:s.length?"Все задания приняты":"Заданий пока нет. Поставьте задачу со сроком — исполнитель увидит её в своём кабинете."}):e.jsx("ul",{className:"flex flex-col gap-2",children:x.map(c=>{var z,f;const C=st[c.status],d=we(c.due_date,c.status);return e.jsxs("li",{className:"rounded-lg border border-white/10 bg-[#161616] p-3",children:[e.jsxs("div",{className:"flex items-start gap-2",children:[e.jsx("span",{className:M("mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0",c.status==="open"?"border-white/20":"border-emerald-500 bg-emerald-500/20 text-emerald-300"),children:c.status!=="open"&&e.jsx(v,{name:"Check",size:13})}),e.jsxs("div",{className:"min-w-0 flex-1",children:[e.jsx("button",{onClick:()=>o({open:!0,task:c}),className:"text-left text-sm font-medium break-words hover:text-[#D4AF37]",children:c.title}),e.jsxs("p",{className:"text-[11px] mt-0.5 flex flex-wrap gap-x-2",children:[e.jsx("span",{className:d.cls,children:d.text}),e.jsx("span",{className:"text-white/40",children:t?c.executor_name:`${c.object_code}${c.address?` · ${c.address}`:""}`})]}),c.description&&e.jsx("p",{className:"text-xs text-white/50 mt-1 whitespace-pre-wrap break-words",children:c.description}),c.status!=="open"&&(c.executor_comment||((z=c.photos)==null?void 0:z.length)>0)&&e.jsxs("div",{className:"mt-2 rounded-md bg-white/[0.03] p-2",children:[c.executor_comment&&e.jsxs("p",{className:"text-xs text-white/70",children:["Исполнитель: ",c.executor_comment]}),((f=c.photos)==null?void 0:f.length)>0&&e.jsx("div",{className:"mt-1.5 flex gap-1.5 overflow-x-auto",children:c.photos.map(_=>e.jsx("button",{onClick:()=>y(_),className:"w-14 h-14 shrink-0 rounded overflow-hidden border border-white/10",children:e.jsx("img",{src:_,alt:"Фото",className:"w-full h-full object-cover",loading:"lazy"})},_))})]})]}),e.jsx("span",{className:M("px-2 py-0.5 rounded-full text-[10px] shrink-0",C.cls),children:C.label})]}),e.jsxs("div",{className:"flex items-center justify-end gap-2 mt-2",children:[c.status==="done"&&e.jsxs(e.Fragment,{children:[e.jsxs("button",{onClick:()=>N(c.id,"open"),className:"flex items-center gap-1 min-h-[36px] px-3 rounded-lg bg-red-500/15 text-red-300 text-xs hover:bg-red-500/25",children:[e.jsx(v,{name:"RotateCcw",size:13}),"На доработку"]}),e.jsxs("button",{onClick:()=>N(c.id,"accepted"),className:"flex items-center gap-1 min-h-[36px] px-3 rounded-lg bg-green-500/20 text-green-300 text-xs hover:bg-green-500/30",children:[e.jsx(v,{name:"Check",size:13}),"Принять"]})]}),e.jsx(te,{onConfirm:async()=>{await ee.remove(c.id).catch(()=>null),r()}})]})]},c.id)})}),w.length>0&&e.jsx("button",{onClick:()=>h(c=>!c),className:"mt-2 text-xs text-white/50 hover:text-white",children:u?"Скрыть принятые":`Показать принятые (${w.length})`}),e.jsx(tt,{open:i.open,onOpenChange:c=>o(C=>({...C,open:c})),task:i.task,objectId:t,executorId:n,onSaved:r}),A&&e.jsx("div",{className:"fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-3",onClick:()=>y(null),children:e.jsx("img",{src:A,alt:"Фото",className:"max-w-full max-h-full object-contain"})})]})}const ue="w-full bg-[#161616] border border-white/10 rounded-lg px-3 min-h-[44px] text-base sm:text-sm outline-none focus:border-[#D4AF37]/50";function nt({contractId:t,total:n,onChanged:s}){const{user:p}=de(),a=(p==null?void 0:p.role)==="owner"||(p==null?void 0:p.role)==="admin",[g,i]=l.useState([]),[o,u]=l.useState(""),[h,A]=l.useState(()=>new Date().toISOString().slice(0,10)),[y,r]=l.useState(""),[N,b]=l.useState(!1),[w,x]=l.useState(""),$=()=>X.payments({contract_id:t}).then(f=>i(f.payments||[])).catch(()=>i([]));l.useEffect(()=>{$()},[t]);const c=g.reduce((f,_)=>f+_.amount,0),C=Math.max(0,n-c),d=async()=>{const f=Number(o.replace(",",".").replace(/\s/g,""));if(!f||f<=0){x("Укажите сумму");return}b(!0),x("");try{await X.addPayment({contract_id:t,amount:f,payment_date:h,note:y}),u(""),r(""),await $(),s==null||s()}catch(_){x((_==null?void 0:_.message)||"Не удалось сохранить оплату")}finally{b(!1)}},z=async f=>{await X.removePayment(f).catch(()=>null),await $(),s==null||s()};return e.jsxs("div",{className:"bg-[#1f1f1f] border border-white/10 rounded-xl p-3 sm:p-5",children:[e.jsxs("div",{className:"flex items-center justify-between gap-3 mb-3",children:[e.jsxs("p",{className:"font-medium flex items-center gap-2",children:[e.jsx(v,{name:"Banknote",size:16,className:"text-[#D4AF37]"}),"Оплаты исполнителю"]}),e.jsx("span",{className:"text-xs text-white/40",children:"попадают в расходы объекта"})]}),e.jsxs("div",{className:"grid grid-cols-3 gap-2 mb-4 text-center",children:[e.jsxs("div",{className:"rounded-lg bg-[#161616] p-2",children:[e.jsx("p",{className:"text-[11px] text-white/40",children:"По договору"}),e.jsx("p",{className:"text-sm font-medium",children:F(n)})]}),e.jsxs("div",{className:"rounded-lg bg-[#161616] p-2",children:[e.jsx("p",{className:"text-[11px] text-white/40",children:"Оплачено"}),e.jsx("p",{className:"text-sm font-medium text-emerald-400",children:F(c)})]}),e.jsxs("div",{className:"rounded-lg bg-[#161616] p-2",children:[e.jsx("p",{className:"text-[11px] text-white/40",children:"Осталось"}),e.jsx("p",{className:"text-sm font-medium text-[#D4AF37]",children:F(C)})]})]}),g.length>0&&e.jsx("ul",{className:"mb-4 divide-y divide-white/5",children:g.map(f=>e.jsxs("li",{className:"flex items-center gap-3 py-2 text-sm",children:[e.jsx("span",{className:"text-white/50 w-20 shrink-0",children:le(f.expense_date)}),e.jsx("span",{className:"flex-1 min-w-0 truncate text-white/60",title:f.description,children:f.description.replace(/^Оплата исполнителю по договору № [^—]+(— )?/,"")||"Оплата"}),e.jsx("span",{className:"font-medium shrink-0",children:F(f.amount)}),a&&e.jsx(te,{onConfirm:()=>z(f.id)})]},f.id))}),a?e.jsxs("div",{className:"grid grid-cols-2 sm:grid-cols-[1fr_150px_1fr_auto] gap-2",children:[e.jsx("input",{value:o,onChange:f=>u(f.target.value.replace(/[^\d.,\s]/g,"")),inputMode:"decimal",placeholder:C?`Сумма, напр. ${Math.round(C)}`:"Сумма",className:ue}),e.jsx("input",{type:"date",value:h,onChange:f=>A(f.target.value),className:ue}),e.jsx("input",{value:y,onChange:f=>r(f.target.value),placeholder:"Комментарий: аванс, этап…",className:`${ue} col-span-2 sm:col-span-1`}),e.jsxs("button",{onClick:d,disabled:N,className:"col-span-2 sm:col-span-1 flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-lg bg-[#D4AF37] hover:bg-[#B8860B] text-[#161616] text-sm font-medium disabled:opacity-60",children:[e.jsx(v,{name:N?"Loader2":"Plus",size:15,className:N?"animate-spin":""}),"Внести оплату"]})]}):e.jsx("p",{className:"text-xs text-white/40",children:"Оплаты вносит руководитель"}),w&&e.jsx("p",{className:"text-xs text-red-400 mt-2",children:w})]})}function it({objectId:t,purchaseListId:n,shopName:s,receipts:p,onChanged:a,onOpen:g}){const i=l.useRef(null),o=l.useRef(null),[u,h]=l.useState(!1),[A,y]=l.useState(""),[r,N]=l.useState(""),b=async x=>{if(!(!x||x.length===0)){y(""),h(!0);try{for(const $ of Array.from(x)){const{data:c,name:C}=await Re($);await fe.uploadReceipt({object_id:t,purchase_list_id:n,shop_name:s,file_name:`Чек ${s} ${C}`.slice(0,200),data:c,amount:Number(r.replace(",","."))||0})}N(""),a()}catch($){y(($==null?void 0:$.message)||"Не удалось загрузить чек")}finally{h(!1),i.current&&(i.current.value=""),o.current&&(o.current.value="")}}},w=async x=>{try{await fe.remove(x),a()}catch($){y(($==null?void 0:$.message)||"Не удалось удалить чек")}};return e.jsxs("div",{className:"border-t border-white/10 bg-[#1a1a1a] p-3 sm:px-4",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(v,{name:"Receipt",size:15,className:"text-white/40"}),e.jsx("span",{className:"text-xs text-white/50",children:p.length>0?`Чеки: ${p.length}`:"Чека пока нет"})]}),p.length>0&&e.jsx("div",{className:"mt-2 flex gap-2 overflow-x-auto pb-1",children:p.map(x=>e.jsxs("div",{className:"relative shrink-0",children:[e.jsx("button",{onClick:()=>g(x),className:"block w-20 h-24 rounded-lg overflow-hidden border border-white/10 bg-[#161616]",children:x.file_type==="photo"?e.jsx("img",{src:x.file_url,alt:"Чек",className:"w-full h-full object-cover",loading:"lazy"}):e.jsx("span",{className:"flex h-full items-center justify-center text-red-400",children:e.jsx(v,{name:"FileText",size:22})})}),Number(x.amount)>0&&e.jsx("span",{className:"absolute left-1 bottom-1 rounded bg-black/70 px-1 text-[10px] text-white",children:F(Number(x.amount))}),e.jsx("div",{className:"absolute -right-1 -top-1 rounded-lg bg-[#1f1f1f]",children:e.jsx(te,{onConfirm:()=>w(x.id)})})]},x.id))}),e.jsxs("div",{className:"mt-2 grid grid-cols-[1fr_auto_auto] gap-2",children:[e.jsx("input",{value:r,onChange:x=>N(x.target.value.replace(/[^\d.,]/g,"")),inputMode:"decimal",placeholder:"Сумма по чеку",className:"min-w-0 bg-[#161616] border border-white/10 rounded-lg px-3 min-h-[44px] text-sm outline-none focus:border-[#D4AF37]/50"}),e.jsxs("button",{onClick:()=>{var x;return(x=i.current)==null?void 0:x.click()},disabled:u,className:"flex items-center justify-center gap-1.5 min-h-[44px] px-3 rounded-lg bg-[#D4AF37] text-[#161616] text-sm disabled:opacity-50",children:[e.jsx(v,{name:u?"Loader2":"Camera",size:17,className:u?"animate-spin":""}),e.jsx("span",{className:"hidden min-[400px]:inline",children:"Чек"})]}),e.jsx("button",{onClick:()=>{var x;return(x=o.current)==null?void 0:x.click()},disabled:u,className:"flex items-center justify-center min-h-[44px] w-11 rounded-lg border border-white/10 text-white/70 disabled:opacity-50","aria-label":"Выбрать из галереи",title:"Выбрать из галереи",children:e.jsx(v,{name:"ImagePlus",size:17})})]}),A&&e.jsx("p",{className:"mt-2 text-xs text-red-400",children:A}),e.jsx("input",{ref:i,type:"file",accept:"image/*",capture:"environment",className:"hidden",onChange:x=>b(x.target.files)}),e.jsx("input",{ref:o,type:"file",accept:"image/*,.pdf",multiple:!0,className:"hidden",onChange:x=>b(x.target.files)})]})}const K=(t,n=0)=>{const s=typeof t=="string"?parseFloat(t):Number(t);return Number.isFinite(s)?s:n},re="Магазин не выбран";function ot(t,n){const s=t.filter(i=>K(i.price)>0);if(s.length===0)return null;const p=s.map(i=>{const o=!!i.stock_known,u=K(i.stock),h=!o||u>=n,A=o&&u>0&&u<n;return{offer:i,enough:h,partial:A,price:K(i.price)}}),a=p.filter(i=>i.enough);if(a.length>0)return a.reduce((i,o)=>o.price<i.price?o:i).offer;const g=p.filter(i=>i.partial);return g.length>0?g.reduce((i,o)=>o.price<i.price?o:i).offer:p.reduce((i,o)=>o.price<i.price?o:i).offer}function Oe(t,n){const s=new Map;let p=0,a=0,g=0;t.forEach((o,u)=>{const h=n.find(_=>_.id===o.material_id),A=(h==null?void 0:h.offers)||[],y=K(o.qty),r=ot(A,y),N=K(r?r.price:o.price),b=(r==null?void 0:r.shop_name)||o.shop_name||(h==null?void 0:h.shop_name)||re,x=(r?!!r.stock_known:!1)?K(r.stock):null,$=x===null?!0:x>=y,c=$||x===null?0:Math.max(0,y-x);$||(a+=1),b===re&&(g+=1);const C=A.filter(_=>K(_.price)>0).map(_=>K(_.price)),d=C.length>1&&N>0?(Math.max(...C)-N)*y:0;p+=d;const z={name:o.name,unit:o.unit,qty:y,price:N,sum:y*N,shopName:b,shopAddress:(r==null?void 0:r.shop_address)||(h==null?void 0:h.shop_address)||"",shopPhone:(r==null?void 0:r.shop_phone)||(h==null?void 0:h.shop_phone)||"",shopUrl:(r==null?void 0:r.shop_url)||(h==null?void 0:h.shop_url)||"",stock:x,enough:$,missing:c,offersCount:C.length,saved:d,roomName:o.room_name||"",index:u};s.has(b)||s.set(b,{name:b,address:z.shopAddress,phone:z.shopPhone,lines:[],sum:0,hasShortage:!1});const f=s.get(b);!f.address&&z.shopAddress&&(f.address=z.shopAddress),!f.phone&&z.shopPhone&&(f.phone=z.shopPhone),f.lines.push(z),f.sum+=z.sum,$||(f.hasShortage=!0)});const i=Array.from(s.values()).map(o=>({...o,lines:[...o.lines].sort((u,h)=>h.sum-u.sum)})).sort((o,u)=>o.name===re?1:u.name===re?-1:u.sum-o.sum);return{shops:i,total:i.reduce((o,u)=>o+u.sum,0),saved:p,shortageCount:a,unknownShopCount:g}}const ke=t=>String(t??"").replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\r?\n/g," "),rt=(t,n=0)=>{const s=typeof t=="string"?parseFloat(t):Number(t);return Number.isFinite(s)?s:n},Q=t=>new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0}).format(rt(t))+" ₽";function P(t){const n=document.createElement("div");return n.textContent=t??"",n.innerHTML}function Te(t,n,s,p){const a=Oe(n,s),g=a.shops.map(r=>{const N=r.lines.map((w,x)=>{const $=w.stock===null?'<span class="muted">не указано</span>':w.enough?`<span class="ok">есть ${w.stock} ${P(w.unit)}</span>`:`<span class="warn">есть ${w.stock}, не хватает ${w.missing}</span>`;return`
            <tr>
              <td class="num">${x+1}</td>
              <td>
                ${P(w.name)}
                ${w.roomName?`<div class="sub">${P(w.roomName)}</div>`:""}
              </td>
              <td class="center">${w.qty}</td>
              <td class="center">${P(w.unit)}</td>
              <td class="center">${$}</td>
              <td class="right">${Q(w.price)}</td>
              <td class="right amount">${Q(w.sum)}</td>
              <td class="center check"></td>
            </tr>`}).join(""),b=[r.address?`Адрес: ${P(r.address)}`:"",r.phone?`Тел.: ${P(r.phone)}`:""].filter(Boolean).join(" · ");return`
      <div class="room-block">
        <div class="cat-block">
          <table>
            <thead>
              <tr>
                <th class="num">№</th>
                <th>Наименование материала</th>
                <th class="center">Нужно</th>
                <th class="center">Ед.</th>
                <th class="center">Наличие</th>
                <th class="right">Цена</th>
                <th class="right">Сумма</th>
                <th class="center">Взял</th>
              </tr>
            </thead>
            <tbody>
              <tr class="cat-row">
                <td colspan="8">${P(r.name)}${b?` — ${b}`:""}</td>
              </tr>
              ${N}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="6" class="right">Итого по магазину</td>
                <td class="right amount">${Q(r.sum)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>`}).join(""),i=[];a.shortageCount>0&&i.push(`Позиций с нехваткой на складе магазина: ${a.shortageCount} — уточните наличие перед выездом`),a.unknownShopCount>0&&i.push(`Позиций без выбранного магазина: ${a.unknownShopCount}`),a.saved>0&&i.push(`Экономия за счёт выбора магазина: ${Q(a.saved)}`);const o=i.length?`<div class="notes">${i.map(r=>`<div>• ${r}</div>`).join("")}</div>`:"",u=`
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
  .doc-title p { margin: 0; font-size: 13px; }
  .doc-subtitle h2 { font-size: 19px; margin: 0; letter-spacing: -0.3px; }
  .doc-subtitle p { margin: 4px 0 0; font-size: 12px; }
  hr.thin { border: none; border-top: 1.5px solid #7A4E10; margin: 20px 0; }
  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px 32px;
    border: 1.5px solid #7A4E10;
    border-radius: 10px;
    padding: 16px;
    margin-bottom: 20px;
    font-size: 13px;
  }
  .info-grid .label {
    color: #6B4508;
    font-size: 11.5px;
    font-weight: 700;
    text-transform: uppercase;
    margin-bottom: 3px;
  }
  .info-grid .value { font-size: 13.5px; font-weight: 600; }
  .notes {
    border: 1.5px solid #7A4E10;
    border-radius: 10px;
    padding: 12px 16px;
    margin-bottom: 20px;
    font-size: 12.5px;
    line-height: 1.7;
  }
  .room-block { margin-bottom: 18px; page-break-inside: avoid; }
  table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
  th {
    background: #F3ECE0;
    color: #3d2a08;
    text-align: left;
    padding: 9px 8px;
    font-size: 11px;
    text-transform: uppercase;
    font-weight: 700;
    border-bottom: 1.5px solid #7A4E10;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  td { padding: 8px; border-bottom: 1px solid #E5DCCB; vertical-align: top; }
  .cat-row td {
    background: #FAF6EF;
    font-weight: 700;
    font-size: 12.5px;
    color: #3d2a08;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .num { width: 34px; color: #6B4508; }
  .center { text-align: center; }
  .right { text-align: right; }
  .amount { font-weight: 700; }
  .sub { font-size: 11px; color: #6B4508; margin-top: 2px; }
  .muted { color: #8a7a5f; }
  .ok { color: #1d6b3a; font-weight: 600; }
  .warn { color: #9c2b2b; font-weight: 700; }
  .check {
    width: 44px;
  }
  .check::after {
    content: "";
    display: inline-block;
    width: 15px;
    height: 15px;
    border: 1.5px solid #7A4E10;
    border-radius: 3px;
  }
  tfoot td {
    border-top: 1.5px solid #7A4E10;
    border-bottom: none;
    padding-top: 9px;
    font-weight: 700;
    font-size: 12.5px;
  }
  .summary { display: flex; justify-content: flex-end; margin-top: 18px; }
  .summary-box {
    min-width: 320px;
    border: 1.5px solid #7A4E10;
    border-radius: 10px;
    padding: 14px 18px;
  }
  .summary-row {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    padding: 3px 0;
  }
  .summary-total {
    display: flex;
    justify-content: space-between;
    font-size: 16px;
    font-weight: 800;
    border-top: 1.5px solid #7A4E10;
    margin-top: 8px;
    padding-top: 8px;
  }
  .parties {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 32px;
    font-size: 12.5px;
  }
  .parties .label {
    color: #6B4508;
    font-size: 11px;
    text-transform: uppercase;
    font-weight: 700;
    margin-bottom: 4px;
  }
  .parties .name { font-weight: 600; }
  .footer {
    margin-top: 22px;
    text-align: center;
    color: #6B4508;
    font-size: 11px;
  }
  /* Колонтитулы: сверху объект и заказчик, снизу номер страницы */
  @page {
    size: A4;
    margin: 16mm 12mm 14mm;
    @top-left {
      content: "${ke(`Список закупок · объект ${t.object_code||""}`.trim())}";
      font-family: Arial, sans-serif;
      font-size: 8.5pt;
      color: #6B4508;
    }
    @top-right {
      content: "${ke(t.client_name||p)}";
      font-family: Arial, sans-serif;
      font-size: 8.5pt;
      color: #6B4508;
    }
    @bottom-center {
      content: "Страница " counter(page) " из " counter(pages);
      font-family: Arial, sans-serif;
      font-size: 8.5pt;
      color: #555555;
    }
  }
  @media print {
    body { padding: 0; }

    /* Список переносим по строкам, а не блоком целиком, иначе внизу
       листа остаётся пустота. Шапка повторяется на каждой странице. */
    .room-block { break-inside: auto; }
    table { break-inside: auto; }
    tr { break-inside: avoid; }
    thead { display: table-header-group; }
    tbody { orphans: 3; widows: 3; }
  }
`,h=a.shops.length,A=`
  <div class="header">
    <div class="brand"><img class="brand-logo" src="${window.location.origin}/logo-print.png" alt="FixKey"/><b class="brand-word">Fix<span>Key</span></b></div>
    <div class="doc-title">
      <h1>Список на закупку</h1>
      <p>Объект № ${P(t.object_code)}</p>
    </div>
  </div>

  <div class="doc-subtitle">
    <h2>СПИСОК НА ЗАКУПКУ</h2>
    <p>Что купить, сколько и в каком магазине</p>
  </div>

  <hr class="thin" />

  <div class="info-grid">
    <div>
      <div class="label">ID объекта</div>
      <div class="value">${P(t.object_code)}</div>
    </div>
    <div>
      <div class="label">Заказчик</div>
      <div class="value">${P(t.client_name)}</div>
    </div>
    <div>
      <div class="label">Адрес объекта</div>
      <div class="value">${P(t.address||"—")}</div>
    </div>
    <div>
      <div class="label">Магазинов в списке</div>
      <div class="value">${h}</div>
    </div>
  </div>

  ${o}

  ${g}

  <div class="summary">
    <div class="summary-box">
      ${a.shops.map(r=>`
      <div class="summary-row">
        <span>${P(r.name)}</span>
        <span>${Q(r.sum)}</span>
      </div>`).join("")}
      <div class="summary-total">
        <span>ИТОГО:</span>
        <span>${Q(a.total)}</span>
      </div>
    </div>
  </div>

  <hr class="thin" />

  <div class="parties">
    <div>
      <div class="label">Закупку производит</div>
      <div class="name">${P(p)}</div>
    </div>
    <div>
      <div class="label">Объект</div>
      <div class="name">${P(t.client_name)}</div>
    </div>
  </div>`,y=`Список на закупку № ${t.object_code} — ${P(t.client_name)}`;return{styles:u,bodyContent:A,title:y}}function lt(t,n,s,p,a=!1){const{styles:g,bodyContent:i,title:o}=Te(t,n,s,p),u=`<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8" />
<title>${o}</title>
<style>${g}</style>
</head>
<body>
<div class="est-root">${i}</div>
</body>
</html>`,h=window.open("","_blank","width=900,height=1000");h&&(h.document.open(),h.document.write(u),h.document.close(),a&&(h.onload=()=>{h.focus(),h.print()}))}async function ct(t,n,s,p){const{styles:a,bodyContent:g}=Te(t,n,s,p);await Ae(i=>{i.id="pdf-scope-purchase",i.className="est-root",i.innerHTML=`<style>${Ze(a,"#pdf-scope-purchase")}</style>${g}`},{filename:`Список на закупку ${t.object_code}.pdf`,mode:"save"})}const dt=t=>"tel:"+t.replace(/[^\d+]/g,""),$e=t=>new Intl.NumberFormat("ru-RU",{maximumFractionDigits:2}).format(t);function mt(){const{id:t}=De(),{user:n}=de(),[s,p]=l.useState(null),[a,g]=l.useState([]),[i,o]=l.useState(new Set),[u,h]=l.useState(!0),[A,y]=l.useState(""),[r,N]=l.useState(!1),[b,w]=l.useState("idle"),[x,$]=l.useState(!1),c=l.useRef(null),[C,d]=l.useState([]),[z,f]=l.useState(null),_=(j,O)=>{fe.list(j,"receipt",O).then(R=>d(R.files||[])).catch(()=>d([]))};l.useEffect(()=>{t&&(h(!0),Promise.all([he.getEstimate(Number(t)),he.list().catch(()=>null)]).then(([j,O])=>{p(j.estimate),o(new Set(j.estimate.bought||[])),g((O==null?void 0:O.materials)||[]),_(j.estimate.object_id,j.estimate.id)}).catch(j=>y((j==null?void 0:j.message)||"Не удалось загрузить список")).finally(()=>h(!1)))},[t]);const B=l.useMemo(()=>(s==null?void 0:s.items)||[],[s]),k=l.useMemo(()=>Oe(B,a),[B,a]),D=k.shops.flatMap(j=>j.lines),H=D.filter(j=>i.has(j.index)).reduce((j,O)=>j+O.sum,0),I=D.filter(j=>i.has(j.index)).length,q=D.length-I,me=k.total-H,pe=D.length?Math.round(I/D.length*100):0,Z=j=>{s&&(c.current&&window.clearTimeout(c.current),w("saving"),c.current=window.setTimeout(()=>{he.setBought(s.id,Array.from(j)).then(()=>w("idle")).catch(()=>w("error"))},500))},xe=j=>{o(O=>{const R=new Set(O);return R.has(j)?R.delete(j):R.add(j),Z(R),R})},se=(j,O)=>{o(R=>{const Y=new Set(R);return j.forEach(ae=>O?Y.add(ae):Y.delete(ae)),Z(Y),Y})},W=s?{id:s.object_id,object_code:s.object_code,client_name:s.client_name,address:s.address||""}:null,m=(n==null?void 0:n.company_name)||"",L=async()=>{if(W){$(!0);try{await ct(W,B,a,m)}finally{$(!1)}}},U="flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-lg border border-white/10 text-sm text-white/80 hover:border-[#D4AF37]/50 hover:text-[#D4AF37] transition-colors";return e.jsxs(ce,{title:"Список на закупку",subtitle:s?`Объект ${s.object_code} · ${s.client_name}`:void 0,children:[u?e.jsx("div",{className:"flex justify-center py-16",children:e.jsx(v,{name:"Loader2",size:24,className:"animate-spin text-white/40"})}):A||!s?e.jsx("div",{className:"rounded-xl border border-white/10 bg-[#1f1f1f] p-8 text-center text-sm text-white/50",children:A||"Список не найден"}):e.jsxs("div",{className:"flex flex-col gap-4",children:[e.jsxs("div",{className:"sticky top-14 md:top-0 z-20 -mx-3 sm:mx-0 rounded-none sm:rounded-xl border-y sm:border border-white/10 bg-[#1f1f1f]/95 backdrop-blur p-3 sm:p-5",children:[e.jsxs("div",{className:"flex items-end justify-between gap-3",children:[e.jsxs("div",{className:"min-w-0",children:[e.jsx("p",{className:"text-xs text-white/40",children:"Осталось купить"}),e.jsx("p",{className:"text-2xl font-semibold text-[#D4AF37]",children:F(me)}),e.jsx("p",{className:"text-xs text-white/50 mt-0.5",children:q===0?"Всё куплено":`${q} из ${D.length} позиций`})]}),e.jsxs("div",{className:"text-right shrink-0",children:[e.jsx("p",{className:"text-xs text-white/40",children:"Куплено"}),e.jsx("p",{className:"text-base font-medium text-emerald-400",children:F(H)}),e.jsx("p",{className:"text-[11px] text-white/30 mt-0.5 h-4",children:b==="saving"?"сохраняю…":b==="error"?e.jsx("span",{className:"text-red-400",children:"не сохранилось"}):"сохранено"})]})]}),e.jsx("div",{className:"mt-3 h-2 rounded-full bg-white/10 overflow-hidden",children:e.jsx("div",{className:"h-full bg-emerald-500 transition-all duration-300",style:{width:`${pe}%`}})})]}),e.jsxs("div",{className:"grid grid-cols-2 sm:flex sm:flex-wrap gap-2",children:[e.jsxs("button",{onClick:()=>N(j=>!j),className:M(U,"col-span-2 sm:col-auto",r&&"border-[#D4AF37]/50 text-[#D4AF37]"),children:[e.jsx(v,{name:r?"EyeOff":"Eye",size:16}),r?"Показать купленное":"Скрыть купленное"]}),e.jsxs("button",{onClick:()=>W&&lt(W,B,a,m,!0),className:U,children:[e.jsx(v,{name:"Printer",size:16}),"Печать"]}),e.jsxs("button",{onClick:L,className:U,disabled:x,children:[e.jsx(v,{name:x?"Loader2":"Download",size:16,className:x?"animate-spin":""}),"PDF"]})]}),k.shops.map(j=>{const O=j.lines.map(S=>S.index),R=O.every(S=>i.has(S)),Y=r?j.lines.filter(S=>!i.has(S.index)):j.lines;if(r&&Y.length===0)return null;const ae=j.lines.filter(S=>!i.has(S.index)).reduce((S,V)=>S+V.sum,0);return e.jsxs("div",{className:"rounded-xl border border-white/10 bg-[#1f1f1f] overflow-hidden",children:[e.jsxs("div",{className:"flex items-start justify-between gap-3 p-3 sm:p-4 border-b border-white/10",children:[e.jsxs("div",{className:"min-w-0",children:[e.jsx("p",{className:M("font-medium break-words",R&&"text-white/40 line-through"),children:j.name}),j.address&&e.jsx("p",{className:"text-xs text-white/40 mt-0.5 break-words",children:j.address}),e.jsxs("p",{className:"text-xs text-white/50 mt-1",children:["осталось ",F(ae)," из ",F(j.sum)]})]}),e.jsxs("div",{className:"flex items-center gap-2 shrink-0",children:[j.phone&&e.jsx("a",{href:dt(j.phone),className:"w-11 h-11 flex items-center justify-center rounded-lg bg-[#D4AF37] text-[#161616]","aria-label":"Позвонить",children:e.jsx(v,{name:"Phone",size:18})}),e.jsx("button",{onClick:()=>se(O,!R),className:"min-h-[44px] px-3 rounded-lg bg-white/5 active:bg-white/10 text-xs text-white/70",children:R?"Снять все":"Купил всё"})]})]}),e.jsx("ul",{children:Y.map(S=>{const V=i.has(S.index);return e.jsx("li",{className:"border-b border-white/5 last:border-0",children:e.jsxs("button",{onClick:()=>xe(S.index),className:M("w-full flex items-center gap-3 p-3 sm:px-4 text-left transition-colors active:bg-white/5",V&&"bg-emerald-500/[0.06]"),children:[e.jsx("span",{className:M("w-7 h-7 shrink-0 rounded-md border-2 flex items-center justify-center transition-colors",V?"bg-emerald-500 border-emerald-500 text-[#161616]":"border-white/30"),children:V&&e.jsx(v,{name:"Check",size:18})}),e.jsxs("span",{className:"min-w-0 flex-1",children:[e.jsx("span",{className:M("block text-[15px] break-words",V&&"line-through text-white/40"),children:S.name}),e.jsxs("span",{className:"block text-xs text-white/40 mt-0.5",children:[$e(S.qty)," ",S.unit," × ",F(S.price),S.roomName?` · ${S.roomName}`:""]}),!S.enough&&!V&&e.jsxs("span",{className:"block text-xs text-amber-400 mt-0.5",children:["в магазине не хватает ",$e(S.missing)," ",S.unit]})]}),e.jsx("span",{className:M("shrink-0 text-sm font-medium",V?"text-white/30":"text-white"),children:F(S.sum)})]})},S.index)})}),(n==null?void 0:n.role)!=="client"&&e.jsx(it,{objectId:s.object_id,purchaseListId:s.id,shopName:j.name,receipts:C.filter(S=>(S.shop_name||"")===j.name),onChanged:()=>_(s.object_id,s.id),onOpen:f})]},j.name)}),r&&q===0&&e.jsx("div",{className:"rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center text-sm text-emerald-300",children:"Всё по списку куплено"})]}),z&&e.jsx(et,{receipt:z,onClose:()=>f(null)})]})}const Nt=Object.freeze(Object.defineProperty({__proto__:null,default:mt},Symbol.toStringTag,{value:"Module"}));function pt({executorId:t}){const n=Fe(),[s,p]=l.useState([]);return l.useEffect(()=>{be.list().then(a=>p(a.objects||[])).catch(()=>p([]))},[]),s.length?e.jsxs("select",{value:"",onChange:a=>a.target.value&&n(`/cabinet/objects/${a.target.value}/contracts/new?role=customer&executor_id=${t}`),className:"bg-[#D4AF37] text-[#161616] font-medium rounded-lg px-3 min-h-[40px] text-sm outline-none cursor-pointer",children:[e.jsx("option",{value:"",children:"+ Договор на объект…"}),s.map(a=>e.jsxs("option",{value:a.id,className:"bg-[#1f1f1f] text-white",children:[a.object_code," ",a.address?`— ${a.address}`:""]},a.id))]}):null}function xt(){var C;const{id:t}=De(),n=Fe(),{user:s}=de(),p=(s==null?void 0:s.role)==="owner"||(s==null?void 0:s.role)==="admin",[a,g]=l.useState(null),[i,o]=l.useState([]),[u,h]=l.useState(!0),[A,y]=l.useState(!1),[r,N]=l.useState(null),b=()=>{t&&Promise.all([X.get(Number(t)),X.reports({executor_id:Number(t)}).catch(()=>({reports:[]}))]).then(([d,z])=>{g(d.executor),o(z.reports||[])}).catch(()=>n("/cabinet/executors")).finally(()=>h(!1))};if(l.useEffect(b,[t]),u||!a)return e.jsx(ce,{title:"Исполнитель",children:e.jsx("div",{className:"flex justify-center py-24",children:e.jsx(v,{name:"Loader2",size:26,className:"animate-spin text-white/40"})})});const w=a.contracts||[],x=w.reduce((d,z)=>d+z.total_amount,0),$=w.reduce((d,z)=>d+z.paid,0),c=[["ИНН",a.inn],[a.kind==="legal"?"ОГРН":"ОГРНИП",a.ogrnip],["Паспорт",a.passport],["Телефон",a.phone],["E-mail",a.email],["Адрес",a.address],["Банк",a.bank_name],["БИК",a.bik],["Р/с",a.account],["К/с",a.corr_account]].filter(([,d])=>d);return e.jsxs(ce,{title:a.display_name,subtitle:[Me[a.kind],a.specialty].filter(Boolean).join(" · "),children:[e.jsxs("div",{className:"flex flex-wrap items-center gap-2 mb-4",children:[e.jsxs(ne,{to:"/cabinet/executors",className:"inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white min-h-[40px]",children:[e.jsx(v,{name:"ChevronLeft",size:16}),"Все исполнители"]}),e.jsx("div",{className:"flex-1"}),e.jsxs("button",{onClick:()=>y(!0),className:"flex items-center gap-2 min-h-[40px] px-3 rounded-lg bg-white/5 hover:bg-white/10 text-sm",children:[e.jsx(v,{name:"Pencil",size:14}),"Реквизиты"]}),p&&!a.is_archived&&e.jsxs("button",{onClick:async()=>{window.confirm("Перенести исполнителя в архив? Договоры и оплаты сохранятся.")&&(await X.archive(a.id),n("/cabinet/executors"))},className:"flex items-center gap-2 min-h-[40px] px-3 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-white/60",children:[e.jsx(v,{name:"Archive",size:14}),"В архив"]})]}),e.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4",children:[e.jsxs("div",{className:"flex flex-col gap-4 min-w-0",children:[e.jsx("div",{className:"grid grid-cols-3 gap-2",children:[["По договорам",F(x),"text-white"],["Оплачено",F($),"text-emerald-400"],["Долг",F(Math.max(0,x-$)),"text-[#D4AF37]"]].map(([d,z,f])=>e.jsxs("div",{className:"bg-[#1f1f1f] border border-white/10 rounded-xl p-3",children:[e.jsx("p",{className:"text-[11px] text-white/40",children:d}),e.jsx("p",{className:M("text-base sm:text-lg font-semibold",f),children:z})]},d))}),e.jsxs("div",{className:"bg-[#1f1f1f] border border-white/10 rounded-xl p-3 sm:p-5",children:[e.jsxs("div",{className:"flex flex-wrap items-center justify-between gap-2 mb-3",children:[e.jsx("p",{className:"font-medium",children:"Договоры"}),e.jsx(pt,{executorId:a.id})]}),w.length===0?e.jsx("p",{className:"text-xs text-white/40",children:"Договоров пока нет. Выберите объект ниже, чтобы составить договор."}):e.jsx("ul",{className:"flex flex-col gap-2",children:w.map(d=>e.jsxs("li",{className:"rounded-lg border border-white/10 bg-[#161616]",children:[e.jsxs("div",{className:"flex flex-col sm:flex-row sm:items-center gap-2 p-3",children:[e.jsxs("div",{className:"min-w-0 flex-1",children:[e.jsxs("p",{className:"text-sm font-medium",children:["Договор № ",d.contract_number," · ",d.object_code]}),e.jsxs("p",{className:"text-xs text-white/40",children:[le(d.contract_date),d.work_subject?` · ${d.work_subject}`:""," · ",d.status==="signed"?"подписан":"черновик"]})]}),e.jsxs("div",{className:"text-sm text-right",children:[e.jsx("span",{className:"font-medium",children:F(d.total_amount)}),e.jsxs("span",{className:"block text-xs text-emerald-400",children:["оплачено ",F(d.paid)]})]}),e.jsxs("div",{className:"grid grid-cols-3 sm:flex gap-2",children:[e.jsx(ne,{to:`/cabinet/objects/${d.object_id}/contracts/${d.id}`,className:"flex items-center justify-center w-full sm:w-9 h-10 sm:h-9 rounded-lg bg-white/5 text-white/50 hover:text-white",title:"Открыть договор",children:e.jsx(v,{name:"Eye",size:15})}),e.jsx(ne,{to:`/cabinet/objects/${d.object_id}/acts/new?contract_id=${d.id}`,className:"flex items-center justify-center w-full sm:w-9 h-10 sm:h-9 rounded-lg bg-white/5 text-white/50 hover:text-white",title:"Составить акт",children:e.jsx(v,{name:"FileCheck",size:15})}),e.jsx("button",{onClick:()=>N(r===d.id?null:d.id),className:M("flex items-center justify-center w-full sm:w-9 h-10 sm:h-9 rounded-lg bg-white/5 hover:text-white",r===d.id?"text-[#D4AF37]":"text-white/50"),title:"Оплаты",children:e.jsx(v,{name:"Banknote",size:15})})]})]}),r===d.id&&e.jsx("div",{className:"border-t border-white/10 p-2",children:e.jsx(nt,{contractId:d.id,total:d.total_amount,onChanged:b})})]},d.id))})]}),e.jsx(at,{executorId:a.id}),e.jsxs("div",{className:"bg-[#1f1f1f] border border-white/10 rounded-xl p-3 sm:p-5",children:[e.jsx("p",{className:"font-medium mb-3",children:"Отчёты о работе"}),e.jsx(He,{reports:i,show:"object",canReview:!0,onChanged:b})]})]}),e.jsxs("div",{className:"flex flex-col gap-4",children:[e.jsxs("div",{className:"bg-[#1f1f1f] border border-white/10 rounded-xl p-3 sm:p-5",children:[e.jsx("p",{className:"font-medium mb-3",children:"Реквизиты"}),c.length===0?e.jsx("p",{className:"text-xs text-white/40",children:"Не заполнены"}):e.jsx("dl",{className:"flex flex-col gap-2 text-sm",children:c.map(([d,z])=>e.jsxs("div",{children:[e.jsx("dt",{className:"text-[11px] text-white/40",children:d}),e.jsx("dd",{className:"break-words",children:z})]},d))})]}),e.jsxs("div",{className:"bg-[#1f1f1f] border border-white/10 rounded-xl p-3 sm:p-5",children:[e.jsx("p",{className:"font-medium mb-2",children:"Кабинет исполнителя"}),a.access_enabled?e.jsxs("p",{className:"text-sm text-white/60",children:["Вход открыт: ",e.jsx("span",{className:"text-white",children:a.login_email}),e.jsxs("span",{className:"block text-xs text-white/40 mt-1",children:["Входит через «Войти» на сайте",a.last_login_at?` · был ${le(a.last_login_at)}`:" · ещё не входил"]})]}):e.jsx("p",{className:"text-xs text-white/40",children:"Закрыт. Откройте в «Реквизитах», чтобы исполнитель присылал отчёты с фото."})]}),(((C=a.objects)==null?void 0:C.length)||0)>0&&e.jsxs("div",{className:"bg-[#1f1f1f] border border-white/10 rounded-xl p-3 sm:p-5",children:[e.jsx("p",{className:"font-medium mb-2",children:"Объекты"}),e.jsx("ul",{className:"flex flex-col gap-1",children:a.objects.map(d=>e.jsx("li",{children:e.jsxs(ne,{to:`/cabinet/objects/${d.id}`,className:"text-sm text-white/70 hover:text-[#D4AF37]",children:[d.object_code," ",e.jsx("span",{className:"text-white/40",children:d.address})]})},d.id))})]})]})]}),e.jsx(Ie,{open:A,onOpenChange:y,executor:a,onSaved:b})]})}const _t=Object.freeze(Object.defineProperty({__proto__:null,default:xt},Symbol.toStringTag,{value:"Module"}));function ht(){const{user:t}=de(),[n,s]=l.useState([]),[p,a]=l.useState([]),[g,i]=l.useState(!0),[o,u]=l.useState(!1),[h,A]=l.useState(!1),[y,r]=l.useState(""),[N,b]=l.useState(null),[w,x]=l.useState(""),[$,c]=l.useState(""),[C,d]=l.useState(""),[z,f]=l.useState(""),[_,B]=l.useState([]),k=(t==null?void 0:t.role)==="owner"||(t==null?void 0:t.role)==="admin",[D,H]=l.useState(null),I=()=>{i(!0),Promise.all([ie.list(),be.list()]).then(([m,L])=>{s(m.members.filter(U=>U.role==="client")),a(L.objects)}).finally(()=>i(!1))};l.useEffect(()=>{I()},[]);const q=()=>{b(null),x(""),c(""),d(""),f(""),B([]),r("")},me=m=>{B(L=>L.includes(m)?L.filter(U=>U!==m):[...L,m])},pe=()=>{q(),u(!0)},Z=m=>{var L;b(m.id),x(m.full_name),c(m.email),d(""),f(m.phone||""),B(((L=m.objects)==null?void 0:L.map(U=>U.id))||[]),r(""),u(!0)},xe=async()=>{if(r(""),N){if(_.length===0){r("Выберите хотя бы один объект");return}A(!0);try{await ie.updateObjects(N,_),u(!1),q(),I()}catch(m){r(m instanceof Error?m.message:"Ошибка сохранения")}finally{A(!1)}return}if(w.trim().length<2){r("Введите имя");return}if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($)){r("Введите корректный email");return}if(C.length<6){r("Пароль должен быть не короче 6 символов");return}if(_.length===0){r("Выберите хотя бы один объект для заказчика");return}A(!0);try{await ie.create({full_name:w,email:$,password:C,role:"client",phone:z,object_ids:_}),u(!1),q(),I()}catch(m){r(m instanceof Error?m.message:"Ошибка сохранения")}finally{A(!1)}},se=async m=>{await ie.remove(m),I()},W=m=>new Date(m).toLocaleDateString("ru-RU",{day:"numeric",month:"short",year:"numeric"});return e.jsxs(ce,{title:"Заказчики",subtitle:"База ваших клиентов с доступом в кабинет",children:[k&&e.jsx("div",{className:"flex justify-end mb-6",children:e.jsxs("button",{onClick:pe,className:"w-full sm:w-auto justify-center min-h-[44px] sm:min-h-0 flex items-center gap-2 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm px-4 py-2.5 rounded-lg",children:[e.jsx(v,{name:"UserPlus",size:16}),"Создать логин заказчика"]})}),e.jsx("div",{className:"md:bg-[#1f1f1f] md:border md:border-white/10 md:rounded-xl md:p-5",children:g?e.jsx("div",{className:"flex justify-center py-16",children:e.jsx(v,{name:"Loader2",size:24,className:"animate-spin text-white/40"})}):n.length===0?e.jsx("div",{className:"text-center py-16 text-white/30 text-sm",children:"Пока нет заказчиков с доступом в кабинет"}):e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"md:hidden flex flex-col gap-3",children:n.map(m=>e.jsx(Ue,{title:m.full_name,subtitle:m.email,rows:[{label:"Объекты",value:m.objects&&m.objects.length>0?m.objects.map(L=>L.object_code).join(", "):"—"},{label:"С нами с",value:W(m.created_at)}],actions:k?e.jsxs(e.Fragment,{children:[e.jsx(je,{icon:e.jsx(v,{name:"Pencil",size:15}),label:"Объекты",onClick:()=>Z(m)}),e.jsx(je,{icon:e.jsx(v,{name:"KeyRound",size:15}),label:"Пароль",onClick:()=>H(m)}),e.jsx("div",{className:"w-10 h-10 flex items-center justify-center rounded-lg bg-white/5 shrink-0",children:e.jsx(te,{onConfirm:()=>se(m.id)})})]}):void 0},m.id))}),e.jsx("div",{className:"hidden md:block overflow-x-auto",children:e.jsxs("table",{className:"w-full text-sm",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"text-white/40 text-xs uppercase border-b border-white/10",children:[e.jsx("th",{className:"text-left font-medium py-2 pr-4",children:"Имя"}),e.jsx("th",{className:"text-left font-medium py-2 pr-4",children:"Email"}),e.jsx("th",{className:"text-left font-medium py-2 pr-4",children:"Объекты"}),e.jsx("th",{className:"text-left font-medium py-2 pr-4",children:"С нами с"}),k&&e.jsx("th",{className:"text-left font-medium py-2 pr-4",children:"Действия"})]})}),e.jsx("tbody",{children:n.map(m=>e.jsxs("tr",{className:"border-b border-white/5 last:border-0",children:[e.jsx("td",{className:"py-3 pr-4",children:m.full_name}),e.jsx("td",{className:"py-3 pr-4 text-white/60",children:m.email}),e.jsx("td",{className:"py-3 pr-4 text-white/60",children:m.objects&&m.objects.length>0?m.objects.map(L=>L.object_code).join(", "):"—"}),e.jsx("td",{className:"py-3 pr-4 text-white/40",children:W(m.created_at)}),k&&e.jsx("td",{className:"py-3 pr-4",children:e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("button",{onClick:()=>Z(m),className:"text-white/40 hover:text-white transition-colors",title:"Изменить объекты",children:e.jsx(v,{name:"Pencil",size:16})}),e.jsx("button",{onClick:()=>H(m),className:"text-white/40 hover:text-white transition-colors",title:"Задать пароль для входа",children:e.jsx(v,{name:"KeyRound",size:16})}),e.jsx(te,{onConfirm:()=>se(m.id)})]})})]},m.id))})]})})]})}),e.jsx(Ce,{open:o,onOpenChange:m=>{u(m),m||q()},children:e.jsxs(ze,{className:"bg-[#1f1f1f] border-white/10 text-white sm:max-w-md max-h-[85vh] overflow-y-auto",children:[e.jsx(Se,{children:e.jsx(Ee,{children:N?"Объекты заказчика":"Новый заказчик"})}),e.jsxs("div",{className:"flex flex-col gap-3 mt-2",children:[!N&&e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"flex flex-col gap-1.5",children:[e.jsx("label",{className:"text-xs text-white/50",children:"Имя"}),e.jsx("input",{value:w,onChange:m=>x(m.target.value),placeholder:"Иванов Иван",className:"bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"})]}),e.jsxs("div",{className:"flex flex-col gap-1.5",children:[e.jsx("label",{className:"text-xs text-white/50",children:"Email"}),e.jsx("input",{type:"email",value:$,onChange:m=>c(m.target.value),placeholder:"user@example.com",className:"bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"})]}),e.jsxs("div",{className:"flex flex-col gap-1.5",children:[e.jsx("label",{className:"text-xs text-white/50",children:"Пароль"}),e.jsx("input",{type:"password",value:C,onChange:m=>d(m.target.value),placeholder:"••••••••",className:"bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"})]}),e.jsxs("div",{className:"flex flex-col gap-1.5",children:[e.jsx("label",{className:"text-xs text-white/50",children:"Телефон"}),e.jsx("input",{value:z,onChange:m=>f(m.target.value),placeholder:"+7 900 000 00 00",className:"bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"})]})]}),e.jsxs("div",{className:"flex flex-col gap-1.5",children:[e.jsx("label",{className:"text-xs text-white/50",children:"Доступные объекты"}),p.length===0?e.jsx("p",{className:"text-xs text-white/30",children:"Сначала создайте хотя бы один объект"}):e.jsx("div",{className:"flex flex-col gap-1.5 max-h-40 overflow-y-auto border border-white/10 rounded-lg p-2",children:p.map(m=>e.jsxs("label",{className:"flex items-center gap-2 text-sm px-2 py-1.5 rounded hover:bg-white/5 cursor-pointer",children:[e.jsx("input",{type:"checkbox",checked:_.includes(m.id),onChange:()=>me(m.id),className:"accent-[#D4AF37]"}),e.jsx("span",{className:"text-[#D4AF37]",children:m.object_code}),e.jsxs("span",{className:"text-white/50",children:["— ",m.client_name]})]},m.id))})]}),y&&e.jsxs("p",{className:"text-sm text-red-400 flex items-center gap-1.5",children:[e.jsx(v,{name:"CircleAlert",size:15}),y]}),e.jsx("button",{onClick:xe,disabled:h,className:"mt-2 flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm px-4 py-3 rounded-lg disabled:opacity-60",children:h?e.jsx(v,{name:"Loader2",size:16,className:"animate-spin"}):N?"Сохранить объекты":"Создать логин заказчика"})]})]})}),e.jsx(Ke,{open:!!D,onOpenChange:m=>{m||H(null)},memberId:(D==null?void 0:D.id)??null,memberName:(D==null?void 0:D.full_name)??""})]})}const kt=Object.freeze(Object.defineProperty({__proto__:null,default:ht},Symbol.toStringTag,{value:"Module"}));export{nt as C,te as D,at as E,Nt as P,et as R,vt as a,wt as b,yt as c,ct as d,jt as e,Oe as f,_t as g,kt as h,lt as p};
