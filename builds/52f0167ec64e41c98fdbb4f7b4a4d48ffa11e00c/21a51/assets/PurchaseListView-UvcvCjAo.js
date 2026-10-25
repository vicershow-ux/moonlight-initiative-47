import{r as v,w as ht,j as a,D as ut,l as ft,m as xt,n as bt,I as C,E as gt,o as wt,au as V,k as M}from"./index-rjwDq6o3.js";import{C as vt}from"./Company-CbF3AAYr.js";import{r as et,f as I}from"./RentalContract-I2GfEkP-.js";const J=t=>String(t??"").replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\r?\n/g," "),T=(t,e=0)=>{const s=typeof t=="string"?parseFloat(t):Number(t);return Number.isFinite(s)?s:e},O=t=>new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0}).format(T(t))+" ₽";function k(t){const e=document.createElement("div");return e.textContent=t??"",e.innerHTML}function yt(t,e){const s=new Map;return t.forEach(r=>{const n=e.find(i=>i.id===r.material_id),d=r.shop_name||(n==null?void 0:n.shop_name)||"Магазин не указан";s.has(d)||s.set(d,{name:d,address:"",phone:"",items:[],sum:0});const o=s.get(d);!o.address&&(n!=null&&n.shop_address)&&(o.address=n.shop_address),!o.phone&&(n!=null&&n.shop_phone)&&(o.phone=n.shop_phone),o.items.push(r),o.sum+=T(r.qty)*T(r.price)}),Array.from(s.values()).sort((r,n)=>n.sum-r.sum)}function st(t,e,s,r,n="Смета на материал"){const d=yt(e,s),o=d.reduce((b,w)=>b+w.sum,0),i=Array.from(new Set(e.map(b=>b.room_name).filter(Boolean))),p=i.length?i.join(", "):"Без помещения",c=d.map(b=>{const w=b.items.map((g,N)=>`
            <tr>
              <td class="num">${N+1}</td>
              <td>${k(g.name)}</td>
              <td>${k(g.room_name||"—")}</td>
              <td class="center">${T(g.qty)}</td>
              <td class="center">${k(g.unit)}</td>
              <td class="right">${O(g.price)}</td>
              <td class="right amount">${O(T(g.qty)*T(g.price))}</td>
            </tr>`).join(""),u=b.address?`Адрес: ${k(b.address)}`:"";return`
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
              <tr class="cat-row"><td colspan="7">${k(b.name)}${u?` — ${u}`:""}</td></tr>
              ${w}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="6" class="right">Итого по магазину</td>
                <td class="right amount">${O(b.sum)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>`}).join(""),x=`
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
      content: "${J(`Материалы · объект ${t.object_code||""}`.trim())}";
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 8.5pt;
      color: #6B4508;
    }
    @top-right {
      content: "${J(t.client_name||r)}";
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
      <h1>${k(n)}</h1>
      <p>Объект № ${k(t.object_code)}</p>
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
      <div class="value">${k(t.object_code)}</div>
    </div>
    <div>
      <div class="label">Заказчик</div>
      <div class="value">${k(t.client_name)}</div>
    </div>
    <div>
      <div class="label">Адрес объекта</div>
      <div class="value">${k(t.address||"—")}</div>
    </div>
    <div>
      <div class="label">Помещение</div>
      <div class="value">${k(p)}</div>
    </div>
  </div>

  ${c}

  <div class="summary">
    <div class="summary-box">
      <div class="summary-row">
        <span>Помещение:</span>
        <span>${k(p)}</span>
      </div>
      <div class="summary-total">
        <span>ИТОГО:</span>
        <span>${O(o)}</span>
      </div>
    </div>
  </div>

  <hr class="thin" />

  <div class="parties">
    <div>
      <div class="label">Исполнитель</div>
      <div class="name">${k(r)}</div>
    </div>
    <div>
      <div class="label">Заказчик</div>
      <div class="name">${k(t.client_name)}</div>
    </div>
  </div>`,l=`${k(n)} № ${t.object_code} — ${k(t.client_name)}`;return{styles:x,bodyContent:j,title:l}}function Dt(t,e,s,r,n=!1,d){const{styles:o,bodyContent:i,title:p}=st(t,e,s,r,d),c=`<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8" />
<title>${p}</title>
<style>${o}</style>
</head>
<body>
<div class="est-root">${i}</div>
</body>
</html>`,x=window.open("","_blank","width=900,height=1000");x&&(x.document.open(),x.document.write(c),x.document.close(),n&&(x.onload=()=>{x.focus(),x.print()}))}function Q(t,e){let s=t;for(;;){const r=e.exec(s);if(!r)return s;const n=s.indexOf("{",r.index);if(n===-1)return s;let d=0,o=-1;for(let i=n;i<s.length;i++)if(s[i]==="{")d++;else if(s[i]==="}"&&(d--,d===0)){o=i;break}if(o===-1)return s;s=s.slice(0,r.index)+s.slice(o+1),e.lastIndex=0}}function ot(t,e){return Q(Q(t,/@page\b/g),/@media\s+print\b/g).replace(/(^|\})\s*([^{}@]+)\s*\{/g,(r,n,d)=>{const o=d.split(",").map(i=>{const p=i.trim();return p?p==="*"?`${e}, ${e} *`:/^(html|body)$/i.test(p)||p===".est-root"?e:p.startsWith(".est-root ")?`${e} ${p.slice(10)}`:`${e} ${p}`:""}).filter(Boolean).join(", ");return`${n} ${o} {`})}const kt=`
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
`;function $t(t,e,s,r,n){const{styles:d,bodyContent:o}=st(t,e,s,r,n);return`<style>${ot(d+kt,"#pdf-scope-materials")}</style>${o}`}async function Bt(t,e,s,r,n){await at(t,e,s,r,"save",n)}async function Mt(t,e,s,r,n){return await at(t,e,s,r,"base64",n)||""}async function at(t,e,s,r,n,d="Смета на материал"){return et(o=>{o.id="pdf-scope-materials",o.className="est-root",o.innerHTML=$t(t,e,s,r,d)},{filename:`${d} ${t.object_code}.pdf`,mode:n})}function It({open:t,onOpenChange:e,docName:s,objectId:r,fileName:n,makePdf:d,send:o,extraFiles:i=[]}){const[p,c]=v.useState(""),[x,j]=v.useState(""),[l,b]=v.useState(!1),[w,u]=v.useState(""),[g,N]=v.useState(!1),[S,A]=v.useState([]);v.useEffect(()=>{t&&(u(""),N(!1),A([]),r&&ht.get(r).then(h=>c(y=>y||(h==null?void 0:h.email)||"")).catch(()=>null))},[t,r]);const F=async()=>{if(u(""),!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(p.trim())){u("Укажите корректный email заказчика");return}b(!0);try{const h=await d();if(!h)throw new Error("Не удалось сформировать PDF");if(h.length>33e5)throw new Error("Документ слишком большой для письма. Скачайте PDF и отправьте его вручную.");const y=await o({email:p.trim(),pdf_base64:h,message:x.trim()});A((y==null?void 0:y.skipped)||[]),N(!0)}catch(h){u(h instanceof Error?h.message:"Не удалось отправить письмо")}finally{b(!1)}};return a.jsx(ut,{open:t,onOpenChange:e,children:a.jsxs(ft,{className:"border-white/10 bg-[#1f1f1f] text-white sm:max-w-md",children:[a.jsx(xt,{children:a.jsxs(bt,{className:"pr-6 break-words",children:["Отправить ",s," заказчику"]})}),g?a.jsxs("div",{className:"flex flex-col items-center gap-3 py-6 text-center",children:[a.jsx("div",{className:"flex h-12 w-12 items-center justify-center rounded-full bg-green-500/15 text-green-400",children:a.jsx(C,{name:"Check",size:24})}),a.jsx("p",{className:"font-medium",children:"Отправлено"}),a.jsxs("p",{className:"text-sm text-white/50",children:[i.length?"PDF и вложения ушли":"PDF ушёл"," на ",p]}),S.length>0&&a.jsxs("p",{className:"text-xs text-amber-400",children:["Не удалось приложить: ",S.join(", ")]}),a.jsx("button",{onClick:()=>e(!1),className:"mt-2 w-full sm:w-auto min-h-[44px] sm:min-h-0 rounded-lg bg-white/10 px-4 py-2 text-sm transition-colors hover:bg-white/15",children:"Закрыть"})]}):a.jsxs("div",{className:"flex flex-col gap-4",children:[a.jsxs("div",{className:"flex flex-col gap-1.5",children:[a.jsx("label",{className:"text-xs text-white/50",children:"Email заказчика"}),a.jsx("input",{type:"email",value:p,onChange:h=>c(h.target.value),placeholder:"client@mail.ru",className:"rounded-lg border border-white/15 bg-[#161616] px-3 py-2.5 text-base sm:text-sm outline-none focus:border-[#D4AF37]/50"})]}),a.jsxs("div",{className:"flex flex-col gap-1.5",children:[a.jsx("label",{className:"text-xs text-white/50",children:"Сообщение (необязательно)"}),a.jsx("textarea",{value:x,onChange:h=>j(h.target.value),rows:3,placeholder:"Например: подпишите, пожалуйста, и пришлите скан в ответ",className:"resize-none rounded-lg border border-white/15 bg-[#161616] px-3 py-2.5 text-base sm:text-sm outline-none focus:border-[#D4AF37]/50"})]}),a.jsxs("p",{className:"flex items-start gap-1.5 text-xs text-white/40 break-all",children:[a.jsx(C,{name:"Paperclip",size:13,className:"shrink-0 mt-0.5"}),"Вложения: ",[n,...i].join(", ")]}),w&&a.jsxs("p",{className:"flex items-center gap-1.5 text-sm text-red-400",children:[a.jsx(C,{name:"CircleAlert",size:15}),w]}),a.jsxs("button",{onClick:F,disabled:l,className:"flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-[#D4AF37] px-4 py-2.5 text-sm font-medium text-[#161616] transition-colors hover:bg-[#B8860B] disabled:opacity-60",children:[l?a.jsx(C,{name:"Loader2",size:15,className:"animate-spin"}):a.jsx(C,{name:"Send",size:15}),l?"Отправляю…":"Отправить"]})]})]})})}const W="ремонт квартиры";function nt(t){const e=(t||"").trim();return!e||e===W?W:{Отопление:"монтаж отопления",Благоустройство:"благоустройство территории","Вентиляция и кондиционирование":"монтаж вентиляции и кондиционирования",Вентиляция:"монтаж вентиляции",Кондиционирование:"монтаж систем кондиционирования","Умный дом":"монтаж и настройка системы «Умный дом»","Слаботочные работы":"монтаж слаботочных сетей","Устройство полов":"устройство полов"}[e]||e.charAt(0).toLowerCase()+e.slice(1)}const Lt=t=>`Договор подряда на ${nt(t)}`;function Tt(t){const e=(t||"").trim();return!e||e===W?{works:"ремонтно-отделочные работы",place:"в квартире"}:{works:`работы по направлению «${e}»`,place:"на объекте"}}function Ht(t){const e=/Договор подряда на ([^<№]+?)\s*№/.exec(t||"");return e?`Договор подряда на ${e[1].trim()}`:null}const jt={"Электромонтажные работы":"Правилам устройства электроустановок (ПУЭ, 7-е изд.), СП 76.13330.2016 «Электротехнические устройства», СП 256.1325800.2016 «Электроустановки жилых и общественных зданий» и ГОСТ Р 50571 (МЭК 60364)","Сантехнические работы":"СП 30.13330.2020 «Внутренний водопровод и канализация зданий» и СП 73.13330.2016 «Внутренние санитарно-технические системы зданий»",Отопление:"СП 60.13330.2020 «Отопление, вентиляция и кондиционирование воздуха» и СП 73.13330.2016 «Внутренние санитарно-технические системы зданий»","Вентиляция и кондиционирование":"СП 60.13330.2020 «Отопление, вентиляция и кондиционирование воздуха» и СП 73.13330.2016 «Внутренние санитарно-технические системы зданий»",Вентиляция:"СП 60.13330.2020 «Отопление, вентиляция и кондиционирование воздуха» и СП 73.13330.2016 «Внутренние санитарно-технические системы зданий»",Кондиционирование:"СП 60.13330.2020 «Отопление, вентиляция и кондиционирование воздуха» и СП 73.13330.2016 «Внутренние санитарно-технические системы зданий»","Плиточные работы":"СП 71.13330.2017 «Изоляционные и отделочные покрытия»","Черновые отделочные работы":"СП 71.13330.2017 «Изоляционные и отделочные покрытия»","Чистовые отделочные работы":"СП 71.13330.2017 «Изоляционные и отделочные покрытия»","Подготовительные работы":"СП 71.13330.2017 «Изоляционные и отделочные покрытия» и СП 48.13330.2019 «Организация строительства»","Потолочные работы":"СП 71.13330.2017 «Изоляционные и отделочные покрытия» и СП 163.1325800.2014 «Конструкции с применением гипсокартонных и гипсоволокнистых листов»","Гипсокартонные работы":"СП 163.1325800.2014 «Конструкции с применением гипсокартонных и гипсоволокнистых листов» и СП 71.13330.2017 «Изоляционные и отделочные покрытия»","Устройство полов":"СП 29.13330.2011 «Полы» и СП 71.13330.2017 «Изоляционные и отделочные покрытия»","Бетонные работы":"СП 70.13330.2012 «Несущие и ограждающие конструкции» и СП 63.13330.2018 «Бетонные и железобетонные конструкции»","Кладочные работы":"СП 70.13330.2012 «Несущие и ограждающие конструкции» и СП 15.13330.2020 «Каменные и армокаменные конструкции»","Кровельные работы":"СП 17.13330.2017 «Кровли» и СП 71.13330.2017 «Изоляционные и отделочные покрытия»","Изоляционные работы":"СП 71.13330.2017 «Изоляционные и отделочные покрытия» и СП 50.13330.2012 «Тепловая защита зданий»","Фасадные работы":"СП 293.1325800.2017 «Системы фасадные теплоизоляционные композиционные с наружными штукатурными слоями» и СП 71.13330.2017 «Изоляционные и отделочные покрытия»","Земляные работы":"СП 45.13330.2017 «Земляные сооружения, основания и фундаменты»",Благоустройство:"СП 82.13330.2016 «Благоустройство территорий»","Демонтажные работы":"СП 325.1325800.2017 «Здания и сооружения. Правила производства работ при демонтаже и утилизации» и СП 48.13330.2019 «Организация строительства»","Столярные работы":"СП 71.13330.2017 «Изоляционные и отделочные покрытия», ГОСТ 475-2016 «Блоки дверные деревянные и комбинированные» и ГОСТ 30971-2012 (монтажные швы оконных и дверных блоков)","Монтажные работы":"СП 70.13330.2012 «Несущие и ограждающие конструкции» и СП 48.13330.2019 «Организация строительства»"};function qt(t){const e=(t||"").trim(),s=jt[e];return s?`Качество работ должно соответствовать ${s}, а также иным действующим сводам правил (СП), государственным стандартам (ГОСТ) и техническим регламентам, применимым к данному виду работ. При отсутствии конкретных требований качество определяется общепринятой практикой выполнения таких работ.`:"Качество работ должно соответствовать действующим строительным нормам и правилам (СНиП), сводам правил (СП), государственным стандартам (ГОСТ) и техническим регламентам. При отсутствии конкретных требований качество определяется общепринятой практикой выполнения строительных и отделочных работ."}const X={advance_4_stages:[["Аванс",25],["Этап 1",25],["Этап 2",25],["Сдача объекта",25]],advance_3_stages:[["Аванс",30],["Этап 1",40],["Сдача объекта",30]],advance_2_stages:[["Аванс",50],["Сдача объекта",50]]};function Ot(t){const e=t.options||{},s=e.cost_type==="fixed"&&e.fixed_amount?Number(e.fixed_amount)||0:Number(t.total_amount)||0,r=[{key:"full",label:"Полная стоимость работ",amount:s}];return e.payment_order!=="advance_staged"?r:e.payment_schedule==="custom_schedule"?((e.custom_stages||[]).forEach((d,o)=>r.push({key:`s${o}`,label:d.label||`Этап ${o+1}`,amount:Number(d.amount)||0})),r):((X[e.payment_schedule||"advance_4_stages"]||X.advance_4_stages).forEach(([d,o],i)=>{var c;const p=(c=e.schedule_amounts)==null?void 0:c[i];r.push({key:`s${i}`,label:`${d} (${o}%)`,amount:p?Number(p)||0:Math.round(s*o/100)})}),r)}function Rt(t,e){var n;const s=nt((n=t.options)==null?void 0:n.work_subject);return{name:e.key==="full"?`Работы: ${s} по Договору подряда № ${t.contract_number}`:`${s.charAt(0).toUpperCase()+s.slice(1)} — ${e.label.replace(/\s*\(\d+%\)/,"").toLowerCase()} по Договору подряда № ${t.contract_number}`,unit:"усл.",quantity:1,price:e.amount,amount:e.amount}}function Ut(t){const e=(t.items||[]).map(r=>{const n=Number(r.quantity)||0,d=Number(r.price)||0;return{name:r.name,unit:r.unit||"шт.",quantity:n,price:d,amount:n*d}});if(e.length)return e;const s=Number(t.total_amount)||0;return[{name:`Работы по Акту № ${t.act_number}`,unit:"усл.",quantity:1,price:s,amount:s}]}const E=(t,e=0)=>{const s=typeof t=="string"?parseFloat(t):Number(t);return Number.isFinite(s)?s:e},R="Магазин не выбран";function Nt(t,e){const s=t.filter(o=>E(o.price)>0);if(s.length===0)return null;const r=s.map(o=>{const i=!!o.stock_known,p=E(o.stock),c=!i||p>=e,x=i&&p>0&&p<e;return{offer:o,enough:c,partial:x,price:E(o.price)}}),n=r.filter(o=>o.enough);if(n.length>0)return n.reduce((o,i)=>i.price<o.price?i:o).offer;const d=r.filter(o=>o.partial);return d.length>0?d.reduce((o,i)=>i.price<o.price?i:o).offer:r.reduce((o,i)=>i.price<o.price?i:o).offer}function rt(t,e){const s=new Map;let r=0,n=0,d=0;t.forEach((i,p)=>{const c=e.find(P=>P.id===i.material_id),x=(c==null?void 0:c.offers)||[],j=E(i.qty),l=Nt(x,j),b=E(l?l.price:i.price),w=(l==null?void 0:l.shop_name)||i.shop_name||(c==null?void 0:c.shop_name)||R,g=(l?!!l.stock_known:!1)?E(l.stock):null,N=g===null?!0:g>=j,S=N||g===null?0:Math.max(0,j-g);N||(n+=1),w===R&&(d+=1);const A=x.filter(P=>E(P.price)>0).map(P=>E(P.price)),F=A.length>1&&b>0?(Math.max(...A)-b)*j:0;r+=F;const h={name:i.name,unit:i.unit,qty:j,price:b,sum:j*b,shopName:w,shopAddress:(l==null?void 0:l.shop_address)||(c==null?void 0:c.shop_address)||"",shopPhone:(l==null?void 0:l.shop_phone)||(c==null?void 0:c.shop_phone)||"",shopUrl:(l==null?void 0:l.shop_url)||(c==null?void 0:c.shop_url)||"",stock:g,enough:N,missing:S,offersCount:A.length,saved:F,roomName:i.room_name||"",index:p};s.has(w)||s.set(w,{name:w,address:h.shopAddress,phone:h.shopPhone,lines:[],sum:0,hasShortage:!1});const y=s.get(w);!y.address&&h.shopAddress&&(y.address=h.shopAddress),!y.phone&&h.shopPhone&&(y.phone=h.shopPhone),y.lines.push(h),y.sum+=h.sum,N||(y.hasShortage=!0)});const o=Array.from(s.values()).map(i=>({...i,lines:[...i.lines].sort((p,c)=>c.sum-p.sum)})).sort((i,p)=>i.name===R?1:p.name===R?-1:p.sum-i.sum);return{shops:o,total:o.reduce((i,p)=>i+p.sum,0),saved:r,shortageCount:n,unknownShopCount:d}}const Z=t=>String(t??"").replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\r?\n/g," "),_t=(t,e=0)=>{const s=typeof t=="string"?parseFloat(t):Number(t);return Number.isFinite(s)?s:e},L=t=>new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0}).format(_t(t))+" ₽";function $(t){const e=document.createElement("div");return e.textContent=t??"",e.innerHTML}function it(t,e,s,r){const n=rt(e,s),d=n.shops.map(l=>{const b=l.lines.map((u,g)=>{const N=u.stock===null?'<span class="muted">не указано</span>':u.enough?`<span class="ok">есть ${u.stock} ${$(u.unit)}</span>`:`<span class="warn">есть ${u.stock}, не хватает ${u.missing}</span>`;return`
            <tr>
              <td class="num">${g+1}</td>
              <td>
                ${$(u.name)}
                ${u.roomName?`<div class="sub">${$(u.roomName)}</div>`:""}
              </td>
              <td class="center">${u.qty}</td>
              <td class="center">${$(u.unit)}</td>
              <td class="center">${N}</td>
              <td class="right">${L(u.price)}</td>
              <td class="right amount">${L(u.sum)}</td>
              <td class="center check"></td>
            </tr>`}).join(""),w=[l.address?`Адрес: ${$(l.address)}`:"",l.phone?`Тел.: ${$(l.phone)}`:""].filter(Boolean).join(" · ");return`
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
                <td colspan="8">${$(l.name)}${w?` — ${w}`:""}</td>
              </tr>
              ${b}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="6" class="right">Итого по магазину</td>
                <td class="right amount">${L(l.sum)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>`}).join(""),o=[];n.shortageCount>0&&o.push(`Позиций с нехваткой на складе магазина: ${n.shortageCount} — уточните наличие перед выездом`),n.unknownShopCount>0&&o.push(`Позиций без выбранного магазина: ${n.unknownShopCount}`),n.saved>0&&o.push(`Экономия за счёт выбора магазина: ${L(n.saved)}`);const i=o.length?`<div class="notes">${o.map(l=>`<div>• ${l}</div>`).join("")}</div>`:"",p=`
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
      content: "${Z(`Список закупок · объект ${t.object_code||""}`.trim())}";
      font-family: Arial, sans-serif;
      font-size: 8.5pt;
      color: #6B4508;
    }
    @top-right {
      content: "${Z(t.client_name||r)}";
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
`,c=n.shops.length,x=`
  <div class="header">
    <div class="brand"><img class="brand-logo" src="${window.location.origin}/logo-print.png" alt="FixKey"/><b class="brand-word">Fix<span>Key</span></b></div>
    <div class="doc-title">
      <h1>Список на закупку</h1>
      <p>Объект № ${$(t.object_code)}</p>
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
      <div class="value">${$(t.object_code)}</div>
    </div>
    <div>
      <div class="label">Заказчик</div>
      <div class="value">${$(t.client_name)}</div>
    </div>
    <div>
      <div class="label">Адрес объекта</div>
      <div class="value">${$(t.address||"—")}</div>
    </div>
    <div>
      <div class="label">Магазинов в списке</div>
      <div class="value">${c}</div>
    </div>
  </div>

  ${i}

  ${d}

  <div class="summary">
    <div class="summary-box">
      ${n.shops.map(l=>`
      <div class="summary-row">
        <span>${$(l.name)}</span>
        <span>${L(l.sum)}</span>
      </div>`).join("")}
      <div class="summary-total">
        <span>ИТОГО:</span>
        <span>${L(n.total)}</span>
      </div>
    </div>
  </div>

  <hr class="thin" />

  <div class="parties">
    <div>
      <div class="label">Закупку производит</div>
      <div class="name">${$(r)}</div>
    </div>
    <div>
      <div class="label">Объект</div>
      <div class="name">${$(t.client_name)}</div>
    </div>
  </div>`,j=`Список на закупку № ${t.object_code} — ${$(t.client_name)}`;return{styles:p,bodyContent:x,title:j}}function At(t,e,s,r,n=!1){const{styles:d,bodyContent:o,title:i}=it(t,e,s,r),p=`<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8" />
<title>${i}</title>
<style>${d}</style>
</head>
<body>
<div class="est-root">${o}</div>
</body>
</html>`,c=window.open("","_blank","width=900,height=1000");c&&(c.document.open(),c.document.write(p),c.document.close(),n&&(c.onload=()=>{c.focus(),c.print()}))}async function zt(t,e,s,r){const{styles:n,bodyContent:d}=it(t,e,s,r);await et(o=>{o.id="pdf-scope-purchase",o.className="est-root",o.innerHTML=`<style>${ot(n,"#pdf-scope-purchase")}</style>${d}`},{filename:`Список на закупку ${t.object_code}.pdf`,mode:"save"})}const Ct=t=>"tel:"+t.replace(/[^\d+]/g,""),tt=t=>new Intl.NumberFormat("ru-RU",{maximumFractionDigits:2}).format(t);function Et(){const{id:t}=gt(),{user:e}=wt(),[s,r]=v.useState(null),[n,d]=v.useState([]),[o,i]=v.useState(new Set),[p,c]=v.useState(!0),[x,j]=v.useState(""),[l,b]=v.useState(!1),[w,u]=v.useState("idle"),[g,N]=v.useState(!1),S=v.useRef(null);v.useEffect(()=>{t&&(c(!0),Promise.all([V.getEstimate(Number(t)),V.list().catch(()=>null)]).then(([m,_])=>{r(m.estimate),i(new Set(m.estimate.bought||[])),d((_==null?void 0:_.materials)||[])}).catch(m=>j((m==null?void 0:m.message)||"Не удалось загрузить список")).finally(()=>c(!1)))},[t]);const A=v.useMemo(()=>(s==null?void 0:s.items)||[],[s]),F=v.useMemo(()=>rt(A,n),[A,n]),h=F.shops.flatMap(m=>m.lines),y=h.filter(m=>o.has(m.index)).reduce((m,_)=>m+_.sum,0),P=h.filter(m=>o.has(m.index)).length,U=h.length-P,dt=F.total-y,lt=h.length?Math.round(P/h.length*100):0,Y=m=>{s&&(S.current&&window.clearTimeout(S.current),u("saving"),S.current=window.setTimeout(()=>{V.setBought(s.id,Array.from(m)).then(()=>u("idle")).catch(()=>u("error"))},500))},ct=m=>{i(_=>{const z=new Set(_);return z.has(m)?z.delete(m):z.add(m),Y(z),z})},pt=(m,_)=>{i(z=>{const B=new Set(z);return m.forEach(q=>_?B.add(q):B.delete(q)),Y(B),B})},H=s?{id:s.object_id,object_code:s.object_code,client_name:s.client_name,address:s.address||""}:null,G=(e==null?void 0:e.company_name)||"",mt=async()=>{if(H){N(!0);try{await zt(H,A,n,G)}finally{N(!1)}}},K="flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-lg border border-white/10 text-sm text-white/80 hover:border-[#D4AF37]/50 hover:text-[#D4AF37] transition-colors";return a.jsx(vt,{title:"Список на закупку",subtitle:s?`Объект ${s.object_code} · ${s.client_name}`:void 0,children:p?a.jsx("div",{className:"flex justify-center py-16",children:a.jsx(C,{name:"Loader2",size:24,className:"animate-spin text-white/40"})}):x||!s?a.jsx("div",{className:"rounded-xl border border-white/10 bg-[#1f1f1f] p-8 text-center text-sm text-white/50",children:x||"Список не найден"}):a.jsxs("div",{className:"flex flex-col gap-4",children:[a.jsxs("div",{className:"sticky top-14 md:top-0 z-20 -mx-3 sm:mx-0 rounded-none sm:rounded-xl border-y sm:border border-white/10 bg-[#1f1f1f]/95 backdrop-blur p-3 sm:p-5",children:[a.jsxs("div",{className:"flex items-end justify-between gap-3",children:[a.jsxs("div",{className:"min-w-0",children:[a.jsx("p",{className:"text-xs text-white/40",children:"Осталось купить"}),a.jsx("p",{className:"text-2xl font-semibold text-[#D4AF37]",children:I(dt)}),a.jsx("p",{className:"text-xs text-white/50 mt-0.5",children:U===0?"Всё куплено":`${U} из ${h.length} позиций`})]}),a.jsxs("div",{className:"text-right shrink-0",children:[a.jsx("p",{className:"text-xs text-white/40",children:"Куплено"}),a.jsx("p",{className:"text-base font-medium text-emerald-400",children:I(y)}),a.jsx("p",{className:"text-[11px] text-white/30 mt-0.5 h-4",children:w==="saving"?"сохраняю…":w==="error"?a.jsx("span",{className:"text-red-400",children:"не сохранилось"}):"сохранено"})]})]}),a.jsx("div",{className:"mt-3 h-2 rounded-full bg-white/10 overflow-hidden",children:a.jsx("div",{className:"h-full bg-emerald-500 transition-all duration-300",style:{width:`${lt}%`}})})]}),a.jsxs("div",{className:"grid grid-cols-2 sm:flex sm:flex-wrap gap-2",children:[a.jsxs("button",{onClick:()=>b(m=>!m),className:M(K,"col-span-2 sm:col-auto",l&&"border-[#D4AF37]/50 text-[#D4AF37]"),children:[a.jsx(C,{name:l?"EyeOff":"Eye",size:16}),l?"Показать купленное":"Скрыть купленное"]}),a.jsxs("button",{onClick:()=>H&&At(H,A,n,G,!0),className:K,children:[a.jsx(C,{name:"Printer",size:16}),"Печать"]}),a.jsxs("button",{onClick:mt,className:K,disabled:g,children:[a.jsx(C,{name:g?"Loader2":"Download",size:16,className:g?"animate-spin":""}),"PDF"]})]}),F.shops.map(m=>{const _=m.lines.map(f=>f.index),z=_.every(f=>o.has(f)),B=l?m.lines.filter(f=>!o.has(f.index)):m.lines;if(l&&B.length===0)return null;const q=m.lines.filter(f=>!o.has(f.index)).reduce((f,D)=>f+D.sum,0);return a.jsxs("div",{className:"rounded-xl border border-white/10 bg-[#1f1f1f] overflow-hidden",children:[a.jsxs("div",{className:"flex items-start justify-between gap-3 p-3 sm:p-4 border-b border-white/10",children:[a.jsxs("div",{className:"min-w-0",children:[a.jsx("p",{className:M("font-medium break-words",z&&"text-white/40 line-through"),children:m.name}),m.address&&a.jsx("p",{className:"text-xs text-white/40 mt-0.5 break-words",children:m.address}),a.jsxs("p",{className:"text-xs text-white/50 mt-1",children:["осталось ",I(q)," из ",I(m.sum)]})]}),a.jsxs("div",{className:"flex items-center gap-2 shrink-0",children:[m.phone&&a.jsx("a",{href:Ct(m.phone),className:"w-11 h-11 flex items-center justify-center rounded-lg bg-[#D4AF37] text-[#161616]","aria-label":"Позвонить",children:a.jsx(C,{name:"Phone",size:18})}),a.jsx("button",{onClick:()=>pt(_,!z),className:"min-h-[44px] px-3 rounded-lg bg-white/5 active:bg-white/10 text-xs text-white/70",children:z?"Снять все":"Купил всё"})]})]}),a.jsx("ul",{children:B.map(f=>{const D=o.has(f.index);return a.jsx("li",{className:"border-b border-white/5 last:border-0",children:a.jsxs("button",{onClick:()=>ct(f.index),className:M("w-full flex items-center gap-3 p-3 sm:px-4 text-left transition-colors active:bg-white/5",D&&"bg-emerald-500/[0.06]"),children:[a.jsx("span",{className:M("w-7 h-7 shrink-0 rounded-md border-2 flex items-center justify-center transition-colors",D?"bg-emerald-500 border-emerald-500 text-[#161616]":"border-white/30"),children:D&&a.jsx(C,{name:"Check",size:18})}),a.jsxs("span",{className:"min-w-0 flex-1",children:[a.jsx("span",{className:M("block text-[15px] break-words",D&&"line-through text-white/40"),children:f.name}),a.jsxs("span",{className:"block text-xs text-white/40 mt-0.5",children:[tt(f.qty)," ",f.unit," × ",I(f.price),f.roomName?` · ${f.roomName}`:""]}),!f.enough&&!D&&a.jsxs("span",{className:"block text-xs text-amber-400 mt-0.5",children:["в магазине не хватает ",tt(f.missing)," ",f.unit]})]}),a.jsx("span",{className:M("shrink-0 text-sm font-medium",D?"text-white/30":"text-white"),children:I(f.sum)})]})},f.index)})})]},m.name)}),l&&U===0&&a.jsx("div",{className:"rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center text-sm text-emerald-300",children:"Всё по списку куплено"})]})})}const Kt=Object.freeze(Object.defineProperty({__proto__:null,default:Et},Symbol.toStringTag,{value:"Module"}));export{Kt as P,W as R,It as S,nt as a,rt as b,Lt as c,Bt as d,At as e,Ut as f,Ot as g,Rt as h,zt as i,Mt as m,Dt as p,qt as q,Tt as s,Ht as t};
