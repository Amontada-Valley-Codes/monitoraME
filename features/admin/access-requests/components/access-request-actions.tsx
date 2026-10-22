'use client';

import { ApproveAccessDialog } from './approve-access-dialog';
import { RejectAccessDialog } from './reject-access-dialog';
import type { AdminAccessRequestStatus } from '../types';

export interface AccessRequestActionsProps {
  requestId: string;
  companyName: string;
  cnpj?: string;
  protocol?: string;
  locationLabel?: string;
  status: AdminAccessRequestStatus;
  onStatusUpdated: (
    requestId: string,
    newStatus: 'approved' | 'rejected',
    reviewComment?: string,
  ) => void;
}

export function AccessRequestActions({
  requestId,
  companyName,
  cnpj,
  protocol,
  locationLabel,
  status,
  onStatusUpdated,
}: AccessRequestActionsProps) {
  const isActionable = status === 'pending' || status === 'under_review';

  if (!isActionable) {
    return (
      <span className="inline-flex items-center rounded-full border border-[#e2e8f0] bg-[#f8fafc] px-3 py-1 text-xs font-medium text-[#64748b]">
        Deliberação concluída
      </span>
    );
  }

  return (
    <div className="flex items-center justify-end gap-2.5">
      <RejectAccessDialog
        requestId={requestId}
        companyName={companyName}
        cnpj={cnpj}
        protocol={protocol}
        locationLabel={locationLabel}
        onSuccess={(id, reason) => onStatusUpdated(id, 'rejected', reason)}
      />
      <ApproveAccessDialog
        requestId={requestId}
        companyName={companyName}
        cnpj={cnpj}
        protocol={protocol}
        locationLabel={locationLabel}
        onSuccess={(id) => onStatusUpdated(id, 'approved')}
      />
    </div>
  );
}
