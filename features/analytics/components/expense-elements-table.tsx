import { money } from '../../../shared/lib/format';
import type { OverviewMetric } from '../pipeline/view-model';

/** Read-only presentation of the same expense elements shown by the bar chart. */
export function ExpenseElementsTable({ rows }: { rows: OverviewMetric[] }) {
  return (
    <section className="panel dashboard-detail-table overflow-hidden" aria-labelledby="expense-elements-table-title">
      <div className="border-b px-5 py-4">
        <h2 id="expense-elements-table-title" className="text-sm font-semibold">Detalhamento das despesas</h2>
        <p className="mt-1 text-xs text-muted-foreground">Elementos considerados para microempresas · valores líquidos</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-md text-left text-xs">
          <thead className="bg-muted/40 text-muted-foreground">
            <tr>
              <th scope="col" className="px-5 py-3 font-medium">Código</th>
              <th scope="col" className="px-5 py-3 font-medium">Elemento de despesa</th>
              <th scope="col" className="px-5 py-3 text-right font-medium">Valor líquido</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((item) => (
              <tr key={item.key} className="hover:bg-muted/30">
                <td className="px-5 py-3 text-muted-foreground">{item.key}</td>
                <td className="px-5 py-3 font-medium">{item.name}</td>
                <td className="px-5 py-3 text-right font-medium tabular-nums">{money(item.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
