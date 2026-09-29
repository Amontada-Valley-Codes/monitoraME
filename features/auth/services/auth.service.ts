import { apiFetch } from "@/services/api";
import { AuthFormData } from "../schemas/auth.schema";

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
  async login(data: Pick<AuthFormData, "email" | "senha">): Promise<AuthResponse> {
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

  loginWithGoogle(): void {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333"}/auth/google`;
  },
};
