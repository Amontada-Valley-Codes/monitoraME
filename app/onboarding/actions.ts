"use server";

import { apiService } from "@/features/auth/services/auth.service";
import { ApiError } from "@/services/api";
import { cookies } from "next/headers";

export async function completeOnboardingAction(
  data: {
    name: string;
    email: string;
    cpf: string;
    password: string;
    phone: string;
  },
  linkToken: string
) {
  try {
    // 1. Troca o token do link de onboarding por uma sessão temporária de onboarding
    const sessionResponse = (await apiService.exchangeOnboardingToken(linkToken));
    const sessionAccessToken = sessionResponse?.accessToken;

    if (!sessionAccessToken) {
      throw new Error("Falha ao gerar a sessão temporária de onboarding.");
    }

    // 2. Conclui o cadastro enviando os dados e o token de sessão ativo
    await apiService.completeOnboarding(
      {
        name: data.name,
        email: data.email,
        phone: data.phone,
        cpf: data.cpf,
        password: data.password,
      },
      sessionAccessToken
    );

    // 3. Após concluir (conta ativa), faz login automático para obter os tokens definitivos
    const loginResponse = (await apiService.login({
      email: data.email,
      password: data.password,
    }));

    if (loginResponse?.accessToken) {
      const cookieStore = await cookies();
      cookieStore.set({
        name: "access_token",
        value: loginResponse.accessToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 15,
        sameSite: "lax",
      });
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(error.message);
    }
    throw error;
  }
}
