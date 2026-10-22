'use client';

import { useCallback, useEffect, useState } from 'react';
import type { AdminRepository } from './admin-repository';
import type { AdminOverview } from './types';

type State = { status: 'loading' } | { status: 'error' } | { status: 'ready'; overview: AdminOverview; loadedAt: number };

export function useAdminOverview(repository: AdminRepository) {
  const [state, setState] = useState<State>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    repository
      .getOverview(controller.signal)
      .then((overview) => setState({ status: 'ready', overview, loadedAt: Date.now() }))
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === 'AbortError')) setState({ status: 'error' });
      });
    return () => controller.abort();
  }, [repository, attempt]);

  const reload = useCallback(() => {
    setState({ status: 'loading' });
    setAttempt((value) => value + 1);
  }, []);

  return { state, reload };
}
