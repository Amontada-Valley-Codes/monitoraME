import type { Opportunity } from './types';

export const PORTFOLIO_STAGES = [
  { id: 'analysis', label: 'Em análise', tone: 'neutral' },
  { id: 'interested', label: 'Interessada', tone: 'neutral' },
  { id: 'preparing', label: 'Preparando documentação', tone: 'progress' },
  { id: 'confirmed', label: 'Participação confirmada', tone: 'progress' },
  { id: 'submitted', label: 'Proposta enviada no portal oficial', tone: 'progress' },
  { id: 'awaiting', label: 'Aguardando resultado', tone: 'progress' },
  { id: 'won', label: 'Vencedora integral', tone: 'success' },
  { id: 'partial', label: 'Vencedora parcial', tone: 'success' },
  { id: 'lost', label: 'Não vencedora', tone: 'closed' },
  { id: 'discarded', label: 'Descartada', tone: 'closed' },
  { id: 'unconfirmed', label: 'Resultado não confirmado', tone: 'closed' },
] as const;

export type PortfolioStage = (typeof PORTFOLIO_STAGES)[number]['id'];
export type PortfolioRole = 'admin' | 'manager' | 'collaborator';
export type PortfolioMember = { id: string; name: string; role: string; permission: PortfolioRole };

export type PortfolioHistoryEntry = {
  id: string;
  at: string;
  authorId: string;
  action: 'created' | 'stage' | 'assignee' | 'deadline' | 'archived' | 'restored' | 'note';
  from?: string | null;
  to?: string | null;
  note?: string;
};

/** Observação privada da empresa sobre a oportunidade. Não é compartilhada fora do workspace. */
export type PortfolioNote = { text: string; authorId: string; updatedAt: string };

export type PortfolioItem = {
  id: string;
  note?: PortfolioNote | null;
  opportunityId: string;
  stage: PortfolioStage;
  assigneeId: string | null;
  internalDeadline: string | null;
  archived: boolean;
  discardReason?: string;
  version: number;
  history: PortfolioHistoryEntry[];
};

export type PortfolioEntry = PortfolioItem & { opportunity: Opportunity };

export type PortfolioChange =
  | { kind: 'stage'; stage: PortfolioStage; discardReason?: string; submissionConfirmed?: boolean }
  | { kind: 'assignee'; assigneeId: string | null }
  | { kind: 'deadline'; deadline: string | null }
  | { kind: 'archive' }
  | { kind: 'restore' }
  | { kind: 'note'; text: string };

export class PortfolioRuleError extends Error {}

export const DISCARD_REASON_MIN = 10;
export const NOTE_MAX_LENGTH = 1000;
const STAGE_IDS = new Set<string>(PORTFOLIO_STAGES.map((stage) => stage.id));
const BLOCKED_WHEN_SUSPENDED = new Set<PortfolioStage>(['confirmed', 'submitted', 'awaiting', 'won', 'partial', 'lost']);
const ALLOWED_WHEN_ENDED = new Set<PortfolioStage>(['discarded', 'unconfirmed']);

export const stageLabel = (stage: string) =>
  PORTFOLIO_STAGES.find((item) => item.id === stage)?.label ?? 'Etapa desconhecida';

export const isPortfolioStage = (value: string): value is PortfolioStage => STAGE_IDS.has(value);

export const canEditPortfolio = (member: PortfolioMember | undefined) =>
  member?.permission === 'admin' || member?.permission === 'manager';

export const officialStatusLabel: Record<Opportunity['status'], string> = {
  open: 'Aberta',
  suspended: 'Suspensa',
  closed: 'Encerrada',
  revoked: 'Revogada',
  cancelled: 'Anulada',
};

export const isOfficiallyInterrupted = (status: Opportunity['status']) =>
  status === 'suspended' || status === 'revoked' || status === 'cancelled';

