import{d as se,g as ne,r as m,a8 as R,a5 as ae,j as t,I as f}from"./index-B3DAIKQB.js";import{C as J}from"./CrmLayout-bIGV021E.js";import{m as P}from"./numberToWordsRu-B5XR1I00.js";import{a as re,p as ie,r as U,n as F,c as le,m as K}from"./rental-BrfQF3_r.js";import{d as oe,a as de}from"./docBrandHeader-BQ_EeXF9.js";import{d as ce}from"./downloadContractPdf-DEv0pUUK.js";const d=e=>e==null?"":String(e),n=(e,a)=>{const l=d(a).trim();return l?`<p>${e}: ${l}</p>`:""},E=e=>{if(!e)return"____________";const a=new Date(e);return isNaN(a.getTime())?d(e):a.toLocaleDateString("ru-RU",{day:"numeric",month:"long",year:"numeric"})},O=e=>new Intl.NumberFormat("ru-RU",{maximumFractionDigits:0}).format(Math.round(e||0));function Q(e){if(!e)return"<p>____________</p>";if(e.party_kind==="legal")return[n("",e.org_name||e.display_name),n("ИНН",e.inn),n("КПП",e.kpp),n("ОГРН",e.ogrn),n("Юр. адрес",e.legal_address),n("Банк",e.bank_name),n("БИК",e.bik),n("Р/с",e.account_number),n("К/с",e.correspondent_account),n("Тел.",e.phone),n("Email",e.email)].join("");if(e.party_kind==="entrepreneur")return[n("",`ИП ${e.org_name||e.full_name||e.display_name}`),n("ИНН",e.inn),n("ОГРНИП",e.ogrn),n("Адрес",e.legal_address||e.registration_address),n("Банк",e.bank_name),n("БИК",e.bik),n("Р/с",e.account_number),n("Тел.",e.phone),n("Email",e.email)].join("");const a=[e.passport_series,e.passport_number].filter(Boolean).join(" ");return[n("",e.full_name||e.display_name),n("Паспорт",a),n("Выдан",e.passport_issued_by),e.passport_issued_date?n("Дата выдачи",E(e.passport_issued_date)):"",n("Код подразделения",e.passport_department_code),e.birth_date?n("Дата рождения",E(e.birth_date)):"",n("Адрес регистрации",e.registration_address),n("Тел.",e.phone),n("Email",e.email)].join("")}function V(e){if(!e)return"____________ (далее — «Арендатор»)";if(e.party_kind==="legal"){const s=e.org_name||e.display_name,_=e.director_position||"генеральный директор",h=e.director_name||"",u=e.acts_basis||"Устава";return`${d(s)}, именуемое в дальнейшем «Арендатор», от имени которого действует ${d(_)} ${d(h)} на основании ${d(u)}`}if(e.party_kind==="entrepreneur"){const s=e.full_name||e.org_name||e.display_name;return`Индивидуальный предприниматель ${d(s)}, ОГРНИП ${d(e.ogrn)||"____________"}, именуемый в дальнейшем «Арендатор»`}const a=e.full_name||e.display_name,l=[e.passport_series,e.passport_number].filter(Boolean).join(" ");return`${d(a)}, паспорт ${d(l)||"____________"}, выдан ${d(e.passport_issued_by)||"____________"}, зарегистрированный по адресу: ${d(e.registration_address)||"____________"}, именуемый в дальнейшем «Арендатор»`}function me(e){const{rental:a,counterparty:l,company:s,options:_}=e,h=a.direction==="out",u=(s==null?void 0:s.name)||(s==null?void 0:s.contact_full_name)||"____________",k=re[a.rate_period]||"сутки",D=ie(a),C=U(a),w=F(a.rate),L=F(a.qty),j=F(a.deposit),o=h?`${d(u)}, именуемое в дальнейшем «Арендодатель», с одной стороны, и ${V(l)}, с другой стороны,`:`${V(l).replace(/«Арендатор»/g,"«Арендодатель»")}, с одной стороны, и ${d(u)}, именуемое в дальнейшем «Арендатор», с другой стороны,`,z=_.penalty_pct||"0,5",y=_.claim_days||"10",B=_.copies_total||"двух",I=_.delivery==="by_lessor"?"Передача и возврат Имущества осуществляются силами и за счёт Арендодателя по адресу, согласованному Сторонами.":"Получение и возврат Имущества осуществляются Арендатором самостоятельно по адресу Арендодателя.",A=j?`<p>3.4. В обеспечение исполнения обязательств Арендатор вносит обеспечительный платёж (залог) в размере ${O(j)} рублей (${P(j)}). Залог возвращается Арендатору в течение 3 (трёх) рабочих дней с момента возврата Имущества в исправном состоянии, за вычетом сумм задолженности и стоимости устранения повреждений при их наличии.</p>`:"",g=a.condition_note?`<p>2.3. Состояние Имущества на момент передачи: ${d(a.condition_note)}.</p>`:"",S=_.extra_terms?`<h3>10. Дополнительные условия</h3><p>${d(_.extra_terms).replace(/\n/g,"</p><p>")}</p>`:"",v=a.date_to?`по ${E(a.date_to)} включительно`:"до момента возврата Имущества Арендодателю";return`
<div class="contract-doc">
<h2 style="text-align:center">Договор аренды оборудования № ${d(_.contract_number)||d(a.rental_number)}</h2>
<p style="text-align:right">г. ${d(_.city)||"________"}, ${E(_.contract_date)}</p>

<p>${o} вместе именуемые «Стороны», заключили настоящий договор (далее — «Договор») о нижеследующем:</p>

<h3>1. Предмет договора</h3>
<p>1.1. Арендодатель обязуется предоставить Арендатору во временное владение и пользование за плату следующее имущество (далее — «Имущество»):</p>
<p>1.1.1. ${d(a.item_name)} — ${L} ${d(a.unit)}.</p>
<p>1.2. Имущество передаётся для использования по прямому назначению${_.purpose?`: ${d(_.purpose)}`:""}.</p>
<p>1.3. Имущество принадлежит Арендодателю на праве собственности, не заложено, не арестовано и не является предметом требований третьих лиц.</p>

<h3>2. Передача имущества</h3>
<p>2.1. Имущество передаётся Арендатору ${E(a.date_from)} и подлежит возврату ${v}.</p>
<p>2.2. ${I}</p>
${g}
<p>2.4. Передача и возврат Имущества оформляются актом приёма-передачи, подписываемым обеими Сторонами. Подписание Сторонами настоящего Договора подтверждает факт передачи Имущества в исправном состоянии.</p>

<h3>3. Арендная плата и порядок расчётов</h3>
<p>3.1. Арендная плата составляет ${O(w)} рублей (${P(w)}) за ${k} за единицу Имущества.</p>
<p>3.2. Расчётный период аренды составляет ${D} ${a.rate_period==="day"?"сут.":a.rate_period==="week"?"нед.":"мес."}, общая сумма арендной платы — ${O(C)} рублей (${P(C)}).</p>
<p>3.3. Оплата производится наличными денежными средствами либо безналичным переводом на расчётный счёт Арендодателя. Неполный расчётный период оплачивается как полный.</p>
${A}

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
<p>5.3. За просрочку возврата Имущества Арендатор уплачивает неустойку в размере ${z} % от суммы арендной платы за каждый день просрочки, а также арендную плату за фактическое время пользования.</p>
<p>5.4. За просрочку внесения арендной платы Арендатор уплачивает пени в размере ${z} % от суммы задолженности за каждый день просрочки.</p>
<p>5.5. Риск случайной гибели или повреждения Имущества с момента его передачи и до момента возврата несёт Арендатор.</p>

<h3>6. Срок действия и расторжение</h3>
<p>6.1. Договор вступает в силу с момента подписания и действует до полного исполнения Сторонами своих обязательств.</p>
<p>6.2. Арендодатель вправе досрочно расторгнуть Договор в одностороннем порядке при использовании Имущества не по назначению, существенном ухудшении его состояния либо просрочке оплаты более 10 (десяти) календарных дней.</p>
<p>6.3. При досрочном расторжении Имущество подлежит возврату в течение 1 (одного) рабочего дня с момента получения соответствующего уведомления.</p>

<h3>7. Форс-мажор</h3>
<p>7.1. Стороны освобождаются от ответственности за неисполнение обязательств, если оно явилось следствием обстоятельств непреодолимой силы, возникших после заключения Договора.</p>

<h3>8. Разрешение споров</h3>
<p>8.1. Споры решаются путём переговоров с обязательным направлением письменной претензии. Срок рассмотрения претензии — ${y} календарных дней.</p>
<p>8.2. При недостижении согласия спор передаётся на рассмотрение суда в соответствии с законодательством Российской Федерации.</p>

<h3>9. Заключительные положения</h3>
<p>9.1. Все изменения и дополнения к Договору действительны при оформлении в письменном виде и подписании обеими Сторонами.</p>
<p>9.2. Договор составлен в ${B} экземплярах, имеющих равную юридическую силу, по одному для каждой из Сторон.</p>

${S}

<h3>${S?"11":"10"}. Реквизиты и подписи сторон</h3>
<table style="width:100%;margin-top:16px">
<tr>
<td style="width:50%;vertical-align:top;padding-right:16px">
<p><strong>АРЕНДОДАТЕЛЬ</strong></p>
${h?[n("",u),n("ИНН",s==null?void 0:s.inn),n("Юр. адрес",s==null?void 0:s.legal_address),n("Банк",s==null?void 0:s.bank_name),n("БИК",s==null?void 0:s.bik),n("Р/с",s==null?void 0:s.account_number),n("К/с",s==null?void 0:s.correspondent_account),n("Тел.",s==null?void 0:s.phone),n("Email",s==null?void 0:s.email)].join(""):Q(l)}
</td>
<td style="width:50%;vertical-align:top;padding-left:16px">
<p><strong>АРЕНДАТОР</strong></p>
${h?Q(l):[n("",u),n("ИНН",s==null?void 0:s.inn),n("Юр. адрес",s==null?void 0:s.legal_address),n("Тел.",s==null?void 0:s.phone),n("Email",s==null?void 0:s.email)].join("")}
</td>
</tr>
<tr>
<td style="width:50%;vertical-align:bottom;padding:36px 16px 0 0">
<p style="margin-bottom:28px"><strong>ОТ ИМЕНИ АРЕНДОДАТЕЛЯ</strong></p>
<p style="border-top:1px solid #999;padding-top:4px;max-width:240px;margin:0">${d(h?(s==null?void 0:s.contact_full_name)||u:(l==null?void 0:l.full_name)||(l==null?void 0:l.display_name)||"")}</p>
<p style="font-size:11px;color:#666;margin:2px 0 0">(подпись, М.П.)</p>
</td>
<td style="width:50%;vertical-align:bottom;padding:36px 0 0 16px">
<p style="margin-bottom:28px"><strong>ОТ ИМЕНИ АРЕНДАТОРА</strong></p>
<p style="border-top:1px solid #999;padding-top:4px;max-width:240px;margin:0">${d(h?(l==null?void 0:l.full_name)||(l==null?void 0:l.display_name)||"":(s==null?void 0:s.contact_full_name)||u)}</p>
<p style="font-size:11px;color:#666;margin:2px 0 0">(подпись)</p>
</td>
</tr>
</table>
</div>
`.trim()}const N="w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50",_e="flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#B8860B] transition-colors text-[#161616] text-sm px-4 min-h-[44px] rounded-lg disabled:opacity-40",q="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 transition-colors text-sm px-4 min-h-[44px] rounded-lg";function fe(){const{rentalId:e}=se(),a=ne(),l=m.useRef(null),[s,_]=m.useState(!0),[h,u]=m.useState(!1),[k,D]=m.useState(!1),[C,w]=m.useState(""),[L,j]=m.useState(""),[o,z]=m.useState(null),[y,B]=m.useState(null),[I,A]=m.useState(null),[g,S]=m.useState(null),[v,T]=m.useState(""),[M,W]=m.useState(!1),[p,b]=m.useState({city:"",contract_number:"",contract_date:new Date().toISOString().slice(0,10),purpose:"",delivery:"self_pickup",penalty_pct:"0,5",claim_days:"10",copies_total:"двух",extra_terms:""});m.useEffect(()=>{e&&(_(!0),Promise.all([R.list(),ae.get()]).then(async([r,i])=>{const c=(r.rentals||[]).find(x=>x.id===Number(e));if(!c){a("/cabinet/rentals");return}z(c),A(i);const $=(r.counterparties||[]).find(x=>x.id===c.counterparty_id)||null;if(B($),c.contract_id){const x=await R.contracts.get(c.contract_id);S(x),T(x.content_html),b(te=>({...te,...x.options,contract_number:x.contract_number,contract_date:String(x.contract_date).slice(0,10)}))}else b(x=>({...x,contract_number:c.rental_number}))}).catch(r=>w(r instanceof Error?r.message:"Не удалось загрузить")).finally(()=>_(!1)))},[e]);const H=m.useMemo(()=>o?me({rental:o,counterparty:y,company:I,options:p}):"",[o,y,I,p]);m.useEffect(()=>{!o||M||g&&v||T(H)},[H,o,M,g,v]);const G=m.useMemo(()=>y?le(y):["контрагент не выбран"],[y]),X=()=>{T(H),W(!1),l.current&&(l.current.innerHTML=H),j("Текст пересобран по данным аренды"),setTimeout(()=>j(""),2500)},Y=async()=>{var r;if(o){u(!0),w("");try{const i=((r=l.current)==null?void 0:r.innerHTML)||v,c={rental_id:o.id,contract_number:p.contract_number||o.rental_number,contract_date:p.contract_date||new Date().toISOString().slice(0,10),status:(g==null?void 0:g.status)||"draft",options:p,content_html:i,total_amount:U(o)};if(g)await R.contracts.update(g.id,c);else{const $=await R.contracts.create(c);S({id:$.id,rental_id:o.id,contract_number:c.contract_number,contract_date:c.contract_date,status:"draft",options:c.options,content_html:i,total_amount:c.total_amount,created_at:new Date().toISOString()})}T(i),j("Договор сохранён"),setTimeout(()=>j(""),2500)}catch(i){w(i instanceof Error?i.message:"Не удалось сохранить")}finally{u(!1)}}},Z=()=>{var $;const r=(($=l.current)==null?void 0:$.innerHTML)||v,i=`Договор аренды № ${p.contract_number||(o==null?void 0:o.rental_number)||""}`,c=window.open("","_blank");c&&(c.document.write(`
      <html>
        <head>
          <title>${i}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 32px; line-height: 1.5; color: #161616; }
            h2, h3 { color: #161616; }
            h2 { margin: 28px 0 12px; }
            h3 { margin: 24px 0 10px; }
            p { margin: 0 0 14px; }
            table { border-collapse: collapse; }
            ${oe}
          </style>
        </head>
        <body>${de(i)}${r}</body>
      </html>
    `),c.document.close(),c.focus(),c.print())},ee=async()=>{var r;D(!0);try{const i=((r=l.current)==null?void 0:r.innerHTML)||v;await ce(i,p.contract_number||(o==null?void 0:o.rental_number)||"аренда")}finally{D(!1)}};return s?t.jsx(J,{title:"Договор аренды",children:t.jsx("div",{className:"flex items-center justify-center py-24",children:t.jsx(f,{name:"Loader2",size:28,className:"animate-spin text-white/40"})})}):o?t.jsxs(J,{title:"Договор аренды",subtitle:`${o.item_name} · ${o.counterparty_name||"контрагент не выбран"}`,children:[t.jsxs("button",{onClick:()=>a("/cabinet/rentals"),className:"mb-4 inline-flex items-center gap-1.5 text-sm text-white/50 transition-colors hover:text-white",children:[t.jsx(f,{name:"ChevronLeft",size:16}),"Назад к аренде"]}),G.length>0&&t.jsxs("div",{className:"mb-4 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200",children:[t.jsx(f,{name:"TriangleAlert",size:16,className:"mt-0.5 shrink-0"}),t.jsxs("div",{children:["В договоре останутся пропуски — у контрагента не заполнено: ",G.join(", "),"."," ",t.jsx("button",{onClick:()=>a("/cabinet/rentals"),className:"underline hover:text-white",children:"Заполнить"})]})]}),C&&t.jsxs("div",{className:"mb-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300",children:[t.jsx(f,{name:"CircleAlert",size:16}),C]}),L&&t.jsxs("div",{className:"mb-4 flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-300",children:[t.jsx(f,{name:"Check",size:16}),L]}),t.jsxs("div",{className:"grid gap-4 lg:grid-cols-[320px_1fr]",children:[t.jsxs("div",{className:"space-y-4",children:[t.jsxs("div",{className:"rounded-xl border border-white/10 bg-[#1f1f1f] p-4",children:[t.jsx("div",{className:"mb-3 text-xs uppercase text-white/40",children:"Реквизиты договора"}),t.jsxs("div",{className:"space-y-3",children:[t.jsxs("div",{children:[t.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Номер"}),t.jsx("input",{className:N,value:p.contract_number||"",onChange:r=>b(i=>({...i,contract_number:r.target.value}))})]}),t.jsxs("div",{children:[t.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Дата"}),t.jsx("input",{className:N,type:"date",value:p.contract_date||"",onChange:r=>b(i=>({...i,contract_date:r.target.value}))})]}),t.jsxs("div",{children:[t.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Город"}),t.jsx("input",{className:N,value:p.city||"",onChange:r=>b(i=>({...i,city:r.target.value})),placeholder:"Хабаровск"})]}),t.jsxs("div",{children:[t.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Цель использования"}),t.jsx("input",{className:N,value:p.purpose||"",onChange:r=>b(i=>({...i,purpose:r.target.value})),placeholder:"ремонтные работы на объекте"})]}),t.jsxs("div",{children:[t.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Передача имущества"}),t.jsxs("select",{className:N,value:p.delivery||"self_pickup",onChange:r=>b(i=>({...i,delivery:r.target.value})),children:[t.jsx("option",{value:"self_pickup",children:"Забирает арендатор"}),t.jsx("option",{value:"by_lessor",children:"Доставляет арендодатель"})]})]}),t.jsxs("div",{className:"grid grid-cols-2 gap-3",children:[t.jsxs("div",{children:[t.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Пени, %"}),t.jsx("input",{className:N,value:p.penalty_pct||"",onChange:r=>b(i=>({...i,penalty_pct:r.target.value}))})]}),t.jsxs("div",{children:[t.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Претензия, дн."}),t.jsx("input",{className:N,value:p.claim_days||"",onChange:r=>b(i=>({...i,claim_days:r.target.value}))})]})]}),t.jsxs("div",{children:[t.jsx("label",{className:"mb-1.5 block text-xs text-white/50",children:"Дополнительные условия"}),t.jsx("textarea",{className:`${N} min-h-[80px] resize-y`,value:p.extra_terms||"",onChange:r=>b(i=>({...i,extra_terms:r.target.value})),placeholder:"Отдельным пунктом в конце договора"})]})]})]}),t.jsxs("div",{className:"rounded-xl border border-white/10 bg-[#1f1f1f] p-4 text-sm",children:[t.jsx("div",{className:"mb-3 text-xs uppercase text-white/40",children:"Условия аренды"}),t.jsxs("div",{className:"space-y-2 text-white/70",children:[t.jsxs("div",{className:"flex justify-between gap-3",children:[t.jsx("span",{className:"text-white/40",children:"Инструмент"}),t.jsx("span",{className:"text-right",children:o.item_name})]}),t.jsxs("div",{className:"flex justify-between gap-3",children:[t.jsx("span",{className:"text-white/40",children:"Количество"}),t.jsxs("span",{children:[Number(o.qty)," ",o.unit]})]}),t.jsxs("div",{className:"flex justify-between gap-3",children:[t.jsx("span",{className:"text-white/40",children:"Сумма аренды"}),t.jsx("span",{className:"text-[#D4AF37]",children:K(U(o))})]}),Number(o.deposit)>0&&t.jsxs("div",{className:"flex justify-between gap-3",children:[t.jsx("span",{className:"text-white/40",children:"Залог"}),t.jsx("span",{children:K(Number(o.deposit))})]})]}),t.jsxs("button",{onClick:X,className:`${q} mt-4 w-full`,children:[t.jsx(f,{name:"RefreshCw",size:15}),"Пересобрать текст"]}),M&&t.jsx("div",{className:"mt-2 text-xs text-amber-400",children:"Текст правился вручную — пересборка сотрёт правки"})]})]}),t.jsxs("div",{className:"space-y-4",children:[t.jsxs("div",{className:"flex flex-wrap gap-2",children:[t.jsxs("button",{className:_e,onClick:Y,disabled:h,children:[h?t.jsx(f,{name:"Loader2",size:16,className:"animate-spin"}):t.jsx(f,{name:"Check",size:16}),g?"Сохранить изменения":"Сохранить договор"]}),t.jsxs("button",{className:q,onClick:Z,children:[t.jsx(f,{name:"Printer",size:16}),"Печать"]}),t.jsxs("button",{className:q,onClick:ee,disabled:k,children:[t.jsx(f,{name:k?"Loader2":"Download",size:16,className:k?"animate-spin":""}),"Скачать PDF"]})]}),t.jsx("div",{className:"rounded-xl border border-white/10 bg-white p-5 md:p-8",children:t.jsx("div",{ref:l,contentEditable:!0,suppressContentEditableWarning:!0,onInput:()=>W(!0),className:"contract-doc min-h-[500px] text-[#161616] outline-none",dangerouslySetInnerHTML:{__html:v}})}),t.jsx("div",{className:"text-xs text-white/40",children:"Текст договора можно править прямо здесь — щёлкните в нужное место и печатайте"})]})]})]}):null}export{fe as default};
