export type CommitmentErrorContent = {
  title: string;
  description: string;
  action: string;
  href: string | null;
};

export function getCommitmentErrorContent(status: number, message: string): CommitmentErrorContent {
  if (status === 0) return { title: 'Sem conexão', description: 'Verifique sua conexão e tente novamente.', action: 'Tentar novamente', href: null };
  if (status === 401) return { title: 'Sua sessão expirou', description: 'Entre novamente para continuar.', action: 'Entrar', href: '/login' };
  if (status === 403) return { title: 'Cadastro necessário', description: 'Conclua o cadastro da empresa para consultar os empenhos.', action: 'Completar cadastro', href: '/request-access/company' };
  if (status === 422) return { title: 'Período inválido', description: message, action: 'Revisar filtros', href: null };
  if (status === 503) return { title: 'Serviço indisponível', description: 'A consulta ao TCE está temporariamente indisponível.', action: 'Tentar novamente', href: null };
  return { title: 'Não foi possível carregar os dados', description: message, action: 'Tentar novamente', href: null };
}

export function getCommitmentViewState(
  loading: boolean,
  hasError: boolean,
  itemCount: number,
): 'loading' | 'error' | 'empty' | 'ready' {
  if (loading) return 'loading';
  if (hasError) return 'error';
  return itemCount === 0 ? 'empty' : 'ready';
}

