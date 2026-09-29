const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

interface FetchOptions extends RequestInit {
  token?: string;
}

export async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, headers, ...customOptions } = options;

  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...customOptions,
    headers: defaultHeaders,
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: response.statusText };
    }

    let errorMessage = errorData.message || "Ocorreu um erro na requisição.";

    // Tratamento personalizado por código de status HTTP
    switch (response.status) {
      case 400:
        errorMessage = errorData.message || "Requisição inválida (400). Verifique os dados enviados.";
        break;
      case 401:
        errorMessage = errorData.message || "Não autorizado (401). Faça login novamente.";
        // Opcional: redirecionar para o login se o token expirou
        // if (typeof window !== 'undefined') window.location.href = '/login';
        break;
      case 403:
        errorMessage = errorData.message || "Acesso negado (403). Você não tem permissão para esta ação.";
        break;
      case 404:
        errorMessage = errorData.message || "Recurso não encontrado (404).";
        break;
      case 500:
        errorMessage = errorData.message || "Erro interno do servidor (500). Tente novamente mais tarde.";
        break;
      default:
        errorMessage = errorData.message || `Erro inesperado (${response.status}).`;
    }

    throw new ApiError(response.status, errorMessage, errorData);
  }

  return response.json();
}
