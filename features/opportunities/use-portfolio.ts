'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { applyPortfolioChange, PortfolioRuleError, stageLabel, type PortfolioChange, type PortfolioEntry } from './portfolio';
import {
  PortfolioConflictError,
  PortfolioLimitError,
  type PortfolioRepository,
  type PortfolioSnapshot,
} from './portfolio-repository';

export type PortfolioConflict = { entry: PortfolioEntry; change: PortfolioChange };
type State =
  | { status: 'loading' }
  | { status: 'error' }
  | ({ status: 'ready' } & PortfolioSnapshot);

const successMessage = (change: PortfolioChange) => {
  switch (change.kind) {
    case 'stage': return `Etapa alterada para “${stageLabel(change.stage)}”.`;
    case 'assignee': return 'Responsável atualizado.';
    case 'deadline': return change.deadline ? 'Prazo interno atualizado.' : 'Prazo interno removido.';
    case 'archive': return 'Oportunidade arquivada. O histórico foi preservado.';
    case 'restore': return 'Oportunidade restaurada para a carteira ativa.';
    case 'note': return 'Observação salva.';
  }
};

export function usePortfolio(repository: PortfolioRepository, actorId: string) {
  const [state, setState] = useState<State>({ status: 'loading' });
  const [conflict, setConflict] = useState<PortfolioConflict | null>(null);
  const [pendingIds, setPendingIds] = useState<Set<string>>(() => new Set());

  const reload = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      setState({ status: 'ready', ...(await repository.load()) });
    } catch {
      setState({ status: 'error' });
    }
  }, [repository]);

  useEffect(() => {
    let active = true;
    repository.load()
      .then((snapshot) => active && setState({ status: 'ready', ...snapshot }))
      .catch(() => active && setState({ status: 'error' }));
    return () => { active = false; };
  }, [repository]);

  const replaceEntry = (entry: PortfolioEntry) =>
    setState((current) => {
      if (current.status !== 'ready') return current;
      const entries = current.entries.map((item) => (item.id === entry.id ? entry : item));
      const delta = Number(!entry.archived) - Number(!current.entries.find((item) => item.id === entry.id)?.archived);
      return { ...current, entries, usage: { ...current.usage, used: current.usage.used + delta } };
    });

  const setPending = (id: string, pending: boolean) =>
    setPendingIds((current) => {
      const next = new Set(current);
      if (pending) next.add(id); else next.delete(id);
      return next;
    });

  const mutate = async (entry: PortfolioEntry, change: PortfolioChange) => {
    let optimistic: PortfolioEntry;
    try {
      optimistic = applyPortfolioChange(entry, change, actorId);
    } catch (error) {
      toast.error(error instanceof PortfolioRuleError ? error.message : 'Alteração inválida.');
      return false;
    }
    replaceEntry(optimistic);
    setPending(entry.id, true);
    try {
      replaceEntry(await repository.update(entry.id, entry.version, change, actorId));
      setConflict((current) => (current?.entry.id === entry.id ? null : current));
      toast.success(successMessage(change));
      return true;
    } catch (error) {
      if (error instanceof PortfolioConflictError) {
        replaceEntry(error.latest);
        setConflict({ entry: error.latest, change });
        toast.warning(error.message);
      } else {
        replaceEntry(entry);
        const detail = error instanceof PortfolioRuleError || error instanceof PortfolioLimitError ? error.message : 'Verifique sua conexão e tente novamente.';
        toast.error(`Não foi possível salvar. A alteração foi desfeita. ${detail}`);
      }
      return false;
    } finally {
      setPending(entry.id, false);
    }
  };

  const add = async (opportunityId: string) => {
    try {
      const entry = await repository.add(opportunityId, actorId);
      setState((current) =>
        current.status !== 'ready'
          ? current
          : {
              ...current,
              entries: [entry, ...current.entries],
              available: current.available.filter((item) => item.id !== opportunityId),
              usage: { ...current.usage, used: current.usage.used + 1 },
            },
      );
      toast.success('Oportunidade adicionada à carteira.');
      return true;
    } catch (error) {
      const known = error instanceof PortfolioRuleError || error instanceof PortfolioLimitError;
      toast.error(known ? error.message : 'Não foi possível adicionar a oportunidade. Tente novamente.');
      return false;
    }
  };

  const resolveConflict = async (reapply: boolean) => {
    const current = conflict;
    setConflict(null);
    if (reapply && current) await mutate(current.entry, current.change);
  };

  return { state, conflict, pendingIds, reload, mutate, add, resolveConflict };
}
