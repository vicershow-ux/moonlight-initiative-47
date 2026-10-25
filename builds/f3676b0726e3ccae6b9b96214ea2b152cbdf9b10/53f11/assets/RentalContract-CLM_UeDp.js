const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/jspdf.es.min-D81I2T4h.js","assets/index-ly_T-3-x.js","assets/index-UgCjK2U2.css","assets/browser-YE9vjGF6.js"])))=>i.map(i=>d[i]);
import{ai as ot,r as $,w as At,j as s,D as St,l as Tt,m as Dt,n as zt,I as S,U as it,O as nt,Z,W as Pt,T as Bt,Q as Lt,N as K,aw as X,E as Rt,G as Mt,$ as U,H as It,bv as Ht}from"./index-ly_T-3-x.js";import{a as ht,d as xt,C as lt}from"./Company-D1y99-Ss.js";const Ft=`
  .pdf-rt { border: 1.2px solid #6B4508; border-radius: 10px; overflow: hidden; box-sizing: border-box; }
  .pdf-rt > table { border-collapse: collapse; width: 100%; margin: 0; }
  .pdf-rt > table tr > *:first-child { border-left: none !important; }
  .pdf-rt > table tr > *:last-child { border-right: none !important; }
  .pdf-rt > table > thead > tr:first-child > *,
  .pdf-rt > table > tbody:first-child > tr:first-child > * { border-top: none !important; }
  .pdf-rt > table > *:last-child > tr:last-child > * { border-bottom: none !important; }
`;function Ot(t){t.querySelectorAll("table.works-table, table.items, table.pdf-round").forEach(e=>{const a=e.parentElement;if(a&&(a.classList.contains("pdf-rt")||a.classList.contains("cat-block")))return;const n=document.createElement("div");n.className="pdf-rt";const r=e.style.marginTop;r&&(n.style.marginTop=r,e.style.marginTop="0"),e.before(n),n.appendChild(e)})}const I=760,R={top:12,right:12,bottom:14,left:12},st={w:210,h:297},tt=I/(st.w-R.left-R.right),L=Math.floor((st.h-R.top-R.bottom)*tt),qt=["sign-row","room-total","summary","info-grid","parties","doc-brand-header","header","notes"],G=t=>(t.ownerDocument.defaultView||window).getComputedStyle(t);function Ut(t){if(!t||t.nodeType!==1||!("style"in t))return!1;if(/^H[1-6]$/.test(t.tagName)||t.classList.contains("room-title"))return!0;if(!/^(P|DIV)$/.test(t.tagName))return!1;const e=(t.textContent||"").trim();return!e||e.length>90||t.querySelector("table, img, div")?!1:Number(G(t).fontWeight)>=600}function Wt(t){return qt.some(n=>t.classList.contains(n))||G(t).display!=="block"||!t.children.length||Array.from(t.childNodes).some(n=>n.nodeType===3&&(n.textContent||"").trim())?!1:Array.from(t.children).some(n=>{const r=G(n).display;return r==="block"||r==="table"||r==="flex"||r==="grid"})}function bt(t,e){for(const a of Array.from(t.children))if(!(a.tagName==="STYLE"||a.tagName==="SCRIPT")&&G(a).display!=="none")if(a.tagName==="TABLE"){const n=a,r=!n.tHead&&et(n).length>1&&!!n.querySelector(":scope > tbody > tr > td table, :scope > tbody > tr > td div");n.tHead||r?(Array.from(n.tBodies).forEach(l=>Array.from(l.rows).forEach(o=>e.push({el:o,row:!0}))),n.tFoot&&Array.from(n.tFoot.rows).forEach(l=>e.push({el:l,row:!0}))):e.push({el:n,row:!1})}else Wt(a)?bt(a,e):e.push({el:a,row:!1})}function et(t){const e=[];return Array.from(t.tBodies).forEach(a=>e.push(...Array.from(a.rows))),t.tFoot&&e.push(...Array.from(t.tFoot.rows)),e}const W=t=>t.classList.contains("cat-row")||t.cells.length===1&&t.cells[0].colSpan>1;function dt(t,e){const a=t.parentElement;return a&&a!==e&&a.children.length===1?a:t}function J(t){const e=t.cloneNode(!0),a=e.querySelector("td, th")||e,n=t.ownerDocument.createTreeWalker(a,4);let r=null;for(;n.nextNode();){const l=n.currentNode;(l.textContent||"").trim()&&(r=l)}return r&&(r.textContent=`${(r.textContent||"").trimEnd()} (продолжение)`),e}function oe(t,e){gt(t,e),t.querySelectorAll(".pg-spacer").forEach(a=>{a.style.height="0",a.style.breakBefore="page",a.style.pageBreakBefore="always"})}function gt(t,e=L){const a=e,n=t.ownerDocument,r=()=>t.getBoundingClientRect().top,l=p=>{const u=p.getBoundingClientRect(),i=r();return{top:u.top-i,bottom:u.bottom-i}},o=(p,u)=>{const i=n.createElement("div");i.className="pg-spacer",i.style.cssText="display:block;height:0;margin:0;padding:0;border:0",p.before(i),i.style.height=`${Math.max(0,u-l(i).top)}px`,p.style.marginTop="0"},h=(p,u)=>{const i=p.previousElementSibling;return Ut(i)&&l(i).top>u+20?i:p},f=(p,u)=>{const i=p.closest("table"),_=dt(i,t),c=i.cloneNode(!1);i.tHead&&c.appendChild(i.tHead.cloneNode(!0));const g=p.parentElement;let x=null;if(!W(p))for(const v of et(i)){if(v===p)break;W(v)&&(x=v)}if(g.tagName==="TFOOT"){if(x){const v=n.createElement("tbody");v.appendChild(J(x)),c.appendChild(v)}c.appendChild(g)}else{const v=g.cloneNode(!1);x&&v.appendChild(J(x));let P=p;for(;P;){const T=P.nextElementSibling;v.appendChild(P),P=T}c.appendChild(v);let M=g.nextElementSibling;for(;M;){const T=M.nextElementSibling;c.appendChild(M),M=T}}let b=c;_!==i&&(b=_.cloneNode(!1),b.appendChild(c)),_.after(b);const k=_.closest(".room-block"),z=k==null?void 0:k.querySelector(":scope > .room-title");let w=b;if(z){const v=J(z);b.before(v),w=v}o(w,u)},j=[];bt(t,j);let m=0;for(const p of j){if(p.el.classList.contains("pg-break")){const u=l(p.el).top;p.el.style.breakBefore="auto",p.el.style.pageBreakBefore="auto",u>m+2&&(p.el.classList.add("pg-spacer"),p.el.style.height=`${Math.max(0,m+a-u)}px`,m+=a);continue}for(let u=0;u<60;u++){const i=l(p.el),_=m+a;if(i.bottom<=_+.5)break;if(i.top>=_){m=_;continue}if(i.top<=m+2||i.bottom-i.top>a){m=_;continue}if(p.row){const c=p.el,g=c.closest("table"),x=et(g);let b=x.indexOf(c);b===x.length-1&&b>=2&&(b-=1),b>0&&W(x[b-1])&&(b-=1),x.slice(0,b).every(W)?o(h(dt(g,t),m),_):f(x[b],_)}else o(h(p.el,m),_);m=_}}}async function Vt(t){await Promise.all(Array.from(t.querySelectorAll("img")).map(e=>new Promise(a=>{if(e.complete)return a();e.addEventListener("load",()=>a(),{once:!0}),e.addEventListener("error",()=>a(),{once:!0}),setTimeout(a,4e3)})))}async function _t(t,e){var r;const a=document.createElement("div");a.style.cssText="position:fixed;left:-100000px;top:0;width:"+I+"px;background:#fff;z-index:-1";const n=document.createElement("div");n.style.cssText=`width:${I}px;max-width:${I}px;margin:0;padding:0 0 32px;background:#fff;box-sizing:border-box;overflow:visible`,a.appendChild(n),document.body.appendChild(a);try{t(n),Ot(n);const l=document.createElement("style");l.textContent=Ft,n.prepend(l),await Vt(n),(r=document.fonts)!=null&&r.ready&&await document.fonts.ready,gt(n);const o=e.mode==="save"?2:1.5,h=(await ot(async()=>{const{default:c}=await import("./html2canvas.esm-DZlvpFNH.js").then(g=>g.h);return{default:c}},[])).default,f=await h(n,{scale:o,useCORS:!0,backgroundColor:"#ffffff",width:I,windowWidth:I,scrollX:0,scrollY:0,logging:!1}),{jsPDF:j}=await ot(async()=>{const{jsPDF:c}=await import("./jspdf.es.min-D81I2T4h.js").then(g=>g.j);return{jsPDF:c}},__vite__mapDeps([0,1,2,3])),m=new j({unit:"mm",format:"a4",orientation:"portrait",compress:!0}),p=f.height/o,u=Math.max(1,Math.ceil((p-32-2)/L)),i=Math.round(9*tt),_=e.mode==="save"?.95:.8;for(let c=0;c<u;c++){const g=Math.min(L,p-c*L),x=document.createElement("canvas");x.width=I*o,x.height=(L+i)*o;const b=x.getContext("2d");b.fillStyle="#ffffff",b.fillRect(0,0,x.width,x.height),b.drawImage(f,0,c*L*o,x.width,g*o,0,0,x.width,g*o),u>1&&(b.fillStyle="#666666",b.font=`${11*o}px Arial, sans-serif`,b.textAlign="right",b.fillText(`Стр. ${c+1} из ${u}`,x.width,(L+i*.75)*o)),c>0&&m.addPage();const k=st.w-R.left-R.right;m.addImage(x.toDataURL("image/jpeg",_),"JPEG",R.left,R.top,k,(L+i)/tt)}if(e.mode==="save"){m.save(e.filename);return}return m.output("datauristring")}finally{a.parentNode&&document.body.removeChild(a)}}async function Gt(t,e){await wt(t,e,"save")}async function ie(t,e){return await wt(t,e,"base64")||""}async function wt(t,e,a){const n=/^(Акт|Счёт|ДС) /.test(e),r=e.startsWith("ДС "),l=e.startsWith("Акт")||r?e:`Договор № ${e}`;return _t(o=>{o.style.color="#161616",o.style.fontFamily="Arial, sans-serif",o.style.fontSize="13px",o.style.lineHeight="1.5",o.innerHTML=`<style>
    .pdf-doc p { margin: 0 0 12px; }
    .pdf-doc h3 { margin: 20px 0 8px; }
    .pdf-doc h2 { margin: 24px 0 10px; }
    ${ht}
  </style>${xt(e.startsWith("Акт")||r?l:"")}<div class="pdf-doc">${t}</div>`},{filename:n?`${e}.pdf`:`Договор №${e}.pdf`,mode:a})}const ct=t=>String(t??"").replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\r?\n/g," "),F=(t,e=0)=>{const a=typeof t=="string"?parseFloat(t):Number(t);return Number.isFinite(a)?a:e},V=t=>new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0}).format(F(t))+" ₽";function E(t){const e=document.createElement("div");return e.textContent=t??"",e.innerHTML}function Yt(t,e){const a=new Map;return t.forEach(n=>{const r=e.find(h=>h.id===n.material_id),l=n.shop_name||(r==null?void 0:r.shop_name)||"Магазин не указан";a.has(l)||a.set(l,{name:l,address:"",phone:"",items:[],sum:0});const o=a.get(l);!o.address&&(r!=null&&r.shop_address)&&(o.address=r.shop_address),!o.phone&&(r!=null&&r.shop_phone)&&(o.phone=r.shop_phone),o.items.push(n),o.sum+=F(n.qty)*F(n.price)}),Array.from(a.values()).sort((n,r)=>r.sum-n.sum)}function yt(t,e,a,n,r="Смета на материал"){const l=Yt(e,a),o=l.reduce((i,_)=>i+_.sum,0),h=Array.from(new Set(e.map(i=>i.room_name).filter(Boolean))),f=h.length?h.join(", "):"Без помещения",j=l.map(i=>{const _=i.items.map((g,x)=>`
            <tr>
              <td class="num">${x+1}</td>
              <td>${E(g.name)}</td>
              <td>${E(g.room_name||"—")}</td>
              <td class="center">${F(g.qty)}</td>
              <td class="center">${E(g.unit)}</td>
              <td class="right">${V(g.price)}</td>
              <td class="right amount">${V(F(g.qty)*F(g.price))}</td>
            </tr>`).join(""),c=i.address?`Адрес: ${E(i.address)}`:"";return`
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
              <tr class="cat-row"><td colspan="7">${E(i.name)}${c?` — ${c}`:""}</td></tr>
              ${_}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="6" class="right">Итого по магазину</td>
                <td class="right amount">${V(i.sum)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>`}).join(""),m=`
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
      content: "${ct(`Материалы · объект ${t.object_code||""}`.trim())}";
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 8.5pt;
      color: #6B4508;
    }
    @top-right {
      content: "${ct(t.client_name||n)}";
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
`,p=`
  <div class="header">
    <div class="brand"><img class="brand-logo" src="${window.location.origin}/logo-print.png" alt="FixKey"/><b class="brand-word">Fix<span>Key</span></b></div>
    <div class="doc-title">
      <h1>${E(r)}</h1>
      <p>Объект № ${E(t.object_code)}</p>
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
      <div class="value">${E(t.object_code)}</div>
    </div>
    <div>
      <div class="label">Заказчик</div>
      <div class="value">${E(t.client_name)}</div>
    </div>
    <div>
      <div class="label">Адрес объекта</div>
      <div class="value">${E(t.address||"—")}</div>
    </div>
    <div>
      <div class="label">Помещение</div>
      <div class="value">${E(f)}</div>
    </div>
  </div>

  ${j}

  <div class="summary">
    <div class="summary-box">
      <div class="summary-row">
        <span>Помещение:</span>
        <span>${E(f)}</span>
      </div>
      <div class="summary-total">
        <span>ИТОГО:</span>
        <span>${V(o)}</span>
      </div>
    </div>
  </div>

  <hr class="thin" />

  <div class="parties">
    <div>
      <div class="label">Исполнитель</div>
      <div class="name">${E(n)}</div>
    </div>
    <div>
      <div class="label">Заказчик</div>
      <div class="name">${E(t.client_name)}</div>
    </div>
  </div>`,u=`${E(r)} № ${t.object_code} — ${E(t.client_name)}`;return{styles:m,bodyContent:p,title:u}}function le(t,e,a,n,r=!1,l){const{styles:o,bodyContent:h,title:f}=yt(t,e,a,n,l),j=`<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8" />
<title>${f}</title>
<style>${o}</style>
</head>
<body>
<div class="est-root">${h}</div>
</body>
</html>`,m=window.open("","_blank","width=900,height=1000");m&&(m.document.open(),m.document.write(j),m.document.close(),r&&(m.onload=()=>{m.focus(),m.print()}))}function pt(t,e){let a=t;for(;;){const n=e.exec(a);if(!n)return a;const r=a.indexOf("{",n.index);if(r===-1)return a;let l=0,o=-1;for(let h=r;h<a.length;h++)if(a[h]==="{")l++;else if(a[h]==="}"&&(l--,l===0)){o=h;break}if(o===-1)return a;a=a.slice(0,n.index)+a.slice(o+1),e.lastIndex=0}}function Kt(t,e){return pt(pt(t,/@page\b/g),/@media\s+print\b/g).replace(/(^|\})\s*([^{}@]+)\s*\{/g,(n,r,l)=>{const o=l.split(",").map(h=>{const f=h.trim();return f?f==="*"?`${e}, ${e} *`:/^(html|body)$/i.test(f)||f===".est-root"?e:f.startsWith(".est-root ")?`${e} ${f.slice(10)}`:`${e} ${f}`:""}).filter(Boolean).join(", ");return`${r} ${o} {`})}const Xt=`
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
`;function Jt(t,e,a,n,r){const{styles:l,bodyContent:o}=yt(t,e,a,n,r);return`<style>${Kt(l+Xt,"#pdf-scope-materials")}</style>${o}`}async function de(t,e,a,n,r){await vt(t,e,a,n,"save",r)}async function ce(t,e,a,n,r){return await vt(t,e,a,n,"base64",r)||""}async function vt(t,e,a,n,r,l="Смета на материал"){return _t(o=>{o.id="pdf-scope-materials",o.className="est-root",o.innerHTML=Jt(t,e,a,n,l)},{filename:`${l} ${t.object_code}.pdf`,mode:r})}function pe({open:t,onOpenChange:e,docName:a,objectId:n,fileName:r,makePdf:l,send:o,extraFiles:h=[]}){const[f,j]=$.useState(""),[m,p]=$.useState(""),[u,i]=$.useState(!1),[_,c]=$.useState(""),[g,x]=$.useState(!1),[b,k]=$.useState([]);$.useEffect(()=>{t&&(c(""),x(!1),k([]),n&&At.get(n).then(w=>j(v=>v||(w==null?void 0:w.email)||"")).catch(()=>null))},[t,n]);const z=async()=>{if(c(""),!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.trim())){c("Укажите корректный email заказчика");return}i(!0);try{const w=await l();if(!w)throw new Error("Не удалось сформировать PDF");if(w.length>33e5)throw new Error("Документ слишком большой для письма. Скачайте PDF и отправьте его вручную.");const v=await o({email:f.trim(),pdf_base64:w,message:m.trim()});k((v==null?void 0:v.skipped)||[]),x(!0)}catch(w){c(w instanceof Error?w.message:"Не удалось отправить письмо")}finally{i(!1)}};return s.jsx(St,{open:t,onOpenChange:e,children:s.jsxs(Tt,{className:"border-white/10 bg-[#1f1f1f] text-white sm:max-w-md",children:[s.jsx(Dt,{children:s.jsxs(zt,{className:"pr-6 break-words",children:["Отправить ",a," заказчику"]})}),g?s.jsxs("div",{className:"flex flex-col items-center gap-3 py-6 text-center",children:[s.jsx("div",{className:"flex h-12 w-12 items-center justify-center rounded-full bg-green-500/15 text-green-400",children:s.jsx(S,{name:"Check",size:24})}),s.jsx("p",{className:"font-medium",children:"Отправлено"}),s.jsxs("p",{className:"text-sm text-white/50",children:[h.length?"PDF и вложения ушли":"PDF ушёл"," на ",f]}),b.length>0&&s.jsxs("p",{className:"text-xs text-amber-400",children:["Не удалось приложить: ",b.join(", ")]}),s.jsx("button",{onClick:()=>e(!1),className:"mt-2 w-full sm:w-auto min-h-[44px] sm:min-h-0 rounded-lg bg-white/10 px-4 py-2 text-sm transition-colors hover:bg-white/15",children:"Закрыть"})]}):s.jsxs("div",{className:"flex flex-col gap-4",children:[s.jsxs("div",{className:"flex flex-col gap-1.5",children:[s.jsx("label",{className:"text-xs text-white/50",children:"Email заказчика"}),s.jsx("input",{type:"email",value:f,onChange:w=>j(w.target.value),placeholder:"client@mail.ru",className:"rounded-lg border border-white/15 bg-[#161616] px-3 py-2.5 text-base sm:text-sm outline-none focus:border-[#D4AF37]/50"})]}),s.jsxs("div",{className:"flex flex-col gap-1.5",children:[s.jsx("label",{className:"text-xs text-white/50",children:"Сообщение (необязательно)"}),s.jsx("textarea",{value:m,onChange:w=>p(w.target.value),rows:3,placeholder:"Например: подпишите, пожалуйста, и пришлите скан в ответ",className:"resize-none rounded-lg border border-white/15 bg-[#161616] px-3 py-2.5 text-base sm:text-sm outline-none focus:border-[#D4AF37]/50"})]}),s.jsxs("p",{className:"flex items-start gap-1.5 text-xs text-white/40 break-all",children:[s.jsx(S,{name:"Paperclip",size:13,className:"shrink-0 mt-0.5"}),"Вложения: ",[r,...h].join(", ")]}),_&&s.jsxs("p",{className:"flex items-center gap-1.5 text-sm text-red-400",children:[s.jsx(S,{name:"CircleAlert",size:15}),_]}),s.jsxs("button",{onClick:z,disabled:u,className:"flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-[#D4AF37] px-4 py-2.5 text-sm font-medium text-[#161616] transition-colors hover:bg-[#B8860B] disabled:opacity-60",children:[u?s.jsx(S,{name:"Loader2",size:15,className:"animate-spin"}):s.jsx(S,{name:"Send",size:15}),u?"Отправляю…":"Отправить"]})]})]})})}const at="ремонт квартиры";function $t(t){const e=(t||"").trim();return!e||e===at?at:{Отопление:"монтаж отопления",Благоустройство:"благоустройство территории","Вентиляция и кондиционирование":"монтаж вентиляции и кондиционирования",Вентиляция:"монтаж вентиляции",Кондиционирование:"монтаж систем кондиционирования","Умный дом":"монтаж и настройка системы «Умный дом»","Слаботочные работы":"монтаж слаботочных сетей","Устройство полов":"устройство полов"}[e]||e.charAt(0).toLowerCase()+e.slice(1)}const me=t=>`Договор подряда на ${$t(t)}`;function ue(t){const e=(t||"").trim();return!e||e===at?{works:"ремонтно-отделочные работы",place:"в квартире"}:{works:`работы по направлению «${e}»`,place:"на объекте"}}function fe(t){const e=/Договор подряда на ([^<№]+?)\s*№/.exec(t||"");return e?`Договор подряда на ${e[1].trim()}`:null}const Qt={"Электромонтажные работы":"Правилам устройства электроустановок (ПУЭ, 7-е изд.), СП 76.13330.2016 «Электротехнические устройства», СП 256.1325800.2016 «Электроустановки жилых и общественных зданий» и ГОСТ Р 50571 (МЭК 60364)","Сантехнические работы":"СП 30.13330.2020 «Внутренний водопровод и канализация зданий» и СП 73.13330.2016 «Внутренние санитарно-технические системы зданий»",Отопление:"СП 60.13330.2020 «Отопление, вентиляция и кондиционирование воздуха» и СП 73.13330.2016 «Внутренние санитарно-технические системы зданий»","Вентиляция и кондиционирование":"СП 60.13330.2020 «Отопление, вентиляция и кондиционирование воздуха» и СП 73.13330.2016 «Внутренние санитарно-технические системы зданий»",Вентиляция:"СП 60.13330.2020 «Отопление, вентиляция и кондиционирование воздуха» и СП 73.13330.2016 «Внутренние санитарно-технические системы зданий»",Кондиционирование:"СП 60.13330.2020 «Отопление, вентиляция и кондиционирование воздуха» и СП 73.13330.2016 «Внутренние санитарно-технические системы зданий»","Плиточные работы":"СП 71.13330.2017 «Изоляционные и отделочные покрытия»","Черновые отделочные работы":"СП 71.13330.2017 «Изоляционные и отделочные покрытия»","Чистовые отделочные работы":"СП 71.13330.2017 «Изоляционные и отделочные покрытия»","Подготовительные работы":"СП 71.13330.2017 «Изоляционные и отделочные покрытия» и СП 48.13330.2019 «Организация строительства»","Потолочные работы":"СП 71.13330.2017 «Изоляционные и отделочные покрытия» и СП 163.1325800.2014 «Конструкции с применением гипсокартонных и гипсоволокнистых листов»","Гипсокартонные работы":"СП 163.1325800.2014 «Конструкции с применением гипсокартонных и гипсоволокнистых листов» и СП 71.13330.2017 «Изоляционные и отделочные покрытия»","Устройство полов":"СП 29.13330.2011 «Полы» и СП 71.13330.2017 «Изоляционные и отделочные покрытия»","Бетонные работы":"СП 70.13330.2012 «Несущие и ограждающие конструкции» и СП 63.13330.2018 «Бетонные и железобетонные конструкции»","Кладочные работы":"СП 70.13330.2012 «Несущие и ограждающие конструкции» и СП 15.13330.2020 «Каменные и армокаменные конструкции»","Кровельные работы":"СП 17.13330.2017 «Кровли» и СП 71.13330.2017 «Изоляционные и отделочные покрытия»","Изоляционные работы":"СП 71.13330.2017 «Изоляционные и отделочные покрытия» и СП 50.13330.2012 «Тепловая защита зданий»","Фасадные работы":"СП 293.1325800.2017 «Системы фасадные теплоизоляционные композиционные с наружными штукатурными слоями» и СП 71.13330.2017 «Изоляционные и отделочные покрытия»","Земляные работы":"СП 45.13330.2017 «Земляные сооружения, основания и фундаменты»",Благоустройство:"СП 82.13330.2016 «Благоустройство территорий»","Демонтажные работы":"СП 325.1325800.2017 «Здания и сооружения. Правила производства работ при демонтаже и утилизации» и СП 48.13330.2019 «Организация строительства»","Столярные работы":"СП 71.13330.2017 «Изоляционные и отделочные покрытия», ГОСТ 475-2016 «Блоки дверные деревянные и комбинированные» и ГОСТ 30971-2012 (монтажные швы оконных и дверных блоков)","Монтажные работы":"СП 70.13330.2012 «Несущие и ограждающие конструкции» и СП 48.13330.2019 «Организация строительства»"};function he(t){const e=(t||"").trim(),a=Qt[e];return a?`Качество работ должно соответствовать ${a}, а также иным действующим сводам правил (СП), государственным стандартам (ГОСТ) и техническим регламентам, применимым к данному виду работ. При отсутствии конкретных требований качество определяется общепринятой практикой выполнения таких работ.`:"Качество работ должно соответствовать действующим строительным нормам и правилам (СНиП), сводам правил (СП), государственным стандартам (ГОСТ) и техническим регламентам. При отсутствии конкретных требований качество определяется общепринятой практикой выполнения строительных и отделочных работ."}const mt={advance_4_stages:[["Аванс",25],["Этап 1",25],["Этап 2",25],["Сдача объекта",25]],advance_3_stages:[["Аванс",30],["Этап 1",40],["Сдача объекта",30]],advance_2_stages:[["Аванс",50],["Сдача объекта",50]]};function xe(t){const e=t.options||{},a=e.cost_type==="fixed"&&e.fixed_amount?Number(e.fixed_amount)||0:Number(t.total_amount)||0,n=[{key:"full",label:"Полная стоимость работ",amount:a}];return e.payment_order!=="advance_staged"?n:e.payment_schedule==="custom_schedule"?((e.custom_stages||[]).forEach((l,o)=>n.push({key:`s${o}`,label:l.label||`Этап ${o+1}`,amount:Number(l.amount)||0})),n):((mt[e.payment_schedule||"advance_4_stages"]||mt.advance_4_stages).forEach(([l,o],h)=>{var j;const f=(j=e.schedule_amounts)==null?void 0:j[h];n.push({key:`s${h}`,label:`${l} (${o}%)`,amount:f?Number(f)||0:Math.round(a*o/100)})}),n)}function be(t,e){var r;const a=$t((r=t.options)==null?void 0:r.work_subject);return{name:e.key==="full"?`Работы: ${a} по Договору подряда № ${t.contract_number}`:`${a.charAt(0).toUpperCase()+a.slice(1)} — ${e.label.replace(/\s*\(\d+%\)/,"").toLowerCase()} по Договору подряда № ${t.contract_number}`,unit:"усл.",quantity:1,price:e.amount,amount:e.amount}}function ge(t){const e=(t.items||[]).map(n=>{const r=Number(n.quantity)||0,l=Number(n.price)||0;return{name:n.name,unit:n.unit||"шт.",quantity:r,price:l,amount:r*l}});if(e.length)return e;const a=Number(t.total_amount)||0;return[{name:`Работы по Акту № ${t.act_number}`,unit:"усл.",quantity:1,price:a,amount:a}]}const B="w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50";function Zt({options:t,onChange:e}){return s.jsxs("div",{className:"rounded-xl border border-white/10 bg-[#1f1f1f] p-4",children:[s.jsx("div",{className:"mb-3 text-xs uppercase text-white/40",children:"Реквизиты договора"}),s.jsxs("div",{className:"space-y-3",children:[s.jsxs("div",{children:[s.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Номер"}),s.jsx("input",{className:B,value:t.contract_number||"",onChange:a=>e({contract_number:a.target.value})})]}),s.jsxs("div",{children:[s.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Дата"}),s.jsx("input",{className:B,type:"date",value:t.contract_date||"",onChange:a=>e({contract_date:a.target.value})})]}),s.jsxs("div",{children:[s.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Город"}),s.jsx("input",{className:B,value:t.city||"",onChange:a=>e({city:a.target.value}),placeholder:"Хабаровск"})]}),s.jsxs("div",{children:[s.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Цель использования"}),s.jsx("input",{className:B,value:t.purpose||"",onChange:a=>e({purpose:a.target.value}),placeholder:"ремонтные работы на объекте"})]}),s.jsxs("div",{children:[s.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Передача имущества"}),s.jsxs("select",{className:B,value:t.delivery||"self_pickup",onChange:a=>e({delivery:a.target.value}),children:[s.jsx("option",{value:"self_pickup",children:"Забирает арендатор"}),s.jsx("option",{value:"by_lessor",children:"Доставляет арендодатель"})]})]}),s.jsxs("div",{className:"grid grid-cols-2 gap-3",children:[s.jsxs("div",{children:[s.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Пени, %"}),s.jsx("input",{className:B,value:t.penalty_pct||"",onChange:a=>e({penalty_pct:a.target.value})})]}),s.jsxs("div",{children:[s.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Претензия, дн."}),s.jsx("input",{className:B,value:t.claim_days||"",onChange:a=>e({claim_days:a.target.value})})]})]}),s.jsxs("div",{children:[s.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Дополнительные условия"}),s.jsx("textarea",{className:`${B} min-h-[80px] resize-y`,value:t.extra_terms||"",onChange:a=>e({extra_terms:a.target.value}),placeholder:"Отдельным пунктом в конце договора"})]})]})]})}function te({rental:t,edited:e,onRegenerate:a}){return s.jsxs("div",{className:"rounded-xl border border-white/10 bg-[#1f1f1f] p-4 text-sm",children:[s.jsx("div",{className:"mb-3 text-xs uppercase text-white/40",children:"Условия аренды"}),s.jsxs("div",{className:"space-y-2 text-white/70",children:[s.jsxs("div",{className:"flex justify-between gap-3",children:[s.jsx("span",{className:"text-white/40",children:"Инструмент"}),s.jsx("span",{className:"min-w-0 break-words text-right",children:t.item_name})]}),s.jsxs("div",{className:"flex justify-between gap-3",children:[s.jsx("span",{className:"text-white/40",children:"Количество"}),s.jsxs("span",{children:[Number(t.qty)," ",t.unit]})]}),s.jsxs("div",{className:"flex justify-between gap-3",children:[s.jsx("span",{className:"text-white/40",children:"Сумма аренды"}),s.jsx("span",{className:"text-[#D4AF37]",children:it(nt(t))})]}),Number(t.deposit)>0&&s.jsxs("div",{className:"flex justify-between gap-3",children:[s.jsx("span",{className:"text-white/40",children:"Залог"}),s.jsx("span",{children:it(Number(t.deposit))})]})]}),s.jsxs("button",{onClick:a,className:`${Z} mt-4 w-full`,children:[s.jsx(S,{name:"RefreshCw",size:15}),"Пересобрать текст"]}),e&&s.jsx("div",{className:"mt-2 text-xs text-amber-400",children:"Текст правился вручную — пересборка сотрёт правки"})]})}function ee({editorRef:t,html:e,saving:a,downloading:n,hasExisting:r,onEdit:l,onSave:o,onPrint:h,onDownload:f}){return s.jsxs("div",{className:"space-y-4 min-w-0",children:[s.jsxs("div",{className:"grid grid-cols-2 gap-2 sm:flex sm:flex-wrap",children:[s.jsxs("button",{className:`${Pt} col-span-2 sm:col-auto`,onClick:o,disabled:a,children:[a?s.jsx(S,{name:"Loader2",size:16,className:"animate-spin"}):s.jsx(S,{name:"Check",size:16}),r?"Сохранить изменения":"Сохранить договор"]}),s.jsxs("button",{className:Z,onClick:h,children:[s.jsx(S,{name:"Printer",size:16}),"Печать"]}),s.jsxs("button",{className:Z,onClick:f,disabled:n,children:[s.jsx(S,{name:n?"Loader2":"Download",size:16,className:n?"animate-spin":""}),"Скачать PDF"]})]}),s.jsx("div",{className:"overflow-x-auto rounded-xl border border-white/10 bg-white p-3 sm:p-5 md:p-8",children:s.jsx("div",{ref:t,contentEditable:!0,suppressContentEditableWarning:!0,onInput:l,className:"contract-doc min-h-[500px] break-words text-[#161616] outline-none",dangerouslySetInnerHTML:{__html:e}})}),s.jsx("div",{className:"text-xs text-white/40",children:"Текст договора можно править прямо здесь — щёлкните в нужное место и печатайте"})]})}const y=t=>t==null?"":String(t),d=(t,e)=>{const a=y(e).trim();return a?`<p>${t}: ${a}</p>`:""},O=t=>{if(!t)return"____________";const e=new Date(t);return isNaN(e.getTime())?y(t):e.toLocaleDateString("ru-RU",{day:"numeric",month:"long",year:"numeric"})},Q=t=>new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0}).format(Math.round(t||0));function ut(t){if(!t)return"<p>____________</p>";if(t.party_kind==="legal")return[d("",t.org_name||t.display_name),d("ИНН",t.inn),d("КПП",t.kpp),d("ОГРН",t.ogrn),d("Юр. адрес",t.legal_address),d("Банк",t.bank_name),d("БИК",t.bik),d("Р/с",t.account_number),d("К/с",t.correspondent_account),d("Тел.",t.phone),d("Email",t.email)].join("");if(t.party_kind==="entrepreneur")return[d("",`ИП ${t.org_name||t.full_name||t.display_name}`),d("ИНН",t.inn),d("ОГРНИП",t.ogrn),d("Адрес",t.legal_address||t.registration_address),d("Банк",t.bank_name),d("БИК",t.bik),d("Р/с",t.account_number),d("Тел.",t.phone),d("Email",t.email)].join("");const e=[t.passport_series,t.passport_number].filter(Boolean).join(" ");return[d("",t.full_name||t.display_name),d("Паспорт",e),d("Выдан",t.passport_issued_by),t.passport_issued_date?d("Дата выдачи",O(t.passport_issued_date)):"",d("Код подразделения",t.passport_department_code),t.birth_date?d("Дата рождения",O(t.birth_date)):"",d("Адрес регистрации",t.registration_address),d("Тел.",t.phone),d("Email",t.email)].join("")}function ft(t){if(!t)return"____________ (далее — «Арендатор»)";if(t.party_kind==="legal"){const n=t.org_name||t.display_name,r=t.director_position||"генеральный директор",l=t.director_name||"",o=t.acts_basis||"Устава";return`${y(n)}, именуемое в дальнейшем «Арендатор», от имени которого действует ${y(r)} ${y(l)} на основании ${y(o)}`}if(t.party_kind==="entrepreneur"){const n=t.full_name||t.org_name||t.display_name;return`Индивидуальный предприниматель ${y(n)}, ОГРНИП ${y(t.ogrn)||"____________"}, именуемый в дальнейшем «Арендатор»`}const e=t.full_name||t.display_name,a=[t.passport_series,t.passport_number].filter(Boolean).join(" ");return`${y(e)}, паспорт ${y(a)||"____________"}, выдан ${y(t.passport_issued_by)||"____________"}, зарегистрированный по адресу: ${y(t.registration_address)||"____________"}, именуемый в дальнейшем «Арендатор»`}function ae(t){const{rental:e,counterparty:a,company:n,options:r}=t,l=e.direction==="out",o=(n==null?void 0:n.name)||(n==null?void 0:n.contact_full_name)||"____________",h=Bt[e.rate_period]||"сутки",f=Lt(e),j=nt(e),m=K(e.rate),p=K(e.qty),u=K(e.deposit),i=l?`${y(o)}, именуемое в дальнейшем «Арендодатель», с одной стороны, и ${ft(a)}, с другой стороны,`:`${ft(a).replace(/«Арендатор»/g,"«Арендодатель»")}, с одной стороны, и ${y(o)}, именуемое в дальнейшем «Арендатор», с другой стороны,`,_=r.penalty_pct||"0,5",c=r.claim_days||"10",g=r.copies_total||"двух",x=r.delivery==="by_lessor"?"Передача и возврат Имущества осуществляются силами и за счёт Арендодателя по адресу, согласованному Сторонами.":"Получение и возврат Имущества осуществляются Арендатором самостоятельно по адресу Арендодателя.",b=u?`<p>3.4. В обеспечение исполнения обязательств Арендатор вносит обеспечительный платёж (залог) в размере ${Q(u)} рублей (${X(u)}). Залог возвращается Арендатору в течение 3 (трёх) рабочих дней с момента возврата Имущества в исправном состоянии, за вычетом сумм задолженности и стоимости устранения повреждений при их наличии.</p>`:"",k=e.condition_note?`<p>2.3. Состояние Имущества на момент передачи: ${y(e.condition_note)}.</p>`:"",z=r.extra_terms?`<h3>10. Дополнительные условия</h3><p>${y(r.extra_terms).replace(/\n/g,"</p><p>")}</p>`:"",w=e.date_to?`по ${O(e.date_to)} включительно`:"до момента возврата Имущества Арендодателю";return`
<div class="contract-doc">
<h2 style="text-align:center">Договор аренды оборудования № ${y(r.contract_number)||y(e.rental_number)}</h2>
<p style="text-align:right">г. ${y(r.city)||"________"}, ${O(r.contract_date)}</p>

<p>${i} вместе именуемые «Стороны», заключили настоящий договор (далее — «Договор») о нижеследующем:</p>

<h3>1. Предмет договора</h3>
<p>1.1. Арендодатель обязуется предоставить Арендатору во временное владение и пользование за плату следующее имущество (далее — «Имущество»):</p>
<p>1.1.1. ${y(e.item_name)} — ${p} ${y(e.unit)}.</p>
<p>1.2. Имущество передаётся для использования по прямому назначению${r.purpose?`: ${y(r.purpose)}`:""}.</p>
<p>1.3. Имущество принадлежит Арендодателю на праве собственности, не заложено, не арестовано и не является предметом требований третьих лиц.</p>

<h3>2. Передача имущества</h3>
<p>2.1. Имущество передаётся Арендатору ${O(e.date_from)} и подлежит возврату ${w}.</p>
<p>2.2. ${x}</p>
${k}
<p>2.4. Передача и возврат Имущества оформляются актом приёма-передачи, подписываемым обеими Сторонами. Подписание Сторонами настоящего Договора подтверждает факт передачи Имущества в исправном состоянии.</p>

<h3>3. Арендная плата и порядок расчётов</h3>
<p>3.1. Арендная плата составляет ${Q(m)} рублей (${X(m)}) за ${h} за единицу Имущества.</p>
<p>3.2. Расчётный период аренды составляет ${f} ${e.rate_period==="day"?"сут.":e.rate_period==="week"?"нед.":"мес."}, общая сумма арендной платы — ${Q(j)} рублей (${X(j)}).</p>
<p>3.3. Оплата производится наличными денежными средствами либо безналичным переводом на расчётный счёт Арендодателя. Неполный расчётный период оплачивается как полный.</p>
${b}

<h3>4. Права и обязанности сторон</h3>
<p>4.1. Арендатор обязан использовать Имущество исключительно по прямому назначению и в соответствии с правилами его эксплуатации и техники безопасности.</p>
<p>4.2. Арендатор обязан поддерживать Имущество в исправном состоянии, нести расходы на его содержание и обеспечивать сохранность в течение всего срока аренды.</p>
<p>4.3. Арендатор не вправе передавать Имущество третьим лицам, сдавать в субаренду, передавать в залог или иным образом им распоряжаться без письменного согласия Арендодателя.</p>
<p>4.4. Арендатор обязан вернуть Имущество в том состоянии, в котором он его получил, с учётом нормального износа.</p>
<p>4.5. Арендодатель обязан передать Имущество в состоянии, пригодном для использования по назначению, вместе со всеми принадлежностями и документами, если таковые необходимы.</p>
<p>4.6. Арендодатель вправе проверять состояние и условия эксплуатации Имущества, предварительно уведомив Арендатора.</p>

<h3>5. Ответственность сторон</h3>
<p>5.1. В случае повреждения Имущества по вине Арендатора он обязан возместить Арендодателю стоимость восстановительного ремонта, а при невозможности ремонта — полную стоимость Имущества.</p>
<p>5.2. В случае утраты или хищения Имущества Арендатор возмещает Арендодателю его полную стоимость в течение 5 (пяти) рабочих дней с момента предъявления требования.</p>
<p>5.3. За просрочку возврата Имущества Арендатор уплачивает неустойку в размере ${_} % от суммы арендной платы за каждый день просрочки, а также арендную плату за фактическое время пользования.</p>
<p>5.4. За просрочку внесения арендной платы Арендатор уплачивает пени в размере ${_} % от суммы задолженности за каждый день просрочки.</p>
<p>5.5. Риск случайной гибели или повреждения Имущества с момента его передачи и до момента возврата несёт Арендатор.</p>

<h3>6. Срок действия и расторжение</h3>
<p>6.1. Договор вступает в силу с момента подписания и действует до полного исполнения Сторонами своих обязательств.</p>
<p>6.2. Арендодатель вправе досрочно расторгнуть Договор в одностороннем порядке при использовании Имущества не по назначению, существенном ухудшении его состояния либо просрочке оплаты более 10 (десяти) календарных дней.</p>
<p>6.3. При досрочном расторжении Имущество подлежит возврату в течение 1 (одного) рабочего дня с момента получения соответствующего уведомления.</p>

<h3>7. Форс-мажор</h3>
<p>7.1. Стороны освобождаются от ответственности за неисполнение обязательств, если оно явилось следствием обстоятельств непреодолимой силы, возникших после заключения Договора.</p>

<h3>8. Разрешение споров</h3>
<p>8.1. Споры решаются путём переговоров с обязательным направлением письменной претензии. Срок рассмотрения претензии — ${c} календарных дней.</p>
<p>8.2. При недостижении согласия спор передаётся на рассмотрение суда в соответствии с законодательством Российской Федерации.</p>

<h3>9. Заключительные положения</h3>
<p>9.1. Все изменения и дополнения к Договору действительны при оформлении в письменном виде и подписании обеими Сторонами.</p>
<p>9.2. Договор составлен в ${g} экземплярах, имеющих равную юридическую силу, по одному для каждой из Сторон.</p>

${z}

<h3>${z?"11":"10"}. Реквизиты и подписи сторон</h3>
<table style="width:100%;margin-top:16px">
<tr>
<td style="width:50%;vertical-align:top;padding-right:16px">
<p><strong>АРЕНДОДАТЕЛЬ</strong></p>
${l?[d("",o),d("ИНН",n==null?void 0:n.inn),d("Юр. адрес",n==null?void 0:n.legal_address),d("Банк",n==null?void 0:n.bank_name),d("БИК",n==null?void 0:n.bik),d("Р/с",n==null?void 0:n.account_number),d("К/с",n==null?void 0:n.correspondent_account),d("Тел.",n==null?void 0:n.phone),d("Email",n==null?void 0:n.email)].join(""):ut(a)}
</td>
<td style="width:50%;vertical-align:top;padding-left:16px">
<p><strong>АРЕНДАТОР</strong></p>
${l?ut(a):[d("",o),d("ИНН",n==null?void 0:n.inn),d("Юр. адрес",n==null?void 0:n.legal_address),d("Тел.",n==null?void 0:n.phone),d("Email",n==null?void 0:n.email)].join("")}
</td>
</tr>
<tr>
<td style="width:50%;vertical-align:bottom;padding:36px 16px 0 0">
<p style="margin-bottom:28px"><strong>ОТ ИМЕНИ АРЕНДОДАТЕЛЯ</strong></p>
<p style="border-top:1px solid #999;padding-top:4px;max-width:240px;margin:0">${y(l?(n==null?void 0:n.contact_full_name)||o:(a==null?void 0:a.full_name)||(a==null?void 0:a.display_name)||"")}</p>
<p style="font-size:11px;color:#666;margin:2px 0 0">(подпись, М.П.)</p>
</td>
<td style="width:50%;vertical-align:bottom;padding:36px 0 0 16px">
<p style="margin-bottom:28px"><strong>ОТ ИМЕНИ АРЕНДАТОРА</strong></p>
<p style="border-top:1px solid #999;padding-top:4px;max-width:240px;margin:0">${y(l?(a==null?void 0:a.full_name)||(a==null?void 0:a.display_name)||"":(n==null?void 0:n.contact_full_name)||o)}</p>
<p style="font-size:11px;color:#666;margin:2px 0 0">(подпись)</p>
</td>
</tr>
</table>
</div>
`.trim()}function ne(){const{rentalId:t}=Rt(),e=Mt(),a=$.useRef(null),[n,r]=$.useState(!0),[l,o]=$.useState(!1),[h,f]=$.useState(!1),[j,m]=$.useState(""),[p,u]=$.useState(""),[i,_]=$.useState(null),[c,g]=$.useState(null),[x,b]=$.useState(null),[k,z]=$.useState(null),[w,v]=$.useState(""),[P,M]=$.useState(!1),[T,Y]=$.useState({city:"",contract_number:"",contract_date:new Date().toISOString().slice(0,10),purpose:"",delivery:"self_pickup",penalty_pct:"0,5",claim_days:"10",copies_total:"двух",extra_terms:""});$.useEffect(()=>{t&&(r(!0),Promise.all([U.list(),It.get()]).then(async([C,A])=>{const N=(C.rentals||[]).find(D=>D.id===Number(t));if(!N){e("/cabinet/rentals");return}_(N),b(A);const H=(C.counterparties||[]).find(D=>D.id===N.counterparty_id)||null;if(g(H),N.contract_id){const D=await U.contracts.get(N.contract_id);z(D),v(D.content_html),Y(Ct=>({...Ct,...D.options,contract_number:D.contract_number,contract_date:String(D.contract_date).slice(0,10)}))}else Y(D=>({...D,contract_number:N.rental_number}))}).catch(C=>m(C instanceof Error?C.message:"Не удалось загрузить")).finally(()=>r(!1)))},[t]);const q=$.useMemo(()=>i?ae({rental:i,counterparty:c,company:x,options:T}):"",[i,c,x,T]);$.useEffect(()=>{!i||P||k&&w||v(q)},[q,i,P,k,w]);const rt=$.useMemo(()=>c?Ht(c):["контрагент не выбран"],[c]),jt=()=>{v(q),M(!1),a.current&&(a.current.innerHTML=q),u("Текст пересобран по данным аренды"),setTimeout(()=>u(""),2500)},kt=async()=>{var C;if(i){o(!0),m("");try{const A=((C=a.current)==null?void 0:C.innerHTML)||w,N={rental_id:i.id,contract_number:T.contract_number||i.rental_number,contract_date:T.contract_date||new Date().toISOString().slice(0,10),status:(k==null?void 0:k.status)||"draft",options:T,content_html:A,total_amount:nt(i)};if(k)await U.contracts.update(k.id,N);else{const H=await U.contracts.create(N);z({id:H.id,rental_id:i.id,contract_number:N.contract_number,contract_date:N.contract_date,status:"draft",options:N.options,content_html:A,total_amount:N.total_amount,created_at:new Date().toISOString()})}v(A),u("Договор сохранён"),setTimeout(()=>u(""),2500)}catch(A){m(A instanceof Error?A.message:"Не удалось сохранить")}finally{o(!1)}}},Nt=()=>{var H;const C=((H=a.current)==null?void 0:H.innerHTML)||w,A=`Договор аренды № ${T.contract_number||(i==null?void 0:i.rental_number)||""}`,N=window.open("","_blank");N&&(N.document.write(`
      <html>
        <head>
          <title>${A}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 32px; line-height: 1.5; color: #161616; }
            h2, h3 { color: #161616; }
            h2 { margin: 28px 0 12px; }
            h3 { margin: 24px 0 10px; }
            p { margin: 0 0 14px; }
            table { border-collapse: collapse; }
            ${ht}
          </style>
        </head>
        <body>${xt(A)}${C}</body>
      </html>
    `),N.document.close(),N.focus(),N.print())},Et=async()=>{var C;f(!0);try{const A=((C=a.current)==null?void 0:C.innerHTML)||w;await Gt(A,T.contract_number||(i==null?void 0:i.rental_number)||"аренда")}finally{f(!1)}};return n?s.jsx(lt,{title:"Договор аренды",children:s.jsx("div",{className:"flex items-center justify-center py-24",children:s.jsx(S,{name:"Loader2",size:28,className:"animate-spin text-white/40"})})}):i?s.jsxs(lt,{title:"Договор аренды",subtitle:`${i.item_name} · ${i.counterparty_name||"контрагент не выбран"}`,children:[s.jsxs("button",{onClick:()=>e("/cabinet/rentals"),className:"mb-4 inline-flex items-center gap-1.5 text-sm text-white/50 transition-colors hover:text-white",children:[s.jsx(S,{name:"ChevronLeft",size:16}),"Назад к аренде"]}),rt.length>0&&s.jsxs("div",{className:"mb-4 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200",children:[s.jsx(S,{name:"TriangleAlert",size:16,className:"mt-0.5 shrink-0"}),s.jsxs("div",{className:"min-w-0 break-words",children:["В договоре останутся пропуски — у контрагента не заполнено: ",rt.join(", "),"."," ",s.jsx("button",{onClick:()=>e("/cabinet/rentals"),className:"underline hover:text-white",children:"Заполнить"})]})]}),j&&s.jsxs("div",{className:"mb-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300",children:[s.jsx(S,{name:"CircleAlert",size:16}),j]}),p&&s.jsxs("div",{className:"mb-4 flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-300",children:[s.jsx(S,{name:"Check",size:16}),p]}),s.jsxs("div",{className:"grid gap-4 lg:grid-cols-[320px_1fr]",children:[s.jsxs("div",{className:"space-y-4 min-w-0",children:[s.jsx(Zt,{options:T,onChange:C=>Y(A=>({...A,...C}))}),s.jsx(te,{rental:i,edited:P,onRegenerate:jt})]}),s.jsx(ee,{editorRef:a,html:w,saving:l,downloading:h,hasExisting:!!k,onEdit:()=>M(!0),onSave:kt,onPrint:Nt,onDownload:Et})]})]}):null}const _e=Object.freeze(Object.defineProperty({__proto__:null,default:ne},Symbol.toStringTag,{value:"Module"}));export{at as R,pe as S,Gt as a,me as b,ie as c,de as d,$t as e,ge as f,xe as g,be as h,oe as i,Ft as j,Kt as k,_e as l,ce as m,le as p,he as q,_t as r,ue as s,fe as t};
