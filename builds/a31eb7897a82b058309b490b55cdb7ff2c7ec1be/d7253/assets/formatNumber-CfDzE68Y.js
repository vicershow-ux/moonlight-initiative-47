function t(n){const r=typeof n=="number"?n:parseFloat(String(n??""));return Number.isFinite(r)?String(Math.round((r+Number.EPSILON)*100)/100):"0"}export{t as n};
