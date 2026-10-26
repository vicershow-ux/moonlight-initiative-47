import{r as ye,b as C,e as je,d as H,c as Ne,a as Ae}from"./RentalContract-CpSaYFjp.js";import{j as t,r as d,bj as U,bk as _e,bl as De,bm as $e,d as W,bn as ke,c as Ce,bo as Se,b as Ee,bp as ze,bq as Pe,br as q,bs as Re,bt as Te,a5 as Ie,bu as Oe,k as y,I as f,t as Y,w as G,o as K,aw as z,L as D,z as $,au as Le}from"./index-CmqFuu8b.js";import{C as S}from"./Company-BqgKYCw2.js";var Fe=Symbol("radix.slottable");function Be(e){const s=({children:o})=>t.jsx(t.Fragment,{children:o});return s.displayName=`${e}.Slottable`,s.__radixId=Fe,s}var Z="AlertDialog",[Me]=Ce(Z,[U]),j=U(),J=e=>{const{__scopeAlertDialog:s,...o}=e,n=j(s);return t.jsx(_e,{...n,...o,modal:!0})};J.displayName=Z;var Ve="AlertDialogTrigger",Q=d.forwardRef((e,s)=>{const{__scopeAlertDialog:o,...n}=e,a=j(o);return t.jsx(De,{...a,...n,ref:s})});Q.displayName=Ve;var He="AlertDialogPortal",X=e=>{const{__scopeAlertDialog:s,...o}=e,n=j(s);return t.jsx($e,{...n,...o})};X.displayName=He;var Ue="AlertDialogOverlay",ee=d.forwardRef((e,s)=>{const{__scopeAlertDialog:o,...n}=e,a=j(o);return t.jsx(Re,{...a,...n,ref:s})});ee.displayName=Ue;var A="AlertDialogContent",[We,qe]=Me(A),Ye=Be("AlertDialogContent"),te=d.forwardRef((e,s)=>{const{__scopeAlertDialog:o,children:n,...a}=e,r=j(o),l=d.useRef(null),i=W(s,l),c=d.useRef(null);return t.jsx(ke,{contentName:A,titleName:ae,docsSlug:"alert-dialog",children:t.jsx(We,{scope:o,cancelRef:c,children:t.jsxs(Se,{role:"alertdialog",...r,...a,ref:i,onOpenAutoFocus:Ee(a.onOpenAutoFocus,m=>{var p;m.preventDefault(),(p=c.current)==null||p.focus({preventScroll:!0})}),onPointerDownOutside:m=>m.preventDefault(),onInteractOutside:m=>m.preventDefault(),children:[t.jsx(Ye,{children:n}),t.jsx(Ke,{contentRef:l})]})})})});te.displayName=A;var ae="AlertDialogTitle",se=d.forwardRef((e,s)=>{const{__scopeAlertDialog:o,...n}=e,a=j(o);return t.jsx(ze,{...a,...n,ref:s})});se.displayName=ae;var oe="AlertDialogDescription",ne=d.forwardRef((e,s)=>{const{__scopeAlertDialog:o,...n}=e,a=j(o);return t.jsx(Pe,{...a,...n,ref:s})});ne.displayName=oe;var Ge="AlertDialogAction",re=d.forwardRef((e,s)=>{const{__scopeAlertDialog:o,...n}=e,a=j(o);return t.jsx(q,{...a,...n,ref:s})});re.displayName=Ge;var ie="AlertDialogCancel",le=d.forwardRef((e,s)=>{const{__scopeAlertDialog:o,...n}=e,{cancelRef:a}=qe(ie,o),r=j(o),l=W(s,a);return t.jsx(q,{...r,...n,ref:l})});le.displayName=ie;var Ke=({contentRef:e})=>{const s=`\`${A}\` requires a description for the component to be accessible for screen reader users.

You can add a description to the \`${A}\` by passing a \`${oe}\` component as a child, which also benefits sighted users by adding visible context to the dialog.

Alternatively, you can use your own component as a description by assigning it an \`id\` and passing the same value to the \`aria-describedby\` prop in \`${A}\`. If the description is confusing or duplicative for sighted users, you can use the \`@radix-ui/react-visually-hidden\` primitive as a wrapper around your description component.

For more information, see https://radix-ui.com/primitives/docs/components/alert-dialog`;return d.useEffect(()=>{var n;document.getElementById((n=e.current)==null?void 0:n.getAttribute("aria-describedby"))||console.warn(s)},[s,e]),null},Ze=J,Je=Q,Qe=X,de=ee,ce=te,me=re,pe=le,fe=se,ue=ne,Xe=Symbol.for("react.lazy"),E=Te[" use ".trim().toString()];function et(e){return typeof e=="object"&&e!==null&&"then"in e}function xe(e){return e!=null&&typeof e=="object"&&"$$typeof"in e&&e.$$typeof===Xe&&"_payload"in e&&et(e._payload)}function tt(e){const s=st(e),o=d.forwardRef((n,a)=>{let{children:r,...l}=n;xe(r)&&typeof E=="function"&&(r=E(r._payload));const i=d.Children.toArray(r),c=i.find(nt);if(c){const m=c.props.children,p=i.map(g=>g===c?d.Children.count(m)>1?d.Children.only(null):d.isValidElement(m)?m.props.children:null:g);return t.jsx(s,{...l,ref:a,children:d.isValidElement(m)?d.cloneElement(m,void 0,p):null})}return t.jsx(s,{...l,ref:a,children:r})});return o.displayName=`${e}.Slot`,o}var at=tt("Slot");function st(e){const s=d.forwardRef((o,n)=>{let{children:a,...r}=o;if(xe(a)&&typeof E=="function"&&(a=E(a._payload)),d.isValidElement(a)){const l=it(a),i=rt(r,a.props);return a.type!==d.Fragment&&(i.ref=n?Ie(n,l):l),d.cloneElement(a,i)}return d.Children.count(a)>1?d.Children.only(null):null});return s.displayName=`${e}.SlotClone`,s}var ot=Symbol("radix.slottable");function nt(e){return d.isValidElement(e)&&typeof e.type=="function"&&"__radixId"in e.type&&e.type.__radixId===ot}function rt(e,s){const o={...s};for(const n in s){const a=e[n],r=s[n];/^on[A-Z]/.test(n)?a&&r?o[n]=(...i)=>{const c=r(...i);return a(...i),c}:a&&(o[n]=a):n==="style"?o[n]={...a,...r}:n==="className"&&(o[n]=[a,r].filter(Boolean).join(" "))}return{...e,...o}}function it(e){var n,a;let s=(n=Object.getOwnPropertyDescriptor(e.props,"ref"))==null?void 0:n.get,o=s&&"isReactWarning"in s&&s.isReactWarning;return o?e.ref:(s=(a=Object.getOwnPropertyDescriptor(e,"ref"))==null?void 0:a.get,o=s&&"isReactWarning"in s&&s.isReactWarning,o?e.props.ref:e.props.ref||e.ref)}const P=Oe("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",{variants:{variant:{default:"bg-primary text-primary-foreground hover:bg-primary/90",destructive:"bg-destructive text-destructive-foreground hover:bg-destructive/90",outline:"border border-input bg-background hover:bg-accent hover:text-accent-foreground",secondary:"bg-secondary text-secondary-foreground hover:bg-secondary/80",ghost:"hover:bg-accent hover:text-accent-foreground",link:"text-primary underline-offset-4 hover:underline"},size:{default:"h-10 px-4 py-2",sm:"h-9 rounded-md px-3",lg:"h-11 rounded-md px-8",icon:"h-10 w-10"}},defaultVariants:{variant:"default",size:"default"}}),lt=d.forwardRef(({className:e,variant:s,size:o,asChild:n=!1,...a},r)=>{const l=n?at:"button";return t.jsx(l,{className:y(P({variant:s,size:o,className:e})),ref:r,...a})});lt.displayName="Button";const he=Ze,yt=Je,dt=Qe,ge=d.forwardRef(({className:e,...s},o)=>t.jsx(de,{className:y("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",e),...s,ref:o}));ge.displayName=de.displayName;const R=d.forwardRef(({className:e,...s},o)=>t.jsxs(dt,{children:[t.jsx(ge,{}),t.jsx(ce,{ref:o,className:y("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",e),...s})]}));R.displayName=ce.displayName;const T=({className:e,...s})=>t.jsx("div",{className:y("flex flex-col space-y-2 text-center sm:text-left",e),...s});T.displayName="AlertDialogHeader";const I=({className:e,...s})=>t.jsx("div",{className:y("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",e),...s});I.displayName="AlertDialogFooter";const O=d.forwardRef(({className:e,...s},o)=>t.jsx(fe,{ref:o,className:y("text-lg font-semibold",e),...s}));O.displayName=fe.displayName;const L=d.forwardRef(({className:e,...s},o)=>t.jsx(ue,{ref:o,className:y("text-sm text-muted-foreground",e),...s}));L.displayName=ue.displayName;const F=d.forwardRef(({className:e,...s},o)=>t.jsx(me,{ref:o,className:y(P(),e),...s}));F.displayName=me.displayName;const B=d.forwardRef(({className:e,...s},o)=>t.jsx(pe,{ref:o,className:y(P({variant:"outline"}),"mt-2 sm:mt-0",e),...s}));B.displayName=pe.displayName;const M=e=>String(e??"").replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\r?\n/g," "),_=(e,s=0)=>{const o=typeof e=="string"?parseFloat(e):Number(e);return Number.isFinite(o)?o:s},k=e=>new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0}).format(_(e))+" ₽";function x(e){const s=document.createElement("div");return s.textContent=e??"",s.innerHTML}function ct(e,s){const o=new Map;return e.forEach(n=>{const a=s.find(i=>i.id===n.material_id),r=n.shop_name||(a==null?void 0:a.shop_name)||"Магазин не указан";o.has(r)||o.set(r,{name:r,address:"",phone:"",items:[],sum:0});const l=o.get(r);!l.address&&(a!=null&&a.shop_address)&&(l.address=a.shop_address),!l.phone&&(a!=null&&a.shop_phone)&&(l.phone=a.shop_phone),l.items.push(n),l.sum+=_(n.qty)*_(n.price)}),Array.from(o.values()).sort((n,a)=>a.sum-n.sum)}function be(e,s,o,n,a="Смета на материал"){const r=ct(s,o),l=r.reduce((u,w)=>u+w.sum,0),i=Array.from(new Set(s.map(u=>u.room_name).filter(Boolean))),c=i.length?i.join(", "):"Без помещения",m=r.map(u=>{const w=u.items.map((h,N)=>`
            <tr>
              <td class="num">${N+1}</td>
              <td>${x(h.name)}</td>
              <td>${x(h.room_name||"—")}</td>
              <td class="center">${_(h.qty)}</td>
              <td class="center">${x(h.unit)}</td>
              <td class="right">${k(h.price)}</td>
              <td class="right amount">${k(_(h.qty)*_(h.price))}</td>
            </tr>`).join(""),b=u.address?`Адрес: ${x(u.address)}`:"";return`
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
              <tr class="cat-row"><td colspan="7">${x(u.name)}${b?` — ${b}`:""}</td></tr>
              ${w}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="6" class="right">Итого по магазину</td>
                <td class="right amount">${k(u.sum)}</td>
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
      content: "${M(`Материалы · объект ${e.object_code||""}`.trim())}";
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 8.5pt;
      color: #6B4508;
    }
    @top-right {
      content: "${M(e.client_name||n)}";
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
`,g=`
  <div class="header">
    <div class="brand"><img class="brand-logo" src="${window.location.origin}/logo-print.png" alt="FixKey"/><b class="brand-word">Fix<span>Key</span></b></div>
    <div class="doc-title">
      <h1>${x(a)}</h1>
      <p>Объект № ${x(e.object_code)}</p>
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
      <div class="value">${x(e.object_code)}</div>
    </div>
    <div>
      <div class="label">Заказчик</div>
      <div class="value">${x(e.client_name)}</div>
    </div>
    <div>
      <div class="label">Адрес объекта</div>
      <div class="value">${x(e.address||"—")}</div>
    </div>
    <div>
      <div class="label">Помещение</div>
      <div class="value">${x(c)}</div>
    </div>
  </div>

  ${m}

  <div class="summary">
    <div class="summary-box">
      <div class="summary-row">
        <span>Помещение:</span>
        <span>${x(c)}</span>
      </div>
      <div class="summary-total">
        <span>ИТОГО:</span>
        <span>${k(l)}</span>
      </div>
    </div>
  </div>

  <hr class="thin" />

  <div class="parties">
    <div>
      <div class="label">Исполнитель</div>
      <div class="name">${x(n)}</div>
    </div>
    <div>
      <div class="label">Заказчик</div>
      <div class="name">${x(e.client_name)}</div>
    </div>
  </div>`,v=`${x(a)} № ${e.object_code} — ${x(e.client_name)}`;return{styles:p,bodyContent:g,title:v}}function jt(e,s,o,n,a=!1,r){const{styles:l,bodyContent:i,title:c}=be(e,s,o,n,r),m=`<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8" />
<title>${c}</title>
<style>${l}</style>
</head>
<body>
<div class="est-root">${i}</div>
</body>
</html>`,p=window.open("","_blank","width=900,height=1000");p&&(p.document.open(),p.document.write(m),p.document.close(),a&&(p.onload=()=>{p.focus(),p.print()}))}function V(e,s){let o=e;for(;;){const n=s.exec(o);if(!n)return o;const a=o.indexOf("{",n.index);if(a===-1)return o;let r=0,l=-1;for(let i=a;i<o.length;i++)if(o[i]==="{")r++;else if(o[i]==="}"&&(r--,r===0)){l=i;break}if(l===-1)return o;o=o.slice(0,n.index)+o.slice(l+1),s.lastIndex=0}}function mt(e,s){return V(V(e,/@page\b/g),/@media\s+print\b/g).replace(/(^|\})\s*([^{}@]+)\s*\{/g,(n,a,r)=>{const l=r.split(",").map(i=>{const c=i.trim();return c?c==="*"?`${s}, ${s} *`:/^(html|body)$/i.test(c)||c===".est-root"?s:c.startsWith(".est-root ")?`${s} ${c.slice(10)}`:`${s} ${c}`:""}).filter(Boolean).join(", ");return`${a} ${l} {`})}const pt=`
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
`;function ft(e,s,o,n,a){const{styles:r,bodyContent:l}=be(e,s,o,n,a);return`<style>${mt(r+pt,"#pdf-scope-materials")}</style>${l}`}async function Nt(e,s,o,n,a){await ve(e,s,o,n,"save",a)}async function At(e,s,o,n,a){return await ve(e,s,o,n,"base64",a)||""}async function ve(e,s,o,n,a,r="Смета на материал"){return ye(l=>{l.id="pdf-scope-materials",l.className="est-root",l.innerHTML=ft(e,s,o,n,r)},{filename:`${r} ${e.object_code}.pdf`,mode:a})}function ut({open:e,onOpenChange:s,onConfirm:o,title:n="Удалить безвозвратно?",description:a="Это действие нельзя отменить. Запись будет удалена навсегда."}){const[r,l]=d.useState(!1),i=async()=>{l(!0);try{await o(),s(!1)}finally{l(!1)}};return t.jsx(he,{open:e,onOpenChange:s,children:t.jsxs(R,{className:"bg-[#1f1f1f] border-white/10 text-white",children:[t.jsxs(T,{children:[t.jsxs(O,{className:"flex items-center gap-2",children:[t.jsx(f,{name:"TriangleAlert",size:18,className:"text-red-400"}),n]}),t.jsx(L,{className:"text-white/50",children:a})]}),t.jsxs(I,{children:[t.jsx(B,{disabled:r,className:"bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white",children:"Нет, отменить"}),t.jsx(F,{disabled:r,onClick:c=>{c.preventDefault(),i()},className:"bg-red-500 text-white hover:bg-red-600",children:r?t.jsx(f,{name:"Loader2",size:16,className:"animate-spin"}):"Да, удалить"})]})]})})}const xt=e=>new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0}).format(Number(e)||0)+" ₽";function we({signedAt:e,isSigned:s,docLabel:o,docTitle:n,amountLabel:a,amount:r,onSign:l,onDone:i}){const[c,m]=d.useState(!1),[p,g]=d.useState(!1),[v,u]=d.useState(!1),[w,b]=d.useState("");if(e||s)return t.jsxs("div",{className:"bg-emerald-500/10 border border-emerald-500/30 rounded-xl mb-4 p-3 sm:p-4 flex items-center gap-3 max-w-4xl mx-auto",children:[t.jsx(f,{name:"BadgeCheck",size:22,className:"text-emerald-400 shrink-0"}),t.jsxs("div",{className:"text-sm",children:[t.jsxs("p",{className:"font-medium",children:[o," подписан",o==="Соглашение"?"о":""]}),e&&t.jsx("p",{className:"text-white/50 text-xs",children:new Date(e).toLocaleString("ru-RU",{day:"numeric",month:"long",year:"numeric",hour:"2-digit",minute:"2-digit"})})]})]});const h=async()=>{u(!0),b("");try{await l(),m(!1),i()}catch(N){b(N instanceof Error?N.message:"Не удалось подписать")}finally{u(!1)}};return t.jsxs("div",{className:"bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl mb-4 p-3 sm:p-4 flex flex-col sm:flex-row sm:flex-wrap sm:items-center justify-between gap-3 max-w-4xl mx-auto",children:[t.jsxs("div",{className:"text-sm",children:[t.jsx("p",{className:"font-medium",children:"Ознакомьтесь с документом и подпишите его онлайн"}),t.jsxs("p",{className:"text-white/50 text-xs",children:[a,": ",xt(r)]}),w&&t.jsx("p",{className:"text-red-400 text-xs mt-1",children:w})]}),t.jsxs("button",{onClick:()=>{g(!1),m(!0)},className:"inline-flex w-full sm:w-auto min-h-[44px] sm:min-h-0 justify-center items-center gap-2 rounded-lg bg-[#D4AF37] hover:bg-[#B8860B] px-4 py-2.5 text-sm font-medium text-[#161616]",children:[t.jsx(f,{name:"PenLine",size:16}),"Подписать"]}),t.jsx(he,{open:c,onOpenChange:m,children:t.jsxs(R,{className:"w-[calc(100%-1.5rem)] sm:w-full max-h-[88vh] overflow-y-auto p-4 sm:p-6 rounded-lg",children:[t.jsxs(T,{children:[t.jsxs(O,{children:["Подписать ",n,"?"]}),t.jsx(L,{children:"Подписывая, вы соглашаетесь с условиями документа. После подписания его нельзя изменить, подрядчик получит уведомление."})]}),t.jsxs("label",{className:"flex items-start gap-2 text-sm",children:[t.jsx("input",{type:"checkbox",checked:p,onChange:N=>g(N.target.checked),className:"mt-0.5"}),"Я ознакомился с текстом документа и согласен с его условиями"]}),t.jsxs(I,{children:[t.jsx(B,{disabled:v,className:"min-h-[44px] sm:min-h-0",children:"Отмена"}),t.jsx(F,{onClick:N=>{N.preventDefault(),h()},disabled:v||!p,className:"min-h-[44px] sm:min-h-0",children:v?"Подписываем…":"Подписать"})]})]})})]})}function ht(){const{id:e,contractId:s,addendumId:o}=Y(),n=G(),{user:a}=K(),r=(a==null?void 0:a.role)==="client",l=Number(e),[i,c]=d.useState(null),[m,p]=d.useState(!1),[g,v]=d.useState(!1),u=()=>z.get(Number(o)).then(c).catch(()=>n(`/cabinet/objects/${l}`));if(d.useEffect(()=>{u()},[o]),!i)return t.jsx(S,{title:"Дополнительное соглашение",children:t.jsx("div",{className:"flex items-center justify-center py-24",children:t.jsx(f,{name:"Loader2",size:28,className:"animate-spin text-white/40"})})});const w=`Доп. соглашение № ${i.addendum_number}`,b=C(i.content_html||""),h=async()=>{p(!0);try{await H(b,`ДС ${i.addendum_number} к договору ${i.contract_number||""}`.trim())}finally{p(!1)}};return t.jsxs(S,{title:w,subtitle:`к договору № ${i.contract_number||""}`,children:[t.jsxs("div",{className:"flex items-center justify-between mb-4 flex-wrap gap-3",children:[t.jsxs(D,{to:r?`/cabinet/objects/${l}`:`/cabinet/objects/${l}/contracts/${s}`,className:"inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors",children:[t.jsx(f,{name:"ChevronLeft",size:16}),r?"К объекту":"К договору"]}),t.jsxs("div",{className:"grid grid-cols-2 gap-2 w-full sm:flex sm:items-center sm:w-auto",children:[t.jsx("span",{className:`col-span-2 justify-self-start px-2.5 py-1 rounded-full text-xs font-medium ${i.status==="signed"?"bg-green-500/20 text-green-300":"bg-white/10 text-white/50"}`,children:i.status==="signed"?"подписано":"черновик"}),!r&&!i.signed_at&&t.jsxs(t.Fragment,{children:[t.jsxs(D,{to:`/cabinet/objects/${l}/contracts/${s}/addenda/${i.id}/edit`,className:"flex items-center justify-center min-h-[44px] sm:min-h-0 gap-1.5 bg-blue-500 hover:bg-blue-600 transition-colors text-white text-sm px-3 py-2 rounded-lg",children:[t.jsx(f,{name:"Pencil",size:14}),"Редактировать"]}),t.jsxs("button",{onClick:()=>v(!0),title:"Удалить",className:"flex items-center justify-center gap-1.5 text-sm w-full h-11 sm:w-9 sm:h-9 bg-white/5 hover:bg-red-500/20 hover:text-red-300 transition-colors rounded-lg",children:[t.jsx(f,{name:"Trash2",size:15}),t.jsx("span",{className:"sm:hidden",children:"Удалить"})]})]}),t.jsxs("button",{onClick:()=>je({addendum_number:i.addendum_number,content_html:i.content_html||""}),title:"Печать",className:"flex items-center justify-center gap-1.5 text-sm w-full h-11 sm:w-9 sm:h-9 bg-white/5 hover:bg-white/10 transition-colors rounded-lg",children:[t.jsx(f,{name:"Printer",size:15}),t.jsx("span",{className:"sm:hidden",children:"Печать"})]}),t.jsxs("button",{onClick:h,disabled:m,title:"Скачать PDF",className:"flex items-center justify-center gap-1.5 text-sm w-full h-11 sm:w-9 sm:h-9 bg-white/5 hover:bg-white/10 transition-colors rounded-lg disabled:opacity-60",children:[t.jsx(f,{name:m?"Loader2":"Download",size:15,className:m?"animate-spin":""}),t.jsx("span",{className:"sm:hidden",children:"PDF"})]})]})]}),r?t.jsx(we,{signedAt:i.signed_at,isSigned:i.status==="signed",docLabel:"Соглашение",docTitle:`допсоглашение № ${i.addendum_number}`,amountLabel:"Новая цена договора",amount:Number(i.total_amount),onSign:()=>z.sign(i.id),onDone:u}):i.signed_at&&t.jsxs("div",{className:"bg-emerald-500/10 border border-emerald-500/30 rounded-xl mb-4 p-3 sm:p-4 flex items-center gap-3 max-w-4xl mx-auto text-sm",children:[t.jsx(f,{name:"BadgeCheck",size:20,className:"text-emerald-400"}),"Заказчик подписал онлайн ",new Date(i.signed_at).toLocaleString("ru-RU",{day:"numeric",month:"long",hour:"2-digit",minute:"2-digit"})]}),t.jsx("div",{className:"bg-white rounded-xl p-3 sm:p-6 md:p-10 max-w-4xl mx-auto shadow-xl overflow-x-auto",children:t.jsx("div",{dangerouslySetInnerHTML:{__html:b}})}),t.jsx(ut,{open:g,onOpenChange:v,onConfirm:async()=>{await z.remove(i.id),n(`/cabinet/objects/${l}/contracts/${s}`)},title:"Удалить соглашение?",description:"Дополнительное соглашение будет удалено безвозвратно."})]})}const _t=Object.freeze(Object.defineProperty({__proto__:null,default:ht},Symbol.toStringTag,{value:"Module"}));function gt(){var b;const{actId:e}=Y(),s=G(),{user:o}=K(),n=(o==null?void 0:o.role)==="client",[a,r]=d.useState(null),[l,i]=d.useState(!0),[c,m]=d.useState(!1),[p,g]=d.useState(!1),v=()=>{e&&$.get(Number(e)).then(r)};d.useEffect(()=>{e&&(i(!0),$.get(Number(e)).then(r).catch(()=>s(n?"/cabinet/objects":"/cabinet/documents")).finally(()=>i(!1)))},[e]);const u=()=>{a&&Ae(a)},w=async()=>{if(a){m(!0);try{await H(C(a.content_html),`Акт ${a.act_number}`)}finally{m(!1)}}};return l?t.jsx(S,{title:"Акт",children:t.jsx("div",{className:"flex items-center justify-center py-24",children:t.jsx(f,{name:"Loader2",size:28,className:"animate-spin text-white/40"})})}):a?t.jsxs(S,{title:`Акт выполненных работ № ${a.act_number}`,children:[t.jsxs("div",{className:"flex items-center justify-between mb-4 flex-wrap gap-3",children:[t.jsxs(D,{to:n?`/cabinet/objects/${a.object_id}`:"/cabinet/documents",className:"inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors",children:[t.jsx(f,{name:"ChevronLeft",size:16}),n?"К объекту":"К документам"]}),t.jsxs("div",{className:"grid grid-cols-2 gap-2 w-full sm:flex sm:items-center sm:w-auto",children:[t.jsx("span",{className:y("col-span-2 justify-self-start px-2.5 py-1 rounded-full text-xs font-medium",a.status==="signed"?"bg-green-500/20 text-green-300":"bg-white/10 text-white/50"),children:a.status==="signed"?"подписан":"черновик"}),!n&&t.jsxs(t.Fragment,{children:[!a.signed_at&&t.jsxs(D,{to:`/cabinet/objects/${a.object_id}/acts/${a.id}/edit`,className:"flex items-center justify-center min-h-[44px] sm:min-h-0 gap-1.5 bg-blue-500 hover:bg-blue-600 transition-colors text-white text-sm px-3 py-2 rounded-lg",children:[t.jsx(f,{name:"Pencil",size:14}),"Редактировать"]}),t.jsxs(D,{to:`/cabinet/objects/${a.object_id}/invoices/new?act_id=${a.id}`,className:"flex items-center justify-center min-h-[44px] sm:min-h-0 gap-1.5 bg-white/10 hover:bg-white/15 transition-colors text-white text-sm px-3 py-2 rounded-lg",children:[t.jsx(f,{name:"Receipt",size:14}),"Выставить счёт"]}),t.jsxs("button",{onClick:()=>g(!0),className:"flex items-center justify-center min-h-[44px] sm:min-h-0 gap-1.5 bg-white/10 hover:bg-white/15 transition-colors text-white text-sm px-3 py-2 rounded-lg",children:[t.jsx(f,{name:"Mail",size:14}),"Отправить на почту"]})]}),t.jsxs("button",{onClick:u,title:"Печать",className:"flex items-center justify-center gap-1.5 text-sm w-full h-11 sm:w-9 sm:h-9 bg-white/5 hover:bg-white/10 transition-colors rounded-lg",children:[t.jsx(f,{name:"Printer",size:15}),t.jsx("span",{className:"sm:hidden",children:"Печать"})]}),t.jsxs("button",{onClick:w,disabled:c,title:"Скачать PDF",className:"flex items-center justify-center gap-1.5 text-sm w-full h-11 sm:w-9 sm:h-9 bg-white/5 hover:bg-white/10 transition-colors rounded-lg disabled:opacity-60",children:[c?t.jsx(f,{name:"Loader2",size:15,className:"animate-spin"}):t.jsx(f,{name:"Download",size:15}),t.jsx("span",{className:"sm:hidden",children:"PDF"})]})]})]}),n?t.jsx(we,{signedAt:a.signed_at,isSigned:a.status==="signed",docLabel:"Акт",docTitle:`акт № ${a.act_number}`,amountLabel:"Сумма по акту",amount:Number(a.total_amount),onSign:()=>$.sign(a.id),onDone:v}):a.signed_at&&t.jsxs("div",{className:"bg-emerald-500/10 border border-emerald-500/30 rounded-xl mb-4 p-3 sm:p-4 flex items-center gap-3 max-w-4xl mx-auto text-sm",children:[t.jsx(f,{name:"BadgeCheck",size:20,className:"text-emerald-400"}),"Заказчик подписал акт онлайн"," ",new Date(a.signed_at).toLocaleString("ru-RU",{day:"numeric",month:"long",hour:"2-digit",minute:"2-digit"})]}),t.jsx("div",{className:"overflow-x-auto md:overflow-visible max-w-4xl mx-auto",children:t.jsx("div",{className:"bg-white text-[#161616] rounded-xl p-4 sm:p-12 max-w-4xl mx-auto shadow-lg break-words",children:t.jsx("div",{dangerouslySetInnerHTML:{__html:C(a.content_html)}})})}),t.jsx(Le,{open:p,onOpenChange:g,docName:"акт",objectId:a.object_id,fileName:`Акт_${a.act_number}.pdf`,makePdf:()=>Ne(C(a.content_html),`Акт ${a.act_number}`),send:h=>$.sendEmail(a.id,h),extraFiles:(((b=a.options)==null?void 0:b.attachments)||[]).map(h=>h.name)})]}):null}const Dt=Object.freeze(Object.defineProperty({__proto__:null,default:gt},Symbol.toStringTag,{value:"Module"}));export{he as A,ut as C,we as D,yt as a,R as b,T as c,O as d,L as e,I as f,B as g,F as h,Nt as i,_t as j,Dt as k,At as m,jt as p,mt as s};
