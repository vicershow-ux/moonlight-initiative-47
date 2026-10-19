import{r as A}from"./pdfRender-B7185Tyn.js";const x=t=>String(t??"").replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\r?\n/g," "),m=(t,e=0)=>{const o=typeof t=="string"?parseFloat(t):Number(t);return Number.isFinite(o)?o:e},h=t=>new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0}).format(m(t))+" ₽";function s(t){const e=document.createElement("div");return e.textContent=t??"",e.innerHTML}function z(t,e){const o=new Map;return t.forEach(i=>{const a=e.find(d=>d.id===i.material_id),r=i.shop_name||(a==null?void 0:a.shop_name)||"Магазин не указан";o.has(r)||o.set(r,{name:r,address:"",phone:"",items:[],sum:0});const n=o.get(r);!n.address&&(a!=null&&a.shop_address)&&(n.address=a.shop_address),!n.phone&&(a!=null&&a.shop_phone)&&(n.phone=a.shop_phone),n.items.push(i),n.sum+=m(i.qty)*m(i.price)}),Array.from(o.values()).sort((i,a)=>a.sum-i.sum)}function v(t,e,o,i){const a=z(e,o),r=a.reduce((p,b)=>p+b.sum,0),n=Array.from(new Set(e.map(p=>p.room_name).filter(Boolean))),d=n.length?n.join(", "):"Без помещения",l=a.map(p=>{const b=p.items.map((f,$)=>`
            <tr>
              <td class="num">${$+1}</td>
              <td>${s(f.name)}</td>
              <td>${s(f.room_name||"—")}</td>
              <td class="center">${m(f.qty)}</td>
              <td class="center">${s(f.unit)}</td>
              <td class="right">${h(f.price)}</td>
              <td class="right amount">${h(m(f.qty)*m(f.price))}</td>
            </tr>`).join(""),g=p.address?`Адрес: ${s(p.address)}`:"";return`
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
              <tr class="cat-row"><td colspan="7">${s(p.name)}${g?` — ${g}`:""}</td></tr>
              ${b}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="6" class="right">Итого по магазину</td>
                <td class="right amount">${h(p.sum)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>`}).join(""),c=`
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
      content: "${x(`Материалы · объект ${t.object_code||""}`.trim())}";
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 8.5pt;
      color: #6B4508;
    }
    @top-right {
      content: "${x(t.client_name||i)}";
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
`,y=`
  <div class="header">
    <div class="brand"><img class="brand-logo" src="${window.location.origin}/logo-print.png" alt="FixKey"/><b class="brand-word">Fix<span>Key</span></b></div>
    <div class="doc-title">
      <h1>Смета на материал</h1>
      <p>Объект № ${s(t.object_code)}</p>
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
      <div class="value">${s(t.object_code)}</div>
    </div>
    <div>
      <div class="label">Заказчик</div>
      <div class="value">${s(t.client_name)}</div>
    </div>
    <div>
      <div class="label">Адрес объекта</div>
      <div class="value">${s(t.address||"—")}</div>
    </div>
    <div>
      <div class="label">Помещение</div>
      <div class="value">${s(d)}</div>
    </div>
  </div>

  ${l}

  <div class="summary">
    <div class="summary-box">
      <div class="summary-row">
        <span>Помещение:</span>
        <span>${s(d)}</span>
      </div>
      <div class="summary-total">
        <span>ИТОГО:</span>
        <span>${h(r)}</span>
      </div>
    </div>
  </div>

  <hr class="thin" />

  <div class="parties">
    <div>
      <div class="label">Исполнитель</div>
      <div class="name">${s(i)}</div>
    </div>
    <div>
      <div class="label">Заказчик</div>
      <div class="name">${s(t.client_name)}</div>
    </div>
  </div>`,k=`Смета на материал № ${t.object_code} — ${s(t.client_name)}`;return{styles:c,bodyContent:y,title:k}}function j(t,e,o,i,a=!1){const{styles:r,bodyContent:n,title:d}=v(t,e,o,i),l=`<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8" />
<title>${d}</title>
<style>${r}</style>
</head>
<body>
<div class="est-root">${n}</div>
</body>
</html>`,c=window.open("","_blank","width=900,height=1000");c&&(c.document.open(),c.document.write(l),c.document.close(),a&&(c.onload=()=>{c.focus(),c.print()}))}function u(t,e){let o=t;for(;;){const i=e.exec(o);if(!i)return o;const a=o.indexOf("{",i.index);if(a===-1)return o;let r=0,n=-1;for(let d=a;d<o.length;d++)if(o[d]==="{")r++;else if(o[d]==="}"&&(r--,r===0)){n=d;break}if(n===-1)return o;o=o.slice(0,i.index)+o.slice(n+1),e.lastIndex=0}}function _(t,e){return u(u(t,/@page\b/g),/@media\s+print\b/g).replace(/(^|\})\s*([^{}@]+)\s*\{/g,(i,a,r)=>{const n=r.split(",").map(d=>{const l=d.trim();return l?l==="*"?`${e}, ${e} *`:/^(html|body)$/i.test(l)||l===".est-root"?e:l.startsWith(".est-root ")?`${e} ${l.slice(10)}`:`${e} ${l}`:""}).filter(Boolean).join(", ");return`${a} ${n} {`})}const E=`
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
`;function C(t,e,o,i){const{styles:a,bodyContent:r}=v(t,e,o,i);return`<style>${_(a+E,"#pdf-scope-materials")}</style>${r}`}async function S(t,e,o,i){await w(t,e,o,i,"save")}async function F(t,e,o,i){return await w(t,e,o,i,"base64")||""}async function w(t,e,o,i,a){return A(r=>{r.id="pdf-scope-materials",r.className="est-root",r.innerHTML=C(t,e,o,i)},{filename:`Смета на материал ${t.object_code}.pdf`,mode:a})}export{S as d,F as m,j as p};
