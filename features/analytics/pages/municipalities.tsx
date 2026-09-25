'use client';

import { useState } from 'react';
import { PageHeader } from '../components/page-header';
import { GlobalFilters } from '../components/global-filters';
import { MunicipalTable } from '../components/municipal-table';
import { useAnalytics } from '../data/context';
import { ExportButton } from '@/shared/components/export-button';
import { exportDataset } from '../data/export-datasets';
import { LoadingState, ErrorState } from '@/shared/components/states';
import { SelectField } from '@/shared/components/select-field';
import { MUNICIPALITIES } from '../data/fixtures';

export default function Municipalities() {
  const { data, state, reload, filters } = useAnalytics();
  const [region, setRegion] = useState('all');

  return (
    <>
      <PageHeader
        eyebrow="Análise municipal"
        title="Municípios"
        description="Compare a participação de ME e o destino dos recursos de cada município."
        actions={
          data && (
            <ExportButton
              filters={filters}
              dataset={exportDataset({
                ...data,
                municipalities: data.municipalities.filter(
                  (m) => region === 'all' || m.region === region
                ),
              })}
            />
          )
        }
      />
      <GlobalFilters />
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          20 municípios na amostra · códigos IBGE preservados
        </p>
        <SelectField
          value={region}
          onChange={setRegion}
          label="Região"
          options={[
            { value: 'all', label: 'Todas as regiões' },
            ...Array.from(new Set(MUNICIPALITIES.map((m) => m.region))).map(
              (r) => ({ value: r, label: r })
            ),
          ]}
        />
      </div>
      {state === 'loading' ? (
        <LoadingState />
      ) : state === 'error' ? (
        <ErrorState onRetry={reload} />
      ) : (
        data && (
          <MunicipalTable
            rows={data.municipalities.filter(
              (m) =>
                (filters.municipality === 'all' ||
                  m.id === filters.municipality) &&
                (region === 'all' || m.region === region)
            )}
          />
        )
      )}
    </>
  );
}