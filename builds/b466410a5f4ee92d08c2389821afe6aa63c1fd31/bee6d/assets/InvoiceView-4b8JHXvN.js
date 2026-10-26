import{r as d,j as e,I as k,ab as F,R as Ee,L as H,k as te,D as Be,l as Le,m as Re,n as Me,aX as Ie,t as Ne,w as ke,B as Oe,x as Te,a$ as qe,ao as Ue,y as J,S as He,ag as ge,af as be,ae as Ke,ah as Ve}from"./index-B3Pe9cPZ.js";import{b as _e}from"./InvoiceEdit-CevKlLyR.js";import{d as Se,r as Xe,c as Ye}from"./ExecutorPortal-DwCLXqIB.js";import{n as E,C as K,p as Ge}from"./Company-BbFUkJZ8.js";import{D as se,C as Je}from"./Customers-BsB8r3hk.js";import{s as Qe}from"./ExecutorDetail-BLBYPQAG.js";const Q=t=>new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0}).format(t)+" ₽",yt=t=>new Date(t).toLocaleString("ru-RU",{day:"numeric",month:"numeric",year:"numeric",hour:"2-digit",minute:"2-digit"}),wt=t=>t?"Да":"Нет",vt=t=>t&&t.charAt(0).toUpperCase()+t.slice(1),ae="fixkey_pending_invoice_pay";let W=null;const We=()=>(W||(W=F.payConfig().then(t=>t.online).catch(()=>!1)),W);function Ze(t){const[r,i]=d.useState(null);return d.useEffect(()=>{const u=new URLSearchParams(window.location.search),a=Number(u.get("paid_invoice")||0),f=Number(sessionStorage.getItem(ae)||0),n=a||f;if(!n)return;if(sessionStorage.removeItem(ae),a){u.delete("paid_invoice");const l=u.toString();window.history.replaceState(null,"",window.location.pathname+(l?`?${l}`:""))}let m=0;const h=async()=>{m+=1;try{const l=await F.payCheck(n);if(l.invoice_status==="paid"){i({ok:!0,text:"Оплата получена — спасибо! Счёт отмечен оплаченным."}),t(),window.dispatchEvent(new Event("invoice-paid"));return}if(l.payment==="canceled"){i({ok:!1,text:"Платёж отменён. Можно попробовать оплатить ещё раз."});return}}catch{}m<6?setTimeout(h,3e3):i({ok:!1,text:"Платёж ещё обрабатывается. Статус счёта обновится автоматически."})};h()},[]),{message:r,clear:()=>i(null)}}function et({message:t,onClose:r}){return t?e.jsxs("div",{className:`mb-4 flex items-start gap-3 rounded-xl border p-4 text-sm ${t.ok?"border-emerald-500/30 bg-emerald-500/10":"border-[#D4AF37]/30 bg-[#D4AF37]/10"}`,children:[e.jsx(k,{name:t.ok?"BadgeCheck":"Clock",size:20,className:t.ok?"text-emerald-400":"text-[#D4AF37]"}),e.jsx("p",{className:"flex-1",children:t.text}),e.jsx("button",{onClick:r,className:"text-white/40 hover:text-white","aria-label":"Закрыть",children:e.jsx(k,{name:"X",size:16})})]}):null}function tt({invoiceId:t,amountLabel:r,className:i=""}){const[u,a]=d.useState(!1),[f,n]=d.useState(!1),[m,h]=d.useState(""),[l,$]=d.useState(!1),[_,p]=d.useState(""),[o,v]=d.useState(null),[b,N]=d.useState(!1);if(d.useEffect(()=>{We().then(a)},[]),d.useEffect(()=>{u&&F.payPreview(t).then(g=>v(g.receipts&&g.items.length?g.items:null)).catch(()=>null)},[u,t]),!u)return null;const s=async()=>{n(!0),h("");try{const g=new URL(window.location.href);g.searchParams.set("paid_invoice",String(t));const{confirmation_url:x}=await F.pay(t,g.toString(),l?_.trim():void 0);sessionStorage.setItem(ae,String(t)),window.location.href=x}catch(g){const x=g instanceof Error?g.message:"Не удалось перейти к оплате";x.includes("почту для электронного чека")?($(!0),l&&h("Проверьте адрес почты")):h(x),n(!1)}};return e.jsxs("div",{className:`flex flex-col gap-1 ${i}`,children:[e.jsxs("button",{onClick:s,disabled:f,className:"flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-600 disabled:opacity-60",children:[e.jsx(k,{name:f?"Loader2":"CreditCard",size:14,className:f?"animate-spin":""}),"Оплатить онлайн",r?` ${r}`:""]}),o&&e.jsxs("div",{className:"mt-1",children:[e.jsxs("button",{type:"button",onClick:()=>N(g=>!g),className:"flex items-center gap-1 text-xs text-white/50 hover:text-white",children:[e.jsx(k,{name:"ReceiptText",size:12}),"Что будет в чеке (",o.length," поз.)",e.jsx(k,{name:b?"ChevronUp":"ChevronDown",size:12})]}),b&&e.jsxs("div",{className:"mt-2 max-h-72 overflow-y-auto rounded-lg border border-white/10 bg-[#161616] p-3",children:[e.jsx(Ee,{items:o,compact:!0}),e.jsx("p",{className:"mt-2 text-[11px] text-white/40",children:"Электронный чек с этим перечнем придёт на почту после оплаты. На странице ЮKassa показывается только итоговая сумма."})]})]}),l&&e.jsxs("div",{className:"flex flex-col gap-1 mt-1",children:[e.jsx("p",{className:"text-xs text-white/50",children:"Куда прислать электронный чек?"}),e.jsxs("div",{className:"flex gap-1",children:[e.jsx("input",{type:"email",value:_,onChange:g=>p(g.target.value),placeholder:"you@mail.ru",className:"min-w-0 flex-1 rounded-lg border border-white/10 bg-[#161616] px-2.5 py-1.5 text-sm outline-none focus:border-emerald-500/60"}),e.jsx("button",{onClick:s,disabled:f||!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(_.trim()),className:"rounded-lg bg-emerald-500 px-3 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50",children:"Далее"})]})]}),m&&e.jsx("p",{className:"text-xs text-red-400",children:m})]})}const je={issued:{label:"Выставлен",clientLabel:"Ожидает оплаты",cls:"bg-white/10 text-white/50"},sent:{label:"Отправлен",clientLabel:"Ожидает оплаты",cls:"bg-blue-500/20 text-blue-300"},paid:{label:"Оплачен",clientLabel:"Оплачен",cls:"bg-green-500/20 text-green-300"}},ye=t=>new Date(String(t).slice(0,10)).toLocaleDateString("ru-RU"),st=t=>t.status!=="paid"&&!!t.due_date&&new Date(String(t.due_date).slice(0,10))<new Date(new Date().toDateString());async function at(t){const r=await F.get(t);await Se(_e(r),`Счёт ${r.invoice_number}`)}function Nt({objectId:t,isClient:r=!1}){const[i,u]=d.useState([]),[a,f]=d.useState(!0),[n,m]=d.useState(null),h=()=>F.list({object_id:t}).then(o=>u(o.invoices)).catch(()=>u([])).finally(()=>f(!1));d.useEffect(()=>{h()},[t]);const l=Ze(()=>h()),$=async o=>{m(o);try{await at(o)}finally{m(null)}},_=i.filter(o=>o.status==="paid").reduce((o,v)=>o+Number(v.total_amount||0),0),p=i.reduce((o,v)=>o+Number(v.total_amount||0),0);return r&&!a&&i.length===0?null:e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"mt-6",children:e.jsx(et,{message:l.message,onClose:l.clear})}),e.jsxs("div",{className:"mb-2 flex items-center justify-between",children:[e.jsx("p",{className:"text-xs uppercase tracking-wide text-white/40",children:"Счета на оплату"}),!r&&e.jsxs(H,{to:`/cabinet/objects/${t}/invoices/new`,className:"flex items-center gap-1 text-xs text-[#D4AF37] transition-colors hover:text-[#B8860B]",children:[e.jsx(k,{name:"Plus",size:13}),"Выставить счёт"]})]}),a?e.jsx("div",{className:"flex justify-center py-6",children:e.jsx(k,{name:"Loader2",size:20,className:"animate-spin text-white/40"})}):i.length===0?e.jsx("div",{className:"py-6 text-center text-sm text-white/30",children:"Счетов пока нет"}):e.jsxs("div",{className:"flex flex-col gap-2",children:[i.map(o=>{const v=je[o.status]||je.issued,b=[o.contract_number&&`Договор № ${o.contract_number}`,o.act_number&&`Акт № ${o.act_number}`].filter(Boolean).join(" · ")||"Без основания",N=e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"mb-1 flex items-center justify-between gap-2",children:[e.jsxs("p",{className:"text-sm font-medium",children:["Счёт № ",o.invoice_number," ",e.jsxs("span",{className:"text-white/40",children:["от ",ye(o.invoice_date)]})]}),e.jsxs("div",{className:"flex flex-wrap items-center justify-end gap-1",children:[e.jsx("span",{className:te("rounded-full px-2 py-0.5 text-xs",v.cls),children:r?v.clientLabel:v.label}),o.status==="paid"&&o.paid_online&&e.jsx("span",{className:"rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-300",children:"онлайн"}),o.status==="paid"&&o.paid_source==="bank"&&e.jsx("span",{className:"rounded-full bg-[#FFDD2D]/15 px-2 py-0.5 text-xs text-[#FFDD2D]",children:"по выписке"}),st(o)&&e.jsx("span",{className:"rounded-full bg-red-500/20 px-2 py-0.5 text-xs text-red-300",children:"просрочен"})]})]}),e.jsx("p",{className:"text-lg font-semibold",children:Q(Number(o.total_amount))}),e.jsxs("p",{className:"text-xs text-white/40",children:[b,o.due_date&&o.status!=="paid"?` · оплатить до ${ye(o.due_date)}`:""]})]});return r?e.jsxs("div",{className:"rounded-lg border border-white/10 bg-[#161616] p-4",children:[N,e.jsxs("div",{className:"mt-3 flex flex-wrap items-start gap-2",children:[o.status!=="paid"&&e.jsx(tt,{invoiceId:o.id}),e.jsxs("button",{onClick:()=>$(o.id),disabled:n===o.id,className:"flex items-center gap-1.5 rounded-lg bg-[#D4AF37] px-3 py-2 text-sm font-medium text-[#161616] transition-colors hover:bg-[#B8860B] disabled:opacity-60",children:[e.jsx(k,{name:n===o.id?"Loader2":"Download",size:14,className:n===o.id?"animate-spin":""}),"Скачать PDF"]})]})]},o.id):e.jsx(H,{to:`/cabinet/objects/${t}/invoices/${o.id}`,className:"block rounded-lg border border-white/10 bg-[#161616] p-4 transition-colors hover:border-[#D4AF37]/40",children:N},o.id)}),e.jsxs("p",{className:"pt-1 text-right text-xs text-white/40",children:["Оплачено ",Q(_)," из ",Q(p)]})]})]})}const nt=t=>new Intl.NumberFormat("ru-RU",{maximumFractionDigits:2}).format(t)+" ₽";function rt({open:t,onOpenChange:r,services:i,onAdd:u}){const[a,f]=d.useState(""),[n,m]=d.useState(""),[h,l]=d.useState(""),[$,_]=d.useState(new Set);d.useEffect(()=>{t&&(f(""),m(""),l(""),_(new Set))},[t]);const p=d.useMemo(()=>Array.from(new Set(i.map(c=>c.category).filter(Boolean))).sort(),[i]),o=d.useMemo(()=>Array.from(new Set(i.filter(c=>!n||c.category===n).map(c=>c.subcategory).filter(Boolean))).sort(),[i,n]),b=a.trim().length>0||n!=="",N=d.useMemo(()=>{const c=a.trim().toLowerCase();return i.filter(y=>!(n&&y.category!==n||h&&y.subcategory!==h||c&&!`${y.name} ${y.category} ${y.subcategory}`.toLowerCase().includes(c)))},[i,a,n,h]),s=d.useMemo(()=>{const c=new Map;return N.forEach(y=>{const w=y.subcategory||"Без подкатегории";c.has(w)||c.set(w,[]),c.get(w).push(y)}),Array.from(c.entries())},[N]),g=c=>{_(y=>{const w=new Set(y);return w.has(c)?w.delete(c):w.add(c),w})},x=()=>{const c=i.filter(y=>$.has(y.id));c.length!==0&&(u(c),r(!1))};return e.jsx(Be,{open:t,onOpenChange:r,children:e.jsxs(Le,{className:"bg-[#1f1f1f] border-white/10 text-white sm:max-w-lg max-h-[85vh] flex flex-col",children:[e.jsxs(Re,{children:[e.jsx(Me,{children:"Добавить из справочника"}),e.jsx(Ie,{className:"text-white/40",children:"Выберите категорию и отметьте нужные работы"})]}),e.jsxs("div",{className:"flex flex-col gap-3 overflow-hidden flex-1",children:[e.jsxs("div",{className:"relative",children:[e.jsx(k,{name:"Search",size:15,className:"absolute left-3 top-1/2 -translate-y-1/2 text-white/30"}),e.jsx("input",{value:a,onChange:c=>f(c.target.value),placeholder:"Поиск по названию, категории, подкатегории...",className:"w-full bg-[#161616] border border-white/15 shadow-inner shadow-black/20 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/30"})]}),e.jsxs("div",{className:`grid grid-cols-1 ${n?"sm:grid-cols-2":""} gap-3`,children:[e.jsxs("div",{className:"flex flex-col gap-1.5",children:[e.jsx("label",{className:"text-xs text-white/50",children:"Категория"}),e.jsxs("select",{value:n,onChange:c=>{m(c.target.value),l("")},className:"bg-[#161616] border border-white/15 shadow-inner shadow-black/20 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/30",children:[e.jsx("option",{value:"",children:"Все категории"}),p.map(c=>e.jsx("option",{value:c,children:c},c))]})]}),n&&e.jsxs("div",{className:"flex flex-col gap-1.5",children:[e.jsx("label",{className:"text-xs text-white/50",children:"Подкатегория"}),e.jsxs("select",{value:h,onChange:c=>l(c.target.value),className:"bg-[#161616] border border-white/15 shadow-inner shadow-black/20 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/30",children:[e.jsx("option",{value:"",children:"Все подкатегории"}),o.map(c=>e.jsx("option",{value:c,children:c},c))]})]})]}),e.jsx("div",{className:"flex-1 overflow-y-auto border border-white/10 rounded-lg min-h-[180px] sm:min-h-[220px]",children:b?N.length===0?e.jsxs("div",{className:"flex flex-col items-center justify-center h-full py-16 text-center",children:[e.jsx(k,{name:"SearchX",size:28,className:"text-white/15 mb-3"}),e.jsx("p",{className:"text-sm text-white/40",children:"Ничего не найдено"})]}):e.jsxs("div",{className:"p-2",children:[e.jsxs("p",{className:"text-xs text-white/30 px-2 py-1.5",children:["Все работы из категории (",N.length,")"]}),s.map(([c,y])=>e.jsxs("div",{className:"mb-1",children:[e.jsx("p",{className:"text-xs font-medium text-[#D4AF37] px-2 py-1.5",children:c}),y.map(w=>e.jsxs("label",{className:"flex items-start gap-2.5 px-2 py-2.5 sm:py-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer",children:[e.jsx("input",{type:"checkbox",checked:$.has(w.id),onChange:()=>g(w.id),className:"mt-0.5 w-5 h-5 sm:w-4 sm:h-4 shrink-0 accent-[#D4AF37]"}),e.jsxs("div",{className:"flex-1 min-w-0",children:[e.jsx("p",{className:"text-sm break-words",children:w.name}),e.jsxs("p",{className:"text-xs text-white/40",children:[nt(w.price)," / ",w.unit]})]})]},w.id))]},c))]}):e.jsxs("div",{className:"flex flex-col items-center justify-center h-full py-16 text-center",children:[e.jsx(k,{name:"Search",size:28,className:"text-white/15 mb-3"}),e.jsx("p",{className:"text-sm text-white/40",children:"Введите запрос или выберите категорию"})]})}),e.jsxs("p",{className:"text-xs text-white/40",children:["Выбрано: ",$.size," из ",N.length]})]}),e.jsxs("div",{className:"flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2",children:[e.jsx("button",{onClick:()=>r(!1),className:"w-full sm:w-auto min-h-[44px] sm:min-h-0 px-4 py-2.5 rounded-lg text-sm bg-white/5 hover:bg-white/10 transition-colors",children:"Отмена"}),e.jsx("button",{onClick:x,disabled:$.size===0,className:"w-full sm:w-auto min-h-[44px] sm:min-h-0 px-4 py-2.5 rounded-lg text-sm bg-red-600 hover:bg-red-700 transition-colors text-white disabled:opacity-50",children:"Добавить"})]})]})})}const we=t=>new Intl.NumberFormat("ru-RU",{maximumFractionDigits:2}).format(Number.isFinite(t)?t:0)+" ₽",ne="bg-[#161616] border border-white/15 shadow-inner shadow-black/20 rounded-lg px-3 py-2.5 outline-none w-full text-base focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/30";function B({label:t,children:r}){return e.jsxs("label",{className:"flex flex-col gap-1 text-xs text-white/40 min-w-0",children:[t,r]})}function q({value:t,onChange:r}){return e.jsx("input",{type:"number",inputMode:"decimal",value:t===0?"":t,onChange:i=>r(i.target.value===""?0:Number(i.target.value)),className:ne})}function it({work:t,updateWork:r,removeWork:i}){const u=!!t.service_id;return e.jsxs("div",{className:"bg-[#161616]/60 border border-white/10 rounded-xl p-3 flex flex-col gap-3",children:[e.jsxs("div",{className:"min-w-0",children:[u?e.jsx("p",{className:"text-sm font-medium leading-snug break-words",children:t.name}):e.jsx(B,{label:"Работа",children:e.jsx("textarea",{value:t.name,onChange:a=>r(t.key,{name:a.target.value}),placeholder:"Название работы",rows:2,className:`${ne} resize-none leading-snug text-white`})}),(t.category||t.subcategory)&&e.jsx("p",{className:"text-xs text-white/35 mt-1 break-words",children:[t.category,t.subcategory].filter(Boolean).join(" → ")})]}),e.jsxs("div",{className:"grid grid-cols-2 gap-2",children:[e.jsx(B,{label:"Ед.",children:u?e.jsx("p",{className:"py-2.5 text-base text-white",children:t.unit}):e.jsx("input",{value:t.unit,onChange:a=>r(t.key,{unit:a.target.value}),className:`${ne} text-white`})}),e.jsx(B,{label:"Кол-во",children:e.jsx(q,{value:t.quantity,onChange:a=>r(t.key,{quantity:a})})}),e.jsx(B,{label:"Раз",children:e.jsx(q,{value:t.times,onChange:a=>r(t.key,{times:a})})}),e.jsx(B,{label:"Цена",children:u?e.jsx("p",{className:"py-2.5 text-base text-white break-all",children:we(t.price)}):e.jsx(q,{value:t.price,onChange:a=>r(t.key,{price:a})})}),e.jsx(B,{label:"Скидка %",children:e.jsx(q,{value:t.discountPercent,onChange:a=>r(t.key,{discountPercent:a})})}),e.jsx(B,{label:"Сумма",children:e.jsx("p",{className:"py-2.5 text-base font-medium text-white break-all",children:t.quantity>0&&t.times>0&&t.price>0?we(t.amount):"—"})})]}),e.jsx(se,{size:15,label:"Удалить работу",className:"w-full min-h-[44px] justify-center rounded-lg bg-red-500/10 text-red-300 text-sm",title:"Удалить работу?",description:"Позиция будет убрана из сметы.",onConfirm:()=>i(t.key)})]})}const Z=t=>new Intl.NumberFormat("ru-RU",{maximumFractionDigits:2}).format(Number.isFinite(t)?t:0)+" ₽";function ot({room:t,objectRooms:r,services:i,onChange:u,onRemove:a}){const[f,n]=d.useState(!1),[m,h]=d.useState(!1),l=d.useRef(null);d.useEffect(()=>{const s=g=>{l.current&&!l.current.contains(g.target)&&n(!1)};return document.addEventListener("mousedown",s),()=>document.removeEventListener("mousedown",s)},[]);const $=s=>Math.round(s*100)/100,_=s=>{const x=s.price*s.quantity*(s.times||1)*(1-(s.discountPercent||0)/100);return $(x)},p=s=>{u({room_id:s.id,name:s.name,area:E(s.area),perimeter:E(s.perimeter)}),n(!1)},o=s=>{const g=s.map(x=>{const c={price:x.price,quantity:1,times:1,discountPercent:0};return{key:`${x.id}-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,service_id:x.id,name:x.name,category:x.category,subcategory:x.subcategory,unit:x.unit,...c,amount:_(c)}});u({works:[...t.works,...g]})},v=()=>{const s={price:0,quantity:1,times:1,discountPercent:0},g={key:`custom-${Date.now()}`,service_id:null,name:"",unit:"м²",...s,amount:0};u({works:[...t.works,g]})},b=(s,g)=>{u({works:t.works.map(x=>{if(x.key!==s)return x;const c={...x,...g};return c.amount=_(c),c})})},N=s=>{u({works:t.works.filter(g=>g.key!==s)})};return e.jsxs("div",{className:"bg-[#1f1f1f] border border-white/10 rounded-xl p-3 sm:p-5",children:[e.jsxs("div",{className:"flex items-center justify-between mb-4 flex-wrap gap-2",children:[e.jsx("p",{className:"text-base font-medium break-words min-w-0",children:t.name||"Помещение"}),e.jsxs("div",{className:"grid grid-cols-2 gap-2 w-full sm:flex sm:items-center sm:flex-wrap sm:w-auto",children:[e.jsxs("div",{className:"relative",ref:l,children:[e.jsxs("button",{onClick:()=>n(s=>!s),className:"w-full sm:w-auto justify-center min-h-[44px] sm:min-h-0 flex items-center gap-1.5 text-sm text-white/70 hover:text-white bg-white/5 hover:bg-white/10 transition-colors px-3 py-1.5 rounded-lg",children:[e.jsx(k,{name:"LayoutTemplate",size:14}),"Эталон из объекта"]}),f&&e.jsx("div",{className:"absolute left-0 z-30 mt-1 w-64 max-w-[80vw] bg-[#1f1f1f] border border-white/10 rounded-lg max-h-64 overflow-y-auto shadow-lg",children:r.length===0?e.jsx("p",{className:"text-xs text-white/30 px-3 py-2",children:"Нет эталонных помещений"}):r.map(s=>e.jsxs("button",{onClick:()=>p(s),className:"w-full flex flex-col items-start px-3 py-2 text-left hover:bg-white/5 transition-colors",children:[e.jsx("span",{className:"text-sm",children:s.name}),e.jsxs("span",{className:"text-xs text-white/30",children:[E(s.area)," м² · ",E(s.perimeter)," м/п",s.ceiling_height?` · h ${E(s.ceiling_height)} м`:"",s.wall_area?` · стены ${E(s.wall_area)} м²`:""]})]},s.id))})]}),e.jsxs("button",{onClick:()=>h(!0),className:"col-span-2 order-first sm:order-none justify-center min-h-[44px] sm:min-h-0 flex items-center gap-1.5 text-sm text-white bg-blue-500 hover:bg-blue-600 transition-colors px-3 py-1.5 rounded-lg",children:[e.jsx(k,{name:"Plus",size:14}),"Добавить из справочника"]}),e.jsxs("button",{onClick:v,className:"justify-center min-h-[44px] sm:min-h-0 flex items-center gap-1.5 text-sm text-white/70 hover:text-white bg-white/5 hover:bg-white/10 transition-colors px-3 py-1.5 rounded-lg",children:[e.jsx(k,{name:"PenLine",size:14}),"Своя работа"]}),e.jsx(se,{size:16,className:"col-span-2 sm:col-span-1 flex justify-center items-center min-h-[44px] sm:min-h-0 rounded-lg bg-white/5 sm:bg-transparent text-white/30 sm:ml-1",label:"",title:"Удалить помещение?",description:"Помещение и все добавленные в него работы будут удалены из сметы.",onConfirm:a})]})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4 mb-4",children:[e.jsxs("div",{className:"flex flex-col gap-1.5",children:[e.jsx("label",{className:"text-xs text-white/50",children:"Название"}),e.jsx("input",{value:t.name,onChange:s=>u({name:s.target.value}),placeholder:"Санузел",className:"bg-[#161616] border border-white/15 shadow-inner shadow-black/20 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/30"})]}),e.jsxs("div",{className:"flex flex-col gap-1.5",children:[e.jsx("label",{className:"text-xs text-white/50",children:"Площадь (м²)"}),e.jsx("input",{value:t.area,onChange:s=>u({area:s.target.value}),type:"number",placeholder:"0.00",className:"bg-[#161616] border border-white/15 shadow-inner shadow-black/20 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/30"})]}),e.jsxs("div",{className:"flex flex-col gap-1.5",children:[e.jsx("label",{className:"text-xs text-white/50",children:"Периметр (м/п)"}),e.jsx("input",{value:t.perimeter,onChange:s=>u({perimeter:s.target.value}),type:"number",placeholder:"0.00",className:"bg-[#161616] border border-white/15 shadow-inner shadow-black/20 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/30"})]})]}),t.works.length===0?e.jsxs("div",{className:"flex flex-col items-center justify-center py-8 border border-dashed border-white/10 rounded-lg text-center",children:[e.jsx(k,{name:"ClipboardList",size:22,className:"text-white/20 mb-2"}),e.jsx("p",{className:"text-sm text-white/40",children:"Работы не добавлены"}),e.jsx("p",{className:"text-xs text-white/25 mt-1",children:"Нажмите «Добавить из справочника» вверху"})]}):e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"md:hidden flex flex-col gap-3",children:t.works.map(s=>e.jsx(it,{work:s,updateWork:b,removeWork:N},s.key))}),e.jsx("div",{className:"hidden md:block overflow-x-auto border border-white/10 rounded-lg",children:e.jsxs("table",{className:"w-full text-sm table-fixed",children:[e.jsxs("colgroup",{children:[e.jsx("col",{className:"w-auto"}),e.jsx("col",{className:"w-[8%]"}),e.jsx("col",{className:"w-[12%]"}),e.jsx("col",{className:"w-[10%]"}),e.jsx("col",{className:"w-[12%]"}),e.jsx("col",{className:"w-[10%]"}),e.jsx("col",{className:"w-[12%]"}),e.jsx("col",{className:"w-[6%]"})]}),e.jsx("thead",{children:e.jsxs("tr",{className:"text-white/40 text-xs uppercase bg-white/5",children:[e.jsx("th",{className:"text-left font-medium py-2 px-3",children:"Работа"}),e.jsx("th",{className:"text-left font-medium py-2 px-2",children:"Ед."}),e.jsx("th",{className:"text-left font-medium py-2 px-2",children:"Кол-во"}),e.jsx("th",{className:"text-left font-medium py-2 px-2",children:"Раз"}),e.jsx("th",{className:"text-left font-medium py-2 px-2",children:"Цена"}),e.jsx("th",{className:"text-left font-medium py-2 px-2",children:"Скидка%"}),e.jsx("th",{className:"text-left font-medium py-2 px-2",children:"Сумма"}),e.jsx("th",{})]})}),e.jsx("tbody",{children:t.works.map(s=>{const g=!!s.service_id;return e.jsxs("tr",{className:"border-t border-white/5 align-top",children:[e.jsxs("td",{className:"px-3 py-2",children:[g?e.jsx("p",{className:"px-2.5 py-1.5 text-sm font-medium leading-snug break-words",children:s.name}):e.jsx("textarea",{value:s.name,onChange:x=>b(s.key,{name:x.target.value}),placeholder:"Название работы",rows:2,className:"bg-[#161616] border border-white/15 shadow-inner shadow-black/20 rounded-lg px-2.5 py-1.5 outline-none w-full text-sm font-medium resize-none leading-snug focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/30"}),(s.category||s.subcategory)&&e.jsx("p",{className:"text-xs text-white/35 mt-1 px-0.5 break-words",children:[s.category,s.subcategory].filter(Boolean).join(" → ")})]}),e.jsx("td",{className:"px-2 py-2",children:g?e.jsx("p",{className:"px-2 py-1.5 text-sm",children:s.unit}):e.jsx("input",{value:s.unit,onChange:x=>b(s.key,{unit:x.target.value}),className:"bg-[#161616] border border-white/15 shadow-inner shadow-black/20 rounded-lg px-2 py-1.5 outline-none w-full text-sm focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/30"})}),e.jsx("td",{className:"px-2 py-2",children:e.jsx("input",{type:"number",value:s.quantity===0?"":s.quantity,onChange:x=>b(s.key,{quantity:x.target.value===""?0:Number(x.target.value)}),className:"bg-[#161616] border border-white/15 shadow-inner shadow-black/20 rounded-lg px-2 py-1.5 outline-none w-full text-sm focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/30"})}),e.jsx("td",{className:"px-2 py-2",children:e.jsx("input",{type:"number",value:s.times===0?"":s.times,onChange:x=>b(s.key,{times:x.target.value===""?0:Number(x.target.value)}),className:"bg-[#161616] border border-white/15 shadow-inner shadow-black/20 rounded-lg px-2 py-1.5 outline-none w-full text-sm focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/30"})}),e.jsx("td",{className:"px-2 py-2",children:g?e.jsx("p",{className:"px-2 py-1.5 text-sm whitespace-nowrap",children:Z(s.price)}):e.jsx("input",{type:"number",value:s.price===0?"":s.price,onChange:x=>b(s.key,{price:x.target.value===""?0:Number(x.target.value)}),className:"bg-[#161616] border border-white/15 shadow-inner shadow-black/20 rounded-lg px-2 py-1.5 outline-none w-full text-sm focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/30"})}),e.jsx("td",{className:"px-2 py-2",children:e.jsx("input",{type:"number",value:s.discountPercent===0?"":s.discountPercent,onChange:x=>b(s.key,{discountPercent:x.target.value===""?0:Number(x.target.value)}),className:"bg-[#161616] border border-white/15 shadow-inner shadow-black/20 rounded-lg px-2 py-1.5 outline-none w-full text-sm focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/30"})}),e.jsx("td",{className:"px-2 py-2 text-white/70 pt-3.5 break-words",children:s.quantity>0&&s.times>0&&s.price>0?Z(s.amount):"—"}),e.jsx("td",{className:"px-2 py-2 pt-3.5",children:e.jsx(se,{size:14,className:"text-white/30",title:"Удалить работу?",description:"Позиция будет убрана из сметы.",onConfirm:()=>N(s.key)})})]},s.key)})})]})}),t.works.some(s=>s.quantity>0&&s.times>0&&s.price>0)&&e.jsxs("div",{className:"flex flex-wrap items-center justify-end gap-2 mt-2 text-sm",children:[e.jsx("span",{className:"text-white/40",children:"Итого по помещению:"}),e.jsx("span",{className:"font-semibold",children:Z(t.works.filter(s=>s.quantity>0&&s.times>0&&s.price>0).reduce((s,g)=>s+g.amount,0))})]})]}),e.jsx(rt,{open:m,onOpenChange:h,services:i,onAdd:o})]})}const ee=t=>new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0}).format(Number.isFinite(t)?t:0)+" ₽",O=(t,r=0)=>{const i=typeof t=="string"?parseFloat(t):Number(t);return Number.isFinite(i)?i:r},re=()=>({key:`room-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,room_id:null,name:"",area:"",perimeter:"",works:[]}),lt=(t,r)=>{const i=new Map;(t.items||[]).filter(a=>!a.status||a.status==="approved").forEach(a=>{const f=a.room_id!=null?`room-${a.room_id}`:a.room_name||"no-room";if(!i.has(f)){const n=a.room_id!=null?r.find(m=>m.id===a.room_id):void 0;i.set(f,{key:f,room_id:a.room_id??null,name:a.room_name||(n==null?void 0:n.name)||"",area:n?E(n.area):"",perimeter:n?E(n.perimeter):"",works:[]})}i.get(f).works.push({key:`item-${a.id??Math.random().toString(36).slice(2)}`,service_id:a.service_id??null,name:a.name,category:a.category,subcategory:a.subcategory,unit:a.unit,price:O(a.price),quantity:O(a.quantity),times:O(a.times,1),discountPercent:O(a.discount_percent,0),amount:O(a.amount)})});const u=Array.from(i.values());return u.length>0?u:[re()]};function ct(){const{id:t,estimateId:r}=Ne(),i=ke(),u=Number(t),a=!!r,[f,n]=d.useState(null),[m,h]=d.useState([]),[l,$]=d.useState([]),[_,p]=d.useState(!0),[o,v]=d.useState(!1),[b,N]=d.useState(""),s=d.useRef(!1),[g,x]=d.useState(""),[c,y]=d.useState(""),[w,P]=d.useState(""),[V,T]=d.useState([re()]),[oe,X]=d.useState(""),[le,Y]=d.useState(""),[ce,de]=d.useState(""),[me,ue]=d.useState(!1),[xe,pe]=d.useState(!1),[L,Ce]=d.useState(null);d.useEffect(()=>{Oe.get().then(Ce).catch(()=>null)},[]),d.useEffect(()=>{t&&(p(!0),Promise.all([Te.get(u).catch(()=>null),qe.listByObject(u).then(j=>j.rooms).catch(()=>[]),Ue.list().then(j=>j.services).catch(()=>[]),a?J.get(Number(r)).catch(()=>null):Promise.resolve(null)]).then(([j,S,C,D])=>{if(!j){i("/cabinet/objects");return}n(j),h(S),$(C),D&&(x(D.contract_number||""),y(D.estimate_number||""),P(D.contract_date||""),X(D.discount_percent?String(D.discount_percent):""),Y(D.discount_amount?String(D.discount_amount):""),de(D.notes||""),ue(!!D.apply_signature),pe(!!D.apply_stamp),T(lt(D,S)))}).finally(()=>p(!1)))},[t,r]);const De=(j,S)=>{T(C=>C.map(D=>D.key===j?{...D,...S}:D))},Ae=()=>{T(j=>[...j,re()])},Fe=j=>{T(S=>S.length>1?S.filter(C=>C.key!==j):S)},G=V.reduce((j,S)=>j+S.works.reduce((C,D)=>C+D.amount,0),0),M=Number(oe)||0,I=M>0?Math.round(G*M/100*100)/100:Number(le)||0,ze=Math.max(0,Math.round((G-I)*100)/100),he=async()=>{if(!f)return!1;const j=V.flatMap(S=>S.works.filter(C=>C.name.trim()&&C.quantity>0).map(C=>({service_id:C.service_id,name:C.name,unit:C.unit,price:C.price,quantity:C.quantity,times:C.times,discount_percent:C.discountPercent,amount:C.amount,room_id:S.room_id,room_name:S.name,category:C.category,subcategory:C.subcategory})));if(j.length===0)return N("Добавьте хотя бы одну позицию сметы"),!1;v(!0);try{const S={items:j,contract_number:g,contract_date:w||void 0,discount_percent:M,discount_amount:I,notes:ce,apply_signature:me,apply_stamp:xe,estimate_number:c.trim()};return a?await J.update(Number(r),S):await J.create({object_id:f.id,...S}),s.current=!0,N(""),!0}catch(S){return N(S instanceof Error?S.message:"Ошибка сохранения сметы"),!1}finally{v(!1)}},Pe=async()=>{await he()&&i(`/cabinet/objects/${u}`)},fe=async()=>{a&&await he(),i(`/cabinet/objects/${u}`)};return _||!f?e.jsx(K,{title:a?"Редактирование сметы":"Создание сметы",children:e.jsx("div",{className:"flex items-center justify-center py-24",children:e.jsx(k,{name:"Loader2",size:28,className:"animate-spin text-white/40"})})}):e.jsxs(K,{title:a?`Редактирование сметы №${r}`:"Создание сметы",subtitle:`Объект: ${f.object_code} · ${f.client_name}`,children:[e.jsxs("button",{onClick:fe,className:"inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors mb-4",children:[e.jsx(k,{name:"ChevronLeft",size:16}),a?"Назад к смете":"Назад к объекту"]}),e.jsxs("div",{className:"grid grid-cols-1 xl:grid-cols-5 gap-4",children:[e.jsxs("div",{className:"xl:col-span-4 flex flex-col gap-4 min-w-0",children:[e.jsxs("div",{className:"bg-[#1f1f1f] border border-white/10 rounded-xl p-3 sm:p-5",children:[e.jsx("p",{className:"font-medium mb-4",children:"Номер сметы и договор"}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-3 gap-4",children:[e.jsxs("div",{className:"flex flex-col gap-1.5",children:[e.jsx("label",{className:"text-xs text-white/50",children:"Номер сметы"}),e.jsx("input",{value:c,onChange:j=>y(j.target.value),placeholder:a?`По умолчанию — ${r}`:"По умолчанию — порядковый",className:"bg-[#161616] border border-white/15 shadow-inner shadow-black/20 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/30"})]}),e.jsxs("div",{className:"flex flex-col gap-1.5",children:[e.jsx("label",{className:"text-xs text-white/50",children:"Номер договора"}),e.jsx("input",{value:g,onChange:j=>x(j.target.value),placeholder:"Будет сгенерирован автоматически",className:"bg-[#161616] border border-white/15 shadow-inner shadow-black/20 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/30"})]}),e.jsxs("div",{className:"flex flex-col gap-1.5",children:[e.jsx("label",{className:"text-xs text-white/50",children:"Дата договора"}),e.jsx("input",{value:w,onChange:j=>P(j.target.value),type:"date",className:"bg-[#161616] border border-white/15 shadow-inner shadow-black/20 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/30"})]})]})]}),V.map(j=>e.jsx(ot,{room:j,objectRooms:m,services:l,onChange:S=>De(j.key,S),onRemove:()=>Fe(j.key)},j.key)),e.jsxs("button",{onClick:Ae,className:"flex items-center justify-center gap-2 border border-dashed border-white/15 hover:border-white/30 text-white/60 hover:text-white transition-colors text-sm px-4 py-3 rounded-xl",children:[e.jsx(k,{name:"Plus",size:16}),"Добавить помещение"]}),e.jsxs("div",{className:"bg-[#1f1f1f] border border-white/10 rounded-xl p-3 sm:p-5",children:[e.jsx("p",{className:"font-medium mb-4",children:"Скидка на смету"}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-4",children:[e.jsxs("div",{className:"flex flex-col gap-1.5",children:[e.jsx("label",{className:"text-xs text-white/50",children:"Скидка (%)"}),e.jsx("input",{value:oe,onChange:j=>{X(j.target.value),Y("")},type:"number",placeholder:"0",className:"bg-[#161616] border border-white/15 shadow-inner shadow-black/20 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/30"})]}),e.jsxs("div",{className:"flex flex-col gap-1.5",children:[e.jsx("label",{className:"text-xs text-white/50",children:"Скидка (₽)"}),e.jsx("input",{value:M>0?I:le,onChange:j=>{Y(j.target.value),X("")},type:"number",placeholder:"0",disabled:M>0,className:"bg-[#161616] border border-white/15 shadow-inner shadow-black/20 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/30 disabled:opacity-50"})]})]})]}),e.jsxs("div",{className:"bg-[#1f1f1f] border border-white/10 rounded-xl p-3 sm:p-5",children:[e.jsx("p",{className:"font-medium mb-3",children:"Примечания к смете"}),e.jsx("textarea",{value:ce,onChange:j=>de(j.target.value),placeholder:"Особые условия, комментарии...",rows:4,className:"bg-[#161616] border border-white/15 shadow-inner shadow-black/20 rounded-lg px-3 py-2.5 text-sm outline-none resize-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/30 w-full"})]}),e.jsxs("div",{className:"bg-[#1f1f1f] border border-white/10 rounded-xl p-3 sm:p-5",children:[e.jsx("p",{className:"font-medium mb-3",children:"Подпись и печать в смете"}),e.jsx(He,{signatureUrl:L==null?void 0:L.signature_url,stampUrl:L==null?void 0:L.stamp_url,applySignature:me,applyStamp:xe,onChange:(j,S)=>j==="apply_signature"?ue(S):pe(S)})]}),b&&e.jsxs("p",{className:"text-sm text-red-400 flex items-center gap-1.5",children:[e.jsx(k,{name:"CircleAlert",size:15}),b]}),e.jsxs("div",{className:"flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-2 sm:gap-3 pb-4",children:[e.jsx("button",{onClick:fe,className:"w-full sm:w-auto min-h-[44px] sm:min-h-0 px-4 py-2.5 rounded-lg text-sm bg-white/5 hover:bg-white/10 transition-colors",children:a?"Закрыть":"Отмена"}),e.jsxs("button",{onClick:Pe,disabled:o,className:"w-full sm:w-auto min-h-[44px] sm:min-h-0 flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm px-5 py-2.5 rounded-lg disabled:opacity-60",children:[o?e.jsx(k,{name:"Loader2",size:16,className:"animate-spin"}):null,a?"Сохранить изменения":"Сохранить черновик"]})]})]}),e.jsx("div",{className:"flex flex-col gap-4",children:e.jsxs("div",{className:"bg-[#1f1f1f] border border-white/10 rounded-xl p-3 sm:p-5 sticky top-4",children:[e.jsx("p",{className:"font-medium mb-4",children:"Итого"}),e.jsxs("div",{className:"flex flex-col gap-2 text-sm",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"text-white/50",children:"Сумма:"}),e.jsx("span",{children:ee(G)})]}),I>0&&e.jsxs("div",{className:"flex items-center justify-between text-red-400",children:[e.jsx("span",{children:"Скидка:"}),e.jsxs("span",{children:["-",ee(I)]})]}),e.jsxs("div",{className:"flex items-center justify-between border-t border-white/10 pt-2 mt-1",children:[e.jsx("span",{className:"font-medium",children:"Итого:"}),e.jsx("span",{className:"text-lg font-semibold",children:ee(ze)})]})]})]})})]})]})}const kt=Object.freeze(Object.defineProperty({__proto__:null,default:ct},Symbol.toStringTag,{value:"Module"})),z=(t,r=0)=>{const i=typeof t=="string"?parseFloat(t):Number(t);return Number.isFinite(i)?i:r},U="Магазин не выбран";function dt(t,r){const i=t.filter(n=>z(n.price)>0);if(i.length===0)return null;const u=i.map(n=>{const m=!!n.stock_known,h=z(n.stock),l=!m||h>=r,$=m&&h>0&&h<r;return{offer:n,enough:l,partial:$,price:z(n.price)}}),a=u.filter(n=>n.enough);if(a.length>0)return a.reduce((n,m)=>m.price<n.price?m:n).offer;const f=u.filter(n=>n.partial);return f.length>0?f.reduce((n,m)=>m.price<n.price?m:n).offer:u.reduce((n,m)=>m.price<n.price?m:n).offer}function mt(t,r){const i=new Map;let u=0,a=0,f=0;t.forEach((m,h)=>{const l=r.find(P=>P.id===m.material_id),$=(l==null?void 0:l.offers)||[],_=z(m.qty),p=dt($,_),o=z(p?p.price:m.price),v=(p==null?void 0:p.shop_name)||m.shop_name||(l==null?void 0:l.shop_name)||U,N=(p?!!p.stock_known:!1)?z(p.stock):null,s=N===null?!0:N>=_,g=s||N===null?0:Math.max(0,_-N);s||(a+=1),v===U&&(f+=1);const x=$.filter(P=>z(P.price)>0).map(P=>z(P.price)),c=x.length>1&&o>0?(Math.max(...x)-o)*_:0;u+=c;const y={name:m.name,unit:m.unit,qty:_,price:o,sum:_*o,shopName:v,shopAddress:(p==null?void 0:p.shop_address)||(l==null?void 0:l.shop_address)||"",shopPhone:(p==null?void 0:p.shop_phone)||(l==null?void 0:l.shop_phone)||"",shopUrl:(p==null?void 0:p.shop_url)||(l==null?void 0:l.shop_url)||"",stock:N,enough:s,missing:g,offersCount:x.length,saved:c,roomName:m.room_name||"",index:h};i.has(v)||i.set(v,{name:v,address:y.shopAddress,phone:y.shopPhone,lines:[],sum:0,hasShortage:!1});const w=i.get(v);!w.address&&y.shopAddress&&(w.address=y.shopAddress),!w.phone&&y.shopPhone&&(w.phone=y.shopPhone),w.lines.push(y),w.sum+=y.sum,s||(w.hasShortage=!0)});const n=Array.from(i.values()).map(m=>({...m,lines:[...m.lines].sort((h,l)=>l.sum-h.sum)})).sort((m,h)=>m.name===U?1:h.name===U?-1:h.sum-m.sum);return{shops:n,total:n.reduce((m,h)=>m+h.sum,0),saved:u,shortageCount:a,unknownShopCount:f}}const ve=t=>String(t??"").replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\r?\n/g," "),ut=(t,r=0)=>{const i=typeof t=="string"?parseFloat(t):Number(t);return Number.isFinite(i)?i:r},R=t=>new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0}).format(ut(t))+" ₽";function A(t){const r=document.createElement("div");return r.textContent=t??"",r.innerHTML}function $e(t,r,i,u){const a=mt(r,i),f=a.shops.map(p=>{const o=p.lines.map((b,N)=>{const s=b.stock===null?'<span class="muted">не указано</span>':b.enough?`<span class="ok">есть ${b.stock} ${A(b.unit)}</span>`:`<span class="warn">есть ${b.stock}, не хватает ${b.missing}</span>`;return`
            <tr>
              <td class="num">${N+1}</td>
              <td>
                ${A(b.name)}
                ${b.roomName?`<div class="sub">${A(b.roomName)}</div>`:""}
              </td>
              <td class="center">${b.qty}</td>
              <td class="center">${A(b.unit)}</td>
              <td class="center">${s}</td>
              <td class="right">${R(b.price)}</td>
              <td class="right amount">${R(b.sum)}</td>
              <td class="center check"></td>
            </tr>`}).join(""),v=[p.address?`Адрес: ${A(p.address)}`:"",p.phone?`Тел.: ${A(p.phone)}`:""].filter(Boolean).join(" · ");return`
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
                <td colspan="8">${A(p.name)}${v?` — ${v}`:""}</td>
              </tr>
              ${o}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="6" class="right">Итого по магазину</td>
                <td class="right amount">${R(p.sum)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>`}).join(""),n=[];a.shortageCount>0&&n.push(`Позиций с нехваткой на складе магазина: ${a.shortageCount} — уточните наличие перед выездом`),a.unknownShopCount>0&&n.push(`Позиций без выбранного магазина: ${a.unknownShopCount}`),a.saved>0&&n.push(`Экономия за счёт выбора магазина: ${R(a.saved)}`);const m=n.length?`<div class="notes">${n.map(p=>`<div>• ${p}</div>`).join("")}</div>`:"",h=`
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
      content: "${ve(`Список закупок · объект ${t.object_code||""}`.trim())}";
      font-family: Arial, sans-serif;
      font-size: 8.5pt;
      color: #6B4508;
    }
    @top-right {
      content: "${ve(t.client_name||u)}";
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
`,l=a.shops.length,$=`
  <div class="header">
    <div class="brand"><img class="brand-logo" src="${window.location.origin}/logo-print.png" alt="FixKey"/><b class="brand-word">Fix<span>Key</span></b></div>
    <div class="doc-title">
      <h1>Список на закупку</h1>
      <p>Объект № ${A(t.object_code)}</p>
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
      <div class="value">${A(t.object_code)}</div>
    </div>
    <div>
      <div class="label">Заказчик</div>
      <div class="value">${A(t.client_name)}</div>
    </div>
    <div>
      <div class="label">Адрес объекта</div>
      <div class="value">${A(t.address||"—")}</div>
    </div>
    <div>
      <div class="label">Магазинов в списке</div>
      <div class="value">${l}</div>
    </div>
  </div>

  ${m}

  ${f}

  <div class="summary">
    <div class="summary-box">
      ${a.shops.map(p=>`
      <div class="summary-row">
        <span>${A(p.name)}</span>
        <span>${R(p.sum)}</span>
      </div>`).join("")}
      <div class="summary-total">
        <span>ИТОГО:</span>
        <span>${R(a.total)}</span>
      </div>
    </div>
  </div>

  <hr class="thin" />

  <div class="parties">
    <div>
      <div class="label">Закупку производит</div>
      <div class="name">${A(u)}</div>
    </div>
    <div>
      <div class="label">Объект</div>
      <div class="name">${A(t.client_name)}</div>
    </div>
  </div>`,_=`Список на закупку № ${t.object_code} — ${A(t.client_name)}`;return{styles:h,bodyContent:$,title:_}}function _t(t,r,i,u,a=!1){const{styles:f,bodyContent:n,title:m}=$e(t,r,i,u),h=`<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8" />
<title>${m}</title>
<style>${f}</style>
</head>
<body>
<div class="est-root">${n}</div>
</body>
</html>`,l=window.open("","_blank","width=900,height=1000");l&&(l.document.open(),l.document.write(h),l.document.close(),a&&(l.onload=()=>{l.focus(),l.print()}))}async function St(t,r,i,u){const{styles:a,bodyContent:f}=$e(t,r,i,u);await Xe(n=>{n.id="pdf-scope-purchase",n.className="est-root",n.innerHTML=`<style>${Qe(a,"#pdf-scope-purchase")}</style>${f}`},{filename:`Список на закупку ${t.object_code}.pdf`,mode:"save"})}const ie={issued:{label:"выставлен",cls:"bg-white/10 text-white/60"},sent:{label:"отправлен",cls:"bg-blue-500/20 text-blue-300"},paid:{label:"оплачен",cls:"bg-green-500/20 text-green-300"}};function xt(){const{id:t,invoiceId:r}=Ne(),i=Number(t),u=ke(),[a,f]=d.useState(null),[n,m]=d.useState(!0),[h,l]=d.useState(!1),[$,_]=d.useState(!1),[p,o]=d.useState(!1),v=()=>F.get(Number(r)).then(f).catch(()=>u(`/cabinet/objects/${i}`)).finally(()=>m(!1));if(d.useEffect(()=>{v()},[r]),n||!a)return e.jsx(K,{title:"Счёт на оплату",children:e.jsx("div",{className:"flex items-center justify-center py-24",children:e.jsx(k,{name:"Loader2",size:28,className:"animate-spin text-white/40"})})});const b=_e(a),N=`Счёт ${a.invoice_number}`,s=async y=>{const w=await F.update(a.id,{status:y});f({...a,status:y}),Ve(w.thanks)},g=async()=>{l(!0);try{await Se(b,N)}finally{l(!1)}},x=ie[a.status]||ie.issued,c="flex items-center justify-center gap-1.5 text-sm w-full h-11 sm:w-9 sm:h-9 bg-white/5 hover:bg-white/10 transition-colors rounded-lg disabled:opacity-60";return e.jsxs(K,{title:`Счёт на оплату № ${a.invoice_number}`,subtitle:a.client_name||"",children:[e.jsxs("div",{className:"mb-4 flex flex-wrap items-center justify-between gap-3",children:[e.jsxs(H,{to:`/cabinet/objects/${i}`,className:"inline-flex items-center gap-1.5 text-sm text-white/50 transition-colors hover:text-white",children:[e.jsx(k,{name:"ChevronLeft",size:16}),"К объекту"]}),e.jsxs("div",{className:"grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center",children:[e.jsx("span",{className:te("col-span-2 justify-self-start rounded-full px-2.5 py-1 text-xs font-medium",x.cls),children:x.label}),a.status!=="paid"?e.jsxs("button",{onClick:()=>s("paid"),title:"Заказчику автоматически уйдёт письмо с благодарностью",className:"flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg bg-green-600 sm:min-h-0 px-3 py-2 text-sm text-white transition-colors hover:bg-green-700",children:[e.jsx(k,{name:"BadgeCheck",size:14}),"Отметить оплату"]}):e.jsx("button",{onClick:()=>s("sent"),className:"min-h-[44px] rounded-lg bg-white/5 px-3 py-2 text-sm text-white/60 hover:bg-white/10 sm:min-h-0",children:"Снять отметку оплаты"}),e.jsxs(H,{to:`/cabinet/objects/${i}/invoices/${a.id}/edit`,className:"flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg bg-blue-500 sm:min-h-0 px-3 py-2 text-sm text-white transition-colors hover:bg-blue-600",children:[e.jsx(k,{name:"Pencil",size:14}),"Редактировать"]}),e.jsxs("button",{onClick:()=>_(!0),className:"flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg bg-white/10 sm:min-h-0 px-3 py-2 text-sm text-white transition-colors hover:bg-white/15",children:[e.jsx(k,{name:"Mail",size:14}),"Отправить на почту"]}),e.jsxs("button",{onClick:()=>Ge(`Счёт № ${a.invoice_number}`,`${be("")}${b}`,ge),title:"Печать",className:c,children:[e.jsx(k,{name:"Printer",size:15}),e.jsx("span",{className:"sm:hidden",children:"Печать"})]}),e.jsxs("button",{onClick:g,disabled:h,title:"Скачать PDF",className:c,children:[e.jsx(k,{name:h?"Loader2":"Download",size:15,className:h?"animate-spin":""}),e.jsx("span",{className:"sm:hidden",children:"PDF"})]}),e.jsxs("button",{onClick:()=>o(!0),title:"Удалить",className:te(c,"hover:bg-red-500/20 hover:text-red-300"),children:[e.jsx(k,{name:"Trash2",size:15}),e.jsx("span",{className:"sm:hidden",children:"Удалить"})]})]})]}),e.jsx("div",{className:"mx-auto max-w-4xl overflow-x-auto md:overflow-visible",children:e.jsx("div",{className:"mx-auto max-w-4xl rounded-xl bg-white p-4 text-[#161616] shadow-lg sm:p-12",children:e.jsx("div",{dangerouslySetInnerHTML:{__html:`<style>${ge}</style>${be("")}${b}`}})})}),e.jsx(Ke,{open:$,onOpenChange:y=>{_(y),y||v()},docName:"счёт",objectId:a.object_id,fileName:`Счёт_${a.invoice_number}.pdf`,makePdf:()=>Ye(b,N),send:y=>F.sendEmail(a.id,y)}),e.jsx(Je,{open:p,onOpenChange:o,title:"Удалить счёт?",description:`Счёт № ${a.invoice_number} будет удалён без возможности восстановления.`,onConfirm:async()=>{await F.remove(a.id),u(`/cabinet/objects/${i}`)}})]})}const $t=Object.freeze(Object.defineProperty({__proto__:null,INVOICE_STATUS:ie,default:xt},Symbol.toStringTag,{value:"Module"}));export{kt as E,tt as I,Nt as O,et as P,yt as a,mt as b,vt as c,St as d,at as e,Q as f,$t as g,_t as p,Ze as u,wt as y};
