import { CompleteRegisterWrapper } from "@/features/auth/components/complete-register-wrapper";
import { apiService } from "@/features/auth/services/auth.service";
import { AuthFormData } from "@/features/auth/schemas/auth.schema";
import { ApiError } from "@/services/api";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default function CompleteRegisterPage() {
  async function handleCompleteRegister(data: AuthFormData, linkToken: string) {
    "use server";
    try {
      // 1. POST /sessions/onboarding: Troca o token do link por sessão de onboarding
      const sessionResponse = (await apiService.exchangeOnboardingToken(
        linkToken
      ));
      const sessionAccessToken = sessionResponse?.accessToken;

      if (!sessionAccessToken) {
        throw new Error("Falha ao gerar a sessão temporária de onboarding.");
      }

      // 2. POST /accounts/complete: Conclui o onboarding utilizando o Bearer token
      await apiService.completeOnboarding(
        {
          name: data.name,
          email: data.email,
          phone: "88999999999", // Atualize conforme o campo do seu formulário, se aplicável
          cpf: data.cpf,
          password: data.senha,
        },
        sessionAccessToken
      );

      // 3. POST /sessions/login: Após finalizar, obtemos a sessão ativa (ACTIVE)
      const loginResponse = (await apiService.login({
        email: data.email,
        password: data.senha,
      }));

      if (loginResponse?.accessToken && loginResponse?.refreshToken) {
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
        cookieStore.set({
          name: "refresh_token",
          value: loginResponse.refreshToken,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: 60 * 60 * 24 * 7,
          sameSite: "lax",
        });
      }
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 409) {
          throw new Error("Este e-mail ou CPF já se encontram registados ou a conta já não está em onboarding.");
        }
        throw new Error(error.message);
      }
      throw error;
    }

    redirect("/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-slate-50">
      <CompleteRegisterWrapper onSubmitAction={handleCompleteRegister} />
    </div>
  );
}
