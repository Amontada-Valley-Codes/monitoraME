import type { Filters } from '@/features/analytics/data/types';
import { CATEGORIES,MUNICIPALITIES,ORIGINS,SIZES,SOURCE_META } from '@/features/analytics/data/fixtures';
export type ExportDataset={title:string;columns:string[];rows:(string|number)[][]};
export function provenance(filters:Filters){return [['Ambiente','Demonstração: valores e empresas fictícios'],['Fonte prevista',SOURCE_META.source],['Período',`${filters.start} a ${filters.end}`],['Município comprador',MUNICIPALITIES.find(m=>m.id===filters.municipality)?.name??'Todos os municípios da amostra'],['Código IBGE',filters.municipality],['UF',filters.uf],['Porte',SIZES.find(s=>s.id===filters.size)?.name??'Todos'],['Origem',ORIGINS.find(o=>o.id===filters.origin)?.name??'Todas'],['Naturezas',filters.categories.map(id=>`${id} ${CATEGORIES.find(c=>c.id===id)?.name}`).join('; ')],['Base de cálculo','Empenho líquido: inicial + reforços - anulações; não representa pagamento'],['ME','Microempresas; MEI apresentado separadamente.'],['Denominador','Todas as compras consideradas, inclusive não identificados.'],['Porte temporal','2024: retrato atual; 2025–2026: histórico simulado.'],['Atualização ilustrativa',SOURCE_META.updated]];}
const protectCSV=(v:string|number)=>{let s=String(v);if(typeof v==='string'&&/^[=+\-@\t\r]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};
export async function makeExport(format:'csv'|'xlsx'|'pdf',dataset:ExportDataset,filters:Filters):Promise<Blob>{
 const meta=provenance(filters);
 if(format==='csv'){const lines=[...meta,[],dataset.columns,...dataset.rows];return new Blob(['\uFEFF'+lines.map(r=>r.map(protectCSV).join(';')).join('\r\n')],{type:'text/csv;charset=utf-8'});}
 if(format==='xlsx'){
  const {default:ExcelJS}=await import('exceljs');const workbook=new ExcelJS.Workbook();workbook.creator='MonitoraME';const sheet=workbook.addWorksheet('Dados');sheet.addRow(dataset.columns);dataset.rows.forEach(r=>sheet.addRow(r));sheet.views=[{state:'frozen',ySplit:1}];sheet.autoFilter={from:{row:1,column:1},to:{row:dataset.rows.length+1,column:dataset.columns.length}};
  const metaSheet=workbook.addWorksheet('Procedência');metaSheet.addRows([['Campo','Referência'],...meta]);
  [sheet,metaSheet].forEach(s=>{s.getRow(1).font={bold:true,color:{argb:'FFFFFFFF'}};s.getRow(1).fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF2058B7'}};s.columns.forEach((c,i)=>{c.width=s===metaSheet?(i===0?25:95):i===0?32:25;});});
  dataset.columns.forEach((name,i)=>{if(name.includes('(R$)'))sheet.getColumn(i+1).numFmt='"R$" #,##0.00';if(name.includes('(%)'))sheet.getColumn(i+1).numFmt='0.0"%"';});
  const bytes=await workbook.xlsx.writeBuffer();return new Blob([new Uint8Array(bytes as ArrayBuffer)],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
 }
 const {jsPDF}=await import('jspdf');const {default:autoTable}=await import('jspdf-autotable');const doc=new jsPDF({orientation:dataset.columns.length>5?'landscape':'portrait'});
 doc.setFontSize(18);doc.text('MonitoraME | '+dataset.title,14,18);doc.setFontSize(9);doc.text('DEMONSTRAÇÃO · Dados fictícios · Despesas empenhadas',14,25);
 autoTable(doc,{startY:32,head:[['Recorte e procedência','Referência']],body:meta,styles:{fontSize:8,cellPadding:2},columnStyles:{0:{cellWidth:45}},headStyles:{fillColor:[32,88,183]}});
 const end=(doc as unknown as {lastAutoTable:{finalY:number}}).lastAutoTable.finalY;
 autoTable(doc,{startY:end+8,head:[dataset.columns],body:dataset.rows.map(r=>r.map(v=>typeof v==='number'?new Intl.NumberFormat('pt-BR',{maximumFractionDigits:2}).format(v):v)),styles:{fontSize:8,cellPadding:3},headStyles:{fillColor:[32,88,183]},didDrawPage:()=>{const h=doc.internal.pageSize.getHeight();doc.setFontSize(8);doc.text('MonitoraME · Dados ilustrativos | Página '+doc.getCurrentPageInfo().pageNumber,14,h-8);}});return doc.output('blob');
}
export function downloadBlob(blob:Blob,filename:string){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
