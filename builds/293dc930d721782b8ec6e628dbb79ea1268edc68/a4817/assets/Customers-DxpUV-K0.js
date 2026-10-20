import{j as e,r,bj as _e,bk as lt,bl as ct,bm as dt,d as Ae,bn as mt,c as xt,bo as pt,b as ut,bp as ht,bq as ft,br as De,bs as gt,bt,a7 as jt,bu as wt,k as _,I as u,Z as C,R as yt,L as k,$ as Se,t as le,v as ce,o as de,a1 as ae,a3 as H,D as Ce,l as ke,m as $e,n as Ee,bg as T,Q as vt,bv as fe,x as Nt}from"./index-zEaWEM-F.js";import{d as K,r as _t,b as W,a as At,c as ze,e as Dt,p as St}from"./RentalContract-BPwXUdpK.js";import{C as P}from"./Company-DrzaXHhL.js";import{S as Pe}from"./MaterialCreate-Coar90i9.js";import{a as ge,d as be,n as Ct}from"./invoiceThanks-DFj1D9Sf.js";var kt=Symbol("radix.slottable");function $t(t){const a=({children:n})=>e.jsx(e.Fragment,{children:n});return a.displayName=`${t}.Slottable`,a.__radixId=kt,a}var Re="AlertDialog",[Et]=xt(Re,[_e]),$=_e(),Le=t=>{const{__scopeAlertDialog:a,...n}=t,i=$(a);return e.jsx(lt,{...i,...n,modal:!0})};Le.displayName=Re;var zt="AlertDialogTrigger",Oe=r.forwardRef((t,a)=>{const{__scopeAlertDialog:n,...i}=t,s=$(n);return e.jsx(ct,{...s,...i,ref:a})});Oe.displayName=zt;var Pt="AlertDialogPortal",Fe=t=>{const{__scopeAlertDialog:a,...n}=t,i=$(a);return e.jsx(dt,{...i,...n})};Fe.displayName=Pt;var Rt="AlertDialogOverlay",Ie=r.forwardRef((t,a)=>{const{__scopeAlertDialog:n,...i}=t,s=$(n);return e.jsx(gt,{...s,...i,ref:a})});Ie.displayName=Rt;var R="AlertDialogContent",[Lt,Ot]=Et(R),Ft=$t("AlertDialogContent"),Te=r.forwardRef((t,a)=>{const{__scopeAlertDialog:n,children:i,...s}=t,l=$(n),o=r.useRef(null),c=Ae(a,o),x=r.useRef(null);return e.jsx(mt,{contentName:R,titleName:Be,docsSlug:"alert-dialog",children:e.jsx(Lt,{scope:n,cancelRef:x,children:e.jsxs(pt,{role:"alertdialog",...l,...s,ref:c,onOpenAutoFocus:ut(s.onOpenAutoFocus,p=>{var h;p.preventDefault(),(h=x.current)==null||h.focus({preventScroll:!0})}),onPointerDownOutside:p=>p.preventDefault(),onInteractOutside:p=>p.preventDefault(),children:[e.jsx(Ft,{children:i}),e.jsx(Tt,{contentRef:o})]})})})});Te.displayName=R;var Be="AlertDialogTitle",Me=r.forwardRef((t,a)=>{const{__scopeAlertDialog:n,...i}=t,s=$(n);return e.jsx(ht,{...s,...i,ref:a})});Me.displayName=Be;var Ue="AlertDialogDescription",He=r.forwardRef((t,a)=>{const{__scopeAlertDialog:n,...i}=t,s=$(n);return e.jsx(ft,{...s,...i,ref:a})});He.displayName=Ue;var It="AlertDialogAction",Ve=r.forwardRef((t,a)=>{const{__scopeAlertDialog:n,...i}=t,s=$(n);return e.jsx(De,{...s,...i,ref:a})});Ve.displayName=It;var We="AlertDialogCancel",qe=r.forwardRef((t,a)=>{const{__scopeAlertDialog:n,...i}=t,{cancelRef:s}=Ot(We,n),l=$(n),o=Ae(a,s);return e.jsx(De,{...l,...i,ref:o})});qe.displayName=We;var Tt=({contentRef:t})=>{const a=`\`${R}\` requires a description for the component to be accessible for screen reader users.

You can add a description to the \`${R}\` by passing a \`${Ue}\` component as a child, which also benefits sighted users by adding visible context to the dialog.

Alternatively, you can use your own component as a description by assigning it an \`id\` and passing the same value to the \`aria-describedby\` prop in \`${R}\`. If the description is confusing or duplicative for sighted users, you can use the \`@radix-ui/react-visually-hidden\` primitive as a wrapper around your description component.

For more information, see https://radix-ui.com/primitives/docs/components/alert-dialog`;return r.useEffect(()=>{var i;document.getElementById((i=t.current)==null?void 0:i.getAttribute("aria-describedby"))||console.warn(a)},[a,t]),null},Bt=Le,Mt=Oe,Ut=Fe,Ke=Ie,Ye=Te,Ge=Ve,Ze=qe,Qe=Me,Xe=He,Ht=Symbol.for("react.lazy"),q=bt[" use ".trim().toString()];function Vt(t){return typeof t=="object"&&t!==null&&"then"in t}function Je(t){return t!=null&&typeof t=="object"&&"$$typeof"in t&&t.$$typeof===Ht&&"_payload"in t&&Vt(t._payload)}function Wt(t){const a=Kt(t),n=r.forwardRef((i,s)=>{let{children:l,...o}=i;Je(l)&&typeof q=="function"&&(l=q(l._payload));const c=r.Children.toArray(l),x=c.find(Gt);if(x){const p=x.props.children,h=c.map(b=>b===x?r.Children.count(p)>1?r.Children.only(null):r.isValidElement(p)?p.props.children:null:b);return e.jsx(a,{...o,ref:s,children:r.isValidElement(p)?r.cloneElement(p,void 0,h):null})}return e.jsx(a,{...o,ref:s,children:l})});return n.displayName=`${t}.Slot`,n}var qt=Wt("Slot");function Kt(t){const a=r.forwardRef((n,i)=>{let{children:s,...l}=n;if(Je(s)&&typeof q=="function"&&(s=q(s._payload)),r.isValidElement(s)){const o=Qt(s),c=Zt(l,s.props);return s.type!==r.Fragment&&(c.ref=i?jt(i,o):o),r.cloneElement(s,c)}return r.Children.count(s)>1?r.Children.only(null):null});return a.displayName=`${t}.SlotClone`,a}var Yt=Symbol("radix.slottable");function Gt(t){return r.isValidElement(t)&&typeof t.type=="function"&&"__radixId"in t.type&&t.type.__radixId===Yt}function Zt(t,a){const n={...a};for(const i in a){const s=t[i],l=a[i];/^on[A-Z]/.test(i)?s&&l?n[i]=(...c)=>{const x=l(...c);return s(...c),x}:s&&(n[i]=s):i==="style"?n[i]={...s,...l}:i==="className"&&(n[i]=[s,l].filter(Boolean).join(" "))}return{...t,...n}}function Qt(t){var i,s;let a=(i=Object.getOwnPropertyDescriptor(t.props,"ref"))==null?void 0:i.get,n=a&&"isReactWarning"in a&&a.isReactWarning;return n?t.ref:(a=(s=Object.getOwnPropertyDescriptor(t,"ref"))==null?void 0:s.get,n=a&&"isReactWarning"in a&&a.isReactWarning,n?t.props.ref:t.props.ref||t.ref)}const me=wt("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",{variants:{variant:{default:"bg-primary text-primary-foreground hover:bg-primary/90",destructive:"bg-destructive text-destructive-foreground hover:bg-destructive/90",outline:"border border-input bg-background hover:bg-accent hover:text-accent-foreground",secondary:"bg-secondary text-secondary-foreground hover:bg-secondary/80",ghost:"hover:bg-accent hover:text-accent-foreground",link:"text-primary underline-offset-4 hover:underline"},size:{default:"h-10 px-4 py-2",sm:"h-9 rounded-md px-3",lg:"h-11 rounded-md px-8",icon:"h-10 w-10"}},defaultVariants:{variant:"default",size:"default"}}),Xt=r.forwardRef(({className:t,variant:a,size:n,asChild:i=!1,...s},l)=>{const o=i?qt:"button";return e.jsx(o,{className:_(me({variant:a,size:n,className:t})),ref:l,...s})});Xt.displayName="Button";const xe=Bt,vs=Mt,Jt=Ut,et=r.forwardRef(({className:t,...a},n)=>e.jsx(Ke,{className:_("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",t),...a,ref:n}));et.displayName=Ke.displayName;const Y=r.forwardRef(({className:t,...a},n)=>e.jsxs(Jt,{children:[e.jsx(et,{}),e.jsx(Ye,{ref:n,className:_("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",t),...a})]}));Y.displayName=Ye.displayName;const G=({className:t,...a})=>e.jsx("div",{className:_("flex flex-col space-y-2 text-center sm:text-left",t),...a});G.displayName="AlertDialogHeader";const Z=({className:t,...a})=>e.jsx("div",{className:_("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",t),...a});Z.displayName="AlertDialogFooter";const Q=r.forwardRef(({className:t,...a},n)=>e.jsx(Qe,{ref:n,className:_("text-lg font-semibold",t),...a}));Q.displayName=Qe.displayName;const X=r.forwardRef(({className:t,...a},n)=>e.jsx(Xe,{ref:n,className:_("text-sm text-muted-foreground",t),...a}));X.displayName=Xe.displayName;const J=r.forwardRef(({className:t,...a},n)=>e.jsx(Ge,{ref:n,className:_(me(),t),...a}));J.displayName=Ge.displayName;const ee=r.forwardRef(({className:t,...a},n)=>e.jsx(Ze,{ref:n,className:_(me({variant:"outline"}),"mt-2 sm:mt-0",t),...a}));ee.displayName=Ze.displayName;function je({onConfirm:t,title:a="Удалить безвозвратно?",description:n="Это действие нельзя отменить. Запись будет удалена навсегда.",className:i,size:s=15,label:l,disabled:o,iconName:c="Trash2"}){const[x,p]=r.useState(!1),[h,b]=r.useState(!1),f=async()=>{b(!0);try{await t(),p(!1)}finally{b(!1)}};return e.jsxs(e.Fragment,{children:[e.jsxs("button",{type:"button",disabled:o,onClick:d=>{d.stopPropagation(),p(!0)},title:l||"Удалить",className:_("text-white/40 hover:text-red-400 transition-colors disabled:opacity-40",l&&"flex items-center gap-2",i),children:[e.jsx(u,{name:c,size:s,fallback:"Trash2"}),l]}),e.jsx(xe,{open:x,onOpenChange:p,children:e.jsxs(Y,{className:"bg-[#1f1f1f] border-white/10 text-white",children:[e.jsxs(G,{children:[e.jsxs(Q,{className:"flex items-center gap-2",children:[e.jsx(u,{name:"TriangleAlert",size:18,className:"text-red-400"}),a]}),e.jsx(X,{className:"text-white/50",children:n})]}),e.jsxs(Z,{children:[e.jsx(ee,{disabled:h,className:"bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white",children:"Нет, отменить"}),e.jsx(J,{disabled:h,onClick:d=>{d.preventDefault(),f()},className:"bg-red-500 text-white hover:bg-red-600",children:h?e.jsx(u,{name:"Loader2",size:16,className:"animate-spin"}):"Да, удалить"})]})]})})]})}const ne=t=>new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0}).format(t)+" ₽",Ns=t=>new Date(t).toLocaleString("ru-RU",{day:"numeric",month:"numeric",year:"numeric",hour:"2-digit",minute:"2-digit"}),_s=t=>t?"Да":"Нет",As=t=>t&&t.charAt(0).toUpperCase()+t.slice(1),re="fixkey_pending_invoice_pay";let ie=null;const es=()=>(ie||(ie=C.payConfig().then(t=>t.online).catch(()=>!1)),ie);function ts(t){const[a,n]=r.useState(null);return r.useEffect(()=>{const i=new URLSearchParams(window.location.search),s=Number(i.get("paid_invoice")||0),l=Number(sessionStorage.getItem(re)||0),o=s||l;if(!o)return;if(sessionStorage.removeItem(re),s){i.delete("paid_invoice");const p=i.toString();window.history.replaceState(null,"",window.location.pathname+(p?`?${p}`:""))}let c=0;const x=async()=>{c+=1;try{const p=await C.payCheck(o);if(p.invoice_status==="paid"){n({ok:!0,text:"Оплата получена — спасибо! Счёт отмечен оплаченным."}),t(),window.dispatchEvent(new Event("invoice-paid"));return}if(p.payment==="canceled"){n({ok:!1,text:"Платёж отменён. Можно попробовать оплатить ещё раз."});return}}catch{}c<6?setTimeout(x,3e3):n({ok:!1,text:"Платёж ещё обрабатывается. Статус счёта обновится автоматически."})};x()},[]),{message:a,clear:()=>n(null)}}function ss({message:t,onClose:a}){return t?e.jsxs("div",{className:`mb-4 flex items-start gap-3 rounded-xl border p-4 text-sm ${t.ok?"border-emerald-500/30 bg-emerald-500/10":"border-[#D4AF37]/30 bg-[#D4AF37]/10"}`,children:[e.jsx(u,{name:t.ok?"BadgeCheck":"Clock",size:20,className:t.ok?"text-emerald-400":"text-[#D4AF37]"}),e.jsx("p",{className:"flex-1",children:t.text}),e.jsx("button",{onClick:a,className:"text-white/40 hover:text-white","aria-label":"Закрыть",children:e.jsx(u,{name:"X",size:16})})]}):null}function as({invoiceId:t,amountLabel:a,className:n=""}){const[i,s]=r.useState(!1),[l,o]=r.useState(!1),[c,x]=r.useState(""),[p,h]=r.useState(!1),[b,f]=r.useState(""),[d,j]=r.useState(null),[g,w]=r.useState(!1);if(r.useEffect(()=>{es().then(s)},[]),r.useEffect(()=>{i&&C.payPreview(t).then(y=>j(y.receipts&&y.items.length?y.items:null)).catch(()=>null)},[i,t]),!i)return null;const v=async()=>{o(!0),x("");try{const y=new URL(window.location.href);y.searchParams.set("paid_invoice",String(t));const{confirmation_url:D}=await C.pay(t,y.toString(),p?b.trim():void 0);sessionStorage.setItem(re,String(t)),window.location.href=D}catch(y){const D=y instanceof Error?y.message:"Не удалось перейти к оплате";D.includes("почту для электронного чека")?(h(!0),p&&x("Проверьте адрес почты")):x(D),o(!1)}};return e.jsxs("div",{className:`flex flex-col gap-1 ${n}`,children:[e.jsxs("button",{onClick:v,disabled:l,className:"flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-600 disabled:opacity-60",children:[e.jsx(u,{name:l?"Loader2":"CreditCard",size:14,className:l?"animate-spin":""}),"Оплатить онлайн",a?` ${a}`:""]}),d&&e.jsxs("div",{className:"mt-1",children:[e.jsxs("button",{type:"button",onClick:()=>w(y=>!y),className:"flex items-center gap-1 text-xs text-white/50 hover:text-white",children:[e.jsx(u,{name:"ReceiptText",size:12}),"Что будет в чеке (",d.length," поз.)",e.jsx(u,{name:g?"ChevronUp":"ChevronDown",size:12})]}),g&&e.jsxs("div",{className:"mt-2 max-h-72 overflow-y-auto rounded-lg border border-white/10 bg-[#161616] p-3",children:[e.jsx(yt,{items:d,compact:!0}),e.jsx("p",{className:"mt-2 text-[11px] text-white/40",children:"Электронный чек с этим перечнем придёт на почту после оплаты. На странице ЮKassa показывается только итоговая сумма."})]})]}),p&&e.jsxs("div",{className:"flex flex-col gap-1 mt-1",children:[e.jsx("p",{className:"text-xs text-white/50",children:"Куда прислать электронный чек?"}),e.jsxs("div",{className:"flex gap-1",children:[e.jsx("input",{type:"email",value:b,onChange:y=>f(y.target.value),placeholder:"you@mail.ru",className:"min-w-0 flex-1 rounded-lg border border-white/10 bg-[#161616] px-2.5 py-1.5 text-sm outline-none focus:border-emerald-500/60"}),e.jsx("button",{onClick:v,disabled:l||!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(b.trim()),className:"rounded-lg bg-emerald-500 px-3 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50",children:"Далее"})]})]}),c&&e.jsx("p",{className:"text-xs text-red-400",children:c})]})}const we={issued:{label:"Выставлен",clientLabel:"Ожидает оплаты",cls:"bg-white/10 text-white/50"},sent:{label:"Отправлен",clientLabel:"Ожидает оплаты",cls:"bg-blue-500/20 text-blue-300"},paid:{label:"Оплачен",clientLabel:"Оплачен",cls:"bg-green-500/20 text-green-300"}},ye=t=>new Date(String(t).slice(0,10)).toLocaleDateString("ru-RU"),ns=t=>t.status!=="paid"&&!!t.due_date&&new Date(String(t.due_date).slice(0,10))<new Date(new Date().toDateString());async function is(t){const a=await C.get(t);await K(Se(a),`Счёт ${a.invoice_number}`)}function Ds({objectId:t,isClient:a=!1}){const[n,i]=r.useState([]),[s,l]=r.useState(!0),[o,c]=r.useState(null),x=()=>C.list({object_id:t}).then(d=>i(d.invoices)).catch(()=>i([])).finally(()=>l(!1));r.useEffect(()=>{x()},[t]);const p=ts(()=>x()),h=async d=>{c(d);try{await is(d)}finally{c(null)}},b=n.filter(d=>d.status==="paid").reduce((d,j)=>d+Number(j.total_amount||0),0),f=n.reduce((d,j)=>d+Number(j.total_amount||0),0);return a&&!s&&n.length===0?null:e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"mt-6",children:e.jsx(ss,{message:p.message,onClose:p.clear})}),e.jsxs("div",{className:"mb-2 flex items-center justify-between",children:[e.jsx("p",{className:"text-xs uppercase tracking-wide text-white/40",children:"Счета на оплату"}),!a&&e.jsxs(k,{to:`/cabinet/objects/${t}/invoices/new`,className:"flex items-center gap-1 text-xs text-[#D4AF37] transition-colors hover:text-[#B8860B]",children:[e.jsx(u,{name:"Plus",size:13}),"Выставить счёт"]})]}),s?e.jsx("div",{className:"flex justify-center py-6",children:e.jsx(u,{name:"Loader2",size:20,className:"animate-spin text-white/40"})}):n.length===0?e.jsx("div",{className:"py-6 text-center text-sm text-white/30",children:"Счетов пока нет"}):e.jsxs("div",{className:"flex flex-col gap-2",children:[n.map(d=>{const j=we[d.status]||we.issued,g=[d.contract_number&&`Договор № ${d.contract_number}`,d.act_number&&`Акт № ${d.act_number}`].filter(Boolean).join(" · ")||"Без основания",w=e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"mb-1 flex items-center justify-between gap-2",children:[e.jsxs("p",{className:"text-sm font-medium",children:["Счёт № ",d.invoice_number," ",e.jsxs("span",{className:"text-white/40",children:["от ",ye(d.invoice_date)]})]}),e.jsxs("div",{className:"flex flex-wrap items-center justify-end gap-1",children:[e.jsx("span",{className:_("rounded-full px-2 py-0.5 text-xs",j.cls),children:a?j.clientLabel:j.label}),d.status==="paid"&&d.paid_online&&e.jsx("span",{className:"rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-300",children:"онлайн"}),d.status==="paid"&&d.paid_source==="bank"&&e.jsx("span",{className:"rounded-full bg-[#FFDD2D]/15 px-2 py-0.5 text-xs text-[#FFDD2D]",children:"по выписке"}),ns(d)&&e.jsx("span",{className:"rounded-full bg-red-500/20 px-2 py-0.5 text-xs text-red-300",children:"просрочен"})]})]}),e.jsx("p",{className:"text-lg font-semibold",children:ne(Number(d.total_amount))}),e.jsxs("p",{className:"text-xs text-white/40",children:[g,d.due_date&&d.status!=="paid"?` · оплатить до ${ye(d.due_date)}`:""]})]});return a?e.jsxs("div",{className:"rounded-lg border border-white/10 bg-[#161616] p-4",children:[w,e.jsxs("div",{className:"mt-3 flex flex-wrap items-start gap-2",children:[d.status!=="paid"&&e.jsx(as,{invoiceId:d.id}),e.jsxs("button",{onClick:()=>h(d.id),disabled:o===d.id,className:"flex items-center gap-1.5 rounded-lg bg-[#D4AF37] px-3 py-2 text-sm font-medium text-[#161616] transition-colors hover:bg-[#B8860B] disabled:opacity-60",children:[e.jsx(u,{name:o===d.id?"Loader2":"Download",size:14,className:o===d.id?"animate-spin":""}),"Скачать PDF"]})]})]},d.id):e.jsx(k,{to:`/cabinet/objects/${t}/invoices/${d.id}`,className:"block rounded-lg border border-white/10 bg-[#161616] p-4 transition-colors hover:border-[#D4AF37]/40",children:w},d.id)}),e.jsxs("p",{className:"pt-1 text-right text-xs text-white/40",children:["Оплачено ",ne(b)," из ",ne(f)]})]})]})}const ve=t=>String(t??"").replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\r?\n/g," "),L=(t,a=0)=>{const n=typeof t=="string"?parseFloat(t):Number(t);return Number.isFinite(n)?n:a},V=t=>new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0}).format(L(t))+" ₽";function N(t){const a=document.createElement("div");return a.textContent=t??"",a.innerHTML}function rs(t,a){const n=new Map;return t.forEach(i=>{const s=a.find(c=>c.id===i.material_id),l=i.shop_name||(s==null?void 0:s.shop_name)||"Магазин не указан";n.has(l)||n.set(l,{name:l,address:"",phone:"",items:[],sum:0});const o=n.get(l);!o.address&&(s!=null&&s.shop_address)&&(o.address=s.shop_address),!o.phone&&(s!=null&&s.shop_phone)&&(o.phone=s.shop_phone),o.items.push(i),o.sum+=L(i.qty)*L(i.price)}),Array.from(n.values()).sort((i,s)=>s.sum-i.sum)}function tt(t,a,n,i,s="Смета на материал"){const l=rs(a,n),o=l.reduce((d,j)=>d+j.sum,0),c=Array.from(new Set(a.map(d=>d.room_name).filter(Boolean))),x=c.length?c.join(", "):"Без помещения",p=l.map(d=>{const j=d.items.map((w,v)=>`
            <tr>
              <td class="num">${v+1}</td>
              <td>${N(w.name)}</td>
              <td>${N(w.room_name||"—")}</td>
              <td class="center">${L(w.qty)}</td>
              <td class="center">${N(w.unit)}</td>
              <td class="right">${V(w.price)}</td>
              <td class="right amount">${V(L(w.qty)*L(w.price))}</td>
            </tr>`).join(""),g=d.address?`Адрес: ${N(d.address)}`:"";return`
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
              <tr class="cat-row"><td colspan="7">${N(d.name)}${g?` — ${g}`:""}</td></tr>
              ${j}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="6" class="right">Итого по магазину</td>
                <td class="right amount">${V(d.sum)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>`}).join(""),h=`
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
      content: "${ve(`Материалы · объект ${t.object_code||""}`.trim())}";
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 8.5pt;
      color: #6B4508;
    }
    @top-right {
      content: "${ve(t.client_name||i)}";
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
`,b=`
  <div class="header">
    <div class="brand"><img class="brand-logo" src="${window.location.origin}/logo-print.png" alt="FixKey"/><b class="brand-word">Fix<span>Key</span></b></div>
    <div class="doc-title">
      <h1>${N(s)}</h1>
      <p>Объект № ${N(t.object_code)}</p>
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
      <div class="value">${N(t.object_code)}</div>
    </div>
    <div>
      <div class="label">Заказчик</div>
      <div class="value">${N(t.client_name)}</div>
    </div>
    <div>
      <div class="label">Адрес объекта</div>
      <div class="value">${N(t.address||"—")}</div>
    </div>
    <div>
      <div class="label">Помещение</div>
      <div class="value">${N(x)}</div>
    </div>
  </div>

  ${p}

  <div class="summary">
    <div class="summary-box">
      <div class="summary-row">
        <span>Помещение:</span>
        <span>${N(x)}</span>
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
      <div class="name">${N(i)}</div>
    </div>
    <div>
      <div class="label">Заказчик</div>
      <div class="name">${N(t.client_name)}</div>
    </div>
  </div>`,f=`${N(s)} № ${t.object_code} — ${N(t.client_name)}`;return{styles:h,bodyContent:b,title:f}}function Ss(t,a,n,i,s=!1,l){const{styles:o,bodyContent:c,title:x}=tt(t,a,n,i,l),p=`<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8" />
<title>${x}</title>
<style>${o}</style>
</head>
<body>
<div class="est-root">${c}</div>
</body>
</html>`,h=window.open("","_blank","width=900,height=1000");h&&(h.document.open(),h.document.write(p),h.document.close(),s&&(h.onload=()=>{h.focus(),h.print()}))}function Ne(t,a){let n=t;for(;;){const i=a.exec(n);if(!i)return n;const s=n.indexOf("{",i.index);if(s===-1)return n;let l=0,o=-1;for(let c=s;c<n.length;c++)if(n[c]==="{")l++;else if(n[c]==="}"&&(l--,l===0)){o=c;break}if(o===-1)return n;n=n.slice(0,i.index)+n.slice(o+1),a.lastIndex=0}}function os(t,a){return Ne(Ne(t,/@page\b/g),/@media\s+print\b/g).replace(/(^|\})\s*([^{}@]+)\s*\{/g,(i,s,l)=>{const o=l.split(",").map(c=>{const x=c.trim();return x?x==="*"?`${a}, ${a} *`:/^(html|body)$/i.test(x)||x===".est-root"?a:x.startsWith(".est-root ")?`${a} ${x.slice(10)}`:`${a} ${x}`:""}).filter(Boolean).join(", ");return`${s} ${o} {`})}const ls=`
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
`;function cs(t,a,n,i,s){const{styles:l,bodyContent:o}=tt(t,a,n,i,s);return`<style>${os(l+ls,"#pdf-scope-materials")}</style>${o}`}async function Cs(t,a,n,i,s){await st(t,a,n,i,"save",s)}async function ks(t,a,n,i,s){return await st(t,a,n,i,"base64",s)||""}async function st(t,a,n,i,s,l="Смета на материал"){return _t(o=>{o.id="pdf-scope-materials",o.className="est-root",o.innerHTML=cs(t,a,n,i,l)},{filename:`${l} ${t.object_code}.pdf`,mode:s})}const ds=t=>new Promise((a,n)=>{const i=new Image;i.onload=()=>a(i),i.onerror=n,i.src=t});async function $s(t,a=1600,n=.82){const i=URL.createObjectURL(t);try{const s=await ds(i),l=Math.min(1,a/Math.max(s.width,s.height)),o=document.createElement("canvas");o.width=Math.round(s.width*l),o.height=Math.round(s.height*l);const c=o.getContext("2d");if(!c)throw new Error("canvas");return c.fillStyle="#fff",c.fillRect(0,0,o.width,o.height),c.drawImage(s,0,0,o.width,o.height),{name:`${t.name.replace(/\.[^.]+$/,"")||"photo"}.jpg`,data:o.toDataURL("image/jpeg",n)}}finally{URL.revokeObjectURL(i)}}function at({open:t,onOpenChange:a,onConfirm:n,title:i="Удалить безвозвратно?",description:s="Это действие нельзя отменить. Запись будет удалена навсегда."}){const[l,o]=r.useState(!1),c=async()=>{o(!0);try{await n(),a(!1)}finally{o(!1)}};return e.jsx(xe,{open:t,onOpenChange:a,children:e.jsxs(Y,{className:"bg-[#1f1f1f] border-white/10 text-white",children:[e.jsxs(G,{children:[e.jsxs(Q,{className:"flex items-center gap-2",children:[e.jsx(u,{name:"TriangleAlert",size:18,className:"text-red-400"}),i]}),e.jsx(X,{className:"text-white/50",children:s})]}),e.jsxs(Z,{children:[e.jsx(ee,{disabled:l,className:"bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white",children:"Нет, отменить"}),e.jsx(J,{disabled:l,onClick:x=>{x.preventDefault(),c()},className:"bg-red-500 text-white hover:bg-red-600",children:l?e.jsx(u,{name:"Loader2",size:16,className:"animate-spin"}):"Да, удалить"})]})]})})}const ms=t=>new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0}).format(Number(t)||0)+" ₽";function nt({signedAt:t,isSigned:a,docLabel:n,docTitle:i,amountLabel:s,amount:l,onSign:o,onDone:c}){const[x,p]=r.useState(!1),[h,b]=r.useState(!1),[f,d]=r.useState(!1),[j,g]=r.useState("");if(t||a)return e.jsxs("div",{className:"bg-emerald-500/10 border border-emerald-500/30 rounded-xl mb-4 p-4 flex items-center gap-3 max-w-4xl mx-auto",children:[e.jsx(u,{name:"BadgeCheck",size:22,className:"text-emerald-400 shrink-0"}),e.jsxs("div",{className:"text-sm",children:[e.jsxs("p",{className:"font-medium",children:[n," подписан",n==="Соглашение"?"о":""]}),t&&e.jsx("p",{className:"text-white/50 text-xs",children:new Date(t).toLocaleString("ru-RU",{day:"numeric",month:"long",year:"numeric",hour:"2-digit",minute:"2-digit"})})]})]});const w=async()=>{d(!0),g("");try{await o(),p(!1),c()}catch(v){g(v instanceof Error?v.message:"Не удалось подписать")}finally{d(!1)}};return e.jsxs("div",{className:"bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl mb-4 p-4 flex flex-wrap items-center justify-between gap-3 max-w-4xl mx-auto",children:[e.jsxs("div",{className:"text-sm",children:[e.jsx("p",{className:"font-medium",children:"Ознакомьтесь с документом и подпишите его онлайн"}),e.jsxs("p",{className:"text-white/50 text-xs",children:[s,": ",ms(l)]}),j&&e.jsx("p",{className:"text-red-400 text-xs mt-1",children:j})]}),e.jsxs("button",{onClick:()=>{b(!1),p(!0)},className:"inline-flex items-center gap-2 rounded-lg bg-[#D4AF37] hover:bg-[#B8860B] px-4 py-2.5 text-sm font-medium text-[#161616]",children:[e.jsx(u,{name:"PenLine",size:16}),"Подписать"]}),e.jsx(xe,{open:x,onOpenChange:p,children:e.jsxs(Y,{children:[e.jsxs(G,{children:[e.jsxs(Q,{children:["Подписать ",i,"?"]}),e.jsx(X,{children:"Подписывая, вы соглашаетесь с условиями документа. После подписания его нельзя изменить, подрядчик получит уведомление."})]}),e.jsxs("label",{className:"flex items-start gap-2 text-sm",children:[e.jsx("input",{type:"checkbox",checked:h,onChange:v=>b(v.target.checked),className:"mt-0.5"}),"Я ознакомился с текстом документа и согласен с его условиями"]}),e.jsxs(Z,{children:[e.jsx(ee,{disabled:f,children:"Отмена"}),e.jsx(J,{onClick:v=>{v.preventDefault(),w()},disabled:f||!h,children:f?"Подписываем…":"Подписать"})]})]})})]})}function xs(){const{id:t,contractId:a,addendumId:n}=le(),i=ce(),{user:s}=de(),l=(s==null?void 0:s.role)==="client",o=Number(t),[c,x]=r.useState(null),[p,h]=r.useState(!1),[b,f]=r.useState(!1),d=()=>ae.get(Number(n)).then(x).catch(()=>i(`/cabinet/objects/${o}`));if(r.useEffect(()=>{d()},[n]),!c)return e.jsx(P,{title:"Дополнительное соглашение",children:e.jsx("div",{className:"flex items-center justify-center py-24",children:e.jsx(u,{name:"Loader2",size:28,className:"animate-spin text-white/40"})})});const j=`Доп. соглашение № ${c.addendum_number}`,g=W(c.content_html||""),w=async()=>{h(!0);try{await K(g,`ДС ${c.addendum_number} к договору ${c.contract_number||""}`.trim())}finally{h(!1)}};return e.jsxs(P,{title:j,subtitle:`к договору № ${c.contract_number||""}`,children:[e.jsxs("div",{className:"flex items-center justify-between mb-4 flex-wrap gap-3",children:[e.jsxs(k,{to:l?`/cabinet/objects/${o}`:`/cabinet/objects/${o}/contracts/${a}`,className:"inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors",children:[e.jsx(u,{name:"ChevronLeft",size:16}),l?"К объекту":"К договору"]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:`px-2.5 py-1 rounded-full text-xs font-medium ${c.status==="signed"?"bg-green-500/20 text-green-300":"bg-white/10 text-white/50"}`,children:c.status==="signed"?"подписано":"черновик"}),!l&&!c.signed_at&&e.jsxs(e.Fragment,{children:[e.jsxs(k,{to:`/cabinet/objects/${o}/contracts/${a}/addenda/${c.id}/edit`,className:"flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 transition-colors text-white text-sm px-3 py-2 rounded-lg",children:[e.jsx(u,{name:"Pencil",size:14}),"Редактировать"]}),e.jsx("button",{onClick:()=>f(!0),title:"Удалить",className:"flex items-center justify-center w-9 h-9 bg-white/5 hover:bg-red-500/20 hover:text-red-300 transition-colors rounded-lg",children:e.jsx(u,{name:"Trash2",size:15})})]}),e.jsx("button",{onClick:()=>At({addendum_number:c.addendum_number,content_html:c.content_html||""}),title:"Печать",className:"flex items-center justify-center w-9 h-9 bg-white/5 hover:bg-white/10 transition-colors rounded-lg",children:e.jsx(u,{name:"Printer",size:15})}),e.jsx("button",{onClick:w,disabled:p,title:"Скачать PDF",className:"flex items-center justify-center w-9 h-9 bg-white/5 hover:bg-white/10 transition-colors rounded-lg disabled:opacity-60",children:e.jsx(u,{name:p?"Loader2":"Download",size:15,className:p?"animate-spin":""})})]})]}),l?e.jsx(nt,{signedAt:c.signed_at,isSigned:c.status==="signed",docLabel:"Соглашение",docTitle:`допсоглашение № ${c.addendum_number}`,amountLabel:"Новая цена договора",amount:Number(c.total_amount),onSign:()=>ae.sign(c.id),onDone:d}):c.signed_at&&e.jsxs("div",{className:"bg-emerald-500/10 border border-emerald-500/30 rounded-xl mb-4 p-4 flex items-center gap-3 max-w-4xl mx-auto text-sm",children:[e.jsx(u,{name:"BadgeCheck",size:20,className:"text-emerald-400"}),"Заказчик подписал онлайн ",new Date(c.signed_at).toLocaleString("ru-RU",{day:"numeric",month:"long",hour:"2-digit",minute:"2-digit"})]}),e.jsx("div",{className:"bg-white rounded-xl p-6 md:p-10 max-w-4xl mx-auto shadow-xl overflow-x-auto",children:e.jsx("div",{dangerouslySetInnerHTML:{__html:g}})}),e.jsx(at,{open:b,onOpenChange:f,onConfirm:async()=>{await ae.remove(c.id),i(`/cabinet/objects/${o}/contracts/${a}`)},title:"Удалить соглашение?",description:"Дополнительное соглашение будет удалено безвозвратно."})]})}const Es=Object.freeze(Object.defineProperty({__proto__:null,default:xs},Symbol.toStringTag,{value:"Module"}));function ps(){var g;const{actId:t}=le(),a=ce(),{user:n}=de(),i=(n==null?void 0:n.role)==="client",[s,l]=r.useState(null),[o,c]=r.useState(!0),[x,p]=r.useState(!1),[h,b]=r.useState(!1),f=()=>{t&&H.get(Number(t)).then(l)};r.useEffect(()=>{t&&(c(!0),H.get(Number(t)).then(l).catch(()=>a(i?"/cabinet/objects":"/cabinet/documents")).finally(()=>c(!1)))},[t]);const d=()=>{s&&Dt(s)},j=async()=>{if(s){p(!0);try{await K(W(s.content_html),`Акт ${s.act_number}`)}finally{p(!1)}}};return o?e.jsx(P,{title:"Акт",children:e.jsx("div",{className:"flex items-center justify-center py-24",children:e.jsx(u,{name:"Loader2",size:28,className:"animate-spin text-white/40"})})}):s?e.jsxs(P,{title:`Акт выполненных работ № ${s.act_number}`,children:[e.jsxs("div",{className:"flex items-center justify-between mb-4 flex-wrap gap-3",children:[e.jsxs(k,{to:i?`/cabinet/objects/${s.object_id}`:"/cabinet/documents",className:"inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors",children:[e.jsx(u,{name:"ChevronLeft",size:16}),i?"К объекту":"К документам"]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:_("px-2.5 py-1 rounded-full text-xs font-medium",s.status==="signed"?"bg-green-500/20 text-green-300":"bg-white/10 text-white/50"),children:s.status==="signed"?"подписан":"черновик"}),!i&&e.jsxs(e.Fragment,{children:[!s.signed_at&&e.jsxs(k,{to:`/cabinet/objects/${s.object_id}/acts/${s.id}/edit`,className:"flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 transition-colors text-white text-sm px-3 py-2 rounded-lg",children:[e.jsx(u,{name:"Pencil",size:14}),"Редактировать"]}),e.jsxs(k,{to:`/cabinet/objects/${s.object_id}/invoices/new?act_id=${s.id}`,className:"flex items-center gap-1.5 bg-white/10 hover:bg-white/15 transition-colors text-white text-sm px-3 py-2 rounded-lg",children:[e.jsx(u,{name:"Receipt",size:14}),"Выставить счёт"]}),e.jsxs("button",{onClick:()=>b(!0),className:"flex items-center gap-1.5 bg-white/10 hover:bg-white/15 transition-colors text-white text-sm px-3 py-2 rounded-lg",children:[e.jsx(u,{name:"Mail",size:14}),"Отправить на почту"]})]}),e.jsx("button",{onClick:d,title:"Печать",className:"flex items-center justify-center w-9 h-9 bg-white/5 hover:bg-white/10 transition-colors rounded-lg",children:e.jsx(u,{name:"Printer",size:15})}),e.jsx("button",{onClick:j,disabled:x,title:"Скачать PDF",className:"flex items-center justify-center w-9 h-9 bg-white/5 hover:bg-white/10 transition-colors rounded-lg disabled:opacity-60",children:x?e.jsx(u,{name:"Loader2",size:15,className:"animate-spin"}):e.jsx(u,{name:"Download",size:15})})]})]}),i?e.jsx(nt,{signedAt:s.signed_at,isSigned:s.status==="signed",docLabel:"Акт",docTitle:`акт № ${s.act_number}`,amountLabel:"Сумма по акту",amount:Number(s.total_amount),onSign:()=>H.sign(s.id),onDone:f}):s.signed_at&&e.jsxs("div",{className:"bg-emerald-500/10 border border-emerald-500/30 rounded-xl mb-4 p-4 flex items-center gap-3 max-w-4xl mx-auto text-sm",children:[e.jsx(u,{name:"BadgeCheck",size:20,className:"text-emerald-400"}),"Заказчик подписал акт онлайн"," ",new Date(s.signed_at).toLocaleString("ru-RU",{day:"numeric",month:"long",hour:"2-digit",minute:"2-digit"})]}),e.jsx("div",{className:"bg-white text-[#161616] rounded-xl p-8 sm:p-12 max-w-4xl mx-auto shadow-lg",children:e.jsx("div",{dangerouslySetInnerHTML:{__html:W(s.content_html)}})}),e.jsx(Pe,{open:h,onOpenChange:b,docName:"акт",objectId:s.object_id,fileName:`Акт_${s.act_number}.pdf`,makePdf:()=>ze(W(s.content_html),`Акт ${s.act_number}`),send:w=>H.sendEmail(s.id,w),extraFiles:(((g=s.options)==null?void 0:g.attachments)||[]).map(w=>w.name)})]}):null}const zs=Object.freeze(Object.defineProperty({__proto__:null,default:ps},Symbol.toStringTag,{value:"Module"})),oe={issued:{label:"выставлен",cls:"bg-white/10 text-white/60"},sent:{label:"отправлен",cls:"bg-blue-500/20 text-blue-300"},paid:{label:"оплачен",cls:"bg-green-500/20 text-green-300"}};function us(){const{id:t,invoiceId:a}=le(),n=Number(t),i=ce(),[s,l]=r.useState(null),[o,c]=r.useState(!0),[x,p]=r.useState(!1),[h,b]=r.useState(!1),[f,d]=r.useState(!1),j=()=>C.get(Number(a)).then(l).catch(()=>i(`/cabinet/objects/${n}`)).finally(()=>c(!1));if(r.useEffect(()=>{j()},[a]),o||!s)return e.jsx(P,{title:"Счёт на оплату",children:e.jsx("div",{className:"flex items-center justify-center py-24",children:e.jsx(u,{name:"Loader2",size:28,className:"animate-spin text-white/40"})})});const g=Se(s),w=`Счёт ${s.invoice_number}`,v=async S=>{const O=await C.update(s.id,{status:S});l({...s,status:S}),Ct(O.thanks)},y=async()=>{p(!0);try{await K(g,w)}finally{p(!1)}},D=oe[s.status]||oe.issued,E="flex items-center justify-center w-9 h-9 bg-white/5 hover:bg-white/10 transition-colors rounded-lg disabled:opacity-60";return e.jsxs(P,{title:`Счёт на оплату № ${s.invoice_number}`,subtitle:s.client_name||"",children:[e.jsxs("div",{className:"mb-4 flex flex-wrap items-center justify-between gap-3",children:[e.jsxs(k,{to:`/cabinet/objects/${n}`,className:"inline-flex items-center gap-1.5 text-sm text-white/50 transition-colors hover:text-white",children:[e.jsx(u,{name:"ChevronLeft",size:16}),"К объекту"]}),e.jsxs("div",{className:"flex flex-wrap items-center gap-2",children:[e.jsx("span",{className:_("rounded-full px-2.5 py-1 text-xs font-medium",D.cls),children:D.label}),s.status!=="paid"?e.jsxs("button",{onClick:()=>v("paid"),title:"Заказчику автоматически уйдёт письмо с благодарностью",className:"flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-sm text-white transition-colors hover:bg-green-700",children:[e.jsx(u,{name:"BadgeCheck",size:14}),"Отметить оплату"]}):e.jsx("button",{onClick:()=>v("sent"),className:"rounded-lg bg-white/5 px-3 py-2 text-sm text-white/60 hover:bg-white/10",children:"Снять отметку оплаты"}),e.jsxs(k,{to:`/cabinet/objects/${n}/invoices/${s.id}/edit`,className:"flex items-center gap-1.5 rounded-lg bg-blue-500 px-3 py-2 text-sm text-white transition-colors hover:bg-blue-600",children:[e.jsx(u,{name:"Pencil",size:14}),"Редактировать"]}),e.jsxs("button",{onClick:()=>b(!0),className:"flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-sm text-white transition-colors hover:bg-white/15",children:[e.jsx(u,{name:"Mail",size:14}),"Отправить на почту"]}),e.jsx("button",{onClick:()=>St(`Счёт № ${s.invoice_number}`,`${be("")}${g}`,ge),title:"Печать",className:E,children:e.jsx(u,{name:"Printer",size:15})}),e.jsx("button",{onClick:y,disabled:x,title:"Скачать PDF",className:E,children:e.jsx(u,{name:x?"Loader2":"Download",size:15,className:x?"animate-spin":""})}),e.jsx("button",{onClick:()=>d(!0),title:"Удалить",className:_(E,"hover:bg-red-500/20 hover:text-red-300"),children:e.jsx(u,{name:"Trash2",size:15})})]})]}),e.jsx("div",{className:"mx-auto max-w-4xl rounded-xl bg-white p-8 text-[#161616] shadow-lg sm:p-12",children:e.jsx("div",{dangerouslySetInnerHTML:{__html:`<style>${ge}</style>${be("")}${g}`}})}),e.jsx(Pe,{open:h,onOpenChange:S=>{b(S),S||j()},docName:"счёт",objectId:s.object_id,fileName:`Счёт_${s.invoice_number}.pdf`,makePdf:()=>ze(g,w),send:S=>C.sendEmail(s.id,S)}),e.jsx(at,{open:f,onOpenChange:d,title:"Удалить счёт?",description:`Счёт № ${s.invoice_number} будет удалён без возможности восстановления.`,onConfirm:async()=>{await C.remove(s.id),i(`/cabinet/objects/${n}`)}})]})}const Ps=Object.freeze(Object.defineProperty({__proto__:null,INVOICE_STATUS:oe,default:us},Symbol.toStringTag,{value:"Module"}));function hs({open:t,onOpenChange:a,memberId:n,memberName:i,onSaved:s}){const[l,o]=r.useState(""),[c,x]=r.useState(!1),[p,h]=r.useState(""),[b,f]=r.useState(!1),d=g=>{a(g),g||(o(""),h(""),f(!1))},j=async()=>{if(h(""),l.length<6){h("Пароль должен быть не короче 6 символов");return}if(n){x(!0);try{await T.setPassword(n,l),f(!0),o(""),s==null||s()}catch(g){h(g instanceof Error?g.message:"Не удалось изменить пароль")}finally{x(!1)}}};return e.jsx(Ce,{open:t,onOpenChange:d,children:e.jsxs(ke,{className:"bg-[#1f1f1f] border-white/10 text-white sm:max-w-sm",children:[e.jsx($e,{children:e.jsxs(Ee,{children:["Пароль для входа — ",i]})}),e.jsxs("div",{className:"flex flex-col gap-3 mt-2",children:[e.jsxs("div",{className:"flex flex-col gap-1.5",children:[e.jsx("label",{className:"text-xs text-white/50",children:"Новый пароль"}),e.jsx("input",{type:"text",value:l,onChange:g=>{o(g.target.value),f(!1)},placeholder:"Минимум 6 символов",className:"bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"})]}),p&&e.jsxs("p",{className:"text-sm text-red-400 flex items-center gap-1.5",children:[e.jsx(u,{name:"CircleAlert",size:15}),p]}),b&&e.jsxs("p",{className:"text-sm text-green-400 flex items-center gap-1.5",children:[e.jsx(u,{name:"CircleCheck",size:15}),"Пароль обновлён — сообщите его пользователю"]}),e.jsx("button",{onClick:j,disabled:c,className:"mt-1 flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm px-4 py-3 rounded-lg disabled:opacity-60",children:c?e.jsx(u,{name:"Loader2",size:16,className:"animate-spin"}):"Сохранить пароль"})]})]})})}function fs(){const{user:t}=de(),[a,n]=r.useState([]),[i,s]=r.useState([]),[l,o]=r.useState(!0),[c,x]=r.useState(!1),[p,h]=r.useState(!1),[b,f]=r.useState(""),[d,j]=r.useState(null),[g,w]=r.useState(""),[v,y]=r.useState(""),[D,E]=r.useState(""),[S,O]=r.useState(""),[F,te]=r.useState([]),B=(t==null?void 0:t.role)==="owner"||(t==null?void 0:t.role)==="admin",[z,se]=r.useState(null),M=()=>{o(!0),Promise.all([T.list(),Nt.list()]).then(([m,A])=>{n(m.members.filter(I=>I.role==="client")),s(A.objects)}).finally(()=>o(!1))};r.useEffect(()=>{M()},[]);const U=()=>{j(null),w(""),y(""),E(""),O(""),te([]),f("")},it=m=>{te(A=>A.includes(m)?A.filter(I=>I!==m):[...A,m])},rt=()=>{U(),x(!0)},pe=m=>{var A;j(m.id),w(m.full_name),y(m.email),E(""),O(m.phone||""),te(((A=m.objects)==null?void 0:A.map(I=>I.id))||[]),f(""),x(!0)},ot=async()=>{if(f(""),d){if(F.length===0){f("Выберите хотя бы один объект");return}h(!0);try{await T.updateObjects(d,F),x(!1),U(),M()}catch(m){f(m instanceof Error?m.message:"Ошибка сохранения")}finally{h(!1)}return}if(g.trim().length<2){f("Введите имя");return}if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)){f("Введите корректный email");return}if(D.length<6){f("Пароль должен быть не короче 6 символов");return}if(F.length===0){f("Выберите хотя бы один объект для заказчика");return}h(!0);try{await T.create({full_name:g,email:v,password:D,role:"client",phone:S,object_ids:F}),x(!1),U(),M()}catch(m){f(m instanceof Error?m.message:"Ошибка сохранения")}finally{h(!1)}},ue=async m=>{await T.remove(m),M()},he=m=>new Date(m).toLocaleDateString("ru-RU",{day:"numeric",month:"short",year:"numeric"});return e.jsxs(P,{title:"Заказчики",subtitle:"База ваших клиентов с доступом в кабинет",children:[B&&e.jsx("div",{className:"flex justify-end mb-6",children:e.jsxs("button",{onClick:rt,className:"flex items-center gap-2 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm px-4 py-2.5 rounded-lg",children:[e.jsx(u,{name:"UserPlus",size:16}),"Создать логин заказчика"]})}),e.jsx("div",{className:"md:bg-[#1f1f1f] md:border md:border-white/10 md:rounded-xl md:p-5",children:l?e.jsx("div",{className:"flex justify-center py-16",children:e.jsx(u,{name:"Loader2",size:24,className:"animate-spin text-white/40"})}):a.length===0?e.jsx("div",{className:"text-center py-16 text-white/30 text-sm",children:"Пока нет заказчиков с доступом в кабинет"}):e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"md:hidden flex flex-col gap-3",children:a.map(m=>e.jsx(vt,{title:m.full_name,subtitle:m.email,rows:[{label:"Объекты",value:m.objects&&m.objects.length>0?m.objects.map(A=>A.object_code).join(", "):"—"},{label:"С нами с",value:he(m.created_at)}],actions:B?e.jsxs(e.Fragment,{children:[e.jsx(fe,{icon:e.jsx(u,{name:"Pencil",size:15}),label:"Объекты",onClick:()=>pe(m)}),e.jsx(fe,{icon:e.jsx(u,{name:"KeyRound",size:15}),label:"Пароль",onClick:()=>se(m)}),e.jsx("div",{className:"w-10 h-10 flex items-center justify-center rounded-lg bg-white/5 shrink-0",children:e.jsx(je,{onConfirm:()=>ue(m.id)})})]}):void 0},m.id))}),e.jsx("div",{className:"hidden md:block overflow-x-auto",children:e.jsxs("table",{className:"w-full text-sm",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"text-white/40 text-xs uppercase border-b border-white/10",children:[e.jsx("th",{className:"text-left font-medium py-2 pr-4",children:"Имя"}),e.jsx("th",{className:"text-left font-medium py-2 pr-4",children:"Email"}),e.jsx("th",{className:"text-left font-medium py-2 pr-4",children:"Объекты"}),e.jsx("th",{className:"text-left font-medium py-2 pr-4",children:"С нами с"}),B&&e.jsx("th",{className:"text-left font-medium py-2 pr-4",children:"Действия"})]})}),e.jsx("tbody",{children:a.map(m=>e.jsxs("tr",{className:"border-b border-white/5 last:border-0",children:[e.jsx("td",{className:"py-3 pr-4",children:m.full_name}),e.jsx("td",{className:"py-3 pr-4 text-white/60",children:m.email}),e.jsx("td",{className:"py-3 pr-4 text-white/60",children:m.objects&&m.objects.length>0?m.objects.map(A=>A.object_code).join(", "):"—"}),e.jsx("td",{className:"py-3 pr-4 text-white/40",children:he(m.created_at)}),B&&e.jsx("td",{className:"py-3 pr-4",children:e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("button",{onClick:()=>pe(m),className:"text-white/40 hover:text-white transition-colors",title:"Изменить объекты",children:e.jsx(u,{name:"Pencil",size:16})}),e.jsx("button",{onClick:()=>se(m),className:"text-white/40 hover:text-white transition-colors",title:"Задать пароль для входа",children:e.jsx(u,{name:"KeyRound",size:16})}),e.jsx(je,{onConfirm:()=>ue(m.id)})]})})]},m.id))})]})})]})}),e.jsx(Ce,{open:c,onOpenChange:m=>{x(m),m||U()},children:e.jsxs(ke,{className:"bg-[#1f1f1f] border-white/10 text-white sm:max-w-md max-h-[85vh] overflow-y-auto",children:[e.jsx($e,{children:e.jsx(Ee,{children:d?"Объекты заказчика":"Новый заказчик"})}),e.jsxs("div",{className:"flex flex-col gap-3 mt-2",children:[!d&&e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"flex flex-col gap-1.5",children:[e.jsx("label",{className:"text-xs text-white/50",children:"Имя"}),e.jsx("input",{value:g,onChange:m=>w(m.target.value),placeholder:"Иванов Иван",className:"bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"})]}),e.jsxs("div",{className:"flex flex-col gap-1.5",children:[e.jsx("label",{className:"text-xs text-white/50",children:"Email"}),e.jsx("input",{type:"email",value:v,onChange:m=>y(m.target.value),placeholder:"user@example.com",className:"bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"})]}),e.jsxs("div",{className:"flex flex-col gap-1.5",children:[e.jsx("label",{className:"text-xs text-white/50",children:"Пароль"}),e.jsx("input",{type:"password",value:D,onChange:m=>E(m.target.value),placeholder:"••••••••",className:"bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"})]}),e.jsxs("div",{className:"flex flex-col gap-1.5",children:[e.jsx("label",{className:"text-xs text-white/50",children:"Телефон"}),e.jsx("input",{value:S,onChange:m=>O(m.target.value),placeholder:"+7 900 000 00 00",className:"bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"})]})]}),e.jsxs("div",{className:"flex flex-col gap-1.5",children:[e.jsx("label",{className:"text-xs text-white/50",children:"Доступные объекты"}),i.length===0?e.jsx("p",{className:"text-xs text-white/30",children:"Сначала создайте хотя бы один объект"}):e.jsx("div",{className:"flex flex-col gap-1.5 max-h-40 overflow-y-auto border border-white/10 rounded-lg p-2",children:i.map(m=>e.jsxs("label",{className:"flex items-center gap-2 text-sm px-2 py-1.5 rounded hover:bg-white/5 cursor-pointer",children:[e.jsx("input",{type:"checkbox",checked:F.includes(m.id),onChange:()=>it(m.id),className:"accent-[#D4AF37]"}),e.jsx("span",{className:"text-[#D4AF37]",children:m.object_code}),e.jsxs("span",{className:"text-white/50",children:["— ",m.client_name]})]},m.id))})]}),b&&e.jsxs("p",{className:"text-sm text-red-400 flex items-center gap-1.5",children:[e.jsx(u,{name:"CircleAlert",size:15}),b]}),e.jsx("button",{onClick:ot,disabled:p,className:"mt-2 flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm px-4 py-3 rounded-lg disabled:opacity-60",children:p?e.jsx(u,{name:"Loader2",size:16,className:"animate-spin"}):d?"Сохранить объекты":"Создать логин заказчика"})]})]})}),e.jsx(hs,{open:!!z,onOpenChange:m=>{m||se(null)},memberId:(z==null?void 0:z.id)??null,memberName:(z==null?void 0:z.full_name)??""})]})}const Rs=Object.freeze(Object.defineProperty({__proto__:null,default:fs},Symbol.toStringTag,{value:"Module"}));export{xe as A,at as C,je as D,as as I,Ds as O,ss as P,hs as S,vs as a,Y as b,G as c,Cs as d,Q as e,X as f,Z as g,ee as h,J as i,As as j,ne as k,Ns as l,ks as m,$s as n,is as o,Ss as p,nt as q,Es as r,zs as s,Ps as t,ts as u,Rs as v,_s as y};
