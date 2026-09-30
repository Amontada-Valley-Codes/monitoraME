import { apiFetch } from "@/services/api";
import { AuthFormData } from "../schemas/auth.schema";
import { LoginFormData } from "../schemas/login.schema";

interface AuthResponse {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  status?: string;
  accessToken?: string;
  refreshToken?: string;
}

export const authService = {
  async login(data: LoginFormData): Promise<AuthResponse> {
    return apiFetch<AuthResponse>("/sessions/login", {
      method: "POST",
      body: JSON.stringify({
        email: data.email,
        password: data.senha,
      }),
    });
  },

  async register(data: AuthFormData): Promise<AuthResponse> {
    return apiFetch<AuthResponse>("/accounts", {
      method: "POST",
      body: JSON.stringify({
        name: data.name,
        cpf: data.cpf,
        email: data.email,
        password: data.senha,
      }),
    });
  },

  // Rotaciona o token de renovação usando o refresh token
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    return apiFetch<AuthResponse>("/sessions/refresh", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    });
  },

  // Revoga a sessão atual (logout pontual)
  async logoutCurrent(accessToken: string): Promise<void> {
    await apiFetch("/sessions/current", {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },

  // Revoga todas as sessões ativas da conta
  async logoutAll(accessToken: string): Promise<void> {
    await apiFetch("/sessions", {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },
};
