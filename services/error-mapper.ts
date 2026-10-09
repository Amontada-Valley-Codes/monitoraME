// services/error-mapper.ts

const ERROR_DICTIONARY: Record<string, string> = {
  // Onboarding e Tokens
  "Invalid or expired onboarding link": "O link de cadastro é inválido ou já expirou. Solicite um novo link.",
  "Invalid token": "Token de acesso inválido ou expirado.",
  "Token expired": "Sua sessão ou link expirou. Tente novamente.",

  // Contas e Autenticação
  "Account already exists": "Esta conta já está cadastrada no sistema.",
  "User already exists": "Este usuário já está cadastrado.",
  "Email already in use": "Este e-mail já está em uso.",
  "CPF already in use": "Este CPF já está cadastrado.",
  "Invalid credentials": "E-mail ou senha incorretos.",
  "Unauthorized": "Sessão expirada ou não autorizada.",
  "Forbidden": "Você não tem permissão para realizar esta ação.",
};

const STATUS_FALLBACKS: Record<number, string> = {
  400: "Dados informados são inválidos ou incompletos.",
  401: "Acesso não autorizado ou token/link expirado.",
  403: "Você não possui permissão para acessar este recurso.",
  404: "Recurso não encontrado.",
  409: "Este registro já existe em nossa plataforma.",
  500: "Erro interno no servidor. Tente novamente em alguns minutos.",
};

export class ErrorMapper {
  static toPortuguese(rawMessage: string | string[], status: number): string {
    // Tratamento para arrays de erro (ex: validações do NestJS/Zod)
    if (Array.isArray(rawMessage)) {
      return rawMessage.map((msg) => this.translateString(msg, status)).join(", ");
    }

    return this.translateString(rawMessage, status);
  }

  private static translateString(message: string, status: number): string {
    // 1. Busca exata no dicionário
    if (ERROR_DICTIONARY[message]) {
      return ERROR_DICTIONARY[message];
    }

    // 2. Busca parcial por palavra-chave
    if (message.includes("onboarding link")) {
      return "O link de cadastro é inválido ou já expirou. Solicite um novo link.";
    }

    // 3. Fallback por Status Code HTTP
    if (STATUS_FALLBACKS[status]) {
      return STATUS_FALLBACKS[status];
    }

    return message || "Ocorreu um erro ao processar sua requisição.";
  }
}