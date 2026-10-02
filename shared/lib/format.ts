export const number = (n:number) => new Intl.NumberFormat('pt-BR').format(n);
export const money = (cents:number) => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(cents/100);
export const compactMoney = (cents:number) => { const reais=cents/100; const unit=reais>=1e9?'bi':reais>=1e6?'mi':reais>=1e3?'mil':''; const scale=unit==='bi'?1e9:unit==='mi'?1e6:unit==='mil'?1e3:1; return `R$ ${new Intl.NumberFormat('pt-BR',{maximumFractionDigits:2}).format(reais/scale)}${unit?' '+unit:''}`; };
export const percent = (n:number|null) => n===null?'—':new Intl.NumberFormat('pt-BR',{maximumFractionDigits:2,minimumFractionDigits:2}).format(Math.abs(n)<0.005?0:n)+'%';
export const points = (n:number) => `${n>0?'+':''}${new Intl.NumberFormat('pt-BR',{maximumFractionDigits:1}).format(n)} p.p.`;
export const dateLabel = (date:string) => new Date(date+'T12:00:00').toLocaleDateString('pt-BR');
export const ratio=(part:number,total:number) => total?part/total*100:0;
export const delta=(current:number,previous:number) => previous?(current-previous)/previous*100:null;
export const normalize=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