/** Explica por que a etapa não pode ser usada enquanto a situação oficial estiver interrompida. */
export function stageBlockReason(status: Opportunity['status'], stage: PortfolioStage): string | null {
  if (status === 'suspended' && BLOCKED_WHEN_SUSPENDED.has(stage)) {
    return 'A oportunidade está suspensa no portal oficial. Aguarde a retomada para avançar a participação.';
  }
  if ((status === 'revoked' || status === 'cancelled') && !ALLOWED_WHEN_ENDED.has(stage)) {
    return `A oportunidade foi ${officialStatusLabel[status].toLowerCase()} pelo órgão. Só é possível descartá-la ou registrar resultado não confirmado.`;
  }
  return null;
}

/** Valida e aplica uma alteração. Usada tanto na atualização otimista quanto no repositório. */
export function applyPortfolioChange(
  entry: PortfolioEntry,
  change: PortfolioChange,
  authorId: string,
  at = new Date().toISOString(),
): PortfolioEntry {
  const record = (data: Omit<PortfolioHistoryEntry, 'id' | 'at' | 'authorId'>): PortfolioHistoryEntry => ({
    id: `${entry.id}-v${entry.version + 1}`,
    at,
    authorId,
    ...data,
  });
  const bump = (patch: Partial<PortfolioItem>, history: PortfolioHistoryEntry): PortfolioEntry => ({
    ...entry,
    ...patch,
    version: entry.version + 1,
    history: [history, ...entry.history],
  });

  if (entry.archived && change.kind !== 'restore') {
    throw new PortfolioRuleError('Restaure a oportunidade antes de alterá-la.');
  }

  switch (change.kind) {
    case 'stage': {
      if (!isPortfolioStage(change.stage)) throw new PortfolioRuleError('Etapa fora do catálogo.');
      if (change.stage === entry.stage) throw new PortfolioRuleError('A oportunidade já está nesta etapa.');
      const blocked = stageBlockReason(entry.opportunity.status, change.stage);
      if (blocked) throw new PortfolioRuleError(blocked);
      const reason = change.discardReason?.trim() ?? '';
      if (change.stage === 'discarded' && reason.length < DISCARD_REASON_MIN) {
        throw new PortfolioRuleError(`Informe o motivo do descarte (mínimo de ${DISCARD_REASON_MIN} caracteres).`);
      }
      if (change.stage === 'submitted' && change.submissionConfirmed !== true) {
        throw new PortfolioRuleError('Confirme manualmente que a proposta foi enviada no portal oficial.');
      }
      return bump(
        { stage: change.stage, discardReason: change.stage === 'discarded' ? reason : undefined },
        record({ action: 'stage', from: entry.stage, to: change.stage, note: change.stage === 'discarded' ? reason : undefined }),
      );
    }
    case 'assignee':
      if (change.assigneeId === entry.assigneeId) throw new PortfolioRuleError('Este já é o responsável atual.');
      return bump({ assigneeId: change.assigneeId }, record({ action: 'assignee', from: entry.assigneeId, to: change.assigneeId }));
    case 'deadline':
      if (change.deadline === entry.internalDeadline) throw new PortfolioRuleError('Este já é o prazo atual.');
      return bump({ internalDeadline: change.deadline }, record({ action: 'deadline', from: entry.internalDeadline, to: change.deadline }));
    case 'archive':
      return bump({ archived: true }, record({ action: 'archived' }));
    case 'restore':
      if (!entry.archived) throw new PortfolioRuleError('A oportunidade já está ativa.');
      return bump({ archived: false }, record({ action: 'restored' }));
    case 'note': {
      const text = change.text.trim();
      if (!text) throw new PortfolioRuleError('Escreva a observação antes de salvar.');
      if (text.length > NOTE_MAX_LENGTH) throw new PortfolioRuleError(`A observação deve ter no máximo ${NOTE_MAX_LENGTH} caracteres.`);
      if (text === entry.note?.text) throw new PortfolioRuleError('A observação não foi alterada.');
      return bump({ note: { text, authorId, updatedAt: at } }, record({ action: 'note', from: entry.note ? 'edited' : null }));
    }
  }
}

export const activePortfolioCount = (entries: PortfolioItem[]) => entries.filter((entry) => !entry.archived).length;
