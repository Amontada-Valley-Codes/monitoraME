import { OnboardingForm } from "@/features/auth/components/onboarding-form";
import { apiService } from "@/features/auth/services/auth.service";

export default function OnboardingPage() {
  async function handleOnboarding(data: { name: string; email: string; phone: string }) {
    "use server";
    try {
      await apiService.startOnboarding(data);
    } catch (error: any) {
      console.error("Erro no onboarding:", error);

      const message = error?.message || "";
      const status = error?.status;

      // 1. Mapeamento direto de mensagens específicas da API
      if (message.includes("Invalid or expired onboarding link") || status === 401) {
        throw new Error("O link de cadastro é inválido ou já expirou. Solicite um novo link.");
      }

      if (message.includes("Account already exists") || status === 409) {
        throw new Error("Este e-mail já possui um cadastro. Faça login para continuar.");
      }

      // 2. Se houver alguma mensagem repassada pelo serviço, usa ela; caso contrário, usa mensagem genérica
      if (message && typeof message === "string") {
        throw new Error(message);
      }

      throw new Error("Não foi possível iniciar o cadastro. Tente novamente em instantes.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-slate-50">
      <OnboardingForm onSubmitAction={handleOnboarding} />
    </div>
  );
}