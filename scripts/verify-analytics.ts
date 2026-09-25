import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { DEFAULT_FILTERS,EXPENSES } from '../features/analytics/data/fixtures';
import { selectExpenses,aggregate,mockAnalyticsRepository } from '../features/analytics/data/repository';
import { makeExport } from '../shared/lib/export';
import { exportDataset } from '../features/analytics/data/export-datasets';
const f={...DEFAULT_FILTERS,municipality:'2300200'};
const a=aggregate(selectExpenses(f));
for(const [key,want] of [['mpe',29.76629766297663],['me',29.76629766297663],['local',5.904059040590406],['mpeLocal',2.214022140221402]] as const)assert.ok(Math.abs(a[key]/a.total*100-want)<1e-8,`${key} must equal ${want}`);
for(const filter of [DEFAULT_FILTERS,f,{...f,origin:'LOCAL'},{...f,size:'ME'},{...f,categories:['339030']},{...f,start:'2027-01-01',end:'2027-12-31'}]){const s=aggregate(selectExpenses(filter));assert.equal(s.bySize.reduce((n,x)=>n+x.value,0),s.total);assert.equal(s.byOrigin.reduce((n,x)=>n+x.value,0),s.total);assert.equal(s.monthly.reduce((n,x)=>n+x.total,0),s.total);assert.ok(s.mpeLocal<=Math.min(s.local,s.mpe));}
assert.equal(aggregate(selectExpenses({...f,origin:'LOCAL'})).total,a.local);
assert.ok(aggregate(selectExpenses({...f,categories:['339030']})).total<a.total);
assert.ok(EXPENSES.every(r=>Number.isSafeInteger(r.net)&&r.net>=0&&r.gross-r.cancelled===r.net));
assert.equal(new Set(EXPENSES.map(r=>r.id)).size,EXPENSES.length);
const data=await mockAnalyticsRepository.query(f);const dataset=exportDataset(data);
const output=path.join(os.tmpdir(),'monitorame-qa-exports');await fs.mkdir(output,{recursive:true});
for(const format of ['csv','xlsx','pdf'] as const){const blob=await makeExport(format,dataset,f);assert.ok(blob.size>100);await fs.writeFile(`${output}/verificacao.${format}`,new Uint8Array(await blob.arrayBuffer()));}
const {default:ExcelJS}=await import('exceljs');const wb=new ExcelJS.Workbook();await wb.xlsx.readFile(`${output}/verificacao.xlsx`);assert.equal(wb.worksheets[0].getCell('E2').value,a.total/100);assert.equal(wb.worksheets[1].name,'Procedência');assert.ok(wb.worksheets[1].rowCount>10);
const csv=await fs.readFile(`${output}/verificacao.csv`,'utf8');assert.ok(csv.includes('Demonstração'));assert.ok(csv.includes('2300200'));
console.log(JSON.stringify({status:'passed',fixturePercentages:{me:29.76629766297663,local:5.904059040590406,meLocal:2.214022140221402},records:EXPENSES.length,checks:['aggregate conservation','filtered totals','integer cents','unique records','CSV contents','XLSX numeric cells and provenance','PDF generation']}));
