import{m as L}from"./numberToWordsRu-B5XR1I00.js";const o=e=>String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"),n=e=>new Intl.NumberFormat("ru-RU",{minimumFractionDigits:2,maximumFractionDigits:2}).format(e||0),p=e=>{if(!e)return"";const t=new Date(e);return isNaN(t.getTime())?String(e):t.toLocaleDateString("ru-RU",{day:"numeric",month:"long",year:"numeric"}).replace(/\s*г\.?$/,"")+" г."},_=e=>String(Math.round((e||0)*100)%100).padStart(2,"0"),l=20;function A(e){const t=(e.items||[]).reduce((a,r)=>a+(Number(r.quantity)||0)*(Number(r.price)||0),0);if(e.vat_mode==="on_top"){const a=Math.round(t*l)/100;return{sum:t,vat:a,total:t+a}}return e.vat_mode==="included"?{sum:t,vat:Math.round(t*l*100/(100+l))/100,total:t}:{sum:t,vat:0,total:t}}function S(e){const t=[];return e.contract&&t.push(`по Договору № ${e.contract.contract_number} от ${p(e.contract.contract_date)}`),e.act&&t.push(`по Акту № ${e.act.act_number} от ${p(e.act.act_date)}`),t.length?`Оплата ${t.join(", ")}`:""}function M(e){var $;const t=e.company||{},a=e.customer||{name:e.client_name||"",phone:"",email:"",address:""},r=(t.entity_type||"").toLowerCase(),c=/юрид|ооо|общество/.test(r),m=/предприним/.test(r),u=m?`Индивидуальный предприниматель ${t.contact_full_name||t.name||""}`:t.name||t.contact_full_name||"",b=c?{role:t.director_position||"Руководитель",name:t.director_name||t.contact_full_name||""}:{role:m?"Предприниматель":"Исполнитель",name:t.contact_full_name||t.name||""},{sum:x,vat:g,total:d}=A(e),v=e.vat_mode==="on_top"?`<tr><td class="lbl">НДС ${l}%:</td><td class="val">${n(g)}</td></tr>`:e.vat_mode==="included"?`<tr><td class="lbl">В том числе НДС ${l}%:</td><td class="val">${n(g)}</td></tr>`:'<tr><td class="lbl">Без налога (НДС)</td><td class="val">—</td></tr>',y=(e.items||[]).map((s,j)=>`<tr>
<td class="c">${j+1}</td>
<td>${o(s.name)}</td>
<td class="c">${o(s.quantity)}</td>
<td class="c">${o(s.unit)}</td>
<td class="r">${n(Number(s.price))}</td>
<td class="r">${n((Number(s.quantity)||0)*(Number(s.price)||0))}</td>
</tr>`).join(""),f=[o(u),t.inn?`ИНН ${o(t.inn)}`:"",c&&t.kpp?`КПП ${o(t.kpp)}`:"",(m||c)&&t.ogrn?`${c?"ОГРН":"ОГРНИП"} ${o(t.ogrn)}`:"",t.legal_address?o(t.legal_address):"",t.phone?`тел.: ${o(t.phone)}`:"",t.email?`e-mail: ${o(t.email)}`:"",t.website?`сайт: ${o(t.website)}`:""].filter(Boolean).join(", "),i=(($=e.contract)==null?void 0:$.options)||{},w=i.customer_type==="legal"&&i.customer_org_name?i.customer_org_name:i.customer_type==="entrepreneur"?`ИП ${i.customer_name||a.name}`:i.customer_name||a.name,k=[o(w),i.customer_type==="entrepreneur"&&i.customer_ogrnip?`ОГРНИП ${o(i.customer_ogrnip)}`:"",i.customer_type==="legal"&&i.customer_ogrn?`ОГРН ${o(i.customer_ogrn)}`:"",a.address?`адрес объекта: ${o(a.address)}`:"",a.phone?`тел.: ${o(a.phone)}`:"",a.email?`e-mail: ${o(a.email)}`:""].filter(Boolean).join(", "),h=e.purpose||S(e),N=e.apply_signature&&t.signature_url?`<img src="${o(t.signature_url)}" crossorigin="anonymous" alt="" class="inv-sig"/>`:"",z=e.apply_stamp&&t.stamp_url?`<img src="${o(t.stamp_url)}" crossorigin="anonymous" alt="" class="inv-stamp"/>`:"";return`<div class="invoice-doc">
<style>
.invoice-doc { font-family: Arial, sans-serif; color: #111; font-size: 12.5px; line-height: 1.4; }
.invoice-doc table { border-collapse: collapse; width: 100%; }
.invoice-doc .bank td { border: 1px solid #333; padding: 4px 6px; vertical-align: top; }
.invoice-doc .bank .small { font-size: 10.5px; color: #444; }
.invoice-doc h1 { font-size: 19px; margin: 22px 0 6px; padding-bottom: 6px; border-bottom: 2px solid #111; }
.invoice-doc .party { margin: 8px 0; }
.invoice-doc .party b { display: inline-block; min-width: 110px; }
.invoice-doc .items th { background: #5C3A11; color: #fff; border: 1px solid #333; padding: 6px; font-size: 11.5px; }
.invoice-doc .items td { border: 1px solid #333; padding: 5px 6px; }
.invoice-doc .items tr { page-break-inside: avoid; break-inside: avoid; }
.invoice-doc .c { text-align: center; }
.invoice-doc .r { text-align: right; white-space: nowrap; }
.invoice-doc .totals { width: auto; margin: 8px 0 0 auto; }
.invoice-doc .totals td { padding: 2px 0 2px 16px; font-weight: 700; }
.invoice-doc .totals .val { text-align: right; min-width: 110px; }
.invoice-doc .words { margin: 12px 0 4px; }
.invoice-doc .words b { font-weight: 700; }
.invoice-doc .note { font-size: 11.5px; color: #333; margin: 10px 0 0; padding-bottom: 10px; border-bottom: 2px solid #111; }
.invoice-doc .signs { margin-top: 28px; page-break-inside: avoid; break-inside: avoid; }
.invoice-doc .sign-cell { position: relative; padding-bottom: 70px; }
.invoice-doc .sign-line { position: relative; height: 70px; border-bottom: 1px solid #111; margin: 0 0 3px; }
.invoice-doc .inv-sig { position: absolute; left: 10px; bottom: 3px; height: 58px; max-width: 190px; object-fit: contain; }
.invoice-doc .inv-stamp { position: absolute; right: 0; top: 74px; width: 118px; height: 118px; object-fit: contain; opacity: .9; }
.invoice-doc .hint { font-size: 10.5px; color: #555; }
</style>

<table class="bank">
<tr>
  <td colspan="2" rowspan="2" style="width:60%">${o(t.bank_name)}<br/><span class="small">Банк получателя</span></td>
  <td style="width:10%">БИК</td><td>${o(t.bik)}</td>
</tr>
<tr><td>Сч. №</td><td>${o(t.correspondent_account)}</td></tr>
<tr>
  <td>ИНН ${o(t.inn)}</td><td>${c?`КПП ${o(t.kpp)}`:""}</td>
  <td rowspan="2">Сч. №</td><td rowspan="2">${o(t.account_number)}</td>
</tr>
<tr><td colspan="2">${o(u)}<br/><span class="small">Получатель</span></td></tr>
</table>

<h1>Счёт на оплату № ${o(e.invoice_number)} от ${p(e.invoice_date)}</h1>

<div class="party"><b>Поставщик<br/>(Исполнитель):</b> ${f}</div>
<div class="party"><b>Покупатель<br/>(Заказчик):</b> ${k}</div>
${h?`<div class="party"><b>Основание:</b> ${o(h)}</div>`:""}

<table class="items" style="margin-top:10px">
<thead><tr>
  <th style="width:5%">№</th><th>Товары (работы, услуги)</th><th style="width:9%">Кол-во</th>
  <th style="width:8%">Ед.</th><th style="width:15%">Цена</th><th style="width:16%">Сумма</th>
</tr></thead>
<tbody>${y}</tbody>
</table>

<table class="totals">
<tr><td class="lbl">Итого:</td><td class="val">${n(x)}</td></tr>
${v}
<tr><td class="lbl">Всего к оплате:</td><td class="val">${n(d)}</td></tr>
</table>

<div class="words">Всего наименований ${(e.items||[]).length}, на сумму ${n(d)} руб.<br/>
<b>${o(D(L(Math.floor(d))))} ${_(d)} ${q(Number(_(d)))}</b></div>
<div class="note">
${e.due_date?`Оплатить не позднее ${p(e.due_date)} `:""}В назначении платежа укажите номер счёта.
${e.notes?`<br/>${o(e.notes).replace(/\n/g,"<br/>")}`:""}
</div>

<table class="signs"><tr>
<td class="sign-cell" style="width:60%;padding-right:24px">
  <div style="font-weight:700;margin-bottom:4px">${o(b.role)}</div>
  <div class="sign-line">${N}${z}</div>
  <div>${o(b.name)}</div>
  <div class="hint">(подпись)</div>
</td>
<td style="width:40%"></td>
</tr></table>
</div>`}function q(e){const t=e%100,a=e%10;return t>=11&&t<=14?"копеек":a===1?"копейка":a>=2&&a<=4?"копейки":"копеек"}function D(e){return e&&e.charAt(0).toUpperCase()+e.slice(1)}export{M as b,S as d,A as i};
