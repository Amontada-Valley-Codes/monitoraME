// services/api.service.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetcher<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { headers = {}, body, token, ...customConfig } = options;

  // Convert input headers into a unified Headers object
  const requestHeaders = new Headers(headers);

  if (!(body instanceof FormData)) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  const config: RequestInit = {
    ...customConfig,
    headers: requestHeaders,
  };

  if (body) {
    config.body = body instanceof FormData ? body : JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (response.status === 204) {
    return {} as T;
  }

  let data: any;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const message = typeof data === "object" && data !== null && "message" in data 
      ? (data as any).message 
      : response.statusText;
    throw new ApiError(response.status, message);
  }

  return data as T;
}

interface RequestOptions extends RequestInit {
  token?: string;
  body?: any;
}

export const apiService = {
  // ==================== CONTAS ====================

  /** POST /accounts/onboarding - Inicia cadastro ou solicita novo link */
  startOnboarding: (data: { name: string; email: string; phone: string }) =>
    fetcher<{ status: "ONBOARDING" }>("/accounts/onboarding", {
      method: "POST",
      body: data,
    }),

  /** GET /accounts/check - Consulta existência e estado pelo e-mail */
  checkAccount: (email: string, token?: string) =>
    fetcher<{ exists: boolean; account?: { status: string; id?: string; name?: string; email?: string; phone?: string | null } }>(
      `/accounts/check?email=${encodeURIComponent(email)}`,
      { method: "GET", token }
    ),

  /** POST /accounts/complete - Finaliza onboarding ou cria conta direta */
  completeOnboarding: (
    data: { cpf: string; password: string },
    token?: string
  ) =>
    fetcher<{ id: string; name: string; email: string; phone: string | null; role: string; status: string }>(
      "/accounts/complete",
      { method: "POST", body: data, token }
    ),

  /** POST /accounts - Cadastra conta pessoa física direta */
  registerPerson: (data: { name: string; cpf: string; email: string; password: string }) =>
    fetcher<{ id: string; name: string; email: string; role: "PERSON"; status: "ACTIVE" }>("/accounts", {
      method: "POST",
      body: data,
    }),

  // ==================== SESSÕES ====================

  /** POST /sessions/onboarding - Troca token do link por sessão de onboarding */
  exchangeOnboardingToken: (token: string) =>
    fetcher<{ accessToken: string; refreshToken: string }>("/sessions/onboarding", {
      method: "POST",
      body: { token },
    }),

  /** POST /sessions/login - Autentica conta e cria sessão */
  login: (credentials: { email: string; password: string }) =>
    fetcher<{ accessToken: string; refreshToken: string }>("/sessions/login", {
      method: "POST",
      body: credentials,
    }),

  /** POST /sessions/refresh - Rotaciona o token de renovação */
  refreshSession: (refreshToken: string) =>
    fetcher<{ accessToken: string; refreshToken: string }>("/sessions/refresh", {
      method: "POST",
      body: { refreshToken },
    }),

  /** DELETE /sessions/current - Revoga sessão atual */
  logoutCurrent: (token: string) =>
    fetcher<void>("/sessions/current", {
      method: "DELETE",
      token,
    }),

  /** DELETE /sessions - Revoga todas as sessões ativas */
  logoutAll: (token: string) =>
    fetcher<void>("/sessions", {
      method: "DELETE",
      token,
    }),

  // ==================== EMPRESAS ====================

  /** POST /companies - Cria e vincula empresa à conta autenticada */
  createCompany: (
    data: {
      cnpj: string;
      legalName: string;
      tradeName?: string | null;
      companySize: "MEI" | "ME" | "EEP" | "GOV";
      primaryCnae: string;
      phone: string;
      email: string;
      stateRegistration?: string | null;
      municipalRegistration?: string | null;
      address: {
        street: string;
        number: string;
        complement?: string | null;
        neighborhood: string;
        city: string;
        state: string;
        zipCode: string;
        municipalityCode: string;
      };
    },
    token: string
  ) =>
    fetcher<{ id: string; status: "ONBOARDING" }>("/companies", {
      method: "POST",
      body: data,
      token,
    }),

  // ==================== SOLICITAÇÕES DE ACESSO (DOCUMENTOS) ====================

  /** POST /companies/me/access-requests/mei */
  createMeiAccessRequest: (formData: FormData, token: string) =>
    fetcher<any>("/companies/me/access-requests/mei", {
      method: "POST",
      body: formData,
      token,
    }),

  /** POST /companies/me/access-requests/me */
  createMeAccessRequest: (formData: FormData, token: string) =>
    fetcher<any>("/companies/me/access-requests/me", {
      method: "POST",
      body: formData,
      token,
    }),

  /** POST /companies/me/access-requests/eep */
  createEepAccessRequest: (formData: FormData, token: string) =>
    fetcher<any>("/companies/me/access-requests/eep", {
      method: "POST",
      body: formData,
      token,
    }),

  /** POST /companies/me/access-requests/gov */
  createGovAccessRequest: (formData: FormData, token: string) =>
    fetcher<any>("/companies/me/access-requests/gov", {
      method: "POST",
      body: formData,
      token,
    }),

  // ==================== ADMINISTRAÇÃO ====================

  /** POST /admin/accounts - Cadastra conta admin */
  createAdminAccount: (data: { name: string; cpf: string; email: string; password: string }, token: string) =>
    fetcher<any>("/admin/accounts", {
      method: "POST",
      body: data,
      token,
    }),

  /** GET /admin/access-requests - Lista solicitações de acesso */
  fetchAccessRequests: (status: "pending" | "completed", page = 1, perPage = 20, token: string) =>
    fetcher<any>(`/admin/access-requests?status=${status}&page=${page}&perPage=${perPage}`, {
      method: "GET",
      token,
    }),

  /** PATCH /admin/access-requests/{accessRequestId}/approve - Aprova solicitação */
  approveAccessRequest: (accessRequestId: string, reviewComment?: string, token?: string) =>
    fetcher<any>(`/admin/access-requests/${accessRequestId}/approve`, {
      method: "PATCH",
      body: reviewComment ? { reviewComment } : undefined,
      token,
    }),
};
