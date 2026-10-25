import{j as e,r,bj as _e,bk as rt,bl as lt,bm as ct,d as De,bn as dt,c as mt,bo as ut,b as xt,bp as pt,bq as ht,br as Se,bs as ft,bt as gt,a1 as bt,bu as jt,k as A,I as h,aj as k,R as wt,L as z,ak as Ae,E as ce,G as de,o as me,al as ne,an as V,D as Ce,l as $e,m as ke,n as Ee,y as B,w as yt}from"./index-ly_T-3-x.js";import{a as Y,S as ze,c as Pe,r as vt,k as Nt}from"./RentalContract-CLM_UeDp.js";import{C as R,a as ge,d as be,b as _t}from"./Company-D1y99-Ss.js";import{d as q,b as Dt,a as St,p as At}from"./ActCreate-Bg9y43Ba.js";import{M as Ct,C as je}from"./CompanyAssets-B-kSpCg8.js";var $t=Symbol("radix.slottable");function kt(t){const a=({children:n})=>e.jsx(e.Fragment,{children:n});return a.displayName=`${t}.Slottable`,a.__radixId=$t,a}var Fe="AlertDialog",[Et]=mt(Fe,[_e]),P=_e(),Re=t=>{const{__scopeAlertDialog:a,...n}=t,i=P(a);return e.jsx(rt,{...i,...n,modal:!0})};Re.displayName=Fe;var zt="AlertDialogTrigger",Oe=r.forwardRef((t,a)=>{const{__scopeAlertDialog:n,...i}=t,s=P(n);return e.jsx(lt,{...s,...i,ref:a})});Oe.displayName=zt;var Pt="AlertDialogPortal",Le=t=>{const{__scopeAlertDialog:a,...n}=t,i=P(a);return e.jsx(ct,{...i,...n})};Le.displayName=Pt;var Ft="AlertDialogOverlay",Te=r.forwardRef((t,a)=>{const{__scopeAlertDialog:n,...i}=t,s=P(n);return e.jsx(ft,{...s,...i,ref:a})});Te.displayName=Ft;var L="AlertDialogContent",[Rt,Ot]=Et(L),Lt=kt("AlertDialogContent"),Ie=r.forwardRef((t,a)=>{const{__scopeAlertDialog:n,children:i,...s}=t,m=P(n),l=r.useRef(null),o=De(a,l),c=r.useRef(null);return e.jsx(dt,{contentName:L,titleName:Be,docsSlug:"alert-dialog",children:e.jsx(Rt,{scope:n,cancelRef:c,children:e.jsxs(ut,{role:"alertdialog",...m,...s,ref:o,onOpenAutoFocus:xt(s.onOpenAutoFocus,u=>{var b;u.preventDefault(),(b=c.current)==null||b.focus({preventScroll:!0})}),onPointerDownOutside:u=>u.preventDefault(),onInteractOutside:u=>u.preventDefault(),children:[e.jsx(Lt,{children:i}),e.jsx(It,{contentRef:l})]})})})});Ie.displayName=L;var Be="AlertDialogTitle",Me=r.forwardRef((t,a)=>{const{__scopeAlertDialog:n,...i}=t,s=P(n);return e.jsx(pt,{...s,...i,ref:a})});Me.displayName=Be;var Ue="AlertDialogDescription",He=r.forwardRef((t,a)=>{const{__scopeAlertDialog:n,...i}=t,s=P(n);return e.jsx(ht,{...s,...i,ref:a})});He.displayName=Ue;var Tt="AlertDialogAction",Ve=r.forwardRef((t,a)=>{const{__scopeAlertDialog:n,...i}=t,s=P(n);return e.jsx(Se,{...s,...i,ref:a})});Ve.displayName=Tt;var We="AlertDialogCancel",qe=r.forwardRef((t,a)=>{const{__scopeAlertDialog:n,...i}=t,{cancelRef:s}=Ot(We,n),m=P(n),l=De(a,s);return e.jsx(Se,{...m,...i,ref:l})});qe.displayName=We;var It=({contentRef:t})=>{const a=`\`${L}\` requires a description for the component to be accessible for screen reader users.

You can add a description to the \`${L}\` by passing a \`${Ue}\` component as a child, which also benefits sighted users by adding visible context to the dialog.

Alternatively, you can use your own component as a description by assigning it an \`id\` and passing the same value to the \`aria-describedby\` prop in \`${L}\`. If the description is confusing or duplicative for sighted users, you can use the \`@radix-ui/react-visually-hidden\` primitive as a wrapper around your description component.

For more information, see https://radix-ui.com/primitives/docs/components/alert-dialog`;return r.useEffect(()=>{var i;document.getElementById((i=t.current)==null?void 0:i.getAttribute("aria-describedby"))||console.warn(a)},[a,t]),null},Bt=Re,Mt=Oe,Ut=Le,Ke=Te,Ye=Ie,Ge=Ve,Ze=qe,Xe=Me,Je=He,Ht=Symbol.for("react.lazy"),K=gt[" use ".trim().toString()];function Vt(t){return typeof t=="object"&&t!==null&&"then"in t}function Qe(t){return t!=null&&typeof t=="object"&&"$$typeof"in t&&t.$$typeof===Ht&&"_payload"in t&&Vt(t._payload)}function Wt(t){const a=Kt(t),n=r.forwardRef((i,s)=>{let{children:m,...l}=i;Qe(m)&&typeof K=="function"&&(m=K(m._payload));const o=r.Children.toArray(m),c=o.find(Gt);if(c){const u=c.props.children,b=o.map(g=>g===c?r.Children.count(u)>1?r.Children.only(null):r.isValidElement(u)?u.props.children:null:g);return e.jsx(a,{...l,ref:s,children:r.isValidElement(u)?r.cloneElement(u,void 0,b):null})}return e.jsx(a,{...l,ref:s,children:m})});return n.displayName=`${t}.Slot`,n}var qt=Wt("Slot");function Kt(t){const a=r.forwardRef((n,i)=>{let{children:s,...m}=n;if(Qe(s)&&typeof K=="function"&&(s=K(s._payload)),r.isValidElement(s)){const l=Xt(s),o=Zt(m,s.props);return s.type!==r.Fragment&&(o.ref=i?bt(i,l):l),r.cloneElement(s,o)}return r.Children.count(s)>1?r.Children.only(null):null});return a.displayName=`${t}.SlotClone`,a}var Yt=Symbol("radix.slottable");function Gt(t){return r.isValidElement(t)&&typeof t.type=="function"&&"__radixId"in t.type&&t.type.__radixId===Yt}function Zt(t,a){const n={...a};for(const i in a){const s=t[i],m=a[i];/^on[A-Z]/.test(i)?s&&m?n[i]=(...o)=>{const c=m(...o);return s(...o),c}:s&&(n[i]=s):i==="style"?n[i]={...s,...m}:i==="className"&&(n[i]=[s,m].filter(Boolean).join(" "))}return{...t,...n}}function Xt(t){var i,s;let a=(i=Object.getOwnPropertyDescriptor(t.props,"ref"))==null?void 0:i.get,n=a&&"isReactWarning"in a&&a.isReactWarning;return n?t.ref:(a=(s=Object.getOwnPropertyDescriptor(t,"ref"))==null?void 0:s.get,n=a&&"isReactWarning"in a&&a.isReactWarning,n?t.props.ref:t.props.ref||t.ref)}const ue=jt("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",{variants:{variant:{default:"bg-primary text-primary-foreground hover:bg-primary/90",destructive:"bg-destructive text-destructive-foreground hover:bg-destructive/90",outline:"border border-input bg-background hover:bg-accent hover:text-accent-foreground",secondary:"bg-secondary text-secondary-foreground hover:bg-secondary/80",ghost:"hover:bg-accent hover:text-accent-foreground",link:"text-primary underline-offset-4 hover:underline"},size:{default:"h-10 px-4 py-2",sm:"h-9 rounded-md px-3",lg:"h-11 rounded-md px-8",icon:"h-10 w-10"}},defaultVariants:{variant:"default",size:"default"}}),Jt=r.forwardRef(({className:t,variant:a,size:n,asChild:i=!1,...s},m)=>{const l=i?qt:"button";return e.jsx(l,{className:A(ue({variant:a,size:n,className:t})),ref:m,...s})});Jt.displayName="Button";const xe=Bt,ws=Mt,Qt=Ut,et=r.forwardRef(({className:t,...a},n)=>e.jsx(Ke,{className:A("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",t),...a,ref:n}));et.displayName=Ke.displayName;const G=r.forwardRef(({className:t,...a},n)=>e.jsxs(Qt,{children:[e.jsx(et,{}),e.jsx(Ye,{ref:n,className:A("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",t),...a})]}));G.displayName=Ye.displayName;const Z=({className:t,...a})=>e.jsx("div",{className:A("flex flex-col space-y-2 text-center sm:text-left",t),...a});Z.displayName="AlertDialogHeader";const X=({className:t,...a})=>e.jsx("div",{className:A("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",t),...a});X.displayName="AlertDialogFooter";const J=r.forwardRef(({className:t,...a},n)=>e.jsx(Xe,{ref:n,className:A("text-lg font-semibold",t),...a}));J.displayName=Xe.displayName;const Q=r.forwardRef(({className:t,...a},n)=>e.jsx(Je,{ref:n,className:A("text-sm text-muted-foreground",t),...a}));Q.displayName=Je.displayName;const ee=r.forwardRef(({className:t,...a},n)=>e.jsx(Ge,{ref:n,className:A(ue(),t),...a}));ee.displayName=Ge.displayName;const te=r.forwardRef(({className:t,...a},n)=>e.jsx(Ze,{ref:n,className:A(ue({variant:"outline"}),"mt-2 sm:mt-0",t),...a}));te.displayName=Ze.displayName;function we({onConfirm:t,title:a="Удалить безвозвратно?",description:n="Это действие нельзя отменить. Запись будет удалена навсегда.",className:i,size:s=15,label:m,disabled:l,iconName:o="Trash2"}){const[c,u]=r.useState(!1),[b,g]=r.useState(!1),f=async()=>{g(!0);try{await t(),u(!1)}finally{g(!1)}};return e.jsxs(e.Fragment,{children:[e.jsxs("button",{type:"button",disabled:l,onClick:d=>{d.stopPropagation(),u(!0)},title:m||"Удалить",className:A("text-white/40 hover:text-red-400 transition-colors disabled:opacity-40",m&&"flex items-center gap-2",i),children:[e.jsx(h,{name:o,size:s,fallback:"Trash2"}),m]}),e.jsx(xe,{open:c,onOpenChange:u,children:e.jsxs(G,{className:"bg-[#1f1f1f] border-white/10 text-white",children:[e.jsxs(Z,{children:[e.jsxs(J,{className:"flex items-center gap-2",children:[e.jsx(h,{name:"TriangleAlert",size:18,className:"text-red-400"}),a]}),e.jsx(Q,{className:"text-white/50",children:n})]}),e.jsxs(X,{children:[e.jsx(te,{disabled:b,className:"bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white",children:"Нет, отменить"}),e.jsx(ee,{disabled:b,onClick:d=>{d.preventDefault(),f()},className:"bg-red-500 text-white hover:bg-red-600",children:b?e.jsx(h,{name:"Loader2",size:16,className:"animate-spin"}):"Да, удалить"})]})]})})]})}const ie=t=>new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0}).format(t)+" ₽",ys=t=>new Date(t).toLocaleString("ru-RU",{day:"numeric",month:"numeric",year:"numeric",hour:"2-digit",minute:"2-digit"}),vs=t=>t?"Да":"Нет",Ns=t=>t&&t.charAt(0).toUpperCase()+t.slice(1),re="fixkey_pending_invoice_pay";let oe=null;const es=()=>(oe||(oe=k.payConfig().then(t=>t.online).catch(()=>!1)),oe);function ts(t){const[a,n]=r.useState(null);return r.useEffect(()=>{const i=new URLSearchParams(window.location.search),s=Number(i.get("paid_invoice")||0),m=Number(sessionStorage.getItem(re)||0),l=s||m;if(!l)return;if(sessionStorage.removeItem(re),s){i.delete("paid_invoice");const u=i.toString();window.history.replaceState(null,"",window.location.pathname+(u?`?${u}`:""))}let o=0;const c=async()=>{o+=1;try{const u=await k.payCheck(l);if(u.invoice_status==="paid"){n({ok:!0,text:"Оплата получена — спасибо! Счёт отмечен оплаченным."}),t(),window.dispatchEvent(new Event("invoice-paid"));return}if(u.payment==="canceled"){n({ok:!1,text:"Платёж отменён. Можно попробовать оплатить ещё раз."});return}}catch{}o<6?setTimeout(c,3e3):n({ok:!1,text:"Платёж ещё обрабатывается. Статус счёта обновится автоматически."})};c()},[]),{message:a,clear:()=>n(null)}}function ss({message:t,onClose:a}){return t?e.jsxs("div",{className:`mb-4 flex items-start gap-3 rounded-xl border p-4 text-sm ${t.ok?"border-emerald-500/30 bg-emerald-500/10":"border-[#D4AF37]/30 bg-[#D4AF37]/10"}`,children:[e.jsx(h,{name:t.ok?"BadgeCheck":"Clock",size:20,className:t.ok?"text-emerald-400":"text-[#D4AF37]"}),e.jsx("p",{className:"flex-1",children:t.text}),e.jsx("button",{onClick:a,className:"text-white/40 hover:text-white","aria-label":"Закрыть",children:e.jsx(h,{name:"X",size:16})})]}):null}function as({invoiceId:t,amountLabel:a,className:n=""}){const[i,s]=r.useState(!1),[m,l]=r.useState(!1),[o,c]=r.useState(""),[u,b]=r.useState(!1),[g,f]=r.useState(""),[d,j]=r.useState(null),[p,w]=r.useState(!1);if(r.useEffect(()=>{es().then(s)},[]),r.useEffect(()=>{i&&k.payPreview(t).then(y=>j(y.receipts&&y.items.length?y.items:null)).catch(()=>null)},[i,t]),!i)return null;const v=async()=>{l(!0),c("");try{const y=new URL(window.location.href);y.searchParams.set("paid_invoice",String(t));const{confirmation_url:S}=await k.pay(t,y.toString(),u?g.trim():void 0);sessionStorage.setItem(re,String(t)),window.location.href=S}catch(y){const S=y instanceof Error?y.message:"Не удалось перейти к оплате";S.includes("почту для электронного чека")?(b(!0),u&&c("Проверьте адрес почты")):c(S),l(!1)}};return e.jsxs("div",{className:`flex flex-col gap-1 ${n}`,children:[e.jsxs("button",{onClick:v,disabled:m,className:"flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-600 disabled:opacity-60",children:[e.jsx(h,{name:m?"Loader2":"CreditCard",size:14,className:m?"animate-spin":""}),"Оплатить онлайн",a?` ${a}`:""]}),d&&e.jsxs("div",{className:"mt-1",children:[e.jsxs("button",{type:"button",onClick:()=>w(y=>!y),className:"flex items-center gap-1 text-xs text-white/50 hover:text-white",children:[e.jsx(h,{name:"ReceiptText",size:12}),"Что будет в чеке (",d.length," поз.)",e.jsx(h,{name:p?"ChevronUp":"ChevronDown",size:12})]}),p&&e.jsxs("div",{className:"mt-2 max-h-72 overflow-y-auto rounded-lg border border-white/10 bg-[#161616] p-3",children:[e.jsx(wt,{items:d,compact:!0}),e.jsx("p",{className:"mt-2 text-[11px] text-white/40",children:"Электронный чек с этим перечнем придёт на почту после оплаты. На странице ЮKassa показывается только итоговая сумма."})]})]}),u&&e.jsxs("div",{className:"flex flex-col gap-1 mt-1",children:[e.jsx("p",{className:"text-xs text-white/50",children:"Куда прислать электронный чек?"}),e.jsxs("div",{className:"flex gap-1",children:[e.jsx("input",{type:"email",value:g,onChange:y=>f(y.target.value),placeholder:"you@mail.ru",className:"min-w-0 flex-1 rounded-lg border border-white/10 bg-[#161616] px-2.5 py-1.5 text-sm outline-none focus:border-emerald-500/60"}),e.jsx("button",{onClick:v,disabled:m||!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(g.trim()),className:"rounded-lg bg-emerald-500 px-3 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50",children:"Далее"})]})]}),o&&e.jsx("p",{className:"text-xs text-red-400",children:o})]})}const ye={issued:{label:"Выставлен",clientLabel:"Ожидает оплаты",cls:"bg-white/10 text-white/50"},sent:{label:"Отправлен",clientLabel:"Ожидает оплаты",cls:"bg-blue-500/20 text-blue-300"},paid:{label:"Оплачен",clientLabel:"Оплачен",cls:"bg-green-500/20 text-green-300"}},ve=t=>new Date(String(t).slice(0,10)).toLocaleDateString("ru-RU"),ns=t=>t.status!=="paid"&&!!t.due_date&&new Date(String(t.due_date).slice(0,10))<new Date(new Date().toDateString());async function is(t){const a=await k.get(t);await Y(Ae(a),`Счёт ${a.invoice_number}`)}function _s({objectId:t,isClient:a=!1}){const[n,i]=r.useState([]),[s,m]=r.useState(!0),[l,o]=r.useState(null),c=()=>k.list({object_id:t}).then(d=>i(d.invoices)).catch(()=>i([])).finally(()=>m(!1));r.useEffect(()=>{c()},[t]);const u=ts(()=>c()),b=async d=>{o(d);try{await is(d)}finally{o(null)}},g=n.filter(d=>d.status==="paid").reduce((d,j)=>d+Number(j.total_amount||0),0),f=n.reduce((d,j)=>d+Number(j.total_amount||0),0);return a&&!s&&n.length===0?null:e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"mt-6",children:e.jsx(ss,{message:u.message,onClose:u.clear})}),e.jsxs("div",{className:"mb-2 flex items-center justify-between",children:[e.jsx("p",{className:"text-xs uppercase tracking-wide text-white/40",children:"Счета на оплату"}),!a&&e.jsxs(z,{to:`/cabinet/objects/${t}/invoices/new`,className:"flex items-center gap-1 text-xs text-[#D4AF37] transition-colors hover:text-[#B8860B]",children:[e.jsx(h,{name:"Plus",size:13}),"Выставить счёт"]})]}),s?e.jsx("div",{className:"flex justify-center py-6",children:e.jsx(h,{name:"Loader2",size:20,className:"animate-spin text-white/40"})}):n.length===0?e.jsx("div",{className:"py-6 text-center text-sm text-white/30",children:"Счетов пока нет"}):e.jsxs("div",{className:"flex flex-col gap-2",children:[n.map(d=>{const j=ye[d.status]||ye.issued,p=[d.contract_number&&`Договор № ${d.contract_number}`,d.act_number&&`Акт № ${d.act_number}`].filter(Boolean).join(" · ")||"Без основания",w=e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"mb-1 flex items-center justify-between gap-2",children:[e.jsxs("p",{className:"text-sm font-medium",children:["Счёт № ",d.invoice_number," ",e.jsxs("span",{className:"text-white/40",children:["от ",ve(d.invoice_date)]})]}),e.jsxs("div",{className:"flex flex-wrap items-center justify-end gap-1",children:[e.jsx("span",{className:A("rounded-full px-2 py-0.5 text-xs",j.cls),children:a?j.clientLabel:j.label}),d.status==="paid"&&d.paid_online&&e.jsx("span",{className:"rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-300",children:"онлайн"}),d.status==="paid"&&d.paid_source==="bank"&&e.jsx("span",{className:"rounded-full bg-[#FFDD2D]/15 px-2 py-0.5 text-xs text-[#FFDD2D]",children:"по выписке"}),ns(d)&&e.jsx("span",{className:"rounded-full bg-red-500/20 px-2 py-0.5 text-xs text-red-300",children:"просрочен"})]})]}),e.jsx("p",{className:"text-lg font-semibold",children:ie(Number(d.total_amount))}),e.jsxs("p",{className:"text-xs text-white/40",children:[p,d.due_date&&d.status!=="paid"?` · оплатить до ${ve(d.due_date)}`:""]})]});return a?e.jsxs("div",{className:"rounded-lg border border-white/10 bg-[#161616] p-4",children:[w,e.jsxs("div",{className:"mt-3 flex flex-wrap items-start gap-2",children:[d.status!=="paid"&&e.jsx(as,{invoiceId:d.id}),e.jsxs("button",{onClick:()=>b(d.id),disabled:l===d.id,className:"flex items-center gap-1.5 rounded-lg bg-[#D4AF37] px-3 py-2 text-sm font-medium text-[#161616] transition-colors hover:bg-[#B8860B] disabled:opacity-60",children:[e.jsx(h,{name:l===d.id?"Loader2":"Download",size:14,className:l===d.id?"animate-spin":""}),"Скачать PDF"]})]})]},d.id):e.jsx(z,{to:`/cabinet/objects/${t}/invoices/${d.id}`,className:"block rounded-lg border border-white/10 bg-[#161616] p-4 transition-colors hover:border-[#D4AF37]/40",children:w},d.id)}),e.jsxs("p",{className:"pt-1 text-right text-xs text-white/40",children:["Оплачено ",ie(g)," из ",ie(f)]})]})]})}function tt({open:t,onOpenChange:a,onConfirm:n,title:i="Удалить безвозвратно?",description:s="Это действие нельзя отменить. Запись будет удалена навсегда."}){const[m,l]=r.useState(!1),o=async()=>{l(!0);try{await n(),a(!1)}finally{l(!1)}};return e.jsx(xe,{open:t,onOpenChange:a,children:e.jsxs(G,{className:"bg-[#1f1f1f] border-white/10 text-white",children:[e.jsxs(Z,{children:[e.jsxs(J,{className:"flex items-center gap-2",children:[e.jsx(h,{name:"TriangleAlert",size:18,className:"text-red-400"}),i]}),e.jsx(Q,{className:"text-white/50",children:s})]}),e.jsxs(X,{children:[e.jsx(te,{disabled:m,className:"bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white",children:"Нет, отменить"}),e.jsx(ee,{disabled:m,onClick:c=>{c.preventDefault(),o()},className:"bg-red-500 text-white hover:bg-red-600",children:m?e.jsx(h,{name:"Loader2",size:16,className:"animate-spin"}):"Да, удалить"})]})]})})}const os=t=>new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0}).format(Number(t)||0)+" ₽";function st({signedAt:t,isSigned:a,docLabel:n,docTitle:i,amountLabel:s,amount:m,onSign:l,onDone:o}){const[c,u]=r.useState(!1),[b,g]=r.useState(!1),[f,d]=r.useState(!1),[j,p]=r.useState("");if(t||a)return e.jsxs("div",{className:"bg-emerald-500/10 border border-emerald-500/30 rounded-xl mb-4 p-3 sm:p-4 flex items-center gap-3 max-w-4xl mx-auto",children:[e.jsx(h,{name:"BadgeCheck",size:22,className:"text-emerald-400 shrink-0"}),e.jsxs("div",{className:"text-sm",children:[e.jsxs("p",{className:"font-medium",children:[n," подписан",n==="Соглашение"?"о":""]}),t&&e.jsx("p",{className:"text-white/50 text-xs",children:new Date(t).toLocaleString("ru-RU",{day:"numeric",month:"long",year:"numeric",hour:"2-digit",minute:"2-digit"})})]})]});const w=async()=>{d(!0),p("");try{await l(),u(!1),o()}catch(v){p(v instanceof Error?v.message:"Не удалось подписать")}finally{d(!1)}};return e.jsxs("div",{className:"bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl mb-4 p-3 sm:p-4 flex flex-col sm:flex-row sm:flex-wrap sm:items-center justify-between gap-3 max-w-4xl mx-auto",children:[e.jsxs("div",{className:"text-sm",children:[e.jsx("p",{className:"font-medium",children:"Ознакомьтесь с документом и подпишите его онлайн"}),e.jsxs("p",{className:"text-white/50 text-xs",children:[s,": ",os(m)]}),j&&e.jsx("p",{className:"text-red-400 text-xs mt-1",children:j})]}),e.jsxs("button",{onClick:()=>{g(!1),u(!0)},className:"inline-flex w-full sm:w-auto min-h-[44px] sm:min-h-0 justify-center items-center gap-2 rounded-lg bg-[#D4AF37] hover:bg-[#B8860B] px-4 py-2.5 text-sm font-medium text-[#161616]",children:[e.jsx(h,{name:"PenLine",size:16}),"Подписать"]}),e.jsx(xe,{open:c,onOpenChange:u,children:e.jsxs(G,{className:"w-[calc(100%-1.5rem)] sm:w-full max-h-[88vh] overflow-y-auto p-4 sm:p-6 rounded-lg",children:[e.jsxs(Z,{children:[e.jsxs(J,{children:["Подписать ",i,"?"]}),e.jsx(Q,{children:"Подписывая, вы соглашаетесь с условиями документа. После подписания его нельзя изменить, подрядчик получит уведомление."})]}),e.jsxs("label",{className:"flex items-start gap-2 text-sm",children:[e.jsx("input",{type:"checkbox",checked:b,onChange:v=>g(v.target.checked),className:"mt-0.5"}),"Я ознакомился с текстом документа и согласен с его условиями"]}),e.jsxs(X,{children:[e.jsx(te,{disabled:f,className:"min-h-[44px] sm:min-h-0",children:"Отмена"}),e.jsx(ee,{onClick:v=>{v.preventDefault(),w()},disabled:f||!b,className:"min-h-[44px] sm:min-h-0",children:f?"Подписываем…":"Подписать"})]})]})})]})}function rs(){const{id:t,contractId:a,addendumId:n}=ce(),i=de(),{user:s}=me(),m=(s==null?void 0:s.role)==="client",l=Number(t),[o,c]=r.useState(null),[u,b]=r.useState(!1),[g,f]=r.useState(!1),d=()=>ne.get(Number(n)).then(c).catch(()=>i(`/cabinet/objects/${l}`));if(r.useEffect(()=>{d()},[n]),!o)return e.jsx(R,{title:"Дополнительное соглашение",children:e.jsx("div",{className:"flex items-center justify-center py-24",children:e.jsx(h,{name:"Loader2",size:28,className:"animate-spin text-white/40"})})});const j=`Доп. соглашение № ${o.addendum_number}`,p=q(o.content_html||""),w=async()=>{b(!0);try{await Y(p,`ДС ${o.addendum_number} к договору ${o.contract_number||""}`.trim())}finally{b(!1)}};return e.jsxs(R,{title:j,subtitle:`к договору № ${o.contract_number||""}`,children:[e.jsxs("div",{className:"flex items-center justify-between mb-4 flex-wrap gap-3",children:[e.jsxs(z,{to:m?`/cabinet/objects/${l}`:`/cabinet/objects/${l}/contracts/${a}`,className:"inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors",children:[e.jsx(h,{name:"ChevronLeft",size:16}),m?"К объекту":"К договору"]}),e.jsxs("div",{className:"grid grid-cols-2 gap-2 w-full sm:flex sm:items-center sm:w-auto",children:[e.jsx("span",{className:`col-span-2 justify-self-start px-2.5 py-1 rounded-full text-xs font-medium ${o.status==="signed"?"bg-green-500/20 text-green-300":"bg-white/10 text-white/50"}`,children:o.status==="signed"?"подписано":"черновик"}),!m&&!o.signed_at&&e.jsxs(e.Fragment,{children:[e.jsxs(z,{to:`/cabinet/objects/${l}/contracts/${a}/addenda/${o.id}/edit`,className:"flex items-center justify-center min-h-[44px] sm:min-h-0 gap-1.5 bg-blue-500 hover:bg-blue-600 transition-colors text-white text-sm px-3 py-2 rounded-lg",children:[e.jsx(h,{name:"Pencil",size:14}),"Редактировать"]}),e.jsxs("button",{onClick:()=>f(!0),title:"Удалить",className:"flex items-center justify-center gap-1.5 text-sm w-full h-11 sm:w-9 sm:h-9 bg-white/5 hover:bg-red-500/20 hover:text-red-300 transition-colors rounded-lg",children:[e.jsx(h,{name:"Trash2",size:15}),e.jsx("span",{className:"sm:hidden",children:"Удалить"})]})]}),e.jsxs("button",{onClick:()=>Dt({addendum_number:o.addendum_number,content_html:o.content_html||""}),title:"Печать",className:"flex items-center justify-center gap-1.5 text-sm w-full h-11 sm:w-9 sm:h-9 bg-white/5 hover:bg-white/10 transition-colors rounded-lg",children:[e.jsx(h,{name:"Printer",size:15}),e.jsx("span",{className:"sm:hidden",children:"Печать"})]}),e.jsxs("button",{onClick:w,disabled:u,title:"Скачать PDF",className:"flex items-center justify-center gap-1.5 text-sm w-full h-11 sm:w-9 sm:h-9 bg-white/5 hover:bg-white/10 transition-colors rounded-lg disabled:opacity-60",children:[e.jsx(h,{name:u?"Loader2":"Download",size:15,className:u?"animate-spin":""}),e.jsx("span",{className:"sm:hidden",children:"PDF"})]})]})]}),m?e.jsx(st,{signedAt:o.signed_at,isSigned:o.status==="signed",docLabel:"Соглашение",docTitle:`допсоглашение № ${o.addendum_number}`,amountLabel:"Новая цена договора",amount:Number(o.total_amount),onSign:()=>ne.sign(o.id),onDone:d}):o.signed_at&&e.jsxs("div",{className:"bg-emerald-500/10 border border-emerald-500/30 rounded-xl mb-4 p-3 sm:p-4 flex items-center gap-3 max-w-4xl mx-auto text-sm",children:[e.jsx(h,{name:"BadgeCheck",size:20,className:"text-emerald-400"}),"Заказчик подписал онлайн ",new Date(o.signed_at).toLocaleString("ru-RU",{day:"numeric",month:"long",hour:"2-digit",minute:"2-digit"})]}),e.jsx("div",{className:"bg-white rounded-xl p-3 sm:p-6 md:p-10 max-w-4xl mx-auto shadow-xl overflow-x-auto",children:e.jsx("div",{dangerouslySetInnerHTML:{__html:p}})}),e.jsx(tt,{open:g,onOpenChange:f,onConfirm:async()=>{await ne.remove(o.id),i(`/cabinet/objects/${l}/contracts/${a}`)},title:"Удалить соглашение?",description:"Дополнительное соглашение будет удалено безвозвратно."})]})}const Ds=Object.freeze(Object.defineProperty({__proto__:null,default:rs},Symbol.toStringTag,{value:"Module"}));function ls(){var p;const{actId:t}=ce(),a=de(),{user:n}=me(),i=(n==null?void 0:n.role)==="client",[s,m]=r.useState(null),[l,o]=r.useState(!0),[c,u]=r.useState(!1),[b,g]=r.useState(!1),f=()=>{t&&V.get(Number(t)).then(m)};r.useEffect(()=>{t&&(o(!0),V.get(Number(t)).then(m).catch(()=>a(i?"/cabinet/objects":"/cabinet/documents")).finally(()=>o(!1)))},[t]);const d=()=>{s&&St(s)},j=async()=>{if(s){u(!0);try{await Y(q(s.content_html),`Акт ${s.act_number}`)}finally{u(!1)}}};return l?e.jsx(R,{title:"Акт",children:e.jsx("div",{className:"flex items-center justify-center py-24",children:e.jsx(h,{name:"Loader2",size:28,className:"animate-spin text-white/40"})})}):s?e.jsxs(R,{title:`Акт выполненных работ № ${s.act_number}`,children:[e.jsxs("div",{className:"flex items-center justify-between mb-4 flex-wrap gap-3",children:[e.jsxs(z,{to:i?`/cabinet/objects/${s.object_id}`:"/cabinet/documents",className:"inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors",children:[e.jsx(h,{name:"ChevronLeft",size:16}),i?"К объекту":"К документам"]}),e.jsxs("div",{className:"grid grid-cols-2 gap-2 w-full sm:flex sm:items-center sm:w-auto",children:[e.jsx("span",{className:A("col-span-2 justify-self-start px-2.5 py-1 rounded-full text-xs font-medium",s.status==="signed"?"bg-green-500/20 text-green-300":"bg-white/10 text-white/50"),children:s.status==="signed"?"подписан":"черновик"}),!i&&e.jsxs(e.Fragment,{children:[!s.signed_at&&e.jsxs(z,{to:`/cabinet/objects/${s.object_id}/acts/${s.id}/edit`,className:"flex items-center justify-center min-h-[44px] sm:min-h-0 gap-1.5 bg-blue-500 hover:bg-blue-600 transition-colors text-white text-sm px-3 py-2 rounded-lg",children:[e.jsx(h,{name:"Pencil",size:14}),"Редактировать"]}),e.jsxs(z,{to:`/cabinet/objects/${s.object_id}/invoices/new?act_id=${s.id}`,className:"flex items-center justify-center min-h-[44px] sm:min-h-0 gap-1.5 bg-white/10 hover:bg-white/15 transition-colors text-white text-sm px-3 py-2 rounded-lg",children:[e.jsx(h,{name:"Receipt",size:14}),"Выставить счёт"]}),e.jsxs("button",{onClick:()=>g(!0),className:"flex items-center justify-center min-h-[44px] sm:min-h-0 gap-1.5 bg-white/10 hover:bg-white/15 transition-colors text-white text-sm px-3 py-2 rounded-lg",children:[e.jsx(h,{name:"Mail",size:14}),"Отправить на почту"]})]}),e.jsxs("button",{onClick:d,title:"Печать",className:"flex items-center justify-center gap-1.5 text-sm w-full h-11 sm:w-9 sm:h-9 bg-white/5 hover:bg-white/10 transition-colors rounded-lg",children:[e.jsx(h,{name:"Printer",size:15}),e.jsx("span",{className:"sm:hidden",children:"Печать"})]}),e.jsxs("button",{onClick:j,disabled:c,title:"Скачать PDF",className:"flex items-center justify-center gap-1.5 text-sm w-full h-11 sm:w-9 sm:h-9 bg-white/5 hover:bg-white/10 transition-colors rounded-lg disabled:opacity-60",children:[c?e.jsx(h,{name:"Loader2",size:15,className:"animate-spin"}):e.jsx(h,{name:"Download",size:15}),e.jsx("span",{className:"sm:hidden",children:"PDF"})]})]})]}),i?e.jsx(st,{signedAt:s.signed_at,isSigned:s.status==="signed",docLabel:"Акт",docTitle:`акт № ${s.act_number}`,amountLabel:"Сумма по акту",amount:Number(s.total_amount),onSign:()=>V.sign(s.id),onDone:f}):s.signed_at&&e.jsxs("div",{className:"bg-emerald-500/10 border border-emerald-500/30 rounded-xl mb-4 p-3 sm:p-4 flex items-center gap-3 max-w-4xl mx-auto text-sm",children:[e.jsx(h,{name:"BadgeCheck",size:20,className:"text-emerald-400"}),"Заказчик подписал акт онлайн"," ",new Date(s.signed_at).toLocaleString("ru-RU",{day:"numeric",month:"long",hour:"2-digit",minute:"2-digit"})]}),e.jsx("div",{className:"overflow-x-auto md:overflow-visible max-w-4xl mx-auto",children:e.jsx("div",{className:"bg-white text-[#161616] rounded-xl p-4 sm:p-12 max-w-4xl mx-auto shadow-lg break-words",children:e.jsx("div",{dangerouslySetInnerHTML:{__html:q(s.content_html)}})})}),e.jsx(ze,{open:b,onOpenChange:g,docName:"акт",objectId:s.object_id,fileName:`Акт_${s.act_number}.pdf`,makePdf:()=>Pe(q(s.content_html),`Акт ${s.act_number}`),send:w=>V.sendEmail(s.id,w),extraFiles:(((p=s.options)==null?void 0:p.attachments)||[]).map(w=>w.name)})]}):null}const Ss=Object.freeze(Object.defineProperty({__proto__:null,default:ls},Symbol.toStringTag,{value:"Module"})),le={issued:{label:"выставлен",cls:"bg-white/10 text-white/60"},sent:{label:"отправлен",cls:"bg-blue-500/20 text-blue-300"},paid:{label:"оплачен",cls:"bg-green-500/20 text-green-300"}};function cs(){const{id:t,invoiceId:a}=ce(),n=Number(t),i=de(),[s,m]=r.useState(null),[l,o]=r.useState(!0),[c,u]=r.useState(!1),[b,g]=r.useState(!1),[f,d]=r.useState(!1),j=()=>k.get(Number(a)).then(m).catch(()=>i(`/cabinet/objects/${n}`)).finally(()=>o(!1));if(r.useEffect(()=>{j()},[a]),l||!s)return e.jsx(R,{title:"Счёт на оплату",children:e.jsx("div",{className:"flex items-center justify-center py-24",children:e.jsx(h,{name:"Loader2",size:28,className:"animate-spin text-white/40"})})});const p=Ae(s),w=`Счёт ${s.invoice_number}`,v=async N=>{const $=await k.update(s.id,{status:N});m({...s,status:N}),_t($.thanks)},y=async()=>{u(!0);try{await Y(p,w)}finally{u(!1)}},S=le[s.status]||le.issued,_="flex items-center justify-center gap-1.5 text-sm w-full h-11 sm:w-9 sm:h-9 bg-white/5 hover:bg-white/10 transition-colors rounded-lg disabled:opacity-60";return e.jsxs(R,{title:`Счёт на оплату № ${s.invoice_number}`,subtitle:s.client_name||"",children:[e.jsxs("div",{className:"mb-4 flex flex-wrap items-center justify-between gap-3",children:[e.jsxs(z,{to:`/cabinet/objects/${n}`,className:"inline-flex items-center gap-1.5 text-sm text-white/50 transition-colors hover:text-white",children:[e.jsx(h,{name:"ChevronLeft",size:16}),"К объекту"]}),e.jsxs("div",{className:"grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center",children:[e.jsx("span",{className:A("col-span-2 justify-self-start rounded-full px-2.5 py-1 text-xs font-medium",S.cls),children:S.label}),s.status!=="paid"?e.jsxs("button",{onClick:()=>v("paid"),title:"Заказчику автоматически уйдёт письмо с благодарностью",className:"flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg bg-green-600 sm:min-h-0 px-3 py-2 text-sm text-white transition-colors hover:bg-green-700",children:[e.jsx(h,{name:"BadgeCheck",size:14}),"Отметить оплату"]}):e.jsx("button",{onClick:()=>v("sent"),className:"min-h-[44px] rounded-lg bg-white/5 px-3 py-2 text-sm text-white/60 hover:bg-white/10 sm:min-h-0",children:"Снять отметку оплаты"}),e.jsxs(z,{to:`/cabinet/objects/${n}/invoices/${s.id}/edit`,className:"flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg bg-blue-500 sm:min-h-0 px-3 py-2 text-sm text-white transition-colors hover:bg-blue-600",children:[e.jsx(h,{name:"Pencil",size:14}),"Редактировать"]}),e.jsxs("button",{onClick:()=>g(!0),className:"flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg bg-white/10 sm:min-h-0 px-3 py-2 text-sm text-white transition-colors hover:bg-white/15",children:[e.jsx(h,{name:"Mail",size:14}),"Отправить на почту"]}),e.jsxs("button",{onClick:()=>At(`Счёт № ${s.invoice_number}`,`${be("")}${p}`,ge),title:"Печать",className:_,children:[e.jsx(h,{name:"Printer",size:15}),e.jsx("span",{className:"sm:hidden",children:"Печать"})]}),e.jsxs("button",{onClick:y,disabled:c,title:"Скачать PDF",className:_,children:[e.jsx(h,{name:c?"Loader2":"Download",size:15,className:c?"animate-spin":""}),e.jsx("span",{className:"sm:hidden",children:"PDF"})]}),e.jsxs("button",{onClick:()=>d(!0),title:"Удалить",className:A(_,"hover:bg-red-500/20 hover:text-red-300"),children:[e.jsx(h,{name:"Trash2",size:15}),e.jsx("span",{className:"sm:hidden",children:"Удалить"})]})]})]}),e.jsx("div",{className:"mx-auto max-w-4xl overflow-x-auto md:overflow-visible",children:e.jsx("div",{className:"mx-auto max-w-4xl rounded-xl bg-white p-4 text-[#161616] shadow-lg sm:p-12",children:e.jsx("div",{dangerouslySetInnerHTML:{__html:`<style>${ge}</style>${be("")}${p}`}})})}),e.jsx(ze,{open:b,onOpenChange:N=>{g(N),N||j()},docName:"счёт",objectId:s.object_id,fileName:`Счёт_${s.invoice_number}.pdf`,makePdf:()=>Pe(p,w),send:N=>k.sendEmail(s.id,N)}),e.jsx(tt,{open:f,onOpenChange:d,title:"Удалить счёт?",description:`Счёт № ${s.invoice_number} будет удалён без возможности восстановления.`,onConfirm:async()=>{await k.remove(s.id),i(`/cabinet/objects/${n}`)}})]})}const As=Object.freeze(Object.defineProperty({__proto__:null,INVOICE_STATUS:le,default:cs},Symbol.toStringTag,{value:"Module"})),E=(t,a=0)=>{const n=typeof t=="string"?parseFloat(t):Number(t);return Number.isFinite(n)?n:a},W="Магазин не выбран";function ds(t,a){const n=t.filter(l=>E(l.price)>0);if(n.length===0)return null;const i=n.map(l=>{const o=!!l.stock_known,c=E(l.stock),u=!o||c>=a,b=o&&c>0&&c<a;return{offer:l,enough:u,partial:b,price:E(l.price)}}),s=i.filter(l=>l.enough);if(s.length>0)return s.reduce((l,o)=>o.price<l.price?o:l).offer;const m=i.filter(l=>l.partial);return m.length>0?m.reduce((l,o)=>o.price<l.price?o:l).offer:i.reduce((l,o)=>o.price<l.price?o:l).offer}function ms(t,a){const n=new Map;let i=0,s=0,m=0;t.forEach(o=>{const c=a.find($=>$.id===o.material_id),u=(c==null?void 0:c.offers)||[],b=E(o.qty),g=ds(u,b),f=E(g?g.price:o.price),d=(g==null?void 0:g.shop_name)||o.shop_name||(c==null?void 0:c.shop_name)||W,p=(g?!!g.stock_known:!1)?E(g.stock):null,w=p===null?!0:p>=b,v=w||p===null?0:Math.max(0,b-p);w||(s+=1),d===W&&(m+=1);const y=u.filter($=>E($.price)>0).map($=>E($.price)),S=y.length>1&&f>0?(Math.max(...y)-f)*b:0;i+=S;const _={name:o.name,unit:o.unit,qty:b,price:f,sum:b*f,shopName:d,shopAddress:(g==null?void 0:g.shop_address)||(c==null?void 0:c.shop_address)||"",shopPhone:(g==null?void 0:g.shop_phone)||(c==null?void 0:c.shop_phone)||"",shopUrl:(g==null?void 0:g.shop_url)||(c==null?void 0:c.shop_url)||"",stock:p,enough:w,missing:v,offersCount:y.length,saved:S,roomName:o.room_name||""};n.has(d)||n.set(d,{name:d,address:_.shopAddress,phone:_.shopPhone,lines:[],sum:0,hasShortage:!1});const N=n.get(d);!N.address&&_.shopAddress&&(N.address=_.shopAddress),!N.phone&&_.shopPhone&&(N.phone=_.shopPhone),N.lines.push(_),N.sum+=_.sum,w||(N.hasShortage=!0)});const l=Array.from(n.values()).map(o=>({...o,lines:[...o.lines].sort((c,u)=>u.sum-c.sum)})).sort((o,c)=>o.name===W?1:c.name===W?-1:c.sum-o.sum);return{shops:l,total:l.reduce((o,c)=>o+c.sum,0),saved:i,shortageCount:s,unknownShopCount:m}}const Ne=t=>String(t??"").replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\r?\n/g," "),us=(t,a=0)=>{const n=typeof t=="string"?parseFloat(t):Number(t);return Number.isFinite(n)?n:a},O=t=>new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0}).format(us(t))+" ₽";function D(t){const a=document.createElement("div");return a.textContent=t??"",a.innerHTML}function at(t,a,n,i){const s=ms(a,n),m=s.shops.map(f=>{const d=f.lines.map((p,w)=>{const v=p.stock===null?'<span class="muted">не указано</span>':p.enough?`<span class="ok">есть ${p.stock} ${D(p.unit)}</span>`:`<span class="warn">есть ${p.stock}, не хватает ${p.missing}</span>`;return`
            <tr>
              <td class="num">${w+1}</td>
              <td>
                ${D(p.name)}
                ${p.roomName?`<div class="sub">${D(p.roomName)}</div>`:""}
              </td>
              <td class="center">${p.qty}</td>
              <td class="center">${D(p.unit)}</td>
              <td class="center">${v}</td>
              <td class="right">${O(p.price)}</td>
              <td class="right amount">${O(p.sum)}</td>
              <td class="center check"></td>
            </tr>`}).join(""),j=[f.address?`Адрес: ${D(f.address)}`:"",f.phone?`Тел.: ${D(f.phone)}`:""].filter(Boolean).join(" · ");return`
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
                <td colspan="8">${D(f.name)}${j?` — ${j}`:""}</td>
              </tr>
              ${d}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="6" class="right">Итого по магазину</td>
                <td class="right amount">${O(f.sum)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>`}).join(""),l=[];s.shortageCount>0&&l.push(`Позиций с нехваткой на складе магазина: ${s.shortageCount} — уточните наличие перед выездом`),s.unknownShopCount>0&&l.push(`Позиций без выбранного магазина: ${s.unknownShopCount}`),s.saved>0&&l.push(`Экономия за счёт выбора магазина: ${O(s.saved)}`);const o=l.length?`<div class="notes">${l.map(f=>`<div>• ${f}</div>`).join("")}</div>`:"",c=`
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
      content: "${Ne(`Список закупок · объект ${t.object_code||""}`.trim())}";
      font-family: Arial, sans-serif;
      font-size: 8.5pt;
      color: #6B4508;
    }
    @top-right {
      content: "${Ne(t.client_name||i)}";
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
`,u=s.shops.length,b=`
  <div class="header">
    <div class="brand"><img class="brand-logo" src="${window.location.origin}/logo-print.png" alt="FixKey"/><b class="brand-word">Fix<span>Key</span></b></div>
    <div class="doc-title">
      <h1>Список на закупку</h1>
      <p>Объект № ${D(t.object_code)}</p>
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
      <div class="value">${D(t.object_code)}</div>
    </div>
    <div>
      <div class="label">Заказчик</div>
      <div class="value">${D(t.client_name)}</div>
    </div>
    <div>
      <div class="label">Адрес объекта</div>
      <div class="value">${D(t.address||"—")}</div>
    </div>
    <div>
      <div class="label">Магазинов в списке</div>
      <div class="value">${u}</div>
    </div>
  </div>

  ${o}

  ${m}

  <div class="summary">
    <div class="summary-box">
      ${s.shops.map(f=>`
      <div class="summary-row">
        <span>${D(f.name)}</span>
        <span>${O(f.sum)}</span>
      </div>`).join("")}
      <div class="summary-total">
        <span>ИТОГО:</span>
        <span>${O(s.total)}</span>
      </div>
    </div>
  </div>

  <hr class="thin" />

  <div class="parties">
    <div>
      <div class="label">Закупку производит</div>
      <div class="name">${D(i)}</div>
    </div>
    <div>
      <div class="label">Объект</div>
      <div class="name">${D(t.client_name)}</div>
    </div>
  </div>`,g=`Список на закупку № ${t.object_code} — ${D(t.client_name)}`;return{styles:c,bodyContent:b,title:g}}function Cs(t,a,n,i,s=!1){const{styles:m,bodyContent:l,title:o}=at(t,a,n,i),c=`<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8" />
<title>${o}</title>
<style>${m}</style>
</head>
<body>
<div class="est-root">${l}</div>
</body>
</html>`,u=window.open("","_blank","width=900,height=1000");u&&(u.document.open(),u.document.write(c),u.document.close(),s&&(u.onload=()=>{u.focus(),u.print()}))}async function $s(t,a,n,i){const{styles:s,bodyContent:m}=at(t,a,n,i);await vt(l=>{l.id="pdf-scope-purchase",l.className="est-root",l.innerHTML=`<style>${Nt(s,"#pdf-scope-purchase")}</style>${m}`},{filename:`Список на закупку ${t.object_code}.pdf`,mode:"save"})}function xs({open:t,onOpenChange:a,memberId:n,memberName:i,onSaved:s}){const[m,l]=r.useState(""),[o,c]=r.useState(!1),[u,b]=r.useState(""),[g,f]=r.useState(!1),d=p=>{a(p),p||(l(""),b(""),f(!1))},j=async()=>{if(b(""),m.length<6){b("Пароль должен быть не короче 6 символов");return}if(n){c(!0);try{await B.setPassword(n,m),f(!0),l(""),s==null||s()}catch(p){b(p instanceof Error?p.message:"Не удалось изменить пароль")}finally{c(!1)}}};return e.jsx(Ce,{open:t,onOpenChange:d,children:e.jsxs($e,{className:"bg-[#1f1f1f] border-white/10 text-white sm:max-w-sm",children:[e.jsx(ke,{children:e.jsxs(Ee,{children:["Пароль для входа — ",i]})}),e.jsxs("div",{className:"flex flex-col gap-3 mt-2",children:[e.jsxs("div",{className:"flex flex-col gap-1.5",children:[e.jsx("label",{className:"text-xs text-white/50",children:"Новый пароль"}),e.jsx("input",{type:"text",value:m,onChange:p=>{l(p.target.value),f(!1)},placeholder:"Минимум 6 символов",className:"bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"})]}),u&&e.jsxs("p",{className:"text-sm text-red-400 flex items-center gap-1.5",children:[e.jsx(h,{name:"CircleAlert",size:15}),u]}),g&&e.jsxs("p",{className:"text-sm text-green-400 flex items-center gap-1.5",children:[e.jsx(h,{name:"CircleCheck",size:15}),"Пароль обновлён — сообщите его пользователю"]}),e.jsx("button",{onClick:j,disabled:o,className:"mt-1 flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm px-4 py-3 rounded-lg disabled:opacity-60",children:o?e.jsx(h,{name:"Loader2",size:16,className:"animate-spin"}):"Сохранить пароль"})]})]})})}function ps(){const{user:t}=me(),[a,n]=r.useState([]),[i,s]=r.useState([]),[m,l]=r.useState(!0),[o,c]=r.useState(!1),[u,b]=r.useState(!1),[g,f]=r.useState(""),[d,j]=r.useState(null),[p,w]=r.useState(""),[v,y]=r.useState(""),[S,_]=r.useState(""),[N,$]=r.useState(""),[T,se]=r.useState([]),M=(t==null?void 0:t.role)==="owner"||(t==null?void 0:t.role)==="admin",[F,ae]=r.useState(null),U=()=>{l(!0),Promise.all([B.list(),yt.list()]).then(([x,C])=>{n(x.members.filter(I=>I.role==="client")),s(C.objects)}).finally(()=>l(!1))};r.useEffect(()=>{U()},[]);const H=()=>{j(null),w(""),y(""),_(""),$(""),se([]),f("")},nt=x=>{se(C=>C.includes(x)?C.filter(I=>I!==x):[...C,x])},it=()=>{H(),c(!0)},pe=x=>{var C;j(x.id),w(x.full_name),y(x.email),_(""),$(x.phone||""),se(((C=x.objects)==null?void 0:C.map(I=>I.id))||[]),f(""),c(!0)},ot=async()=>{if(f(""),d){if(T.length===0){f("Выберите хотя бы один объект");return}b(!0);try{await B.updateObjects(d,T),c(!1),H(),U()}catch(x){f(x instanceof Error?x.message:"Ошибка сохранения")}finally{b(!1)}return}if(p.trim().length<2){f("Введите имя");return}if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)){f("Введите корректный email");return}if(S.length<6){f("Пароль должен быть не короче 6 символов");return}if(T.length===0){f("Выберите хотя бы один объект для заказчика");return}b(!0);try{await B.create({full_name:p,email:v,password:S,role:"client",phone:N,object_ids:T}),c(!1),H(),U()}catch(x){f(x instanceof Error?x.message:"Ошибка сохранения")}finally{b(!1)}},he=async x=>{await B.remove(x),U()},fe=x=>new Date(x).toLocaleDateString("ru-RU",{day:"numeric",month:"short",year:"numeric"});return e.jsxs(R,{title:"Заказчики",subtitle:"База ваших клиентов с доступом в кабинет",children:[M&&e.jsx("div",{className:"flex justify-end mb-6",children:e.jsxs("button",{onClick:it,className:"w-full sm:w-auto justify-center min-h-[44px] sm:min-h-0 flex items-center gap-2 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm px-4 py-2.5 rounded-lg",children:[e.jsx(h,{name:"UserPlus",size:16}),"Создать логин заказчика"]})}),e.jsx("div",{className:"md:bg-[#1f1f1f] md:border md:border-white/10 md:rounded-xl md:p-5",children:m?e.jsx("div",{className:"flex justify-center py-16",children:e.jsx(h,{name:"Loader2",size:24,className:"animate-spin text-white/40"})}):a.length===0?e.jsx("div",{className:"text-center py-16 text-white/30 text-sm",children:"Пока нет заказчиков с доступом в кабинет"}):e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"md:hidden flex flex-col gap-3",children:a.map(x=>e.jsx(Ct,{title:x.full_name,subtitle:x.email,rows:[{label:"Объекты",value:x.objects&&x.objects.length>0?x.objects.map(C=>C.object_code).join(", "):"—"},{label:"С нами с",value:fe(x.created_at)}],actions:M?e.jsxs(e.Fragment,{children:[e.jsx(je,{icon:e.jsx(h,{name:"Pencil",size:15}),label:"Объекты",onClick:()=>pe(x)}),e.jsx(je,{icon:e.jsx(h,{name:"KeyRound",size:15}),label:"Пароль",onClick:()=>ae(x)}),e.jsx("div",{className:"w-10 h-10 flex items-center justify-center rounded-lg bg-white/5 shrink-0",children:e.jsx(we,{onConfirm:()=>he(x.id)})})]}):void 0},x.id))}),e.jsx("div",{className:"hidden md:block overflow-x-auto",children:e.jsxs("table",{className:"w-full text-sm",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"text-white/40 text-xs uppercase border-b border-white/10",children:[e.jsx("th",{className:"text-left font-medium py-2 pr-4",children:"Имя"}),e.jsx("th",{className:"text-left font-medium py-2 pr-4",children:"Email"}),e.jsx("th",{className:"text-left font-medium py-2 pr-4",children:"Объекты"}),e.jsx("th",{className:"text-left font-medium py-2 pr-4",children:"С нами с"}),M&&e.jsx("th",{className:"text-left font-medium py-2 pr-4",children:"Действия"})]})}),e.jsx("tbody",{children:a.map(x=>e.jsxs("tr",{className:"border-b border-white/5 last:border-0",children:[e.jsx("td",{className:"py-3 pr-4",children:x.full_name}),e.jsx("td",{className:"py-3 pr-4 text-white/60",children:x.email}),e.jsx("td",{className:"py-3 pr-4 text-white/60",children:x.objects&&x.objects.length>0?x.objects.map(C=>C.object_code).join(", "):"—"}),e.jsx("td",{className:"py-3 pr-4 text-white/40",children:fe(x.created_at)}),M&&e.jsx("td",{className:"py-3 pr-4",children:e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("button",{onClick:()=>pe(x),className:"text-white/40 hover:text-white transition-colors",title:"Изменить объекты",children:e.jsx(h,{name:"Pencil",size:16})}),e.jsx("button",{onClick:()=>ae(x),className:"text-white/40 hover:text-white transition-colors",title:"Задать пароль для входа",children:e.jsx(h,{name:"KeyRound",size:16})}),e.jsx(we,{onConfirm:()=>he(x.id)})]})})]},x.id))})]})})]})}),e.jsx(Ce,{open:o,onOpenChange:x=>{c(x),x||H()},children:e.jsxs($e,{className:"bg-[#1f1f1f] border-white/10 text-white sm:max-w-md max-h-[85vh] overflow-y-auto",children:[e.jsx(ke,{children:e.jsx(Ee,{children:d?"Объекты заказчика":"Новый заказчик"})}),e.jsxs("div",{className:"flex flex-col gap-3 mt-2",children:[!d&&e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"flex flex-col gap-1.5",children:[e.jsx("label",{className:"text-xs text-white/50",children:"Имя"}),e.jsx("input",{value:p,onChange:x=>w(x.target.value),placeholder:"Иванов Иван",className:"bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"})]}),e.jsxs("div",{className:"flex flex-col gap-1.5",children:[e.jsx("label",{className:"text-xs text-white/50",children:"Email"}),e.jsx("input",{type:"email",value:v,onChange:x=>y(x.target.value),placeholder:"user@example.com",className:"bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"})]}),e.jsxs("div",{className:"flex flex-col gap-1.5",children:[e.jsx("label",{className:"text-xs text-white/50",children:"Пароль"}),e.jsx("input",{type:"password",value:S,onChange:x=>_(x.target.value),placeholder:"••••••••",className:"bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"})]}),e.jsxs("div",{className:"flex flex-col gap-1.5",children:[e.jsx("label",{className:"text-xs text-white/50",children:"Телефон"}),e.jsx("input",{value:N,onChange:x=>$(x.target.value),placeholder:"+7 900 000 00 00",className:"bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50"})]})]}),e.jsxs("div",{className:"flex flex-col gap-1.5",children:[e.jsx("label",{className:"text-xs text-white/50",children:"Доступные объекты"}),i.length===0?e.jsx("p",{className:"text-xs text-white/30",children:"Сначала создайте хотя бы один объект"}):e.jsx("div",{className:"flex flex-col gap-1.5 max-h-40 overflow-y-auto border border-white/10 rounded-lg p-2",children:i.map(x=>e.jsxs("label",{className:"flex items-center gap-2 text-sm px-2 py-1.5 rounded hover:bg-white/5 cursor-pointer",children:[e.jsx("input",{type:"checkbox",checked:T.includes(x.id),onChange:()=>nt(x.id),className:"accent-[#D4AF37]"}),e.jsx("span",{className:"text-[#D4AF37]",children:x.object_code}),e.jsxs("span",{className:"text-white/50",children:["— ",x.client_name]})]},x.id))})]}),g&&e.jsxs("p",{className:"text-sm text-red-400 flex items-center gap-1.5",children:[e.jsx(h,{name:"CircleAlert",size:15}),g]}),e.jsx("button",{onClick:ot,disabled:u,className:"mt-2 flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm px-4 py-3 rounded-lg disabled:opacity-60",children:u?e.jsx(h,{name:"Loader2",size:16,className:"animate-spin"}):d?"Сохранить объекты":"Создать логин заказчика"})]})]})}),e.jsx(xs,{open:!!F,onOpenChange:x=>{x||ae(null)},memberId:(F==null?void 0:F.id)??null,memberName:(F==null?void 0:F.full_name)??""})]})}const ks=Object.freeze(Object.defineProperty({__proto__:null,default:ps},Symbol.toStringTag,{value:"Module"}));export{xe as A,tt as C,we as D,as as I,_s as O,ss as P,xs as S,ws as a,G as b,Z as c,$s as d,J as e,Q as f,X as g,te as h,ee as i,Ns as j,ie as k,ys as l,ms as m,is as n,st as o,Cs as p,Ds as q,Ss as r,As as s,ks as t,ts as u,vs as y};
