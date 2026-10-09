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

const ERROR_TRANSLATIONS: Record<string, string> = {
  "Invalid or expired onboarding link": "O link de cadastro é inválido ou já expirou. Solicite um novo link.",
  "Invalid token": "Token de acesso inválido ou expirado.",
  "Token expired": "Sua sessão ou o link expirou. Tente novamente.",
  "Invalid credentials": "E-mail ou senha incorretos.",
  "Unauthorized": "Sessão expirada ou não autorizada. Faça login novamente.",
  "Forbidden": "Você não tem permissão para realizar esta ação.",
  "Account already exists": "Esta conta já está cadastrada em nossa plataforma.",
  "User already exists": "Este usuário já está cadastrado.",
  "Email already in use": "Este e-mail já está em uso por outro cadastro.",
  "CPF already in use": "Este CPF já está cadastrado em outra conta.",
  "CNPJ already in use": "Este CNPJ já está cadastrado no sistema.",
  "Internal server error": "Ocorreu um erro interno nos nossos servidores. Tente novamente em instantes.",
};

function translateErrorMessage(message: string, status: number): string {
  if (ERROR_TRANSLATIONS[message]) {
    return ERROR_TRANSLATIONS[message];
  }

  switch (status) {
    case 400:
      return "Dados informados são inválidos ou estão num formato incorreto.";
    case 401:
      return "Link de acesso inválido, expirado ou credenciais incorretas.";
    case 403:
      return "Sua conta não possui permissão para acessar este recurso.";
    case 404:
      return "O recurso solicitado não foi encontrado.";
    case 409:
      return "Já existe um cadastro com estes dados (E-mail, CPF ou CNPJ).";
    case 503:
      return "Serviço temporariamente indisponível. Tente novamente em alguns minutos.";
    default:
      return message || "Ocorreu um erro inesperado ao processar sua solicitação.";
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorData: any;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: response.statusText };
    }

    const rawMessage = errorData.message || response.statusText;

    // Trata arrays de erro (ex: validações de campos NestJS/Zod) ou string simples
    const translatedMessage = Array.isArray(rawMessage)
      ? rawMessage.map((msg: string) => translateErrorMessage(msg, response.status)).join("\n")
      : translateErrorMessage(rawMessage, response.status);

    throw new ApiError(response.status, translatedMessage, errorData);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}