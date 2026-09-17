const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/html2pdf-9jQU_ERa.js","assets/index-DoQbGAWO.js","assets/index-lj-BAnLg.css"])))=>i.map(i=>d[i]);
import{a9 as $}from"./index-DoQbGAWO.js";const v=t=>String(t??"").replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\r?\n/g," "),b=(t,r=0)=>{const e=typeof t=="string"?parseFloat(t):Number(t);return Number.isFinite(e)?e:r},g=t=>new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0}).format(b(t))+" ₽",A=t=>new Date(t).toLocaleString("ru-RU",{day:"numeric",month:"numeric",year:"numeric",hour:"2-digit",minute:"2-digit"});function l(t){const r=document.createElement("div");return r.textContent=t??"",r.innerHTML}function _(t,r){const e=new Map;return t.forEach(n=>{const i=r.find(a=>a.id===n.material_id),d=n.shop_name||(i==null?void 0:i.shop_name)||"Магазин не указан";e.has(d)||e.set(d,{name:d,address:"",phone:"",items:[],sum:0});const o=e.get(d);!o.address&&(i!=null&&i.shop_address)&&(o.address=i.shop_address),!o.phone&&(i!=null&&i.shop_phone)&&(o.phone=i.shop_phone),o.items.push(n),o.sum+=b(n.qty)*b(n.price)}),Array.from(e.values()).sort((n,i)=>i.sum-n.sum)}function y(t,r,e,n){const i=_(r,e),d=i.reduce((c,u)=>c+u.sum,0),o=Array.from(new Set(r.map(c=>c.room_name).filter(Boolean))),a=o.length?o.join(", "):"Без помещения",s=i.map(c=>{const u=c.items.map((h,k)=>`
            <tr>
              <td class="num">${k+1}</td>
              <td>${l(h.name)}</td>
              <td>${l(h.room_name||"—")}</td>
              <td class="center">${b(h.qty)}</td>
              <td class="center">${l(h.unit)}</td>
              <td class="right">${g(h.price)}</td>
              <td class="right amount">${g(b(h.qty)*b(h.price))}</td>
            </tr>`).join(""),x=c.address?`Адрес: ${l(c.address)}`:"";return`
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
              <tr class="cat-row"><td colspan="7">${l(c.name)}${x?` — ${x}`:""}</td></tr>
              ${u}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="6" class="right">Итого по магазину</td>
                <td class="right amount">${g(c.sum)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>`}).join(""),p=`
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
      content: "${v(`Материалы · объект ${t.object_code||""}`.trim())}";
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 8.5pt;
      color: #6B4508;
    }
    @top-right {
      content: "${v(t.client_name||n)}";
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
`,f=`
  <div class="header">
    <div class="brand"><img class="brand-logo" src="${window.location.origin}/logo-print.png" alt="FixKey"/>Fix<span>Key</span></div>
    <div class="doc-title">
      <h1>Смета на материал</h1>
      <p>Объект № ${l(t.object_code)}</p>
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
      <div class="value">${l(t.object_code)}</div>
    </div>
    <div>
      <div class="label">Заказчик</div>
      <div class="value">${l(t.client_name)}</div>
    </div>
    <div>
      <div class="label">Адрес объекта</div>
      <div class="value">${l(t.address||"—")}</div>
    </div>
    <div>
      <div class="label">Помещение</div>
      <div class="value">${l(a)}</div>
    </div>
  </div>

  ${s}

  <div class="summary">
    <div class="summary-box">
      <div class="summary-row">
        <span>Помещение:</span>
        <span>${l(a)}</span>
      </div>
      <div class="summary-total">
        <span>ИТОГО:</span>
        <span>${g(d)}</span>
      </div>
    </div>
  </div>

  <hr class="thin" />

  <div class="parties">
    <div>
      <div class="label">Исполнитель</div>
      <div class="name">${l(n)}</div>
    </div>
    <div>
      <div class="label">Заказчик</div>
      <div class="name">${l(t.client_name)}</div>
    </div>
  </div>

  <div class="footer">
    Сформировано ${A(new Date().toISOString())}
  </div>`,m=`Смета на материал № ${t.object_code} — ${l(t.client_name)}`;return{styles:p,bodyContent:f,title:m}}function E(t,r,e,n,i=!1){const{styles:d,bodyContent:o,title:a}=y(t,r,e,n),s=`<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8" />
<title>${a}</title>
<style>${d}</style>
</head>
<body>
<div class="est-root">${o}</div>
</body>
</html>`,p=window.open("","_blank","width=900,height=1000");p&&(p.document.open(),p.document.write(s),p.document.close(),i&&(p.onload=()=>{p.focus(),p.print()}))}function w(t,r){let e=t;for(;;){const n=r.exec(e);if(!n)return e;const i=e.indexOf("{",n.index);if(i===-1)return e;let d=0,o=-1;for(let a=i;a<e.length;a++)if(e[a]==="{")d++;else if(e[a]==="}"&&(d--,d===0)){o=a;break}if(o===-1)return e;e=e.slice(0,n.index)+e.slice(o+1),r.lastIndex=0}}function z(t,r){return w(w(t,/@page\b/g),/@media\s+print\b/g).replace(/(^|\})\s*([^{}@]+)\s*\{/g,(n,i,d)=>{const o=d.split(",").map(a=>{const s=a.trim();return s?s==="*"?`${r}, ${r} *`:/^(html|body)$/i.test(s)||s===".est-root"?r:s.startsWith(".est-root ")?`${r} ${s.slice(10)}`:`${r} ${s}`:""}).filter(Boolean).join(", ");return`${i} ${o} {`})}async function j(t,r,e,n){const{styles:i,bodyContent:d}=y(t,r,e,n),o=document.createElement("div");o.style.position="fixed",o.style.left="-10000px",o.style.top="0",o.style.width="760px",o.style.background="#ffffff";const a=document.createElement("div");a.id="pdf-scope-materials",a.className="est-root",a.style.width="760px",a.style.maxWidth="760px",a.style.padding="0",a.style.margin="0",a.style.background="#ffffff";const s=document.createElement("style");s.textContent=z(i,"#pdf-scope-materials"),a.appendChild(s);const p=document.createElement("div");p.innerHTML=d,a.appendChild(p),o.appendChild(a),document.body.appendChild(o),await new Promise(f=>{const m=new Image;m.onload=()=>f(),m.onerror=()=>f(),m.src=`${window.location.origin}/logo-print.png`,setTimeout(f,3e3)});try{const f=(await $(async()=>{const{default:m}=await import("./html2pdf-9jQU_ERa.js").then(c=>c.h);return{default:m}},__vite__mapDeps([0,1,2]))).default;await f().set({margin:[12,12,12,12],filename:`Смета на материал ${t.object_code}.pdf`,image:{type:"jpeg",quality:.98},html2canvas:{scale:2,useCORS:!0,backgroundColor:"#ffffff",width:760,windowWidth:760,scrollX:0,scrollY:0},jsPDF:{unit:"mm",format:"a4",orientation:"portrait"},pagebreak:{mode:["css","legacy"],avoid:[".cat-block",".room-block"]}}).from(a).save()}finally{o.parentNode&&document.body.removeChild(o)}}export{j as d,E as p};
