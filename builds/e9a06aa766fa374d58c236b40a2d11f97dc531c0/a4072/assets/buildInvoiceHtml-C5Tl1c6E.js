import{m as S}from"./numberToWordsRu-B5XR1I00.js";const o=t=>String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"),s=t=>new Intl.NumberFormat("ru-RU",{minimumFractionDigits:2,maximumFractionDigits:2}).format(t||0),m=t=>{if(!t)return"";const e=new Date(t);return isNaN(e.getTime())?String(t):e.toLocaleDateString("ru-RU",{day:"numeric",month:"long",year:"numeric"}).replace(/\s*г\.?$/,"")+" г."},w=t=>String(Math.round((t||0)*100)%100).padStart(2,"0"),T=20,V=[22,10,7,5];function k(t){const e=/^(included|on_top)(?:_(\d+))?$/.exec(t||"");return e?{kind:e[1],rate:e[2]?Number(e[2]):T}:{kind:"none",rate:0}}function M(t){const e=(t.items||[]).reduce((d,l)=>d+(Number(l.quantity)||0)*(Number(l.price)||0),0),{kind:a,rate:n}=k(t.vat_mode);if(a==="on_top"){const d=Math.round(e*n)/100;return{sum:e,vat:d,total:e+d,rate:n}}return a==="included"?{sum:e,vat:Math.round(e*n*100/(100+n))/100,total:e,rate:n}:{sum:e,vat:0,total:e,rate:0}}function q(t){return`Оплата по счёту № ${t.invoice_number} от ${m(t.invoice_date)}`}function E(t){const e=[];return t.contract&&e.push(`по Договору № ${t.contract.contract_number} от ${m(t.contract.contract_date)}`),t.act&&e.push(`по Акту № ${t.act.act_number} от ${m(t.act.act_date)}`),e.length?`Оплата ${e.join(", ")}`:""}function U(t){var y;const e=t.company||{},a=t.customer||{name:t.client_name||"",phone:"",email:"",address:""},n=(e.entity_type||"").toLowerCase(),d=/юрид|ооо|общество/.test(n),l=/предприним/.test(n),u=l?`ИП ${e.contact_full_name||e.name||""}`:e.name||e.contact_full_name||"",g=d?{role:e.director_position||"Руководитель",name:e.director_name||e.contact_full_name||""}:{role:l?"Предприниматель":"Исполнитель",name:e.contact_full_name||e.name||""},{sum:A,vat:v,total:p,rate:x}=M(t),h=k(t.vat_mode).kind,z=h==="on_top"?`<tr><td class="lbl">НДС ${x}%:</td><td class="val">${s(v)}</td></tr>`:h==="included"?`<tr><td class="lbl">В том числе НДС ${x}%:</td><td class="val">${s(v)}</td></tr>`:'<tr><td class="lbl" colspan="2">Без налога (НДС)</td></tr>',N=(t.items||[]).map((c,b)=>`<tr>
<td class="c">${b+1}</td>
<td>${o(c.name)}</td>
<td class="c">${o(c.quantity)}</td>
<td class="c">${o(c.unit)}</td>
<td class="r">${s(Number(c.price))}</td>
<td class="r">${s((Number(c.quantity)||0)*(Number(c.price)||0))}</td>
</tr>`).join(""),i=(c,b)=>b?`<tr><td class="k">${c}</td><td class="v">${o(b)}</td></tr>`:"",C=[i("Наименование",u),i("ИНН",e.inn),d?i("КПП",e.kpp):"",l||d?i(d?"ОГРН":"ОГРНИП",e.ogrn):"",i("Адрес",e.legal_address),i("Телефон",e.phone),i("E-mail",e.email),i("Сайт",e.website)].join(""),r=((y=t.contract)==null?void 0:y.options)||{},B=r.customer_type==="legal"&&r.customer_org_name?r.customer_org_name:r.customer_type==="entrepreneur"?`ИП ${r.customer_name||a.name}`:r.customer_name||a.name,j=[i(r.customer_type==="legal"?"Организация":"ФИО",B),r.customer_type==="entrepreneur"?i("ОГРНИП",r.customer_ogrnip):"",r.customer_type==="legal"?i("ОГРН",r.customer_ogrn):"",i("Адрес объекта",a.address),i("Телефон",a.phone),i("E-mail",a.email)].join(""),f=t.purpose||E(t),$=t.payment_note==null?q(t):t.payment_note.trim(),R=t.apply_signature&&e.signature_url?`<img src="${o(e.signature_url)}" crossorigin="anonymous" alt="" class="inv-sig"/>`:"",D=t.apply_stamp&&e.stamp_url?`<img src="${o(e.stamp_url)}" crossorigin="anonymous" alt="" class="inv-stamp"/>`:"",_=c=>o((c||"").replace(/\s+/g,"").replace(/(\d{4})(?=\d)/g,"$1 "));return`<div class="invoice-doc">
<style>
.invoice-doc { font-family: Arial, sans-serif; color: #161616; font-size: 12.5px; line-height: 1.45; }
.invoice-doc table { border-collapse: collapse; width: 100%; }
.invoice-doc, .invoice-doc * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
.invoice-doc .sec-title { font-size: 11px; font-weight: 700; letter-spacing: .6px; text-transform: uppercase; color: #6B4508; margin: 0 0 6px; }
.invoice-doc .bank { border: 1.2px solid #6B4508; border-radius: 10px; overflow: hidden; }
.invoice-doc .bank-head { background: #5C3A11; color: #fff; padding: 8px 14px; font-weight: 700; font-size: 12px; letter-spacing: .4px; text-transform: uppercase; }
.invoice-doc .bank td { padding: 7px 14px; border-top: 1px solid #B9A27A; vertical-align: top; }
.invoice-doc .bank tr:first-child td { border-top: none; }
.invoice-doc .bank .k { width: 38%; color: #5a4a30; font-size: 11.5px; }
.invoice-doc .bank .v { font-weight: 600; }
.invoice-doc .bank .acc { font-family: "Courier New", monospace; font-size: 13.5px; font-weight: 700; letter-spacing: .3px; }
.invoice-doc .bank tr.main td { background: #D3C2A2; }
.invoice-doc .title { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; margin: 22px 0 14px; padding-bottom: 8px; border-bottom: 2.5px solid #5C3A11; }
.invoice-doc .title h1 { font-size: 20px; margin: 0; }
.invoice-doc .title .due { font-size: 12px; color: #5a4a30; text-align: right; white-space: nowrap; }
.invoice-doc .title .due b { color: #161616; }
.invoice-doc .parties { display: table; width: 100%; table-layout: fixed; border-spacing: 0; }
.invoice-doc .party { display: table-cell; width: 50%; vertical-align: top; }
.invoice-doc .party + .party { padding-left: 14px; }
.invoice-doc .card { border: 1.2px solid #6B4508; border-radius: 10px; overflow: hidden; height: 100%; }
.invoice-doc .card-head { background: #B9A27A; color: #1F1405; padding: 7px 12px; font-weight: 700; font-size: 11.5px; letter-spacing: .4px; text-transform: uppercase; }
.invoice-doc .card td { padding: 4px 12px; vertical-align: top; font-size: 12px; }
.invoice-doc .card tr:first-child td { padding-top: 8px; }
.invoice-doc .card tr:last-child td { padding-bottom: 9px; }
.invoice-doc .card .k { width: 34%; color: #6b5a3e; font-size: 11px; }
.invoice-doc .card .v { font-weight: 600; word-break: break-word; }
.invoice-doc .basis { margin: 12px 0 0; padding: 9px 14px; background: #D3C2A2; border: 1.2px solid #6B4508; border-left: 4px solid #5C3A11; border-radius: 10px; font-size: 12.5px; color: #161616; }
.invoice-doc .items-wrap { margin-top: 14px; }
.invoice-doc .items th { background: #5C3A11; color: #fff; border: 1.2px solid #6B4508; padding: 7px 6px; font-size: 11.5px; }
.invoice-doc .items td { border: 1.2px solid #6B4508; padding: 6px; }
.invoice-doc .pdf-rt { border: 1.2px solid #6B4508; border-radius: 10px; overflow: hidden; box-sizing: border-box; }
.invoice-doc .pdf-rt > table { border-collapse: collapse; width: 100%; margin: 0; }
.invoice-doc .pdf-rt > table tr > *:first-child { border-left: none; }
.invoice-doc .pdf-rt > table tr > *:last-child { border-right: none; }
.invoice-doc .pdf-rt > table > thead > tr:first-child > * { border-top: none; }
.invoice-doc .pdf-rt > table > *:last-child > tr:last-child > * { border-bottom: none; }
.invoice-doc .items tr { page-break-inside: avoid; break-inside: avoid; }
.invoice-doc .c { text-align: center; }
.invoice-doc .r { text-align: right; white-space: nowrap; }
.invoice-doc .totals { width: auto; margin: 10px 0 0 auto; border: 1.2px solid #6B4508; border-collapse: separate; border-spacing: 0; border-radius: 10px; overflow: hidden; }
.invoice-doc .totals td { padding: 5px 14px; font-weight: 600; }
.invoice-doc .totals .val { text-align: right; min-width: 120px; }
.invoice-doc .totals tr.grand td { background: #5C3A11; color: #fff; font-size: 15px; font-weight: 700; padding: 8px 14px; }
.invoice-doc .words { margin: 12px 0 4px; }
.invoice-doc .note { font-size: 11.5px; color: #333; margin: 10px 0 0; padding-bottom: 10px; border-bottom: 2px solid #5C3A11; }
.invoice-doc .signs { margin-top: 26px; page-break-inside: avoid; break-inside: avoid; }
.invoice-doc .sign-cell { position: relative; padding-bottom: 70px; }
.invoice-doc .sign-line { position: relative; height: 70px; border-bottom: 1px solid #161616; margin: 0 0 3px; }
.invoice-doc .inv-sig { position: absolute; left: 10px; bottom: 3px; height: 58px; max-width: 190px; object-fit: contain; }
.invoice-doc .inv-stamp { position: absolute; right: 0; top: 74px; width: 118px; height: 118px; object-fit: contain; opacity: .9; }
.invoice-doc .hint { font-size: 10.5px; color: #555; }
</style>

<div class="sec-title">Реквизиты для оплаты</div>
<div class="bank">
<div class="bank-head">Получатель платежа</div>
<table>
<tr><td class="k">Получатель</td><td class="v">${o(u)}</td></tr>
<tr><td class="k">ИНН${d?" / КПП":""}</td><td class="v">${o(e.inn)}${d&&e.kpp?` / ${o(e.kpp)}`:""}</td></tr>
<tr class="main"><td class="k">Расчётный счёт (р/с)</td><td class="v acc">${_(e.account_number)}</td></tr>
<tr><td class="k">Банк получателя</td><td class="v">${o(e.bank_name)}</td></tr>
<tr><td class="k">БИК банка</td><td class="v acc">${o(e.bik)}</td></tr>
<tr><td class="k">Корреспондентский счёт (к/с)</td><td class="v acc">${_(e.correspondent_account)}</td></tr>
</table>
</div>

<div class="title">
  <h1>Счёт на оплату № ${o(t.invoice_number)} от ${m(t.invoice_date)}</h1>
  ${t.due_date?`<div class="due">Оплатить до<br/><b>${m(t.due_date)}</b></div>`:""}
</div>

<div class="parties">
  <div class="party"><div class="card"><div class="card-head">Поставщик (Исполнитель)</div><table>${C}</table></div></div>
  <div class="party"><div class="card"><div class="card-head">Покупатель (Заказчик)</div><table>${j}</table></div></div>
</div>
${f?`<div class="basis"><b>Основание:</b> ${o(f)}</div>`:""}

<div class="pdf-rt items-wrap"><table class="items">
<thead><tr>
  <th style="width:5%">№</th><th>Товары (работы, услуги)</th><th style="width:9%">Кол-во</th>
  <th style="width:8%">Ед.</th><th style="width:15%">Цена, ₽</th><th style="width:16%">Сумма, ₽</th>
</tr></thead>
<tbody>${N}</tbody>
</table></div>

<table class="totals">
<tr><td class="lbl">Итого:</td><td class="val">${s(A)}</td></tr>
${z}
<tr class="grand"><td class="lbl">Всего к оплате:</td><td class="val">${s(p)} ₽</td></tr>
</table>

<div class="words">Всего наименований ${(t.items||[]).length}, на сумму ${s(p)} руб.<br/>
<b>${o(I(S(Math.floor(p))))} ${w(p)} ${F(Number(w(p)))}</b></div>
<div class="note">
${$?`<b>Назначение платежа:</b> ${o($)}`:""}
${t.notes?`<br/>${o(t.notes).replace(/\n/g,"<br/>")}`:""}
</div>

<table class="signs"><tr>
<td class="sign-cell" style="width:60%;padding-right:24px">
  <div style="font-weight:700;margin-bottom:4px">${o(g.role)}</div>
  <div class="sign-line">${R}${D}</div>
  <div>${o(g.name)}</div>
  <div class="hint">(подпись)</div>
</td>
<td style="width:40%"></td>
</tr></table>
</div>`}function F(t){const e=t%100,a=t%10;return e>=11&&e<=14?"копеек":a===1?"копейка":a>=2&&a<=4?"копейки":"копеек"}function I(t){return t&&t.charAt(0).toUpperCase()+t.slice(1)}export{V,q as a,U as b,E as d,M as i};
