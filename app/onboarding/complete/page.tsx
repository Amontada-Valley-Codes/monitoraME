import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CompleteRegisterWrapper } from "@/features/auth/components/complete-register-wrapper";
import { ApiError, apiService } from "@/features/auth/services/auth.service";
import { completeAuthSchema, CompleteAuthFormData } from "@/features/auth/schemas/auth.schema";
import { isValidReturnTo } from "@/shared/auth/return-to";

export const instant = false;

export default async function CompleteRegisterPage({ searchParams }: { searchParams: Promise<{ returnTo?: string }> }) {
  const cookieStore = await cookies();
  if (!cookieStore.has("access_token") && !cookieStore.has("refresh_token")) redirect("/?cta=lead");
  const requestedReturnTo = (await searchParams).returnTo;
  const destination = isValidReturnTo(requestedReturnTo) ? requestedReturnTo : "/analitico/municipios";

  async function handleCompleteRegister(data: CompleteAuthFormData) {
    "use server";
    try {
      const parsed = completeAuthSchema.safeParse(data);
      if (!parsed.success) return { error: "Revise os dados informados e tente novamente." };

      const serverCookies = await cookies();
      let accessToken = serverCookies.get("access_token")?.value;
      if (!accessToken) {
        const refreshToken = serverCookies.get("refresh_token")?.value;
        if (!refreshToken) return { error: "Sua sessão expirou. Solicite um novo link de acesso." };
        const refreshed = await apiService.refreshSession(refreshToken);
        accessToken = refreshed.accessToken;
        serverCookies.set("access_token", refreshed.accessToken, cookieOptions(60 * 15));
        serverCookies.set("refresh_token", refreshed.refreshToken, cookieOptions(60 * 60 * 24 * 7));
      }

      await apiService.completeOnboarding({
        name: parsed.data.name,
        cpf: parsed.data.cpf,
        email: parsed.data.email,
        phone: parsed.data.phone,
        password: parsed.data.senha,
      }, accessToken);
      const loginResponse = await apiService.login({ email: parsed.data.email, password: parsed.data.senha });
      serverCookies.set("access_token", loginResponse.accessToken, cookieOptions(60 * 15));
      serverCookies.set("refresh_token", loginResponse.refreshToken, cookieOptions(60 * 60 * 24 * 7));
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 409) return { error: "Este CPF já está cadastrado ou a conta já foi concluída." };
        return { error: error.message };
      }
      throw error;
    }
    redirect(destination);
  }

  return <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6"><CompleteRegisterWrapper onSubmitAction={handleCompleteRegister} /></div>;
}

function cookieOptions(maxAge: number) {
  return { httpOnly: true, secure: process.env.NODE_ENV === "production", path: "/", maxAge, sameSite: "lax" as const };
}
