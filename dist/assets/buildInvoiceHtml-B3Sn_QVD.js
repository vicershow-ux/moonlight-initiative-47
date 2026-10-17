import{m as j}from"./numberToWordsRu-B5XR1I00.js";const o=t=>String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"),s=t=>new Intl.NumberFormat("ru-RU",{minimumFractionDigits:2,maximumFractionDigits:2}).format(t||0),p=t=>{if(!t)return"";const e=new Date(t);return isNaN(e.getTime())?String(t):e.toLocaleDateString("ru-RU",{day:"numeric",month:"long",year:"numeric"}).replace(/\s*г\.?$/,"")+" г."},_=t=>String(Math.round((t||0)*100)%100).padStart(2,"0"),m=20;function D(t){const e=(t.items||[]).reduce((i,n)=>i+(Number(n.quantity)||0)*(Number(n.price)||0),0);if(t.vat_mode==="on_top"){const i=Math.round(e*m)/100;return{sum:e,vat:i,total:e+i}}return t.vat_mode==="included"?{sum:e,vat:Math.round(e*m*100/(100+m))/100,total:e}:{sum:e,vat:0,total:e}}function F(t){const e=[];return t.contract&&e.push(`по Договору № ${t.contract.contract_number} от ${p(t.contract.contract_date)}`),t.act&&e.push(`по Акту № ${t.act.act_number} от ${p(t.act.act_date)}`),e.length?`Оплата ${e.join(", ")}`:""}function q(t){var $;const e=t.company||{},i=t.customer||{name:t.client_name||"",phone:"",email:"",address:""},n=(e.entity_type||"").toLowerCase(),r=/юрид|ооо|общество/.test(n),b=/предприним/.test(n),u=b?`Индивидуальный предприниматель ${e.contact_full_name||e.name||""}`:e.name||e.contact_full_name||"",v=r?{role:e.director_position||"Руководитель",name:e.director_name||e.contact_full_name||""}:{role:b?"Предприниматель":"Исполнитель",name:e.contact_full_name||e.name||""},{sum:y,vat:x,total:l}=D(t),w=t.vat_mode==="on_top"?`<tr><td class="lbl">НДС ${m}%:</td><td class="val">${s(x)}</td></tr>`:t.vat_mode==="included"?`<tr><td class="lbl">В том числе НДС ${m}%:</td><td class="val">${s(x)}</td></tr>`:'<tr><td class="lbl">Без налога (НДС)</td><td class="val">—</td></tr>',k=(t.items||[]).map((d,g)=>`<tr>
<td class="c">${g+1}</td>
<td>${o(d.name)}</td>
<td class="c">${o(d.quantity)}</td>
<td class="c">${o(d.unit)}</td>
<td class="r">${s(Number(d.price))}</td>
<td class="r">${s((Number(d.quantity)||0)*(Number(d.price)||0))}</td>
</tr>`).join(""),a=(d,g)=>g?`<tr><td class="k">${d}</td><td class="v">${o(g)}</td></tr>`:"",z=[a("Наименование",u),a("ИНН",e.inn),r?a("КПП",e.kpp):"",b||r?a(r?"ОГРН":"ОГРНИП",e.ogrn):"",a("Адрес",e.legal_address),a("Телефон",e.phone),a("E-mail",e.email),a("Сайт",e.website)].join(""),c=(($=t.contract)==null?void 0:$.options)||{},A=c.customer_type==="legal"&&c.customer_org_name?c.customer_org_name:c.customer_type==="entrepreneur"?`ИП ${c.customer_name||i.name}`:c.customer_name||i.name,C=[a(c.customer_type==="legal"?"Организация":"ФИО",A),c.customer_type==="entrepreneur"?a("ОГРНИП",c.customer_ogrnip):"",c.customer_type==="legal"?a("ОГРН",c.customer_ogrn):"",a("Адрес объекта",i.address),a("Телефон",i.phone),a("E-mail",i.email)].join(""),h=t.purpose||F(t),N=t.apply_signature&&e.signature_url?`<img src="${o(e.signature_url)}" crossorigin="anonymous" alt="" class="inv-sig"/>`:"",B=t.apply_stamp&&e.stamp_url?`<img src="${o(e.stamp_url)}" crossorigin="anonymous" alt="" class="inv-stamp"/>`:"",f=d=>o((d||"").replace(/\s+/g,"").replace(/(\d{4})(?=\d)/g,"$1 "));return`<div class="invoice-doc">
<style>
.invoice-doc { font-family: Arial, sans-serif; color: #161616; font-size: 12.5px; line-height: 1.45; }
.invoice-doc table { border-collapse: collapse; width: 100%; }
.invoice-doc .sec-title { font-size: 11px; font-weight: 700; letter-spacing: .6px; text-transform: uppercase; color: #6B4508; margin: 0 0 6px; }
.invoice-doc .bank { border: 1.2px solid #6B4508; border-radius: 10px; overflow: hidden; }
.invoice-doc .bank-head { background: #5C3A11; color: #fff; padding: 8px 14px; font-weight: 700; font-size: 12px; letter-spacing: .4px; text-transform: uppercase; }
.invoice-doc .bank td { padding: 7px 14px; border-top: 1px solid #D9C9A8; vertical-align: top; }
.invoice-doc .bank tr:first-child td { border-top: none; }
.invoice-doc .bank .k { width: 38%; color: #5a4a30; font-size: 11.5px; }
.invoice-doc .bank .v { font-weight: 600; }
.invoice-doc .bank .acc { font-family: "Courier New", monospace; font-size: 13.5px; font-weight: 700; letter-spacing: .3px; }
.invoice-doc .bank tr.main td { background: #F3EBDC; }
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
.invoice-doc .basis { margin: 12px 0 0; padding: 9px 14px; background: #F3EBDC; border-left: 4px solid #5C3A11; border-radius: 8px; font-size: 12.5px; }
.invoice-doc .items { margin-top: 14px; }
.invoice-doc .items { border-collapse: collapse; }
.invoice-doc .items th { background: #5C3A11; color: #fff; border: 1.2px solid #6B4508; padding: 7px 6px; font-size: 11.5px; }
.invoice-doc .items td { border: 1.2px solid #6B4508; padding: 6px; }
.invoice-doc .items tr { page-break-inside: avoid; break-inside: avoid; }
.invoice-doc .c { text-align: center; }
.invoice-doc .r { text-align: right; white-space: nowrap; }
.invoice-doc .totals { width: auto; margin: 10px 0 0 auto; border: 1.2px solid #6B4508; border-radius: 10px; border-collapse: separate; border-spacing: 0; overflow: hidden; }
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
<tr><td class="k">ИНН${r?" / КПП":""}</td><td class="v">${o(e.inn)}${r&&e.kpp?` / ${o(e.kpp)}`:""}</td></tr>
<tr class="main"><td class="k">Расчётный счёт (р/с)</td><td class="v acc">${f(e.account_number)}</td></tr>
<tr><td class="k">Банк получателя</td><td class="v">${o(e.bank_name)}</td></tr>
<tr><td class="k">БИК банка</td><td class="v acc">${o(e.bik)}</td></tr>
<tr><td class="k">Корреспондентский счёт (к/с)</td><td class="v acc">${f(e.correspondent_account)}</td></tr>
</table>
</div>

<div class="title">
  <h1>Счёт на оплату № ${o(t.invoice_number)} от ${p(t.invoice_date)}</h1>
  ${t.due_date?`<div class="due">Оплатить до<br/><b>${p(t.due_date)}</b></div>`:""}
</div>

<div class="parties">
  <div class="party"><div class="card"><div class="card-head">Поставщик (Исполнитель)</div><table>${z}</table></div></div>
  <div class="party"><div class="card"><div class="card-head">Покупатель (Заказчик)</div><table>${C}</table></div></div>
</div>
${h?`<div class="basis"><b>Основание:</b> ${o(h)}</div>`:""}

<table class="items">
<thead><tr>
  <th style="width:5%">№</th><th>Товары (работы, услуги)</th><th style="width:9%">Кол-во</th>
  <th style="width:8%">Ед.</th><th style="width:15%">Цена, ₽</th><th style="width:16%">Сумма, ₽</th>
</tr></thead>
<tbody>${k}</tbody>
</table>

<table class="totals">
<tr><td class="lbl">Итого:</td><td class="val">${s(y)}</td></tr>
${w}
<tr class="grand"><td class="lbl">Всего к оплате:</td><td class="val">${s(l)} ₽</td></tr>
</table>

<div class="words">Всего наименований ${(t.items||[]).length}, на сумму ${s(l)} руб.<br/>
<b>${o(E(j(Math.floor(l))))} ${_(l)} ${R(Number(_(l)))}</b></div>
<div class="note">
В назначении платежа укажите: «Оплата по счёту № ${o(t.invoice_number)} от ${p(t.invoice_date)}».
${t.notes?`<br/>${o(t.notes).replace(/\n/g,"<br/>")}`:""}
</div>

<table class="signs"><tr>
<td class="sign-cell" style="width:60%;padding-right:24px">
  <div style="font-weight:700;margin-bottom:4px">${o(v.role)}</div>
  <div class="sign-line">${N}${B}</div>
  <div>${o(v.name)}</div>
  <div class="hint">(подпись)</div>
</td>
<td style="width:40%"></td>
</tr></table>
</div>`}function R(t){const e=t%100,i=t%10;return e>=11&&e<=14?"копеек":i===1?"копейка":i>=2&&i<=4?"копейки":"копеек"}function E(t){return t&&t.charAt(0).toUpperCase()+t.slice(1)}export{q as b,F as d,D as i};
