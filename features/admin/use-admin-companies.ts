'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AdminConflictError, type AdminRepository } from './admin-repository';
import { AdminRuleError } from './rules';
import type { AdminCompany, CompanyAccessChange } from './types';

type State = { status: 'loading' } | { status: 'error' } | { status: 'ready'; companies: AdminCompany[] };

export function useAdminCompanies(repository: AdminRepository, authorName: string) {
  const [state, setState] = useState<State>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    repository
      .listCompanies(controller.signal)
      .then((companies) => setState({ status: 'ready', companies }))
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === 'AbortError')) setState({ status: 'error' });
      });
    return () => controller.abort();
  }, [repository, attempt]);

  const reload = useCallback(() => {
    setState({ status: 'loading' });
    setAttempt((value) => value + 1);
  }, []);

  const replace = (company: AdminCompany) =>
    setState((current) =>
      current.status === 'ready'
        ? { ...current, companies: current.companies.map((item) => (item.id === company.id ? company : item)) }
        : current,
    );

  /** Operação sensível: a interface só muda depois da confirmação do servidor. */
  const changeAccess = async (company: AdminCompany, change: CompanyAccessChange) => {
    setPendingId(company.id);
    try {
      replace(await repository.changeCompanyAccess(company.id, company.version, change, authorName));
      toast.success(change.kind === 'suspend' ? `Acesso de ${company.legal_name} suspenso.` : `Acesso de ${company.legal_name} reativado.`);
      return true;
    } catch (error) {
      if (error instanceof AdminConflictError) {
        replace(error.latest);
        toast.warning(error.message);
      } else {
        toast.error(error instanceof AdminRuleError ? error.message : 'Não foi possível alterar a situação. Nada foi modificado; tente novamente.');
      }
      return false;
    } finally {
      setPendingId(null);
    }
  };

  return { state, pendingId, reload, changeAccess };
}
