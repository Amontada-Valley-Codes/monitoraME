import axios from 'axios';
import type {
  AccessRequestActionResponse,
  AdminAccessRequest,
  ApproveAccessRequestPayload,
  RejectAccessRequestPayload,
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

export const adminAccessRequestsApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15_000,
});

export function getAccessRequestErrorMessage(
  error: unknown,
  fallbackMessage: string,
): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; error?: { message?: string } }
      | undefined;
    return data?.error?.message || data?.message || fallbackMessage;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallbackMessage;
}

export async function fetchAdminAccessRequests(
  status: 'pending' | 'completed' = 'pending',
): Promise<AdminAccessRequest[]> {
  const response = await adminAccessRequestsApi.get<AdminAccessRequest[]>(
    '/admin/access-requests',
    { params: { status } },
  );
  return response.data;
}

export async function approveAccessRequest(
  accessRequestId: string,
  payload?: ApproveAccessRequestPayload,
): Promise<AccessRequestActionResponse> {
  const response = await adminAccessRequestsApi.patch<AccessRequestActionResponse>(
    `/admin/access-requests/${encodeURIComponent(accessRequestId)}/approve`,
    payload ?? {},
  );
  return response.data;
}

export async function rejectAccessRequest(
  accessRequestId: string,
  payload: RejectAccessRequestPayload,
): Promise<AccessRequestActionResponse> {
  const response = await adminAccessRequestsApi.patch<AccessRequestActionResponse>(
    `/admin/access-requests/${encodeURIComponent(accessRequestId)}/reject`,
    payload,
  );
  return response.data;
}
