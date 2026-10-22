import MockAdapter from 'axios-mock-adapter';
import { afterEach, describe, expect, it } from 'vitest';

import {
  adminAccessRequestsApi,
  approveAccessRequest,
  getAccessRequestErrorMessage,
  rejectAccessRequest,
} from './access-requests.service';

const mock = new MockAdapter(adminAccessRequestsApi);

afterEach(() => {
  mock.reset();
});

describe('admin access-requests service', () => {
  it('envia PATCH para aprovar solicitação de acesso', async () => {
    const responsePayload = {
      id: 'req-01',
      status: 'approved' as const,
      updated_at: '2026-10-21T20:00:00.000Z',
    };

    mock.onPatch('/admin/access-requests/req-01/approve').reply(200, responsePayload);

    const result = await approveAccessRequest('req-01');
    expect(result).toEqual(responsePayload);
    expect(mock.history.patch).toHaveLength(1);
  });

  it('envia PATCH com motivo obrigatório para rejeitar solicitação de acesso', async () => {
    const responsePayload = {
      id: 'req-01',
      status: 'rejected' as const,
      review_comment: 'Documento do representante ilegível.',
      updated_at: '2026-10-21T20:05:00.000Z',
    };

    mock.onPatch('/admin/access-requests/req-01/reject').reply(200, responsePayload);

    const result = await rejectAccessRequest('req-01', {
      reason: 'Documento do representante ilegível.',
      review_comment: 'Documento do representante ilegível.',
    });

    expect(result).toEqual(responsePayload);
    expect(JSON.parse(mock.history.patch[0].data)).toEqual({
      reason: 'Documento do representante ilegível.',
      review_comment: 'Documento do representante ilegível.',
    });
  });

  it('extrai mensagem de erro retornada pela API no formato AxiosError', async () => {
    mock.onPatch('/admin/access-requests/req-99/approve').reply(422, {
      message: 'Solicitação já foi processada anteriormente.',
    });

    try {
      await approveAccessRequest('req-99');
    } catch (error) {
      expect(getAccessRequestErrorMessage(error, 'Erro padrão')).toBe(
        'Solicitação já foi processada anteriormente.',
      );
    }
  });
});
