import { RegisterView, ActionResult } from "@/components/register-view";
import { ApiError, apiService } from "@/features/auth/services/auth.service";
import { AuthFormData } from "@/features/auth/schemas/auth.schema";

export default function RegisterPage() {
  async function handleRegister(data: AuthFormData): Promise<ActionResult> {
    "use server";

    try {
      const payload = {
        name: data.name,
        cpf: data.cpf,
        email: data.email,
        password: data.senha,
      };

      await apiService.registerPerson(payload);

      return { success: true };
    } catch (error: unknown) {
      if (error instanceof ApiError || (typeof error === "object" && error !== null && "message" in error)) {
        return {
          success: false,
          error: (error as { message: string }).message,
        };
      }

      return {
        success: false,
        error: "Ocorreu um erro ao realizar o cadastro. Tente novamente.",
      };
    }
  }

  return <RegisterView onSubmitAction={handleRegister} />;
}