import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { ExpenseElementsTable } from './expense-elements-table';

describe('detalhamento visual das despesas', () => {
  it('exibe somente os elementos recebidos, sem acrescentar categorias ou métricas', () => {
    const html = renderToStaticMarkup(
      <ExpenseElementsTable rows={[
        { key: '30', name: 'Material de consumo', value: 12345, color: 'var(--chart-1)' },
        { key: '40', name: 'Serviços de TI', value: 0, color: 'var(--chart-1)' },
      ]} />,
    );

    expect(html).toContain('Material de consumo');
    expect(html).toContain('Serviços de TI');
    expect(html).toContain('R$ 123,45');
    expect(html).toContain('R$ 0,00');
    expect((html.match(/<tr/g) ?? [])).toHaveLength(3);
    expect(html).not.toContain('Receita');
  });
});
