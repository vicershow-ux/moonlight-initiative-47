import{j as t,r,be as me,bf as We,bg as Ge,bh as Ye,d as pe,bi as qe,c as Ke,bj as Ze,b as Xe,bk as Je,bl as Qe,bm as ue,bn as et,bo as tt,a1 as at,bp as st,k as $,I as u,b6 as k,R as nt,L as S,bb as xe,E as Y,G as q,o as fe,bd as U,av as L}from"./index-rjwDq6o3.js";import{d as I,r as ot,c as he}from"./RentalContract-I2GfEkP-.js";import{C as T,a as ne,d as oe,b as it}from"./Company-CbF3AAYr.js";import{d as F,b as rt,p as lt,a as ct}from"./ActCreate-BkcbPzut.js";import{S as ge}from"./PurchaseListView-UvcvCjAo.js";var dt=Symbol("radix.slottable");function mt(e){const a=({children:n})=>t.jsx(t.Fragment,{children:n});return a.displayName=`${e}.Slottable`,a.__radixId=dt,a}var be="AlertDialog",[pt]=Ke(be,[me]),C=me(),ye=e=>{const{__scopeAlertDialog:a,...n}=e,o=C(a);return t.jsx(We,{...o,...n,modal:!0})};ye.displayName=be;var ut="AlertDialogTrigger",we=r.forwardRef((e,a)=>{const{__scopeAlertDialog:n,...o}=e,s=C(n);return t.jsx(Ge,{...s,...o,ref:a})});we.displayName=ut;var xt="AlertDialogPortal",ve=e=>{const{__scopeAlertDialog:a,...n}=e,o=C(a);return t.jsx(Ye,{...o,...n})};ve.displayName=xt;var ft="AlertDialogOverlay",je=r.forwardRef((e,a)=>{const{__scopeAlertDialog:n,...o}=e,s=C(n);return t.jsx(et,{...s,...o,ref:a})});je.displayName=ft;var R="AlertDialogContent",[ht,gt]=pt(R),bt=mt("AlertDialogContent"),Ne=r.forwardRef((e,a)=>{const{__scopeAlertDialog:n,children:o,...s}=e,l=C(n),d=r.useRef(null),i=pe(a,d),p=r.useRef(null);return t.jsx(qe,{contentName:R,titleName:_e,docsSlug:"alert-dialog",children:t.jsx(ht,{scope:n,cancelRef:p,children:t.jsxs(Ze,{role:"alertdialog",...l,...s,ref:i,onOpenAutoFocus:Xe(s.onOpenAutoFocus,m=>{var g;m.preventDefault(),(g=p.current)==null||g.focus({preventScroll:!0})}),onPointerDownOutside:m=>m.preventDefault(),onInteractOutside:m=>m.preventDefault(),children:[t.jsx(bt,{children:o}),t.jsx(wt,{contentRef:d})]})})})});Ne.displayName=R;var _e="AlertDialogTitle",$e=r.forwardRef((e,a)=>{const{__scopeAlertDialog:n,...o}=e,s=C(n);return t.jsx(Je,{...s,...o,ref:a})});$e.displayName=_e;var Ae="AlertDialogDescription",ke=r.forwardRef((e,a)=>{const{__scopeAlertDialog:n,...o}=e,s=C(n);return t.jsx(Qe,{...s,...o,ref:a})});ke.displayName=Ae;var yt="AlertDialogAction",De=r.forwardRef((e,a)=>{const{__scopeAlertDialog:n,...o}=e,s=C(n);return t.jsx(ue,{...s,...o,ref:a})});De.displayName=yt;var Se="AlertDialogCancel",Ce=r.forwardRef((e,a)=>{const{__scopeAlertDialog:n,...o}=e,{cancelRef:s}=gt(Se,n),l=C(n),d=pe(a,s);return t.jsx(ue,{...l,...o,ref:d})});Ce.displayName=Se;var wt=({contentRef:e})=>{const a=`\`${R}\` requires a description for the component to be accessible for screen reader users.

You can add a description to the \`${R}\` by passing a \`${Ae}\` component as a child, which also benefits sighted users by adding visible context to the dialog.

Alternatively, you can use your own component as a description by assigning it an \`id\` and passing the same value to the \`aria-describedby\` prop in \`${R}\`. If the description is confusing or duplicative for sighted users, you can use the \`@radix-ui/react-visually-hidden\` primitive as a wrapper around your description component.

For more information, see https://radix-ui.com/primitives/docs/components/alert-dialog`;return r.useEffect(()=>{var o;document.getElementById((o=e.current)==null?void 0:o.getAttribute("aria-describedby"))||console.warn(a)},[a,e]),null},vt=ye,jt=we,Nt=ve,Ee=je,ze=Ne,Pe=De,Re=Ce,Te=$e,Le=ke,_t=Symbol.for("react.lazy"),B=tt[" use ".trim().toString()];function $t(e){return typeof e=="object"&&e!==null&&"then"in e}function Fe(e){return e!=null&&typeof e=="object"&&"$$typeof"in e&&e.$$typeof===_t&&"_payload"in e&&$t(e._payload)}function At(e){const a=Dt(e),n=r.forwardRef((o,s)=>{let{children:l,...d}=o;Fe(l)&&typeof B=="function"&&(l=B(l._payload));const i=r.Children.toArray(l),p=i.find(Ct);if(p){const m=p.props.children,g=i.map(f=>f===p?r.Children.count(m)>1?r.Children.only(null):r.isValidElement(m)?m.props.children:null:f);return t.jsx(a,{...d,ref:s,children:r.isValidElement(m)?r.cloneElement(m,void 0,g):null})}return t.jsx(a,{...d,ref:s,children:l})});return n.displayName=`${e}.Slot`,n}var kt=At("Slot");function Dt(e){const a=r.forwardRef((n,o)=>{let{children:s,...l}=n;if(Fe(s)&&typeof B=="function"&&(s=B(s._payload)),r.isValidElement(s)){const d=zt(s),i=Et(l,s.props);return s.type!==r.Fragment&&(i.ref=o?at(o,d):d),r.cloneElement(s,i)}return r.Children.count(s)>1?r.Children.only(null):null});return a.displayName=`${e}.SlotClone`,a}var St=Symbol("radix.slottable");function Ct(e){return r.isValidElement(e)&&typeof e.type=="function"&&"__radixId"in e.type&&e.type.__radixId===St}function Et(e,a){const n={...a};for(const o in a){const s=e[o],l=a[o];/^on[A-Z]/.test(o)?s&&l?n[o]=(...i)=>{const p=l(...i);return s(...i),p}:s&&(n[o]=s):o==="style"?n[o]={...s,...l}:o==="className"&&(n[o]=[s,l].filter(Boolean).join(" "))}return{...e,...n}}function zt(e){var o,s;let a=(o=Object.getOwnPropertyDescriptor(e.props,"ref"))==null?void 0:o.get,n=a&&"isReactWarning"in a&&a.isReactWarning;return n?e.ref:(a=(s=Object.getOwnPropertyDescriptor(e,"ref"))==null?void 0:s.get,n=a&&"isReactWarning"in a&&a.isReactWarning,n?e.props.ref:e.props.ref||e.ref)}const K=st("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",{variants:{variant:{default:"bg-primary text-primary-foreground hover:bg-primary/90",destructive:"bg-destructive text-destructive-foreground hover:bg-destructive/90",outline:"border border-input bg-background hover:bg-accent hover:text-accent-foreground",secondary:"bg-secondary text-secondary-foreground hover:bg-secondary/80",ghost:"hover:bg-accent hover:text-accent-foreground",link:"text-primary underline-offset-4 hover:underline"},size:{default:"h-10 px-4 py-2",sm:"h-9 rounded-md px-3",lg:"h-11 rounded-md px-8",icon:"h-10 w-10"}},defaultVariants:{variant:"default",size:"default"}}),Pt=r.forwardRef(({className:e,variant:a,size:n,asChild:o=!1,...s},l)=>{const d=o?kt:"button";return t.jsx(d,{className:$(K({variant:a,size:n,className:e})),ref:l,...s})});Pt.displayName="Button";const Be=vt,Zt=jt,Rt=Nt,Ie=r.forwardRef(({className:e,...a},n)=>t.jsx(Ee,{className:$("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",e),...a,ref:n}));Ie.displayName=Ee.displayName;const Z=r.forwardRef(({className:e,...a},n)=>t.jsxs(Rt,{children:[t.jsx(Ie,{}),t.jsx(ze,{ref:n,className:$("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",e),...a})]}));Z.displayName=ze.displayName;const X=({className:e,...a})=>t.jsx("div",{className:$("flex flex-col space-y-2 text-center sm:text-left",e),...a});X.displayName="AlertDialogHeader";const J=({className:e,...a})=>t.jsx("div",{className:$("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",e),...a});J.displayName="AlertDialogFooter";const Q=r.forwardRef(({className:e,...a},n)=>t.jsx(Te,{ref:n,className:$("text-lg font-semibold",e),...a}));Q.displayName=Te.displayName;const ee=r.forwardRef(({className:e,...a},n)=>t.jsx(Le,{ref:n,className:$("text-sm text-muted-foreground",e),...a}));ee.displayName=Le.displayName;const te=r.forwardRef(({className:e,...a},n)=>t.jsx(Pe,{ref:n,className:$(K(),e),...a}));te.displayName=Pe.displayName;const ae=r.forwardRef(({className:e,...a},n)=>t.jsx(Re,{ref:n,className:$(K({variant:"outline"}),"mt-2 sm:mt-0",e),...a}));ae.displayName=Re.displayName;const H=e=>new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0}).format(e)+" ₽",Xt=e=>new Date(e).toLocaleString("ru-RU",{day:"numeric",month:"numeric",year:"numeric",hour:"2-digit",minute:"2-digit"}),Jt=e=>e?"Да":"Нет",Qt=e=>e&&e.charAt(0).toUpperCase()+e.slice(1),W="fixkey_pending_invoice_pay";let V=null;const Tt=()=>(V||(V=k.payConfig().then(e=>e.online).catch(()=>!1)),V);function Lt(e){const[a,n]=r.useState(null);return r.useEffect(()=>{const o=new URLSearchParams(window.location.search),s=Number(o.get("paid_invoice")||0),l=Number(sessionStorage.getItem(W)||0),d=s||l;if(!d)return;if(sessionStorage.removeItem(W),s){o.delete("paid_invoice");const m=o.toString();window.history.replaceState(null,"",window.location.pathname+(m?`?${m}`:""))}let i=0;const p=async()=>{i+=1;try{const m=await k.payCheck(d);if(m.invoice_status==="paid"){n({ok:!0,text:"Оплата получена — спасибо! Счёт отмечен оплаченным."}),e(),window.dispatchEvent(new Event("invoice-paid"));return}if(m.payment==="canceled"){n({ok:!1,text:"Платёж отменён. Можно попробовать оплатить ещё раз."});return}}catch{}i<6?setTimeout(p,3e3):n({ok:!1,text:"Платёж ещё обрабатывается. Статус счёта обновится автоматически."})};p()},[]),{message:a,clear:()=>n(null)}}function Ft({message:e,onClose:a}){return e?t.jsxs("div",{className:`mb-4 flex items-start gap-3 rounded-xl border p-4 text-sm ${e.ok?"border-emerald-500/30 bg-emerald-500/10":"border-[#D4AF37]/30 bg-[#D4AF37]/10"}`,children:[t.jsx(u,{name:e.ok?"BadgeCheck":"Clock",size:20,className:e.ok?"text-emerald-400":"text-[#D4AF37]"}),t.jsx("p",{className:"flex-1",children:e.text}),t.jsx("button",{onClick:a,className:"text-white/40 hover:text-white","aria-label":"Закрыть",children:t.jsx(u,{name:"X",size:16})})]}):null}function Bt({invoiceId:e,amountLabel:a,className:n=""}){const[o,s]=r.useState(!1),[l,d]=r.useState(!1),[i,p]=r.useState(""),[m,g]=r.useState(!1),[f,w]=r.useState(""),[c,x]=r.useState(null),[h,y]=r.useState(!1);if(r.useEffect(()=>{Tt().then(s)},[]),r.useEffect(()=>{o&&k.payPreview(e).then(v=>x(v.receipts&&v.items.length?v.items:null)).catch(()=>null)},[o,e]),!o)return null;const j=async()=>{d(!0),p("");try{const v=new URL(window.location.href);v.searchParams.set("paid_invoice",String(e));const{confirmation_url:N}=await k.pay(e,v.toString(),m?f.trim():void 0);sessionStorage.setItem(W,String(e)),window.location.href=N}catch(v){const N=v instanceof Error?v.message:"Не удалось перейти к оплате";N.includes("почту для электронного чека")?(g(!0),m&&p("Проверьте адрес почты")):p(N),d(!1)}};return t.jsxs("div",{className:`flex flex-col gap-1 ${n}`,children:[t.jsxs("button",{onClick:j,disabled:l,className:"flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-600 disabled:opacity-60",children:[t.jsx(u,{name:l?"Loader2":"CreditCard",size:14,className:l?"animate-spin":""}),"Оплатить онлайн",a?` ${a}`:""]}),c&&t.jsxs("div",{className:"mt-1",children:[t.jsxs("button",{type:"button",onClick:()=>y(v=>!v),className:"flex items-center gap-1 text-xs text-white/50 hover:text-white",children:[t.jsx(u,{name:"ReceiptText",size:12}),"Что будет в чеке (",c.length," поз.)",t.jsx(u,{name:h?"ChevronUp":"ChevronDown",size:12})]}),h&&t.jsxs("div",{className:"mt-2 max-h-72 overflow-y-auto rounded-lg border border-white/10 bg-[#161616] p-3",children:[t.jsx(nt,{items:c,compact:!0}),t.jsx("p",{className:"mt-2 text-[11px] text-white/40",children:"Электронный чек с этим перечнем придёт на почту после оплаты. На странице ЮKassa показывается только итоговая сумма."})]})]}),m&&t.jsxs("div",{className:"flex flex-col gap-1 mt-1",children:[t.jsx("p",{className:"text-xs text-white/50",children:"Куда прислать электронный чек?"}),t.jsxs("div",{className:"flex gap-1",children:[t.jsx("input",{type:"email",value:f,onChange:v=>w(v.target.value),placeholder:"you@mail.ru",className:"min-w-0 flex-1 rounded-lg border border-white/10 bg-[#161616] px-2.5 py-1.5 text-sm outline-none focus:border-emerald-500/60"}),t.jsx("button",{onClick:j,disabled:l||!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.trim()),className:"rounded-lg bg-emerald-500 px-3 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50",children:"Далее"})]})]}),i&&t.jsx("p",{className:"text-xs text-red-400",children:i})]})}const ie={issued:{label:"Выставлен",clientLabel:"Ожидает оплаты",cls:"bg-white/10 text-white/50"},sent:{label:"Отправлен",clientLabel:"Ожидает оплаты",cls:"bg-blue-500/20 text-blue-300"},paid:{label:"Оплачен",clientLabel:"Оплачен",cls:"bg-green-500/20 text-green-300"}},re=e=>new Date(String(e).slice(0,10)).toLocaleDateString("ru-RU"),It=e=>e.status!=="paid"&&!!e.due_date&&new Date(String(e.due_date).slice(0,10))<new Date(new Date().toDateString());async function Ot(e){const a=await k.get(e);await I(xe(a),`Счёт ${a.invoice_number}`)}function ea({objectId:e,isClient:a=!1}){const[n,o]=r.useState([]),[s,l]=r.useState(!0),[d,i]=r.useState(null),p=()=>k.list({object_id:e}).then(c=>o(c.invoices)).catch(()=>o([])).finally(()=>l(!1));r.useEffect(()=>{p()},[e]);const m=Lt(()=>p()),g=async c=>{i(c);try{await Ot(c)}finally{i(null)}},f=n.filter(c=>c.status==="paid").reduce((c,x)=>c+Number(x.total_amount||0),0),w=n.reduce((c,x)=>c+Number(x.total_amount||0),0);return a&&!s&&n.length===0?null:t.jsxs(t.Fragment,{children:[t.jsx("div",{className:"mt-6",children:t.jsx(Ft,{message:m.message,onClose:m.clear})}),t.jsxs("div",{className:"mb-2 flex items-center justify-between",children:[t.jsx("p",{className:"text-xs uppercase tracking-wide text-white/40",children:"Счета на оплату"}),!a&&t.jsxs(S,{to:`/cabinet/objects/${e}/invoices/new`,className:"flex items-center gap-1 text-xs text-[#D4AF37] transition-colors hover:text-[#B8860B]",children:[t.jsx(u,{name:"Plus",size:13}),"Выставить счёт"]})]}),s?t.jsx("div",{className:"flex justify-center py-6",children:t.jsx(u,{name:"Loader2",size:20,className:"animate-spin text-white/40"})}):n.length===0?t.jsx("div",{className:"py-6 text-center text-sm text-white/30",children:"Счетов пока нет"}):t.jsxs("div",{className:"flex flex-col gap-2",children:[n.map(c=>{const x=ie[c.status]||ie.issued,h=[c.contract_number&&`Договор № ${c.contract_number}`,c.act_number&&`Акт № ${c.act_number}`].filter(Boolean).join(" · ")||"Без основания",y=t.jsxs(t.Fragment,{children:[t.jsxs("div",{className:"mb-1 flex items-center justify-between gap-2",children:[t.jsxs("p",{className:"text-sm font-medium",children:["Счёт № ",c.invoice_number," ",t.jsxs("span",{className:"text-white/40",children:["от ",re(c.invoice_date)]})]}),t.jsxs("div",{className:"flex flex-wrap items-center justify-end gap-1",children:[t.jsx("span",{className:$("rounded-full px-2 py-0.5 text-xs",x.cls),children:a?x.clientLabel:x.label}),c.status==="paid"&&c.paid_online&&t.jsx("span",{className:"rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-300",children:"онлайн"}),c.status==="paid"&&c.paid_source==="bank"&&t.jsx("span",{className:"rounded-full bg-[#FFDD2D]/15 px-2 py-0.5 text-xs text-[#FFDD2D]",children:"по выписке"}),It(c)&&t.jsx("span",{className:"rounded-full bg-red-500/20 px-2 py-0.5 text-xs text-red-300",children:"просрочен"})]})]}),t.jsx("p",{className:"text-lg font-semibold",children:H(Number(c.total_amount))}),t.jsxs("p",{className:"text-xs text-white/40",children:[h,c.due_date&&c.status!=="paid"?` · оплатить до ${re(c.due_date)}`:""]})]});return a?t.jsxs("div",{className:"rounded-lg border border-white/10 bg-[#161616] p-4",children:[y,t.jsxs("div",{className:"mt-3 flex flex-wrap items-start gap-2",children:[c.status!=="paid"&&t.jsx(Bt,{invoiceId:c.id}),t.jsxs("button",{onClick:()=>g(c.id),disabled:d===c.id,className:"flex items-center gap-1.5 rounded-lg bg-[#D4AF37] px-3 py-2 text-sm font-medium text-[#161616] transition-colors hover:bg-[#B8860B] disabled:opacity-60",children:[t.jsx(u,{name:d===c.id?"Loader2":"Download",size:14,className:d===c.id?"animate-spin":""}),"Скачать PDF"]})]})]},c.id):t.jsx(S,{to:`/cabinet/objects/${e}/invoices/${c.id}`,className:"block rounded-lg border border-white/10 bg-[#161616] p-4 transition-colors hover:border-[#D4AF37]/40",children:y},c.id)}),t.jsxs("p",{className:"pt-1 text-right text-xs text-white/40",children:["Оплачено ",H(f)," из ",H(w)]})]})]})}const P=(e,a=0)=>{const n=typeof e=="string"?parseFloat(e):Number(e);return Number.isFinite(n)?n:a},z=e=>new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0}).format(P(e))+" ₽",le=e=>new Date(e).toLocaleDateString("ru-RU",{day:"numeric",month:"long",year:"numeric"});function ce(e){return(e||"").replace(/\s+/g,"").replace(/(\d{4})(?=\d)/g,"$1 ")}function _(e,a,n=""){return a?`<tr class="${n.includes("hl")?"hl":""}"><td class="rk">${e}</td><td class="rv${n.includes("acc")?" acc":""}">${b(a)}</td></tr>`:""}function se(e,a,n){const o=(e.items||[]).filter(x=>!x.status||x.status==="approved"),s=new Map;o.forEach(x=>{const h=x.room_name||"Без помещения";s.has(h)||s.set(h,[]),s.get(h).push(x)});const l=P(e.subtotal_amount??e.total_amount),d=P(e.discount_amount??0),i=Array.from(s.entries()).map(([x,h])=>{const y=new Map;h.forEach(N=>{const A=N.category||"Прочие работы";y.has(A)||y.set(A,[]),y.get(A).push(N)});const j=h.reduce((N,A)=>N+P(A.amount),0),v=Array.from(y.entries()).map(([N,A])=>{const D=A.reduce((E,M)=>E+P(M.amount),0),O=A.map((E,M)=>`
            <tr>
              <td class="num">${M+1}</td>
              <td>${b(E.name)}</td>
              <td class="center">${b(E.unit)}</td>
              <td class="center">${P(E.quantity)}</td>
              <td class="center">${P(E.times,1)}</td>
              <td class="right">${z(E.price)}</td>
              <td class="right amount">${z(E.amount)}</td>
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
              <tr class="cat-row"><td colspan="7">${b(N)}</td></tr>
              ${O}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="6" class="right">Итого по категории</td>
                <td class="right amount">${z(D)}</td>
              </tr>
            </tfoot>
          </table>
        </div>`}).join("");return`
      <div class="room-block">
        <h3 class="room-title">${b(x)}</h3>
        ${v}
        <div class="room-total">
          <div>
            <div class="room-total-label">Итоговая сумма по помещению</div>
            <div class="room-total-name">${b(x)}</div>
          </div>
          <div class="room-total-amount">${z(j)}</div>
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
`,m=e.estimate_number||String(e.id),g=!!(e.apply_signature&&e.company_signature_url),f=!!(e.apply_stamp&&e.company_stamp_url),w=`
  <div class="header">
    <div class="brand"><img class="brand-logo" src="${window.location.origin}/logo-print.png" alt="FixKey"/><b class="brand-word">Fix<span>Key</span></b></div>
    <div class="doc-title">
      <h1>Смета № ${b(m)}</h1>
      <p>от ${le(e.created_at)}</p>
    </div>
  </div>

  <div class="doc-subtitle">
    <h2>СМЕТА НА РАБОТЫ</h2>
    <p>Расчёт ремонтно-отделочных работ</p>
    ${e.contract_number?`<p>Приложение к договору № ${b(e.contract_number)}${e.contract_date?` от ${le(e.contract_date)}`:""}</p>`:""}
  </div>

  <hr class="thin" />

  <div class="info-grid">
    <div>
      <div class="label">ID объекта</div>
      <div class="value">${b(a.object_code)}</div>
    </div>
    <div>
      <div class="label">Заказчик</div>
      <div class="value">${b(a.client_name)}</div>
    </div>
    <div>
      <div class="label">Контактный телефон</div>
      <div class="value">${b(a.client_phone||"—")}</div>
    </div>
    <div>
      <div class="label">Характеристики объекта</div>
      <div class="value">${b(a.object_type)} · ${a.area} м²</div>
    </div>
  </div>

  ${i}

  <div class="summary">
    <div class="summary-box">
      ${d>0?`
      <div class="summary-row">
        <span>Сумма до скидки:</span>
        <span>${z(l)}</span>
      </div>
      <div class="summary-row discount">
        <span>Скидка:</span>
        <span>-${z(d)}</span>
      </div>`:""}
      <div class="summary-total">
        <span>ИТОГО К ОПЛАТЕ:</span>
        <span>${z(e.total_amount)}</span>
      </div>
    </div>
  </div>

  ${e.notes?`
  <div class="notes">
    <div class="label">Примечания</div>
    <div>${b(e.notes)}</div>
  </div>`:""}

  <hr class="thin" />

  <div class="parties">
    <div class="party-card">
      <div class="party-head">Исполнитель</div>
      <table class="party-table">
        <tr><td colspan="2" class="party-name">${b(/предприним/i.test(e.company_entity_type||"")&&e.company_contact_full_name?`ИП ${e.company_contact_full_name}`:e.company_name||n)}</td></tr>
        ${e.company_ogrn&&/предприним|юрид/i.test(e.company_entity_type||"")?_(/юрид/i.test(e.company_entity_type||"")?"ОГРН":"ОГРНИП",e.company_ogrn):""}
        ${_("ИНН",e.company_inn)}
        ${/юрид/i.test(e.company_entity_type||"")?_("КПП",e.company_kpp):""}
        ${_("Адрес",e.company_legal_address)}
        ${_("Телефон",e.company_phone)}
        ${_("E-mail",e.company_email)}
        ${_("Сайт",e.company_website)}
        ${e.company_account_number||e.company_bank_name?'<tr><td colspan="2" class="bank-sub">Банковские реквизиты</td></tr>':""}
        ${_("Расчётный счёт",ce(e.company_account_number),"acc hl")}
        ${_("Банк",e.company_bank_name)}
        ${_("БИК",e.company_bik,"acc")}
        ${_("Корр. счёт",ce(e.company_correspondent_account),"acc")}
      </table>
    </div>
    <div class="party-card">
      <div class="party-head">Заказчик</div>
      <table class="party-table">
        <tr><td colspan="2" class="party-name">${b(a.client_name)}</td></tr>
        ${_("Телефон",a.client_phone)}
        ${_("E-mail",a.email||e.email)}
        ${_("Адрес объекта",a.address||e.address)}
      </table>
    </div>
  </div>

  <div class="sign-row">
    <div class="sign-col${f?" with-stamp":""}">
      <div class="label">От имени Исполнителя</div>
      <div class="sign-box">
        ${g?`<img class="sig" src="${b(e.company_signature_url||"")}" crossorigin="anonymous" alt=""/>`:""}
        ${f?`<img class="stamp" src="${b(e.company_stamp_url||"")}" crossorigin="anonymous" alt=""/>`:""}
      </div>
      <div class="who">${b(e.company_contact_full_name||e.company_name||n)}</div>
      <div class="hint">(подпись)</div>
    </div>
    <div class="sign-col">
      <div class="label">От имени Заказчика</div>
      <div class="sign-box"></div>
      <div class="who">${b(a.client_name)}</div>
      <div class="hint">(подпись)</div>
    </div>
  </div>`,c=`Смета № ${b(m)} — ${b(a.client_name)}`;return{styles:p,bodyContent:w,title:c}}function ta(e,a,n){const{styles:o,bodyContent:s,title:l}=se(e,a,n),d=`<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8" />
<title>${l}</title>
<style>${o}</style>
</head>
<body>
<div class="est-root">${s}</div>
</body>
</html>`,i=window.open("","_blank","width=900,height=1000");if(!i)return;i.document.open(),i.document.write(d),i.document.close();let p=!1;const m=()=>{p||(p=!0,i.focus(),i.print())},g=()=>{const f=Array.from(i.document.images).filter(c=>!c.complete);if(!f.length)return setTimeout(m,200);let w=f.length;f.forEach(c=>{const x=()=>{w-=1,w<=0&&setTimeout(m,200)};c.addEventListener("load",x,{once:!0}),c.addEventListener("error",x,{once:!0})}),setTimeout(m,5e3)};i.document.readyState==="complete"?g():i.onload=g}function de(e,a){let n=e;for(;;){const o=a.exec(n);if(!o)return n;const s=n.indexOf("{",o.index);if(s===-1)return n;let l=0,d=-1;for(let i=s;i<n.length;i++)if(n[i]==="{")l++;else if(n[i]==="}"&&(l--,l===0)){d=i;break}if(d===-1)return n;n=n.slice(0,o.index)+n.slice(d+1),a.lastIndex=0}}function Oe(e,a){return de(de(e,/@page\b/g),/@media\s+print\b/g).replace(/(^|\})\s*([^{}@]+)\s*\{/g,(o,s,l)=>{const d=l.split(",").map(i=>{const p=i.trim();return p?p==="*"?`${a}, ${a} *`:/^(html|body)$/i.test(p)||p===".est-root"?a:p.startsWith(".est-root ")?`${a} ${p.slice(10)}`:`${a} ${p}`:""}).filter(Boolean).join(", ");return`${s} ${d} {`})}const Me=`
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
`;function aa(e,a,n,o="est-preview"){const{styles:s,bodyContent:l}=se(e,a,n);return`<style>${Oe(s+Me,`#${o}`)}</style><div id="${o}" class="est-root">${l}</div>`}async function sa(e,a,n){await Ue(e,a,n,"save")}async function na(e,a,n){return await Ue(e,a,n,"base64")||""}async function Ue(e,a,n,o){const{styles:s,bodyContent:l}=se(e,a,n);return ot(d=>{d.id="pdf-scope-estimate",d.className="est-root",d.innerHTML=`<style>${Oe(s+Me,"#pdf-scope-estimate")}</style>${l}`},{filename:`Смета №${e.estimate_number||e.id}.pdf`,mode:o})}function b(e){const a=document.createElement("div");return a.textContent=e??"",a.innerHTML}function He({open:e,onOpenChange:a,onConfirm:n,title:o="Удалить безвозвратно?",description:s="Это действие нельзя отменить. Запись будет удалена навсегда."}){const[l,d]=r.useState(!1),i=async()=>{d(!0);try{await n(),a(!1)}finally{d(!1)}};return t.jsx(Be,{open:e,onOpenChange:a,children:t.jsxs(Z,{className:"bg-[#1f1f1f] border-white/10 text-white",children:[t.jsxs(X,{children:[t.jsxs(Q,{className:"flex items-center gap-2",children:[t.jsx(u,{name:"TriangleAlert",size:18,className:"text-red-400"}),o]}),t.jsx(ee,{className:"text-white/50",children:s})]}),t.jsxs(J,{children:[t.jsx(ae,{disabled:l,className:"bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white",children:"Нет, отменить"}),t.jsx(te,{disabled:l,onClick:p=>{p.preventDefault(),i()},className:"bg-red-500 text-white hover:bg-red-600",children:l?t.jsx(u,{name:"Loader2",size:16,className:"animate-spin"}):"Да, удалить"})]})]})})}const Mt=e=>new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0}).format(Number(e)||0)+" ₽";function Ve({signedAt:e,isSigned:a,docLabel:n,docTitle:o,amountLabel:s,amount:l,onSign:d,onDone:i}){const[p,m]=r.useState(!1),[g,f]=r.useState(!1),[w,c]=r.useState(!1),[x,h]=r.useState("");if(e||a)return t.jsxs("div",{className:"bg-emerald-500/10 border border-emerald-500/30 rounded-xl mb-4 p-3 sm:p-4 flex items-center gap-3 max-w-4xl mx-auto",children:[t.jsx(u,{name:"BadgeCheck",size:22,className:"text-emerald-400 shrink-0"}),t.jsxs("div",{className:"text-sm",children:[t.jsxs("p",{className:"font-medium",children:[n," подписан",n==="Соглашение"?"о":""]}),e&&t.jsx("p",{className:"text-white/50 text-xs",children:new Date(e).toLocaleString("ru-RU",{day:"numeric",month:"long",year:"numeric",hour:"2-digit",minute:"2-digit"})})]})]});const y=async()=>{c(!0),h("");try{await d(),m(!1),i()}catch(j){h(j instanceof Error?j.message:"Не удалось подписать")}finally{c(!1)}};return t.jsxs("div",{className:"bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl mb-4 p-3 sm:p-4 flex flex-col sm:flex-row sm:flex-wrap sm:items-center justify-between gap-3 max-w-4xl mx-auto",children:[t.jsxs("div",{className:"text-sm",children:[t.jsx("p",{className:"font-medium",children:"Ознакомьтесь с документом и подпишите его онлайн"}),t.jsxs("p",{className:"text-white/50 text-xs",children:[s,": ",Mt(l)]}),x&&t.jsx("p",{className:"text-red-400 text-xs mt-1",children:x})]}),t.jsxs("button",{onClick:()=>{f(!1),m(!0)},className:"inline-flex w-full sm:w-auto min-h-[44px] sm:min-h-0 justify-center items-center gap-2 rounded-lg bg-[#D4AF37] hover:bg-[#B8860B] px-4 py-2.5 text-sm font-medium text-[#161616]",children:[t.jsx(u,{name:"PenLine",size:16}),"Подписать"]}),t.jsx(Be,{open:p,onOpenChange:m,children:t.jsxs(Z,{className:"w-[calc(100%-1.5rem)] sm:w-full max-h-[88vh] overflow-y-auto p-4 sm:p-6 rounded-lg",children:[t.jsxs(X,{children:[t.jsxs(Q,{children:["Подписать ",o,"?"]}),t.jsx(ee,{children:"Подписывая, вы соглашаетесь с условиями документа. После подписания его нельзя изменить, подрядчик получит уведомление."})]}),t.jsxs("label",{className:"flex items-start gap-2 text-sm",children:[t.jsx("input",{type:"checkbox",checked:g,onChange:j=>f(j.target.checked),className:"mt-0.5"}),"Я ознакомился с текстом документа и согласен с его условиями"]}),t.jsxs(J,{children:[t.jsx(ae,{disabled:w,className:"min-h-[44px] sm:min-h-0",children:"Отмена"}),t.jsx(te,{onClick:j=>{j.preventDefault(),y()},disabled:w||!g,className:"min-h-[44px] sm:min-h-0",children:w?"Подписываем…":"Подписать"})]})]})})]})}function Ut(){const{id:e,contractId:a,addendumId:n}=Y(),o=q(),{user:s}=fe(),l=(s==null?void 0:s.role)==="client",d=Number(e),[i,p]=r.useState(null),[m,g]=r.useState(!1),[f,w]=r.useState(!1),c=()=>U.get(Number(n)).then(p).catch(()=>o(`/cabinet/objects/${d}`));if(r.useEffect(()=>{c()},[n]),!i)return t.jsx(T,{title:"Дополнительное соглашение",children:t.jsx("div",{className:"flex items-center justify-center py-24",children:t.jsx(u,{name:"Loader2",size:28,className:"animate-spin text-white/40"})})});const x=`Доп. соглашение № ${i.addendum_number}`,h=F(i.content_html||""),y=async()=>{g(!0);try{await I(h,`ДС ${i.addendum_number} к договору ${i.contract_number||""}`.trim())}finally{g(!1)}};return t.jsxs(T,{title:x,subtitle:`к договору № ${i.contract_number||""}`,children:[t.jsxs("div",{className:"flex items-center justify-between mb-4 flex-wrap gap-3",children:[t.jsxs(S,{to:l?`/cabinet/objects/${d}`:`/cabinet/objects/${d}/contracts/${a}`,className:"inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors",children:[t.jsx(u,{name:"ChevronLeft",size:16}),l?"К объекту":"К договору"]}),t.jsxs("div",{className:"grid grid-cols-2 gap-2 w-full sm:flex sm:items-center sm:w-auto",children:[t.jsx("span",{className:`col-span-2 justify-self-start px-2.5 py-1 rounded-full text-xs font-medium ${i.status==="signed"?"bg-green-500/20 text-green-300":"bg-white/10 text-white/50"}`,children:i.status==="signed"?"подписано":"черновик"}),!l&&!i.signed_at&&t.jsxs(t.Fragment,{children:[t.jsxs(S,{to:`/cabinet/objects/${d}/contracts/${a}/addenda/${i.id}/edit`,className:"flex items-center justify-center min-h-[44px] sm:min-h-0 gap-1.5 bg-blue-500 hover:bg-blue-600 transition-colors text-white text-sm px-3 py-2 rounded-lg",children:[t.jsx(u,{name:"Pencil",size:14}),"Редактировать"]}),t.jsxs("button",{onClick:()=>w(!0),title:"Удалить",className:"flex items-center justify-center gap-1.5 text-sm w-full h-11 sm:w-9 sm:h-9 bg-white/5 hover:bg-red-500/20 hover:text-red-300 transition-colors rounded-lg",children:[t.jsx(u,{name:"Trash2",size:15}),t.jsx("span",{className:"sm:hidden",children:"Удалить"})]})]}),t.jsxs("button",{onClick:()=>rt({addendum_number:i.addendum_number,content_html:i.content_html||""}),title:"Печать",className:"flex items-center justify-center gap-1.5 text-sm w-full h-11 sm:w-9 sm:h-9 bg-white/5 hover:bg-white/10 transition-colors rounded-lg",children:[t.jsx(u,{name:"Printer",size:15}),t.jsx("span",{className:"sm:hidden",children:"Печать"})]}),t.jsxs("button",{onClick:y,disabled:m,title:"Скачать PDF",className:"flex items-center justify-center gap-1.5 text-sm w-full h-11 sm:w-9 sm:h-9 bg-white/5 hover:bg-white/10 transition-colors rounded-lg disabled:opacity-60",children:[t.jsx(u,{name:m?"Loader2":"Download",size:15,className:m?"animate-spin":""}),t.jsx("span",{className:"sm:hidden",children:"PDF"})]})]})]}),l?t.jsx(Ve,{signedAt:i.signed_at,isSigned:i.status==="signed",docLabel:"Соглашение",docTitle:`допсоглашение № ${i.addendum_number}`,amountLabel:"Новая цена договора",amount:Number(i.total_amount),onSign:()=>U.sign(i.id),onDone:c}):i.signed_at&&t.jsxs("div",{className:"bg-emerald-500/10 border border-emerald-500/30 rounded-xl mb-4 p-3 sm:p-4 flex items-center gap-3 max-w-4xl mx-auto text-sm",children:[t.jsx(u,{name:"BadgeCheck",size:20,className:"text-emerald-400"}),"Заказчик подписал онлайн ",new Date(i.signed_at).toLocaleString("ru-RU",{day:"numeric",month:"long",hour:"2-digit",minute:"2-digit"})]}),t.jsx("div",{className:"bg-white rounded-xl p-3 sm:p-6 md:p-10 max-w-4xl mx-auto shadow-xl overflow-x-auto",children:t.jsx("div",{dangerouslySetInnerHTML:{__html:h}})}),t.jsx(He,{open:f,onOpenChange:w,onConfirm:async()=>{await U.remove(i.id),o(`/cabinet/objects/${d}/contracts/${a}`)},title:"Удалить соглашение?",description:"Дополнительное соглашение будет удалено безвозвратно."})]})}const oa=Object.freeze(Object.defineProperty({__proto__:null,default:Ut},Symbol.toStringTag,{value:"Module"}));function Ht(){var h;const{actId:e}=Y(),a=q(),{user:n}=fe(),o=(n==null?void 0:n.role)==="client",[s,l]=r.useState(null),[d,i]=r.useState(!0),[p,m]=r.useState(!1),[g,f]=r.useState(!1),w=()=>{e&&L.get(Number(e)).then(l)};r.useEffect(()=>{e&&(i(!0),L.get(Number(e)).then(l).catch(()=>a(o?"/cabinet/objects":"/cabinet/documents")).finally(()=>i(!1)))},[e]);const c=()=>{s&&lt(s)},x=async()=>{if(s){m(!0);try{await I(F(s.content_html),`Акт ${s.act_number}`)}finally{m(!1)}}};return d?t.jsx(T,{title:"Акт",children:t.jsx("div",{className:"flex items-center justify-center py-24",children:t.jsx(u,{name:"Loader2",size:28,className:"animate-spin text-white/40"})})}):s?t.jsxs(T,{title:`Акт выполненных работ № ${s.act_number}`,children:[t.jsxs("div",{className:"flex items-center justify-between mb-4 flex-wrap gap-3",children:[t.jsxs(S,{to:o?`/cabinet/objects/${s.object_id}`:"/cabinet/documents",className:"inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors",children:[t.jsx(u,{name:"ChevronLeft",size:16}),o?"К объекту":"К документам"]}),t.jsxs("div",{className:"grid grid-cols-2 gap-2 w-full sm:flex sm:items-center sm:w-auto",children:[t.jsx("span",{className:$("col-span-2 justify-self-start px-2.5 py-1 rounded-full text-xs font-medium",s.status==="signed"?"bg-green-500/20 text-green-300":"bg-white/10 text-white/50"),children:s.status==="signed"?"подписан":"черновик"}),!o&&t.jsxs(t.Fragment,{children:[!s.signed_at&&t.jsxs(S,{to:`/cabinet/objects/${s.object_id}/acts/${s.id}/edit`,className:"flex items-center justify-center min-h-[44px] sm:min-h-0 gap-1.5 bg-blue-500 hover:bg-blue-600 transition-colors text-white text-sm px-3 py-2 rounded-lg",children:[t.jsx(u,{name:"Pencil",size:14}),"Редактировать"]}),t.jsxs(S,{to:`/cabinet/objects/${s.object_id}/invoices/new?act_id=${s.id}`,className:"flex items-center justify-center min-h-[44px] sm:min-h-0 gap-1.5 bg-white/10 hover:bg-white/15 transition-colors text-white text-sm px-3 py-2 rounded-lg",children:[t.jsx(u,{name:"Receipt",size:14}),"Выставить счёт"]}),t.jsxs("button",{onClick:()=>f(!0),className:"flex items-center justify-center min-h-[44px] sm:min-h-0 gap-1.5 bg-white/10 hover:bg-white/15 transition-colors text-white text-sm px-3 py-2 rounded-lg",children:[t.jsx(u,{name:"Mail",size:14}),"Отправить на почту"]})]}),t.jsxs("button",{onClick:c,title:"Печать",className:"flex items-center justify-center gap-1.5 text-sm w-full h-11 sm:w-9 sm:h-9 bg-white/5 hover:bg-white/10 transition-colors rounded-lg",children:[t.jsx(u,{name:"Printer",size:15}),t.jsx("span",{className:"sm:hidden",children:"Печать"})]}),t.jsxs("button",{onClick:x,disabled:p,title:"Скачать PDF",className:"flex items-center justify-center gap-1.5 text-sm w-full h-11 sm:w-9 sm:h-9 bg-white/5 hover:bg-white/10 transition-colors rounded-lg disabled:opacity-60",children:[p?t.jsx(u,{name:"Loader2",size:15,className:"animate-spin"}):t.jsx(u,{name:"Download",size:15}),t.jsx("span",{className:"sm:hidden",children:"PDF"})]})]})]}),o?t.jsx(Ve,{signedAt:s.signed_at,isSigned:s.status==="signed",docLabel:"Акт",docTitle:`акт № ${s.act_number}`,amountLabel:"Сумма по акту",amount:Number(s.total_amount),onSign:()=>L.sign(s.id),onDone:w}):s.signed_at&&t.jsxs("div",{className:"bg-emerald-500/10 border border-emerald-500/30 rounded-xl mb-4 p-3 sm:p-4 flex items-center gap-3 max-w-4xl mx-auto text-sm",children:[t.jsx(u,{name:"BadgeCheck",size:20,className:"text-emerald-400"}),"Заказчик подписал акт онлайн"," ",new Date(s.signed_at).toLocaleString("ru-RU",{day:"numeric",month:"long",hour:"2-digit",minute:"2-digit"})]}),t.jsx("div",{className:"overflow-x-auto md:overflow-visible max-w-4xl mx-auto",children:t.jsx("div",{className:"bg-white text-[#161616] rounded-xl p-4 sm:p-12 max-w-4xl mx-auto shadow-lg break-words",children:t.jsx("div",{dangerouslySetInnerHTML:{__html:F(s.content_html)}})})}),t.jsx(ge,{open:g,onOpenChange:f,docName:"акт",objectId:s.object_id,fileName:`Акт_${s.act_number}.pdf`,makePdf:()=>he(F(s.content_html),`Акт ${s.act_number}`),send:y=>L.sendEmail(s.id,y),extraFiles:(((h=s.options)==null?void 0:h.attachments)||[]).map(y=>y.name)})]}):null}const ia=Object.freeze(Object.defineProperty({__proto__:null,default:Ht},Symbol.toStringTag,{value:"Module"})),G={issued:{label:"выставлен",cls:"bg-white/10 text-white/60"},sent:{label:"отправлен",cls:"bg-blue-500/20 text-blue-300"},paid:{label:"оплачен",cls:"bg-green-500/20 text-green-300"}};function Vt(){const{id:e,invoiceId:a}=Y(),n=Number(e),o=q(),[s,l]=r.useState(null),[d,i]=r.useState(!0),[p,m]=r.useState(!1),[g,f]=r.useState(!1),[w,c]=r.useState(!1),x=()=>k.get(Number(a)).then(l).catch(()=>o(`/cabinet/objects/${n}`)).finally(()=>i(!1));if(r.useEffect(()=>{x()},[a]),d||!s)return t.jsx(T,{title:"Счёт на оплату",children:t.jsx("div",{className:"flex items-center justify-center py-24",children:t.jsx(u,{name:"Loader2",size:28,className:"animate-spin text-white/40"})})});const h=xe(s),y=`Счёт ${s.invoice_number}`,j=async D=>{const O=await k.update(s.id,{status:D});l({...s,status:D}),it(O.thanks)},v=async()=>{m(!0);try{await I(h,y)}finally{m(!1)}},N=G[s.status]||G.issued,A="flex items-center justify-center gap-1.5 text-sm w-full h-11 sm:w-9 sm:h-9 bg-white/5 hover:bg-white/10 transition-colors rounded-lg disabled:opacity-60";return t.jsxs(T,{title:`Счёт на оплату № ${s.invoice_number}`,subtitle:s.client_name||"",children:[t.jsxs("div",{className:"mb-4 flex flex-wrap items-center justify-between gap-3",children:[t.jsxs(S,{to:`/cabinet/objects/${n}`,className:"inline-flex items-center gap-1.5 text-sm text-white/50 transition-colors hover:text-white",children:[t.jsx(u,{name:"ChevronLeft",size:16}),"К объекту"]}),t.jsxs("div",{className:"grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center",children:[t.jsx("span",{className:$("col-span-2 justify-self-start rounded-full px-2.5 py-1 text-xs font-medium",N.cls),children:N.label}),s.status!=="paid"?t.jsxs("button",{onClick:()=>j("paid"),title:"Заказчику автоматически уйдёт письмо с благодарностью",className:"flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg bg-green-600 sm:min-h-0 px-3 py-2 text-sm text-white transition-colors hover:bg-green-700",children:[t.jsx(u,{name:"BadgeCheck",size:14}),"Отметить оплату"]}):t.jsx("button",{onClick:()=>j("sent"),className:"min-h-[44px] rounded-lg bg-white/5 px-3 py-2 text-sm text-white/60 hover:bg-white/10 sm:min-h-0",children:"Снять отметку оплаты"}),t.jsxs(S,{to:`/cabinet/objects/${n}/invoices/${s.id}/edit`,className:"flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg bg-blue-500 sm:min-h-0 px-3 py-2 text-sm text-white transition-colors hover:bg-blue-600",children:[t.jsx(u,{name:"Pencil",size:14}),"Редактировать"]}),t.jsxs("button",{onClick:()=>f(!0),className:"flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg bg-white/10 sm:min-h-0 px-3 py-2 text-sm text-white transition-colors hover:bg-white/15",children:[t.jsx(u,{name:"Mail",size:14}),"Отправить на почту"]}),t.jsxs("button",{onClick:()=>ct(`Счёт № ${s.invoice_number}`,`${oe("")}${h}`,ne),title:"Печать",className:A,children:[t.jsx(u,{name:"Printer",size:15}),t.jsx("span",{className:"sm:hidden",children:"Печать"})]}),t.jsxs("button",{onClick:v,disabled:p,title:"Скачать PDF",className:A,children:[t.jsx(u,{name:p?"Loader2":"Download",size:15,className:p?"animate-spin":""}),t.jsx("span",{className:"sm:hidden",children:"PDF"})]}),t.jsxs("button",{onClick:()=>c(!0),title:"Удалить",className:$(A,"hover:bg-red-500/20 hover:text-red-300"),children:[t.jsx(u,{name:"Trash2",size:15}),t.jsx("span",{className:"sm:hidden",children:"Удалить"})]})]})]}),t.jsx("div",{className:"mx-auto max-w-4xl overflow-x-auto md:overflow-visible",children:t.jsx("div",{className:"mx-auto max-w-4xl rounded-xl bg-white p-4 text-[#161616] shadow-lg sm:p-12",children:t.jsx("div",{dangerouslySetInnerHTML:{__html:`<style>${ne}</style>${oe("")}${h}`}})})}),t.jsx(ge,{open:g,onOpenChange:D=>{f(D),D||x()},docName:"счёт",objectId:s.object_id,fileName:`Счёт_${s.invoice_number}.pdf`,makePdf:()=>he(h,y),send:D=>k.sendEmail(s.id,D)}),t.jsx(He,{open:w,onOpenChange:c,title:"Удалить счёт?",description:`Счёт № ${s.invoice_number} будет удалён без возможности восстановления.`,onConfirm:async()=>{await k.remove(s.id),o(`/cabinet/objects/${n}`)}})]})}const ra=Object.freeze(Object.defineProperty({__proto__:null,INVOICE_STATUS:G,default:Vt},Symbol.toStringTag,{value:"Module"}));export{Be as A,He as C,Ve as D,Bt as I,ea as O,Ft as P,Zt as a,Z as b,X as c,Q as d,ee as e,J as f,ae as g,te as h,aa as i,na as j,sa as k,Qt as l,H as m,Xt as n,Ot as o,ta as p,oa as q,ia as r,ra as s,Lt as u,Jt as y};
